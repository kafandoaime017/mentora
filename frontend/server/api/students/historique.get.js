import { defineEventHandler, getCookie } from 'h3'

export default defineEventHandler(async (event) => {
    const token = getCookie(event, 'auth_token')
    
    if (!token) {
        return { success: false, message: 'Non authentifié' }
    }
    
    try {
        const response = await $fetch(`${process.env.NUXT_PUBLIC_BACKEND_URL}/api/students/historique`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        return response
    } catch (err) {
        console.error('Erreur récupération historique:', err)
        return { success: false, data: [], message: err?.data?.message || 'Erreur serveur' }
    }
})