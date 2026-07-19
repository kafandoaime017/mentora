// composables/useAuth.js

import { useToast } from '../composables/useToast'

const toast = useToast()

export const useAuth = () => {

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
      localStorage.removeItem('totp_pending')
    }
  }

  const getDashboard = (role) => {
    if (role === 'etudiant')   return '/students'
    if (role === 'professeur') return '/teachers'
    if (role === 'directeur')  return '/directeurs'
    if (role === 'superadmin') return '/superadmin'
    return '/auth'
  }

  const getAuthHeader = () => {
    const token = getToken().value
    return { Authorization: `Bearer ${token}` }
  }

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

      // ← TOTP requis
      if (res.success && res.totp_required) {
        if (process.client) {
          localStorage.setItem('totp_pending', JSON.stringify({
            tempToken: res.tempToken,
            userId:    res.userId
          }))
        }
        await navigateTo('/auth/totp')
        return { success: true, totp_required: true }
      }

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
      if (message.toLowerCase().includes('vérifier votre email')) {
        await navigateTo({ path: '/verify-email', query: { email } })
        return { success: false, requiresVerification: true, email }
      }
      return { success: false, message }
    }
  }

  const register = async (payload) => {
    const res = await $fetch('/api/auth/register', {
      method: 'POST',
      body: payload
    })
    if (res.success && res.requiresVerification) {
      await navigateTo({ path: '/verify-email', query: { email: res.email } })
      toast.success('Inscription réussie ! Veuillez vérifier votre email pour activer votre compte.')
      return { success: true, requiresVerification: true, email: res.email }
    }
    if (res.success && res.token) {
      setSession(res.token, res.user)
      await navigateTo(getDashboard(res.user.role))
      return { success: true }
    }
    toast.error(res.message || "Erreur lors de l'inscription")
    return { success: false, message: res.message || "Erreur lors de l'inscription" }
  }

  const logout = async () => {
    clearSession()
    toast.success('Déconnexion réussie !')
    await navigateTo('/auth')
  }

  const getGoogleUrl = async () => {
    try {
      const res = await $fetch('/api/auth/google/url', { method: 'GET' })
      if (res.success && res.data?.url) {
        window.location.href = res.data.url
        return { success: true }
      }
      return { success: false, message: "Erreur lors de la génération de l'URL Google" }
    } catch (error) {
      return { success: false, message: 'Erreur lors de la connexion avec Google' }
    }
  }

  const getProfile = async () => {
    try {
      const res = await $fetch('/api/users/me', {
        method: 'GET',
        headers: getAuthHeader()
      })
      return res
    } catch (error) {
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
      if (res.success && res.user) {
        const currentUser = getUser()
        if (currentUser) {
          localStorage.setItem('user', JSON.stringify({ ...currentUser, ...res.user }))
        }
      }
      return res
    } catch (error) {
      return { success: false, message: 'Erreur lors de la mise à jour' }
    }
  }

  const updateAvatar = async (file) => {
    try {
      const formData = new FormData()
      formData.append('avatar', file)
      const res = await $fetch('/api/users/me/avatar', {
        method: 'POST',
        body: formData
      })
      if (res.success && res.user) {
        const currentUser = getUser()
        if (currentUser) {
          localStorage.setItem('user', JSON.stringify({ ...currentUser, avatar: res.user.avatar }))
        }
      }
      return res
    } catch (error) {
      return { success: false, message: "Erreur lors de la mise à jour de l'avatar" }
    }
  }

  // Definit l'avatar a partir d'une URL externe (avatar DiceBear choisi dans
  // l'AvatarPicker), sans passer par un upload de fichier.
  const updateAvatarUrl = async (avatarUrl) => {
    try {
      const res = await $fetch('/api/users/me/avatar-url', {
        method: 'POST',
        headers: getAuthHeader(),
        body: { avatarUrl }
      })
      if (res.success && res.user) {
        const currentUser = getUser()
        if (currentUser) {
          localStorage.setItem('user', JSON.stringify({ ...currentUser, avatar: res.user.avatar }))
        }
      }
      return res
    } catch (error) {
      return { success: false, message: error?.data?.message || "Erreur lors de la mise à jour de l'avatar" }
    }
  }

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
      return { success: false, message: res.message || "Erreur lors de l'envoi du lien" }
    } catch (error) {
      return { success: false, message: error?.data?.message || "Erreur lors de l'envoi du lien de réinitialisation" }
    }
  }

  const verifierTokenReset = async (token) => {
    try {
      const res = await $fetch(`/api/auth/verifier-token-reset/${token}`, { method: 'GET' })
      if (res.success) return { success: true, message: res.message, email: res.email }
      return { success: false, message: res.message || 'Token invalide' }
    } catch (error) {
      return { success: false, message: error?.data?.message || 'Token invalide ou expiré' }
    }
  }

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
      return { success: false, message: error?.data?.message || 'Erreur lors de la réinitialisation du mot de passe' }
    }
  }

  const envoyerCodeChangementMdp = async () => {
    try {
      const res = await $fetch('/api/auth/envoyer-code-mdp', {
        method:  'POST',
        headers: getAuthHeader()
      })
      if (res.success) {
        toast.success(res.message)
        return { success: true, message: res.message }
      }
      return { success: false, message: res.message || 'Erreur' }
    } catch (error) {
      toast.error(error?.data?.message || "Erreur lors de l'envoi du code")
      return { success: false, message: error?.data?.message || 'Erreur' }
    }
  }

  const changerMotDePasse = async (codeVerification, nouveauMotDePasse, confirmationMotDePasse) => {
    try {
      const res = await $fetch('/api/auth/changer-mot-de-passe', {
        method:  'POST',
        headers: getAuthHeader(),
        body:    { codeVerification, nouveauMotDePasse, confirmationMotDePasse }
      })
      if (res.success) {
        toast.success(res.message || 'Mot de passe modifié avec succès')
        return { success: true }
      }
      return { success: false, message: res.message || 'Erreur' }
    } catch (error) {
      toast.error(error?.data?.message || 'Erreur lors du changement de mot de passe')
      return { success: false, message: error?.data?.message || 'Erreur' }
    }
  }

  return {
    getToken,
    getUser,
    getDashboard,
    clearSession,
    setSession,
    getAuthHeader,
    login,
    register,
    logout,
    verifierEmail,
    renvoyerCode,
    getGoogleUrl,
    getProfile,
    updateProfile,
    updateAvatar,
    updateAvatarUrl,
    envoyerLienResetMotDePasse,
    verifierTokenReset,
    reinitialiserMotDePasse,
    envoyerCodeChangementMdp,
    changerMotDePasse
  }
}