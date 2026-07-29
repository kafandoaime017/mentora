<template>
  <div class="min-h-screen bg-layout font-body flex flex-col relative overflow-hidden">

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
            Nouveau mot de passe
          </h1>
          <p class="text-sm text-gray-600">
            Choisissez un nouveau mot de passe sécurisé.
          </p>
        </div>

        <!-- Message de succès/erreur -->
        <div v-if="message" class="mb-4 p-3 text-center rounded-lg text-sm" :class="messageType === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'">
          {{ message }}
        </div>

        <!-- État chargement token -->
        <div v-if="verificationEnCours" class="text-center py-8">
          <SpinnerDark />
          <p class="text-md italic font-bold text-gray-800 mt-3">Vérification du lien en cours...</p>
        </div>

        <!-- Formulaire (visible uniquement si token valide) -->
        <form v-else-if="tokenValide && !reinitialisationReussie" @submit.prevent="reinitialiserMotDePasseHandler" class="space-y-5">

          <!-- Email (lecture seule) -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Adresse email
            </label>
            <input
              v-model="email"
              type="email"
              readonly
              disabled
              class="w-full pl-4 pr-10 py-3 text-sm text-gray-800 bg-input rounded-xl focus:bg-input focus:outline-none transition-all duration-200 cursor-not-allowed"
            />
          </div>

          <!-- Nouveau mot de passe -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Nouveau mot de passe
            </label>
            <div class="relative">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                class="w-full pl-4 pr-10 py-3 text-sm text-gray-800 bg-input rounded-xl focus:bg-input focus:outline-none transition-all duration-200"
                :class="{ 'border-red-500 bg-red-50': passwordError, 'border-gray-300': !passwordError }"
                placeholder="••••••••"
                @input="validatePassword"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              </button>
            </div>
            <!-- <div class="text-xs text-gray-500 mt-1 flex gap-2 flex-wrap">
              <span :class="{'text-green-600': passwordLength}" class="flex items-center gap-1">
                <span v-if="passwordLength">✅</span><span v-else>🔘</span> 8 caractères
              </span>
              <span :class="{'text-green-600': passwordLetter}" class="flex items-center gap-1">
                <span v-if="passwordLetter">✅</span><span v-else>🔘</span> 1 lettre
              </span>
              <span :class="{'text-green-600': passwordNumber}" class="flex items-center gap-1">
                <span v-if="passwordNumber">✅</span><span v-else>🔘</span> 1 chiffre
              </span>
            </div> -->
            <p v-if="passwordError" class="text-xs text-red-500 mt-1">{{ passwordError }}</p>
          </div>

          <!-- Confirmation mot de passe -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Confirmer le mot de passe
            </label>
            <div class="relative">
              <input
                v-model="passwordConfirmation"
                :type="showPasswordConfirmation ? 'text' : 'password'"
                required
                class="w-full pl-4 pr-10 py-3 text-sm text-gray-800 bg-input rounded-xl focus:bg-input focus:outline-none transition-all duration-200"
                :class="{ 'border-red-500 bg-red-50': passwordMatchError, 'border-gray-300': !passwordMatchError }"
                placeholder="••••••••"
                @input="validatePasswordMatch"
              />
              <button
                type="button"
                @click="showPasswordConfirmation = !showPasswordConfirmation"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg v-if="!showPasswordConfirmation" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              </button>
            </div>
            <p v-if="passwordMatchError" class="text-xs text-red-500 mt-1">{{ passwordMatchError }}</p>
          </div>

          <!-- Bouton réinitialiser -->
          <button
            type="submit"
            :disabled="loading || !isFormValid"
            class="relative w-full bg-primary text-white font-semibold py-3 rounded-xl hover:bg-primary/80 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span class="flex justify-center items-center gap-2">
              <Spinner v-if="loading" />
              <span v-else>Réinitialiser le mot de passe</span>
            </span>
          </button>
        </form>

        <!-- Message de succès après réinitialisation -->
        <div v-else-if="reinitialisationReussie" class="text-center">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">Mot de passe réinitialisé !</h3>
          <p class="text-sm text-gray-600 mb-6">
            Votre mot de passe a été modifié avec succès. Vous pouvez maintenant vous connecter.
          </p>
          <button
            @click="goToLogin"
            class="w-full bg-primary text-white font-semibold py-3 rounded-xl hover:bg-primary/80 transition-all duration-300"
          >
            Se connecter
          </button>
        </div>

        <!-- Message token invalide -->
        <div v-else-if="!tokenValide && !verificationEnCours" class="text-center">
          <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">Lien invalide ou expiré</h3>
          <p class="text-sm text-gray-600 mb-6">
            Le lien de réinitialisation est invalide ou a expiré. Veuillez refaire une demande.
          </p>
          <button
            @click="goToForgotPassword"
            class="w-full bg-primary text-white font-semibold py-3 rounded-xl hover:bg-primary/80 transition-all duration-300"
          >
            Nouvelle demande
          </button>
        </div>

        <!-- Footer Switch -->
        <p v-if="!reinitialisationReussie && tokenValide" class="text-center text-xs text-gray-500 mt-6 pt-5 border-t border-gray-200/50">
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
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '../../../composables/useAuth'

