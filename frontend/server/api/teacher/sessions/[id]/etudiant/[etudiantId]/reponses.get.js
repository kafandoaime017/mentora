import { createError, defineEventHandler, getHeader } from 'h3'

export default defineEventHandler(async (event) => {
    const sessionId = event.context.params?.id
    const etudiantId = event.context.params?.etudiantId
    const token = getHeader(event, 'authorization')?.replace('Bearer ', '')
    
    if (!sessionId || !etudiantId) {
        throw createError({
            statusCode: 400,
            statusMessage: 'IDs manquants',
            data: { success: false, message: 'Session ID et Étudiant ID requis' }
        })
    }
    
    if (!token) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Token manquant',
            data: { success: false, message: 'Authentification requise' }
        })
    }
    
    try {
        const response = await $fetch(`${process.env.NUXT_PUBLIC_BACKEND_URL}/api/teacher/sessions/${sessionId}/etudiant/${etudiantId}/reponses`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        
        return response
    } catch (err) {
        console.error('Erreur récupération réponses étudiant:', err)
        
        throw createError({
            statusCode: err.statusCode || 500,
            statusMessage: err.data?.message || 'Erreur lors de la récupération',
            data: { success: false, message: err.data?.message }
        })
    }
})