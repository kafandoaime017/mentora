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
            statusMessage: 'Non authentifié',
            data: { success: false, message: 'Token requis' }
        })
    }
    
    try {
        const response = await $fetch(`${process.env.NUXT_PUBLIC_BACKEND_URL}/api/teacher/qcm/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        
        return response
    } catch (err) {
        console.error('Erreur suppression QCM:', err)
        
        throw createError({
            statusCode: err.statusCode || 500,
            statusMessage: err.data?.message || 'Erreur lors de la suppression',
            data: { 
                success: false, 
                message: err.data?.message || 'Impossible de supprimer le QCM' 
            }
        })
    }
})