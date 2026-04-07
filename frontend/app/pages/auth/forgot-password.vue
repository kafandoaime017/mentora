<template>
  <div class="min-h-screen bg-cream font-body flex flex-col relative overflow-hidden">

    <!-- Header identique à auth -->
    <div style="box-shadow: 1px 1px 8px 1px #cfcfcf;" class="h-20 flex-shrink-0 bg-white flex items-center justify-between px-6 md:px-20 relative">
      <div class="flex items-center gap-3">
        <nuxt-link to="/">
          <img src="/images/logo-color.png" alt="Mentora" class="h-16 w-auto relative z-10 transform hover:scale-105 transition-transform duration-300" />
        </nuxt-link>
      </div>
      <button
        @click="goToLogin"
        class="px-4 py-2 text-sm font-semibold text-white bg-secondary rounded-md hover:bg-secondary/90 transition-colors duration-300"
      >
        Se connecter
      </button>
    </div>

    <!-- Body -->
    <div class="flex-1 flex flex-col mt-20 items-center px-6 pb-10 relative z-10">
      <!-- Card -->
      <div style="box-shadow: 1px 1px 8px 1px #cfcfcf;" class="-mt-14 bg-white w-full max-w-md md:rounded-md backdrop-blur-sm px-3 px-8 pt-8 pb-8">
        
        <!-- Title -->
        <div class="text-center mb-6">
          <h1 class="text-3xl font-extrabold text-black mb-2">
            Mot de passe oublié ?
          </h1>
          <p class="text-sm text-gray-600">
            Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
          </p>
        </div>

        <!-- Message de succès/erreur -->
        <div v-if="message" class="mb-4 p-3 text-center rounded-lg text-sm" :class="messageType === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'">
          {{ message }}
        </div>

        <!-- Formulaire email -->
        <form @submit.prevent="envoyerLienReset" class="space-y-5">

          <!-- Champ email -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Adresse email
            </label>
            <input
              v-model="email"
              type="email"
              required
              :disabled="loading || emailEnvoye"
              class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-input"
              :class="{ 'border-red-500 bg-red-50': error, 'border-gray-300': !error }"
              placeholder="exemple@email.com"
              autofocus
            />
            <p v-if="error" class="text-xs text-red-500 mt-2">{{ error }}</p>
          </div>

          <!-- Bouton envoyer -->
          <button
            type="submit"
            :disabled="loading || !email || emailEnvoye"
            class="relative w-full bg-primary text-white font-semibold py-3 rounded-xl hover:bg-primary/80 transition-all duration-300 disabled:opacity-50"
          >
            <span class="flex justify-center items-center gap-2">
              <Spinner v-if="loading" />
              <span v-else>{{ emailEnvoye ? 'Email envoyé !' : 'Envoyer le lien' }}</span>
            </span>
          </button>
        </form>

       

        <!-- Footer Switch -->
        <p class="text-center text-xs text-gray-500 mt-6 pt-5 border-t border-gray-200/50">
          <button @click="goToLogin" class="font-semibold text-secondary hover:text-primary transition-colors duration-300 hover:underline">
            ← Retour à la connexion
          </button>
        </p>
      </div>
    </div>

    <br/><br/>
    <div class="absolute bottom-0 left-0 w-full h-28 pointer-events-none">
      <svg viewBox="0 0 1440 110" class="absolute bottom-0 left-0 w-full h-full" preserveAspectRatio="none">
        <path d="M0,60 Q360,20 720,55 Q1080,90 1440,40 L1440,110 L0,110 Z" fill="#054348" opacity="1"/>
        <path d="M0,72 Q300,44 660,64 Q1020,84 1440,56 L1440,110 L0,110 Z" fill="#919e19"/>
      </svg>
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../../composables/useAuth'

const router = useRouter()
const { envoyerLienResetMotDePasse } = useAuth()

// Données du formulaire
const email = ref('')
const loading = ref(false)
const error = ref('')
const message = ref('')
const messageType = ref('success')
const emailEnvoye = ref(false)

// Envoyer le lien de réinitialisation
const envoyerLienReset = async () => {
  if (!email.value) return
  
  loading.value = true
  error.value = ''
  message.value = ''
  
  const result = await envoyerLienResetMotDePasse(email.value)
  
  if (result.success) {
    emailEnvoye.value = true
    message.value = result.message
    messageType.value = 'success'
  } else {
    error.value = result.message
    messageType.value = 'error'
  }
  
  loading.value = false
}

// Redirection vers login
const goToLogin = () => {
  router.push('/login')
}

// Nettoyer
onUnmounted(() => {
  // Pas de timer à nettoyer ici
})
</script>

<style scoped>
/* Pas besoin de styles supplémentaires, tout est dans Tailwind */
</style>