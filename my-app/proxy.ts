/**
 * proxy.ts  (project root — replaces middleware.ts, Next.js 16+)
 *
 * Vercel Edge Runtime proxy for Crew-MG device-bound link security.
 * The "middleware" file convention is deprecated in Next.js 16; this
 * file uses the new "proxy" convention (function renamed from
 * `middleware` → `proxy`, file renamed from `middleware.ts` → `proxy.ts`).
 *
 * ─── Flow ────────────────────────────────────────────────────────────────
 *
 *  Request arrives
 *       │
 *       ├─ Path is public (access-denied, admin/*, _next, static)?
 *       │       └─ Pass through immediately
 *       │
 *       ├─ Has valid `crew_session` cookie?
 *       │       └─ YES → Pass through to protected route
 *       │
 *       ├─ Has `?token=` query param?  (user clicked the magic link)
 *       │       └─ handleTokenRedemption()
 *       │               ├─ DB: verify_device_bound_token()
 *       │               │
 *       │               ├─ status='not_found' / 'expired'
 *       │               │       └─ → /access-denied
 *       │               │
 *       │               ├─ status='ok' (first click — token was unclaimed)
 *       │               │       └─ Set crew_device_id cookie (HTTP-only)
 *       │               │          Set crew_session cookie
 *       │               │          → /schengen
 *       │               │
 *       │               ├─ status='ok' (returning visitor — device matched)
 *       │               │       └─ Refresh crew_session cookie
 *       │               │          → /schengen
 *       │               │
 *       │               └─ status='device_mismatch'
 *       │                       └─ → /access-denied?reason=already_claimed
 *       │
 *       └─ No session, no token → /access-denied?reason=no_session
 *
 * ─── Edge Runtime notes ──────────────────────────────────────────────────
 *  • No Node.js built-ins (Buffer, crypto module, etc.)
 *  • globalThis.crypto.randomUUID() IS available in Edge Runtime
 *  • jose is used for JWT operations (fully Edge-compatible)
 *  • @supabase/supabase-js v2 communicates via fetch (Edge-compatible)
 * ─────────────────────────────────────────────────────────────────────────
 */

import { NextResponse, type NextRequest } from 'next/server';
import { createEdgeAdminClient } from '@/lib/supabase/edge';
import {
  createSessionToken,
  verifySessionToken,
  SESSION_COOKIE_NAME,
  SESSION_DURATION_SECONDS,
  maxAgeFromExpiry,
} from '@/lib/session';
import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_VALUE } from '@/lib/adminConstants';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * HTTP-only cookie that binds a browser session to a specific magic token.
 * Set once on first click; read on every subsequent magic link click.
 */
const DEVICE_COOKIE_NAME = 'crew_device_id';

// ---------------------------------------------------------------------------
// Helper: pass the current pathname to Server Components as a request header
//
// Next.js App Router layouts have no direct access to the current URL.
// The standard pattern is to forward it as a custom request header from
// the proxy/middleware so layouts can read it via headers().
// ---------------------------------------------------------------------------
function nextPassingPathname(request: NextRequest): NextResponse {
  const reqHeaders = new Headers(request.headers);
  reqHeaders.set('x-pathname', request.nextUrl.pathname);
  return NextResponse.next({ request: { headers: reqHeaders } });
}

// Routes that do NOT require a crew_session
//
// NOTE: '/access' is intentionally NOT listed here.
// The proxy must intercept /access?token=XYZ to validate the token.
// Listing '/access' as public would skip the proxy entirely, sending
// the request straight to app/access/route.ts which has no token logic.
//
// '/access-denied' MUST stay public to prevent an infinite redirect loop.
//
// '/admin' routes are handled separately below — they need their own
//   admin_session cookie, not the crew_session cookie.
// ---------------------------------------------------------------------------
const PUBLIC_PATHS: Array<string | RegExp> = [
  '/welcome',       // public landing page
  '/access-denied', // error page — must be public
  '/_next',         // Next.js internals
  '/favicon.ico',
  /^\/api\/health/,
];

