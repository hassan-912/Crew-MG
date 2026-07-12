/**
 * lib/supabase/server.ts
 *
 * Two Supabase client factories for server-side use:
 *
 *  1. createSupabaseServerClient()  – Uses the anon key + user session cookies.
 *     Respects Row Level Security.  Use in Server Components / Route Handlers
 *     for user-scoped data.
 *
 *  2. createSupabaseAdminClient()   – Uses the SERVICE_ROLE key.
 *     Bypasses Row Level Security entirely.  ONLY use in:
 *       • Server Actions that are admin-gated
 *       • Edge Middleware (for token validation)
 *     NEVER expose this client to the browser.
 */

import { createServerClient } from '@supabase/ssr';
import { createClient }       from '@supabase/supabase-js';
import { cookies }            from 'next/headers';

// ---------------------------------------------------------------------------
// Environment variable validation
// ---------------------------------------------------------------------------
const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '[Supabase] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY env vars.'
  );
}

// ---------------------------------------------------------------------------
// 1. Cookie-aware server client (anon key / RLS-respecting)
// ---------------------------------------------------------------------------
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Called from a Server Component where cookies are read-only.
          // Safe to ignore – the middleware will refresh the session.
        }
      },
    },
  });
}

// ---------------------------------------------------------------------------
// 2. Admin client (service-role key – bypasses RLS)
// ---------------------------------------------------------------------------
export function createSupabaseAdminClient() {
  if (!supabaseServiceKey) {
    throw new Error(
      '[Supabase] Missing SUPABASE_SERVICE_ROLE_KEY env var.  ' +
      'This client must only be used in privileged server-side contexts.'
    );
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      // Disable auto session management; we handle auth manually
      autoRefreshToken: false,
      persistSession:   false,
    },
  });
}
