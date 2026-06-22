import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Handles OAuth / password-reset callbacks from Supabase.
 * Exchanges the short-lived `?code=` for a full session cookie,
 * then redirects to the `?next=` destination (default /dashboard).
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }

    console.error('[auth/callback] exchangeCodeForSession error:', error.message)
  }

  // Invalid or expired — let the reset-password page surface the friendly message
  return NextResponse.redirect(`${origin}/reset-password?expired=true`)
}
