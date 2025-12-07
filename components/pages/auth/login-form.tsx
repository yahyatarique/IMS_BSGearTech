'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { LoginSchema } from '@/schemas/user.schema';
import type { LoginInput } from '@/services/types/auth.api.type';
import { login } from '@/services/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { InlineErrorMessage } from '@/components/ui/error-message';
import Image from 'next/image';
import { success } from '../../../hooks/use-toast';
import { useAuth } from '../../../contexts/AuthContext';
import { useRouter } from '@bprogress/next/app';

function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

export function LoginForm() {
  const router = useRouter();
  const { updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      username: '',
      password: '',
      rememberMe: false
    }
  });

  useEffect(() => {
    const savedUsername = getCookie('rememberedUsername');
    if (savedUsername) {
      form.setValue('username', savedUsername);
      form.setValue('rememberMe', true);
    }
  }, [form]);

  async function onSubmit(values: LoginInput) {
    try {
      setIsLoading(true);
      setError(null);

      const res = await login(values);

      if (res.data.success) {
        // Store user data in localStorage for faster initial navigation load
        if (res.data.data.user) {
          updateUser(res.data.data.user);
        }

        // Handle remember me
        if (values.rememberMe) {
          setCookie('rememberedUsername', values.username, 30);
        } else {
          deleteCookie('rememberedUsername');
        }

        success({
          title: 'Login Successful',
          description: 'You have successfully logged in.'
        });

        router.push('/');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left Column - Image */}
      <div className="relative hidden lg:block bg-gradient-to-br from-slate-900 to-slate-700">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="relative z-10 flex h-full flex-col items-center justify-center p-12 text-white">
          <div className="mb-8">
            <div className="flex justify-center mb-6">
              <Image
                src="/images/logo/bs_geartech_logo.png"
                alt="BS GearTech Logo"
                width={300}
                height={90}
                unoptimized
                className="h-16 w-auto"
              />
            </div>
            <p className="text-center text-sm text-slate-300">Precision Engineering Solutions</p>
          </div>

          <div className="max-w-md text-center space-y-4">
            <h2 className="text-2xl font-semibold">
              Manufacturing Excellence in Mechanical Components
            </h2>
                        
            {/* <div className="grid grid-cols-3 gap-4 pt-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold mb-1">50+</div>
                <div className="text-xs text-slate-300">Customers</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold mb-1">60+</div>
                <div className="text-xs text-slate-300">Products</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold mb-1">30+</div>
                <div className="text-xs text-slate-300">Team members</div>
              </div>
            </div> */}
          </div>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="relative flex items-center justify-center p-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        {/* Background Image */}
        <div className="absolute inset-0 rotate-180">
          <Image
            src="/images/login/loginBg.jpg"
            alt="BS GearTech - Precision Engineering"
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-slate-900/70 to-slate-800/80 dark:from-blue-950/90 dark:via-slate-950/80 dark:to-black/90"></div>
        </div>

        <Card className="w-full max-w-md relative z-10 shadow-2xl">
          <CardHeader className="space-y-1">
            <div className="flex justify-center py-2 rounded-lg bg-slate-600 dark:bg-slate-900  mb-6 lg:hidden">
              <Image
                src="/images/logo/bs_geartech_logo.png"
                alt="BS GearTech Logo"
                width={200}
                height={60}
                unoptimized
                className="h-12 w-auto"
              />
            </div>
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>Enter your credentials to access the inventory system</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <InlineErrorMessage error={error} />

                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your username"
                          {...field}
                          disabled={isLoading}
                          className="h-11"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={isPasswordVisible ? 'text' : 'password'}
                            placeholder="Enter your password"
                            {...field}
                            disabled={isLoading}
                            className="h-11 pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground hover:scale-110 active:scale-95 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-md p-0.5"
                            disabled={isLoading}
                          >
                            <div className="relative w-5 h-5">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className={`w-5 h-5 absolute inset-0 transition-all duration-300 ${
                                  isPasswordVisible
                                    ? 'opacity-100 rotate-0 scale-100'
                                    : 'opacity-0 rotate-90 scale-50'
                                }`}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                                />
                              </svg>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className={`w-5 h-5 absolute inset-0 transition-all duration-300 ${
                                  isPasswordVisible
                                    ? 'opacity-0 -rotate-90 scale-50'
                                    : 'opacity-100 rotate-0 scale-100'
                                }`}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                              </svg>
                            </div>
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center justify-between text-sm">
                  <FormField
                    control={form.control}
                    name="rememberMe"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal cursor-pointer">
                          Remember me
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  {/* <Link href="/forgot-password" className="text-primary hover:underline">
                    Forgot password?
                  </Link> */}
                </div>

                <Button type="submit" className="w-full h-11" disabled={isLoading}>
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      Logging in...
                    </div>
                  ) : (
                    'Login'
                  )}
                </Button>
              </form>
            </Form>

            <div className="mt-6 space-y-4">
              {/* <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-slate-900 px-2 text-muted-foreground backdrop-blur-sm">
                    Or
                  </span>
                </div>
              </div> */}

              {/* <Link
                href="/register"
                className="w-full flex items-center justify-center py-2 transition-colors rounded-md backdrop-blur-sm hover:bg-gray-200 bg-white/50 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50"
              >
                Create an account
              </Link> */}

              <div className="text-center text-sm text-muted-foreground">
                <p>Secure access to inventory management</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
