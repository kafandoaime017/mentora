import { defineEventHandler, getCookie } from 'h3'

export default defineEventHandler(async (event) => {
    const token = getCookie(event, 'auth_token')
    
    if (!token) {
        return { success: false, message: 'Non authentifié' }
    }
    
    try {
        const response = await $fetch(`${process.env.NUXT_PUBLIC_BACKEND_URL}/api/students/profil`, {
            headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        return response
    } catch (err) {
        console.error('Erreur récupération profil étudiant:', err)
        return { 
            success: false, 
            message: err?.data?.message || 'Erreur lors du chargement du profil' 
        }
    }
})