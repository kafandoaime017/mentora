// server/api/teacher/banque-questions.get.js
import { getQuery, createError, defineEventHandler, getHeader } from 'h3'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const token = getHeader(event, 'authorization')?.replace('Bearer ', '')

    const params = new URLSearchParams()
    if (query.theme)      params.set('theme', query.theme)
    if (query.difficulte) params.set('difficulte', query.difficulte)
    if (query.type)       params.set('type', query.type)
    const qs = params.toString()

    try {
        const url = `${process.env.NUXT_PUBLIC_BACKEND_URL}/api/teacher/banque-questions${qs ? `?${qs}` : ''}`
        const response = await $fetch(url, {
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
