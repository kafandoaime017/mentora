// ~/server/api/auth/register.post.js
import { readBody, createError, defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  
  try {
    const res = await $fetch(`${process.env.NUXT_PUBLIC_BACKEND_URL}/api/auth/register`, {
      method: 'POST',
      body: {
        nom: body.nom,
        prenom: body.prenom,
        email: body.email,
        motDePasse: body.motDePasse,
        dateNaissance: body.dateNaissance,
        ecoleId: body.ecoleId,
        filiereId: body.filiereId,
        classeId: body.classeId
      },
      headers: { 'Content-Type': 'application/json' },
    })
    return res
  } catch (err) {
    console.error('Register error:', err)
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.data?.message || err.message || 'Erreur serveur'
    })
  }
})