import Link from 'next/link'

interface ConfirmPageProps {
  searchParams: Promise<{ email?: string; redirect?: string }>
}

export default async function ConfirmPage({ searchParams }: ConfirmPageProps) {
  const { email, redirect: redirectTo } = await searchParams
  const displayEmail = email ? decodeURIComponent(email) : 'your email address'

  const loginHref = redirectTo
    ? `/login?redirect=${encodeURIComponent(redirectTo)}`
    : '/login'

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6 py-16">
      <div className="w-full max-w-md text-center">
        <Link href="/" className="text-2xl font-bold text-ajo block mb-10">
          Ajo
        </Link>

        {/* Icon */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-ajo/10 border border-ajo/20">
          <svg
            className="h-8 w-8 text-ajo"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-zinc-900 mb-2">Check your inbox</h1>
        <p className="text-zinc-500 text-sm mb-1">
          We sent a confirmation link to
        </p>
        <p className="font-semibold text-zinc-800 text-sm mb-6">{displayEmail}</p>
        <p className="text-zinc-400 text-sm mb-8">
          Click the link in the email to activate your account, then come back here to sign in.
        </p>

        <div className="rounded-xl bg-amber-50 border border-amber-100 px-5 py-4 text-sm text-amber-800 text-left mb-8">
          <p className="font-semibold mb-1">Didn&apos;t receive it?</p>
          <p className="text-xs leading-relaxed">
            Check your spam folder. The email comes from{' '}
            <span className="font-mono">no-reply@mail.app.supabase.io</span>.
            It may take a minute or two.
          </p>
        </div>

        <Link
          href={loginHref}
          className="inline-flex items-center justify-center w-full rounded-xl bg-ajo px-4 py-3 text-sm font-semibold text-white hover:bg-ajo-dark transition-colors"
        >
          Go to sign in
        </Link>

        <div className="mt-5">
          <Link href="/" className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
