'use client'

import { useTransition } from 'react'
import { updateMemberSlot } from '@/app/actions/circles'

interface ChangeSlotSelectProps {
  circleId: string
  memberId: string
  currentSlot: number | null
  availableSlots: number[]
}

export function ChangeSlotSelect({
  circleId,
  memberId,
  currentSlot,
  availableSlots,
}: ChangeSlotSelectProps) {
  const [isPending, startTransition] = useTransition()

  const options = Array.from(
    new Set([...(currentSlot ? [currentSlot] : []), ...availableSlots]),
  ).sort((a, b) => a - b)

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = parseInt(e.target.value, 10)
    if (!next || next === currentSlot) return

    const formData = new FormData()
    formData.set('circle_id', circleId)
    formData.set('member_id', memberId)
    formData.set('slot_number', String(next))

    startTransition(async () => {
      await updateMemberSlot(formData)
    })
  }

  return (
    <label className="block">
      <span className="sr-only">Payout slot</span>
      <select
        value={currentSlot ?? ''}
        onChange={handleChange}
        disabled={isPending || options.length === 0}
        className="w-full min-w-[7.5rem] rounded-lg border border-zinc-300 bg-white px-2.5 py-2 text-sm font-medium text-zinc-800 focus:border-ajo focus:outline-none focus:ring-2 focus:ring-ajo/20 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {!currentSlot && <option value="">Assign slot</option>}
        {options.map((slot) => (
          <option key={slot} value={slot}>
            Slot #{slot}
          </option>
        ))}
      </select>
    </label>
  )
}
