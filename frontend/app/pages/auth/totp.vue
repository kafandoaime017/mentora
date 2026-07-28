<template>
  <div class="min-h-screen bg-[#f5f0e8] font-body flex items-center justify-center p-4">
    <div class="bg-white  rounded-2xl  max-w-md w-full p-8" style="box-shadow: 1px 1px 5px 1px #cfcfcf;">

      <!-- Logo -->
      <div class="text-center mb-8">
        <img src="/images/logo-color.png" alt="Mentora" class="h-16 mx-auto mb-4"/>
        <h1 class="text-xl font-extrabold text-[#1e3a2f] font-body">Vérification 2FA</h1>
        <p class="text-sm text-gray-500 font-body mt-1">
          Entrez le code généré par votre application
        </p>
      </div>

      <!-- Icone -->
      <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg class="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
        </svg>
      </div>

      <!-- Champ code -->
      <div class="mb-4">
        <label class="block text-sm font-semibold text-gray-700 font-body mb-2 text-center">
          Code App Authenticator
        </label>
        <input
          v-model="code"
          type="text"
          inputmode="numeric"
          maxlength="6"
          placeholder="000000"
          @input="code = code.replace(/\D/g, '').slice(0, 6)"
          @keyup.enter="verifier"
          class="w-full px-4 py-2 bg-[#f5f0e8] rounded-xl text-center text-3xl font-mono font-bold tracking-[0.5em] focus:outline-none"
          autofocus
        />
      </div>

      <!-- Erreur -->
      <div v-if="erreur" class="bg-red-50 text-red-600 text-sm font-body rounded-xl px-4 py-3 mb-4 text-center">
        {{ erreur }}
      </div>

      <!-- Bouton -->
      <button
        @click="verifier"
        :disabled="loading || code.length !== 6"
        class="w-full py-3 bg-primary text-white rounded-xl font-body font-semibold hover:bg-primary/80 transition disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <div v-if="loading" class="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"/>
        <span v-else>Vérifier</span>
      </button>

      <!-- Retour -->
      <button
        @click="retour"
        class="w-full mt-3 py-3 text-gray-500 font-body text-sm hover:text-gray-700 transition"
      >
        ← Retour à la connexion
      </button>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuth } from '../../../composables/useAuth'
import { useToast } from '../../../composables/useToast'

definePageMeta({ layout: false })

const { setSession, getDashboard } = useAuth()
const toast = useToast()

const code    = ref('')
const loading = ref(false)
const erreur  = ref('')

// Récupérer le tempToken depuis localStorage
let totpPending = null

onMounted(() => {
  if (process.client) {
    const saved = localStorage.getItem('totp_pending')
    if (!saved) {
      navigateTo('/auth')
      return
    }
    totpPending = JSON.parse(saved)
  }
})

const verifier = async () => {
  if (code.value.length !== 6) return
  erreur.value  = ''
  loading.value = true

  try {
    const res = await $fetch('/api/totp/verify', {
      method: 'POST',
      body: {
        tempToken: totpPending?.tempToken,
        code:      code.value
      }
    })

    if (res.success && res.token) {
      // Nettoyer le tempToken
      if (process.client) localStorage.removeItem('totp_pending')

      // Créer la session
      setSession(res.token, res.user)
      toast.success('Connecté avec succès !')
      await navigateTo(getDashboard(res.user.role))
    } else {
      erreur.value = res.message || 'Code invalide'
    }
  } catch (err) {
    erreur.value = err?.data?.message || 'Code invalide ou expiré'
  } finally {
    loading.value = false
  }
}

const retour = () => {
  if (process.client) localStorage.removeItem('totp_pending')
  navigateTo('/auth')
}
</script>