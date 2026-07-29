// server/api/teacher/classes.get.js
import { getQuery, createError, defineEventHandler, getHeader } from 'h3'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const filiereId = query.filiereId
    const token = getHeader(event, 'authorization')?.replace('Bearer ', '')
    
    try {
        const url = filiereId 
            ? `${process.env.NUXT_PUBLIC_BACKEND_URL}/api/teacher/classes?filiereId=${filiereId}`
            : `${process.env.NUXT_PUBLIC_BACKEND_URL}/api/teacher/classes`
        
        const response = await $fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        
        return response
    } catch (err) {
        throw createError({
            statusCode: err.statusCode || 500,
            statusMessage: err.data?.message || 'Erreur lors de la récupération',
            data: { success: false, message: err.data?.message }
        })
    }
})