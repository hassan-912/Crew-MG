/**
 * app/access/route.ts
 *
 * Safety-net GET handler for /access.
 *
 * Under normal operation this handler is NEVER reached for magic links,
 * because proxy.ts intercepts every /access?token=XYZ request first:
 *   • Valid token  → proxy sets cookie and redirects to /
 *   • Invalid/used → proxy redirects to /access-denied
 *
 * This handler only fires in two edge cases:
 *   1. Someone navigates directly to /access with no ?token= param.
 *   2. The proxy is bypassed (should not happen in production).
 *
 * In both cases we redirect to /access-denied using the request's own
 * origin so the port number is always correct (no hardcoded localhost).
 */

import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Derive the redirect URL from the incoming request to preserve
  // whatever hostname + port the user actually used (127.0.0.1:3000,
  // localhost:3000, or the production domain).
  const denied = new URL('/access-denied', request.url);
  denied.searchParams.set('reason', 'no_session');
  return NextResponse.redirect(denied, { status: 302 });
}

