import { Suspense } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ActivityFeed } from './_components/ActivityFeed'

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

type CircleRow = {
  id: string
  name: string
  description: string | null
  frequency: string
  contribution_amount: number
  total_slots: number
  current_round: number
  status: string
  start_date: string
  invite_code: string
  organizer_id: string
  created_at: string
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const displayName =
    user.user_metadata?.full_name || user.email?.split('@')[0] || 'there'

  // Single query — the only blocking fetch on this page
  const { data: memberships } = await supabase
    .from('circle_members')
    .select(
      'circle_id, circles(id, name, description, frequency, contribution_amount, total_slots, current_round, status, start_date, invite_code, organizer_id, created_at)'
    )
    .eq('profile_id', user.id)
    .order('joined_at', { ascending: false })

  const circles = (memberships ?? []).map(
    (m) => m.circles as unknown as CircleRow
  )
  const circleIds = circles.map((c) => c.id)

  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="rounded-2xl bg-ajo p-6 sm:p-8 text-white">
        <p className="text-sm font-medium opacity-80">{greeting}</p>
        <h1 className="mt-1 text-2xl sm:text-3xl font-bold">{displayName} 👋</h1>
        <p className="mt-1 text-sm opacity-75">
          {circles.length === 0
            ? "You have no active circles yet. Start one or join a friend's."
            : `You're in ${circles.length} savings circle${circles.length > 1 ? 's' : ''}.`}
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/dashboard/circles/new"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-ajo hover:bg-ajo-light transition-colors"
          >
            <PlusIcon /> Create Circle
          </Link>
          <Link
            href="/dashboard/join"
            className="inline-flex items-center gap-2 rounded-lg border border-white/40 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
          >
            <UsersIcon /> Join Circle
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left — circles (available immediately) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-900">My Circles</h2>
            {circles.length > 0 && (
              <Link
                href="/dashboard/circles/new"
                className="text-sm font-medium text-ajo hover:text-ajo-dark transition-colors"
              >
                + New circle
              </Link>
            )}
          </div>

          {circles.length === 0 ? (
            <EmptyCircles />
          ) : (
            <div className="space-y-3">
              {circles.map((circle) => (
                <CircleCard key={circle.id} circle={circle} />
              ))}
            </div>
          )}
        </div>

        {/* Right — activity feed (streamed separately) */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-zinc-900">Recent Activity</h2>
          <Suspense fallback={<ActivitySkeleton />}>
            <ActivityFeed circleIds={circleIds} userId={user.id} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

function ActivitySkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm divide-y divide-zinc-50 animate-pulse">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-start gap-3 p-4">
          <div className="mt-0.5 h-7 w-7 rounded-full bg-zinc-100 shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 w-full rounded bg-zinc-100" />
            <div className="h-3 w-16 rounded bg-zinc-100" />
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyCircles() {
  return (
    <div className="rounded-2xl border-2 border-dashed border-zinc-200 bg-white p-8 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-ajo-light">
        <span className="text-xl">🤝</span>
      </div>
      <h3 className="font-semibold text-zinc-800">No circles yet</h3>
      <p className="mt-1 text-sm text-zinc-500 max-w-xs mx-auto">
        Create a savings circle or join one with an invite link from a friend.
      </p>
      <div className="mt-5 flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/dashboard/circles/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-ajo px-5 py-2.5 text-sm font-semibold text-white hover:bg-ajo-dark transition-colors"
        >
          <PlusIcon /> Create Circle
        </Link>
        <Link
          href="/dashboard/join"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
        >
          <UsersIcon /> Join with Invite Code
        </Link>
      </div>
    </div>
  )
}

function CircleCard({ circle }: { circle: CircleRow }) {
  return (
    <Link
      href={`/dashboard/circles/${circle.id}`}
      className="group flex items-center gap-4 rounded-xl bg-white border border-zinc-100 shadow-sm hover:shadow-md hover:border-ajo-muted transition-all p-4"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ajo-light text-ajo font-bold text-sm">
        {circle.name.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-zinc-900 truncate group-hover:text-ajo transition-colors">
          {circle.name}
        </h3>
        <p className="text-xs text-zinc-400 mt-0.5">
          {formatCurrency(circle.contribution_amount)} · {frequencyLabel(circle.frequency)} · {circle.total_slots} members
        </p>
      </div>
      <div className="shrink-0">
        <ChevronRightIcon />
      </div>
    </Link>
  )
}

function PlusIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  )
}

function UsersIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg className="h-4 w-4 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  )
}
