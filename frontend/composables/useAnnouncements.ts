// Consultation des annonces/sondages côté étudiant & professeur (bannière en
// haut de page, dans StudentLayout / TeacherLayout).
export const useAnnouncements = () => {
    const getAuthHeader = () => {
        const token = useCookie('auth_token').value
        return { Authorization: `Bearer ${token}` }
    }

    const getAnnoncesActives = async () => {
        try {
            return await $fetch('/api/annonces/actives', { headers: getAuthHeader() })
        } catch (error: any) {
            console.error('Erreur annonces actives:', error)
            return { success: false, data: [] }
        }
    }

    const marquerVue = async (id: number) => {
        try {
            return await $fetch(`/api/annonces/${id}/vue`, { method: 'POST', headers: getAuthHeader() })
        } catch (error: any) {
            console.error('Erreur marquage vue:', error)
            return { success: false, message: error?.data?.message || 'Erreur' }
        }
    }

    const repondreSondage = async (id: number, optionIndex: number) => {
        try {
            return await $fetch(`/api/annonces/${id}/repondre`, {
                method: 'POST', headers: getAuthHeader(), body: { optionIndex }
            })
        } catch (error: any) {
            console.error('Erreur réponse sondage:', error)
            return { success: false, message: error?.data?.message || 'Erreur' }
        }
    }

    return { getAnnoncesActives, marquerVue, repondreSondage }
}
