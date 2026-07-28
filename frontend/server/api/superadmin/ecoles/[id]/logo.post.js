import { defineEventHandler, getCookie, readRawBody } from 'h3'
export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth_token')
  const id    = event.context.params?.id
  if (!token) return { success: false, message: 'Non authentifié' }
  try {
    const body        = await readRawBody(event)
    const contentType = event.node.req.headers['content-type']
    return await $fetch(`${process.env.NUXT_PUBLIC_BACKEND_URL}/api/superadmin/ecoles/${id}/logo`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': contentType },
      body
    })
  } catch (err) { return { success: false, message: err?.data?.message || 'Erreur' } }
})
