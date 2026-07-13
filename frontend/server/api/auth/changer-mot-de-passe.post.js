export default defineEventHandler(async (event) => {
  const body  = await readBody(event)
  const token = getCookie(event, 'auth_token') || getHeader(event, 'authorization')?.replace('Bearer ', '')

  const response = await $fetch(`${process.env.NUXT_PUBLIC_BACKEND_URL}/api/auth/changer-mot-de-passe`, {
    method:  'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body
  }).catch(err => err.data)

  return response
})