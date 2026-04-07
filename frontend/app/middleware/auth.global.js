export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) return

  if (import.meta.client) {
    const token = useCookie('auth_token').value
    const user = JSON.parse(localStorage.getItem('user') || 'null')

    // Routes publiques (accessibles sans connexion)
    const publicRoutes = ['/auth', '/', '/verify-email', '/auth/forgot-password', '/auth/reinitialisation-password']
    
    // Si déjà connecté et tente d'accéder à une route publique → dashboard
    if (publicRoutes.includes(to.path)) {
      if (token && user?.role) {
        const allowedRoutes = {
          etudiant: '/students',
          professeur: '/teachers',
          admin: '/admin'
        }
        return navigateTo(allowedRoutes[user.role] || '/auth')
      }
      return // pas connecté → laisser passer
    }

    // Non connecté → /auth (sauf pour verify-email qui est déjà dans publicRoutes)
    if (!token || !user?.role) {
      return navigateTo('/auth')
    }

    // Mauvais rôle → son dashboard
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