/** /admin paths that don't need an admin_session cookie */
const ADMIN_PUBLIC_PATHS = ['/admin/login'];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) =>
    typeof p === 'string'
      ? pathname.startsWith(p)
      : p.test(pathname)
  );
}

function isAdminPath(pathname: string): boolean {
  return pathname.startsWith('/admin');
}

function isAdminPublicPath(pathname: string): boolean {
  return ADMIN_PUBLIC_PATHS.some((p) => pathname.startsWith(p));
}

// ---------------------------------------------------------------------------
// Proxy entry point  (was `middleware` in Next.js ≤15)
// ---------------------------------------------------------------------------
export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // ── 1. Let static / always-public paths through immediately ──────────────
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // ── 2. Admin path guard (edge layer) ─────────────────────────────────
  // Defence-in-depth: the AdminLayout also checks server-side.
  if (isAdminPath(pathname)) {
    // Forward x-pathname so AdminLayout can detect the login page and
    // skip its own auth redirect, preventing an infinite redirect loop.
    if (isAdminPublicPath(pathname)) {
      return nextPassingPathname(request); // /admin/login — always accessible
    }
    const adminCookie = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    if (adminCookie !== ADMIN_SESSION_VALUE) {
      return NextResponse.redirect(new URL('/admin/login', request.url), { status: 302 });
    }
    return nextPassingPathname(request);
  }

  // ── 3. Check existing crew session cookie ──────────────────────────────
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (sessionCookie) {
    const payload = await verifySessionToken(sessionCookie);
    if (payload) {
      // Valid session cookie present.
      //
      // If the user also has a ?token= param (e.g. they clicked the magic
      // link again from their email), redirect straight to the hub instead
      // of passing them to app/access/route.ts which has no token logic.
      if (searchParams.has('token')) {
        return NextResponse.redirect(new URL('/', request.url), { status: 302 });
      }
      return NextResponse.next();
    }
    // Invalid / expired JWT — fall through to token check or deny
  }

  // ── 4. Check for ?token= magic link parameter ───────────────────────────
  const rawToken = searchParams.get('token');

  if (rawToken) {
    return await handleTokenRedemption(request, rawToken);
  }

  // ── 5. No session, no token → redirect to public welcome page ──────────
  return NextResponse.redirect(new URL('/welcome', request.url), { status: 302 });
}

