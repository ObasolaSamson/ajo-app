import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { joinCircle } from '@/app/actions/circles'
import { SubmitButton } from '@/app/components/SubmitButton'

interface JoinCirclePageProps {
  params: Promise<{ invite_code: string }>
  searchParams: Promise<{ error?: string }>
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
}

function frequencyLabel(freq: string) {
  return freq === 'weekly' ? 'Weekly' : 'Monthly'
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default async function JoinCirclePage({
  params,
  searchParams,
}: JoinCirclePageProps) {
  const { invite_code } = await params
  const { error } = await searchParams

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Look up circle by invite code
  const { data: circle } = await supabase
    .from('circles')
    .select('*')
    .eq('invite_code', invite_code.toUpperCase())
    .single()

  if (!circle) notFound()

  // Member count and existing membership check run in parallel
  const [countResult, existingResult] = await Promise.all([
    supabase
      .from('circle_members')
      .select('id', { count: 'exact', head: true })
      .eq('circle_id', circle.id),
    supabase
      .from('circle_members')
      .select('id')
      .eq('circle_id', circle.id)
      .eq('profile_id', user.id)
      .single(),
  ])

  if (existingResult.data) {
    redirect(`/dashboard/circles/${circle.id}`)
  }

  const currentCount = countResult.count ?? 0
  const isFull = currentCount >= circle.total_slots

  const joinWithCode = joinCircle.bind(null, circle.id, invite_code.toUpperCase())

  return (
    <div className="max-w-md mx-auto">
      <Link
        href="/dashboard/join"
        className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-800 transition-colors mb-6"
      >
        <ChevronLeftIcon /> Enter different code
      </Link>

      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
        {/* Top accent */}
        <div className="h-2 bg-ajo" />

        <div className="p-6 sm:p-8">
          <h1 className="text-xl font-bold text-zinc-900 mb-1">You&apos;re invited!</h1>
          <p className="text-sm text-zinc-500 mb-6">
            Review the circle details below, then confirm to join.
          </p>

          {error && (
            <div className="mb-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {decodeURIComponent(error)}
            </div>
          )}

          {/* Circle info card */}
          <div className="rounded-xl bg-zinc-50 border border-zinc-100 p-5 mb-6 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-lg font-bold text-zinc-900">{circle.name}</h2>
              <span className="shrink-0 inline-flex items-center rounded-full bg-ajo-light px-2.5 py-0.5 text-xs font-medium text-ajo">
                {frequencyLabel(circle.frequency)}
              </span>
            </div>

            {circle.description && (
              <p className="text-sm text-zinc-500">{circle.description}</p>
            )}

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <p className="text-xs text-zinc-400">Contribution</p>
                <p className="text-sm font-semibold text-zinc-900">
                  {formatCurrency(circle.contribution_amount)}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-400">Start date</p>
                <p className="text-sm font-semibold text-zinc-900">
                  {formatDate(circle.start_date)}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-400">Members</p>
                <p className="text-sm font-semibold text-zinc-900">
                  {currentCount} / {circle.total_slots}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-400">Your payout slot</p>
                <p className="text-sm font-semibold text-zinc-900">
                  #{currentCount + 1}
                </p>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex justify-between text-xs text-zinc-400 mb-1">
              <span>Spots filled</span>
              <span>{currentCount} of {circle.total_slots}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-zinc-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-ajo"
                style={{ width: `${(currentCount / circle.total_slots) * 100}%` }}
              />
            </div>
          </div>

          {isFull ? (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 text-center">
              This circle is full and no longer accepting members.
            </div>
          ) : (
            <form action={joinWithCode}>
              <SubmitButton
                pendingText="Joining circle…"
                className="w-full rounded-lg bg-ajo px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-ajo-dark focus:outline-none focus:ring-2 focus:ring-ajo focus:ring-offset-2 transition-colors"
              >
                Confirm &amp; Join Circle
              </SubmitButton>
              <p className="mt-3 text-center text-xs text-zinc-400">
                You&apos;ll be assigned payout slot #{currentCount + 1}
              </p>
            </form>
          )}
        </div>
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
