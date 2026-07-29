// server/api/users/me/index.put.js
import { defineEventHandler, getCookie, readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth_token')
  const body = await readBody(event)
  
  if (!token) {
    throw createError({
      statusCode: 401,
      message: 'Non authentifié'
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
    throw createError({
      statusCode: err.statusCode || 500,
      message: err.data?.message || 'Erreur serveur'
    })
  }
})