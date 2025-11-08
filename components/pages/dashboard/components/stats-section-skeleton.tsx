export default function StatsSectionSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
      {[0, 1, 2].map((item) => (
        <div
          key={item}
          className="h-32 rounded-lg border bg-white dark:bg-slate-900 p-4 shadow animate-pulse"
        >
          <div className="h-2 w-full bg-gradient-to-r from-slate-200/60 to-slate-300/80 dark:from-slate-700 dark:to-slate-600 rounded" />
          <div className="mt-4 flex items-start justify-between">
            <div className="space-y-2">
              <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
            <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
      ))}
    </div>
  );
}
