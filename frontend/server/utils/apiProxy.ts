export const apiProxy = async (event: any, path: string, options: any = {}) => {
    const config = useRuntimeConfig()
    const token = getCookie(event, 'auth_token')

    try {
        console.log('➡️ API CALL:', path)
        console.log('🔑 TOKEN:', token)

        return await $fetch(`${config.public.apiBase}${path}`, {
            ...options,
            headers: {
                Authorization: token ? `Bearer ${token}` : '',
                ...(options.headers || {})
            }
        })

    } catch (error: any) {
        console.error('🔥 BACKEND ERROR FULL:')
        console.error(JSON.stringify(error, null, 2))

        throw createError({
            statusCode: error?.statusCode || 500,
            statusMessage: error?.data?.message || error?.message || 'Erreur serveur'
        })
    }
}