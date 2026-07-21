/**
 * app/admin/tokens/page.tsx
 *
 * Admin — Token History  (Server Component)
 *
 * Fetches all magic_tokens rows including the new device-binding
 * columns (claimed_device_id, claimed_at) added in migration 003.
 * Displays live status: Unclaimed / Claimed / Expired / Revoked.
 */

import type { Metadata } from 'next';
import { createSupabaseAdminClient } from '@/lib/supabase/server';
import RevokeButton from './RevokeButton';

export const metadata: Metadata = {
  title: 'Token History — Crew-MG Admin',
  description: 'Audit log of all issued magic link tokens.',
  robots: { index: false, follow: false },
};

// Force dynamic rendering — this page must never be statically cached
export const dynamic = 'force-dynamic';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TokenRow {
  id:                string;
  label:             string | null;
  recipient:         string | null;
  used:              boolean;
  used_at:           string | null;
  used_by_ip:        string | null;
  expires_at:        string;
  created_at:        string;
  claimed_device_id: string | null;
  claimed_at:        string | null;
}

type TokenStatus = 'Unclaimed' | 'Claimed' | 'Expired' | 'Revoked';

function getStatus(row: TokenRow): TokenStatus {
  const now = Date.now();
  const expiresMs = new Date(row.expires_at).getTime();

  // Expired takes priority — the token is dead regardless
  if (expiresMs <= now) return 'Expired';
  // used_at in the past with expires_at also in the past ← covered above
  // A token whose expiry was manually set to now() is "Revoked"
  // (we can't distinguish revoke from natural expiry without extra column, so "Expired" covers both)

  if (row.claimed_device_id) return 'Claimed';
  return 'Unclaimed';
}

const STATUS_STYLES: Record<TokenStatus, string> = {
  Unclaimed: 'bg-sky-50    text-sky-700    border-sky-200',
  Claimed:   'bg-emerald-50 text-emerald-700 border-emerald-200',
  Expired:   'bg-slate-100  text-slate-500   border-slate-200',
  Revoked:   'bg-red-50     text-red-600     border-red-200',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(iso: string | null): string {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('en-GB', {
    day:    '2-digit',
    month:  'short',
    year:   'numeric',
    hour:   '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(iso));
}

function truncate(str: string | null, len = 24): string {
  if (!str) return '—';
  return str.length > len ? `${str.slice(0, len)}…` : str;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function TokenHistoryPage() {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from('magic_tokens')
    .select(
      'id, label, recipient, used, used_at, used_by_ip, expires_at, created_at, claimed_device_id, claimed_at'
    )
    .order('created_at', { ascending: false })
    .limit(300);

  const tokens: TokenRow[] = (data as TokenRow[] | null) ?? [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* ── Header ── */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Token History</h1>
          <p className="mt-1 text-sm text-slate-500">
            All issued magic links — newest first. Device binding status reflects migration 003.
          </p>
        </div>
        <span className="text-xs text-slate-400 font-mono">{tokens.length} tokens</span>
      </div>

      {/* ── Error state ── */}
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-5 py-4 text-sm text-red-700 mb-6">
          <strong>Database error:</strong> {error.message}
        </div>
      )}

      {/* ── Empty state ── */}
      {!error && tokens.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 py-20 text-center">
          <p className="text-slate-400 text-sm">No tokens have been issued yet.</p>
        </div>
      )}

      {/* ── Table ── */}
      {tokens.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {[
                    'Status', 'Recipient / Label', 'Claimed At',
                    'Device ID', 'Last IP', 'Expires', 'Created', 'Actions',
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tokens.map((row) => {
                  const status = getStatus(row);
                  const isExpired = status === 'Expired';
                  return (
                    <tr
                      key={row.id}
                      className={`transition-colors hover:bg-slate-50 ${isExpired ? 'opacity-60' : ''}`}
                    >
                      {/* Status badge */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_STYLES[status]}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              status === 'Claimed'   ? 'bg-emerald-500' :
                              status === 'Unclaimed' ? 'bg-sky-400'     :
                              'bg-slate-400'
                            }`}
                          />
                          {status}
                        </span>
                      </td>

                      {/* Recipient / Label */}
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-800 truncate max-w-[180px]" title={row.recipient ?? ''}>
                          {row.recipient ?? <span className="text-slate-400 italic">No recipient</span>}
                        </p>
                        {row.label && (
                          <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[180px]" title={row.label}>
                            {row.label}
                          </p>
                        )}
                      </td>

                      {/* Claimed at */}
                      <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                        {row.claimed_at
                          ? <span className="font-medium">{fmt(row.claimed_at)}</span>
                          : <span className="text-slate-300">—</span>
                        }
                      </td>

                      {/* Device ID */}
                      <td className="px-4 py-3">
                        {row.claimed_device_id ? (
                          <span
                            title={row.claimed_device_id}
                            className="font-mono text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded"
                          >
                            {truncate(row.claimed_device_id, 18)}
                          </span>
                        ) : (
                          <span className="text-slate-300 text-xs font-mono">unbound</span>
                        )}
                      </td>

                      {/* Last IP */}
                      <td className="px-4 py-3 whitespace-nowrap font-mono text-xs text-slate-500">
                        {row.used_by_ip ?? '—'}
                      </td>

                      {/* Expires */}
                      <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                        <span className={isExpired ? 'text-slate-400 line-through' : ''}>
                          {fmt(row.expires_at)}
                        </span>
                      </td>

                      {/* Created */}
                      <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                        {fmt(row.created_at)}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        {!isExpired && <RevokeButton tokenId={row.id} />}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
