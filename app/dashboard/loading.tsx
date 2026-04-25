export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Welcome banner skeleton */}
      <div className="rounded-2xl bg-ajo/20 p-6 sm:p-8 h-40" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Circles column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-5 w-28 rounded-md bg-zinc-200" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 rounded-xl bg-white border border-zinc-100 p-4">
                <div className="h-10 w-10 rounded-full bg-zinc-200 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 rounded bg-zinc-200" />
                  <div className="h-3 w-48 rounded bg-zinc-100" />
                </div>
                <div className="h-4 w-4 rounded bg-zinc-100" />
              </div>
            ))}
          </div>
        </div>

        {/* Activity column */}
        <div className="space-y-4">
          <div className="h-5 w-32 rounded-md bg-zinc-200" />
          <div className="bg-white rounded-2xl border border-zinc-100 divide-y divide-zinc-50">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start gap-3 p-4">
                <div className="mt-0.5 h-7 w-7 rounded-full bg-zinc-100 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-full rounded bg-zinc-100" />
                  <div className="h-3 w-16 rounded bg-zinc-100" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
