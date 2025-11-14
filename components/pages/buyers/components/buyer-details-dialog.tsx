import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn, formatDateTime } from '@/lib/utils';
import type { BuyerRecord } from '@/services/types/buyer.api.type';
import {
  Building2,
  Mail,
  Phone,
  Smartphone,
  MapPin,
  FileText,
  Calendar,
  Activity
} from 'lucide-react';
import { ChangeStatusDialog, StatusOption } from '@/components/ui/change-status-dialog';

const statusClasses: Record<BuyerRecord['status'], string> = {
  active: 'bg-green-500/10 text-green-700 dark:text-green-500 border-green-500/20',
  inactive: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-500 border-yellow-500/20',
  blocked: 'bg-red-500/10 text-red-700 dark:text-red-500 border-red-500/20'
};

function getStatusLabel(status: BuyerRecord['status']) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

const BUYER_STATUS_OPTIONS: StatusOption[] = [
  {
    value: 'active',
    label: 'Active',
    description: 'Buyer can place orders and access services',
    variant: 'default'
  },
  {
    value: 'inactive',
    label: 'Inactive',
    description: 'Buyer account is disabled but can be reactivated',
    variant: 'warning'
  },
  {
    value: 'blocked',
    label: 'Blocked',
    description: 'Buyer account is permanently blocked',
    variant: 'destructive'
  }
];

interface BuyerDetailsDialogProps {
  buyer: BuyerRecord | null;
  open: boolean;
  onClose: () => void;
  onToggleStatus: (id: string, currentStatus: BuyerRecord['status']) => Promise<void>;
  onEdit: (buyer: BuyerRecord) => void;
}

export function BuyerDetailsDialog({
  buyer,
  open,
  onClose,
  onToggleStatus,
  onEdit
}: BuyerDetailsDialogProps) {
  const [isChangeStatusOpen, setIsChangeStatusOpen] = useState(false);

  if (!buyer) return null;

  const handleStatusChange = async (newStatus: string) => {
    await onToggleStatus(buyer.id, newStatus as BuyerRecord['status']);
    onClose();
  };

  const handleEdit = () => {
    onEdit(buyer);
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Buyer Details</DialogTitle>
          <DialogDescription>View and manage buyer information</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Header Section */}
          <div className="flex items-start justify-between pb-4 border-b">
            <div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{buyer.name}</h3>
              {buyer.org_name && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{buyer.org_name}</p>
              )}
            </div>
            <Badge variant="outline" className={cn('border', statusClasses[buyer.status])}>
              {getStatusLabel(buyer.status)}
            </Badge>
          </div>

          {/* Contact Details Section */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Contact Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {buyer.contact_details?.email && (
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      Email
                    </p>
                    <p className="text-sm text-slate-900 dark:text-white mt-1">
                      {buyer.contact_details.email}
                    </p>
                  </div>
                </div>
              )}

              {buyer.contact_details?.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      Phone
                    </p>
                    <p className="text-sm text-slate-900 dark:text-white mt-1">
                      {buyer.contact_details.phone}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Organization Details Section */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Organization Details
            </h4>
            <div className="space-y-4">
              {buyer.org_address && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      Address
                    </p>
                    <p className="text-sm text-slate-900 dark:text-white mt-1">
                      {buyer.org_address}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tax Details Section */}
          {(buyer.gst_number || buyer.pan_number || buyer.tin_number) && (
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Tax Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {buyer.gst_number && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      GST Number
                    </p>
                    <p className="text-sm text-slate-900 dark:text-white mt-1 font-mono">
                      {buyer.gst_number}
                    </p>
                  </div>
                )}

                {buyer.pan_number && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      PAN Number
                    </p>
                    <p className="text-sm text-slate-900 dark:text-white mt-1 font-mono">
                      {buyer.pan_number}
                    </p>
                  </div>
                )}

                {buyer.tin_number && (
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      TIN Number
                    </p>
                    <p className="text-sm text-slate-900 dark:text-white mt-1 font-mono">
                      {buyer.tin_number}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Metadata Section */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Record Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    Created
                  </p>
                  <p className="text-sm text-slate-900 dark:text-white mt-1">
                    {formatDateTime(buyer.created_at)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Activity className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    Last Updated
                  </p>
                  <p className="text-sm text-slate-900 dark:text-white mt-1">
                    {formatDateTime(buyer.updated_at)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={handleEdit}>
              Edit Buyer
            </Button>
            <Button variant="outline" onClick={() => setIsChangeStatusOpen(true)}>
              Change Status
            </Button>
          </div>
        </div>
      </DialogContent>

      <ChangeStatusDialog
        open={isChangeStatusOpen}
        onClose={() => setIsChangeStatusOpen(false)}
        onConfirm={handleStatusChange}
        currentStatus={buyer.status}
        statusOptions={BUYER_STATUS_OPTIONS}
        title="Change Buyer Status"
        description="Select a new status for this buyer account"
        entityName="buyer"
      />
    </Dialog>
  );
}
