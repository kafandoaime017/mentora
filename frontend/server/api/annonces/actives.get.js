import { defineEventHandler, getCookie } from 'h3'
export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth_token')
  if (!token) return { success: false, data: [] }
  try {
    return await $fetch(`${process.env.NUXT_PUBLIC_BACKEND_URL}/api/annonces/actives`, {
      headers: { Authorization: `Bearer ${token}` }
    })
  } catch (err) { return { success: false, data: [], message: err?.data?.message || 'Erreur' } }
})
