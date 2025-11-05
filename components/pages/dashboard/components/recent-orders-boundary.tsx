'use client'

import { Component, ErrorInfo, ReactNode } from 'react'

interface RecentOrdersBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface RecentOrdersBoundaryState {
  hasError: boolean
}

export class RecentOrdersBoundary extends Component<RecentOrdersBoundaryProps, RecentOrdersBoundaryState> {
  state: RecentOrdersBoundaryState = {
    hasError: false,
  }

  static getDerivedStateFromError(): RecentOrdersBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Recent orders section error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-800/60 dark:bg-red-950/40">
          Unable to load recent orders. Please refresh and try again.
        </div>
      )
    }

    return this.props.children
  }
}
