import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardCardProps {
  title: string;
  description?: string;
  gradient?: string;
  icon?: LucideIcon;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  headerClassName?: string;
  headerContentClassName?: string;
  contentClassName?: string;
  iconClassName?: string;
  showContentDivider?: boolean;
}

const DEFAULT_GRADIENT = 'from-blue-500 to-cyan-500';

export function DashboardCard({
  title,
  description,
  gradient = DEFAULT_GRADIENT,
  icon: Icon,
  action,
  children,
  className,
  headerClassName,
  headerContentClassName,
  contentClassName,
  iconClassName,
  showContentDivider = true,
}: DashboardCardProps) {
  return (
    <section
      className={cn(
        'overflow-hidden rounded-xl border bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900',
        className,
      )}
    >
      <div className={cn('h-1 bg-gradient-to-r', gradient)} />

      <div className={cn('flex items-center justify-between px-6 py-4', headerClassName)}>
        <div className={cn('flex items-center gap-3', headerContentClassName)}>
          {Icon && (
            <div className={cn('rounded-lg bg-gradient-to-br p-2', gradient)}>
              <Icon className={cn('h-5 w-5 text-white', iconClassName)} />
            </div>
          )}
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
            {description && (
              <p className="text-sm text-slate-600 dark:text-slate-400">{description}</p>
            )}
          </div>
        </div>
        {action}
      </div>

      <div
        className={cn(
          showContentDivider
            ? 'border-t border-slate-100 px-6 py-4 dark:border-slate-800'
            : 'px-6 pb-6 pt-0',
          contentClassName,
        )}
      >
        {children}
      </div>
    </section>
  );
}
