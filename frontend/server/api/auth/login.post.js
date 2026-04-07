// ~/server/api/auth/login.post.js
import { readBody, createError, defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  try {
    const res = await $fetch(`${process.env.NUXT_PUBLIC_BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      body: {
        email: body.email,
        motDePasse: body.motDePasse // motDePasse -> password
      },
      headers: { 'Content-Type': 'application/json' },
    })

    return res
  } catch (err) {
    console.error('Login error:', err)

    // On fusionne les détails dans un seul message si présents
    const message = err.data?.details
      ? err.data.details.join(' | ')
      : err.data?.message || err.message || 'Erreur serveur'

    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: message, // statusMessage contient maintenant tout
      data: { success: false, message } // on renvoie aussi le JSON complet au front
    })
  }
})