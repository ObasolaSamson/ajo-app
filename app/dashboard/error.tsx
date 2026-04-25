'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function DashboardError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error('[dashboard error]', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] text-center px-4">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
        <svg className="h-7 w-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      </div>
      <h2 className="text-lg font-semibold text-zinc-900">Something went wrong</h2>
      <p className="mt-1 text-sm text-zinc-500 max-w-sm">
        We couldn&apos;t load your dashboard. This is usually temporary.
      </p>
      <div className="mt-6 flex gap-3">
        <button
          onClick={unstable_retry}
          className="inline-flex items-center gap-2 rounded-lg bg-ajo px-4 py-2 text-sm font-semibold text-white hover:bg-ajo-dark transition-colors"
        >
          Try again
        </button>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
        >
          Reload page
        </Link>
      </div>
    </div>
  )
}
