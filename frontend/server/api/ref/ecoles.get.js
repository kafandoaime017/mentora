// ~/server/api/ref/ecoles.get.js
import { defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const search = query.search || ''
    
    const res = await $fetch(`${process.env.NUXT_PUBLIC_BACKEND_URL}/api/ref/ecoles?search=${search}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
    return res
  } catch (err) {
    console.error('Ecoles error:', err)
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.message || 'Erreur chargement écoles'
    })
  }
})