'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { GradientBorderCard } from '@/components/ui/gradient-border-card';
import { error as errorToast } from '@/hooks/use-toast';
import { Package, Ruler, Scale, X, Loader2, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { MaterialStats } from '@/services/types/inventory.api.type';
import { fetchInventoryStats } from '@/services/inventory';

const STATUS_STYLES = {
  'in-stock': 'bg-green-500/10 text-green-700 dark:text-green-500 border-green-500/20',
  'low-stock': 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-500 border-yellow-500/20',
  'out-of-stock': 'bg-red-500/10 text-red-700 dark:text-red-500 border-red-500/20'
} as const;

const STATUS_LABELS = {
  'in-stock': 'In Stock',
  'low-stock': 'Low Stock',
  'out-of-stock': 'Out of Stock'
} as const;

interface InventoryStatsCardsProps {
  onClose?: () => void;
}

export function InventoryStatsCards({ onClose }: InventoryStatsCardsProps) {
  const [stats, setStats] = useState<MaterialStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedMaterial, setExpandedMaterial] = useState<string | null>(null);
  const [sortField, setSortField] = useState<'dimensions' | 'available' | 'total'>('dimensions');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetchInventoryStats();
      if (response.success) {
        setStats(response.data.stats);
      }
    } catch (err: any) {
      const message = err.message || 'Failed to load inventory stats';
      setError(message);
      errorToast({
        title: 'Error',
        description: message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sortStats = (materialStats: MaterialStats[number]) => {
    return [...materialStats].sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'dimensions':
          comparison = a.dimensions.outer_diameter - b.dimensions.outer_diameter || 
                      a.dimensions.length - b.dimensions.length;
          break;
        case 'available':
          comparison = a.available.quantity - b.available.quantity;
          break;
        case 'total':
          comparison = a.total.quantity - b.total.quantity;
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  };

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8">
        <p className="text-muted-foreground">Failed to load inventory stats</p>
        <Button onClick={loadStats}>Retry</Button>
      </div>
    );
  }

  const renderSortIndicator = (field: typeof sortField) => {
    if (sortField !== field) return null;
    return (
      <ArrowUpDown className={cn(
        "h-3 w-3 transition-transform",
        sortDirection === 'desc' && "rotate-180"
      )} />
    );
  };

  return (
    <div className="space-y-6">
      {onClose && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(stats).map(([materialType, materialStats]) => (
          <GradientBorderCard key={materialType} className="overflow-hidden">
            <div className="p-6 space-y-4">
              {/* Material Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{materialType}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedMaterial(
                    expandedMaterial === materialType ? null : materialType
                  )}
                >
                  {expandedMaterial === materialType ? 'Show Less' : 'Show All'}
                </Button>
              </div>

              {/* Stats List */}
              <div className="space-y-3">
                {sortStats(materialStats)
                  .slice(0, expandedMaterial === materialType ? undefined : 1)
                  .map((stat, index) => (
                    <div
                      key={`${stat.dimensions.outer_diameter}-${stat.dimensions.length}-${index}`}
                      className="bg-card p-3 rounded-lg space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {stat.dimensions.outer_diameter}mm OD × {stat.dimensions.length}mm L
                        </span>
                        <Badge
                          variant="outline"
                          className={cn(STATUS_STYLES[stat.status])}
                        >
                          {STATUS_LABELS[stat.status]}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Available</p>
                          <p className="font-medium">
                            {stat.available.quantity} pcs
                            <br />
                            {stat.available.weight.toFixed(2)} {stat.unit}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Pending</p>
                          <p className="font-medium">
                            {stat.pending.quantity} pcs
                            <br />
                            {stat.pending.weight.toFixed(2)} {stat.unit}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Total</p>
                          <p className="font-medium">
                            {stat.total.quantity} pcs
                            <br />
                            {stat.total.weight.toFixed(2)} {stat.unit}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                
                {materialStats.length > 3 && expandedMaterial !== materialType && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-primary"
                    onClick={() => setExpandedMaterial(materialType)}
                  >
                    Show {materialStats.length - 3} more sizes...
                  </Button>
                )}
              </div>
            </div>
          </GradientBorderCard>
        ))}
      </div>
    </div>
  );
}