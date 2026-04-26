export default function CircleDetailLoading() {
  return (
    <div className="space-y-5 animate-pulse">
      {/* Back link */}
      <div className="h-4 w-24 rounded bg-zinc-200" />

      {/* Circle header card */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="h-5 w-16 rounded-full bg-zinc-100" />
            <div className="h-7 w-48 rounded bg-zinc-200" />
            <div className="h-4 w-64 rounded bg-zinc-100" />
          </div>
          <div className="h-6 w-20 rounded-full bg-zinc-100" />
        </div>
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-1">
              <div className="h-3 w-16 rounded bg-zinc-100" />
              <div className="h-5 w-24 rounded bg-zinc-200" />
            </div>
          ))}
        </div>
      </div>

      {/* Round summary card */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
        <div className="bg-ajo/20 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <div className="h-3 w-24 rounded bg-white/40" />
              <div className="h-8 w-20 rounded bg-white/40" />
            </div>
            <div className="space-y-1.5 text-right">
              <div className="h-3 w-24 rounded bg-white/40" />
              <div className="h-4 w-28 rounded bg-white/40" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 divide-x divide-zinc-100">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 space-y-1">
              <div className="h-3 w-12 rounded bg-zinc-100" />
              <div className="h-5 w-16 rounded bg-zinc-200" />
            </div>
          ))}
        </div>
        <div className="px-6 pb-5 pt-3">
          <div className="h-2 w-full rounded-full bg-zinc-100" />
        </div>
      </div>

      {/* Contributions card */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6">
        <div className="h-5 w-40 rounded bg-zinc-200 mb-5" />
        <ul className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <li key={i} className="flex items-center gap-3 rounded-xl p-3 bg-zinc-50">
              <div className="h-8 w-8 rounded-full bg-zinc-200 shrink-0" />
              <div className="flex-1 space-y-1">
                <div className="h-4 w-32 rounded bg-zinc-200" />
              </div>
              <div className="h-5 w-16 rounded-full bg-zinc-100 shrink-0" />
            </li>
          ))}
        </ul>
      </div>

      {/* Payout slots card */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6">
        <div className="h-5 w-32 rounded bg-zinc-200 mb-5" />
        <ul className="space-y-2">
          {[1, 2, 3].map((i) => (
            <li key={i} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50">
              <div className="h-6 w-6 rounded-full bg-zinc-200 shrink-0" />
              <div className="flex-1 space-y-1">
                <div className="h-4 w-28 rounded bg-zinc-200" />
              </div>
              <div className="h-4 w-20 rounded bg-zinc-100 shrink-0" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
