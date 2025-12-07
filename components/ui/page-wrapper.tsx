import { ReactNode } from 'react';
import { GradientText } from '@/components/ui/gradient-text';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageWrapperProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  icon?: LucideIcon;
  gradient?: 'blue-cyan' | 'primary' | 'green' | 'orange' | 'custom';
  headerActions?: ReactNode;
  className?: string;
}

/**
 * PageWrapper component provides consistent padding, spacing, and optional header
 * for all pages in the application.
 *
 * @example
 * ```tsx
 * <PageWrapper
 *   title="Buyers Management"
 *   subtitle="Manage your buyer information and contacts"
 *   gradient="blue-cyan"
 *   icon={Users}
 *   headerActions={<Button>Add Buyer</Button>}
 * >
 *   <YourPageContent />
 * </PageWrapper>
 * ```
 */
export function PageWrapper({
  children,
  title,
  subtitle,
  icon: Icon,
  headerActions,
  className,
  gradient
}: PageWrapperProps) {
  return (
    <div className={cn('container mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6', className)}>
      {/* Page Header */}
      {(title || headerActions) && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          {title && (
            <div className="flex items-start gap-3">
              {Icon && (
                <div className="mt-1">
                  <Icon className="w-8 h-8 text-gray-600 dark:text-gray-400" />
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold">
                  {gradient && <GradientText>{title}</GradientText>}
                  {!gradient && title}
                </h1>
                {subtitle && <p className="text-gray-600 dark:text-gray-400 mt-1">{subtitle}</p>}
              </div>
            </div>
          )}
          {headerActions && <div className="flex gap-2">{headerActions}</div>}
        </div>
      )}

      {/* Page Content */}
      {children}
    </div>
  );
}
