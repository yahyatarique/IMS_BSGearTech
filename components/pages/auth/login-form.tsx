'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { LoginSchema } from '@/schemas/user.schema';
import type { LoginInput } from '@/services/types/auth.api.type';
import { login } from '@/services/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { InlineErrorMessage } from '@/components/ui/error-message';
import Image from 'next/image';
import Link from 'next/link';
import { success } from '../../../hooks/use-toast';

export function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      username: '',
      password: '',
      rememberMe: false,
    },
  });

  async function onSubmit(values: LoginInput) {
    try {
      setIsLoading(true);
      setError(null);

      const res = await login(values);

      if (res.data.success) {
        // Store user data in localStorage for faster initial navigation load
        if (res.data.data.user) {
          localStorage.setItem('userInfo', JSON.stringify(res.data.data.user));
        }

        router.push('/');

        success({
          title: 'Login Successful',
          description: 'You have successfully logged in.',
        });

        setTimeout(router.refresh, 1000);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className='grid min-h-screen lg:grid-cols-2'>
      {/* Left Column - Image */}
      <div className='relative hidden lg:block bg-gradient-to-br from-slate-900 to-slate-700'>
        <div className='absolute inset-0 bg-grid-pattern opacity-10'></div>
        <div className='relative z-10 flex h-full flex-col items-center justify-center p-12 text-white'>
          <div className='mb-8'>
            <div className='flex items-center gap-3 mb-4'>
              <div className='w-16 h-16 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center'>
                <svg className='w-10 h-10' fill='currentColor' viewBox='0 0 24 24'>
                  <path d='M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' />
                </svg>
              </div>
              <div>
                <h1 className='text-4xl font-bold'>BS GearTech</h1>
                <p className='text-sm text-slate-300'>Precision Engineering Solutions</p>
              </div>
            </div>
          </div>

          <div className='max-w-md text-center space-y-4'>
            <h2 className='text-2xl font-semibold'>Manufacturing Excellence in Mechanical Components</h2>

            {/*             
            <div className="grid grid-cols-3 gap-4 pt-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold mb-1">25+</div>
                <div className="text-xs text-slate-300">Years Experience</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold mb-1">500+</div>
                <div className="text-xs text-slate-300">Products</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold mb-1">100%</div>
                <div className="text-xs text-slate-300">Quality</div>
              </div>
            </div> */}
          </div>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className='relative flex items-center justify-center p-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800'>
        {/* Background Image */}
        <div className='absolute inset-0 rotate-180'>
          <Image
            src='/images/login/loginBg.jpg'
            alt='BS GearTech - Precision Engineering'
            fill
            className='object-cover'
            priority
          />
          {/* Dark overlay for better text readability */}
          <div className='absolute inset-0 bg-gradient-to-br from-blue-900/80 via-slate-900/70 to-slate-800/80 dark:from-blue-950/90 dark:via-slate-950/80 dark:to-black/90'></div>
        </div>

        <Card className='w-full max-w-md relative z-10 shadow-2xl'>
          <CardHeader className='space-y-1'>
            <div className='flex items-center gap-2 mb-4 lg:hidden'>
              <div className='w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center'>
                <svg className='w-6 h-6' fill='currentColor' viewBox='0 0 24 24'>
                  <path d='M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' />
                </svg>
              </div>
              <div>
                <div className='font-bold text-lg'>BS GearTech</div>
                <div className='text-xs text-muted-foreground'>IMS Portal</div>
              </div>
            </div>
            <CardTitle className='text-2xl'>Welcome Back</CardTitle>
            <CardDescription>Enter your credentials to access the inventory system</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
                <InlineErrorMessage error={error} />

                <FormField
                  control={form.control}
                  name='username'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder='Enter your username' {...field} disabled={isLoading} className='h-11' />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='password'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type='password'
                          placeholder='Enter your password'
                          {...field}
                          disabled={isLoading}
                          className='h-11'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className='flex items-center justify-between text-sm'>
                  <FormField
                    control={form.control}
                    name='rememberMe'
                    render={({ field }) => (
                      <FormItem className='flex flex-row items-center space-x-2 space-y-0'>
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormLabel className='text-sm font-normal cursor-pointer'>
                          Remember me
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  <Link href='/forgot-password' className='text-primary hover:underline'>
                    Forgot password?
                  </Link>
                </div>

                <Button type='submit' className='w-full h-11' disabled={isLoading}>
                  {isLoading ? (
                    <div className='flex items-center gap-2'>
                      <div className='w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin'></div>
                      Logging in...
                    </div>
                  ) : (
                    'Login'
                  )}
                </Button>
              </form>
            </Form>

            <div className='mt-6 space-y-4'>
              <div className='relative'>
                <div className='absolute inset-0 flex items-center'>
                  <div className='w-full border-t border-slate-200 dark:border-slate-700'></div>
                </div>
                <div className='relative flex justify-center text-xs uppercase'>
                  <span className='bg-white dark:bg-slate-900 px-2 text-muted-foreground backdrop-blur-sm'>Or</span>
                </div>
              </div>

              <Link
                href='/register'
                className='w-full flex items-center justify-center py-2 transition-colors rounded-md backdrop-blur-sm hover:bg-gray-200 bg-white/50 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50'>
                Create an account
              </Link>

              <div className='text-center text-sm text-muted-foreground'>
                <p>Secure access to inventory management</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
