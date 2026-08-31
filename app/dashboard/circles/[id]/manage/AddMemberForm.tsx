'use client'

import { useState, useTransition } from 'react'
import { addManagedMember } from '@/app/actions/circles'
import { SlotPicker } from '@/app/components/SlotPicker'

interface AddMemberFormProps {
  circleId: string
  totalSlots: number
  takenSlotNumbers: number[]
}

const inputClass =
  'w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-ajo focus:outline-none focus:ring-2 focus:ring-ajo/20 transition-colors'

const labelClass = 'block text-sm font-medium text-zinc-700 mb-1'

export function AddMemberForm({
  circleId,
  totalSlots,
  takenSlotNumbers,
}: AddMemberFormProps) {
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null)
  const [clientError, setClientError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const openCount = totalSlots - takenSlotNumbers.length
  const noSlotsOpen = openCount <= 0

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setClientError(null)

    if (noSlotsOpen) {
      setClientError('All payout slots are already assigned.')
      return
    }

    if (!selectedSlot) {
      setClientError('Please assign a payout slot before adding this member.')
      return
    }

    const formData = new FormData(e.currentTarget)
    formData.set('circle_id', circleId)
    formData.set('slot_number', String(selectedSlot))

    startTransition(async () => {
      await addManagedMember(formData)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {clientError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {clientError}
        </div>
      )}

      <div>
        <label htmlFor="full_name" className={labelClass}>
          Full name <span className="text-red-400">*</span>
        </label>
        <input
          id="full_name"
          name="full_name"
          type="text"
          required
          maxLength={80}
          autoComplete="name"
          className={inputClass}
          placeholder="e.g. Chioma Okafor"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="email" className={labelClass}>
            Email <span className="text-zinc-400 font-normal">(optional)</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            className={inputClass}
            placeholder="name@email.com"
          />
        </div>
        <div>
          <label htmlFor="phone" className={labelClass}>
            Phone <span className="text-zinc-400 font-normal">(optional)</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            className={inputClass}
            placeholder="+1 555 000 0000"
          />
        </div>
      </div>

      <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-4 space-y-3">
        <div>
          <p className="text-sm font-semibold text-zinc-800">Assign payout slot</p>
          <p className="text-xs text-zinc-500 mt-0.5">
            Slot #1 gets paid first.{' '}
            <span className={noSlotsOpen ? 'text-red-500 font-medium' : ''}>
              {openCount} of {totalSlots} slots open.
            </span>
          </p>
        </div>
        <SlotPicker
          totalSlots={totalSlots}
          takenSlotNumbers={takenSlotNumbers}
          selected={selectedSlot}
          onSelect={(slot) => {
            setSelectedSlot(slot)
            setClientError(null)
          }}
        />
        {selectedSlot && (
          <p className="text-xs font-medium text-ajo">
            This member will receive payout at slot #{selectedSlot}.
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending || noSlotsOpen || !selectedSlot}
        className="w-full rounded-lg bg-ajo px-4 py-3 text-sm font-semibold text-white shadow-sm
          hover:bg-ajo-dark focus:outline-none focus:ring-2 focus:ring-ajo focus:ring-offset-2
          transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? (
          <span className="inline-flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Adding member…
          </span>
        ) : (
          'Add Member'
        )}
      </button>
    </form>
  )
}
