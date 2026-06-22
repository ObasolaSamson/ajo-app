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

/** Map raw Supabase auth error messages/codes to user-friendly copy + a short code. */
function friendlySignupError(
  raw: string,
  supabaseCode?: string,
  status?: number,
): { message: string; code: string } {
  const m = raw.toLowerCase()
  const sc = (supabaseCode ?? '').toLowerCase()

  // Email already in use — check message, supabase code, and HTTP status 422
  if (
    m.includes('already registered') ||
    m.includes('already exists') ||
    m.includes('email already') ||
    m.includes('user_already_exists') ||
    sc === 'user_already_exists' ||
    sc === 'email_exists' ||
    status === 422
  ) {
    return { message: 'An account with this email already exists. Please sign in instead.', code: 'email_in_use' }
  }
  if (m.includes('invalid email') || m.includes('unable to validate email') || sc === 'invalid_email') {
    return { message: 'Please enter a valid email address.', code: 'invalid_email' }
  }
  if (m.includes('password') && (m.includes('short') || m.includes('least') || m.includes('characters') || m.includes('weak'))) {
    return { message: 'Password must be at least 6 characters.', code: 'weak_password' }
  }
  if (m.includes('rate limit') || m.includes('too many') || sc.includes('over_email_send_rate_limit')) {
    return { message: 'Too many attempts. Please wait a moment and try again.', code: 'rate_limit' }
  }
  if (m.includes('network') || m.includes('fetch')) {
    return { message: 'Network error. Check your connection and try again.', code: 'network' }
  }
  return { message: raw, code: 'unknown' }
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
  let identities: unknown[] | null = null
  let error: { message: string; code?: string; status?: number } | null = null

  try {
    const result = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })

    // Log everything so the exact Supabase response is visible in server logs
    console.log('[signup] raw result.data.user.id:', result.data?.user?.id)
    console.log('[signup] raw result.data.user.identities:', JSON.stringify(result.data?.user?.identities))
    console.log('[signup] raw result.data.session:', result.data?.session ? 'present' : 'null')
    console.log('[signup] raw result.error:', JSON.stringify(result.error))

    userId = result.data?.user?.id ?? null
    session = result.data?.session ?? null
    identities = result.data?.user?.identities ?? null
    error = result.error
  } catch (e) {
    console.error('[signup] unexpected error:', e)
    const msg = e instanceof Error ? e.message : 'An unexpected error occurred during sign up'
    const params = new URLSearchParams({ error: msg, redirect: redirectTo })
    redirect(`/signup?${params}`)
  }

  if (error) {
    // Log the raw code and status so we can see exactly what Supabase sends
    console.error('[signup] auth error — message:', error.message, '| code:', error.code, '| status:', error.status)
    const { message, code } = friendlySignupError(error.message, error.code, error.status)
    const params = new URLSearchParams({ error: message, errorCode: code, redirect: redirectTo })
    redirect(`/signup?${params}`)
  }

  // Supabase silently "succeeds" for duplicate emails when email confirmation is
  // enabled (anti-enumeration protection). The tell: identities is an empty array.
  // A genuine new signup always has at least one identity entry.
  if (Array.isArray(identities) && identities.length === 0) {
    console.log('[signup] duplicate email detected via empty identities — email:', email)
    const params = new URLSearchParams({
      error: 'An account with this email already exists. Please sign in instead.',
      errorCode: 'email_in_use',
      redirect: redirectTo,
    })
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

export async function requestPasswordReset(formData: FormData) {
  const email = ((formData.get('email') as string) ?? '').trim()

  if (!email) {
    redirect(`/forgot-password?error=${encodeURIComponent('Please enter your email address')}`)
  }

  const supabase = await createClient()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  // The callback route exchanges the code for a session, then forwards to /reset-password
  const redirectTo = `${appUrl}/auth/callback?next=/reset-password`

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
    if (error) {
      console.error('[requestPasswordReset] error:', error.message)
    }
  } catch (e) {
    console.error('[requestPasswordReset] unexpected error:', e)
  }

  // Always show the success page — never reveal whether an address is registered
  redirect(`/forgot-password/sent?email=${encodeURIComponent(email)}`)
}

export async function resetPassword(formData: FormData) {
  const password = ((formData.get('password') as string) ?? '').trim()

  if (!password || password.length < 6) {
    redirect(`/reset-password?error=${encodeURIComponent('Password must be at least 6 characters')}`)
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    console.error('[resetPassword] error:', error.message)
    redirect(`/reset-password?error=${encodeURIComponent(error.message)}`)
  }

  // Sign out the recovery session so the user logs in fresh
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login?message=password_updated')
}
