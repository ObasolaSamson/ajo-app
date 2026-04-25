import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

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

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

type ActivityItem = {
  key: string
  type: 'contribution' | 'joined' | 'payout'
  message: string
  time: string
  circleId: string
  circleName: string
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

type CircleRef = { id: string; name: string }
type ProfileRef = { full_name: string | null; email: string | null }

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const displayName =
    user.user_metadata?.full_name || user.email?.split('@')[0] || 'there'

  // Fetch circles the user is a member of
  const { data: memberships } = await supabase
    .from('circle_members')
    .select('circle_id, circles(*)')
    .eq('profile_id', user.id)
    .order('joined_at', { ascending: false })

  const circles = (memberships ?? []).map(
    (m) => m.circles as unknown as CircleRow
  )
  const circleIds = circles.map((c) => c.id)

  // ── Activity feed ────────────────────────────────────────────────────────────

  const activityItems: ActivityItem[] = []

  if (circleIds.length > 0) {
    // Build a member id → profile name map for all circles
    const { data: allMembers } = await supabase
      .from('circle_members')
      .select('id, profiles(full_name, email)')
      .in('circle_id', circleIds)

    const memberNameMap = new Map<string, string>()
    for (const m of allMembers ?? []) {
      const p = m.profiles as unknown as ProfileRef | null
      memberNameMap.set(m.id, p?.full_name || p?.email || 'Someone')
    }

    // 1. Recent contributions
    const { data: contribs } = await supabase
      .from('contributions')
      .select('id, member_id, circle_id, paid_at, circles(id, name)')
      .in('circle_id', circleIds)
      .eq('status', 'paid')
      .order('paid_at', { ascending: false })
      .limit(15)

    for (const c of contribs ?? []) {
      const circle = c.circles as unknown as CircleRef | null
      const name = memberNameMap.get(c.member_id) ?? 'Someone'
      activityItems.push({
        key: `contrib-${c.id}`,
        type: 'contribution',
        message: `${name} paid their contribution in ${circle?.name ?? 'a circle'}`,
        time: c.paid_at as string,
        circleId: circle?.id ?? c.circle_id,
        circleName: circle?.name ?? '',
      })
    }

    // 2. Recent member joins
    const { data: joins } = await supabase
      .from('circle_members')
      .select('id, profile_id, circle_id, joined_at, profiles(full_name, email), circles(id, name)')
      .in('circle_id', circleIds)
      .order('joined_at', { ascending: false })
      .limit(15)

    for (const j of joins ?? []) {
      const circle = j.circles as unknown as CircleRef | null
      const p = j.profiles as unknown as ProfileRef | null
      const name = p?.full_name || p?.email || 'Someone'
      const isYou = j.profile_id === user.id
      activityItems.push({
        key: `join-${j.id}`,
        type: 'joined',
        message: isYou
          ? `You joined ${circle?.name ?? 'a circle'}`
          : `${name} joined ${circle?.name ?? 'a circle'}`,
        time: j.joined_at as string,
        circleId: circle?.id ?? j.circle_id,
        circleName: circle?.name ?? '',
      })
    }

    // 3. Recent payout releases
    const { data: payouts } = await supabase
      .from('payout_slots')
      .select('id, member_id, circle_id, paid_at, circles(id, name)')
      .in('circle_id', circleIds)
      .eq('status', 'paid')
      .not('paid_at', 'is', null)
      .order('paid_at', { ascending: false })
      .limit(10)

    for (const p of payouts ?? []) {
      const circle = p.circles as unknown as CircleRef | null
      const name = memberNameMap.get(p.member_id) ?? 'Someone'
      activityItems.push({
        key: `payout-${p.id}`,
        type: 'payout',
        message: `Payout released to ${name} in ${circle?.name ?? 'a circle'}`,
        time: p.paid_at as string,
        circleId: circle?.id ?? p.circle_id,
        circleName: circle?.name ?? '',
      })
    }
  }

  // Sort all activity by time descending, take top 15
  activityItems.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
  const recentActivity = activityItems.slice(0, 15)

  // ─────────────────────────────────────────────────────────────────────────────

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
        {/* Left column — Circles */}
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
                <CircleCard key={circle.id as string} circle={circle} />
              ))}
            </div>
          )}
        </div>

        {/* Right column — Activity feed */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-zinc-900">Recent Activity</h2>
          <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm divide-y divide-zinc-50">
            {recentActivity.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-sm text-zinc-400">No activity yet.</p>
                <p className="text-xs text-zinc-300 mt-1">
                  Activity from your circles will appear here.
                </p>
              </div>
            ) : (
              recentActivity.map((item) => (
                <Link
                  key={item.key}
                  href={`/dashboard/circles/${item.circleId}`}
                  className="flex items-start gap-3 p-4 hover:bg-zinc-50 transition-colors"
                >
                  <ActivityIcon type={item.type} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-zinc-700 leading-snug">{item.message}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">{timeAgo(item.time)}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ActivityIcon({ type }: { type: ActivityItem['type'] }) {
  if (type === 'contribution') {
    return (
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ajo-light text-ajo">
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    )
  }
  if (type === 'joined') {
    return (
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-500">
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      </div>
    )
  }
  return (
    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-500">
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
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
