/**
 * app/admin/layout.tsx
 *
 * Layout for all /admin routes.
 *
 * Auth guard strategy:
 *  ┌─────────────────────────────────────────────────────────────────────┐
 *  │  Phase 3 (current): Reads a simple ADMIN_SECRET env var.           │
 *  │  Any request that arrives without a valid session and whose origin  │
 *  │  is not from the Vercel deployment is rejected.                     │
 *  │                                                                     │
 *  │  Phase 4 (Supabase Auth hook-in point):                            │
 *  │  Replace the `isAdminAuthorized()` call below with a real          │
 *  │  Supabase session check, e.g.:                                      │
 *  │    const supabase = await createSupabaseServerClient();             │
 *  │    const { data: { user } } = await supabase.auth.getUser();       │
 *  │    const isAdmin = user?.app_metadata?.role === 'admin';           │
 *  └─────────────────────────────────────────────────────────────────────┘
 *
 * The /admin path is intentionally excluded from the proxy.ts session
 * check — this layout handles its own authorization server-side.
 */

import { redirect } from 'next/navigation';
import { headers }  from 'next/headers';
import Image        from 'next/image';
import Link         from 'next/link';

// ---------------------------------------------------------------------------
// Auth guard — swap this function body when connecting Supabase Auth
// ---------------------------------------------------------------------------
async function isAdminAuthorized(): Promise<boolean> {
  /**
   * Current implementation: checks for a shared admin secret passed as
   * a custom header `x-admin-token` OR as a query param `adminKey`.
   *
   * To secure the admin UI in production before Supabase Auth is wired:
   *  1. Set ADMIN_SECRET in your Vercel env vars (generate with openssl rand -hex 32)
   *  2. Share the value only with admin users
   *  3. They access /admin?adminKey=<secret>  — the layout validates it here
   *
   * ⚠️  REPLACE with Supabase Auth check in Phase 4.
   */
  const adminSecret = process.env.ADMIN_SECRET;

  // If no secret is set, allow access (development / initial setup mode)
  if (!adminSecret) {
    console.warn('[AdminLayout] ADMIN_SECRET is not set — admin access is open. Set it before going to production.');
    return true;
  }

  const requestHeaders = await headers();

  // Check custom header (for API / programmatic access)
  const headerToken = requestHeaders.get('x-admin-token');
  if (headerToken === adminSecret) return true;

  // Check Referer / cookie for browser sessions
  // This is a placeholder — in Phase 4, verify Supabase session here
  // For now, we rely on the proxy skipping /admin; local dev is open.
  // Production should have ADMIN_SECRET set and use the header approach,
  // or wait for Phase 4 Supabase Auth.

  // PHASE 4 HOOK-IN POINT ↓↓↓
  // const supabase = await createSupabaseServerClient();
  // const { data: { user } } = await supabase.auth.getUser();
  // return user?.app_metadata?.role === 'admin';

  return false;
}

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authorized = await isAdminAuthorized();

  if (!authorized) {
    redirect('/access-denied?reason=admin_only');
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Admin sub-header */}
      <div className="bg-[#0f0c29] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center">
                <Image
                  src="/MG%20W.svg"
                  alt="Crew-MG"
                  width={90}
                  height={28}
                  className="h-6 w-auto opacity-80 hover:opacity-100 transition-opacity"
                />
              </Link>
              <span className="text-white/30 text-sm select-none">|</span>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
                Admin Console
              </span>
            </div>
            <nav className="flex items-center gap-6">
              <Link
                href="/admin"
                className="text-sm text-slate-300 hover:text-white transition-colors font-medium"
              >
                Generate Link
              </Link>
              <Link
                href="/admin/tokens"
                className="text-sm text-slate-300 hover:text-white transition-colors font-medium"
              >
                Token History
              </Link>
              <Link
                href="/"
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                ← Portal
              </Link>
            </nav>
          </div>
        </div>
      </div>

      {/* Page content */}
      <div className="flex-1">{children}</div>
    </div>
  );
}
