// ~/server/api/ref/filieres/[filiereId]/classes.get.js
import { defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  const filiereId = event.context.params.filiereId
  
  try {
    const res = await $fetch(`${process.env.NUXT_PUBLIC_BACKEND_URL}/api/ref/filieres/${filiereId}/classes`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
    return res
  } catch (err) {
    console.error('Classes error:', err)
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.message || 'Erreur chargement classes'
    })
  }
})