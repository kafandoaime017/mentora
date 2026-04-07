// composables/useAuth.js

import { useToast } from '../composables/useToast'

const toast = useToast()

export const useAuth = () => {

  // ── Helpers cookies & storage ──────────────────────────
  const getToken = () => useCookie('auth_token', { path: '/' })

  const getUser = () => {
    if (!process.client) return null
    return JSON.parse(localStorage.getItem('user') || 'null')
  }

  const setSession = (token, user) => {
    const authCookie = useCookie('auth_token', { path: '/' })
    authCookie.value = token
    if (process.client) {
      localStorage.setItem('user', JSON.stringify(user))
    }
  }

  const clearSession = () => {
    const authCookie = useCookie('auth_token', { path: '/' })
    authCookie.value = null
    if (process.client) {
      localStorage.removeItem('user')
    }
  }

  const getDashboard = (role) => {
    if (role === 'etudiant') return '/students'
    if (role === 'professeur') return '/teachers'
    if (role === 'admin') return '/admin'
    return '/login'
  }

  // ── Récupérer le token pour l'en-tête Authorization ──────────────────────────
  const getAuthHeader = () => {
    const token = getToken().value
    return {
      Authorization: `Bearer ${token}`
    }
  }

  // ── Vérification d'email ────────────────────────────────────────
  const verifierEmail = async (email, code) => {
    try {
      const res = await $fetch('/api/auth/verifier-email', {
        method: 'POST',
        body: { email, code }
      })

      if (res.success && res.token) {
        setSession(res.token, res.user)
        await navigateTo(getDashboard(res.user.role))
        toast.success('Email vérifié avec succès ! Vous êtes maintenant connecté.')
        return { success: true, message: res.message }
      }

      return { success: false, message: res.message || 'Code invalide' }
    } catch (error) {
      toast.error(error?.data?.message || 'Erreur lors de la vérification')
      return { success: false, message: error?.data?.message || 'Erreur lors de la vérification' }
    }
  }

  const renvoyerCode = async (email) => {
    try {
      const res = await $fetch('/api/auth/renvoyer-code', {
        method: 'POST',
        body: { email }
      })

      if (res.success) {
        toast.success('Code renvoyé avec succès !')
        return { success: true, message: res.message }
      }

      return { success: false, message: res.message || 'Erreur lors du renvoi' }
    } catch (error) {
      toast.error(error?.data?.message || 'Erreur lors du renvoi du code')
      return { success: false, message: error?.data?.message || 'Erreur lors du renvoi du code' }
    }
  }

  // ── Connexion ──────────────────────────────────────────
  const login = async (email, motDePasse) => {
    try {
      const res = await $fetch('/api/auth/login', {
        method: 'POST',
        body: { email, motDePasse }
      })

      if (res.success && res.token) {
        setSession(res.token, res.user)
        toast.success('Vous êtes maintenant connecté !')
        await navigateTo(getDashboard(res.user.role))
        return { success: true }
      }

      return { success: false, message: res.message || 'Identifiants incorrects. Veuillez réessayer.' }
    } catch (error) {
      const message = error?.data?.message || 'Identifiants incorrects. Veuillez réessayer.'
      toast.error(message)
      
      // Si l'email n'est pas vérifié, rediriger vers la page de vérification
      if (message.toLowerCase().includes('vérifier votre email')) {
        await navigateTo({
          path: '/verify-email',
          query: { email }
        })
        return { success: false, requiresVerification: true, email }
      }
      
      return { success: false, message }
    }
  }

  // ── Inscription ────────────────────────────────────────
  const register = async (payload) => {
    const res = await $fetch('/api/auth/register', {
      method: 'POST',
      body: payload
    })

    // Si la vérification est requise
    if (res.success && res.requiresVerification) {
      await navigateTo({
        path: '/verify-email',
        query: { email: res.email }
      })
      toast.success('Inscription réussie ! Veuillez vérifier votre email pour activer votre compte.')
      return { success: true, requiresVerification: true, email: res.email }
    }

    // Ancien comportement (pour compatibilité)
    if (res.success && res.token) {
      setSession(res.token, res.user)
      await navigateTo(getDashboard(res.user.role))
      return { success: true }
    }

    toast.error(res.message || "Erreur lors de l'inscription")
    return { success: false, message: res.message || "Erreur lors de l'inscription" }
  }

  // ── Déconnexion ────────────────────────────────────────
  const logout = async () => {
    clearSession()
    toast.success('Déconnexion réussie !')
    await navigateTo('/auth')
  }

  // ── Google OAuth ───────────────────────────────────────
  const getGoogleUrl = async () => {
    try {
      const res = await $fetch('/api/auth/google/url', {
        method: 'GET'
      });
      
      if (res.success && res.data?.url) {
        window.location.href = res.data.url;
        return { success: true };
      }
      
      return { success: false, message: 'Erreur lors de la génération de l\'URL Google' };
    } catch (error) {
      console.error('Erreur Google URL:', error);
      return { success: false, message: 'Erreur lors de la connexion avec Google' };
    }
  };

  // ── Profil utilisateur ────────────────────────────────────────
  const getProfile = async () => {
    try {
      const res = await $fetch('/api/users/me', {
        method: 'GET',
        headers: getAuthHeader()
      })
      return res
    } catch (error) {
      console.error('Erreur getProfile:', error)
      return { success: false, message: 'Erreur lors du chargement du profil' }
    }
  }

  const updateProfile = async (data) => {
    try {
      const res = await $fetch('/api/users/me', {
        method: 'PUT',
        headers: getAuthHeader(),
        body: data
      })
      
      // Si la mise à jour réussit, mettre à jour le localStorage
      if (res.success && res.user) {
        const currentUser = getUser()
        if (currentUser) {
          const updatedUser = { ...currentUser, ...res.user }
          localStorage.setItem('user', JSON.stringify(updatedUser))
        }
      }
      
      return res
    } catch (error) {
      console.error('Erreur updateProfile:', error)
      return { success: false, message: 'Erreur lors de la mise à jour' }
    }
  }

  // ── Mise à jour de l'avatar ────────────────────────────────────────
  const updateAvatar = async (file) => {
    try {
      const formData = new FormData()
      formData.append('avatar', file)
      
      const res = await $fetch('/api/users/me/avatar', {
        method: 'POST',
        body: formData
      })
      
      if (res.success && res.user) {
        // Mettre à jour le localStorage
        const currentUser = getUser()
        if (currentUser) {
          const updatedUser = { ...currentUser, avatar: res.user.avatar }
          localStorage.setItem('user', JSON.stringify(updatedUser))
        }
      }
      
      return res
    } catch (error) {
      console.error('Erreur updateAvatar:', error)
      return { success: false, message: 'Erreur lors de la mise à jour de l\'avatar' }
    }
  }

  // 🆕 ── RÉINITIALISATION DU MOT DE PASSE ────────────────────────────────────────

  /**
   * Envoyer un lien de réinitialisation du mot de passe
   * @param {string} email - Adresse email de l'utilisateur
   * @returns {Promise<{success: boolean, message: string}>}
   */
  const envoyerLienResetMotDePasse = async (email) => {
    try {
      const res = await $fetch('/api/auth/mot-de-passe-oublie', {
        method: 'POST',
        body: { email }
      })

      if (res.success) {
        toast.success(res.message)
        return { success: true, message: res.message }
      }

      return { success: false, message: res.message || 'Erreur lors de l\'envoi du lien' }
    } catch (error) {
      console.error('Erreur envoyerLienResetMotDePasse:', error)
      return { 
        success: false, 
        message: error?.data?.message || 'Erreur lors de l\'envoi du lien de réinitialisation' 
      }
    }
  }

  /**
   * Vérifier si un token de réinitialisation est valide
   * @param {string} token - Token de réinitialisation
   * @returns {Promise<{success: boolean, message: string, email?: string}>}
   */
  const verifierTokenReset = async (token) => {
    try {
      const res = await $fetch(`/api/auth/verifier-token-reset/${token}`, {
        method: 'GET'
      })

      if (res.success) {
        return { success: true, message: res.message, email: res.email }
      }

      return { success: false, message: res.message || 'Token invalide' }
    } catch (error) {
      console.error('Erreur verifierTokenReset:', error)
      return { 
        success: false, 
        message: error?.data?.message || 'Token invalide ou expiré' 
      }
    }
  }

  /**
   * Réinitialiser le mot de passe
   * @param {string} token - Token de réinitialisation
   * @param {string} email - Adresse email de l'utilisateur
   * @param {string} motDePasse - Nouveau mot de passe
   * @param {string} motDePasseConfirmation - Confirmation du nouveau mot de passe
   * @returns {Promise<{success: boolean, message: string}>}
   */
  const reinitialiserMotDePasse = async (token, email, motDePasse, motDePasseConfirmation) => {
    try {
      const res = await $fetch('/api/auth/reinitialiser-mot-de-passe', {
        method: 'POST',
        body: { token, email, motDePasse, motDePasseConfirmation }
      })

      if (res.success) {
        toast.success(res.message)
        return { success: true, message: res.message }
      }

      return { success: false, message: res.message || 'Erreur lors de la réinitialisation' }
    } catch (error) {
      console.error('Erreur reinitialiserMotDePasse:', error)
      return { 
        success: false, 
        message: error?.data?.message || 'Erreur lors de la réinitialisation du mot de passe' 
      }
    }
  }

  return {
    // Helpers
    getToken,
    getUser,
    getDashboard,
    clearSession,
    getAuthHeader,
    
    // Authentification
    login,
    register,
    logout,
    
    // Vérification email
    verifierEmail,
    renvoyerCode,
    
    // Google OAuth
    getGoogleUrl,
    
    // Profil
    getProfile,
    updateProfile,
    updateAvatar,
    
    // 🆕 Réinitialisation mot de passe
    envoyerLienResetMotDePasse,
    verifierTokenReset,
    reinitialiserMotDePasse
  }
}