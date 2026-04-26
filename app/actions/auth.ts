'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  let error: { message: string } | null = null

  try {
    const result = await supabase.auth.signInWithPassword({ email, password })
    error = result.error
  } catch (e) {
    console.error('[login] unexpected error:', e)
    const msg = e instanceof Error ? e.message : 'An unexpected error occurred'
    redirect(`/login?error=${encodeURIComponent(msg)}`)
  }

  if (error) {
    console.error('[login] auth error:', error.message)
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = ((formData.get('email') as string) ?? '').trim()
  const password = ((formData.get('password') as string) ?? '').trim()
  const fullName = ((formData.get('full_name') as string) ?? '').trim()

  if (!email || !password) {
    redirect(`/signup?error=${encodeURIComponent('Email and password are required')}`)
  }

  let userId: string | null = null
  let session: unknown = undefined
  let error: { message: string } | null = null

  try {
    const result = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    })
    userId = result.data?.user?.id ?? null
    session = result.data?.session ?? null
    error = result.error
  } catch (e) {
    console.error('[signup] unexpected error:', e)
    const msg = e instanceof Error ? e.message : 'An unexpected error occurred during sign up'
    redirect(`/signup?error=${encodeURIComponent(msg)}`)
  }

  if (error) {
    console.error('[signup] auth error:', error.message)
    redirect(`/signup?error=${encodeURIComponent(error.message)}`)
  }

  // Explicitly upsert a profiles row right after auth signup.
  // The DB trigger may do this too, but it can fail silently (e.g. race
  // conditions, trigger errors). Without a profile row, circle creation
  // fails with a foreign-key violation on circles.organizer_id.
  if (userId) {
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert(
        { id: userId, email, full_name: fullName || null },
        { onConflict: 'id', ignoreDuplicates: true }
      )

    if (profileError) {
      // Non-fatal — log it so it appears in Vercel function logs, but don't
      // block the user. The trigger may have already created the row.
      console.error('[signup] profile upsert error:', profileError.message)
    }
  }

  // Supabase returns a user but null session when email confirmation is required.
  // Rather than redirecting to /dashboard (where the proxy will bounce them back),
  // send them to a confirmation page so they know to check their email.
  if (!session) {
    redirect(`/signup/confirm?email=${encodeURIComponent(email)}`)
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function logout() {
  const supabase = await createClient()

  try {
    await supabase.auth.signOut()
  } catch (e) {
    console.error('[logout] unexpected error:', e)
  }

  revalidatePath('/', 'layout')
  redirect('/login')
}
