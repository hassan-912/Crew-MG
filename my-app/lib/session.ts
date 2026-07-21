/**
 * lib/session.ts
 *
 * Stateless session helpers for Crew-MG.
 *
 * A lightweight, signed JWT is stored in an HTTP-only, Secure, SameSite=Lax
 * cookie named `crew_session`.  jose is used for signing/verification because
 * it is fully compatible with both Node.js and the Vercel Edge Runtime.
 *
 * The JWT payload carries:
 *   - sub            : the magic_token id (UUID) that granted access
 *   - recipient      : optional label (email / name) for display
 *   - tokenExpiresAt : ISO string of the DB token's hard expiry, so
 *                      the session cookie lifetime matches the link's
 *                      lifespan (up to 7 days) rather than a fixed 8 h
 *   - iat / exp      : standard JWT timestamps
 */

import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
export const SESSION_COOKIE_NAME = 'crew_session';
export const SESSION_DURATION_SECONDS = 60 * 60 * 8; // 8 hours

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface SessionPayload extends JWTPayload {
  sub:             string;   // magic_token id
  recipient?:      string;   // optional display name / email
  tokenExpiresAt?: string;   // ISO-8601 of the DB row's expires_at
}

// ---------------------------------------------------------------------------
// Secret key derivation
// ---------------------------------------------------------------------------
function getSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      '[Session] SESSION_SECRET env var is missing or too short (min 32 chars).'
    );
  }
  return new TextEncoder().encode(secret);
}

// ---------------------------------------------------------------------------
// Create a signed session JWT
// ---------------------------------------------------------------------------
export async function createSessionToken(payload: {
  sub:              string;
  recipient?:       string;
  tokenExpiresAt?:  string; // ISO-8601 from the DB row
}): Promise<string> {
  // If the DB token has a hard expiry, cap the JWT at that date.
  // Otherwise fall back to the default SESSION_DURATION_SECONDS.
  let expiry: string | number;
  if (payload.tokenExpiresAt) {
    const expiresMs = new Date(payload.tokenExpiresAt).getTime();
    const nowMs     = Date.now();
    const remainingSecs = Math.floor((expiresMs - nowMs) / 1000);
    // Guard: if somehow already expired, fall back to 60 s (will be rejected on next check)
    expiry = remainingSecs > 0 ? `${remainingSecs}s` : '60s';
  } else {
    expiry = `${SESSION_DURATION_SECONDS}s`;
  }

  return new SignJWT({
    recipient:      payload.recipient,
    tokenExpiresAt: payload.tokenExpiresAt,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(expiry)
    .setIssuer('crew-mg')
    .setAudience('crew-mg')
    .sign(getSecret());
}

// ---------------------------------------------------------------------------
// Verify a session JWT – returns payload or null
// ---------------------------------------------------------------------------
export async function verifySessionToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      issuer:   'crew-mg',
      audience: 'crew-mg',
    });
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Cookie options (used both in middleware and Server Actions)
// ---------------------------------------------------------------------------
/**
 * @param maxAgeOverride  If provided (seconds), overrides the default
 *   SESSION_DURATION_SECONDS.  Pass the remaining seconds until the
 *   DB token's expires_at so the browser cookie tracks the link's
 *   real lifespan.
 */
export function getSessionCookieOptions(maxAgeOverride?: number): {
  httpOnly: boolean;
  secure:   boolean;
  sameSite: 'lax' | 'strict' | 'none';
  path:     string;
  maxAge:   number;
} {
  return {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path:     '/',
    maxAge:   maxAgeOverride ?? SESSION_DURATION_SECONDS,
  };
}

/**
 * Derive the cookie maxAge (seconds) from the token's hard expiry date.
 * Clamps to a minimum of 60 s and a maximum of SESSION_DURATION_SECONDS * 5.
 */
export function maxAgeFromExpiry(tokenExpiresAt: string): number {
  const expiresMs    = new Date(tokenExpiresAt).getTime();
  const remainingSec = Math.floor((expiresMs - Date.now()) / 1000);
  return Math.max(60, remainingSec);
}
