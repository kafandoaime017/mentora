// server/api/teacher/banque-questions.post.js
import { readBody, createError, defineEventHandler, getHeader } from 'h3'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const token = getHeader(event, 'authorization')?.replace('Bearer ', '')

    try {
        const response = await $fetch(`${process.env.NUXT_PUBLIC_BACKEND_URL}/api/teacher/banque-questions`, {
            method: 'POST',
            body,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        return response
    } catch (err) {
        throw createError({
            statusCode: err.statusCode || 500,
            statusMessage: err.data?.message || 'Erreur lors de la création',
            data: { success: false, message: err.data?.message }
        })
    }
})
