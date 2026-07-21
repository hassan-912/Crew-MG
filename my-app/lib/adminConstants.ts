/**
 * lib/adminConstants.ts
 *
 * Shared constants for the admin authentication system.
 *
 * Kept in a plain module (no 'use server' / 'use client') so these
 * values can be imported by:
 *   • app/actions/adminAuth.ts  (Server Action — 'use server')
 *   • app/admin/layout.tsx      (Server Component)
 *   • proxy.ts                  (Edge Runtime)
 *
 * A 'use server' file can only export async functions — exporting a
 * plain const from it causes a Next.js build error.
 */

/** HTTP-only cookie name that signals an active admin session */
export const ADMIN_SESSION_COOKIE = 'admin_session';

/** The expected cookie value — simple shared secret between server action and guards */
export const ADMIN_SESSION_VALUE  = 'crew-mg-admin-authenticated';
