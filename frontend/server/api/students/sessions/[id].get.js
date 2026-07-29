import { defineEventHandler, getCookie } from 'h3'

export default defineEventHandler(async (event) => {
    const id = event.context.params?.id
    const token = getCookie(event, 'auth_token')
    
    console.log('🔵 API [id].get.js appelée, id:', id)
    
    if (!id) {
        return { success: false, message: 'ID requis' }
    }
    
    if (!token) {
        return { success: false, message: 'Non authentifié' }
    }
    
    try {
        const response = await $fetch(`${process.env.NUXT_PUBLIC_BACKEND_URL}/api/students/sessions/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        return response
    } catch (err) {
        console.error('Erreur récupération session:', err)
        return { 
            success: false, 
            message: err?.data?.message || 'Erreur lors de la récupération'
        }
    }
})