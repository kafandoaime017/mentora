// middleware/auth.global.js
export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return

  // 🔥 Ignorer les routes API
  if (to.path.startsWith('/api/')) {
    return
  }

  if (import.meta.client) {
    const token = useCookie('auth_token').value
    const user = JSON.parse(localStorage.getItem('user') || 'null')

    const publicRoutes = ['/auth', '/', '/verify-email', '/auth/forgot-password', '/auth/reinitialisation-password']
    
    if (publicRoutes.includes(to.path)) {
      if (token && user?.role) {
        const allowedRoutes = {
          etudiant: '/students',
          professeur: '/teachers',
          admin: '/admin'
        }
        return navigateTo(allowedRoutes[user.role] || '/auth')
      }
      return
    }

    if (!token || !user?.role) {
      return navigateTo('/auth')
    }

    const allowedRoutes = {
      etudiant: '/students',
      professeur: '/teachers',
      admin: '/admin'
    }

    const dashboard = allowedRoutes[user.role] || '/auth'

    if (!to.path.startsWith(dashboard)) {
      return navigateTo(dashboard)
    }
  }
})