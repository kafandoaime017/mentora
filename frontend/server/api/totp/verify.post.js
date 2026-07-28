import { defineEventHandler, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const response = await $fetch(`${process.env.NUXT_PUBLIC_BACKEND_URL}/api/totp/verify`, {
      method: 'POST',
      body
    })
    return response
  } catch (err) {
    return { success: false, message: err?.data?.message || 'Erreur serveur' }
  }
})