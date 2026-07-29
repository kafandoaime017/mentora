import { createError, defineEventHandler, getHeader } from 'h3'

export default defineEventHandler(async (event) => {
    const token = getHeader(event, 'authorization')?.replace('Bearer ', '')
    
    if (!token) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Non autorisé',
            data: { success: false, message: 'Token requis' }
        })
    }
    
    try {
        const response = await $fetch(`${process.env.NUXT_PUBLIC_BACKEND_URL}/api/teacher/stats`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        
        return response
    } catch (err) {
        throw createError({
            statusCode: err.statusCode || 500,
            statusMessage: err.data?.message || 'Erreur lors de la récupération des statistiques',
            data: { success: false, message: err.data?.message }
        })
    }
})