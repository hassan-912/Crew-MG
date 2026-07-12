/**
 * lib/supabase/edge.ts
 *
 * A minimal Supabase admin client that is safe to use inside
 * Next.js Middleware (Vercel Edge Runtime).
 *
 * Constraints of Edge Runtime:
 *  - No Node.js built-ins (fs, crypto, etc.)
 *  - Must use the global fetch API
 *  - @supabase/supabase-js v2 is Edge-compatible
 *
 * We call the Supabase REST API directly (via RPC) so we need
 * the service-role key to bypass RLS.
 */

import { createClient } from '@supabase/supabase-js';

/**
 * Creates a Supabase admin client that is safe for Edge Runtime.
 * Call this inside middleware; do NOT cache across requests.
 */
export function createEdgeAdminClient() {
  const url     = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const svcKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !svcKey) {
    throw new Error(
      '[Supabase Edge] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.'
    );
  }

  return createClient(url, svcKey, {
    auth: {
      autoRefreshToken: false,
      persistSession:   false,
      detectSessionInUrl: false,
    },
    global: {
      // Edge Runtime ships with native fetch; no polyfill needed.
      fetch: fetch.bind(globalThis),
    },
  });
}
