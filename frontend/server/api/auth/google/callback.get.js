// ~/server/api/auth/google/callback.get.js
import { defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { code } = query
  
  if (!code) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Code manquant'
    })
  }
  
  try {
    // Appel au backend Express
    const res = await $fetch(`${process.env.NUXT_PUBLIC_BACKEND_URL}/api/auth/google/callback?code=${code}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
    
    return res
  } catch (err) {
    console.error('Google callback error:', err)
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.data?.message || err.message || 'Erreur lors de l\'authentification Google'
    })
  }
})