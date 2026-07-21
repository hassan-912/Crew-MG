'use server';

/**
 * app/actions/adminAuth.ts
 *
 * Server Action: hardcoded admin credential check.
 *
 * On success: sets an `admin_session` HTTP-only cookie and redirects to /admin.
 * On failure: returns an error message for the login form to display.
 *
 * ⚠️  The credentials are intentionally hardcoded as requested.
 *     Move to env vars (ADMIN_USERNAME / ADMIN_PASSWORD) before production.
 */

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_VALUE } from '@/lib/adminConstants';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const ADMIN_USERNAME = 'Admin';
const ADMIN_PASSWORD = 'MGvisa@123';

/** 8-hour admin session (seconds) */
const ADMIN_SESSION_MAX_AGE = 60 * 60 * 8;

// ---------------------------------------------------------------------------
// loginAdmin
// ---------------------------------------------------------------------------
export type LoginState =
  | { status: 'idle' }
  | { status: 'error'; message: string };

export async function loginAdmin(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const username = (formData.get('username') as string | null)?.trim() ?? '';
  const password = (formData.get('password') as string | null) ?? '';

  // Strict equality check — no fuzzing, no case-insensitivity
  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    // Intentionally vague message — don't reveal which field was wrong
    return { status: 'error', message: 'Invalid username or password.' };
  }

  // Set the admin session cookie BEFORE redirect
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, ADMIN_SESSION_VALUE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/admin',   // scoped to /admin only — not site-wide
    maxAge: ADMIN_SESSION_MAX_AGE,
  });

  // redirect() throws internally — must be called outside try/catch
  redirect('/admin');
}

// ---------------------------------------------------------------------------
// logoutAdmin
// ---------------------------------------------------------------------------
export async function logoutAdmin(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
  redirect('/admin/login');
}
