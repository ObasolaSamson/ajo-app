'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

// How long the user can be idle before the warning appears (20 minutes)
const IDLE_MS = 20 * 60 * 1000
// How long the warning stays before auto-logout (60 seconds)
const WARNING_MS = 60 * 1000

const ACTIVITY_EVENTS = [
  'mousedown',
  'mousemove',
  'keydown',
  'scroll',
  'touchstart',
  'click',
  'visibilitychange',
] as const

export function SessionTimeout() {
  const router = useRouter()
  const [showWarning, setShowWarning] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(WARNING_MS / 1000)

  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const logoutTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const countdownInterval = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearAllTimers = useCallback(() => {
    if (idleTimer.current) clearTimeout(idleTimer.current)
    if (logoutTimer.current) clearTimeout(logoutTimer.current)
    if (countdownInterval.current) clearInterval(countdownInterval.current)
  }, [])

  const performLogout = useCallback(async () => {
    clearAllTimers()
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace('/login?reason=timeout')
  }, [clearAllTimers, router])

  const startWarningCountdown = useCallback(() => {
    setShowWarning(true)
    setSecondsLeft(WARNING_MS / 1000)

    countdownInterval.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval.current!)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    logoutTimer.current = setTimeout(performLogout, WARNING_MS)
  }, [performLogout])

  const resetIdleTimer = useCallback(() => {
    clearAllTimers()
    setShowWarning(false)
    setSecondsLeft(WARNING_MS / 1000)
    idleTimer.current = setTimeout(startWarningCountdown, IDLE_MS)
  }, [clearAllTimers, startWarningCountdown])

  // Kick off the idle timer and attach activity listeners
  useEffect(() => {
    const handleActivity = () => {
      // Only reset if the warning isn't already showing — don't let background
      // events (e.g. scroll on another tab) silently dismiss the modal.
      if (!showWarning) resetIdleTimer()
    }

    ACTIVITY_EVENTS.forEach((e) =>
      document.addEventListener(e, handleActivity, { passive: true })
    )
    resetIdleTimer()

    return () => {
      ACTIVITY_EVENTS.forEach((e) =>
        document.removeEventListener(e, handleActivity)
      )
      clearAllTimers()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showWarning])

  // Auto-logout when countdown hits zero
  useEffect(() => {
    if (secondsLeft === 0 && showWarning) performLogout()
  }, [secondsLeft, showWarning, performLogout])

  if (!showWarning) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="timeout-title"
        aria-describedby="timeout-desc"
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl ring-1 ring-zinc-900/10 overflow-hidden">
          {/* Countdown progress bar */}
          <div className="h-1.5 w-full bg-zinc-100">
            <div
              className="h-full bg-amber-400 transition-all duration-1000 ease-linear"
              style={{ width: `${(secondsLeft / (WARNING_MS / 1000)) * 100}%` }}
            />
          </div>

          <div className="p-6">
            {/* Icon */}
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50">
              <svg
                className="h-6 w-6 text-amber-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
            </div>

            <h2
              id="timeout-title"
              className="text-center text-base font-semibold text-zinc-900 mb-1"
            >
              Still there?
            </h2>
            <p
              id="timeout-desc"
              className="text-center text-sm text-zinc-500 mb-6"
            >
              You&apos;ve been inactive for a while. For your security, you&apos;ll
              be signed out in{' '}
              <span className="font-semibold text-zinc-800 tabular-nums">
                {secondsLeft}s
              </span>
              .
            </p>

            <div className="flex gap-3">
              <button
                onClick={resetIdleTimer}
                className="flex-1 rounded-xl bg-ajo px-4 py-2.5 text-sm font-semibold text-white hover:bg-ajo-dark focus:outline-none focus:ring-2 focus:ring-ajo focus:ring-offset-2 transition-colors"
              >
                Stay signed in
              </button>
              <button
                onClick={performLogout}
                className="flex-1 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
