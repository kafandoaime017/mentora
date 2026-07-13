// composables/useAdmin.js
// types/admin.ts

export interface DashboardStats {
  totalEtudiants:      number
  totalProfesseurs:    number
  totalFilieres:       number
  totalClasses:        number
  invitationsEnAttente: number
  professeursPending:  number
}

export interface DernierInscrit {
  id:        number
  nom:       string
  prenom:    string
  email:     string
  role:      string
  createdAt: string
}

export interface DashboardData {
  stats:            DashboardStats
  derniersInscrits: DernierInscrit[]
}

export interface Ecole {
  id:       number
  nom:      string
  ville:    string | null
  logo:     string | null
  isActive: boolean
}

export interface Filiere {
  id:       number
  nom:      string
  ecoleId:  number
  isActive: boolean
  classes:  Classe[]
}

export interface Classe {
  id:              number
  nom:             string
  filiereId:       number
  filiere:         string | null
  isActive:        boolean
  codeInscription: string | null
  nbEtudiants:     number
}

export interface UserProfil {
  classe:   string | null
  filiere:  string | null
  statut?:  string | null
}

export interface AdminUser {
  id:        number
  nom:       string
  prenom:    string
  email:     string
  role:      string
  isActive:  boolean
  createdAt: string
  profil:    UserProfil
}

export interface Invitation {
  id:        number
  email:     string
  nom:       string
  prenom:    string
  role:      string
  classe:    string | null
  filiere:   string | null
  used:      boolean
  expiresAt: string
  createdAt: string
  expired:   boolean
}

export interface SessionAdmin {
  id:              number
  titre:           string
  theme:           string | null
  status:          string
  code:            string
  date_debut:      string
  date_fin:        string
  duree:           number
  created_at:      string
  classe:          string | null
  filiere:         string | null
  professeur:      { id: number, nom: string, prenom: string }
  nb_questions:    number
  nb_participants: number
}

export interface SessionParticipant {
  id:             number
  statut:         string
  score:          number | null
  note_sur_20:    number
  date_completed: string | null
  etudiant: {
    id:     number
    nom:    string
    prenom: string
    email:  string
  }
}

export interface SessionDetails {
  session: {
    id:         number
    titre:      string
    theme:      string | null
    status:     string
    code:       string
    date_debut: string
    date_fin:   string
    duree:      number
    classe:     string | null
    filiere:    string | null
    professeur: string
  }
  stats: {
    nb_questions:    number
    total_points:    number
    nb_participants: number
    nb_termines:     number
    moyenne_sur_20:  number
  }
  participants: SessionParticipant[]
}

export interface ApiResponse<T = any> {
  success: boolean
  data?:   T
  message?: string
}

