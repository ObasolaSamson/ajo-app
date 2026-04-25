import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { CopyButton } from '@/app/components/CopyButton'
import { EmailInviteFormClient } from '@/app/components/EmailInviteForm'

interface InvitePageProps {
  params: Promise<{ id: string }>
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch circle
  const { data: circle } = await supabase
    .from('circles')
    .select('*')
    .eq('id', id)
    .single()

  if (!circle) notFound()

  const isOrganizer = circle.organizer_id === user.id

  // Membership check and full member list fire in parallel
  const [membershipResult, membersResult] = await Promise.all([
    supabase
      .from('circle_members')
      .select('id, role')
      .eq('circle_id', id)
      .eq('profile_id', user.id)
      .single(),
    supabase
      .from('circle_members')
      .select('*, profiles(full_name, email)')
      .eq('circle_id', id)
      .order('joined_at', { ascending: true }),
  ])

  if (!membershipResult.data) redirect(`/dashboard/circles/${id}`)

  const members = membersResult.data

  const memberList = members ?? []
  const activeMembers = memberList.filter((m) => m.status === 'active')
  const pendingMembers = memberList.filter((m) => m.status === 'pending')

  // Build the full invite URL from the request host
  const headersList = await headers()
  const host = headersList.get('host') ?? 'localhost:3000'
  const protocol = host.startsWith('localhost') ? 'http' : 'https'
  const inviteUrl = `${protocol}://${host}/dashboard/join/${circle.invite_code}`

  const emailSubject = encodeURIComponent(`Join my savings circle: ${circle.name}`)
  const emailBody = encodeURIComponent(
    `Hi,\n\nI'd like to invite you to join my savings circle "${circle.name}" on Ajo.\n\nClick the link below to join:\n${inviteUrl}\n\nSee you there!`
  )

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back */}
      <Link
        href={`/dashboard/circles/${id}`}
        className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-800 transition-colors"
      >
        <ChevronLeftIcon /> Back to circle
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Invite Members</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Share your invite link or send an email invite to bring people into{' '}
          <span className="font-medium text-zinc-700">{circle.name}</span>.
        </p>
      </div>

      {/* Invite link card */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ajo-light">
            <LinkIcon />
          </div>
          <h2 className="font-semibold text-zinc-900">Invite Link</h2>
        </div>
        <p className="text-sm text-zinc-500 mb-4">
          Anyone with this link can request to join your circle.
          Share it in a group chat, WhatsApp, or anywhere you like.
        </p>

        {/* URL display + copy */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-600 font-mono overflow-x-auto whitespace-nowrap">
            {inviteUrl}
          </div>
          <CopyButton
            text={inviteUrl}
            label="Copy link"
            className="shrink-0 inline-flex items-center justify-center gap-1.5 rounded-lg bg-ajo px-4 py-2.5 text-sm font-semibold text-white hover:bg-ajo-dark transition-colors"
          />
        </div>

        {/* Invite code badge */}
        <div className="mt-4 flex items-center gap-3">
          <span className="text-xs text-zinc-400">Invite code:</span>
          <div className="flex items-center gap-2">
            <code className="rounded-md bg-zinc-100 px-2.5 py-1 text-sm font-mono font-semibold text-zinc-700 tracking-widest">
              {circle.invite_code}
            </code>
            <CopyButton
              text={circle.invite_code}
              label="Copy code"
              className="text-xs text-ajo hover:text-ajo-dark font-medium transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Email invite */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ajo-light">
            <MailIcon />
          </div>
          <h2 className="font-semibold text-zinc-900">Share via Email</h2>
        </div>
        <p className="text-sm text-zinc-500 mb-4">
          Enter an email address to open a pre-filled invite in your mail app.
        </p>

        <EmailInviteFormClient emailSubject={emailSubject} emailBody={emailBody} />
      </div>

      {/* Member list */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6">
        <h2 className="font-semibold text-zinc-900 mb-4">
          Members
          <span className="ml-2 text-sm font-normal text-zinc-400">
            {memberList.length} of {circle.total_slots}
          </span>
        </h2>

        {activeMembers.length > 0 && (
          <div className="mb-5">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">
              Active ({activeMembers.length})
            </p>
            <ul className="space-y-2">
              {activeMembers.map((m) => {
                const profile = m.profiles as { full_name?: string; email?: string } | null
                const name = profile?.full_name || profile?.email || 'Member'
                const isOrg = m.role === 'organizer'
                const isYou = m.profile_id === user.id

                return (
                  <li key={m.id} className="flex items-center gap-3 rounded-lg bg-zinc-50 p-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ajo text-white text-xs font-bold">
                      {name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-800 truncate">
                        {name}
                        {isYou && (
                          <span className="ml-2 text-xs text-zinc-400 font-normal">(you)</span>
                        )}
                      </p>
                      {profile?.email && profile.full_name && (
                        <p className="text-xs text-zinc-400 truncate">{profile.email}</p>
                      )}
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      {isOrg && (
                        <span className="inline-flex items-center rounded-full bg-zinc-800 px-2 py-0.5 text-xs font-medium text-white">
                          Organizer
                        </span>
                      )}
                      <span className="inline-flex items-center rounded-full bg-ajo-light px-2 py-0.5 text-xs font-medium text-ajo">
                        Active
                      </span>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        {pendingMembers.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">
              Pending ({pendingMembers.length})
            </p>
            <ul className="space-y-2">
              {pendingMembers.map((m) => {
                const profile = m.profiles as { full_name?: string; email?: string } | null
                const name = profile?.full_name || profile?.email || 'Member'

                return (
                  <li key={m.id} className="flex items-center gap-3 rounded-lg bg-zinc-50 p-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-zinc-500 text-xs font-bold">
                      {name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-700 truncate">{name}</p>
                    </div>
                    <span className="shrink-0 inline-flex items-center rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-xs font-medium text-amber-700">
                      Pending
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        {memberList.length === 0 && (
          <p className="text-sm text-zinc-400">No members yet.</p>
        )}

        {memberList.length < circle.total_slots && isOrganizer && (
          <p className="mt-4 text-center text-xs text-zinc-400">
            {circle.total_slots - memberList.length} spot
            {circle.total_slots - memberList.length > 1 ? 's' : ''} remaining
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

function LinkIcon() {
  return (
    <svg className="h-4 w-4 text-ajo" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg className="h-4 w-4 text-ajo" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  )
}
