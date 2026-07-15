// server/api/teacher/plan.get.js
import { createError, defineEventHandler, getHeader } from 'h3'

export default defineEventHandler(async (event) => {
    const token = getHeader(event, 'authorization')?.replace('Bearer ', '')

    try {
        const response = await $fetch(`${process.env.NUXT_PUBLIC_BACKEND_URL}/api/teacher/plan`, {
            headers: { 'Authorization': `Bearer ${token}` }
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
