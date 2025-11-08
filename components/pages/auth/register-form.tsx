'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { CreateUserSchema } from '@/schemas/user.schema'
import type { CreateUserInput } from '@/services/types/auth.api.type'
import { register } from '@/services/auth'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { InlineErrorMessage } from '@/components/ui/error-message'
import Link from 'next/link'
import { USER_ROLES } from '../../../enums/users.enum'

export function RegisterForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<CreateUserInput>({
    resolver: zodResolver(CreateUserSchema),
    defaultValues: {
      username: '',
      password: '',
      firstName: '',
      lastName: '',
      role: USER_ROLES.ADMIN,
    },
  })

  async function onSubmit(values: CreateUserInput) {
    try {
      setIsLoading(true)
      setError(null)

      const response = await register(values)
      
      // Tokens are set by the server in httpOnly cookies
      // No need to manually store them

      // Redirect to home page after successful registration
      router.push('/')
      router.refresh()
    } catch (err: any) {
      console.error('Registration error:', err)
      setError(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Card className="w-full max-w-md backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border-white/20 dark:border-slate-700/50 shadow-2xl">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-primary/10 backdrop-blur-sm rounded-lg flex items-center justify-center border border-primary/20">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div>
              <div className="font-bold text-lg">BS GearTech</div>
              <div className="text-xs text-muted-foreground">IMS Portal</div>
            </div>
          </div>
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>
            Enter your information to create a new account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <InlineErrorMessage error={error} />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="First name"
                          {...field}
                          disabled={isLoading}
                          className="h-11 backdrop-blur-sm bg-white/50 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50"
                        />
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
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Last name"
                          {...field}
                          disabled={isLoading}
                          className="h-11 backdrop-blur-sm bg-white/50 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
                        className="h-11 backdrop-blur-sm bg-white/50 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50"
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
                      <Input
                        type="password"
                        placeholder="Create a password"
                        {...field}
                        disabled={isLoading}
                        className="h-11 backdrop-blur-sm bg-white/50 dark:bg-slate-800/50 border-slate-200/50 dark:border-slate-700/50"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full h-11" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    Creating account...
                  </div>
                ) : (
                  'Create Account'
                )}
              </Button>

              <div className="text-center text-sm">
                <span className="text-muted-foreground">Already have an account? </span>
                <Link 
                  href="/login" 
                  className="text-primary hover:underline font-medium"
                >
                  Login
                </Link>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
