interface Session {
    id: number
    titre: string
    date_debut: string
    duree: number
    status: string
    code: string
    theme?: string
    professeur?: string
}

interface VerifyCodeResponse {
    sessionId: number
    titre: string
    duree: number
    date_fin: string
    professeur?: string
}

interface HistoriqueSession {
    id: number
    session: {
        id: number
        titre: string
        theme?: string
        date_debut: string
        date_fin: string
        duree: number
    }
    score: number
    note_sur_20?: number
    date_completed: string
    statut: string
}

interface ApiResponse<T = any> {
    success: boolean
    data?: T
    message?: string
}

export const useStudent = () => {
    const getAuthHeader = () => {
        const token = useCookie('auth_token').value
        return { Authorization: `Bearer ${token}` }
    }

    const getAvailableSessions = async (): Promise<ApiResponse<Session[]>> => {
        try {
            const res = await $fetch<ApiResponse<Session[]>>('/api/students/sessions', {
                headers: getAuthHeader()
            })
            return res
        } catch (error: any) {
            console.error('Erreur récupération sessions:', error)
            return { success: false, data: [], message: error?.message || 'Erreur serveur' }
        }
    }

    const verifySessionCode = async (code: string): Promise<ApiResponse<VerifyCodeResponse>> => {
        try {
            const res = await $fetch<ApiResponse<VerifyCodeResponse>>('/api/students/sessions/verify-code', {
                method: 'POST',
                body: { code: code.toUpperCase() },
                headers: getAuthHeader()
            })
            return res
        } catch (error: any) {
            console.error('Erreur vérification code:', error)
            return { success: false, message: error?.data?.message }
        }
    }

    const joinSession = async (sessionId: number): Promise<ApiResponse> => {
        try {
            const res = await $fetch<ApiResponse>('/api/students/sessions/join', {
                method: 'POST',
                body: { sessionId },
                headers: getAuthHeader()
            })
            return res
        } catch (error: any) {
            console.error('Erreur rejoindre session:', error)
            return { success: false, message: error?.data?.message || 'Erreur lors du rejoignement' }
        }
    }

    const getSessionForStudent = async (sessionId: number) => {
        try {
            const res = await $fetch(`/api/students/sessions/${sessionId}`, {
                headers: getAuthHeader()
            })
            return res
        } catch (error: any) {
            return { success: false, message: error?.data?.message || 'Erreur lors du chargement' }
        }
    }

    // 🆕 Fonction pour récupérer l'historique des sessions
    const getHistorique = async (): Promise<ApiResponse<HistoriqueSession[]>> => {
        try {
            const res = await $fetch<ApiResponse<HistoriqueSession[]>>('/api/students/historique', {
                headers: getAuthHeader()
            })
            return res
        } catch (error: any) {
            console.error('Erreur récupération historique:', error)
            return { success: false, data: [], message: error?.data?.message || 'Erreur lors du chargement' }
        }
    }

    
const getSessionResult = async (sessionId: number) => {
    try {
        const res = await $fetch(`/api/students/sessions/${sessionId}/resultats`, {
            headers: getAuthHeader()
        })
        return res
    } catch (error: any) {
        console.error('Erreur récupération résultats session:', error)
        return { success: false, message: error?.data?.message || 'Erreur lors du chargement' }
    }
}

// Ajouter cette fonction dans useStudent.ts
const submitAllReponses = async (sessionId: number, reponses: Array<{ questionId: number, reponseIds: number[] }>): Promise<ApiResponse> => {
    try {
        const res = await $fetch<ApiResponse>(`/api/students/sessions/${sessionId}/reponses`, {
            method: 'POST',
            body: { reponses },
            headers: getAuthHeader()
        })
        return res
    } catch (error: any) {
        console.error('Erreur soumission toutes réponses:', error)
        return { success: false, message: error?.data?.message || 'Erreur lors de la soumission' }
    }
}

    return {
        getAvailableSessions,
        verifySessionCode,
        joinSession,
        getSessionForStudent,
        getHistorique, 
        getSessionResult,
        submitAllReponses
    }
}