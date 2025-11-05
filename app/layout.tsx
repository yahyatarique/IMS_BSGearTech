import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import RootWrapper from "../components/pages/root/RootWrapper";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BSGearTech IMS",
  description: "Inventory Management System for BS GearTech",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
       <RootWrapper>
         {children}
       </RootWrapper>
       <Toaster />
      </body>
    </html>
  );
}
