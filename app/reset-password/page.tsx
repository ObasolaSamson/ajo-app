import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ResetPasswordForm } from './ResetPasswordForm'

interface ResetPasswordPageProps {
  searchParams: Promise<{ error?: string; expired?: string }>
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const { error, expired } = await searchParams

  // If the auth callback flagged the link as expired, or if the user
  // has no active recovery session, show the expired-token state.
  const showExpiredState = expired === 'true'

  let hasSession = false
  if (!showExpiredState) {
    try {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      hasSession = !!user
    } catch {
      hasSession = false
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-bold text-ajo">Ajo</Link>
        </div>

        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm px-8 py-10">

          {/* ── Invalid / expired token ── */}
          {(showExpiredState || !hasSession) ? (
            <div className="text-center space-y-5">
              <div className="flex justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50">
                  <svg className="h-7 w-7 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-zinc-900 mb-2">Link invalid or expired</h1>
                <p className="text-sm text-zinc-500">
                  This password reset link has expired or has already been used.
                  Reset links are valid for 1 hour.
                </p>
              </div>
              <Link
                href="/forgot-password"
                className="inline-flex w-full items-center justify-center rounded-xl bg-ajo px-4 py-3 text-sm font-semibold text-white hover:bg-ajo-dark transition-colors"
              >
                Request a new reset link
              </Link>
              <Link
                href="/login"
                className="block text-sm text-zinc-400 hover:text-zinc-600 transition-colors"
              >
                Back to sign in
              </Link>
            </div>
          ) : (

          /* ── Valid session — show the form ── */
            <>
              <div className="mb-6 flex justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ajo-light">
                  <svg className="h-7 w-7 text-ajo" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                  </svg>
                </div>
              </div>

              <h1 className="text-xl font-bold text-zinc-900 text-center mb-1.5">Set a new password</h1>
              <p className="text-sm text-zinc-500 text-center mb-7">
                Choose a strong password you haven&apos;t used before.
              </p>

              <ResetPasswordForm serverError={error} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
