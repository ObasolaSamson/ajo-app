import Link from 'next/link'
import { createCircle } from '@/app/actions/circles'

interface NewCirclePageProps {
  searchParams: Promise<{ error?: string }>
}

const inputClass =
  'w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-ajo focus:outline-none focus:ring-2 focus:ring-ajo/20 transition-colors'

const labelClass = 'block text-sm font-medium text-zinc-700 mb-1'

export default async function NewCirclePage({ searchParams }: NewCirclePageProps) {
  const { error } = await searchParams

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-800 transition-colors mb-4"
        >
          <ChevronLeftIcon /> Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-zinc-900">Create a Circle</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Set up a new savings circle and invite your people.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 sm:p-8">
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {decodeURIComponent(error)}
          </div>
        )}

        <form action={createCircle} className="space-y-5">
          {/* Circle Name */}
          <div>
            <label htmlFor="name" className={labelClass}>
              Circle name <span className="text-red-400">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              maxLength={60}
              className={inputClass}
              placeholder="e.g. Family Savings, Lagos Squad"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className={labelClass}>
              Description <span className="text-zinc-400 font-normal">(optional)</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows={2}
              className={inputClass}
              placeholder="What's this circle for?"
            />
          </div>

          {/* Amount + Frequency row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="contribution_amount" className={labelClass}>
                Contribution amount ($) <span className="text-red-400">*</span>
              </label>
              <input
                id="contribution_amount"
                name="contribution_amount"
                type="number"
                required
                min={100}
                step={100}
                className={inputClass}
                placeholder="e.g. 10000"
              />
            </div>

            <div>
              <label htmlFor="frequency" className={labelClass}>
                Frequency <span className="text-red-400">*</span>
              </label>
              <select
                id="frequency"
                name="frequency"
                required
                className={inputClass}
                defaultValue="monthly"
              >
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          </div>

          {/* Members + Start date row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="max_members" className={labelClass}>
                Number of members <span className="text-red-400">*</span>
              </label>
              <input
                id="max_members"
                name="max_members"
                type="number"
                required
                min={2}
                max={50}
                className={inputClass}
                placeholder="e.g. 10"
              />
              <p className="mt-1 text-xs text-zinc-400">Between 2 and 50</p>
            </div>

            <div>
              <label htmlFor="start_date" className={labelClass}>
                Start date <span className="text-red-400">*</span>
              </label>
              <input
                id="start_date"
                name="start_date"
                type="date"
                required
                min={minDate}
                className={inputClass}
              />
            </div>
          </div>

          {/* Info callout */}
          <div className="rounded-lg bg-ajo-light border border-ajo-muted px-4 py-3 text-sm text-ajo-dark">
            <strong>You&apos;ll be added as the first member</strong> with payout slot #1.
            After creating, share the invite link with your circle members.
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-ajo px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-ajo-dark focus:outline-none focus:ring-2 focus:ring-ajo focus:ring-offset-2 transition-colors"
          >
            Create Circle
          </button>
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
