// server/api/users/me/index.get.js
import { defineEventHandler, getCookie, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth_token')
  
  if (!token) {
    throw createError({
      statusCode: 401,
      message: 'Non authentifié'
    })
  }
  
  try {
    const res = await $fetch(`${process.env.NUXT_PUBLIC_BACKEND_URL}/api/users/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    return res
  } catch (err) {
    throw createError({
      statusCode: err.statusCode || 500,
      message: err.data?.message || 'Erreur serveur'
    })
  }
})