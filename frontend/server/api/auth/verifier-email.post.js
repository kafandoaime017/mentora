// ~/server/api/auth/verifier-email.post.js
import { readBody, createError, defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email, code } = body

  // Validation côté serveur (optionnel mais recommandé)
  if (!email || !code) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Email et code sont requis'
    })
  }

  if (!/^\d{6}$/.test(code)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Le code doit contenir 6 chiffres'
    })
  }

  try {
    const res = await $fetch(`${process.env.NUXT_PUBLIC_BACKEND_URL}/api/auth/verifier-email`, {
      method: 'POST',
      body: {
        email,
        code
      },
      headers: { 'Content-Type': 'application/json' },
    })
    return res
  } catch (err) {
    console.error('Verifier email error:', err)
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.data?.message || err.message || 'Erreur lors de la vérification'
    })
  }
})