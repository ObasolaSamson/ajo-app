'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { signup } from '@/app/actions/auth'

interface SignupFormProps {
  redirectTo?: string
  serverError?: string
  errorCode?: string
}

const inputClass =
  'w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-ajo focus:bg-white focus:outline-none focus:ring-2 focus:ring-ajo/15 transition-all'

export function SignupForm({ redirectTo, serverError, errorCode }: SignupFormProps) {
  const [isPending, startTransition] = useTransition()
  const [passwordError, setPasswordError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  function handleAction(formData: FormData) {
    const password = formData.get('password') as string
    const confirm = formData.get('confirm_password') as string

    if (password !== confirm) {
      setPasswordError('Passwords do not match')
      return
    }

    setPasswordError('')
    startTransition(async () => {
      await signup(formData)
    })
  }

  const isEmailInUse = errorCode === 'email_in_use'

  return (
    <div className="space-y-5">
      {/* Server-side error banner */}
      {serverError && (
        <div className={`rounded-xl border px-4 py-3 text-sm ${isEmailInUse ? 'bg-amber-50 border-amber-100 text-amber-800' : 'bg-red-50 border-red-100 text-red-700'}`}>
          <p>{serverError}</p>
          {isEmailInUse && (
            <p className="mt-1.5">
              <Link
                href={redirectTo ? `/login?redirect=${encodeURIComponent(redirectTo)}` : '/login'}
                className="font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity"
              >
                Log in instead →
              </Link>
            </p>
          )}
        </div>
      )}

      <form action={handleAction} className="space-y-5">
        {redirectTo && (
          <input type="hidden" name="redirect" value={redirectTo} />
        )}

        {/* Full name */}
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
            className={inputClass}
            placeholder="Ada Okafor"
          />
        </div>

        {/* Email */}
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
            className={inputClass}
            placeholder="you@example.com"
          />
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-zinc-700 mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              minLength={6}
              className={`${inputClass} pr-11`}
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-0 flex items-center px-3.5 text-zinc-400 hover:text-zinc-600 transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          <p className="mt-1.5 text-xs text-zinc-400">Minimum 6 characters</p>
        </div>

        {/* Confirm password */}
        <div>
          <label htmlFor="confirm_password" className="block text-sm font-medium text-zinc-700 mb-1.5">
            Confirm password
          </label>
          <div className="relative">
            <input
              id="confirm_password"
              name="confirm_password"
              type={showConfirm ? 'text' : 'password'}
              autoComplete="new-password"
              required
              className={`${inputClass} pr-11 ${passwordError ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : ''}`}
              placeholder="••••••••"
              onChange={() => { if (passwordError) setPasswordError('') }}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute inset-y-0 right-0 flex items-center px-3.5 text-zinc-400 hover:text-zinc-600 transition-colors"
              aria-label={showConfirm ? 'Hide password' : 'Show password'}
            >
              {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          {passwordError && (
            <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
              <span aria-hidden>⚠</span> {passwordError}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-xl bg-ajo px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-ajo/20 hover:bg-ajo-dark focus:outline-none focus:ring-2 focus:ring-ajo focus:ring-offset-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <span className="inline-flex items-center justify-center gap-2">
              <Spinner /> Creating account…
            </span>
          ) : (
            'Create account'
          )}
        </button>
      </form>
    </div>
  )
}

/* ─── Icons ───────────────────────────────────────────────────────────────── */

function EyeIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  )
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}
