'use client';

import { useState } from 'react';
import { BuyerRecord } from '@/services/types/buyer.api.type';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GradientBorderCard } from '@/components/ui/gradient-border-card';
import { Pencil, Trash2, Mail, Phone, MapPin, Building2, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BuyerCardProps {
  buyer: BuyerRecord;
  onEdit: (buyer: BuyerRecord) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, currentStatus: 'active' | 'inactive' | 'blocked') => void;
}

export function BuyerCard({ buyer, onEdit, onDelete, onToggleStatus }: BuyerCardProps) {
  const [expanded, setExpanded] = useState(false);

  const statusColors = {
    active: 'bg-green-500/10 text-green-500 border-green-500/20',
    inactive: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
    blocked: 'bg-red-500/10 text-red-500 border-red-500/20',
  };

  return (
    <GradientBorderCard
      className={cn(
        'p-6 hover:shadow-lg transition-all duration-200 cursor-pointer',
        expanded && 'shadow-xl'
      )}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="space-y-4">
        {/* Header Section */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {buyer.name}
            </h3>
            {buyer.org_name && (
              <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                {buyer.org_name}
              </p>
            )}
          </div>
          <Badge className={cn('border', statusColors[buyer.status])}>
            {buyer.status.toUpperCase()}
          </Badge>
        </div>

        {/* Quick Contact Info */}
        {buyer.contact_details && (
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
            {buyer.contact_details.email && (
              <span className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {buyer.contact_details.email}
              </span>
            )}
            {buyer.contact_details.mobile && (
              <span className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                {buyer.contact_details.mobile}
              </span>
            )}
          </div>
        )}

        {/* Expanded Details */}
        {expanded && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
            {/* Contact Details */}
            {buyer.contact_details && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {buyer.contact_details.phone && (
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">Phone</label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {buyer.contact_details.phone}
                    </p>
                  </div>
                )}
                {buyer.contact_details.address && (
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">Address</label>
                    <p className="text-sm text-gray-900 dark:text-white flex items-start gap-2">
                      <MapPin className="w-4 h-4 mt-0.5" />
                      {buyer.contact_details.address}
                      {buyer.contact_details.city && `, ${buyer.contact_details.city}`}
                      {buyer.contact_details.state && `, ${buyer.contact_details.state}`}
                      {buyer.contact_details.pincode && ` - ${buyer.contact_details.pincode}`}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Organization Address */}
            {buyer.org_address && (
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">
                  Organization Address
                </label>
                <p className="text-sm text-gray-900 dark:text-white">{buyer.org_address}</p>
              </div>
            )}

            {/* Tax Information */}
            {(buyer.gst_number || buyer.pan_number || buyer.tin_number) && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {buyer.gst_number && (
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      GST Number
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white font-mono">
                      {buyer.gst_number}
                    </p>
                  </div>
                )}
                {buyer.pan_number && (
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      PAN Number
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white font-mono">
                      {buyer.pan_number}
                    </p>
                  </div>
                )}
                {buyer.tin_number && (
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      TIN Number
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white font-mono">
                      {buyer.tin_number}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Timestamps */}
            <div className="text-xs text-gray-500 dark:text-gray-400 flex gap-4">
              <span>Created: {new Date(buyer.created_at).toLocaleDateString()}</span>
              <span>Updated: {new Date(buyer.updated_at).toLocaleDateString()}</span>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(buyer)}
                className="flex items-center gap-2"
              >
                <Pencil className="w-4 h-4" />
                Edit
              </Button>
              <Button
                size="sm"
                variant="outline"
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
                size="sm"
                variant="outline"
                onClick={() => onDelete(buyer.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Expand Indicator */}
        <div className="text-center text-xs text-gray-400 dark:text-gray-500">
          {expanded ? '▲ Click to collapse' : '▼ Click to expand'}
        </div>
      </div>
    </GradientBorderCard>
  );
}
