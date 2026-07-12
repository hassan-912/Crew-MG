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
 *   - sub      : the magic_token id (UUID) that granted access
 *   - recipient: optional label (email / name) for display
 *   - iat / exp: standard JWT timestamps
 */

import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
export const SESSION_COOKIE_NAME = 'crew_session';
const SESSION_DURATION_SECONDS   = 60 * 60 * 8; // 8 hours

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface SessionPayload extends JWTPayload {
  sub:        string;   // magic_token id
  recipient?: string;   // optional display name / email
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
  sub:        string;
  recipient?: string;
}): Promise<string> {
  return new SignJWT({ recipient: payload.recipient })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
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
export function getSessionCookieOptions(): {
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
    maxAge:   SESSION_DURATION_SECONDS,
  };
}
