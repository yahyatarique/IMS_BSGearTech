'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';
import { UserPlus, ArrowLeft } from 'lucide-react';
import { z } from 'zod';
import { USER_ROLES } from '@/enums/users.enum';
import { createUser } from '@/services/users';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { GradientBorderCard } from '../../ui/gradient-border-card';

const createUserSchema = z
  .object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters')
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword']
  });

type FormData = z.infer<typeof createUserSchema>;

interface UserInfo {
  id: string;
  username: string;
  role: string;
  first_name: string;
  last_name: string;
}

export default function CreateUserPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const form = useForm<FormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      username: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: ''
    }
  });

  useEffect(() => {
    // Check if user is admin
    const cachedUser = localStorage.getItem('userInfo');
    if (cachedUser) {
      const user: UserInfo = JSON.parse(cachedUser);

      // Only admins can create users
      if (user.role !== USER_ROLES.SUPER_ADMIN && user.role !== USER_ROLES.ADMIN) {
        toast({
          title: 'Unauthorized',
          description: "You don't have permission to create users",
          variant: 'destructive'
        });
        router.push('/');
        return;
      }
    } else {
      router.push('/login');
      return;
    }

    setIsCheckingAuth(false);
  }, [router, toast]);

  const handleSubmitHandler = async (data: FormData) => {
    setIsLoading(true);

    try {
      const response = await createUser({
        username: data.username,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        role: USER_ROLES.USER
      });

      toast({
        title: 'Success!',
        description: response.data.message || 'User created successfully',
        variant: 'success'
      });

      // Redirect to users list
      setTimeout(() => {
        router.push('/users');
      }, 1500);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string; error?: string }>;
      const apiMessage = axiosError.response?.data?.message ?? axiosError.response?.data?.error;

      if (axiosError.response?.status === 409) {
        form.setError('username', {
          type: 'manual',
          message: apiMessage ?? 'Username already exists'
        });
      }

      toast({
        title: 'Error',
        description: apiMessage ?? 'Failed to create user. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <main className="container mx-auto flex justify-center flex-col px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent mb-2">
            Create New User
          </h1>
          <p className="text-muted-foreground">Add a new user to the system</p>
        </div>

        <Card className="max-w-2xl border shadow-lg bg-white dark:bg-slate-900">
         <GradientBorderCard>
          
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500">
                <UserPlus className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle>User Information</CardTitle>
                <CardDescription>Enter the details for the new user</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmitHandler)} className="space-y-8">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Account Information
                  </h3>

                  <div className="grid gap-4">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="johndoe"
                              disabled={isLoading}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

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
                      <strong>Note:</strong> New users will be created with "User" role by default.
                      Only users with this role can be created through this interface.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600"
                  >
                    {isLoading ? 'Creating...' : 'Create User'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
         </GradientBorderCard>
        </Card>
      </main>
    </div>
  );
}
