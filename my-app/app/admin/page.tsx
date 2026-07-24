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
  description: 'Issue time-limited, multi-use training access links.',
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 relative w-full">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Generate Access Link
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            Issue a time-limited, multi-use magic link.
          </p>
        </div>
        <TokenGeneratorForm />
      </div>
    </div>
  );
}
