'use client';

import { useActionState } from 'react';
import { useRef } from 'react';
import { generateToken, type GenerateTokenResult, type GenerateTokenError } from '@/app/actions/tokens';

type FormState =
  | { status: 'idle' }
  | { status: 'success'; accessUrl: string; tokenId: string }
  | { status: 'error'; message: string };

async function generateTokenAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const recipient      = (formData.get('recipient') as string)?.trim();
  const category       = formData.get('category') as string;
  const expiresInHours = parseInt(formData.get('expiresInHours') as string, 10);

  if (!recipient) return { status: 'error', message: 'Employee email / identifier is required.' };
  if (!category)  return { status: 'error', message: 'Please select a training category.' };

  const result: GenerateTokenResult | GenerateTokenError = await generateToken({
    recipient,
    label: `${category.toUpperCase()} Visa Training — ${recipient}`,
    expiresInHours: Number.isFinite(expiresInHours) ? expiresInHours : 168,
  });

  if (!result.success) return { status: 'error', message: result.error };
  return { status: 'success', accessUrl: result.accessUrl, tokenId: result.tokenId };
}

const CATEGORIES = [
  { value: 'schengen', label: 'Schengen Area 🇪🇺' },
  { value: 'usa',      label: 'United States 🇺🇸'  },
  { value: 'uk',       label: 'United Kingdom 🇬🇧'  },
  { value: 'canada',   label: 'Canada 🇨🇦'          },
];

const EXPIRY_OPTIONS = [
  { value: '24',  label: '24 hours' },
  { value: '48',  label: '48 hours' },
  { value: '168', label: '7 days (default)' },
  { value: '336', label: '14 days' },
  { value: '720', label: '30 days' },
];

export default function TokenGeneratorForm() {
  const [state, formAction, isPending] = useActionState(generateTokenAction, { status: 'idle' });
  const urlRef = useRef<HTMLInputElement>(null);

  function handleCopy() {
    if (state.status === 'success') {
      navigator.clipboard.writeText(state.accessUrl);
      urlRef.current?.select();
    }
  }

  return (
    <div className="space-y-8">
      <form action={formAction} className="space-y-6">

        {/* Recipient */}
        <div>
          <label htmlFor="recipient" className="block text-sm font-semibold text-slate-700 mb-1.5">
            Employee Email / Identifier <span className="text-red-500" aria-hidden>*</span>
          </label>
          <input
            id="recipient" name="recipient" type="text" required
            placeholder="e.g. john.smith@airline.com or EMP-1042"
            disabled={isPending}
            className="block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm placeholder:text-slate-400 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none disabled:bg-slate-50 disabled:text-slate-500 transition-all"
          />
          <p className="mt-1.5 text-xs text-slate-500">Stored in the database for audit purposes only.</p>
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-semibold text-slate-700 mb-1.5">
            Training Category <span className="text-red-500" aria-hidden>*</span>
          </label>
          <div className="relative">
            <select
              id="category" name="category" required defaultValue="" disabled={isPending}
              className="block w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 py-3 pr-10 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none disabled:bg-slate-50 transition-all"
            >
              <option value="" disabled>Select a visa region…</option>
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
              <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>

        {/* Expiry */}
        <div>
          <label htmlFor="expiresInHours" className="block text-sm font-semibold text-slate-700 mb-1.5">Link Expiry</label>
          <div className="relative">
            <select
              id="expiresInHours" name="expiresInHours" defaultValue="168" disabled={isPending}
              className="block w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 py-3 pr-10 text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none disabled:bg-slate-50 transition-all"
            >
              {EXPIRY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
              <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>

        {/* Error banner */}
        {state.status === 'error' && (
          <div role="alert" className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            <svg className="mt-0.5 h-4 w-4 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{state.message}</span>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit" disabled={isPending}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-blue-700 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
        >
          {isPending ? (
            <>
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Generating…
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
              Generate Access Link
            </>
          )}
        </button>
      </form>

      {/* Success: generated URL box */}
      {state.status === 'success' && (
        <div role="status" aria-live="polite" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 space-y-4">
          <div className="flex items-center gap-2 text-emerald-700">
            <svg className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span className="text-sm font-bold">Access link generated successfully</span>
          </div>
          <p className="text-xs text-emerald-600">
            This is a <strong>single-use</strong> link. Once clicked it cannot be reused.
            Share it via a secure channel (encrypted email, WhatsApp, etc.).
          </p>
          <div className="flex items-stretch gap-2">
            <input
              ref={urlRef}
              id="generated-url"
              type="text"
              readOnly
              value={state.accessUrl}
              onClick={(e) => (e.target as HTMLInputElement).select()}
              className="flex-1 min-w-0 rounded-xl border border-emerald-300 bg-white px-4 py-3 font-mono text-xs text-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none cursor-pointer"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-bold text-white hover:bg-emerald-700 active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 transition-all"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              Copy
            </button>
          </div>
          <p className="text-xs text-emerald-600/70 font-mono">Token ID: {state.tokenId}</p>
        </div>
      )}
    </div>
  );
}
