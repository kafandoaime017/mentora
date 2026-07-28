// server/api/settings/notif-son.post.js
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
    const sonFile = formData?.find(field => field.name === 'son')

    if (!sonFile || !sonFile.data) {
      throw createError({
        statusCode: 400,
        message: 'Aucun fichier son fourni'
      })
    }

    const backendFormData = new FormData()
    const blob = new Blob([sonFile.data], { type: sonFile.type })
    backendFormData.append('son', blob, sonFile.filename)

    const res = await $fetch(`${process.env.NUXT_PUBLIC_BACKEND_URL}/api/settings/notif-son`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: backendFormData
    })

    return res
  } catch (err) {
    console.error('Error upload notif-son:', err)
    throw createError({
      statusCode: err.statusCode || 500,
      message: err.data?.message || err.message || 'Erreur lors de l\'upload'
    })
  }
})
