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

import { redirect }  from 'next/navigation';
import { cookies, headers } from 'next/headers';
import Image         from 'next/image';
import Link          from 'next/link';
import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_VALUE } from '@/lib/adminConstants';
import { logoutAdmin } from '@/app/actions/adminAuth';

// ---------------------------------------------------------------------------
// Auth guard
//
// The proxy (proxy.ts) forwards the current pathname as an `x-pathname`
// request header so this server-side layout can read it without needing
// a client component or URL parsing tricks.
//
// Why we need this: AdminLayout wraps EVERY route under /admin/ —
// including /admin/login itself.  Without the pathname check below,
// an unauthenticated visitor triggers the cookie check, fails, and gets
// redirected to /admin/login … which is wrapped by the same layout …
// which redirects again → infinite loop (ERR_TOO_MANY_REDIRECTS).
// ---------------------------------------------------------------------------
async function getAdminGuardState(): Promise<{ isLoginPage: boolean; authorized: boolean }> {
  const headersList = await headers();
  // x-pathname is set by nextPassingPathname() in proxy.ts
  const pathname = headersList.get('x-pathname') ?? '';

  // The login page must ALWAYS be accessible — skip the cookie check entirely
  if (pathname === '/admin/login') {
    return { isLoginPage: true, authorized: true };
  }

  const cookieStore = await cookies();
  const authorized  = cookieStore.get(ADMIN_SESSION_COOKIE)?.value === ADMIN_SESSION_VALUE;
  return { isLoginPage: false, authorized };
}

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoginPage, authorized } = await getAdminGuardState();

  // Render login page directly — no nav chrome, no auth redirect.
  // The login page has its own full-screen layout.
  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!authorized) {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-[#0f0c29] flex flex-col">
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
              <form action={logoutAdmin}>
                <button
                  type="submit"
                  className="text-xs font-semibold text-red-400/70 hover:text-red-400 transition-colors border border-red-400/20 hover:border-red-400/50 rounded px-2.5 py-1"
                >
                  Log out
                </button>
              </form>
            </nav>
          </div>
        </div>
      </div>

      {/* Page content */}
      <div className="flex-1">{children}</div>
    </div>
  );
}
