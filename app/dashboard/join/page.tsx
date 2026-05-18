import Link from 'next/link'
import { redirect } from 'next/navigation'
import { SubmitButton } from '@/app/components/SubmitButton'

interface JoinPageProps {
  searchParams: Promise<{ code?: string }>
}

export default async function JoinPage({ searchParams }: JoinPageProps) {
  const { code } = await searchParams

  if (code) {
    redirect(`/dashboard/join/${code.trim().toUpperCase()}`)
  }

  return (
    <div className="max-w-md mx-auto">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-800 transition-colors mb-6"
      >
        <ChevronLeftIcon /> Dashboard
      </Link>

      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-8">
        <div className="text-center mb-6">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-ajo-light">
            <span className="text-2xl">🤝</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900">Join a Circle</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Enter the invite code shared with you to join a savings circle.
          </p>
        </div>

        <form
          action={async (formData: FormData) => {
            'use server'
            const raw = (formData.get('code') as string) ?? ''
            const code = raw.trim().toUpperCase().replace(/[^A-Z0-9]/gi, '')
            redirect(`/dashboard/join/${code}`)
          }}
          className="space-y-4"
        >
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-zinc-700 mb-1">
              Invite code
            </label>
            <input
              id="code"
              name="code"
              type="text"
              required
              maxLength={20}
              className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-mono text-zinc-900 placeholder-zinc-400 uppercase focus:border-ajo focus:outline-none focus:ring-2 focus:ring-ajo/20 transition-colors"
              placeholder="e.g. AB12CD34"
            />
          </div>

          <SubmitButton
            pendingText="Looking up…"
            className="w-full rounded-lg bg-ajo px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-ajo-dark focus:outline-none focus:ring-2 focus:ring-ajo focus:ring-offset-2 transition-colors"
          >
            Look up Circle
          </SubmitButton>
        </form>
      </div>
    </div>
  )
}

function ChevronLeftIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  )
}
