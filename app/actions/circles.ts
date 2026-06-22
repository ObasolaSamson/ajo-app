'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Calculate the payout date for a given slot.
 * Uses local date arithmetic to avoid UTC-offset surprises.
 */
function calculatePayoutDate(startDate: string, frequency: string, slotNumber: number): string {
  const [y, m, d] = startDate.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  if (frequency === 'weekly') {
    date.setDate(date.getDate() + (slotNumber - 1) * 7)
  } else {
    date.setMonth(date.getMonth() + (slotNumber - 1))
  }
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
}

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
  const organizer_slot = parseInt((formData.get('organizer_slot') as string) ?? '', 10)
  const invite_code = Math.random().toString(36).substring(2, 10).toUpperCase()

  if (!name) {
    redirect(`/dashboard/circles/new?error=${encodeURIComponent('Circle name is required')}`)
  }
  if (isNaN(contribution_amount) || contribution_amount < 50) {
    redirect(`/dashboard/circles/new?error=${encodeURIComponent('Contribution amount must be at least $50')}`)
  }
  if (isNaN(total_slots) || total_slots < 2 || total_slots > 50) {
    redirect(`/dashboard/circles/new?error=${encodeURIComponent('Number of members must be between 2 and 50')}`)
  }
  if (isNaN(organizer_slot) || organizer_slot < 1 || organizer_slot > total_slots) {
    redirect(`/dashboard/circles/new?error=${encodeURIComponent('Please select your payout slot')}`)
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

  // Assign the organizer's chosen payout slot with calculated payout date
  const organizerPayoutDate = calculatePayoutDate(start_date, frequency, organizer_slot)

  console.log('[createCircle] inserting payout slot —', {
    circle_id: circle.id,
    member_id: member.id, // this is circle_members.id, not the user's profile id
    slot_number: organizer_slot,
    payout_date: organizerPayoutDate,
    status: 'pending',
  })

  // Use admin client so RLS on payout_slots never blocks the organizer's slot insert
  const admin = createAdminClient()
  const { error: slotError } = await admin.from('payout_slots').insert({
    circle_id: circle.id,
    member_id: member.id,   // circle_members.id — NOT the user's profile id
    slot_number: organizer_slot,
    payout_date: organizerPayoutDate,
    status: 'pending',
  })

  if (slotError) {
    console.error('[createCircle] payout_slots insert failed:', slotError.message, slotError.code)
    await supabase.from('circle_members').delete().eq('id', member.id)
    await supabase.from('circles').delete().eq('id', circle.id)
    redirect(`/dashboard/circles/new?error=${encodeURIComponent(slotError.message)}`)
  }

  console.log('[createCircle] payout slot saved — slot #' + organizer_slot + ' for circle', circle.id)

  revalidatePath('/dashboard')
  redirect(`/dashboard/circles/${circle.id}`)
}

