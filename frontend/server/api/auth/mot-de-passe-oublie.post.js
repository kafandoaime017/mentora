import { readBody, createError, defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  try {
    const res = await $fetch(`${process.env.NUXT_PUBLIC_BACKEND_URL}/api/auth/mot-de-passe-oublie`, {
      method: 'POST',
      body: {
        email: body.email
      },
      headers: { 'Content-Type': 'application/json' },
    })

    return res
  } catch (err) {
    console.error('Mot de passe oublié error:', err)

    const message = err.data?.details
      ? err.data.details.join(' | ')
      : err.data?.message || err.message || 'Erreur lors de l\'envoi du lien'

    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: message,
      data: { success: false, message }
    })
  }
})