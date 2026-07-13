export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth_token') || getHeader(event, 'authorization')?.replace('Bearer ', '')

  const response = await $fetch(`${process.env.NUXT_PUBLIC_BACKEND_URL}/api/auth/envoyer-code-mdp`, {
    method:  'POST',
    headers: { Authorization: `Bearer ${token}` }
  }).catch(err => err.data)

  return response
})