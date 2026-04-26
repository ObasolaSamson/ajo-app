import Link from 'next/link'
import { signup } from '@/app/actions/auth'
import { SubmitButton } from '@/app/components/SubmitButton'

interface SignupPageProps {
  searchParams: Promise<{ error?: string }>
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const { error } = await searchParams

  return (
    <div className="min-h-screen flex">
      {/* Left — brand panel (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-[#0B1512] px-12 py-12 relative overflow-hidden">
        {/* Background glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-20 -left-20 h-96 w-96 rounded-full bg-ajo/20 blur-[100px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 right-0 h-64 w-64 rounded-full bg-ajo/10 blur-[80px]"
        />

        {/* Logo */}
        <Link href="/" className="relative text-2xl font-bold text-white tracking-tight">
          Ajo
        </Link>

        {/* Steps preview */}
        <div className="relative space-y-6">
          <h2 className="text-3xl font-bold text-white leading-snug mb-6">
            Get your circle<br />running today.
          </h2>

          {[
            { n: '1', text: 'Create a circle and set the rules' },
            { n: '2', text: 'Invite people you trust' },
            { n: '3', text: 'Everyone contributes and takes turns winning' },
          ].map((step) => (
            <div key={step.n} className="flex items-start gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ajo text-white text-xs font-bold">
                {step.n}
              </div>
              <p className="text-sm text-zinc-300 pt-1.5 leading-relaxed">{step.text}</p>
            </div>
          ))}
        </div>

        <p className="relative text-xs text-zinc-600">
          © {new Date().getFullYear()} Ajo App · Free forever
        </p>
      </div>

      {/* Right — form panel */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 bg-white sm:px-12 lg:px-16">
        {/* Mobile logo */}
        <div className="mb-8 lg:hidden">
          <Link href="/" className="text-2xl font-bold text-ajo">Ajo</Link>
        </div>

        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-zinc-900">Create your account</h1>
            <p className="mt-1.5 text-sm text-zinc-500">
              Free forever. No credit card required.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
              {decodeURIComponent(error)}
            </div>
          )}

          <form action={signup} className="space-y-5">
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-zinc-700 mb-1.5">
                Full name
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                autoComplete="name"
                required
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-ajo focus:bg-white focus:outline-none focus:ring-2 focus:ring-ajo/15 transition-all"
                placeholder="Ada Okafor"
              />
            </div>

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

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-zinc-700 mb-1.5">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-ajo focus:bg-white focus:outline-none focus:ring-2 focus:ring-ajo/15 transition-all"
                placeholder="••••••••"
              />
              <p className="mt-1.5 text-xs text-zinc-400">Minimum 6 characters</p>
            </div>

            <SubmitButton
              pendingText="Creating account…"
              className="w-full rounded-xl bg-ajo px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-ajo/20 hover:bg-ajo-dark focus:outline-none focus:ring-2 focus:ring-ajo focus:ring-offset-2 transition-colors"
            >
              Create account
            </SubmitButton>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-500">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-ajo hover:text-ajo-dark transition-colors">
              Sign in
            </Link>
          </p>

          <div className="mt-6 pt-6 border-t border-zinc-100 text-center">
            <Link href="/" className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
