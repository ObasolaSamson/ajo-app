import Link from 'next/link'
import { login } from '@/app/actions/auth'
import { SubmitButton } from '@/app/components/SubmitButton'

interface LoginPageProps {
  searchParams: Promise<{ error?: string; redirect?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error, redirect: redirectTo } = await searchParams

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

        {/* Quote */}
        <div className="relative">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-ajo/20 border border-ajo/30">
            <svg className="h-6 w-6 text-ajo" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-white leading-snug mb-3">
            Save together,<br />win together.
          </h2>
          <p className="text-zinc-400 text-sm leading-relaxed max-w-xs">
            Your savings circle is waiting. Sign in to track contributions,
            see payouts, and manage your circles.
          </p>

          {/* Mini stat bar */}
          <div className="mt-8 flex gap-6">
            <div>
              <p className="text-xl font-bold text-white">$2.4M</p>
              <p className="text-xs text-zinc-500 mt-0.5">Paid out</p>
            </div>
            <div className="w-px bg-white/10" />
            <div>
              <p className="text-xl font-bold text-white">500+</p>
              <p className="text-xs text-zinc-500 mt-0.5">Active members</p>
            </div>
            <div className="w-px bg-white/10" />
            <div>
              <p className="text-xl font-bold text-white">0</p>
              <p className="text-xs text-zinc-500 mt-0.5">Fees, ever</p>
            </div>
          </div>
        </div>

        <p className="relative text-xs text-zinc-600">
          © {new Date().getFullYear()} Ajo App
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
            <h1 className="text-2xl font-bold text-zinc-900">Welcome back</h1>
            <p className="mt-1.5 text-sm text-zinc-500">
              Sign in to your account to continue.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-700">
              {decodeURIComponent(error)}
            </div>
          )}

          <form action={login} className="space-y-5">
            {redirectTo && (
              <input type="hidden" name="redirect" value={redirectTo} />
            )}
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
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-zinc-700">
                  Password
                </label>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-ajo focus:bg-white focus:outline-none focus:ring-2 focus:ring-ajo/15 transition-all"
                placeholder="••••••••"
              />
            </div>

            <SubmitButton
              pendingText="Signing in…"
              className="w-full rounded-xl bg-ajo px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-ajo/20 hover:bg-ajo-dark focus:outline-none focus:ring-2 focus:ring-ajo focus:ring-offset-2 transition-colors"
            >
              Sign in
            </SubmitButton>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-500">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-semibold text-ajo hover:text-ajo-dark transition-colors">
              Create one free
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
