'use client'

import { Component, ErrorInfo, ReactNode } from 'react'

interface StatsSectionBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface StatsSectionBoundaryState {
  hasError: boolean
}

export class StatsSectionBoundary extends Component<StatsSectionBoundaryProps, StatsSectionBoundaryState> {
  state: StatsSectionBoundaryState = {
    hasError: false,
  }

  static getDerivedStateFromError(): StatsSectionBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Stats section rendering error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-800/60 dark:bg-red-950/40">
          Unable to load dashboard statistics. Please refresh the page.
        </div>
      )
    }

    return this.props.children
  }
}