const route = useRoute()
const router = useRouter()
const { verifierTokenReset, reinitialiserMotDePasse } = useAuth()

// Données du formulaire
const token = ref('')
const email = ref('')
const password = ref('')
const passwordConfirmation = ref('')
const showPassword = ref(false)
const showPasswordConfirmation = ref(false)
const loading = ref(false)
const verificationEnCours = ref(true)
const tokenValide = ref(false)
const reinitialisationReussie = ref(false)
const message = ref('')
const messageType = ref('success')
const passwordError = ref('')
const passwordMatchError = ref('')

// Validation du mot de passe
const passwordLength = computed(() => password.value.length >= 8)
const passwordLetter = computed(() => /[A-Za-z]/.test(password.value))
const passwordNumber = computed(() => /[0-9]/.test(password.value))

// Vérifier si le formulaire est valide
const isFormValid = computed(() => {
  return passwordLength.value && passwordLetter.value && passwordNumber.value && 
         password.value === passwordConfirmation.value
})

// Valider le mot de passe
const validatePassword = () => {
  passwordError.value = ''
  if (password.value && !passwordLength.value) {
    passwordError.value = 'Le mot de passe doit contenir au moins 8 caractères'
  } else if (password.value && !passwordLetter.value) {
    passwordError.value = 'Le mot de passe doit contenir au moins une lettre'
  } else if (password.value && !passwordNumber.value) {
    passwordError.value = 'Le mot de passe doit contenir au moins un chiffre'
  }
  validatePasswordMatch()
}

// Valider la correspondance des mots de passe
const validatePasswordMatch = () => {
  if (passwordConfirmation.value && password.value !== passwordConfirmation.value) {
    passwordMatchError.value = 'Les mots de passe ne correspondent pas'
  } else {
    passwordMatchError.value = ''
  }
}

// Réinitialiser le mot de passe
const reinitialiserMotDePasseHandler = async () => {
  if (!isFormValid.value) {
    validatePassword()
    validatePasswordMatch()
    return
  }
  
  loading.value = true

  const data = {
    token: token.value,
    email: email.value,
    motDePasse: password.value,
    motDePasseConfirmation: passwordConfirmation.value
  }
     console.log('Données de la réinitialisation :', data);

  const result = await reinitialiserMotDePasse(
  data.token, 
  data.email, 
  data.motDePasse, 
  data.motDePasseConfirmation
)

 
 
  
  if (result.success) {
    reinitialisationReussie.value = true
    message.value = result.message
    messageType.value = 'success'
  } else {
    message.value = result.message
    messageType.value = 'error'
  }
  
  loading.value = false
}

// Vérifier le token au chargement
const verifierToken = async () => {
  verificationEnCours.value = true
  
  const result = await verifierTokenReset(token.value)
  
  if (result.success) {
    tokenValide.value = true
    email.value = result.email
  } else {
    tokenValide.value = false
    message.value = result.message
    messageType.value = 'error'
  }
  
  verificationEnCours.value = false
}

// Redirections
const goToLogin = () => {
  router.push('/login')
}

const goToForgotPassword = () => {
  router.push('/mot-de-passe-oublie')
}

// Récupérer le token de l'URL au chargement
onMounted(() => {
  token.value = route.query.token || ''
  
  if (!token.value) {
    tokenValide.value = false
    verificationEnCours.value = false
    message.value = 'Token manquant. Veuillez utiliser le lien reçu par email.'
    messageType.value = 'error'
    return
  }
  
  verifierToken()
})
</script>

<style scoped>
/* Pas besoin de styles supplémentaires, tout est dans Tailwind */
</style>