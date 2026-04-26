export default function JoinCircleLoading() {
  return (
    <div className="max-w-md mx-auto animate-pulse">
      {/* Back link */}
      <div className="h-4 w-36 rounded bg-zinc-200 mb-6" />

      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
        {/* Top accent */}
        <div className="h-2 bg-ajo/30" />

        <div className="p-6 sm:p-8 space-y-6">
          {/* Heading */}
          <div className="space-y-2">
            <div className="h-6 w-36 rounded bg-zinc-200" />
            <div className="h-4 w-64 rounded bg-zinc-100" />
          </div>

          {/* Circle info card */}
          <div className="rounded-xl bg-zinc-50 border border-zinc-100 p-5 space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div className="h-6 w-40 rounded bg-zinc-200" />
              <div className="h-5 w-16 rounded-full bg-zinc-100" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-1">
                  <div className="h-3 w-16 rounded bg-zinc-200" />
                  <div className="h-4 w-20 rounded bg-zinc-200" />
                </div>
              ))}
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-1">
            <div className="h-2 w-full rounded-full bg-zinc-100" />
          </div>

          {/* Button */}
          <div className="h-11 w-full rounded-lg bg-zinc-200" />
        </div>
      </div>
    </div>
  )
}
