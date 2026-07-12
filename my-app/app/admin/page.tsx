/**
 * app/admin/page.tsx
 *
 * Admin — Generate Access Link  (Server Component shell)
 *
 * Renders a static info panel on the left and delegates all
 * interactivity to the <TokenGeneratorForm> Client Component.
 */

import type { Metadata } from 'next';
import TokenGeneratorForm from './components/TokenGeneratorForm';

export const metadata: Metadata = {
  title: 'Generate Link — Crew-MG Admin',
  description: 'Issue single-use training access links.',
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">

        {/* ── Left info panel (Server Component — static) ── */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Generate Access Link
            </h1>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              Issue a single-use, time-limited magic link to a crew member.
              The link grants one-time access to the training portal and
              self-destructs after first use.
            </p>
          </div>

          {/* How it works */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100">
            <div className="px-5 py-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">How it works</h2>
              <ol className="space-y-4">
                {[
                  { step: '1', title: 'Fill the form', body: 'Enter the employee identifier and select the training category.' },
                  { step: '2', title: 'Link is generated', body: 'A 256-bit cryptographically random token is created and stored.' },
                  { step: '3', title: 'Share the link', body: 'Copy and share via encrypted email or secure messaging.' },
                  { step: '4', title: 'One-time access', body: 'The link works once. After redemption, it is permanently invalidated.' },
                ].map(({ step, title, body }) => (
                  <li key={step} className="flex gap-3">
                    <span className="flex-none flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold mt-0.5">
                      {step}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{title}</p>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Security notice */}
          <div className="flex gap-3 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3.5">
            <svg className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-xs text-amber-700 leading-relaxed">
              <strong>Security reminder:</strong> Never share access links via unencrypted channels.
              Do not send via plain SMS or public chat. Use company email or an approved
              secure messaging tool.
            </p>
          </div>
        </div>

        {/* ── Right form panel (Client Component) ── */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <TokenGeneratorForm />
          </div>
        </div>

      </div>
    </div>
  );
}
