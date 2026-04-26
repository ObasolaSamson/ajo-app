'use client'

import { useFormStatus } from 'react-dom'

interface SubmitButtonProps {
  children: React.ReactNode
  pendingText?: string
  className?: string
}

export function SubmitButton({ children, pendingText, className = '' }: SubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className={`${className} disabled:opacity-60 disabled:cursor-not-allowed`}
    >
      {pending ? (
        <span className="inline-flex items-center justify-center gap-2">
          <Spinner />
          {pendingText ?? children}
        </span>
      ) : (
        children
      )}
    </button>
  )
}

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}
