'use client'

interface SlotPickerProps {
  totalSlots: number
  takenSlotNumbers: number[]
  selected: number | null
  onSelect: (slot: number) => void
}

export function SlotPicker({ totalSlots, takenSlotNumbers, selected, onSelect }: SlotPickerProps) {
  const takenSet = new Set(takenSlotNumbers)

  return (
    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
      {Array.from({ length: totalSlots }, (_, i) => i + 1).map((slot) => {
        const isTaken = takenSet.has(slot)
        const isSelected = selected === slot

        return (
          <button
            key={slot}
            type="button"
            disabled={isTaken}
            aria-pressed={isSelected}
            aria-label={`Slot ${slot} — ${isTaken ? 'taken' : isSelected ? 'selected' : 'available'}`}
            onClick={() => !isTaken && onSelect(slot)}
            className={
              isTaken
                ? 'flex flex-col items-center rounded-xl border p-2.5 text-center opacity-50 cursor-not-allowed pointer-events-none select-none border-zinc-200 bg-zinc-100 text-zinc-400'
                : isSelected
                ? 'flex flex-col items-center rounded-xl border p-2.5 text-center transition-all border-ajo bg-ajo text-white shadow-md shadow-ajo/20 scale-105'
                : 'flex flex-col items-center rounded-xl border p-2.5 text-center transition-all border-green-500 bg-white text-green-600 hover:bg-green-500 hover:text-white hover:scale-105'
            }
          >
            <span className="text-sm font-bold">#{slot}</span>
            <span className="text-xs mt-0.5">
              {isTaken ? 'Taken' : isSelected ? '✓ Picked' : 'Open'}
            </span>
          </button>
        )
      })}
    </div>
  )
}
