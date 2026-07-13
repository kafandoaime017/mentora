import { defineEventHandler, getCookie, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth_token')

  if (!token) {
    return { success: false, message: 'Non authentifié' }
  }

  try {
    const body = await readBody(event)
    const response = await $fetch(`${process.env.NUXT_PUBLIC_BACKEND_URL}/api/settings`, {
      method:  'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body
    })
    return response
  } catch (err) {
    console.error('Erreur mise à jour settings:', err)
    return { success: false, message: err?.data?.message || 'Erreur serveur' }
  }
})