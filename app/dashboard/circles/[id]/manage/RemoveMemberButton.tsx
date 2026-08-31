'use client'

import { useTransition } from 'react'
import { removeMember } from '@/app/actions/circles'

interface RemoveMemberButtonProps {
  circleId: string
  memberId: string
  memberName: string
}

export function RemoveMemberButton({
  circleId,
  memberId,
  memberName,
}: RemoveMemberButtonProps) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    const confirmed = window.confirm(
      `Remove ${memberName} from this circle?\n\nTheir slot will be freed and their contribution records for this circle will be deleted. This cannot be undone.`,
    )
    if (!confirmed) return

    const formData = new FormData()
    formData.set('circle_id', circleId)
    formData.set('member_id', memberId)

    startTransition(async () => {
      await removeMember(formData)
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-white px-2.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {isPending ? 'Removing…' : 'Remove'}
    </button>
  )
}
