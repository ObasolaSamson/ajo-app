'use client'

import { useRef, useState, useTransition } from 'react'
import { deleteCircle } from '@/app/actions/circles'

interface DeleteCircleButtonProps {
  circleId: string
  circleName: string
}

export function DeleteCircleButton({ circleId, circleName }: DeleteCircleButtonProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const cancelRef = useRef<HTMLButtonElement>(null)

  function handleDelete() {
    const formData = new FormData()
    formData.set('circle_id', circleId)
    startTransition(async () => {
      await deleteCircle(formData)
    })
  }

  return (
    <>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5
          text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
      >
        <TrashIcon />
        Delete Circle
      </button>

      {/* Modal overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false)
          }}
        >
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl p-6 space-y-5">
            {/* Warning icon */}
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 mx-auto">
              <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>

            <div className="text-center">
              <h2 className="text-lg font-bold text-zinc-900 mb-2">Delete circle?</h2>
              <p className="text-sm text-zinc-500">
                Are you sure you want to delete{' '}
                <span className="font-semibold text-zinc-800">{circleName}</span>?
                This will permanently remove all members, contributions, and payout
                slots. <span className="font-medium text-red-600">This cannot be undone.</span>
              </p>
            </div>

            <div className="flex gap-3">
              <button
                ref={cancelRef}
                type="button"
                onClick={() => setOpen(false)}
                disabled={isPending}
                className="flex-1 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm
                  font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold
                  text-white hover:bg-red-700 transition-colors
                  disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isPending ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Deleting…
                  </span>
                ) : (
                  'Delete Circle'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function TrashIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  )
}
