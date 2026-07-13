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

  const getDirecteurs = async () => {
    try { return await $fetch('/api/superadmin/directeurs', { headers: getAuthHeader() }) }
    catch (err) { return { success: false, data: [], message: err?.data?.message || 'Erreur' } }
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

  const getAllUsers = async (params = {}) => {
    try {
      const query = new URLSearchParams(params).toString()
      return await $fetch(`/api/superadmin/users${query ? '?' + query : ''}`, { headers: getAuthHeader() })
    } catch (err) { return { success: false, data: [], message: err?.data?.message || 'Erreur' } }
  }

  const getAbonnements = async () => {
    try { return await $fetch('/api/superadmin/abonnements', { headers: getAuthHeader() }) }
    catch (err) { return { success: false, data: null, message: err?.data?.message || 'Erreur' } }
  }

  return {
    getStats,
    getEcoles, createEcole, updateEcole, deleteEcole,
    getDirecteurs, inviterDirecteur, toggleDirecteur,
    getAllUsers, getAbonnements
  }
}