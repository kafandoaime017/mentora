import { createError, defineEventHandler, getHeader, readBody } from 'h3'

export default defineEventHandler(async (event) => {
    const id = event.context.params?.id
    const token = getHeader(event, 'authorization')?.replace('Bearer ', '')
    const body = await readBody(event)

    try {
        const response = await $fetch(`${process.env.NUXT_PUBLIC_BACKEND_URL}/api/teacher/banque-questions/${id}`, {
            method: 'PUT',
            body,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        return response
    } catch (err) {
        throw createError({
            statusCode: err.statusCode || 500,
            statusMessage: err.data?.message || 'Erreur lors de la modification',
            data: { success: false, message: err.data?.message }
        })
    }
})
