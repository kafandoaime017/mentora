import { useNotificationSound } from './useNotificationSound.js'

export const useNotifications = () => {
    const notifications = ref<any[]>([])
    const loading = ref(false)
    const { play: playNotificationSound } = useNotificationSound()

    const apiFetch = async (url: string, options: any = {}) => {
        const config = useRuntimeConfig()
        const token = useCookie('auth_token').value
        return await $fetch(`${config.public.apiBase}${url}`, {
            ...options,
            headers: {
                'Authorization': `Bearer ${token}`,
                ...options.headers
            }
        })
    }

    const load = async () => {
        loading.value = true
        try {
            const result: any = await apiFetch('/notifications')
            if (result.success) notifications.value = result.data || []
        } catch (err) {
            console.error('Erreur chargement notifications:', err)
        } finally {
            loading.value = false
        }
    }

    const markRead = async (id: number) => {
        const idx = notifications.value.findIndex(n => n.id === id)
        if (idx !== -1) notifications.value[idx].isRead = true
        try {
            await apiFetch(`/notifications/${id}/read`, { method: 'PATCH' })
        } catch {}
    }

    const markAllRead = async () => {
        notifications.value.forEach(n => n.isRead = true)
        try {
            await apiFetch('/notifications/read-all', { method: 'PATCH' })
        } catch {}
    }

    const clearAll = async () => {
        notifications.value = []
        try {
            await apiFetch('/notifications', { method: 'DELETE' })
        } catch {}
    }

    const deleteOne = async (id: number) => {
        notifications.value = notifications.value.filter(n => n.id !== id)
        try {
            await apiFetch(`/notifications/${id}`, { method: 'DELETE' })
        } catch {}
    }

    // Ajouter une notif temps réel sans refetch
    const addRealtime = (notif: any) => {
        notifications.value.unshift({
            id:        Date.now(),
            isRead:    false,
            createdAt: new Date().toISOString(),
            ...notif
        })
        playNotificationSound()
    }

    const unreadCount = computed(() =>
        notifications.value.filter(n => !n.isRead).length
    )

    return {
        notifications,
        loading,
        unreadCount,
        load,
        markRead,
        markAllRead,
        clearAll,
        deleteOne,
        addRealtime
    }
}