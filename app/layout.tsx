import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import RootWrapper from '../components/pages/root/RootWrapper';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { ConditionalNavigation } from '@/components/conditional-navigation';
import { AuthProvider } from '@/contexts/AuthContext';
import BpProvider from '../components/providers/BpProvider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
});

export const metadata: Metadata = {
  title: 'BSGearTech IMS',
  description: 'Inventory Management System for BS GearTech'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <BpProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider>
              <RootWrapper>
                <ConditionalNavigation />
                {children}
              </RootWrapper>
              <Toaster />
            </AuthProvider>
          </ThemeProvider>
        </BpProvider>
      </body>
    </html>
  );
}
