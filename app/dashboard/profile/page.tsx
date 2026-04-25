import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { updateProfile } from '@/app/actions/profile'
import { logout } from '@/app/actions/auth'

interface ProfilePageProps {
  searchParams: Promise<{ error?: string; saved?: string }>
}

const inputClass =
  'w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-ajo focus:outline-none focus:ring-2 focus:ring-ajo/20 transition-colors'

const labelClass = 'block text-sm font-medium text-zinc-700 mb-1'

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const { error, saved } = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email, phone')
    .eq('id', user.id)
    .single()

  const fullName = profile?.full_name ?? user.user_metadata?.full_name ?? ''
  const email = profile?.email ?? user.email ?? ''
  const phone = profile?.phone ?? ''

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Profile Settings</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Manage your account information.
        </p>
      </div>

      {/* Avatar placeholder */}
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-ajo flex items-center justify-center text-white text-2xl font-bold select-none">
          {(fullName || email).charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-zinc-900">{fullName || 'No name set'}</p>
          <p className="text-sm text-zinc-400">{email}</p>
        </div>
      </div>

      {/* Feedback banners */}
      {saved && (
        <div className="rounded-lg bg-ajo-light border border-ajo-muted px-4 py-3 text-sm text-ajo font-medium">
          Profile saved successfully.
        </div>
      )}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {decodeURIComponent(error)}
        </div>
      )}

      {/* Edit form */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 sm:p-8">
        <h2 className="font-semibold text-zinc-900 mb-5">Personal Information</h2>
        <form action={updateProfile} className="space-y-5">
          <div>
            <label htmlFor="full_name" className={labelClass}>
              Full name
            </label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              defaultValue={fullName}
              autoComplete="name"
              className={inputClass}
              placeholder="Your full name"
            />
          </div>

          <div>
            <label htmlFor="email" className={labelClass}>
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              readOnly
              disabled
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-400 cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-zinc-400">Email cannot be changed here.</p>
          </div>

          <div>
            <label htmlFor="phone" className={labelClass}>
              Phone number <span className="text-zinc-400 font-normal">(optional)</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={phone}
              autoComplete="tel"
              className={inputClass}
              placeholder="+1 555 000 0000"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-ajo px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-ajo-dark focus:outline-none focus:ring-2 focus:ring-ajo focus:ring-offset-2 transition-colors"
          >
            Save Changes
          </button>
        </form>
      </div>

      {/* Danger zone */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6">
        <h2 className="font-semibold text-zinc-900 mb-1">Account</h2>
        <p className="text-sm text-zinc-500 mb-4">
          Sign out of your account on this device.
        </p>
        <form action={logout}>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
          >
            <LogoutIcon /> Sign out
          </button>
        </form>
      </div>
    </div>
  )
}

function LogoutIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  )
}
