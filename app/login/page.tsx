import type { Metadata } from 'next';
import { LoginForm } from '@/components/pages/auth/login-form'

export const metadata: Metadata = {
  title: 'BSGearTech IMS - Login',
  description: 'Login to your account',
};

export default function LoginPage() {
  return <LoginForm />
}
