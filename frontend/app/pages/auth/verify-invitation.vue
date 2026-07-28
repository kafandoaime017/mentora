<template>
  <div class="min-h-screen bg-layout font-body flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">

      <!-- Loading -->
      <div v-if="loading" class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent mx-auto mb-4"/>
        <p class="text-gray-500 text-sm font-body">Vérification en cours...</p>
      </div>

      <!-- Erreur -->
      <div v-else-if="error">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <h2 class="text-lg font-bold text-gray-800 mb-2 font-body">Lien invalide</h2>
        <p class="text-sm text-gray-500 font-body mb-6">{{ error }}</p>
        <nuxt-link to="/auth" class="block w-full py-2.5 bg-primary text-white rounded-xl text-sm font-body font-semibold text-center">
          Retour à la connexion
        </nuxt-link>
      </div>

      <!-- Succès -->
      <div v-else>
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <h2 class="text-lg font-bold text-gray-800 mb-2 font-body">Email vérifié !</h2>
        <p class="text-sm text-gray-500 font-body mb-4">Vous allez être redirigé vers votre espace...</p>
        <div class="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent mx-auto"/>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

definePageMeta({ layout: false })

const route   = useRoute()
const loading = ref(true)
const error   = ref('')

const apiFetch = async (url, options = {}) => {
  const config = useRuntimeConfig()
  return await $fetch(`${config.public.apiBase}${url}`, options)
}

onMounted(async () => {
  const { code, email } = route.query

  if (!code || !email) {
    error.value = 'Lien invalide ou incomplet'
    loading.value = false
    return
  }

  try {
    const result = await apiFetch(
      `/admin/invitations/verify-email?code=${code}&email=${encodeURIComponent(email)}`
    )

    if (result.success) {
      // Stocker la session
      const tokenCookie = useCookie('auth_token', { maxAge: 60 * 60 * 24 * 7 })
      tokenCookie.value = result.data.token
      localStorage.setItem('user', JSON.stringify(result.data.user))

      loading.value = false

      // Rediriger après 1.5s
      const redirects = { etudiant: '/students', professeur: '/teachers', directeur: '/directeurs', superadmin: '/superadmin' }
      setTimeout(() => {
        navigateTo(redirects[result.data.user?.role] || '/auth')
      }, 1500)
    } else {
      error.value   = result.message || 'Lien invalide'
      loading.value = false
    }
  } catch (err) {
    error.value   = err?.data?.message || 'Lien invalide ou expiré'
    loading.value = false
  }
})
</script>