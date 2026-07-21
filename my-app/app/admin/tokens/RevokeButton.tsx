'use client';

/**
 * app/admin/tokens/RevokeButton.tsx
 *
 * Client Component — the revoke button on each token row.
 * Calls the revokeToken server action and refreshes on success.
 */

import { useTransition, useState } from 'react';
import { revokeToken } from '@/app/actions/tokens';
import { useRouter } from 'next/navigation';

export default function RevokeButton({ tokenId }: { tokenId: string }) {
  const [isPending, startTransition] = useTransition();
  const [confirmed, setConfirmed] = useState(false);
  const router = useRouter();

  function handleRevoke() {
    if (!confirmed) {
      setConfirmed(true);
      return;
    }
    startTransition(async () => {
      await revokeToken(tokenId);
      setConfirmed(false);
      router.refresh();
    });
  }

  return (
    <button
      id={`revoke-${tokenId}`}
      onClick={handleRevoke}
      disabled={isPending}
      className={`
        text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all
        ${confirmed
          ? 'bg-red-600 text-white border-red-600 hover:bg-red-700'
          : 'bg-white text-slate-600 border-slate-200 hover:border-red-300 hover:text-red-600'
        }
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
    >
      {isPending ? 'Revoking…' : confirmed ? 'Confirm?' : 'Revoke'}
    </button>
  );
}
