// ~/server/api/ref/ecoles/[ecoleId]/filieres.get.js
import { defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  const ecoleId = event.context.params.ecoleId
  
  try {
    const res = await $fetch(`${process.env.NUXT_PUBLIC_BACKEND_URL}/api/ref/ecoles/${ecoleId}/filieres`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
    return res
  } catch (err) {
    console.error('Filieres error:', err)
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.message || 'Erreur chargement filières'
    })
  }
})