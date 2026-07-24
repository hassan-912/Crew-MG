import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Welcome — Crew-MG Training Portal',
  description: 'Welcome to the Crew-MG corporate visa training platform.',
};

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-[#0f0c29] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Radial glow background effect */}
      <div
        className="pointer-events-none fixed inset-0 opacity-40"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 10%, rgba(99,102,241,0.3), transparent)',
        }}
      />

      <div className="relative w-full max-w-lg text-center">
        {/* Card */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6">
          {/* Logo */}
          <div className="flex justify-center mb-2">
            <Image
              src="/MG%20W.svg"
              alt="Crew-MG Logo"
              width={160}
              height={48}
              className="h-12 w-auto object-contain opacity-95"
              priority
            />
          </div>

          <div className="inline-block px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest">
            Corporate Training Portal
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome Crew Members
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            Welcome to the Crew-MG Training Portal. Please click the secure magic link provided by your manager to log in and access your region&apos;s training material.
          </p>

          <div className="pt-4 border-t border-white/10 flex items-center justify-center gap-2 text-xs text-slate-400">
            <svg
              className="h-4 w-4 text-emerald-400 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <span>Device-Bound Multi-Use Security Active</span>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center space-y-3">
          <p className="text-xs text-slate-500">
            Crew-MG Internal Systems &copy; {new Date().getFullYear()} &bull; All Rights Reserved
          </p>
          <Link 
            href="/admin" 
            className="text-[11px] text-slate-600 hover:text-slate-400 transition-colors duration-200"
          >
            Admin Login
          </Link>
        </div>
      </div>
    </div>
  );
}
