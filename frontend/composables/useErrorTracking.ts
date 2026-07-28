import * as Sentry from '@sentry/vue'

export const useErrorTracking = () => {
  const captureException = (error: Error | string, context?: any) => {
    if (process.client) {
      Sentry.captureException(error, {
        extra: context,
        tags: {
          environment: process.env.NUXT_PUBLIC_SENTRY_ENVIRONMENT || 'production',
        },
      })
    }
  }

  const captureMessage = (message: string, level?: 'info' | 'warning' | 'error') => {
    if (process.client) {
      Sentry.captureMessage(message, level || 'info')
    }
  }

  const setUser = (user: { id?: string; email?: string; username?: string }) => {
    if (process.client) {
      Sentry.setUser(user)
    }
  }

  const clearUser = () => {
    if (process.client) {
      Sentry.setUser(null)
    }
  }

  const addBreadcrumb = (breadcrumb: { message: string; category?: string; data?: any }) => {
    if (process.client) {
      Sentry.addBreadcrumb({
        message: breadcrumb.message,
        category: breadcrumb.category || 'app',
        data: breadcrumb.data,
        level: 'info',
      })
    }
  }

  return {
    captureException,
    captureMessage,
    setUser,
    clearUser,
    addBreadcrumb,
  }
}
