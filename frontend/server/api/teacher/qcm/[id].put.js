import { createError, defineEventHandler, getHeader, readBody } from 'h3'

export default defineEventHandler(async (event) => {
    const id = event.context.params?.id
    const token = getHeader(event, 'authorization')?.replace('Bearer ', '')
    const body = await readBody(event)
    
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
            statusMessage: 'Non autorisé',
            data: { success: false, message: 'Token requis' }
        })
    }
    
    try {
        const response = await $fetch(`${process.env.NUXT_PUBLIC_BACKEND_URL}/api/teacher/qcm/${id}`, {
            method: 'PUT',
            body: body,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        
        return response
    } catch (err) {
        console.error('Erreur API modification QCM:', err)
        
        throw createError({
            statusCode: err.statusCode || 500,
            statusMessage: err.data?.message || 'Erreur lors de la modification',
            data: { 
                success: false, 
                message: err.data?.message || 'Erreur lors de la modification de la session'
            }
        })
    }
})