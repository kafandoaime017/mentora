<template>
  <div class="min-h-screen bg-layout font-body flex flex-col relative overflow-hidden">

    <!-- Header identique à auth -->
    <div style="box-shadow: 1px 1px 8px 1px #cfcfcf;" class="h-20 flex-shrink-0 bg-white flex items-center justify-between px-6 md:px-20 relative">
      <div class="flex items-center gap-3">
        <nuxt-link to="/"><img src="/images/logo-color.png" alt="Mentora" class="h-16 w-auto relative z-10 transform hover:scale-105 transition-transform duration-300" /></nuxt-link>
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
            Vérifiez votre email
          </h1>
          <p class="text-xs text-gray-800">
            Nous avons envoyé un code à <strong class="text-primary">{{ email }}</strong>
          </p>
        </div>

        <!-- Message de succès/erreur -->
        <!-- <div v-if="message" class="mb-4 p-3 text-center rounded-lg text-sm" :class="messageType === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'">
          {{ message }}
        </div> -->

        <!-- Formulaire code -->
        <form @submit.prevent="verifierCode" class="space-y-5">

          <!-- Champs code à 6 chiffres -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2 text-center">
              Code de vérification
            </label>
            <div class="flex gap-2 justify-center">
              <input
                v-for="(digit, index) in 6"
                :key="index"
                ref="codeInputs"
                v-model="code[index]"
                type="text"
                maxlength="1"
                class="w-14 h-14 text-center text-2xl font-bold border    focus:border-transparent transition-all bg-input"
                :class="{ 'border-red-500 bg-red-50': error, 'border-gray-300': !error }"
                @input="handleInput(index, $event)"
                @keydown="handleKeydown(index, $event)"
                @paste="handlePaste"
              />
            </div>
            <!-- <p v-if="error" class="text-xs text-red-500 mt-2 text-center">{{ error }}</p> -->
          </div>

          <!-- Bouton vérifier -->
          <button
            type="submit"
            :disabled="loading || !isCodeComplete"
            class="relative w-full bg-primary text-white font-semibold py-3 rounded-xl hover:bg-primary/80 transition-all duration-300 disabled:opacity-50"
          >
            <span class="flex justify-center items-center gap-2">
              <Spinner v-if="loading" />
              <span v-else>Vérifier mon compte</span>
            </span>
          </button>
        </form>

        <!-- Renvoyer code -->
        <div class="text-center mt-6">
          <button
            @click="renvoyerCode"
            :disabled="countdown > 0"
            class="text-sm text-primary hover:underline disabled:text-gray-400 disabled:no-underline transition-colors duration-200"
          >
            <span v-if="countdown > 0">Renvoyer dans {{ countdown }}s</span>
            <span v-else>Renvoyer le code</span>
          </button>
        </div>

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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'
import Spinner from '../components/Spinner.vue'

const route = useRoute()
const router = useRouter()
const { verifierEmail, renvoyerCode: renvoyerCodeApi } = useAuth()

// Données du formulaire
const email = ref(route.query.email || '')
const code = ref(['', '', '', '', '', ''])
const loading = ref(false)
const error = ref('')
const message = ref('')
const messageType = ref('success')
const countdown = ref(0)
let timer = null

const codeInputs = ref([])

// Vérifier si le code est complet
const isCodeComplete = computed(() => {
  return code.value.every(digit => digit && digit.length === 1)
})

// Obtenir le code complet
const getFullCode = () => {
  return code.value.join('')
}

// Gérer la saisie d'un chiffre
const handleInput = (index, event) => {
  const value = event.target.value
  // Ne garder que le dernier caractère si collage
  if (value.length > 1) {
    code.value[index] = value.slice(-1)
  }
  
  // Auto-focus sur le champ suivant
  if (value.length === 1 && index < 5) {
    codeInputs.value[index + 1]?.focus()
  }
}

// Gérer la touche retour arrière
const handleKeydown = (index, event) => {
  if (event.key === 'Backspace' && !code.value[index] && index > 0) {
    codeInputs.value[index - 1]?.focus()
  }
}

// Gérer le collage
const handlePaste = (event) => {
  event.preventDefault()
  const pasted = event.clipboardData?.getData('text') || ''
  const digits = pasted.slice(0, 6).split('')
  
  digits.forEach((digit, i) => {
    if (i < 6 && /^\d$/.test(digit)) {
      code.value[i] = digit
    }
  })
  
  // Focus sur le dernier champ rempli
  const lastFilled = Math.min(digits.length, 5)
  codeInputs.value[lastFilled]?.focus()
}

// Vérifier le code
const verifierCode = async () => {
  if (!isCodeComplete.value) return
  
  loading.value = true
  error.value = ''
  message.value = ''
  
  const result = await verifierEmail(email.value, getFullCode())
  
  if (result.success) {
    // Redirection automatique par verifierEmail
    return
  } else {
    error.value = result.message
    // Reset du code
    code.value = ['', '', '', '', '', '']
    codeInputs.value[0]?.focus()
  }
  
  loading.value = false
}

// Renvoyer le code
const renvoyerCode = async () => {
  if (countdown.value > 0) return
  
  error.value = ''
  message.value = ''
  
  const result = await renvoyerCodeApi(email.value)
  
  if (result.success) {
    message.value = result.message
    messageType.value = 'success'
    
    // Démarrer le compte à rebours
    countdown.value = 60
    timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0 && timer) {
        clearInterval(timer)
      }
    }, 1000)
    
    // Reset du code pour nouvelle saisie
    code.value = ['', '', '', '', '', '']
    codeInputs.value[0]?.focus()
  } else {
    error.value = result.message
    messageType.value = 'error'
  }
}

// Redirection vers login
const goToLogin = () => {
  router.push('/login')
}

// Vérifier que l'email est présent
onMounted(() => {
  if (!email.value) {
    router.push('/login')
  }
})

// Nettoyer le timer
onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
/* Pas besoin de styles supplémentaires, tout est dans Tailwind */
</style>