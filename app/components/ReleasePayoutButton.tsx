'use client'

import { useTransition } from 'react'
import { releasePayout } from '@/app/actions/circles'

interface ReleasePayoutButtonProps {
  circleId: string
  recipientName: string
  totalPayout: string
}

export function ReleasePayoutButton({
  circleId,
  recipientName,
  totalPayout,
}: ReleasePayoutButtonProps) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    const confirmed = window.confirm(
      `Release ${totalPayout} payout to ${recipientName}?\n\nThis will mark the current round as complete and advance to the next round. This cannot be undone.`
    )
    if (!confirmed) return

    startTransition(async () => {
      await releasePayout(circleId)
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-ajo px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-ajo-dark focus:outline-none focus:ring-2 focus:ring-ajo focus:ring-offset-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {isPending ? (
        <>
          <SpinnerIcon /> Releasing…
        </>
      ) : (
        <>
          <PayoutIcon /> Release Payout
        </>
      )}
    </button>
  )
}

function PayoutIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function SpinnerIcon() {
  return (
    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}
