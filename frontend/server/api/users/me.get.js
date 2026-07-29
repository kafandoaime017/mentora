// server/api/users/me.get.js
import { defineEventHandler, getCookie, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth_token')
  
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Non authentifié',
      message: 'Token manquant'
    })
  }
  
  try {
    const res = await $fetch(`${process.env.NUXT_PUBLIC_BACKEND_URL}/api/users/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    return res
  } catch (err) {
    console.error('Error get profile:', err)
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.data?.message || err.message || 'Erreur lors du chargement du profil'
    })
  }
})