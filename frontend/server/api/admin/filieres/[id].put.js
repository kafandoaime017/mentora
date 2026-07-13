import { defineEventHandler, getCookie, readBody } from 'h3'
export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth_token')
  const id    = event.context.params?.id
  if (!token) return { success: false, message: 'Non authentifié' }
  try {
    const body = await readBody(event)
    return await $fetch(`${process.env.NUXT_PUBLIC_BACKEND_URL}/api/admin/filieres/${id}`, {
      method: 'PUT', headers: { Authorization: `Bearer ${token}` }, body
    })
  } catch (err) { return { success: false, message: err?.data?.message || 'Erreur' } }
})