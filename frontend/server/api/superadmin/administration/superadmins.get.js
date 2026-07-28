import { defineEventHandler, getCookie } from 'h3'
export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth_token')
  if (!token) return { success: false, message: 'Non authentifié' }
  try {
    return await $fetch(`${process.env.NUXT_PUBLIC_BACKEND_URL}/api/superadmin/administration/superadmins`, {
      method: 'GET', headers: { Authorization: `Bearer ${token}` }
    })
  } catch (err) { return { success: false, message: err?.data?.message || 'Erreur' } }
})
