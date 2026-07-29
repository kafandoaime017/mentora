import { readBody, createError, defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  try {
    const res = await $fetch(`${process.env.NUXT_PUBLIC_BACKEND_URL}/api/auth/reinitialiser-mot-de-passe`, {
      method: 'POST',
      body: {
        token: body.token,
        email: body.email,
        motDePasse: body.motDePasse,
        motDePasseConfirmation: body.motDePasseConfirmation
      },
      headers: { 'Content-Type': 'application/json' },
    })

    return res
  } catch (err) {
    console.error('Réinitialisation error:', err)

    const message = err.data?.details
      ? err.data.details.join(' | ')
      : err.data?.message || err.message || 'Erreur lors de la réinitialisation'

    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: message,
      data: { success: false, message }
    })
  }
})