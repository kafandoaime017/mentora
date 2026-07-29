// ~/server/api/auth/google/url.get.js
import { defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    // Appel au backend Express
    const res = await $fetch(`${process.env.NUXT_PUBLIC_BACKEND_URL}/api/auth/google/url`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
    
    return res
  } catch (err) {
    console.error('Google URL error:', err)
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.data?.message || err.message || 'Erreur lors de la génération de l\'URL Google'
    })
  }
})