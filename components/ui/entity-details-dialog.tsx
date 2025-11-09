import { ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Status {
  label: string | ReactNode;
  value: string;
  className?: string;
}

interface EntityHeaderProps {
  title: string;
  subtitle?: string;
  status?: Status[];
}

interface EntityDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  header: EntityHeaderProps;
  children?: ReactNode;
  renderFooter?: () => ReactNode;
  isOperating?: boolean;
  leftSectionHeading?: ReactNode;
  leftSectionSubheading?: string;
  leftSectionExtra?: string;
}

export function EntityDetailsDialog({
  open,
  onClose,
  header,
  children,
  renderFooter,
  isOperating = false,
  leftSectionHeading,
  leftSectionSubheading,
  leftSectionExtra
}: EntityDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(newOpen) => !isOperating && newOpen === false && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{header.title}</DialogTitle>
          {header.subtitle && <DialogDescription>{header.subtitle}</DialogDescription>}
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Header Section with Entity Name and Status */}
          {leftSectionHeading && (
            <div className="flex items-start justify-between pb-4 border-b">
              {leftSectionHeading && (
                <div>
                  <div className="text-xl font-semibold text-slate-900 dark:text-white">
                    {leftSectionHeading}
                  </div>
                  {leftSectionSubheading && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{leftSectionSubheading}</p>
                  )}
                  {leftSectionExtra && (
                    <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mt-1">{leftSectionExtra}</p>
                  )}
                </div>
              )}
              {header.status && header.status.length > 0 && (
                <div className="flex gap-2">
                  {header.status.map((status, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className={cn('border', status.className)}
                    >
                      {status.label}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Main Content - Scrollable */}
          <div className="max-h-[400px] overflow-y-auto scrollbar-thin">{children}</div>

          {/* Footer */}
          {renderFooter && (
            <div className="flex justify-end gap-2 pt-4 border-t">
              {renderFooter()}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
