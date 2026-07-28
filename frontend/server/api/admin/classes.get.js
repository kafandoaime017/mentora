import { defineEventHandler, getCookie, getQuery } from 'h3'
export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth_token')
  const query = getQuery(event)
  if (!token) return { success: false, message: 'Non authentifié' }
  try {
    const params = new URLSearchParams(query).toString()
    return await $fetch(`${process.env.NUXT_PUBLIC_BACKEND_URL}/api/admin/classes?${params}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
  } catch (err) { return { success: false, message: err?.data?.message || 'Erreur' } }
})