'use client';

import { useState, useEffect } from 'react';
import { AxiosError } from 'axios';
import { Edit2 } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { updateUser } from '@/services/users';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import type { UserRecord } from '@/services/types/users.api.type';

const editUserSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters')
});

type FormData = z.infer<typeof editUserSchema>;

interface EditUserDialogProps {
  user: UserRecord;
  onSuccess?: () => void;
  disabled?: boolean;
}

export function EditUserDialog({ user, onSuccess, disabled }: EditUserDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      firstName: user.first_name,
      lastName: user.last_name
    }
  });

  // Reset form when user changes or dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        firstName: user.first_name,
        lastName: user.last_name
      });
    }
  }, [open, user, form]);

  const handleSubmit = async (data: FormData) => {
    setIsLoading(true);

    try {
      const response = await updateUser(user.id, {
        firstName: data.firstName,
        lastName: data.lastName
      });

      toast({
        title: 'Success!',
        description: response.data.message || 'User updated successfully',
        variant: 'success'
      });

      setOpen(false);

      // Call onSuccess callback to refresh the users list
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string; error?: string }>;
      const apiMessage = axiosError.response?.data?.message ?? axiosError.response?.data?.error;

      toast({
        title: 'Error',
        description: apiMessage ?? 'Failed to update user. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled}>
          <Edit2 className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500">
              <Edit2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>Update user details for {user.username}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Account Information
              </h3>

              <div className="space-y-2">
                <Label>Username</Label>
                <Input value={user.username} disabled className="bg-slate-100 dark:bg-slate-800" />
                <p className="text-xs text-muted-foreground">Username cannot be changed</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Personal Information
              </h3>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="John" disabled={isLoading} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" disabled={isLoading} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="rounded-md border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/20">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Note:</strong> Use the status toggle and delete buttons in the table to manage user status and removal.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600"
              >
                {isLoading ? 'Updating...' : 'Update User'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