export const useAdmin = () => {
    const getAuthHeader = () => {
        const token = useCookie('auth_token').value
        return { Authorization: `Bearer ${token}` }
    }

    // ==================== DASHBOARD ====================

    const getDashboard = async () => {
        try {
            return await $fetch('/api/admin/dashboard', { headers: getAuthHeader() })
        } catch (error) {
            console.error('Erreur dashboard:', error)
            return error.data || { success: false, message: 'Erreur chargement dashboard' }
        }
    }

    // ==================== ÉCOLE ====================

    const getEcole = async () => {
        try {
            return await $fetch('/api/admin/ecole', { headers: getAuthHeader() })
        } catch (error) {
            console.error('Erreur école:', error)
            return error.data || { success: false, data: null }
        }
    }

    const updateEcole = async (data) => {
        try {
            return await $fetch('/api/admin/ecole', {
                method: 'PUT', headers: getAuthHeader(), body: data
            })
        } catch (error) {
            console.error('Erreur update école:', error)
            return error.data || { success: false, message: 'Erreur mise à jour école' }
        }
    }

    // ==================== FILIÈRES ====================

    const getFilieres = async () => {
        try {
            return await $fetch('/api/admin/filieres', { headers: getAuthHeader() })
        } catch (error) {
            console.error('Erreur filières:', error)
            return error.data || { success: false, data: [] }
        }
    }

    const createFiliere = async (data) => {
        try {
            return await $fetch('/api/admin/filieres', {
                method: 'POST', headers: getAuthHeader(), body: data
            })
        } catch (error) {
            console.error('Erreur création filière:', error)
            return error.data || { success: false, message: 'Erreur création filière' }
        }
    }

    const updateFiliere = async (id, data) => {
        try {
            return await $fetch(`/api/admin/filieres/${id}`, {
                method: 'PUT', headers: getAuthHeader(), body: data
            })
        } catch (error) {
            console.error('Erreur update filière:', error)
            return error.data || { success: false, message: 'Erreur mise à jour filière' }
        }
    }

    const deleteFiliere = async (id) => {
        try {
            return await $fetch(`/api/admin/filieres/${id}`, {
                method: 'DELETE', headers: getAuthHeader()
            })
        } catch (error) {
            console.error('Erreur suppression filière:', error)
            return error.data || { success: false, message: 'Erreur suppression filière' }
        }
    }

    // ==================== CLASSES ====================

    const getClasses = async (filiereId = null) => {
        try {
            const params = filiereId ? `?filiereId=${filiereId}` : ''
            return await $fetch(`/api/admin/classes${params}`, { headers: getAuthHeader() })
        } catch (error) {
            console.error('Erreur classes:', error)
            return error.data || { success: false, data: [] }
        }
    }

    const createClasse = async (data) => {
        try {
            return await $fetch('/api/admin/classes', {
                method: 'POST', headers: getAuthHeader(), body: data
            })
        } catch (error) {
            console.error('Erreur création classe:', error)
            return error.data || { success: false, message: 'Erreur création classe' }
        }
    }

    const updateClasse = async (id, data) => {
        try {
            return await $fetch(`/api/admin/classes/${id}`, {
                method: 'PUT', headers: getAuthHeader(), body: data
            })
        } catch (error) {
            console.error('Erreur update classe:', error)
            return error.data || { success: false, message: 'Erreur mise à jour classe' }
        }
    }

    const deleteClasse = async (id) => {
        try {
            return await $fetch(`/api/admin/classes/${id}`, {
                method: 'DELETE', headers: getAuthHeader()
            })
        } catch (error) {
            console.error('Erreur suppression classe:', error)
            return error.data || { success: false, message: 'Erreur suppression classe' }
        }
    }

    const generateClasseCode = async (id) => {
        try {
            return await $fetch(`/api/admin/classes/${id}/generate-code`, {
                method: 'POST', headers: getAuthHeader()
            })
        } catch (error) {
            console.error('Erreur génération code:', error)
            return error.data || { success: false, message: 'Erreur génération code' }
        }
    }

    // ==================== UTILISATEURS ====================

    const getUsers = async (params = {}) => {
        try {
            const query = new URLSearchParams(params).toString()
            return await $fetch(`/api/admin/users${query ? '?' + query : ''}`, { headers: getAuthHeader() })
        } catch (error) {
            console.error('Erreur users:', error)
            return error.data || { success: false, data: [] }
        }
    }

    const toggleUserActive = async (id) => {
        try {
            return await $fetch(`/api/admin/users/${id}/toggle`, {
                method: 'PATCH', headers: getAuthHeader()
            })
        } catch (error) {
            console.error('Erreur toggle user:', error)
            return error.data || { success: false, message: 'Erreur activation/désactivation' }
        }
    }

    const deleteUser = async (id) => {
        try {
            return await $fetch(`/api/admin/users/${id}`, {
                method: 'DELETE', headers: getAuthHeader()
            })
        } catch (error) {
            console.error('Erreur suppression user:', error)
            return error.data || { success: false, message: 'Erreur suppression utilisateur' }
        }
    }

    const activateProfesseur = async (id) => {
        try {
            return await $fetch(`/api/admin/users/${id}/activate-prof`, {
                method: 'PATCH', headers: getAuthHeader()
            })
        } catch (error) {
            console.error('Erreur activation prof:', error)
            return error.data || { success: false, message: 'Erreur activation professeur' }
        }
    }

    // ==================== INVITATIONS ====================

    const getInvitations = async () => {
        try {
            return await $fetch('/api/admin/invitations', { headers: getAuthHeader() })
        } catch (error) {
            console.error('Erreur invitations:', error)
            return error.data || { success: false, data: [] }
        }
    }

    const sendInvitation = async (data) => {
  try {
    return await $fetch('/api/admin/invitations', {
      method: 'POST', headers: getAuthHeader(), body: data
    })
  } catch (err) {
    const message = err?.data?.message || 'Erreur'
    const code    = err?.data?.code

    // Rediriger vers abonnement si limite atteinte
    if (code === 'LIMITE_ETUDIANTS' || code === 'LIMITE_PROFESSEURS') {
      return { 
        success: false, 
        message, 
        code,
        redirect: '/directeurs/abonnement' 
      }
    }
    return { success: false, message }
  }
}

    const deleteInvitation = async (id) => {
        try {
            return await $fetch(`/api/admin/invitations/${id}`, {
                method: 'DELETE', headers: getAuthHeader()
            })
        } catch (error) {
            console.error('Erreur suppression invitation:', error)
            return error.data || { success: false, message: 'Erreur suppression invitation' }
        }
    }

    const resendInvitation = async (id) => {
        try {
            return await $fetch(`/api/admin/invitations/${id}/resend`, {
                method: 'POST', headers: getAuthHeader()
            })
        } catch (error) {
            console.error('Erreur renvoi invitation:', error)
            return error.data || { success: false, message: 'Erreur renvoi invitation' }
        }
    }

    const revokeInvitation = async (id) => {
        try {
            return await $fetch(`/api/admin/invitations/${id}/revoke`, {
                method: 'PATCH', headers: getAuthHeader()
            })
        } catch (error) {
            console.error('Erreur révocation invitation:', error)
            return error.data || { success: false, message: 'Erreur révocation invitation' }
        }
    }

    // ==================== SESSIONS ====================

    const getSessions = async (params = {}) => {
        try {
            const query = new URLSearchParams(params).toString()
            return await $fetch(`/api/admin/sessions${query ? '?' + query : ''}`, { headers: getAuthHeader() })
        } catch (error) {
            console.error('Erreur sessions:', error)
            return error.data || { success: false, data: [] }
        }
    }

    const getSessionDetails = async (id) => {
        try {
            return await $fetch(`/api/admin/sessions/${id}`, { headers: getAuthHeader() })
        } catch (error) {
            console.error('Erreur détails session:', error)
            return error.data || { success: false, data: null }
        }
    }

    const deleteSession = async (id) => {
        try {
            return await $fetch(`/api/admin/sessions/${id}`, {
                method: 'DELETE', headers: getAuthHeader()
            })
        } catch (error) {
            console.error('Erreur suppression session:', error)
            return error.data || { success: false, message: 'Erreur suppression session' }
        }
    }

    return {
        // Dashboard
        getDashboard,
        // École
        getEcole, updateEcole,
        // Filières
        getFilieres, createFiliere, updateFiliere, deleteFiliere,
        // Classes
        getClasses, createClasse, updateClasse, deleteClasse, generateClasseCode,
        // Utilisateurs
        getUsers, toggleUserActive, deleteUser, activateProfesseur,
        // Invitations
        getInvitations, sendInvitation, deleteInvitation, resendInvitation, revokeInvitation,
        // Sessions
        getSessions, getSessionDetails, deleteSession
    }
}