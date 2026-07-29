import { defineEventHandler, getCookie, readBody } from 'h3'

export default defineEventHandler(async (event) => {
    const id = event.context.params?.id
    const token = getCookie(event, 'auth_token')
    
    if (!id) {
        return { success: false, message: 'ID de session requis' }
    }
    
    if (!token) {
        return { success: false, message: 'Non authentifié' }
    }
    
    try {
        const body = await readBody(event)
        const { reponses } = body
        
        if (!reponses || !Array.isArray(reponses)) {
            return { success: false, message: 'Format de réponses invalide' }
        }
        
        const response = await $fetch(`${process.env.NUXT_PUBLIC_BACKEND_URL}/api/students/sessions/${id}/reponses`, {
            method: 'POST',
            headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: { reponses }
        })
        
        return response
    } catch (err) {
        console.error('Erreur soumission réponses:', err)
        return { 
            success: false, 
            message: err?.data?.message || 'Erreur lors de la soumission des réponses' 
        }
    }
})