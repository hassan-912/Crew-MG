/**
 * app/actions/tokens.ts
 *
 * Server Actions for magic token management.
 *
 * ALL actions in this file must be called from admin-authenticated
 * surfaces only.  They use the service-role admin client and therefore
 * bypass Row Level Security.
 *
 * Exported actions:
 *   generateToken(options)  – Create a new single-use access link
 *   listTokens()            – List all tokens (admin dashboard use)
 *   revokeToken(id)         – Hard-delete / expire a token
 */

'use server';

import { randomBytes } from 'crypto';
import { createSupabaseAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface GenerateTokenOptions {
  /** Human-readable label (e.g. "John Smith – Dubai Visa Training") */
  label?:      string;
  /** Recipient email or employee ID – stored for audit purposes */
  recipient?:  string;
  /**
   * Token lifetime in hours.  Defaults to 168 (7 days).
   * Maximum is 720 hours (30 days).
   */
  expiresInHours?: number;
  /** The authenticated admin's user ID (from their Supabase session) */
  createdBy?:  string;
}

export interface GenerateTokenResult {
  success:   true;
  tokenId:   string;
  accessUrl: string;
}

export interface GenerateTokenError {
  success: false;
  error:   string;
}

// ---------------------------------------------------------------------------
// generateToken
// ---------------------------------------------------------------------------
/**
 * Creates a new single-use magic link and returns the full access URL.
 *
 * The raw token is a 32-byte (256-bit) cryptographically random value
 * encoded as URL-safe base64.  It is stored verbatim in the database and
 * embedded in the link as the `?token=` query parameter.
 *
 * @example
 * const result = await generateToken({ label: 'John Doe', recipient: 'john@airline.com' });
 * if (result.success) console.log(result.accessUrl);
 */
export async function generateToken(
  options: GenerateTokenOptions = {}
): Promise<GenerateTokenResult | GenerateTokenError> {
  try {
    const {
      label,
      recipient,
      expiresInHours = 168, // 7 days default
      createdBy,
    } = options;

    // ----- Validate input -----
    const clampedHours = Math.min(Math.max(expiresInHours, 1), 720);

    // ----- Generate token -----
    // 32 bytes → 256 bits of entropy; URL-safe base64 (no +/= characters)
    const rawBytes = randomBytes(32);
    const token    = rawBytes
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    // ----- Persist to Supabase -----
    const supabase   = createSupabaseAdminClient();
    const expiresAt  = new Date(
      Date.now() + clampedHours * 60 * 60 * 1000
    ).toISOString();

    const { data, error } = await supabase
      .from('magic_tokens')
      .insert({
        token,
        label:      label      ?? null,
        recipient:  recipient  ?? null,
        expires_at: expiresAt,
        created_by: createdBy  ?? null,
      })
      .select('id')
      .single();

    if (error) {
      console.error('[generateToken] Supabase insert error:', error);
      return { success: false, error: 'Failed to persist token. Please try again.' };
    }

    // ----- Build the access URL -----
    const baseUrl   = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    const accessUrl = `${baseUrl}/access?token=${token}`;

    // Revalidate admin token list if it's cached
    revalidatePath('/admin/tokens');

    return {
      success:   true,
      tokenId:   data.id,
      accessUrl,
    };
  } catch (err) {
    console.error('[generateToken] Unexpected error:', err);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

// ---------------------------------------------------------------------------
// listTokens
// ---------------------------------------------------------------------------
export async function listTokens() {
  try {
    const supabase = createSupabaseAdminClient();

    const { data, error } = await supabase
      .from('magic_tokens')
      .select('id, label, recipient, used, used_at, used_by_ip, expires_at, created_at')
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) {
      console.error('[listTokens] Supabase error:', error);
      return { success: false as const, error: 'Failed to fetch tokens.' };
    }

    return { success: true as const, tokens: data };
  } catch (err) {
    console.error('[listTokens] Unexpected error:', err);
    return { success: false as const, error: 'An unexpected error occurred.' };
  }
}

// ---------------------------------------------------------------------------
// revokeToken
// ---------------------------------------------------------------------------
/**
 * Immediately expires a token by setting expires_at to now().
 * Prefer this over hard-deleting so the audit trail is preserved.
 */
export async function revokeToken(
  tokenId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createSupabaseAdminClient();

    const { error } = await supabase
      .from('magic_tokens')
      .update({ expires_at: new Date().toISOString() })
      .eq('id', tokenId);

    if (error) {
      console.error('[revokeToken] Supabase error:', error);
      return { success: false, error: 'Failed to revoke token.' };
    }

    revalidatePath('/admin/tokens');
    return { success: true };
  } catch (err) {
    console.error('[revokeToken] Unexpected error:', err);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}
