// server/api/users/me/avatar.post.js
import { defineEventHandler, getCookie, createError, readMultipartFormData } from 'h3'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth_token')
  
  if (!token) {
    throw createError({
      statusCode: 401,
      message: 'Non authentifié'
    })
  }
  
  try {
    const formData = await readMultipartFormData(event)
    const avatarFile = formData?.find(field => field.name === 'avatar')
    
    if (!avatarFile || !avatarFile.data) {
      throw createError({
        statusCode: 400,
        message: 'Aucun fichier uploadé'
      })
    }
    
    // Créer un FormData pour l'envoi au backend Express
    const backendFormData = new FormData()
    const blob = new Blob([avatarFile.data], { type: avatarFile.type })
    backendFormData.append('avatar', blob, avatarFile.filename)
    
    const res = await $fetch(`${process.env.NUXT_PUBLIC_BACKEND_URL}/api/users/me/avatar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: backendFormData
    })
    
    return res
  } catch (err) {
    console.error('Error upload avatar:', err)
    throw createError({
      statusCode: err.statusCode || 500,
      message: err.data?.message || err.message || 'Erreur lors de l\'upload'
    })
  }
})