'use client'

import { Component, ErrorInfo, ReactNode } from 'react'

interface RecentBuyersBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface RecentBuyersBoundaryState {
  hasError: boolean
}

export class RecentBuyersBoundary extends Component<RecentBuyersBoundaryProps, RecentBuyersBoundaryState> {
  state: RecentBuyersBoundaryState = {
    hasError: false,
  }

  static getDerivedStateFromError(): RecentBuyersBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Recent buyers section error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-800/60 dark:bg-red-950/40">
          Unable to load recent buyers. Please refresh and try again.
        </div>
      )
    }

    return this.props.children
  }
}
