import { createError, defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  const token = event.context.params?.token

  if (!token) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Token requis',
      data: { success: false, message: 'Token requis' }
    })
  }

  try {
    const res = await $fetch(`${process.env.NUXT_PUBLIC_BACKEND_URL}/api/auth/verifier-token-reset/${token}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    return res
  } catch (err) {
    console.error('Vérifier token error:', err)

    const message = err.data?.details
      ? err.data.details.join(' | ')
      : err.data?.message || err.message || 'Token invalide ou expiré'

    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: message,
      data: { success: false, message }
    })
  }
})