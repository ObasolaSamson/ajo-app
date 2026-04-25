import Link from 'next/link'

interface ConfirmPageProps {
  searchParams: Promise<{ email?: string }>
}

export default async function ConfirmPage({ searchParams }: ConfirmPageProps) {
  const { email } = await searchParams
  const displayEmail = email ? decodeURIComponent(email) : 'your email address'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-emerald-700 tracking-tight">Ajo</h1>
          <p className="mt-2 text-zinc-500 text-sm">Your rotating savings circle</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
            <MailIcon />
          </div>

          <h2 className="text-2xl font-semibold text-zinc-800 mb-2">Check your email</h2>
          <p className="text-zinc-500 text-sm mb-6">
            We sent a confirmation link to{' '}
            <span className="font-medium text-zinc-700">{displayEmail}</span>.
            Click the link in that email to activate your account.
          </p>

          <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800 text-left mb-6">
            <strong>Didn&apos;t get it?</strong> Check your spam folder. The email comes from{' '}
            <span className="font-mono">no-reply@mail.app.supabase.io</span>.
          </div>

          <p className="text-sm text-zinc-500">
            Already confirmed?{' '}
            <Link href="/login" className="font-medium text-emerald-600 hover:text-emerald-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

function MailIcon() {
  return (
    <svg
      className="h-7 w-7 text-emerald-600"
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
  )
}
