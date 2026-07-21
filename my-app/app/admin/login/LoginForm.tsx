'use client';

/**
 * app/admin/login/LoginForm.tsx
 *
 * Client Component — the interactive login form.
 * Uses useActionState to surface server-side errors without a full page reload.
 */

import { useActionState } from 'react';
import { loginAdmin, type LoginState } from '@/app/actions/adminAuth';
import { useState } from 'react';

const INITIAL_STATE: LoginState = { status: 'idle' };

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAdmin, INITIAL_STATE);
  const [showPw, setShowPw] = useState(false);

  return (
    <form action={formAction} className="space-y-5">

      {/* Username */}
      <div>
        <label htmlFor="username" className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-widest">
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          required
          disabled={isPending}
          className="
            block w-full rounded-xl bg-white/10 border border-white/15
            px-4 py-3 text-sm text-white placeholder:text-slate-500
            focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-500/50
            disabled:opacity-50 transition-all
          "
          placeholder="Username"
        />
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-widest">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPw ? 'text' : 'password'}
            autoComplete="current-password"
            required
            disabled={isPending}
            className="
              block w-full rounded-xl bg-white/10 border border-white/15
              px-4 py-3 pr-11 text-sm text-white placeholder:text-slate-500
              focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-500/50
              disabled:opacity-50 transition-all
            "
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPw((p) => !p)}
            className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
            aria-label={showPw ? 'Hide password' : 'Show password'}
          >
            {showPw ? (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Error banner */}
      {state.status === 'error' && (
        <div
          role="alert"
          className="flex items-center gap-2.5 rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400"
        >
          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {state.message}
        </div>
      )}

      {/* Submit */}
      <button
        id="admin-login-submit"
        type="submit"
        disabled={isPending}
        className="
          w-full inline-flex items-center justify-center gap-2
          rounded-xl bg-indigo-600 px-6 py-3.5
          text-sm font-bold text-white shadow-lg shadow-indigo-900/30
          hover:bg-indigo-500 active:scale-[0.98]
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-transparent
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-200
        "
      >
        {isPending ? (
          <>
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Signing in…
          </>
        ) : (
          <>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Sign In
          </>
        )}
      </button>
    </form>
  );
}
