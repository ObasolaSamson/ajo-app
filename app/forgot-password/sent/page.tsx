import Link from 'next/link'

interface SentPageProps {
  searchParams: Promise<{ email?: string }>
}

export default async function ForgotPasswordSentPage({ searchParams }: SentPageProps) {
  const { email } = await searchParams
  const decoded = email ? decodeURIComponent(email) : null

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-bold text-ajo">Ajo</Link>
        </div>

        <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm px-8 py-10 text-center">
          {/* Email icon */}
          <div className="mb-6 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-ajo-light">
              <svg className="h-7 w-7 text-ajo" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
          </div>

          <h1 className="text-xl font-bold text-zinc-900 mb-2">Check your inbox</h1>

          {decoded ? (
            <>
              <p className="text-sm text-zinc-500">We sent a reset link to</p>
              <p className="mt-1 text-sm font-semibold text-zinc-800 mb-6">{decoded}</p>
            </>
          ) : (
            <p className="text-sm text-zinc-500 mb-6">
              If that email is registered, a reset link is on its way.
            </p>
          )}

          <p className="text-xs text-zinc-400 mb-8">
            The link expires in 1 hour. Check your spam folder if you don&apos;t see it.
          </p>

          <Link
            href="/login"
            className="inline-flex w-full items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
          >
            Back to sign in
          </Link>
        </div>

        <p className="mt-6 text-center text-xs text-zinc-400">
          Didn&apos;t get an email?{' '}
          <Link href="/forgot-password" className="font-medium text-ajo hover:text-ajo-dark transition-colors">
            Try again
          </Link>
        </p>
      </div>
    </div>
  )
}
