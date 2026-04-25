'use client'

import { useState } from 'react'

interface EmailInviteFormClientProps {
  emailSubject: string
  emailBody: string
}

export function EmailInviteFormClient({ emailSubject, emailBody }: EmailInviteFormClientProps) {
  const [email, setEmail] = useState('')

  const mailtoHref = `mailto:${encodeURIComponent(email)}?subject=${emailSubject}&body=${emailBody}`

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="friend@example.com"
        className="flex-1 rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-ajo focus:outline-none focus:ring-2 focus:ring-ajo/20 transition-colors"
      />
      <a
        href={email ? mailtoHref : undefined}
        onClick={(e) => { if (!email) e.preventDefault() }}
        className={`shrink-0 inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors
          ${email
            ? 'bg-ajo text-white hover:bg-ajo-dark'
            : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
          }`}
      >
        <MailIcon /> Send Invite
      </a>
    </div>
  )
}

function MailIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  )
}
