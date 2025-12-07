export default function RecentOrdersSkeleton() {
  return (
    <div className="space-y-3">
      {[0, 1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="flex animate-pulse items-center justify-between gap-4 rounded-lg border bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-3 w-40 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-3 w-24 rounded bg-slate-200 dark:bg-slate-700" />
          </div>
          <div className="space-y-2 text-right">
            <div className="ml-auto h-4 w-20 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="ml-auto h-3 w-16 rounded bg-slate-200 dark:bg-slate-700" />
          </div>
        </div>
      ))}
    </div>
  );
}
