/**
 * proxy.ts  (project root — replaces middleware.ts, Next.js 16+)
 *
 * Vercel Edge Runtime proxy for Crew-MG time-limited link security.
 * The "middleware" file convention is deprecated in Next.js 16; this
 * file uses the new "proxy" convention (function renamed from
 * `middleware` → `proxy`, file renamed from `middleware.ts` → `proxy.ts`).
 *
 * ─── Flow ────────────────────────────────────────────────────────────────
 *
 *  Request arrives
 *       │
 *       ├─ Path is public (access, denied, admin/*, _next, static)?
 *       │       └─ Pass through immediately
 *       │
 *       ├─ Has valid `crew_session` cookie?
 *       │       └─ YES → Pass through to protected route
 *       │
 *       ├─ Has `?token=` query param?
 *       │       ├─ Call Supabase RPC `consume_token` (validates expiry only)
 *       │       ├─ Valid  → Set HTTP-only session cookie → redirect to /
 *       │       └─ Invalid/Expired → redirect to /access-denied
 *       │
 *       └─ No session, no token → redirect to /access-denied
 *
 * ─── Edge Runtime notes ──────────────────────────────────────────────────
 *  • No Node.js built-ins (Buffer, crypto module, etc.)
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
  getSessionCookieOptions,
} from '@/lib/session';

// ---------------------------------------------------------------------------
// Routes that do NOT require a session
//
// NOTE: '/access' is intentionally NOT listed here.
// The proxy must intercept /access?token=XYZ to validate and consume the
// token. Listing '/access' as public would skip the proxy entirely, sending
// the request straight to app/access/route.ts which has no token logic.
//
// '/access-denied' MUST stay public to prevent an infinite redirect loop.
// The /admin route is public here — the AdminLayout Server Component handles
// its own auth guard.
// ---------------------------------------------------------------------------
const PUBLIC_PATHS: Array<string | RegExp> = [
  '/access-denied', // error page — must be public to avoid redirect loops
  '/admin',         // admin interface — protected by its own layout guard
  '/_next',         // Next.js internals
  '/favicon.ico',
  /^\/api\/health/,
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) =>
    typeof p === 'string'
      ? pathname.startsWith(p)
      : p.test(pathname)
  );
}

// ---------------------------------------------------------------------------
// Proxy entry point  (was `middleware` in Next.js ≤15)
// ---------------------------------------------------------------------------
export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // ── 1. Let public paths through immediately ──────────────────────────────
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // ── 2. Check existing session cookie ────────────────────────────────────
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (sessionCookie) {
    const payload = await verifySessionToken(sessionCookie);
    if (payload) {
      return NextResponse.next();
    }
    // Invalid / expired JWT — fall through to token check or deny
  }

  // ── 3. Check for ?token= magic link parameter ───────────────────────────
  const rawToken = searchParams.get('token');

  if (rawToken) {
    return await handleTokenRedemption(request, rawToken);
  }

  // ── 4. No session, no token → deny access ───────────────────────────────
  return redirectToAccessDenied(request, 'no_session');
}

// ---------------------------------------------------------------------------
// Token redemption handler
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
    const supabase = createEdgeAdminClient();
    const clientIp = getClientIp(request);

    // Call the atomic `consume_token` database function.
    // It performs SELECT … FOR UPDATE + UPDATE in a single transaction,
    // guaranteeing that concurrent requests cannot both succeed.
    const { data, error } = await supabase
      .rpc('consume_token', {
        p_token: rawToken,
        p_client_ip: clientIp,
      });

    if (error) {
      console.error('[proxy] Supabase RPC error:', error.message);
      return redirectToAccessDenied(request, 'server_error');
    }

    // `consume_token` returns an empty array when token is not found or expired
    if (!data || data.length === 0) {
      return redirectToAccessDenied(request, 'token_invalid_or_expired');
    }

    const tokenRow = data[0] as {
      id: string;
      recipient: string | null;
    };

    // ── Create signed session JWT ──────────────────────────────────────
    const sessionJwt = await createSessionToken({
      sub: tokenRow.id,
      recipient: tokenRow.recipient ?? undefined,
    });

    // ── Redirect to the protected dashboard ───────────────────────────
    const dashboardUrl = new URL('/', request.url);
    const response = NextResponse.redirect(dashboardUrl, { status: 302 });

    // ── Set the HTTP-only session cookie ──────────────────────────────
    const cookieOpts = getSessionCookieOptions();
    response.cookies.set(SESSION_COOKIE_NAME, sessionJwt, cookieOpts);

    return response;
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
