'use client';

import { useState, useEffect } from 'react';
import { AxiosError } from 'axios';
import { UserPlus, Edit2 } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { success, useToast } from '@/hooks/use-toast';
import { USER_ROLES } from '@/enums/users.enum';
import { createUser, updateUser } from '@/services/users';
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
import { userFormSchema } from '@/schemas/user.schema';

type FormData = z.infer<typeof userFormSchema>;

interface UserFormDialogProps {
  user?: UserRecord;
  onSuccess?: () => void;
  disabled?: boolean;
  trigger?: React.ReactNode;
}

export function UserFormDialog({ user, onSuccess, disabled, trigger }: UserFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isEditMode = !!user;

  const form = useForm<FormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: user?.username || '',
      password: '',
      confirmPassword: '',
      firstName: user?.first_name || '',
      lastName: user?.last_name || ''
    }
  });

  useEffect(() => {
    if (open) {
      form.reset({
        username: user?.username || '',
        password: '',
        confirmPassword: '',
        firstName: user?.first_name || '',
        lastName: user?.last_name || ''
      });
    }
  }, [open, user, form]);

  const handleSubmit = async (data: FormData) => {
    setIsLoading(true);

    try {
      if (isEditMode) {
        await updateUser(user.id, {
          firstName: data.firstName,
          lastName: data.lastName
        });
        success({
          title: 'Success!',
          description: 'User updated successfully'
        });
      } else {
        await createUser({
          username: data.username,
          password: data.password!,
          firstName: data.firstName,
          lastName: data.lastName,
          role: USER_ROLES.USER
        });
        success({
          title: 'Success!',
          description: 'User created successfully'
        });
      }

      if (onSuccess) {
        form.reset();
        onSuccess();
        setOpen(false);
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string; error?: string }>;
      const apiMessage = axiosError.response?.data?.message ?? axiosError.response?.data?.error;

      if (!isEditMode && axiosError.response?.status === 409) {
        form.setError('username', {
          type: 'manual',
          message: apiMessage ?? 'Username already exists'
        });
      }

      success({
        title: 'Error',
        description:
          apiMessage ?? `Failed to ${isEditMode ? 'update' : 'create'} user. Please try again.`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const Icon = isEditMode ? Edit2 : UserPlus;
  const title = isEditMode ? 'Edit User' : 'Create New User';
  const description = isEditMode
    ? `Update user details for ${user.username}`
    : 'Enter the details for the new user';

  return (
    <Dialog open={open} onOpenChange={(newOpen) => !isLoading && setOpen(newOpen)}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            className="gap-2"
            disabled={disabled}
            variant={isEditMode ? 'outline' : 'default'}
            size={isEditMode ? 'sm' : 'default'}
          >
            <Icon className="h-4 w-4" />
            {isEditMode ? '' : 'Create New User'}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500">
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Account Information
              </h3>

              <div className="grid gap-4">
                {isEditMode ? (
                  <div className="space-y-2">
                    <Label>Username</Label>
                    <Input
                      value={user.username}
                      disabled
                      className="bg-slate-100 dark:bg-slate-800"
                    />
                    <p className="text-xs text-muted-foreground">Username cannot be changed</p>
                  </div>
                ) : (
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username *</FormLabel>
                        <FormControl>
                          <Input placeholder="johndoe" disabled={isLoading} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {!isEditMode && (
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password *</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="••••••••"
                              disabled={isLoading}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password *</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="••••••••"
                              disabled={isLoading}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
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
                  <strong>Note:</strong>{' '}
                  {isEditMode
                    ? 'Use the status toggle and delete buttons in the table to manage user status and removal.'
                    : 'New users will be created with the "User" role by default. Only users with this role can be created through this interface.'}
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
                {isLoading
                  ? isEditMode
                    ? 'Updating...'
                    : 'Creating...'
                  : isEditMode
                  ? 'Update User'
                  : 'Create User'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
