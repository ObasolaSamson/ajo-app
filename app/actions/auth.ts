'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

/** Only allow relative, same-origin paths to prevent open-redirect attacks. */
function safeRedirect(value: FormDataEntryValue | null): string {
  if (typeof value !== 'string') return '/dashboard'
  if (!value.startsWith('/') || value.startsWith('//')) return '/dashboard'
  return value
}

export async function login(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const redirectTo = safeRedirect(formData.get('redirect'))

  let error: { message: string } | null = null

  try {
    const result = await supabase.auth.signInWithPassword({ email, password })
    error = result.error
  } catch (e) {
    console.error('[login] unexpected error:', e)
    const msg = e instanceof Error ? e.message : 'An unexpected error occurred'
    const params = new URLSearchParams({ error: msg, redirect: redirectTo })
    redirect(`/login?${params}`)
  }

  if (error) {
    console.error('[login] auth error:', error.message)
    const params = new URLSearchParams({ error: error.message, redirect: redirectTo })
    redirect(`/login?${params}`)
  }

  revalidatePath('/', 'layout')
  redirect(redirectTo)
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = ((formData.get('email') as string) ?? '').trim()
  const password = ((formData.get('password') as string) ?? '').trim()
  const fullName = ((formData.get('full_name') as string) ?? '').trim()
  const redirectTo = safeRedirect(formData.get('redirect'))

  if (!email || !password) {
    const params = new URLSearchParams({
      error: 'Email and password are required',
      redirect: redirectTo,
    })
    redirect(`/signup?${params}`)
  }

  let userId: string | null = null
  let session: unknown = undefined
  let error: { message: string } | null = null

  try {
    const result = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    userId = result.data?.user?.id ?? null
    session = result.data?.session ?? null
    error = result.error
  } catch (e) {
    console.error('[signup] unexpected error:', e)
    const msg = e instanceof Error ? e.message : 'An unexpected error occurred during sign up'
    const params = new URLSearchParams({ error: msg, redirect: redirectTo })
    redirect(`/signup?${params}`)
  }

  if (error) {
    console.error('[signup] auth error:', error.message)
    const params = new URLSearchParams({ error: error.message, redirect: redirectTo })
    redirect(`/signup?${params}`)
  }

  // Explicitly upsert a profiles row right after auth signup so the
  // circles.organizer_id foreign key never fails.
  if (userId) {
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert(
        { id: userId, email, full_name: fullName || null },
        { onConflict: 'id', ignoreDuplicates: true }
      )

    if (profileError) {
      console.error('[signup] profile upsert error:', profileError.message)
    }
  }

  // Email confirmation required — session is null.
  // Pass the redirect along so the confirm page can surface it to the user.
  if (!session) {
    const params = new URLSearchParams({ email })
    if (redirectTo !== '/dashboard') params.set('redirect', redirectTo)
    redirect(`/signup/confirm?${params}`)
  }

  revalidatePath('/', 'layout')
  redirect(redirectTo)
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
