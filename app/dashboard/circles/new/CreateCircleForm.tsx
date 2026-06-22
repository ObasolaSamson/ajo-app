'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { createCircle } from '@/app/actions/circles'
import { SlotPicker } from '@/app/components/SlotPicker'

interface CreateCircleFormProps {
  error?: string
  minDate: string
}

const inputClass =
  'w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-ajo focus:outline-none focus:ring-2 focus:ring-ajo/20 transition-colors'

const labelClass = 'block text-sm font-medium text-zinc-700 mb-1'

export function CreateCircleForm({ error, minDate }: CreateCircleFormProps) {
  const [totalSlots, setTotalSlots] = useState(0)
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null)
  const [clientError, setClientError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleTotalSlotsChange(val: number) {
    setTotalSlots(val)
    // Reset slot if it's now out of range
    if (selectedSlot !== null && selectedSlot > val) {
      setSelectedSlot(null)
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setClientError(null)

    if (totalSlots >= 2 && !selectedSlot) {
      setClientError('Please select your payout slot position before creating the circle.')
      return
    }

    const formData = new FormData(e.currentTarget)
    if (selectedSlot) {
      formData.set('organizer_slot', String(selectedSlot))
    }

    startTransition(async () => {
      await createCircle(formData)
    })
  }

  const displayError = clientError ?? error

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-800 transition-colors mb-4"
        >
          <ChevronLeftIcon /> Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-zinc-900">Create a Circle</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Set up a new savings circle and invite your people.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 sm:p-8">
        {displayError && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {displayError.startsWith('%') ? decodeURIComponent(displayError) : displayError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Circle Name */}
          <div>
            <label htmlFor="name" className={labelClass}>
              Circle name <span className="text-red-400">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              maxLength={60}
              className={inputClass}
              placeholder="e.g. Family Savings, Lagos Squad"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className={labelClass}>
              Description <span className="text-zinc-400 font-normal">(optional)</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows={2}
              className={inputClass}
              placeholder="What's this circle for?"
            />
          </div>

          {/* Amount + Frequency row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="contribution_amount" className={labelClass}>
                Contribution amount <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-sm text-zinc-400 select-none">
                  $
                </span>
                <input
                  id="contribution_amount"
                  name="contribution_amount"
                  type="text"
                  inputMode="decimal"
                  required
                  className={`${inputClass} pl-7`}
                  placeholder="e.g. 500"
                />
              </div>
              <p className="mt-1 text-xs text-zinc-400">Minimum $50</p>
            </div>

            <div>
              <label htmlFor="frequency" className={labelClass}>
                Frequency <span className="text-red-400">*</span>
              </label>
              <select
                id="frequency"
                name="frequency"
                required
                className={inputClass}
                defaultValue="monthly"
              >
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          </div>

          {/* Members + Start date row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="max_members" className={labelClass}>
                Number of members <span className="text-red-400">*</span>
              </label>
              <input
                id="max_members"
                name="max_members"
                type="number"
                required
                min={2}
                max={50}
                className={inputClass}
                placeholder="e.g. 10"
                onChange={(e) => handleTotalSlotsChange(parseInt(e.target.value) || 0)}
              />
              <p className="mt-1 text-xs text-zinc-400">Between 2 and 50</p>
            </div>

            <div>
              <label htmlFor="start_date" className={labelClass}>
                Start date <span className="text-red-400">*</span>
              </label>
              <input
                id="start_date"
                name="start_date"
                type="date"
                required
                min={minDate}
                className={inputClass}
              />
            </div>
          </div>

          {/* Slot picker — shown once member count is valid */}
          {totalSlots >= 2 ? (
            <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-4 space-y-3">
              <div>
                <p className="text-sm font-semibold text-zinc-800">Your payout slot</p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Pick the position you want in the payout rotation. Slot #1 gets paid first.
                </p>
              </div>
              <SlotPicker
                totalSlots={totalSlots}
                takenSlotNumbers={[]}
                selected={selectedSlot}
                onSelect={setSelectedSlot}
              />
              {selectedSlot && (
                <p className="text-xs font-medium text-ajo flex items-center gap-1.5">
                  <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                  </svg>
                  You&apos;ll be payout slot #{selectedSlot}
                </p>
              )}
            </div>
          ) : (
            <div className="rounded-lg bg-ajo-light border border-ajo-muted px-4 py-3 text-sm text-ajo-dark">
              <strong>Enter the number of members</strong> above to choose your payout slot.
            </div>
          )}

          <button
            type="submit"
            disabled={isPending || (totalSlots >= 2 && !selectedSlot)}
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
                Creating circle…
              </span>
            ) : (
              'Create Circle'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

function ChevronLeftIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  )
}
