export default function ManageCircleLoading() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
      <div className="h-4 w-28 rounded bg-zinc-200" />
      <div className="space-y-2">
        <div className="h-7 w-48 rounded bg-zinc-200" />
        <div className="h-4 w-64 rounded bg-zinc-100" />
      </div>
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 sm:p-8 space-y-4">
        <div className="h-5 w-32 rounded bg-zinc-200" />
        <div className="h-10 w-full rounded-lg bg-zinc-100" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="h-10 rounded-lg bg-zinc-100" />
          <div className="h-10 rounded-lg bg-zinc-100" />
        </div>
        <div className="h-28 rounded-xl bg-zinc-100" />
      </div>
      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 space-y-3">
        <div className="h-5 w-36 rounded bg-zinc-200" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 rounded-xl bg-zinc-50 border border-zinc-100" />
        ))}
      </div>
    </div>
  )
}
