import { readBody, createError, defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    // Récupérer le token depuis les headers
    const authHeader = event.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    // Option 1: Si vous avez une blacklist de tokens (Redis ou DB)
    if (token && process.env.USE_TOKEN_BLACKLIST === 'true') {
      // Ajouter le token à une blacklist avec expiration
      // await redis.setex(`blacklist:${token}`, 3600, 'true')
      console.log(`Token blacklisté: ${token.substring(0, 20)}...`)
    }
    
    // Option 2: Appeler votre backend Express si nécessaire
    if (process.env.NUXT_PUBLIC_BACKEND_URL) {
      await $fetch(`${process.env.NUXT_PUBLIC_BACKEND_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': authHeader || ''
        }
      }).catch(() => {
        // Ignorer les erreurs du backend
        console.log('Backend logout non disponible')
      })
    }
    
    return {
      success: true,
      message: 'Déconnexion réussie'
    }
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error)
    
    // Même en cas d'erreur, on retourne success pour que le frontend puisse se déconnecter
    return {
      success: true,
      message: 'Déconnexion réussie'
    }
  }
})