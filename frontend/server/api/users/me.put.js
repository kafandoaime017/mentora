// server/api/users/me.put.js
import { defineEventHandler, getCookie, readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth_token')
  const body = await readBody(event)
  
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Non authentifié',
      message: 'Token manquant'
    })
  }
  
  try {
    const res = await $fetch(`${process.env.NUXT_PUBLIC_BACKEND_URL}/api/users/me`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: body
    })
    
    return res
  } catch (err) {
    console.error('Error update profile:', err)
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.data?.message || err.message || 'Erreur lors de la mise à jour du profil'
    })
  }
})