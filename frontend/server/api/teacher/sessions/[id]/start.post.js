import { createError, defineEventHandler, getHeader } from 'h3'

export default defineEventHandler(async (event) => {
    const id = event.context.params?.id
    const token = getHeader(event, 'authorization')?.replace('Bearer ', '')
    
    if (!id) {
        throw createError({
            statusCode: 400,
            statusMessage: 'ID manquant',
            data: { success: false, message: 'ID requis' }
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
        const response = await $fetch(`${process.env.NUXT_PUBLIC_BACKEND_URL}/api/teacher/sessions/${id}/start`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        
        return response
    } catch (err) {
        console.error('Erreur démarrage session:', err)
        
        throw createError({
            statusCode: err.statusCode || 500,
            statusMessage: err.data?.message || 'Erreur lors du démarrage',
            data: { success: false, message: err.data?.message }
        })
    }
})