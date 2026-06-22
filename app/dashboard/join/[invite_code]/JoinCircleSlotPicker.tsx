'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { joinCircle } from '@/app/actions/circles'
import { SlotPicker } from '@/app/components/SlotPicker'

interface JoinCircleSlotPickerProps {
  circleId: string
  inviteCode: string
  totalSlots: number
  takenSlotNumbers: number[]
}

export function JoinCircleSlotPicker({
  circleId,
  inviteCode,
  totalSlots,
  takenSlotNumbers,
}: JoinCircleSlotPickerProps) {
  const [selected, setSelected] = useState<number | null>(null)
  const [slotError, setSlotError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const takenSet = new Set(takenSlotNumbers)

  // Debug: verify the component is receiving the correct taken slot numbers
  console.log('[JoinCircleSlotPicker] takenSlotNumbers received:', takenSlotNumbers)

  // Clear stale selection if the slot was claimed while user was on this page
  useEffect(() => {
    if (selected !== null && takenSet.has(selected)) {
      setSelected(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [takenSlotNumbers])

  function handleSelect(slot: number) {
    if (takenSet.has(slot)) return
    setSelected(slot)
    setSlotError(null)
  }

  const isSelectionValid = selected !== null && !takenSet.has(selected)

  function handleJoin() {
    if (!isSelectionValid) return
    setSlotError(null)

    const formData = new FormData()
    formData.set('slot_number', String(selected))

    startTransition(async () => {
      const result = await joinCircle(circleId, inviteCode, formData)
      if (result?.error) {
        setSlotError(result.error)
        setSelected(null)
        router.refresh()
      }
    })
  }

  const availableCount = totalSlots - takenSlotNumbers.length

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-semibold text-zinc-800 mb-0.5">Choose your payout slot</h3>
        <p className="text-xs text-zinc-500">
          Slot #1 gets paid first, slot #{totalSlots} gets paid last.{' '}
          <span className={availableCount === 0 ? 'text-red-500 font-medium' : ''}>
            {availableCount} of {totalSlots} slots open.
          </span>
        </p>
      </div>

      {slotError && (
        <div className="flex items-start gap-2.5 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
          <svg className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <p className="text-sm text-amber-800">
            {slotError} Pick an available slot below.
          </p>
        </div>
      )}

      <SlotPicker
        totalSlots={totalSlots}
        takenSlotNumbers={takenSlotNumbers}
        selected={selected}
        onSelect={handleSelect}
      />

      {isSelectionValid && !slotError && (
        <p className="text-xs font-medium text-ajo flex items-center gap-1.5">
          <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
          </svg>
          Slot #{selected} selected — you&apos;ll receive your payout at position {selected}
        </p>
      )}

      <button
        onClick={handleJoin}
        disabled={!isSelectionValid || isPending}
        className="w-full rounded-lg bg-ajo px-4 py-3 text-sm font-semibold text-white shadow-sm
          hover:bg-ajo-dark focus:outline-none focus:ring-2 focus:ring-ajo focus:ring-offset-2
          transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? (
          <span className="inline-flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Joining circle…
          </span>
        ) : isSelectionValid ? (
          `Confirm Slot #${selected} & Join Circle`
        ) : (
          'Select a slot to continue'
        )}
      </button>
    </div>
  )
}
