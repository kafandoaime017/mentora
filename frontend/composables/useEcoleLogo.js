// composables/useEcoleLogo.js
// Récupère le nom/logo de l'école du user connecté (étudiant, professeur,
// directeur ou superadmin) pour l'afficher dans les en-têtes des dashboards.
export const useEcoleLogo = () => {
  const ecoleNom  = ref('')
  const ecoleLogo = ref('')
  const ecolePlan = ref('')
  const loaded    = ref(false)

  const logoUrl = computed(() => {
    if (!ecoleLogo.value) return ''
    return ecoleLogo.value.startsWith('http')
      ? ecoleLogo.value
      : `${useRuntimeConfig().public.apiBase.replace(/\/api$/, '')}${ecoleLogo.value}`
  })

  const chargerEcoleLogo = async () => {
    try {
      const config = useRuntimeConfig()
      const token  = useCookie('auth_token').value
      if (!token) return
      const res = await $fetch(`${config.public.apiBase}/users/me/ecole`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.success && res.data) {
        ecoleNom.value  = res.data.nom || ''
        ecoleLogo.value = res.data.logo || ''
        ecolePlan.value = res.data.plan || ''
      }
    } catch {
      // silencieux : l'en-tête retombe simplement sur le branding par défaut
    } finally {
      loaded.value = true
    }
  }

  return { ecoleNom, ecoleLogo, ecolePlan, logoUrl, loaded, chargerEcoleLogo }
}
