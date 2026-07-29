export const useApi = () => {
  const api = $fetch.create({
    baseURL: useRuntimeConfig().public.apiBase,
  })

  return api
}