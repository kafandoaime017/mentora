import { defineEventHandler, getCookie, readBody } from 'h3'
export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth_token')
  if (!token) return { success: false, message: 'Non authentifié' }
  try {
    const body = await readBody(event)
    return await $fetch(`${process.env.NUXT_PUBLIC_BACKEND_URL}/api/admin/sessions`, {
      method: 'POST', headers: { Authorization: `Bearer ${token}` }, body
    })
  } catch (err) {
    // On relaie le champ `code` (ex: LIMITE_SESSIONS) : le composable en a besoin
    // pour rediriger vers /directeurs/abonnement quand le plan est dépassé.
    return { success: false, message: err?.data?.message || 'Erreur', code: err?.data?.code }
  }
})
