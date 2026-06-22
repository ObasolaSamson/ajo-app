import Link from 'next/link'
import { requestPasswordReset } from '@/app/actions/auth'
import { SubmitButton } from '@/app/components/SubmitButton'

interface ForgotPasswordPageProps {
  searchParams: Promise<{ error?: string }>
}

export default async function ForgotPasswordPage({ searchParams }: ForgotPasswordPageProps) {
  const { error } = await searchParams

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-bold text-ajo">Ajo</Link>
        </div>

        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm px-8 py-10">
          {/* Lock icon */}
          <div className="mb-6 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ajo-light">
              <svg className="h-7 w-7 text-ajo" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
          </div>

          <h1 className="text-xl font-bold text-zinc-900 text-center mb-1.5">Forgot your password?</h1>
          <p className="text-sm text-zinc-500 text-center mb-7">
            Enter your email and we&apos;ll send you a secure reset link.
          </p>

          {error && (
            <div className="mb-5 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
              {decodeURIComponent(error)}
            </div>
          )}

          <form action={requestPasswordReset} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-700 mb-1.5">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-ajo focus:bg-white focus:outline-none focus:ring-2 focus:ring-ajo/15 transition-all"
                placeholder="you@example.com"
              />
            </div>

            <SubmitButton
              pendingText="Sending link…"
              className="w-full rounded-xl bg-ajo px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-ajo/20 hover:bg-ajo-dark focus:outline-none focus:ring-2 focus:ring-ajo focus:ring-offset-2 transition-colors"
            >
              Send reset link
            </SubmitButton>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-zinc-500">
          Remembered it?{' '}
          <Link href="/login" className="font-semibold text-ajo hover:text-ajo-dark transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
