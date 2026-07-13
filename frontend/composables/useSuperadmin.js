// composables/useSuperadmin.js
import { useAuth } from './useAuth'

export const useSuperadmin = () => {
  const { getAuthHeader } = useAuth()

  const getStats = async () => {
    try { return await $fetch('/api/superadmin/stats', { headers: getAuthHeader() }) }
    catch (err) { return { success: false, message: err?.data?.message || 'Erreur' } }
  }

  const getEcoles = async () => {
    try { return await $fetch('/api/superadmin/ecoles', { headers: getAuthHeader() }) }
    catch (err) { return { success: false, data: [], message: err?.data?.message || 'Erreur' } }
  }

  const createEcole = async (data) => {
    try {
      return await $fetch('/api/superadmin/ecoles', {
        method: 'POST', headers: getAuthHeader(), body: data
      })
    } catch (err) { return { success: false, message: err?.data?.message || 'Erreur' } }
  }

  const updateEcole = async (id, data) => {
    try {
      return await $fetch(`/api/superadmin/ecoles/${id}`, {
        method: 'PUT', headers: getAuthHeader(), body: data
      })
    } catch (err) { return { success: false, message: err?.data?.message || 'Erreur' } }
  }

  const deleteEcole = async (id) => {
    try {
      return await $fetch(`/api/superadmin/ecoles/${id}`, {
        method: 'DELETE', headers: getAuthHeader()
      })
    } catch (err) { return { success: false, message: err?.data?.message || 'Erreur' } }
  }

  const getEcoleById = async (id) => {
    try { return await $fetch(`/api/superadmin/ecoles/${id}`, { headers: getAuthHeader() }) }
    catch (err) { return { success: false, data: null, message: err?.data?.message || 'Erreur' } }
  }

  const updateEcolePlan = async (id, data) => {
    try {
      return await $fetch(`/api/superadmin/ecoles/${id}/plan`, {
        method: 'PATCH', headers: getAuthHeader(), body: data
      })
    } catch (err) { return { success: false, message: err?.data?.message || 'Erreur' } }
  }

  const getDirecteurs = async () => {
    try { return await $fetch('/api/superadmin/directeurs', { headers: getAuthHeader() }) }
    catch (err) { return { success: false, data: { directeurs: [], invitations: [] }, message: err?.data?.message || 'Erreur' } }
  }

  const inviterDirecteur = async (data) => {
    try {
      return await $fetch('/api/superadmin/directeurs/inviter', {
        method: 'POST', headers: getAuthHeader(), body: data
      })
    } catch (err) { return { success: false, message: err?.data?.message || 'Erreur' } }
  }

  const toggleDirecteur = async (id) => {
    try {
      return await $fetch(`/api/superadmin/directeurs/${id}/toggle`, {
        method: 'PATCH', headers: getAuthHeader()
      })
    } catch (err) { return { success: false, message: err?.data?.message || 'Erreur' } }
  }

  const deleteDirecteur = async (id) => {
    try {
      return await $fetch(`/api/superadmin/directeurs/${id}`, { method: 'DELETE', headers: getAuthHeader() })
    } catch (err) { return { success: false, message: err?.data?.message || 'Erreur' } }
  }

  const resendVerificationDirecteur = async (id) => {
    try {
      return await $fetch(`/api/superadmin/directeurs/${id}/renvoyer-verif`, { method: 'POST', headers: getAuthHeader() })
    } catch (err) { return { success: false, message: err?.data?.message || 'Erreur' } }
  }

  const resendInvitation = async (id) => {
    try {
      return await $fetch(`/api/superadmin/invitations/${id}/renvoyer`, { method: 'POST', headers: getAuthHeader() })
    } catch (err) { return { success: false, message: err?.data?.message || 'Erreur' } }
  }

  const revokeInvitation = async (id) => {
    try {
      return await $fetch(`/api/superadmin/invitations/${id}`, { method: 'DELETE', headers: getAuthHeader() })
    } catch (err) { return { success: false, message: err?.data?.message || 'Erreur' } }
  }

  const getAllUsers = async (params = {}) => {
    try {
      const query = new URLSearchParams(params).toString()
      return await $fetch(`/api/superadmin/users${query ? '?' + query : ''}`, { headers: getAuthHeader() })
    } catch (err) { return { success: false, data: [], message: err?.data?.message || 'Erreur' } }
  }

  const toggleUserActif = async (id) => {
    try {
      return await $fetch(`/api/superadmin/users/${id}/toggle`, { method: 'PATCH', headers: getAuthHeader() })
    } catch (err) { return { success: false, message: err?.data?.message || 'Erreur' } }
  }

  const deleteUser = async (id) => {
    try {
      return await $fetch(`/api/superadmin/users/${id}`, { method: 'DELETE', headers: getAuthHeader() })
    } catch (err) { return { success: false, message: err?.data?.message || 'Erreur' } }
  }

  const inviterUtilisateur = async (data) => {
    try {
      return await $fetch('/api/superadmin/users/inviter', {
        method: 'POST', headers: getAuthHeader(), body: data
      })
    } catch (err) { return { success: false, message: err?.data?.message || 'Erreur' } }
  }

  const getAbonnements = async () => {
    try { return await $fetch('/api/superadmin/abonnements', { headers: getAuthHeader() }) }
    catch (err) { return { success: false, data: null, message: err?.data?.message || 'Erreur' } }
  }

  // ─── Administration (gestion des comptes superadmin) ───────────────────────
  const getSuperadmins = async () => {
    try { return await $fetch('/api/superadmin/administration/superadmins', { headers: getAuthHeader() }) }
    catch (err) { return { success: false, data: { superadmins: [], invitations: [] }, message: err?.data?.message || 'Erreur' } }
  }

  const inviterSuperadmin = async (data) => {
    try {
      return await $fetch('/api/superadmin/administration/superadmins/inviter', {
        method: 'POST', headers: getAuthHeader(), body: data
      })
    } catch (err) { return { success: false, message: err?.data?.message || 'Erreur' } }
  }

  const toggleSuperadminActif = async (id) => {
    try {
      return await $fetch(`/api/superadmin/administration/superadmins/${id}/toggle`, { method: 'PATCH', headers: getAuthHeader() })
    } catch (err) { return { success: false, message: err?.data?.message || 'Erreur' } }
  }

  const deleteSuperadmin = async (id) => {
    try {
      return await $fetch(`/api/superadmin/administration/superadmins/${id}`, { method: 'DELETE', headers: getAuthHeader() })
    } catch (err) { return { success: false, message: err?.data?.message || 'Erreur' } }
  }

  const resendSuperadminInvitation = async (id) => {
    try {
      return await $fetch(`/api/superadmin/administration/invitations/${id}/renvoyer`, { method: 'POST', headers: getAuthHeader() })
    } catch (err) { return { success: false, message: err?.data?.message || 'Erreur' } }
  }

  const revokeSuperadminInvitation = async (id) => {
    try {
      return await $fetch(`/api/superadmin/administration/invitations/${id}`, { method: 'DELETE', headers: getAuthHeader() })
    } catch (err) { return { success: false, message: err?.data?.message || 'Erreur' } }
  }

  return {
    getStats,
    getEcoles, getEcoleById, createEcole, updateEcole, updateEcolePlan, deleteEcole,
    getDirecteurs, inviterDirecteur, toggleDirecteur, deleteDirecteur,
    resendVerificationDirecteur, resendInvitation, revokeInvitation,
    getAllUsers, toggleUserActif, deleteUser, inviterUtilisateur,
    getAbonnements,
    getSuperadmins, inviterSuperadmin, toggleSuperadminActif, deleteSuperadmin,
    resendSuperadminInvitation, revokeSuperadminInvitation
  }
}