export default function ProfileLoading() {
  return (
    <div className="max-w-xl mx-auto space-y-6 animate-pulse">
      {/* Title */}
      <div className="space-y-2">
        <div className="h-7 w-40 rounded bg-zinc-200" />
        <div className="h-4 w-56 rounded bg-zinc-100" />
      </div>

      {/* Avatar row */}
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-zinc-200 shrink-0" />
        <div className="space-y-1.5">
          <div className="h-4 w-32 rounded bg-zinc-200" />
          <div className="h-3 w-44 rounded bg-zinc-100" />
        </div>
      </div>

      {/* Form card */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 sm:p-8 space-y-5">
        <div className="h-5 w-36 rounded bg-zinc-200" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-1.5">
            <div className="h-3.5 w-24 rounded bg-zinc-100" />
            <div className="h-10 w-full rounded-lg bg-zinc-100" />
          </div>
        ))}
        <div className="h-10 w-full rounded-lg bg-zinc-200" />
      </div>

      {/* Account card */}
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 space-y-3">
        <div className="h-5 w-20 rounded bg-zinc-200" />
        <div className="h-4 w-52 rounded bg-zinc-100" />
        <div className="h-10 w-28 rounded-lg bg-zinc-100" />
      </div>
    </div>
  )
}
