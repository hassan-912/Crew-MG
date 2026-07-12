/**
 * app/access/route.ts
 *
 * GET /access?token=<value>
 *
 * This route is the landing page for magic links.  The actual token
 * validation and cookie-setting happens in middleware.ts BEFORE this
 * route handler ever runs.  By the time we reach here, the middleware has
 * either:
 *   a) Validated the token → redirected to /dashboard (with cookie set), OR
 *   b) Rejected the token  → redirected to /access-denied
 *
 * This handler therefore only fires when the user navigates to /access
 * WITHOUT a `?token=` param (e.g., bookmarking the page).  We redirect
 * them to the denied page.
 */

import { NextResponse } from 'next/server';

export const runtime = 'edge';

export function GET() {
  return NextResponse.redirect(new URL('/access-denied', 'http://localhost'), {
    status: 302,
  });
}
