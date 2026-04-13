import { defineEventHandler, readBody, getCookie } from 'h3'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const token = getCookie(event, 'auth_token')
    
    if (!token) {
        return { success: false, message: 'Non authentifié' }
    }
    
    try {
        const response = await $fetch(`${process.env.NUXT_PUBLIC_BACKEND_URL}/api/students/sessions/verify-code`, {
            method: 'POST',
            body: { code: body.code },
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        return response
    } catch (err) {
        console.error('Erreur verify-code:', err)
        return { success: false, message: 'Code invdddalide' }
    }
})