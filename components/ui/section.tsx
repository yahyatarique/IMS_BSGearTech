import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface SectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'gradient';
}

export function Section({ title, description, children, className, variant = 'default' }: SectionProps) {
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
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
        {description && <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>}
      </div>
      {children}
    </section>
  );
}
