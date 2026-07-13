import { defineEventHandler, getCookie, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth_token')
  if (!token) return { success: false, message: 'Non authentifié' }

  try {
    const body = await readBody(event)
    const response = await $fetch(`${process.env.NUXT_PUBLIC_BACKEND_URL}/api/totp/enable`, {
      method:  'POST',
      headers: { Authorization: `Bearer ${token}` },
      body
    })
    return response
  } catch (err) {
    return { success: false, message: err?.data?.message || 'Erreur serveur' }
  }
})