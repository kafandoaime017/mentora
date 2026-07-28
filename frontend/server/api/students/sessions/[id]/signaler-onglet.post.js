import { defineEventHandler, getCookie } from 'h3'

export default defineEventHandler(async (event) => {
    const id = event.context.params?.id
    const token = getCookie(event, 'auth_token')

    if (!id) return { success: false, message: 'ID requis' }
    if (!token) return { success: false, message: 'Non authentifié' }

    try {
        return await $fetch(`${process.env.NUXT_PUBLIC_BACKEND_URL}/api/students/sessions/${id}/signaler-onglet`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` }
        })
    } catch (err) {
        return { success: false, message: err?.data?.message || 'Erreur' }
    }
})
