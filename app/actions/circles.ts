'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { nanoid } from 'nanoid'
import { createClient } from '@/lib/supabase/server'

export async function createCircle(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Ensure a profile row exists before inserting the circle.
  // Without this the circles.organizer_id foreign key fails when the
  // DB trigger hasn't run yet (e.g. first sign-in on a fresh deploy).
  await supabase
    .from('profiles')
    .upsert(
      { id: user.id, email: user.email ?? '', full_name: user.user_metadata?.full_name ?? null },
      { onConflict: 'id', ignoreDuplicates: true }
    )

  const name = ((formData.get('name') as string) ?? '').trim()
  const description = ((formData.get('description') as string) ?? '').trim()

  // Strip any non-numeric characters (e.g. "$", ",", spaces) before parsing.
  const rawAmount = (formData.get('contribution_amount') as string) ?? ''
  const contribution_amount = parseFloat(rawAmount.replace(/[^0-9.]/g, ''))

  const frequency = formData.get('frequency') as string
  const total_slots = parseInt(formData.get('max_members') as string, 10)
  const start_date = formData.get('start_date') as string
  const invite_code = nanoid(8).toUpperCase()

  if (!name) {
    redirect(`/dashboard/circles/new?error=${encodeURIComponent('Circle name is required')}`)
  }
  if (isNaN(contribution_amount) || contribution_amount < 50) {
    redirect(`/dashboard/circles/new?error=${encodeURIComponent('Contribution amount must be at least $50')}`)
  }
  if (isNaN(total_slots) || total_slots < 2 || total_slots > 50) {
    redirect(`/dashboard/circles/new?error=${encodeURIComponent('Number of members must be between 2 and 50')}`)
  }

  const { data: circle, error } = await supabase
    .from('circles')
    .insert({
      name,
      description,
      contribution_amount,
      frequency,
      total_slots,
      start_date,
      invite_code,
      organizer_id: user.id,
      current_round: 1,
    })
    .select()
    .single()

  if (error || !circle) {
    redirect(`/dashboard/circles/new?error=${encodeURIComponent(error?.message ?? 'Failed to create circle')}`)
  }

  // Add creator as first member
  const { data: member, error: memberError } = await supabase
    .from('circle_members')
    .insert({
      circle_id: circle.id,
      profile_id: user.id,
      role: 'organizer',
      status: 'active',
    })
    .select()
    .single()

  if (memberError || !member) {
    await supabase.from('circles').delete().eq('id', circle.id)
    redirect(`/dashboard/circles/new?error=${encodeURIComponent(memberError?.message ?? 'Failed to add member')}`)
  }

  // Assign payout slot #1 to the creator
  const { error: slotError } = await supabase.from('payout_slots').insert({
    circle_id: circle.id,
    member_id: member.id,
    slot_number: 1,
    status: 'pending',
  })

  if (slotError) {
    await supabase.from('circle_members').delete().eq('id', member.id)
    await supabase.from('circles').delete().eq('id', circle.id)
    redirect(`/dashboard/circles/new?error=${encodeURIComponent(slotError.message)}`)
  }

  revalidatePath('/dashboard')
  redirect(`/dashboard/circles/${circle.id}`)
}

export async function joinCircle(circleId: string, inviteCode: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const normalizedCode = inviteCode.trim().toUpperCase()

  // Verify circle exists — use ilike so any casing difference never blocks a join
  const { data: circle, error: circleError } = await supabase
    .from('circles')
    .select('id, total_slots')
    .eq('id', circleId)
    .ilike('invite_code', normalizedCode)
    .single()

  if (circleError || !circle) {
    redirect(`/dashboard/join/${inviteCode}?error=${encodeURIComponent('Circle not found')}`)
  }

  // Check if already a member
  const { data: existing } = await supabase
    .from('circle_members')
    .select('id')
    .eq('circle_id', circleId)
    .eq('profile_id', user.id)
    .single()

  if (existing) {
    redirect(`/dashboard/circles/${circleId}`)
  }

  // Count current members to assign next slot
  const { count } = await supabase
    .from('circle_members')
    .select('id', { count: 'exact', head: true })
    .eq('circle_id', circleId)

  const currentCount = count ?? 0

  if (currentCount >= circle.total_slots) {
    redirect(`/dashboard/join/${inviteCode}?error=${encodeURIComponent('This circle is full')}`)
  }

  // Insert member
  const { data: member, error: joinError } = await supabase
    .from('circle_members')
    .insert({
      circle_id: circleId,
      profile_id: user.id,
      role: 'member',
      status: 'active',
    })
    .select()
    .single()

  if (joinError || !member) {
    redirect(`/dashboard/join/${inviteCode}?error=${encodeURIComponent(joinError?.message ?? 'Failed to join')}`)
  }

  // Assign next payout slot
  await supabase.from('payout_slots').insert({
    circle_id: circleId,
    member_id: member.id,
    slot_number: currentCount + 1,
    status: 'pending',
  })

  revalidatePath('/dashboard')
  revalidatePath(`/dashboard/circles/${circleId}`)
  redirect(`/dashboard/circles/${circleId}`)
}

export async function markAsPaid(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const circle_id = formData.get('circle_id') as string
  const member_id = formData.get('member_id') as string
  const round_number = parseInt(formData.get('round_number') as string, 10)
  const amount = parseFloat(formData.get('amount') as string)

  // Verify caller is the organizer
  const { data: circle } = await supabase
    .from('circles')
    .select('organizer_id')
    .eq('id', circle_id)
    .single()

  if (!circle || circle.organizer_id !== user.id) {
    redirect(`/dashboard/circles/${circle_id}`)
  }

  // Idempotency — skip if already recorded
  const { data: existing } = await supabase
    .from('contributions')
    .select('id')
    .eq('circle_id', circle_id)
    .eq('member_id', member_id)
    .eq('round_number', round_number)
    .single()

  if (!existing) {
    const { error } = await supabase.from('contributions').insert({
      circle_id,
      member_id,
      round_number,
      amount,
      status: 'paid',
      paid_at: new Date().toISOString(),
    })

    if (error) {
      redirect(`/dashboard/circles/${circle_id}?error=${encodeURIComponent(error.message)}`)
    }
  }

  revalidatePath(`/dashboard/circles/${circle_id}`)
  redirect(`/dashboard/circles/${circle_id}`)
}

export async function releasePayout(circleId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: circle } = await supabase
    .from('circles')
    .select('organizer_id, current_round, total_slots')
    .eq('id', circleId)
    .single()

  if (!circle || circle.organizer_id !== user.id) {
    redirect(`/dashboard/circles/${circleId}`)
  }

  const currentRound: number = circle.current_round ?? 1

  // Mark the payout slot for this round as paid
  await supabase
    .from('payout_slots')
    .update({ status: 'paid', paid_at: new Date().toISOString() })
    .eq('circle_id', circleId)
    .eq('slot_number', currentRound)

  // Advance to the next round
  await supabase
    .from('circles')
    .update({ current_round: currentRound + 1 })
    .eq('id', circleId)

  revalidatePath(`/dashboard/circles/${circleId}`)
  revalidatePath('/dashboard')
  redirect(`/dashboard/circles/${circleId}`)
}
