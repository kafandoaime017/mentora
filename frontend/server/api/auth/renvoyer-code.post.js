// ~/server/api/auth/renvoyer-code.post.js
import { readBody, createError, defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { email } = body

  // Validation côté serveur
  if (!email) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Email requis'
    })
  }

  const emailRegex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/
  if (!emailRegex.test(email)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Email invalide'
    })
  }

  try {
    const res = await $fetch(`${process.env.NUXT_PUBLIC_BACKEND_URL}/api/auth/renvoyer-code`, {
      method: 'POST',
      body: { email },
      headers: { 'Content-Type': 'application/json' },
    })
    return res
  } catch (err) {
    console.error('Renvoyer code error:', err)
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.data?.message || err.message || 'Erreur lors du renvoi du code'
    })
  }
})