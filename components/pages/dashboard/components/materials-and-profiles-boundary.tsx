'use client'

import { Component, ErrorInfo, ReactNode } from 'react'

interface MateraiAndProfilesProps {
  children: ReactNode
  fallback?: ReactNode
}

interface MateraiAndProfilesState {
  hasError: boolean
}

export class MateraiAndProfilesBoundary extends Component<MateraiAndProfilesProps, MateraiAndProfilesState> {
  state: MateraiAndProfilesState = {
    hasError: false,
  }

  static getDerivedStateFromError(): MateraiAndProfilesState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Materials and Profiles section error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-800/60 dark:bg-red-950/40">
          Unable to load Materials and Profiles. Please refresh and try again.
        </div>
      )
    }

    return this.props.children
  }
}
