/**
 * app/admin/login/page.tsx
 *
 * Admin Login — centered form, dark premium design.
 * Credentials: Username = Admin / Password = MGvisa@123
 *
 * On success the loginAdmin server action sets an HTTP-only
 * `admin_session` cookie and redirects to /admin.
 */

import type { Metadata } from 'next';
import { cookies }       from 'next/headers';
import { redirect }      from 'next/navigation';
import { ADMIN_SESSION_COOKIE } from '@/lib/adminConstants';
import LoginForm from './LoginForm';

export const metadata: Metadata = {
  title: 'Admin Login — Crew-MG',
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  // If already authenticated, skip the login page
  const cookieStore = await cookies();
  const hasSession  = !!cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (hasSession) redirect('/admin');

  return (
    <div className="min-h-screen bg-[#0f0c29] flex items-center justify-center px-4">

      {/* Subtle radial glow */}
      <div
        className="pointer-events-none fixed inset-0 opacity-30"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(99,102,241,0.35), transparent)',
        }}
      />

      <div className="relative w-full max-w-sm">

        {/* Logo + title */}
        <div className="mb-8 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/MG%20W.svg"
            alt="Crew-MG"
            className="h-10 w-auto mx-auto mb-5 opacity-90"
          />
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Admin Console
          </h1>
          <p className="mt-1.5 text-sm text-slate-400">
            Restricted access — authorised personnel only
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 shadow-2xl">
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-xs text-slate-600">
          Crew-MG Internal Systems &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
