import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

type ActivityItem = {
  key: string
  type: 'contribution' | 'joined' | 'payout'
  message: string
  time: string
  circleId: string
}

type CircleRef = { id: string; name: string }
type ProfileRef = { full_name: string | null; email: string | null }

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

interface ActivityFeedProps {
  circleIds: string[]
  userId: string
}

export async function ActivityFeed({ circleIds, userId }: ActivityFeedProps) {
  if (circleIds.length === 0) {
    return <EmptyActivity />
  }

  const supabase = await createClient()

  // All 4 queries fire at the same time
  const [membersResult, contribsResult, joinsResult, payoutsResult] =
    await Promise.all([
      supabase
        .from('circle_members')
        .select('id, profiles(full_name, email)')
        .in('circle_id', circleIds),

      supabase
        .from('contributions')
        .select('id, member_id, circle_id, paid_at, circles(id, name)')
        .in('circle_id', circleIds)
        .eq('status', 'paid')
        .order('paid_at', { ascending: false })
        .limit(15),

      supabase
        .from('circle_members')
        .select('id, profile_id, circle_id, joined_at, profiles(full_name, email), circles(id, name)')
        .in('circle_id', circleIds)
        .order('joined_at', { ascending: false })
        .limit(15),

      supabase
        .from('payout_slots')
        .select('id, member_id, circle_id, paid_at, circles(id, name)')
        .in('circle_id', circleIds)
        .eq('status', 'paid')
        .not('paid_at', 'is', null)
        .order('paid_at', { ascending: false })
        .limit(10),
    ])

  // Build member id → display name map
  const memberNameMap = new Map<string, string>()
  for (const m of membersResult.data ?? []) {
    const p = m.profiles as unknown as ProfileRef | null
    memberNameMap.set(m.id, p?.full_name || p?.email || 'Someone')
  }

  const items: ActivityItem[] = []

  // Contributions
  for (const c of contribsResult.data ?? []) {
    const circle = c.circles as unknown as CircleRef | null
    const name = memberNameMap.get(c.member_id) ?? 'Someone'
    items.push({
      key: `contrib-${c.id}`,
      type: 'contribution',
      message: `${name} paid their contribution in ${circle?.name ?? 'a circle'}`,
      time: c.paid_at as string,
      circleId: circle?.id ?? c.circle_id,
    })
  }

  // Member joins
  for (const j of joinsResult.data ?? []) {
    const circle = j.circles as unknown as CircleRef | null
    const p = j.profiles as unknown as ProfileRef | null
    const name = p?.full_name || p?.email || 'Someone'
    const isYou = j.profile_id === userId
    items.push({
      key: `join-${j.id}`,
      type: 'joined',
      message: isYou
        ? `You joined ${circle?.name ?? 'a circle'}`
        : `${name} joined ${circle?.name ?? 'a circle'}`,
      time: j.joined_at as string,
      circleId: circle?.id ?? j.circle_id,
    })
  }

  // Payouts released
  for (const p of payoutsResult.data ?? []) {
    const circle = p.circles as unknown as CircleRef | null
    const name = memberNameMap.get(p.member_id) ?? 'Someone'
    items.push({
      key: `payout-${p.id}`,
      type: 'payout',
      message: `Payout released to ${name} in ${circle?.name ?? 'a circle'}`,
      time: p.paid_at as string,
      circleId: circle?.id ?? p.circle_id,
    })
  }

  items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
  const recent = items.slice(0, 15)

  if (recent.length === 0) return <EmptyActivity />

  return (
    <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm divide-y divide-zinc-50">
      {recent.map((item) => (
        <Link
          key={item.key}
          href={`/dashboard/circles/${item.circleId}`}
          className="flex items-start gap-3 p-4 hover:bg-zinc-50 transition-colors"
        >
          <ActivityDot type={item.type} />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-zinc-700 leading-snug">{item.message}</p>
            <p className="text-xs text-zinc-400 mt-0.5">{timeAgo(item.time)}</p>
          </div>
        </Link>
      ))}
    </div>
  )
}

function EmptyActivity() {
  return (
    <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 text-center">
      <p className="text-sm text-zinc-400">No activity yet.</p>
      <p className="text-xs text-zinc-300 mt-1">
        Activity from your circles will appear here.
      </p>
    </div>
  )
}

function ActivityDot({ type }: { type: ActivityItem['type'] }) {
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
