export default function RecentBuyersSkeleton() {
  return (
    <section className="overflow-hidden rounded-xl border bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900">
      <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-200 to-cyan-200 dark:from-slate-800 dark:to-slate-700" />
          <div className="space-y-2">
            <div className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-3 w-40 rounded bg-slate-200 dark:bg-slate-700" />
          </div>
        </div>
        <div className="h-8 w-20 rounded bg-slate-200 dark:bg-slate-700" />
      </div>

      <div className="px-6 py-4">
        <div className="space-y-3">
          {[0, 1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="flex animate-pulse items-start gap-4 rounded-lg border bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="h-12 w-12 rounded-full bg-slate-200 dark:bg-slate-700" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-24 rounded bg-slate-200 dark:bg-slate-700" />
                <div className="h-3 w-32 rounded bg-slate-200 dark:bg-slate-700" />
                <div className="space-y-1">
                  <div className="h-2.5 w-36 rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="h-2.5 w-28 rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="h-2.5 w-24 rounded bg-slate-200 dark:bg-slate-700" />
                </div>
              </div>
              <div className="space-y-2 text-right">
                <div className="ml-auto h-3 w-20 rounded bg-slate-200 dark:bg-slate-700" />
                <div className="ml-auto h-2.5 w-16 rounded bg-slate-200 dark:bg-slate-700" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
