import { defineEventHandler, getCookie, getQuery } from 'h3'
export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth_token')
  if (!token) return { success: false, message: 'Non authentifié' }
  try {
    const query = getQuery(event)
    const qs = new URLSearchParams(query).toString()
    return await $fetch(`${process.env.NUXT_PUBLIC_BACKEND_URL}/api/admin/audit-logs${qs ? '?' + qs : ''}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
  } catch (err) { return { success: false, message: err?.data?.message || 'Erreur' } }
})
