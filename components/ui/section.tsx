import { cn } from '@/lib/utils';
import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface SectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'gradient';
  childrenClassName?: string;
  icon?: LucideIcon;
}

export function Section({ title, description, children, className, childrenClassName, variant = 'default', icon: Icon }: SectionProps) {
  return (
    <section
      className={cn(
        'rounded-xl p-6 shadow-lg',
        variant === 'gradient'
          ? 'bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 dark:from-slate-900 dark:to-slate-800'
          : 'bg-white dark:bg-slate-900',
        className
      )}
    >
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          {Icon && <Icon className="h-5 w-5" />}
          {title}
        </h2>
        {description && <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>}
      </div>
      <div className={cn("space-y-4", childrenClassName)}>
        {children}
      </div>
    </section>
  );
}
