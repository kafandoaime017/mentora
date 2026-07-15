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
        questions?: any[]  // ✅ AJOUTER cette ligne

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

    /**
 * Récupérer les réponses d'un étudiant pour une session
 */
    const getEtudiantReponses = async (sessionId: number, etudiantId: number) => {
        try {
            const res = await $fetch(`/api/teacher/sessions/${sessionId}/etudiant/${etudiantId}/reponses`, {
                headers: getAuthHeader()
            })
            return res
        } catch (error: any) {
            console.error('Erreur récupération réponses étudiant:', error)
            return error.data || { success: false, data: [] }
        }
    }

    /**
 * Récupérer les statistiques du professeur (total sessions, à venir, terminées, etc.)
 */
const getTeacherStats = async () => {
    try {
        const res = await $fetch('/api/teacher/stats', {
            headers: getAuthHeader()
        })
        return res
    } catch (error: any) {
        console.error('Erreur récupération statistiques:', error)
        return error.data || { success: false, data: null }
    }
}


/**
 * Générer des questions avec l'IA
 */
const generateQuestionsAI = async (data: {
    titre: string
    description?: string
    theme?: string
    nombreQuestions: number
}) => {
    try {
        const res = await $fetch('/api/ai/generate-questions', {
            method: 'POST',
            body: data,
            headers: getAuthHeader()
        })

        return res
    } catch (error: any) {
        console.error('Erreur génération IA:', error)
        return error.data || {
            success: false,
            message: 'Erreur lors de la génération des questions'
        }
    }
}

/**
 * Plan de l'école du professeur connecté (utilisé pour n'afficher la
 * génération IA que si l'école est sur le plan Pro).
 */
const getPlanInfo = async () => {
    try {
        const res = await $fetch('/api/teacher/plan', { headers: getAuthHeader() })
        return res
    } catch (error: any) {
        console.error('Erreur récupération plan:', error)
        return error.data || { success: false, data: { plan: 'gratuit', ia: false } }
    }
}

    // ==================== BANQUE DE QUESTIONS ====================

    /**
     * Récupérer la banque de questions (filtrable par thème/difficulté/type)
     */
    const getBanqueQuestions = async (filtres: { theme?: string; difficulte?: string; type?: string } = {}) => {
        try {
            const params = new URLSearchParams()
            if (filtres.theme)      params.set('theme', filtres.theme)
            if (filtres.difficulte) params.set('difficulte', filtres.difficulte)
            if (filtres.type)       params.set('type', filtres.type)
            const qs = params.toString()
            const res = await $fetch(`/api/teacher/banque-questions${qs ? `?${qs}` : ''}`, {
                headers: getAuthHeader()
            })
            return res
        } catch (error: any) {
            console.error('Erreur récupération banque de questions:', error)
            return error.data || { success: false, data: [] }
        }
    }

    /**
     * Ajouter une question à la banque
     */
    const createBanqueQuestion = async (data: any) => {
        try {
            const res = await $fetch('/api/teacher/banque-questions', {
                method: 'POST',
                body: data,
                headers: getAuthHeader()
            })
            return res
        } catch (error: any) {
            console.error('Erreur création question banque:', error)
            return error.data || { success: false, message: 'Erreur lors de la création' }
        }
    }

    /**
     * Modifier une question de la banque
     */
    const updateBanqueQuestion = async (id: number, data: any) => {
        try {
            const res = await $fetch(`/api/teacher/banque-questions/${id}`, {
                method: 'PUT',
                body: data,
                headers: getAuthHeader()
            })
            return res
        } catch (error: any) {
            console.error('Erreur modification question banque:', error)
            return error.data || { success: false, message: 'Erreur lors de la modification' }
        }
    }

    /**
     * Supprimer une question de la banque
     */
    const deleteBanqueQuestion = async (id: number) => {
        try {
            const res = await $fetch(`/api/teacher/banque-questions/${id}`, {
                method: 'DELETE',
                headers: getAuthHeader()
            })
            return res
        } catch (error: any) {
            console.error('Erreur suppression question banque:', error)
            return error.data || { success: false, message: 'Erreur lors de la suppression' }
        }
    }

    // ==================== CORRECTION MANUELLE ====================

    /**
     * Récupérer les réponses (texte_libre / fichier) à corriger pour une session
     */
    const getReponsesACorreger = async (sessionId: number) => {
        try {
            const res = await $fetch(`/api/teacher/sessions/${sessionId}/reponses-a-corriger`, {
                headers: getAuthHeader()
            })
            return res
        } catch (error: any) {
            console.error('Erreur récupération réponses à corriger:', error)
            return error.data || { success: false, data: [] }
        }
    }

    /**
     * Attribuer une note manuelle à une réponse texte_libre/fichier
     */
    const corrigerReponse = async (reponseId: number, points: number) => {
        try {
            const res = await $fetch(`/api/teacher/reponses/${reponseId}/corriger`, {
                method: 'PATCH',
                body: { points },
                headers: getAuthHeader()
            })
            return res
        } catch (error: any) {
            console.error('Erreur correction réponse:', error)
            return error.data || { success: false, message: 'Erreur lors de la correction' }
        }
    }

    return {
        // QCM
        createQCM,
        generateQuestionsAI,
        getPlanInfo,
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
        getEtudiantReponses,
        // Données pour formulaires
        getFilieres,
        getClassesByFiliere,
        getAllClasses,
        getMonEcole,

        // Utilitaires
        generateQRCode,
        generateNewCode,
        getTeacherStats,

        // Banque de questions
        getBanqueQuestions,
        createBanqueQuestion,
        updateBanqueQuestion,
        deleteBanqueQuestion,

        // Correction manuelle
        getReponsesACorreger,
        corrigerReponse
    }
}