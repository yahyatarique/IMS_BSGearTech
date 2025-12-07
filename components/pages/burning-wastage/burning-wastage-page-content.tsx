'use client';

import { useEffect, useState } from 'react';
import {
  fetchBurningWastage,
  createBurningWastage,
  deleteBurningWastage
} from '@/services/burning-wastage';
import type { BurningWastageRecord } from '@/services/types/burning-wastage.api.type';
import { GradientBorderCard } from '@/components/ui/gradient-border-card';
import { GradientText } from '@/components/ui/gradient-text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Flame, Trash2, Calendar } from 'lucide-react';
import { success as successToast, error as errorToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateBurningWastageSchema } from '@/schemas/burning-wastage.schema';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { formatDate } from '@/lib/utils';




export function BurningWastagePageContent() {
  const [wastageEntries, setWastageEntries] = useState<BurningWastageRecord[]>([]);
  const [totalWastage, setTotalWastage] = useState<number>(0);
  const [orderBurningWastage, setOrderBurningWastage] = useState<number>(0);
  const [manualAdjustments, setManualAdjustments] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const form = useForm({
    resolver: zodResolver(CreateBurningWastageSchema),
    defaultValues: {
      wastage_kg: 0,
      notes: ''
    }
  });

  const loadWastageData = async () => {
    try {
      setIsLoading(true);
      const response = await fetchBurningWastage(1, 100); // Load more entries
      if (response.success && response.data) {
        setWastageEntries(response.data.wastageEntries);
        setTotalWastage(response.data.meta.totalWastage);
        setOrderBurningWastage(response.data.meta.orderBurningWastage || 0);
        setManualAdjustments(response.data.meta.manualAdjustments || 0);
      }
    } catch (error: any) {
      errorToast({
        title: 'Error',
        description: error.message || 'Failed to load burning wastage data'
      });
      console.error('Error loading wastage:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWastageData();
  }, []);

  const handleSubmit = async (values: any) => {
    try {
      setIsSubmitting(true);

      await createBurningWastage({
        wastage_kg: Number(values.wastage_kg),
        notes: values.notes || undefined
      });

      successToast({
        title: 'Success',
        description: 'Wastage disposal recorded successfully'
      });
      form.reset();
      setIsDialogOpen(false);
      loadWastageData();
    } catch (error: any) {
      errorToast(error.response?.data?.message || 'Failed to add wastage entry');
      console.error('Error creating wastage:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteBurningWastage(deleteId);
      successToast({
        title: 'Success',
        description: 'Wastage entry deleted successfully'
      });
      setDeleteId(null);
      loadWastageData();
    } catch (error: any) {
      errorToast(error.response?.data?.message || 'Failed to delete wastage entry');
      console.error('Error deleting wastage:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Total Wastage Card */}
      <GradientBorderCard gradient="orange-red" className="p-6">
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <Flame className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                Total Burning Wastage
              </p>
              <GradientText gradient="orange" className="text-3xl font-bold">
                {totalWastage.toFixed(2)} kg
              </GradientText>
              <div className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-400">
                <p>From Completed Orders: <span className="font-semibold text-orange-600 dark:text-orange-400">{orderBurningWastage.toFixed(2)} kg</span></p>
                <p>Disposed/Sold: <span className="font-semibold text-green-600 dark:text-green-400">{manualAdjustments.toFixed(2)} kg</span></p>
              </div>
            </div>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" variant="outline">
                <Flame className="w-4 h-4" />
                Record Disposal/Sale
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Wastage Disposal/Sale</DialogTitle>
                <DialogDescription>
                  Enter the amount of burning wastage disposed of or sold (negative value)
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="wastage_kg"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount Disposed (kg)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="e.g., -3.2 for 3.2 kg disposed"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Enter negative value only (e.g., -5 to remove 5 kg)
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Sold to scrap dealer, Disposed, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Recording...' : 'Record Disposal'}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </GradientBorderCard>

      {/* Wastage Entries Table */}
      <GradientBorderCard>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Disposal/Sale History
          </h3>

          {wastageEntries.length === 0 ? (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              <Flame className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No disposal records found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount Disposed (kg)</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {wastageEntries.map((entry) => {
                    return (
                      <TableRow key={entry.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            {formatDate(new Date(entry.date))}
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold text-green-600 dark:text-green-400">
                          {Number(entry.wastage_kg).toFixed(2)} kg
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{entry.notes || '-'}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteId(entry.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </GradientBorderCard>

      <ConfirmationDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Wastage Entry"
        description="Are you sure you want to delete this wastage entry? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
      />
    </div>
  );
}