// ---------------------------------------------------------------------------
// Device-bound token redemption handler
// ---------------------------------------------------------------------------
async function handleTokenRedemption(
  request: NextRequest,
  rawToken: string
): Promise<NextResponse> {
  // Basic format guard — our tokens are URL-safe base64, 43 chars (32 bytes)
  if (!/^[A-Za-z0-9_-]{40,60}$/.test(rawToken)) {
    return redirectToAccessDenied(request, 'invalid_format');
  }

  try {
    const supabase  = createEdgeAdminClient();
    const clientIp  = getClientIp(request);

    // Read the device cookie from the browser (will be null on first visit)
    const browserDeviceId = request.cookies.get(DEVICE_COOKIE_NAME)?.value ?? null;

    // Generate a fresh UUID in case this is a first-click claim.
    // Edge Runtime exposes globalThis.crypto — no Node.js `crypto` import needed.
    const newDeviceId = globalThis.crypto.randomUUID();

    // ── Call the atomic DB function ────────────────────────────────────────
    // verify_device_bound_token handles:
    //   - Row locking (FOR UPDATE) to prevent concurrent race conditions
    //   - Expiry check
    //   - First-click device binding (sets claimed_device_id)
    //   - Returning visitor verification (compares claimed_device_id)
    const { data, error } = await supabase
      .rpc('verify_device_bound_token', {
        p_token:         rawToken,
        p_device_id:     browserDeviceId,   // null on first visit
        p_client_ip:     clientIp,
        p_new_device_id: newDeviceId,        // used only on first click
      })
      .single();

    if (error) {
      console.error('[proxy] Supabase RPC error:', error.message);
      return redirectToAccessDenied(request, 'server_error');
    }

    const result = data as {
      status:            string;
      token_id:          string | null;
      recipient:         string | null;
      expires_at:        string | null;
      claimed_device_id: string | null;
    };

    // ── Route by status ────────────────────────────────────────────────────
    switch (result.status) {
      case 'not_found':
        return redirectToAccessDenied(request, 'token_not_found');

      case 'expired':
        return redirectToAccessDenied(request, 'token_expired');

      case 'device_mismatch':
        // Link was shared to — or clicked from — a different device
        return redirectToAccessDenied(request, 'already_claimed');

      case 'ok': {
        const authorisedDeviceId = result.claimed_device_id!;
        const isFirstClaim       = authorisedDeviceId === newDeviceId;

        // Resolve cookie/JWT lifetime from the token's hard expiry.
        // MUST always be a concrete number — passing `undefined` as maxAge
        // causes Next.js to omit the Max-Age directive entirely, making the
        // cookie ephemeral (session-only) and lost on a 302 redirect.
        const tokenMaxAgeSeconds: number = result.expires_at
          ? maxAgeFromExpiry(result.expires_at)
          : SESSION_DURATION_SECONDS;

        // ── Build signed session JWT ──────────────────────────────────────
        const sessionJwt = await createSessionToken({
          sub:            result.token_id!,
          recipient:      result.recipient ?? undefined,
          tokenExpiresAt: result.expires_at ?? undefined,
        });

        // ── 1. Create the redirect response FIRST ─────────────────────────
        // Redirect to the region hub (/) — not directly to /schengen.
        // The hub lets the user choose their training region.
        const response = NextResponse.redirect(
          new URL('/', request.url),
          { status: 302 },
        );

        // ── 2. Attach cookies directly to the response object ─────────────
        // Using response.cookies.set() (NOT cookies() from next/headers)
        // is the only reliable way to attach Set-Cookie headers to a
        // NextResponse.redirect() — next/headers cookies are stripped.
        //
        // Both cookies share the same explicit options object so there is
        // no risk of one cookie having a different maxAge than the other.
        const cookieOptions = {
          httpOnly: true,
          secure:   process.env.NODE_ENV === 'production', // false on localhost
          sameSite: 'lax' as const,  // CRUCIAL: allows cookies through new-tab/redirect
          path:     '/',             // site-wide availability
          maxAge:   tokenMaxAgeSeconds, // always a number — never undefined
        };

        response.cookies.set(SESSION_COOKIE_NAME, sessionJwt,        cookieOptions);
        response.cookies.set(DEVICE_COOKIE_NAME,  authorisedDeviceId, cookieOptions);

        console.info(
          isFirstClaim
            ? `[proxy] Token ${result.token_id} CLAIMED by device ${authorisedDeviceId} (IP: ${clientIp})`
            : `[proxy] Token ${result.token_id} — returning device ${authorisedDeviceId} (IP: ${clientIp})`,
        );

        return response;
      }

      default:
        console.error('[proxy] Unknown status from verify_device_bound_token:', result.status);
        return redirectToAccessDenied(request, 'server_error');
    }
  } catch (err) {
    console.error('[proxy] Token redemption error:', err);
    return redirectToAccessDenied(request, 'server_error');
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function redirectToAccessDenied(
  request: NextRequest,
  reason: string
): NextResponse {
  if (reason === 'no_session') {
    return NextResponse.redirect(new URL('/welcome', request.url), { status: 302 });
  }
  const url = new URL('/access-denied', request.url);
  url.searchParams.set('reason', reason);
  return NextResponse.redirect(url, { status: 302 });
}

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-real-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    'unknown'
  );
}

// ---------------------------------------------------------------------------
// Matcher — apply proxy to everything EXCEPT static assets
// ---------------------------------------------------------------------------
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|css|js|woff2?|ttf|eot)$).*)',
  ],
};
