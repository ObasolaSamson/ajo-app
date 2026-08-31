import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { markAsPaid } from '@/app/actions/circles'
import { ReleasePayoutButton } from '@/app/components/ReleasePayoutButton'
import { SubmitButton } from '@/app/components/SubmitButton'
import { AddMemberForm } from './AddMemberForm'
import { ChangeSlotSelect } from './ChangeSlotSelect'
import { RemoveMemberButton } from './RemoveMemberButton'

interface ManageCirclePageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string; success?: string }>
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
}

type ProfileShape = {
  full_name?: string | null
  email?: string | null
  phone?: string | null
} | null

function asProfile(profiles: unknown): ProfileShape {
  if (Array.isArray(profiles)) return (profiles[0] ?? null) as ProfileShape
  return (profiles as ProfileShape) ?? null
}

function memberDisplayName(profiles: unknown): string {
  const p = asProfile(profiles)
  if (!p) return 'Member'
  if (p.full_name?.trim()) return p.full_name.trim()
  if (p.email && !p.email.endsWith('@users.invalid')) return p.email.split('@')[0]
  return 'Member'
}

function displayEmail(email: string | null | undefined): string | null {
  if (!email || email.endsWith('@users.invalid')) return null
  return email
}

export default async function ManageCirclePage({
  params,
  searchParams,
}: ManageCirclePageProps) {
  const { id } = await params
  const { error, success } = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: circle } = await supabase
    .from('circles')
    .select('*')
    .eq('id', id)
    .single()

  if (!circle) notFound()

  if (circle.organizer_id !== user.id) {
    redirect(`/dashboard/circles/${id}`)
  }

  const currentRound: number = circle.current_round ?? 1
  const managePath = `/dashboard/circles/${id}/manage`

  const [membersResult, payoutSlotsResult, contributionsResult] = await Promise.all([
    supabase
      .from('circle_members')
      .select('*, profiles(id, full_name, email, phone, avatar_url)')
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

  const membersWithSlots = memberList
    .map((m) => ({
      ...m,
      slot: slots.find((s) => s.member_id === m.id) ?? null,
    }))
    .sort((a, b) => (a.slot?.slot_number ?? 999) - (b.slot?.slot_number ?? 999))

  const paidMemberIds = new Set(contributions.map((c) => c.member_id as string))
  const paidCount = paidMemberIds.size
  const allPaid = memberList.length > 0 && paidCount === memberList.length
  const totalExpected = circle.contribution_amount * memberList.length
  const isFull = memberList.length >= circle.total_slots

  const takenSlotNumbers = slots.map((s) => s.slot_number as number)
  const openSlotNumbers = Array.from(
    { length: circle.total_slots as number },
    (_, i) => i + 1,
  ).filter((n) => !takenSlotNumbers.includes(n))

  const payoutMember = membersWithSlots.find((m) => m.slot?.slot_number === currentRound)
  const payoutRecipientName = payoutMember
    ? memberDisplayName(payoutMember.profiles)
    : 'the slot holder'

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href={`/dashboard/circles/${id}`}
        className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-800 transition-colors"
      >
        <ChevronLeftIcon /> Back to circle
      </Link>

      <div>
        <p className="text-xs font-medium text-ajo uppercase tracking-wide">Organizer tools</p>
        <h1 className="mt-1 text-2xl font-bold text-zinc-900">Manage Circle</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Add members without accounts, assign slots, and record contributions for{' '}
          <span className="font-medium text-zinc-700">{circle.name}</span>.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {decodeURIComponent(error)}
        </div>
      )}
      {success && (
        <div className="rounded-lg bg-ajo-light border border-ajo-muted px-4 py-3 text-sm font-medium text-ajo">
          {decodeURIComponent(success)}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
        <div className="bg-ajo px-6 py-4 text-white flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium opacity-75 uppercase tracking-wide">Current round</p>
            <p className="text-xl font-bold mt-0.5">Round {currentRound}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium opacity-75 uppercase tracking-wide">Paid this round</p>
            <p className="text-sm font-semibold mt-0.5">
              {paidCount} / {memberList.length} members
            </p>
          </div>
        </div>
        {allPaid && (
          <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-ajo-light">
            <div>
              <p className="text-sm font-semibold text-ajo">All members have paid</p>
              <p className="text-xs text-ajo/70 mt-0.5">
                Confirm that {formatCurrency(totalExpected)} was sent to {payoutRecipientName}, then
                advance to the next round.
              </p>
            </div>
            <ReleasePayoutButton
              circleId={id}
              recipientName={payoutRecipientName}
              totalPayout={formatCurrency(totalExpected)}
            />
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ajo-light">
            <PlusIcon />
          </div>
          <h2 className="font-semibold text-zinc-900">Add Member</h2>
        </div>
        <p className="text-sm text-zinc-500 mb-5">
          Members you add here don&apos;t need an Ajo account. You can track their contributions
          yourself.
        </p>

        {isFull ? (
          <div className="rounded-xl bg-zinc-50 border border-zinc-200 px-4 py-3 text-sm text-zinc-600">
            This circle is full ({circle.total_slots} / {circle.total_slots} members). Remove a
            member to add someone new.
          </div>
        ) : (
          <AddMemberForm
            circleId={id}
            totalSlots={circle.total_slots}
            takenSlotNumbers={takenSlotNumbers}
          />
        )}
      </div>

      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6">
        <h2 className="font-semibold text-zinc-900 mb-1">
          Members
          <span className="ml-2 text-sm font-normal text-zinc-400">
            {memberList.length} of {circle.total_slots}
          </span>
        </h2>
        <p className="text-sm text-zinc-500 mb-5">
          Change slots, mark this round as paid, or remove a member.
        </p>

        {membersWithSlots.length === 0 ? (
          <p className="text-sm text-zinc-400">No members yet. Add someone using the form above.</p>
        ) : (
          <ul className="space-y-3">
            {membersWithSlots.map((m) => {
              const profile = asProfile(m.profiles)
              const name = memberDisplayName(m.profiles)
              const email = displayEmail(profile?.email)
              const phone = profile?.phone?.trim() || null
              const hasPaid = paidMemberIds.has(m.id)
              const isOrg =
                m.role === 'organizer' || m.profile_id === circle.organizer_id
              const slotNumber = (m.slot?.slot_number as number | undefined) ?? null
              const availableForThisMember = [
                ...openSlotNumbers,
                ...(slotNumber ? [slotNumber] : []),
              ]

              return (
                <li
                  key={m.id}
                  className={`rounded-xl border p-4 space-y-3 ${
                    hasPaid
                      ? 'bg-ajo-light border-ajo-muted'
                      : 'bg-zinc-50 border-zinc-100'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                        hasPaid ? 'bg-ajo text-white' : 'bg-zinc-200 text-zinc-600'
                      }`}
                    >
                      {name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-zinc-900 truncate">
                        {name}
                        {m.profile_id === user.id && (
                          <span className="ml-2 text-xs font-normal text-zinc-400">(you)</span>
                        )}
                      </p>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-zinc-500">
                        {email && <span className="truncate">{email}</span>}
                        {email && phone && <span aria-hidden="true">·</span>}
                        {phone && <span>{phone}</span>}
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        {isOrg && (
                          <span className="inline-flex items-center rounded-full bg-zinc-800 px-2 py-0.5 text-xs font-medium text-white">
                            Organizer
                          </span>
                        )}
                        {hasPaid ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-ajo">
                            <CheckCircleIcon /> Paid this round
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600">
                            <WarningIcon /> Pending this round
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                    <div className="sm:w-36">
                      <ChangeSlotSelect
                        circleId={id}
                        memberId={m.id}
                        currentSlot={slotNumber}
                        availableSlots={availableForThisMember}
                      />
                    </div>

                    <div className="flex flex-1 gap-2">
                      {!hasPaid && (
                        <form action={markAsPaid} className="flex-1 sm:flex-none">
                          <input type="hidden" name="circle_id" value={id} />
                          <input type="hidden" name="member_id" value={m.id} />
                          <input type="hidden" name="round_number" value={currentRound} />
                          <input type="hidden" name="amount" value={circle.contribution_amount} />
                          <input type="hidden" name="return_path" value={managePath} />
                          <SubmitButton
                            pendingText="Saving…"
                            className="w-full sm:w-auto rounded-lg bg-ajo px-3 py-2 text-xs font-semibold text-white hover:bg-ajo-dark transition-colors"
                          >
                            Mark as Paid
                          </SubmitButton>
                        </form>
                      )}

                      {!isOrg && (
                        <RemoveMemberButton
                          circleId={id}
                          memberId={m.id}
                          memberName={name}
                        />
                      )}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}

        {!allPaid && memberList.length > 0 && (
          <p className="mt-4 text-xs text-zinc-400 text-center">
            Waiting on {memberList.length - paidCount} member
            {memberList.length - paidCount > 1 ? 's' : ''} before payout can be released.
          </p>
        )}
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

function PlusIcon() {
  return (
    <svg className="h-4 w-4 text-ajo" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
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
