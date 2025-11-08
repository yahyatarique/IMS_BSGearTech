import { AlertCircle, XCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ReactNode } from 'react'

interface ErrorMessageProps {
  error: any
  title?: string
  className?: string
  variant?: 'default' | 'destructive'
}

/**
 * ErrorMessage Component
 * 
 * Intelligently handles and displays different types of errors:
 * - API response errors (with message property)
 * - Validation errors (with details array)
 * - Standard Error objects
 * - String errors
 * - Axios errors (response.data.message or response.data.error)
 */
export function ErrorMessage({ 
  error, 
  title = 'Error', 
  className = '',
  variant = 'destructive' 
}: ErrorMessageProps) {
  if (!error) return null

  // Extract error message from various error formats
  const getErrorMessage = (): string | ReactNode => {
    // Handle null/undefined
    if (!error) return 'An unknown error occurred'

    // Handle string errors
    if (typeof error === 'string') return error

    // Handle Axios errors with response
    if (error.response?.data) {
      const data = error.response.data

      // Check for API response format (message field)
      if (data.message) return data.message
      
      // Check for error field
      if (data.error) {
        // If error is a string
        if (typeof data.error === 'string') return data.error

        // If error is an object with details (validation errors)
        if (data.error.details && Array.isArray(data.error.details)) {
          return (
            <div className="space-y-1">
              <p className="font-medium">Validation failed:</p>
              <ul className="list-disc list-inside space-y-0.5 text-sm">
                {data.error.details.map((detail: any, index: number) => (
                  <li key={index}>
                    {detail.message || detail.path || JSON.stringify(detail)}
                  </li>
                ))}
              </ul>
            </div>
          )
        }

        // If error is an array (validation errors)
        if (Array.isArray(data.error)) {
          return (
            <div className="space-y-1">
              <p className="font-medium">Validation failed:</p>
              <ul className="list-disc list-inside space-y-0.5 text-sm">
                {data.error.map((err: any, index: number) => (
                  <li key={index}>
                    {err.message || err.path || JSON.stringify(err)}
                  </li>
                ))}
              </ul>
            </div>
          )
        }
      }
    }

    // Handle standard Error objects
    if (error instanceof Error) {
      return error.message
    }

    // Handle objects with message property
    if (error.message) {
      return error.message
    }

    // Handle objects with error property
    if (error.error) {
      if (typeof error.error === 'string') return error.error
      if (error.error.message) return error.error.message
    }

    // Fallback - try to stringify
    try {
      const str = JSON.stringify(error)
      if (str !== '{}') return str
    } catch (e) {
      // JSON.stringify failed
    }

    return 'An unknown error occurred'
  }

  const errorMessage = getErrorMessage()

  return (
    <Alert variant={variant} className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        {typeof errorMessage === 'string' ? (
          <p>{errorMessage}</p>
        ) : (
          errorMessage
        )}
      </AlertDescription>
    </Alert>
  )
}

/**
 * Inline error message variant (without Alert wrapper)
 * Useful for inline form errors
 */
export function InlineErrorMessage({ 
  error, 
  className = '' 
}: Omit<ErrorMessageProps, 'title' | 'variant'>) {
  if (!error) return null

  const getErrorMessage = (): string => {
    if (!error) return 'An unknown error occurred'
    if (typeof error === 'string') return error
    
    if (error.response?.data) {
      const data = error.response.data
      if (data.message) return data.message
      if (typeof data.error === 'string') return data.error
    }
    
    if (error instanceof Error) return error.message
    if (error.message) return error.message
    if (error.error && typeof error.error === 'string') return error.error
    
    return 'An unknown error occurred'
  }

  return (
    <div className={`rounded-md bg-destructive/15 p-3 text-sm text-destructive border border-destructive/30 ${className}`}>
      <div className="flex items-start gap-2">
        <XCircle className="text-red-500 dark:text-red-700 h-4 w-4 mt-0.5 flex-shrink-0" />
        <p className="flex-1 text-red-500 dark:text-red-700">{getErrorMessage()}</p>
      </div>
    </div>
  )
}
