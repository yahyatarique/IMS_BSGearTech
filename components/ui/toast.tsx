"use client"

import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-lg border p-4 pr-6 shadow-lg backdrop-blur-sm transition-all duration-300 data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full data-[state=open]:duration-300 data-[state=closed]:duration-200",
  {
    variants: {
      variant: {
        default: "border-slate-200 dark:border-slate-700 bg-gradient-to-br from-white/95 to-slate-50/95 dark:from-slate-900/95 dark:to-slate-800/95 text-foreground shadow-xl",
        destructive:
          "border-red-200/50 dark:border-red-900/50 bg-gradient-to-br from-red-50/95 via-red-100/90 to-red-200/95 dark:from-red-950/95 dark:via-red-900/90 dark:to-red-950/95 text-red-900 dark:text-red-100 shadow-xl shadow-red-500/20",
        success:
          "border-emerald-200/50 dark:border-emerald-900/50 bg-gradient-to-br from-emerald-50/95 via-emerald-100/90 to-emerald-200/95 dark:from-emerald-950/95 dark:via-emerald-900/90 dark:to-emerald-950/95 text-emerald-900 dark:text-emerald-100 shadow-xl shadow-emerald-500/20",
        warning:
          "border-amber-200/50 dark:border-amber-900/50 bg-gradient-to-br from-amber-50/95 via-amber-100/90 to-amber-200/95 dark:from-amber-950/95 dark:via-amber-900/90 dark:to-amber-950/95 text-amber-900 dark:text-amber-100 shadow-xl shadow-amber-500/20",
        info:
          "border-blue-200/50 dark:border-blue-900/50 bg-gradient-to-br from-blue-50/95 via-blue-100/90 to-blue-200/95 dark:from-blue-950/95 dark:via-blue-900/90 dark:to-blue-950/95 text-blue-900 dark:text-blue-100 shadow-xl shadow-blue-500/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  )
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium transition-colors hover:bg-secondary focus:outline-none focus:ring-1 focus:ring-ring disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive",
      className
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-1 top-1 rounded-md p-1 text-foreground/50 opacity-0 transition-all duration-200 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 group-hover:opacity-100 group-[.destructive]:text-red-600 dark:group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-900 dark:group-[.destructive]:hover:text-red-50 group-[.destructive]:hover:bg-red-100 dark:group-[.destructive]:hover:bg-red-900/20 group-[.destructive]:focus:ring-red-400 group-[.success]:text-emerald-600 dark:group-[.success]:text-emerald-300 group-[.success]:hover:bg-emerald-100 dark:group-[.success]:hover:bg-emerald-900/20 group-[.warning]:text-amber-600 dark:group-[.warning]:text-amber-300 group-[.warning]:hover:bg-amber-100 dark:group-[.warning]:hover:bg-amber-900/20 group-[.info]:text-blue-600 dark:group-[.info]:text-blue-300 group-[.info]:hover:bg-blue-100 dark:group-[.info]:hover:bg-blue-900/20",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-semibold tracking-tight [&+div]:text-xs", className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-sm opacity-90 leading-relaxed", className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>

type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
}
