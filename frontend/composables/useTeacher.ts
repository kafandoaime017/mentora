// composables/useTeacher.ts
export const useTeacher = () => {
    // Récupérer le token d'authentification
    const getAuthHeader = () => {
        const token = useCookie('auth_token').value
        return { Authorization: `Bearer ${token}` }
    }

    // ==================== QCM / SESSIONS ====================

    /**
     * Créer un QCM (session)
     */
    const createQCM = async (data: {
        titre: string
        description?: string
        theme?: string
        date_debut: string
        date_fin: string
        duree: number
        classe_id: number
        filiere_id: number
        questions: {
            texte: string
            type: 'qcm' | 'qcm_multiple' | 'vrai_faux'
            points: number
            options: string[]
            reponses_correctes: number[]
        }[]
    }) => {
        try {
            const res = await $fetch('/api/teacher/qcm', {
                method: 'POST',
                body: data,
                headers: getAuthHeader()
            })
            return res
        } catch (error: any) {
            console.error('Erreur création QCM:', error)
            return error.data || { success: false, message: 'Erreur lors de la création du QCM' }
        }
    }

    /**
     * Récupérer la liste des QCM
     */
    const getQCMList = async () => {
        try {
            const res = await $fetch('/api/teacher/qcm', {
                headers: getAuthHeader()
            })
            return res
        } catch (error: any) {
            console.error('Erreur récupération QCM:', error)
            return error.data || { success: false, data: [] }
        }
    }

    /**
     * Récupérer les détails d'un QCM
     */
    const getQCMDetails = async (id: number) => {
        try {
            const res = await $fetch(`/api/teacher/qcm/${id}`, {
                headers: getAuthHeader()
            })
            return res
        } catch (error: any) {
            console.error('Erreur récupération détails QCM:', error)
            return error.data || { success: false, message: 'Erreur lors de la récupération' }
        }
    }

    /**
     * Modifier un QCM
     */
    const updateQCM = async (id: number, data: Partial<{
        titre: string
        description: string
        theme: string
        date_debut: string
        date_fin: string
        duree: number
        classe_id: number
        filiere_id: number
    }>) => {
        try {
            const res = await $fetch(`/api/teacher/qcm/${id}`, {
                method: 'PUT',
                body: data,
                headers: getAuthHeader()
            })
            return res
        } catch (error: any) {
            console.error('Erreur mise à jour QCM:', error)
            return error.data || { success: false, message: 'Erreur lors de la mise à jour' }
        }
    }

    /**
     * Supprimer un QCM
     */
    const deleteQCM = async (id: number) => {
        try {
            const res = await $fetch(`/api/teacher/qcm/${id}`, {
                method: 'DELETE',
                headers: getAuthHeader()
            })
            return res
        } catch (error: any) {
            console.error('Erreur suppression QCM:', error)
            return error.data || { success: false, message: 'Erreur lors de la suppression' }
        }
    }

    // ==================== GESTION DES SESSIONS ====================

    /**
     * Démarrer une session
     */
    const startSession = async (sessionId: number) => {
        try {
            const res = await $fetch(`/api/teacher/sessions/${sessionId}/start`, {
                method: 'POST',
                headers: getAuthHeader()
            })
            return res
        } catch (error: any) {
            console.error('Erreur démarrage session:', error)
            return error.data || { success: false, message: 'Erreur lors du démarrage' }
        }
    }

    /**
     * Terminer une session
     */
    const endSession = async (sessionId: number) => {
        try {
            const res = await $fetch(`/api/teacher/sessions/${sessionId}/end`, {
                method: 'POST',
                headers: getAuthHeader()
            })
            return res
        } catch (error: any) {
            console.error('Erreur fin session:', error)
            return error.data || { success: false, message: 'Erreur lors de la fin' }
        }
    }

    /**
     * Récupérer les participants d'une session
     */
    const getParticipants = async (sessionId: number) => {
        try {
            const res = await $fetch(`/api/teacher/sessions/${sessionId}/participants`, {
                headers: getAuthHeader()
            })
            return res
        } catch (error: any) {
            console.error('Erreur récupération participants:', error)
            return error.data || { success: false, data: [] }
        }
    }

    /**
     * Récupérer les statistiques d'une session
     */
    const getStatistics = async (sessionId: number) => {
        try {
            const res = await $fetch(`/api/teacher/sessions/${sessionId}/statistiques`, {
                headers: getAuthHeader()
            })
            return res
        } catch (error: any) {
            console.error('Erreur récupération statistiques:', error)
            return error.data || { success: false, data: null }
        }
    }

    /**
     * Récupérer les notes d'une session
     */
    const getNotes = async (sessionId: number) => {
        try {
            const res = await $fetch(`/api/teacher/sessions/${sessionId}/notes`, {
                headers: getAuthHeader()
            })
            return res
        } catch (error: any) {
            console.error('Erreur récupération notes:', error)
            return error.data || { success: false, data: [] }
        }
    }

    /**
     * Publier les notes
     */
    const publishNotes = async (sessionId: number) => {
        try {
            const res = await $fetch(`/api/teacher/sessions/${sessionId}/notes/publier`, {
                method: 'POST',
                headers: getAuthHeader()
            })
            return res
        } catch (error: any) {
            console.error('Erreur publication notes:', error)
            return error.data || { success: false, message: 'Erreur lors de la publication' }
        }
    }

    /**
     * Exporter les résultats en CSV
     */
    const exportResults = async (sessionId: number) => {
        try {
            const res = await $fetch(`/api/teacher/sessions/${sessionId}/export`, {
                headers: getAuthHeader()
            })
            return res
        } catch (error: any) {
            console.error('Erreur export:', error)
            return error.data || { success: false, message: 'Erreur lors de l\'export' }
        }
    }

    // ==================== DONNÉES POUR FORMULAIRES ====================

    /**
     * Récupérer les filières (selon l'école du professeur)
     */
    const getFilieres = async () => {
        try {
            const res = await $fetch('/api/teacher/filieres', {
                headers: getAuthHeader()
            })
            return res
        } catch (error: any) {
            console.error('Erreur récupération filières:', error)
            return error.data || { success: false, data: [] }
        }
    }

    /**
     * Récupérer les classes d'une filière
     */
    const getClassesByFiliere = async (filiereId: number) => {
        try {
            const res = await $fetch(`/api/teacher/classes?filiereId=${filiereId}`, {
                headers: getAuthHeader()
            })
            return res
        } catch (error: any) {
            console.error('Erreur récupération classes:', error)
            return error.data || { success: false, data: [] }
        }
    }

    /**
     * Récupérer toutes les classes (sans filtre)
     */
    const getAllClasses = async () => {
        try {
            const res = await $fetch('/api/teacher/classes', {
                headers: getAuthHeader()
            })
            return res
        } catch (error: any) {
            console.error('Erreur récupération classes:', error)
            return error.data || { success: false, data: [] }
        }
    }

    /**
     * Récupérer l'école du professeur
     */
    const getMonEcole = async () => {
        try {
            const res = await $fetch('/api/teacher/mon-ecole', {
                headers: getAuthHeader()
            })
            return res
        } catch (error: any) {
            console.error('Erreur récupération école:', error)
            return error.data || { success: false, data: null }
        }
    }

    /**
     * Générer un QR code pour une session
     */
    const generateQRCode = async (sessionId: number) => {
        try {
            const res = await $fetch(`/api/teacher/sessions/${sessionId}/generate-qr`, {
                method: 'POST',
                headers: getAuthHeader()
            })
            return res
        } catch (error: any) {
            console.error('Erreur génération QR code:', error)
            return error.data || { success: false, message: 'Erreur lors de la génération' }
        }
    }

    /**
     * Générer un nouveau code d'accès
     */
    const generateNewCode = async (sessionId: number) => {
        try {
            const res = await $fetch(`/api/teacher/sessions/${sessionId}/generate-code`, {
                method: 'POST',
                headers: getAuthHeader()
            })
            return res
        } catch (error: any) {
            console.error('Erreur génération code:', error)
            return error.data || { success: false, message: 'Erreur lors de la génération' }
        }
    }

    return {
        // QCM
        createQCM,
        getQCMList,
        getQCMDetails,
        updateQCM,
        deleteQCM,
        
        // Gestion des sessions
        startSession,
        endSession,
        getParticipants,
        getStatistics,
        getNotes,
        publishNotes,
        exportResults,
        
        // Données pour formulaires
        getFilieres,
        getClassesByFiliere,
        getAllClasses,
        getMonEcole,
        
        // Utilitaires
        generateQRCode,
        generateNewCode
    }
}