export async function joinCircle(
  circleId: string,
  inviteCode: string,
  formData: FormData,
): Promise<{ error: string } | undefined> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const normalizedCode = inviteCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, '')

  // Verify circle exists — eq() is safe now that codes are always uppercase alphanumeric
  const { data: circle, error: circleError } = await supabase
    .from('circles')
    .select('id, total_slots, start_date, frequency')
    .eq('id', circleId)
    .eq('invite_code', normalizedCode)
    .single()

  if (circleError || !circle) {
    console.error(
      '[joinCircle] circle lookup failed — id:', circleId, 'code:', normalizedCode,
      '| error:', circleError?.code, circleError?.message,
      '| hint: PGRST116 = RLS blocking SELECT on circles table'
    )
    redirect(`/dashboard/join/${inviteCode}?error=${encodeURIComponent('Circle not found')}`)
  }

  // Check if already a member (maybeSingle never errors on zero rows)
  const { data: existing } = await supabase
    .from('circle_members')
    .select('id')
    .eq('circle_id', circleId)
    .eq('profile_id', user.id)
    .maybeSingle()

  if (existing) {
    redirect(`/dashboard/circles/${circleId}`)
  }

  // Count ALL current members.
  // If circle_members SELECT RLS only returns the current user's own rows,
  // this count will be wrong (0 instead of the real member count).
  // Fix: run the SQL in the comment block at the top of this file.
  const { count, error: countError } = await supabase
    .from('circle_members')
    .select('id', { count: 'exact', head: true })
    .eq('circle_id', circleId)

  if (countError) {
    console.error(
      '[joinCircle] member count failed — circleId:', circleId,
      '| error:', countError.code, countError.message,
      '| hint: PGRST116 = RLS blocking SELECT on circle_members table'
    )
  }

  const currentCount = count ?? 0

  if (currentCount >= circle.total_slots) {
    // Circle just became full — redirect so the page re-renders with the full state
    redirect(`/dashboard/join/${inviteCode}?error=${encodeURIComponent('This circle is full')}`)
  }

  // Validate chosen slot — return error so the client shows it inline
  const slotNumber = parseInt((formData.get('slot_number') as string) ?? '', 10)
  if (isNaN(slotNumber) || slotNumber < 1 || slotNumber > circle.total_slots) {
    return { error: 'Please select a valid payout slot' }
  }

  // Race-condition / RLS-safe slot check.
  // Must use the admin client here: the joining user is not yet a member, so
  // the regular (RLS-scoped) client returns null even when the slot IS taken,
  // letting two users claim the same slot simultaneously.
  const admin = createAdminClient()
  const { data: slotTaken, error: slotCheckError } = await admin
    .from('payout_slots')
    .select('id')
    .eq('circle_id', circleId)
    .eq('slot_number', slotNumber)
    .maybeSingle()

  if (slotCheckError) {
    console.error('[joinCircle] slot check error:', slotCheckError.message)
  }

  if (slotTaken) {
    return { error: 'Slot #' + slotNumber + ' is already taken — please choose another' }
  }

  console.log('[joinCircle] selected slot:', slotNumber, '| circle:', circleId)

  // Insert member
  const { data: member, error: joinError } = await supabase
    .from('circle_members')
    .insert({
      circle_id: circleId,
      profile_id: user.id,
      role: 'member',
      status: 'active',
    })
    .select('id')
    .single()

  if (joinError || !member) {
    console.error('[joinCircle] circle_members insert failed:', joinError?.message, joinError?.code)
    redirect(`/dashboard/join/${inviteCode}?error=${encodeURIComponent(joinError?.message ?? 'Failed to join')}`)
  }

  console.log('[joinCircle] member inserted — circle_members.id (member_id):', member.id)

  // Insert payout slot.
  // Use the admin client so RLS on payout_slots never blocks the insert —
  // the same reason we use admin for the pre-insert slot check above.
  const payoutDate = calculatePayoutDate(circle.start_date, circle.frequency, slotNumber)
  const { data: slotData, error: slotInsertError } = await admin
    .from('payout_slots')
    .insert({
      circle_id: circleId,
      member_id: member.id,   // circle_members.id — NOT the user's profile id
      slot_number: slotNumber,
      payout_date: payoutDate,
      status: 'pending',
    })
    .select()
    .single()

  console.log('[joinCircle] payout_slots insert result — data:', slotData, '| error:', slotInsertError?.message, slotInsertError?.code)

  if (slotInsertError) {
    // Rollback the circle_members row so the user can try again
    await supabase.from('circle_members').delete().eq('id', member.id)
    console.error('[joinCircle] payout_slots insert failed — rolled back member row')
    return { error: 'Slot #' + slotNumber + ' was just taken — please choose another' }
  }

  revalidatePath('/dashboard', 'layout')          // bust all dashboard routes
  revalidatePath(`/dashboard/circles/${circleId}`) // bust the specific circle page
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

export async function deleteCircle(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const circleId = formData.get('circle_id') as string

  // Verify the caller is the organizer before doing anything destructive
  const { data: circle } = await supabase
    .from('circles')
    .select('id, organizer_id, name')
    .eq('id', circleId)
    .single()

  if (!circle) redirect('/dashboard')
  if (circle.organizer_id !== user.id) redirect(`/dashboard/circles/${circleId}`)

  // Delete child records first so the action works even without CASCADE FK constraints.
  // Order: contributions → payout_slots → circle_members → circles
  await supabase.from('contributions').delete().eq('circle_id', circleId)
  await supabase.from('payout_slots').delete().eq('circle_id', circleId)
  await supabase.from('circle_members').delete().eq('circle_id', circleId)

  const { error } = await supabase.from('circles').delete().eq('id', circleId)

  if (error) {
    console.error('[deleteCircle] failed to delete circle:', error.message)
    redirect(`/dashboard/circles/${circleId}?error=${encodeURIComponent('Failed to delete circle: ' + error.message)}`)
  }

  revalidatePath('/dashboard', 'layout')
  redirect('/dashboard')
}
