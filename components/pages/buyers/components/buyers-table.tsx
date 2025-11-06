import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn, formatDate } from '@/lib/utils';
import type { BuyerRecord } from '@/services/types/buyer.api.type';
import { DataTable, DataTableColumn } from '@/components/ui/data-table';
import { Pencil, Trash2 } from 'lucide-react';

const statusClasses: Record<BuyerRecord['status'], string> = {
  active: 'bg-green-500/10 text-green-700 dark:text-green-500 border-green-500/20',
  inactive: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-500 border-yellow-500/20',
  blocked: 'bg-red-500/10 text-red-700 dark:text-red-500 border-red-500/20',
};

function getStatusLabel(status: BuyerRecord['status']) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

interface BuyersTableProps {
  buyers: BuyerRecord[];
  isLoading: boolean;
  onEdit: (buyer: BuyerRecord) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, currentStatus: BuyerRecord['status']) => void;
}

export function BuyersTable({
  buyers,
  isLoading,
  onEdit,
  onDelete,
  onToggleStatus,
}: BuyersTableProps) {
  const columns: DataTableColumn<BuyerRecord>[] = [
    {
      key: 'name',
      label: 'Buyer Name',
      render: (buyer) => (
        <div>
          <div className="font-medium text-slate-900 dark:text-white">{buyer.name}</div>
          {buyer.org_name && (
            <div className="text-xs text-slate-500 dark:text-slate-400">{buyer.org_name}</div>
          )}
        </div>
      ),
    },
    {
      key: 'contact',
      label: 'Contact',
      render: (buyer) => (
        <div className="text-sm">
          {buyer.contact_details?.email && (
            <div className="text-slate-600 dark:text-slate-300">
              {buyer.contact_details.email}
            </div>
          )}
          {buyer.contact_details?.mobile && (
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {buyer.contact_details.mobile}
            </div>
          )}
          {!buyer.contact_details?.email && !buyer.contact_details?.mobile && (
            <span className="text-slate-400 dark:text-slate-500">—</span>
          )}
        </div>
      ),
    },
    {
      key: 'gst',
      label: 'GST Number',
      render: (buyer) => (
        <div className="text-sm font-mono text-slate-600 dark:text-slate-300">
          {buyer.gst_number || <span className="text-slate-400 dark:text-slate-500">—</span>}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (buyer) => (
        <Badge variant="outline" className={cn('border', statusClasses[buyer.status])}>
          {getStatusLabel(buyer.status)}
        </Badge>
      ),
    },
    {
      key: 'created',
      label: 'Created',
      render: (buyer) => (
        <div className="text-sm text-slate-600 dark:text-slate-300">
          {formatDate(buyer.created_at)}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      className: 'text-right',
      render: (buyer) => (
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(buyer)}>
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleStatus(buyer.id, buyer.status)}
            className={cn(
              buyer.status === 'active'
                ? 'text-orange-600 hover:text-orange-700'
                : 'text-green-600 hover:text-green-700'
            )}
          >
            {buyer.status === 'active' ? 'Deactivate' : 'Activate'}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(buyer.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={buyers}
      isLoading={isLoading}
      emptyMessage="No buyers found. Create your first buyer to get started."
      gradient="blue-cyan"
      getRowKey={(buyer) => buyer.id}
    />
  );
}
