import { forwardRef, HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

const GRADIENT_PRESETS = {
  primary: 'from-blue-500 to-cyan-500 dark:from-blue-700 dark:to-cyan-700',
  'blue-cyan': 'from-blue-600 to-cyan-500 dark:from-blue-800 dark:to-cyan-700',
  green: 'from-green-500 to-emerald-500 dark:from-green-700 dark:to-emerald-700',
  orange: 'from-orange-500 to-red-500 dark:from-orange-700 dark:to-red-700',
  'purple-pink': 'from-purple-500 to-pink-500 dark:from-purple-700 dark:to-pink-700',
  'indigo-blue': 'from-indigo-500 to-blue-500 dark:from-indigo-700 dark:to-blue-700',
  none: ''
} as const;

type GradientKey = keyof typeof GRADIENT_PRESETS;

type GradientBorderCardProps = HTMLAttributes<HTMLDivElement> & {
  /**
   * Accepts either a preset name (e.g. "primary") or a raw Tailwind gradient string.
   */
  gradient?: GradientKey | string;
  /**
   * Optional slot rendered after the gradient border but before children, useful for headers.
   */
  header?: ReactNode;
  /**
   * Optional slot rendered after children, useful for footers or actions.
   */
  footer?: ReactNode;
};

export const GradientBorderCard = forwardRef<HTMLDivElement, GradientBorderCardProps>(
  ({ className, children, gradient = 'primary', header, footer, ...props }, ref) => {
    const resolvedGradient =
      gradient in GRADIENT_PRESETS
        ? GRADIENT_PRESETS[gradient as GradientKey]
        : (gradient as string);

    return (
      <div
        ref={ref}
        className={cn(
          'overflow-hidden rounded-xl border bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900',
          className
        )}
        {...props}
      >
        {resolvedGradient  && (
          <div className={cn('h-1 w-full bg-gradient-to-r', resolvedGradient)} />
        )}
        {header}
        {children}
        {footer}
      </div>
    );
  }
);

GradientBorderCard.displayName = 'GradientBorderCard';
