import Link from 'next/link'
import { logout } from '@/app/actions/auth'

interface NavbarProps {
  userName?: string
}

export default function Navbar({ userName }: NavbarProps) {
  return (
    <header className="bg-white border-b border-zinc-100 sticky top-0 z-10">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Brand */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-ajo tracking-tight">Ajo</span>
        </Link>

        {/* Nav links — desktop */}
        <nav className="hidden sm:flex items-center gap-1">
          <NavLink href="/dashboard" label="Dashboard">
            <HomeIcon />
          </NavLink>
          <NavLink href="/dashboard/profile" label="Profile">
            <UserIcon />
          </NavLink>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {userName && (
            <span className="hidden sm:block text-sm text-zinc-400 max-w-[140px] truncate">
              {userName}
            </span>
          )}

          {/* Mobile nav icons */}
          <div className="flex sm:hidden items-center gap-1">
            <MobileNavLink href="/dashboard" label="Home">
              <HomeIcon />
            </MobileNavLink>
            <MobileNavLink href="/dashboard/profile" label="Profile">
              <UserIcon />
            </MobileNavLink>
          </div>

          <form action={logout}>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
            >
              <LogoutIcon />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </form>
        </div>
      </div>
    </header>
  )
}

function NavLink({
  href,
  label,
  children,
}: {
  href: string
  label: string
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
    >
      {children}
      {label}
    </Link>
  )
}

function MobileNavLink({
  href,
  label,
  children,
}: {
  href: string
  label: string
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
    >
      {children}
    </Link>
  )
}

function HomeIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )
}

function LogoutIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  )
}
