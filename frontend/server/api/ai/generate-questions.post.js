import { readBody, createError, defineEventHandler, getHeader } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  try {
    const authHeader = getHeader(event, 'authorization')

    // Utiliser la variable d'environnement au lieu de l'IP en dur
    const apiBase = process.env.NUXT_PUBLIC_API_BASE || 'https://api.mentoraapp.online/api'
    
    const res = await $fetch(
      `${apiBase}/ai/generate-questions`,
      {
        method: 'POST',
        body: {
          titre: body.titre,
          theme: body.theme,
          description: body.description,
          nombreQuestions: body.nombreQuestions
        },
        headers: {
          'Content-Type': 'application/json',
          ...(authHeader && { Authorization: authHeader })
        }
      }
    )

    return res
  } catch (err) {
    console.error('Generate questions error:', err)

    const message = err.data?.details
      ? err.data.details.join(' | ')
      : err.data?.message || err.message || 'Erreur serveur'

    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: message,
      data: {
        success: false,
        message
      }
    })
  }
})