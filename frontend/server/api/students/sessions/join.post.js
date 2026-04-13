import { defineEventHandler, readBody, getCookie } from 'h3'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const token = getCookie(event, 'auth_token')
    
    if (!token) {
        return { success: false, message: 'Non authentifié' }
    }
    
    try {
        const response = await $fetch(`${process.env.NUXT_PUBLIC_BACKEND_URL}/api/students/sessions/join`, {
            method: 'POST',
            body: { sessionId: body.sessionId },
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        return response
    } catch (err) {
        console.error('Erreur join:', err)
        return { success: false, message: 'Erreur lors du rejoignement' }
    }
})