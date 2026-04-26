import Link from 'next/link'
import { redirect } from 'next/navigation'
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

  const normalizedCode = invite_code.trim().toUpperCase()

  // Look up circle by invite_code — never throw notFound() for a valid code.
  // Use ilike (case-insensitive) so casing differences between the URL and
  // what's stored in the DB never cause a false miss.
  const { data: circle, error: circleError } = await supabase
    .from('circles')
    .select('*')
    .ilike('invite_code', normalizedCode)
    .single()

  // Circle not found or DB error — show a clear message, not a hard 404
  if (circleError || !circle) {
    return <InvalidCodeState code={normalizedCode} />
  }

  // Member count and existing-membership check in parallel
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
      .maybeSingle(),           // maybeSingle() never errors on zero rows
  ])

  const currentCount = countResult.count ?? 0
  const isMember = !!existingResult.data
  const isFull = currentCount >= circle.total_slots

  const joinWithCode = joinCircle.bind(null, circle.id, normalizedCode)

  return (
    <div className="max-w-md mx-auto">
      <Link
        href="/dashboard/join"
        className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-800 transition-colors mb-6"
      >
        <ChevronLeftIcon /> Enter different code
      </Link>

      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
        {/* Top accent — grey when full/already joined, green otherwise */}
        <div className={`h-2 ${isMember || isFull ? 'bg-zinc-300' : 'bg-ajo'}`} />

        <div className="p-6 sm:p-8">

          {/* ── Already a member ── */}
          {isMember ? (
            <AlreadyMemberState circle={circle} />
          ) : (
            <>
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
                  {!isFull && (
                    <div>
                      <p className="text-xs text-zinc-400">Your payout slot</p>
                      <p className="text-sm font-semibold text-zinc-900">
                        #{currentCount + 1}
                      </p>
                    </div>
                  )}
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
                    className={`h-full rounded-full transition-all ${isFull ? 'bg-zinc-400' : 'bg-ajo'}`}
                    style={{ width: `${Math.min(100, (currentCount / circle.total_slots) * 100)}%` }}
                  />
                </div>
              </div>

              {/* ── Circle full ── */}
              {isFull ? (
                <CircleFullState circle={circle} />
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
            </>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── State components ────────────────────────────────────────────────────── */

function AlreadyMemberState({ circle }: { circle: { id: string; name: string } }) {
  return (
    <div className="py-4 text-center space-y-4">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-ajo-light">
        <svg className="h-7 w-7 text-ajo" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div>
        <h2 className="text-lg font-bold text-zinc-900">You&apos;re already a member</h2>
        <p className="mt-1 text-sm text-zinc-500">
          You&apos;re already part of <span className="font-medium text-zinc-700">{circle.name}</span>.
        </p>
      </div>
      <Link
        href={`/dashboard/circles/${circle.id}`}
        className="inline-flex items-center justify-center w-full rounded-lg bg-ajo px-4 py-3 text-sm font-semibold text-white hover:bg-ajo-dark transition-colors"
      >
        Go to circle →
      </Link>
    </div>
  )
}

function CircleFullState({ circle }: { circle: { id: string; name: string; total_slots: number } }) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-zinc-50 border border-zinc-200 px-5 py-4 text-center">
        <p className="text-sm font-semibold text-zinc-700 mb-1">This circle is full</p>
        <p className="text-xs text-zinc-400">
          <span className="font-medium">{circle.name}</span> has reached its maximum of{' '}
          {circle.total_slots} member{circle.total_slots !== 1 ? 's' : ''} and is no longer
          accepting new members.
        </p>
      </div>
      <Link
        href="/dashboard/join"
        className="inline-flex items-center justify-center w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
      >
        Try a different code
      </Link>
    </div>
  )
}

function InvalidCodeState({ code }: { code: string }) {
  return (
    <div className="max-w-md mx-auto">
      <Link
        href="/dashboard/join"
        className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-800 transition-colors mb-6"
      >
        <ChevronLeftIcon /> Enter different code
      </Link>

      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-8 text-center space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
          <svg className="h-7 w-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-bold text-zinc-900">Invalid invite code</h2>
          <p className="mt-1 text-sm text-zinc-500">
            No circle found for code{' '}
            <code className="font-mono font-semibold text-zinc-700">{code}</code>.
            Double-check the link or ask the organizer to resend it.
          </p>
        </div>
        <Link
          href="/dashboard/join"
          className="inline-flex items-center justify-center w-full rounded-lg bg-ajo px-4 py-2.5 text-sm font-semibold text-white hover:bg-ajo-dark transition-colors"
        >
          Try again
        </Link>
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
