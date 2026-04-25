import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { markAsPaid } from '@/app/actions/circles'
import { ReleasePayoutButton } from '@/app/components/ReleasePayoutButton'

interface CircleDetailPageProps {
  params: Promise<{ id: string }>
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

export default async function CircleDetailPage({ params, searchParams }: CircleDetailPageProps) {
  const { id } = await params
  const { error } = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch circle first — needed for currentRound below
  const { data: circle } = await supabase
    .from('circles')
    .select('*')
    .eq('id', id)
    .single()

  if (!circle) notFound()

  const currentRound: number = circle.current_round ?? 1
  const isOrganizer = circle.organizer_id === user.id

  // Fetch members, payout slots, and current-round contributions in parallel
  const [membersResult, payoutSlotsResult, contributionsResult] = await Promise.all([
    supabase
      .from('circle_members')
      .select('*, profiles(full_name, email)')
      .eq('circle_id', id)
      .order('joined_at', { ascending: true }),
    supabase
      .from('payout_slots')
      .select('*')
      .eq('circle_id', id)
      .order('slot_number', { ascending: true }),
    supabase
      .from('contributions')
      .select('*')
      .eq('circle_id', id)
      .eq('round_number', currentRound),
  ])

  const memberList = membersResult.data ?? []
  const slots = payoutSlotsResult.data ?? []
  const contributions = contributionsResult.data ?? []

  const currentMember = memberList.find((m) => m.profile_id === user.id)
  const isMember = !!currentMember

  // Merge members with their slot, sort by slot_number
  const membersWithSlots = memberList
    .map((m) => ({
      ...m,
      slot: slots.find((s) => s.member_id === m.id) ?? null,
    }))
    .sort((a, b) => (a.slot?.slot_number ?? 999) - (b.slot?.slot_number ?? 999))
  const paidMemberIds = new Set(contributions.map((c) => c.member_id as string))

  const paidCount = paidMemberIds.size
  const totalCollected = contributions.reduce((sum, c) => sum + (c.amount as number), 0)
  const totalExpected = circle.contribution_amount * memberList.length
  const allPaid = memberList.length > 0 && paidCount === memberList.length

  // Who receives payout this round — slot_number matches current_round
  const payoutSlot = slots.find((s) => s.slot_number === currentRound)
  const payoutMember = payoutSlot
    ? membersWithSlots.find((m) => m.slot?.slot_number === currentRound)
    : null
  const payoutProfile = payoutMember?.profiles as { full_name?: string; email?: string } | null
  const payoutRecipientName = payoutProfile?.full_name || payoutProfile?.email || 'Unknown'

  // My slot number
  const mySlotNumber = currentMember
    ? slots.find((s) => s.member_id === currentMember.id)?.slot_number
    : null

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-800 transition-colors"
      >
        <ChevronLeftIcon /> Dashboard
      </Link>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {decodeURIComponent(error)}
        </div>
      )}

      {/* Circle header */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="inline-flex items-center rounded-full bg-ajo-light px-2.5 py-0.5 text-xs font-medium text-ajo mb-2">
              {frequencyLabel(circle.frequency)}
            </span>
            <h1 className="text-2xl font-bold text-zinc-900">{circle.name}</h1>
            {circle.description && (
              <p className="mt-1 text-sm text-zinc-500">{circle.description}</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {isOrganizer && (
              <span className="inline-flex items-center rounded-full bg-zinc-800 px-3 py-1 text-xs font-semibold text-white">
                Organizer
              </span>
            )}
            {isMember && mySlotNumber && (
              <span className="inline-flex items-center rounded-full bg-ajo px-3 py-1 text-xs font-semibold text-white">
                Slot #{mySlotNumber}
              </span>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Stat label="Contribution" value={formatCurrency(circle.contribution_amount)} />
          <Stat label="Frequency" value={frequencyLabel(circle.frequency)} />
          <Stat label="Members" value={`${memberList.length} / ${circle.total_slots}`} />
          <Stat label="Start Date" value={formatDate(circle.start_date)} />
        </div>
      </div>

      {/* Round Summary */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
        <div className="bg-ajo px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium opacity-75 uppercase tracking-wide">Current Round</p>
              <p className="text-2xl font-bold mt-0.5">Round {currentRound}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium opacity-75 uppercase tracking-wide">Payout Recipient</p>
              <p className="text-sm font-semibold mt-0.5">
                {payoutRecipientName}
                {payoutMember?.profile_id === user.id && (
                  <span className="ml-1.5 opacity-75">(you!)</span>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 divide-x divide-zinc-100 border-t border-zinc-100">
          <SummaryCell
            label="Paid"
            value={`${paidCount} / ${memberList.length}`}
            highlight={allPaid}
          />
          <SummaryCell
            label="Collected"
            value={formatCurrency(totalCollected)}
          />
          <SummaryCell
            label="Target"
            value={formatCurrency(totalExpected)}
          />
        </div>

        {/* Progress bar */}
        <div className="px-6 pb-5">
          <div className="h-2 w-full rounded-full bg-zinc-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-ajo transition-all duration-500"
              style={{
                width: `${totalExpected > 0 ? Math.min(100, (totalCollected / totalExpected) * 100) : 0}%`,
              }}
            />
          </div>
          <p className="mt-1.5 text-xs text-zinc-400 text-right">
            {totalExpected > 0
              ? `${Math.round((totalCollected / totalExpected) * 100)}% collected`
              : '0% collected'}
          </p>
        </div>
      </div>

      {/* Contribution Tracking */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-zinc-900">
            Round {currentRound} Contributions
          </h2>
          {isOrganizer && allPaid && (
            <ReleasePayoutButton
              circleId={id}
              recipientName={payoutRecipientName}
              totalPayout={formatCurrency(totalExpected)}
            />
          )}
        </div>

        {memberList.length === 0 ? (
          <p className="text-sm text-zinc-400">No members yet.</p>
        ) : (
          <ul className="space-y-2">
            {membersWithSlots.map((m) => {
              const profile = m.profiles as { full_name?: string; email?: string } | null
              const name = profile?.full_name || profile?.email || 'Member'
              const hasPaid = paidMemberIds.has(m.id)
              const isYou = m.profile_id === user.id
              const slotNumber = m.slot?.slot_number

              return (
                <li
                  key={m.id}
                  className={`flex items-center gap-3 rounded-xl p-3 border transition-colors
                    ${hasPaid
                      ? 'bg-ajo-light border-ajo-muted'
                      : 'bg-zinc-50 border-zinc-100'
                    }`}
                >
                  {/* Slot badge */}
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold
                      ${hasPaid ? 'bg-ajo text-white' : 'bg-zinc-200 text-zinc-500'}`}
                  >
                    {slotNumber ?? '—'}
                  </div>

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-800 truncate">
                      {name}
                      {isYou && (
                        <span className="ml-2 text-xs text-zinc-400 font-normal">(you)</span>
                      )}
                    </p>
                  </div>

                  {/* Status + action */}
                  <div className="shrink-0 flex items-center gap-2">
                    {hasPaid ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-ajo">
                        <CheckCircleIcon /> Paid
                      </span>
                    ) : (
                      <>
                        <span className="inline-flex items-center gap-1 text-xs text-amber-600 font-medium">
                          <WarningIcon /> Pending
                        </span>
                        {isOrganizer && (
                          <form action={markAsPaid}>
                            <input type="hidden" name="circle_id" value={id} />
                            <input type="hidden" name="member_id" value={m.id} />
                            <input type="hidden" name="round_number" value={currentRound} />
                            <input type="hidden" name="amount" value={circle.contribution_amount} />
                            <button
                              type="submit"
                              className="rounded-lg border border-ajo bg-white px-2.5 py-1 text-xs font-semibold text-ajo hover:bg-ajo-light transition-colors"
                            >
                              Mark Paid
                            </button>
                          </form>
                        )}
                      </>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}

        {isOrganizer && allPaid && (
          <div className="mt-4 rounded-lg bg-ajo-light border border-ajo-muted p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-ajo">
                All members have paid! Ready to release.
              </p>
              <p className="text-xs text-ajo/70 mt-0.5">
                {formatCurrency(totalExpected)} will be released to {payoutRecipientName}.
              </p>
            </div>
            <ReleasePayoutButton
              circleId={id}
              recipientName={payoutRecipientName}
              totalPayout={formatCurrency(totalExpected)}
            />
          </div>
        )}

        {isOrganizer && !allPaid && memberList.length > 0 && (
          <p className="mt-4 text-xs text-zinc-400 text-center">
            Waiting on {memberList.length - paidCount} member
            {memberList.length - paidCount > 1 ? 's' : ''} before payout can be released.
          </p>
        )}
      </div>

      {/* Payout Order */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6">
        <h2 className="font-semibold text-zinc-900 mb-4">
          Payout Order
          <span className="ml-2 text-sm font-normal text-zinc-400">
            ({memberList.length} of {circle.total_slots} spots filled)
          </span>
        </h2>

        {membersWithSlots.length === 0 ? (
          <p className="text-sm text-zinc-400">No members yet.</p>
        ) : (
          <ol className="space-y-2">
            {membersWithSlots.map((m, idx) => {
              const profile = m.profiles as { full_name?: string; email?: string } | null
              const name = profile?.full_name || profile?.email || 'Member'
              const slotNumber = m.slot?.slot_number ?? idx + 1
              const isPaidOut = m.slot?.status === 'paid'
              const isCurrentRound = slotNumber === currentRound
              const isYou = m.profile_id === user.id

              return (
                <li key={m.id} className="flex items-center gap-3 rounded-lg p-3 bg-zinc-50">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold
                      ${isPaidOut
                        ? 'bg-zinc-200 text-zinc-400'
                        : isCurrentRound
                        ? 'bg-ajo text-white'
                        : 'bg-ajo-light text-ajo'
                      }`}
                  >
                    {slotNumber}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-800 truncate">
                      {name}
                      {isYou && (
                        <span className="ml-2 text-xs text-zinc-400 font-normal">(you)</span>
                      )}
                    </p>
                    {m.slot?.payout_date && (
                      <p className="text-xs text-zinc-400">
                        Payout: {formatDate(m.slot.payout_date)}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    {isPaidOut ? (
                      <span className="text-xs text-zinc-400">Paid out</span>
                    ) : isCurrentRound ? (
                      <span className="inline-flex items-center rounded-full bg-ajo px-2 py-0.5 text-xs font-medium text-white">
                        This round
                      </span>
                    ) : null}
                  </div>
                </li>
              )
            })}
          </ol>
        )}

        {memberList.length < circle.total_slots && (
          <p className="mt-3 text-xs text-zinc-400 text-center">
            {circle.total_slots - memberList.length} open slot
            {circle.total_slots - memberList.length > 1 ? 's' : ''} remaining
          </p>
        )}
      </div>

      {/* Invite link (members only) */}
      {isMember && (
        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-semibold text-zinc-900">Invite Members</h2>
            <Link
              href={`/dashboard/circles/${id}/invite`}
              className="text-sm font-medium text-ajo hover:text-ajo-dark transition-colors"
            >
              Manage invites →
            </Link>
          </div>
          <p className="text-sm text-zinc-500 mb-4">
            Share your invite code with people you want to add.
          </p>
          <div className="flex items-center gap-3">
            <code className="flex-1 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm font-mono font-semibold text-zinc-700 tracking-widest text-center">
              {circle.invite_code}
            </code>
            <Link
              href={`/dashboard/circles/${id}/invite`}
              className="shrink-0 rounded-lg bg-ajo px-4 py-2.5 text-sm font-semibold text-white text-center hover:bg-ajo-dark transition-colors"
            >
              Invite Page
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-zinc-400 uppercase tracking-wide">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-zinc-900">{value}</p>
    </div>
  )
}

function SummaryCell({
  label,
  value,
  highlight,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="px-4 py-4 text-center">
      <p className="text-xs text-zinc-400 uppercase tracking-wide">{label}</p>
      <p className={`mt-1 text-lg font-bold ${highlight ? 'text-ajo' : 'text-zinc-900'}`}>
        {value}
      </p>
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

function CheckCircleIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function WarningIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  )
}
