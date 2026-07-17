// middleware/auth.global.js
export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return

  if (to.path.startsWith('/api/')) return

  if (import.meta.client) {
    const token = useCookie('auth_token').value
    const user  = JSON.parse(localStorage.getItem('user') || 'null')

    const publicRoutes = [
      '/',
      '/auth',
      '/verify-email',
      '/auth/forgot-password',
      '/auth/reinitialisation-password',
      '/auth/invitation',
      '/auth/verify-invitation',
      '/auth/totp',
      '/legal/cgu',
      '/legal/politique-confidentialite',
      '/legal/mentions-legales'
    ]

    if (publicRoutes.includes(to.path)) {
      if (token && user?.role) {
        const allowedRoutes = {
          etudiant:   '/students',
          professeur: '/teachers',
          directeur:  '/directeurs',
          superadmin: '/superadmin'
        }
        return navigateTo(allowedRoutes[user.role] || '/auth')
      }
      return
    }

    if (!token || !user?.role) {
      return navigateTo('/auth')
    }

    const allowedRoutes = {
      etudiant:   '/students',
      professeur: '/teachers',
      directeur:  '/directeurs',
      superadmin: '/superadmin'
    }

    const dashboard = allowedRoutes[user.role] || '/auth'

    if (!to.path.startsWith(dashboard)) {
      return navigateTo(dashboard)
    }
  }
})