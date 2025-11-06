import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GradientBorderCard } from '@/components/ui/gradient-border-card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { BuyerRecord } from '@/services/types/buyer.api.type';
import { Building2, Mail, Phone, FileText } from 'lucide-react';

const statusClasses: Record<BuyerRecord['status'], string> = {
  active: 'bg-green-500/10 text-green-700 dark:text-green-500 border-green-500/20',
  inactive: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-500 border-yellow-500/20',
  blocked: 'bg-red-500/10 text-red-700 dark:text-red-500 border-red-500/20'
};

function getStatusLabel(status: BuyerRecord['status']) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

interface BuyersCardGridProps {
  buyers: BuyerRecord[];
  isLoading: boolean;
  onCardClick: (buyer: BuyerRecord) => void;
}

function CardSkeleton() {
  return (
    <GradientBorderCard >
      <div className="space-y-4 p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    </GradientBorderCard>
  );
}

export function BuyersCardGrid({ buyers, isLoading, onCardClick }: BuyersCardGridProps) {
  // Event delegation handler - single handler for all cards
  const handleGridClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const cardElement = (event.target as HTMLElement).closest('[data-buyer-id]');
    if (!cardElement) return;

    const buyerId = cardElement.getAttribute('data-buyer-id');
    const buyer = buyers.find((b) => b.id === buyerId);
    if (buyer) {
      onCardClick(buyer);
    }
  };

  if (isLoading && buyers.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <CardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (buyers.length === 0) {
    return (
      <GradientBorderCard className="p-12 text-center">
        <Building2 className="w-12 h-12 mx-auto text-slate-400 mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
          No Buyers Found
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          There are no buyers to display. Create your first buyer to get started.
        </p>
      </GradientBorderCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Card Grid with Event Delegation */}
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        onClick={handleGridClick}
      >
        {buyers.map((buyer) => (
          <GradientBorderCard
            key={buyer.id}
            data-buyer-id={buyer.id}
            className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02]"
          >
            <div className="space-y-4 p-6">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white truncate">
                    {buyer.name}
                  </h3>
                  {buyer.org_name && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate mt-1">
                      {buyer.org_name}
                    </p>
                  )}
                </div>
                <Badge
                  variant="outline"
                  className={cn('border ml-2 flex-shrink-0', statusClasses[buyer.status])}
                >
                  {getStatusLabel(buyer.status)}
                </Badge>
              </div>

              {/* Details */}
              <div className="space-y-3">
                {/* Contact Info */}
                {(buyer.contact_details?.email || buyer.contact_details?.mobile) && (
                  <div className="space-y-2">
                    {buyer.contact_details?.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <span className="text-slate-600 dark:text-slate-300 truncate">
                          {buyer.contact_details.email}
                        </span>
                      </div>
                    )}
                    {buyer.contact_details?.mobile && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <span className="text-slate-600 dark:text-slate-300">
                          {buyer.contact_details.mobile}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* GST Number */}
                {buyer.gst_number && (
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="text-slate-500 dark:text-slate-400 font-mono text-xs">
                      GST: {buyer.gst_number}
                    </span>
                  </div>
                )}

                {/* Organization Address (truncated) */}
                {buyer.org_address && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {buyer.org_address}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </GradientBorderCard>
        ))}
      </div>
    </div>
  );
}
