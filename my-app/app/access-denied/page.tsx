/**
 * app/access-denied/page.tsx
 *
 * Shown when:
 *  - A token is missing, already used, or expired
 *  - The session cookie is absent or tampered with
 *  - A direct URL hit with no session
 *
 * No UI component library needed – pure server component.
 */

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Access Denied – Crew-MG',
  description: 'You do not have a valid access link.',
  robots: { index: false, follow: false },
};

// Map reason codes to user-friendly copy
const REASONS: Record<string, { heading: string; body: string }> = {
  no_session: {
    heading: 'Session Required',
    body:    'Please use the secure link sent to you by your training administrator.',
  },
  token_invalid_or_used: {
    heading: 'Link Already Used or Expired',
    body:    'This link is single-use and has already been redeemed, or it has expired. Please contact your administrator to request a new link.',
  },
  invalid_format: {
    heading: 'Invalid Link',
    body:    'The link you followed appears to be malformed. Please check you copied the full URL and try again.',
  },
  server_error: {
    heading: 'Temporary Error',
    body:    'We were unable to validate your access link right now. Please try again in a few moments.',
  },
};

const DEFAULT_REASON = {
  heading: 'Access Denied',
  body:    'You are not authorised to view this page.',
};

interface Props {
  searchParams: Promise<{ reason?: string }>;
}

export default async function AccessDeniedPage({ searchParams }: Props) {
  const { reason } = await searchParams;
  const copy       = (reason ? REASONS[reason] : undefined) ?? DEFAULT_REASON;

  return (
    <main
      style={{
        minHeight:       '100dvh',
        display:         'flex',
        flexDirection:   'column',
        alignItems:      'center',
        justifyContent:  'center',
        padding:         '2rem',
        background:      'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
        color:           '#f8fafc',
        fontFamily:      'system-ui, sans-serif',
        textAlign:       'center',
      }}
    >
      {/* Icon */}
      <div
        aria-hidden
        style={{
          fontSize:    '4rem',
          lineHeight:  1,
          marginBottom: '1.5rem',
          filter: 'drop-shadow(0 0 12px rgba(248, 113, 113, 0.6))',
        }}
      >
        🔒
      </div>

      {/* Heading */}
      <h1
        style={{
          fontSize:    'clamp(1.75rem, 4vw, 2.5rem)',
          fontWeight:  700,
          margin:      '0 0 1rem',
          color:       '#fca5a5',
        }}
      >
        {copy.heading}
      </h1>

      {/* Body */}
      <p
        style={{
          maxWidth:    '480px',
          lineHeight:  1.7,
          color:       '#cbd5e1',
          fontSize:    '1rem',
          margin:      '0 0 2.5rem',
        }}
      >
        {copy.body}
      </p>

      {/* Contact prompt */}
      <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
        If you believe this is an error, please contact your Crew-MG administrator.
      </p>
    </main>
  );
}
