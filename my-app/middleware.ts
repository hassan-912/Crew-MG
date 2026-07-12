/**
 * middleware.ts  (project root – next to package.json)
 *
 * Vercel Edge Runtime middleware for Crew-MG single-use link security.
 *
 * ─── Flow ────────────────────────────────────────────────────────────────
 *
 *  Request arrives
 *       │
 *       ├─ Path is public (login, access, denied, _next, static)?
 *       │       └─ Pass through immediately
 *       │
 *       ├─ Has valid `crew_session` cookie?
 *       │       └─ YES → Pass through to protected route
 *       │
 *       ├─ Has `?token=` query param?
 *       │       ├─ Call Supabase RPC `consume_token` (atomic, single-use)
 *       │       ├─ Valid  → Set HTTP-only session cookie → redirect to /dashboard
 *       │       └─ Invalid → redirect to /access-denied
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


const PUBLIC_PATHS: Array<string | RegExp> = [
  '/access',           // token redemption landing page
  '/access-denied',    // error page
  '/_next',            // Next.js internals
  '/favicon.ico',
  '/public',
  /^\/api\/health/,    // health check endpoint (if any)
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) =>
    typeof p === 'string'
      ? pathname.startsWith(p)
      : p.test(pathname)
  );
}

// ---------------------------------------------------------------------------
// Middleware entry point
// ---------------------------------------------------------------------------
export async function middleware(request: NextRequest) {
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
      // Valid session → allow through
      return NextResponse.next();
    }
    // Invalid / expired JWT → fall through to token check or deny
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

  // Basic format guard – our tokens are URL-safe base64, 43 chars (32 bytes)
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
      console.error('[middleware] Supabase RPC error:', error.message);
      return redirectToAccessDenied(request, 'server_error');
    }

    // `consume_token` returns an empty array on failure
    if (!data || data.length === 0) {
      return redirectToAccessDenied(request, 'token_invalid_or_used');
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

    // ── Build redirect to the protected dashboard ──────────────────────
    const dashboardUrl = new URL('/', request.url);
    const response = NextResponse.redirect(dashboardUrl, { status: 302 });

    // ── Set the HTTP-only session cookie ──────────────────────────────
    const cookieOpts = getSessionCookieOptions();
    response.cookies.set(SESSION_COOKIE_NAME, sessionJwt, cookieOpts);

    return response;

  } catch (err) {
    console.error('[middleware] Token redemption error:', err);
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
  // Vercel injects the real client IP in this header
  return (
    request.headers.get('x-real-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    'unknown'
  );
}

// ---------------------------------------------------------------------------
// Matcher – apply middleware to everything EXCEPT static assets
// ---------------------------------------------------------------------------
export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     *   - _next/static  (static files)
     *   - _next/image   (image optimisation)
     *   - favicon.ico
     *   - Files with extensions (.png, .jpg, .svg, .css, .js …)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|css|js|woff2?|ttf|eot)$).*)',
  ],
};
