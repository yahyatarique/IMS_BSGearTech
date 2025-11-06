import { ReactNode } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { GradientBorderCard } from '@/components/ui/gradient-border-card';

export interface DataTableColumn<T> {
  key: string;
  label: string;
  className?: string;
  render: (item: T) => ReactNode;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  gradient?: 'blue-cyan' | 'primary' | 'green' | 'orange';
  getRowKey: (item: T) => string;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  loadMoreLabel?: string;
}

function TableSkeleton({ columnCount }: { columnCount: number }) {
  return (
    <TableBody>
      {Array.from({ length: 5 }).map((_, rowIndex) => (
        <TableRow key={rowIndex}>
          {Array.from({ length: columnCount }).map((_, colIndex) => (
            <TableCell key={colIndex}>
              <Skeleton className="h-6 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  );
}

/**
 * DataTable - Reusable table component with loading states, meta (pagination), and gradient border
 * 
 * @example
 * ```tsx
 * <DataTable
 *   columns={[
 *     { key: 'name', label: 'Name', render: (buyer) => buyer.name },
 *     { key: 'status', label: 'Status', render: (buyer) => <Badge>{buyer.status}</Badge> },
 *   ]}
 *   data={buyers}
 *   getRowKey={(buyer) => buyer.id}
 *   isLoading={isLoading}
 *   emptyMessage="No buyers found"
 *   hasMore={hasMore}
 *   onLoadMore={loadMore}
 * />
 * ```
 */
export function DataTable<T>({
  columns,
  data,
  isLoading = false,
  emptyMessage = 'No data found',
  gradient = 'blue-cyan',
  getRowKey,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
  loadMoreLabel = 'Load more',
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <GradientBorderCard gradient={gradient}>
        <div className="rounded-xl border bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="px-6 py-4">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column) => (
                    <TableHead key={column.key} className={column.className}>
                      {column.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableSkeleton columnCount={columns.length} />
            </Table>
          </div>
        </div>
      </GradientBorderCard>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-500 dark:text-slate-400">
        {emptyMessage}
      </div>
    );
  }

  return (
    <GradientBorderCard gradient={gradient}>
      <div className="rounded-xl border bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="px-6 py-4">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column.key} className={column.className}>
                    {column.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={getRowKey(item)}>
                  {columns.map((column) => (
                    <TableCell key={column.key} className={column.className}>
                      {column.render(item)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {hasMore && onLoadMore && (
          <div className="border-t border-slate-100 px-6 py-4 dark:border-slate-800">
            <Button onClick={onLoadMore} disabled={isLoadingMore} className="w-full">
              {isLoadingMore ? 'Loading…' : loadMoreLabel}
            </Button>
          </div>
        )}
      </div>
    </GradientBorderCard>
  );
}
