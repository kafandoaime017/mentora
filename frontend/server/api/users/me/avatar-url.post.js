// server/api/users/me/avatar-url.post.js
// Definit l'avatar du compte a partir d'une URL externe (avatar DiceBear choisi
// dans l'AvatarPicker) - pas de fichier, juste { avatarUrl } en JSON.
import { defineEventHandler, getCookie, readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth_token')

  if (!token) {
    throw createError({
      statusCode: 401,
      message: 'Non authentifié'
    })
  }

  try {
    const body = await readBody(event)

    const res = await $fetch(`${process.env.NUXT_PUBLIC_BACKEND_URL}/api/users/me/avatar-url`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: { avatarUrl: body?.avatarUrl }
    })

    return res
  } catch (err) {
    console.error('Error set avatar from url:', err)
    throw createError({
      statusCode: err.statusCode || 500,
      message: err.data?.message || err.message || 'Erreur lors de la mise à jour de l\'avatar'
    })
  }
})
