<template>
  <div class="min-h-screen bg-layout font-body flex flex-col relative overflow-hidden">

    <!-- Header -->
    <div style="box-shadow: 1px 1px 8px 1px #cfcfcf;" class="h-20 flex-shrink-0 bg-white flex items-center justify-between px-6 md:px-20 relative">
      <div class="flex items-center gap-3">
        <nuxt-link to="/"><img src="/images/logo-color.png" alt="Mentora" class="h-16 w-auto relative z-10 transform hover:scale-105 transition-transform duration-300" /></nuxt-link>
      </div>
    </div>

    <br/>

    <!-- Body -->
    <div class="flex-1 flex flex-col mt-20 items-center px-2 pb-10 relative z-10">
      <div style="box-shadow: 1px 1px 5px 1px #cfcfcf;" class="-mt-14 bg-white w-full max-w-md md:rounded-md backdrop-blur-sm px-5 pt-8 pb-8">

        <!-- Title -->
        <div class="text-center mb-6">
          <h1 class="text-3xl font-extrabold text-black mb-2">Bienvenue</h1>
          <p class="text-xs text-gray-800">Connectez-vous à votre espace</p>
        </div>

        <!-- Erreur serveur -->
        <div v-if="serverError" class="flex items-start gap-2 bg-red-100 text-red-600 text-sm font-body rounded-md px-4 py-3 mb-4">
          <svg class="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.75-11.25a.75.75 0 011.5 0v4.5a.75.75 0 01-1.5 0v-4.5zm.75 7.5a.75.75 0 100-1.5.75.75 0 000 1.5z" clip-rule="evenodd"/>
          </svg>
          <span>{{ serverError }}</span>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-5">

          <!-- Email -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Adresse email</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
              </div>
              <input
                v-model="form.email"
                type="email"
                placeholder="Adresse email"
                :class="['w-full pl-11 pr-4 py-3 text-sm text-gray-800 placeholder-gray-600 bg-input rounded-xl focus:outline-none transition-all duration-200',
                         errors.email ? 'border-2 border-red-500' : '']"
              />
            </div>
            <p v-if="errors.email" class="text-xs text-red-500 mt-1">{{ errors.email }}</p>
          </div>

          <!-- Mot de passe -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
              </div>
              <input
                v-model="form.motDePasse"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Mot de passe"
                :class="['w-full pl-11 pr-12 py-3 text-sm text-gray-800 placeholder-gray-600 bg-input rounded-xl focus:outline-none transition-all duration-200',
                         errors.motDePasse ? 'border-2 border-red-500' : '']"
              />
              <button type="button" @click="showPassword = !showPassword" class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600">
                <svg v-if="!showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242"/>
                </svg>
              </button>
            </div>
            <p v-if="errors.motDePasse" class="text-xs text-red-500 mt-1">{{ errors.motDePasse }}</p>
          </div>

          <!-- Mot de passe oublié -->
          <div class="flex justify-end">
            <nuxt-link to="/auth/forgot-password" class="text-sm text-primary hover:underline">
              Mot de passe oublié ?
            </nuxt-link>
          </div>

          <!-- Bouton connexion -->
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full bg-primary text-white font-semibold py-2.5 rounded-xl hover:bg-primary/80 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <div v-if="isLoading" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"/>
            <span v-else>Se connecter</span>
          </button>

          <!-- Divider -->
          <div class="relative my-2">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"/>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">Ou continuer avec</span>
            </div>
          </div>

          <!-- Google -->
          <button
            type="button"
            @click="handleGoogleLogin"
            :disabled="isGoogleLoading"
            class="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-300"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span class="text-sm font-medium text-gray-700">
              {{ isGoogleLoading ? 'Connexion...' : 'Se connecter avec Google' }}
            </span>
          </button>

        </form>
      </div>

      <!-- Bottom waves -->
      <br/><br/>
      <div class="absolute bottom-0 left-0 w-full h-28 pointer-events-none">
        <svg viewBox="0 0 1440 110" class="absolute bottom-0 left-0 w-full h-full" preserveAspectRatio="none">
          <path d="M0,60 Q360,20 720,55 Q1080,90 1440,40 L1440,110 L0,110 Z" fill="#054348" opacity="1"/>
          <path d="M0,72 Q300,44 660,64 Q1020,84 1440,56 L1440,110 L0,110 Z" fill="#919e19"/>
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useAuth } from '../../../composables/useAuth'

const { login, getGoogleUrl } = useAuth()
const router = useRouter()
const route = useRoute()

const isLoading      = ref(false)
const isGoogleLoading = ref(false)
const showPassword   = ref(false)
const serverError    = ref('')

const form = reactive({ email: '', motDePasse: '' })
const errors = reactive({ email: '', motDePasse: '' })

// ✅ Gestion du callback Google
onMounted(() => {
  // Vérifier si on revient de Google
  const token = route.query.token 
  const userData = route.query.user 
  const error = route.query.error 
  const profilIncomplet = route.query.profilIncomplet === 'true'
  
  if (error) {
    serverError.value = 'Erreur de connexion Google. Veuillez réessayer.'
    // Nettoyer l'URL
    router.replace('/auth/login')
    return
  }
  
  if (token && userData) {
    try {
      const user = JSON.parse(decodeURIComponent(userData))
      
      // Stocker les données
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      
      // Rediriger vers le dashboard ou complétion de profil
      if (profilIncomplet) {
        router.push('/auth/complete-profile')
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      console.error('Erreur traitement Google:', err)
      serverError.value = 'Erreur lors du traitement de la connexion Google'
    }
  }
})

const validate = () => {
  errors.email = ''
  errors.motDePasse = ''
  let valid = true

  if (!form.email) {
    errors.email = "L'email est requis"; valid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Email invalide'; valid = false
  }

  if (!form.motDePasse) {
    errors.motDePasse = 'Le mot de passe est requis'; valid = false
  }

  return valid
}

const handleLogin = async () => {
  if (!validate()) return
  serverError.value = ''
  isLoading.value = true
  try {
    const result = await login(form.email, form.motDePasse)
    if (!result.success) serverError.value = result.message
  } catch (err) {
    serverError.value = err?.data?.message || 'Identifiants incorrects'
  } finally {
    isLoading.value = false
  }
}

const handleGoogleLogin = async () => {
  isGoogleLoading.value = true
  serverError.value = ''
  try {
    const result = await getGoogleUrl()
    if (result.success && result.data?.url) {
      // Rediriger vers Google
      window.location.href = result.data.url
    } else {
      serverError.value = result.message || 'Erreur lors de la connexion avec Google'
    }
  } catch (err) {
    console.error('Erreur Google:', err)
    serverError.value = 'Erreur lors de la connexion avec Google'
  } finally {
    isGoogleLoading.value = false
  }
}
</script>

<style scoped>
</style>