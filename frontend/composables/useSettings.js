import { useAuth } from './useAuth'


export const useSettings = () => {
  const { getAuthHeader } = useAuth()

  const getSettings = async () => {
    try {
      const res = await $fetch('/api/settings', {
        method:  'GET',
        headers: getAuthHeader()
      })
      return res
    } catch {
      return { success: false }
    }
  }

  const updateSettings = async (data) => {
    try {
      const res = await $fetch('/api/settings', {
        method:  'PUT',
        headers: getAuthHeader(),
        body:    data
      })
      return res
    } catch {
      return { success: false }
    }
  }

  return { getSettings, updateSettings }
}