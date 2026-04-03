<template>
  <div class="min-h-screen bg-cream font-body flex flex-col relative overflow-hidden">
    <!-- Header -->
    <div style="box-shadow: 1px 1px 8px 1px #cfcfcf;" class="h-20 flex-shrink-0 bg-white flex items-center justify-between px-6 md:px-20 relative">
      <div class="flex items-center gap-3">
        <nuxt-link to="/"><img src="/images/logo-color.png" alt="Mentora" class="h-16 w-auto relative z-10 transform hover:scale-105 transition-transform duration-300" /></nuxt-link>
      </div>
      <button
        @click="activeTab = 'register'"
        class="px-4 py-2 text-sm font-semibold text-white bg-secondary rounded-md hover:bg-secondary/90 transition-colors duration-300"
      >
        S'inscrire
      </button>
    </div>

    <!-- Body -->
    <div class="flex-1 flex flex-col mt-20 items-center px-6 pb-10 relative z-10">
      <!-- Card -->
      <div class="-mt-14 w-full max-w-md md:rounded-md backdrop-blur-sm px-3 md:px-5 pt-8 pb-8 transform transition-all duration-500 hover:shadow-3xl">
        <!-- Title -->
        <div class="text-center mb-6">
          <h1 class="text-3xl font-extrabold text-black mb-2">
            {{ activeTab === 'login' ? 'Bienvenue' : 'Rejoignez-nous' }}
          </h1>
          <p class="text-xs text-gray-800">
            {{ activeTab === 'login' ? 'Connectez-vous à votre espace' : 'Créez votre compte en quelques secondes' }}
          </p>
        </div>

        <!-- Forms -->
        <transition name="fade" mode="out-in">
          <!-- LOGIN -->
          <form v-if="activeTab === 'login'" @submit.prevent="handleLogin" class="space-y-5" key="login">
            <!-- Email -->
            <div class="group">
              <label class="block text-sm font-medium text-gray-700 mb-1">Adresse email</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg class="w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                  </svg>
                </div>
                <input
                  v-model="loginForm.email"
                  type="email"
                  placeholder="Adresse email"
                  required
                  class="w-full pl-11 pr-4 py-3 text-sm text-gray-800 placeholder-gray-600 focus:text-md focus:text-black focus:font-extrabold bg-input border-gray-200 rounded-xl focus:bg-input focus:outline-none"
                />
              </div>
            </div>

            <!-- Password -->
            <div class="group">
              <label class="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
              <div class="relative">
                <input
                  v-model="loginForm.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Mot de passe"
                  required
                  class="w-full pl-11 pr-4 py-3 text-sm text-gray-800 placeholder-gray-600 focus:text-md focus:text-black focus:font-extrabold bg-input border-gray-200 rounded-xl focus:bg-input focus:outline-none"
                />
                <button 
                  type="button" 
                  @click="showPassword = !showPassword"
                  class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-primary transition-colors duration-300"
                >
                  <svg v-if="!showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                  <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Error -->
            <transition enter-active-class="transition ease-out duration-300" enter-from-class="transform opacity-0 -translate-y-2" enter-to-class="transform opacity-100 translate-y-0">
              <p v-if="errorMsg" class="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {{ errorMsg }}
              </p>
            </transition>

            <!-- Submit -->
            <button
              type="submit"
              :disabled="isLoading"
              class="relative w-full bg-primary text-white font-semibold py-3 rounded-xl hover:bg-primary/80 text-md group"
            >
              <span class="relative z-10 flex justify-center items-center gap-2">
                <Spinner v-if="isLoading" />
                <span v-else>Se connecter</span>
              </span>
            </button>

            <!-- Divider -->
            <div class="relative my-6">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-gray-300"></div>
              </div>
              <div class="relative flex justify-center text-sm">
                <span class="px-2 bg-white text-gray-500">Ou continuer avec</span>
              </div>
            </div>

            <!-- Google Login Button -->
            <button
              type="button"
              @click="handleGoogleLogin"
              :disabled="isGoogleLoading"
              class="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-300 group"
            >
              <svg class="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span class="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                {{ isGoogleLoading ? 'Connexion...' : 'Se connecter avec Google' }}
              </span>
            </button>
          </form>

          <!-- REGISTER -->
          <form v-else @submit.prevent="handleRegister" class="space-y-5" key="register">
            <!-- Nom -->
            <div class="group">
              <label class="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input v-model="registerForm.lastName" type="text" placeholder="Votre nom" required
                     class="w-full pl-4 pr-4 py-3 text-sm text-gray-800 placeholder-gray-600 focus:text-md focus:text-black focus:font-extrabold bg-input border-gray-200 rounded-xl focus:bg-input focus:outline-none"/>
            </div>

            <!-- Prénom -->
            <div class="group">
              <label class="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
              <input v-model="registerForm.firstName" type="text" placeholder="Votre prénom" required
                     class="w-full pl-4 pr-4 py-3 text-sm text-gray-800 placeholder-gray-600 focus:text-md focus:text-black focus:font-extrabold bg-input border-gray-200 rounded-xl focus:bg-input focus:outline-none"/>
            </div>

            <!-- Email -->
            <div class="group">
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input v-model="registerForm.email" type="email" placeholder="Adresse email" required
                     class="w-full pl-4 pr-4 py-3 text-sm text-gray-800 placeholder-gray-600 focus:text-md focus:text-black focus:font-extrabold bg-input border-gray-200 rounded-xl focus:bg-input focus:outline-none"/>
            </div>

            <!-- Date de naissance -->
            <div class="group">
              <label class="block text-sm font-medium text-gray-700 mb-1">Date de naissance</label>
              <input v-model="registerForm.birthDate" type="date" required
                     class="w-full pl-4 pr-4 py-3 text-sm text-gray-800 placeholder-gray-600 focus:text-md focus:text-black focus:font-extrabold bg-input border-gray-200 rounded-xl focus:bg-input focus:outline-none"/>
            </div>

            <!-- École -->
            <div class="group relative">
              <label class="block text-sm font-medium text-gray-700 mb-1">École</label>
              <input
                v-model="registerForm.schoolQuery"
                @input="filterSchools"
                type="text"
                placeholder="Rechercher votre école"
                required
                class="w-full pl-4 pr-4 py-3 text-sm text-gray-800 placeholder-gray-600 focus:text-md focus:text-black focus:font-extrabold bg-input border-gray-200 rounded-xl focus:bg-input focus:outline-none"
              />
              <ul v-if="filteredSchools.length" class="absolute z-20 bg-white w-full mt-1 border shadow-2xl border-gray-100 rounded-md max-h-40 overflow-auto">
                <li v-for="school in filteredSchools" :key="school" @click="selectSchool(school)" class="px-4 py-2 cursor-pointer hover:bg-gray-100">
                  {{ school }}
                </li>
              </ul>
            </div>

            <!-- Classe -->
            <div class="group">
              <label class="block text-sm font-medium text-gray-700 mb-1">Classe</label>
              <select v-model="registerForm.class" :disabled="!registerForm.school" required
                      class="w-full pl-4 pr-4 py-3 text-sm text-gray-800 placeholder-gray-600 focus:text-md focus:text-black focus:font-extrabold bg-gray-200 border-gray-200 rounded-xl focus:bg-input focus:outline-none disabled:bg-gray-40 disabled:text-gray-400">
                <option value="" disabled>Choisir une classe</option>
                <option v-for="cls in classes" :key="cls" :value="cls">{{ cls }}</option>
              </select>
            </div>

            <!-- Password -->
            <div class="group relative">
              <label class="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
              <input v-model="registerForm.password" :type="showPassword ? 'text' : 'password'" placeholder="Mot de passe" required
                     class="w-full pl-4 pr-10 py-3 text-sm text-gray-800 placeholder-gray-600 focus:text-md focus:text-black focus:font-extrabold bg-input border-gray-200 rounded-xl focus:bg-input focus:outline-none"/>
              <button type="button" @click="showPassword = !showPassword"
                      class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-primary transition-colors duration-300">
                <svg v-if="!showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242"/>
                </svg>
              </button>
            </div>

            <!-- Confirmer Password -->
            <div class="group relative">
              <label class="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
              <input v-model="registerForm.confirmPassword" :type="showConfirmPassword ? 'text' : 'password'" placeholder="Confirmez votre mot de passe" required
                     class="w-full pl-4 pr-10 py-3 text-sm text-gray-800 placeholder-gray-600 focus:text-md focus:text-black focus:font-extrabold bg-input border-gray-200 rounded-xl focus:bg-input focus:outline-none"/>
              <button type="button" @click="showConfirmPassword = !showConfirmPassword"
                      class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-primary transition-colors duration-300">
                <svg v-if="!showConfirmPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242"/>
                </svg>
              </button>
            </div>

            <!-- Submit -->
            <button type="submit" :disabled="isLoading" class="relative w-full bg-primary text-white font-semibold py-3 rounded-xl hover:bg-primary/80 text-md group flex justify-center items-center gap-2">
              <Spinner v-if="isLoading" />
              <span v-else>Créer mon compte</span>
            </button>

            <!-- Divider -->
            <div class="relative my-6">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-gray-300"></div>
              </div>
              <div class="relative flex justify-center text-sm">
                <span class="px-2 bg-white text-gray-500">Ou s'inscrire avec</span>
              </div>
            </div>

            <!-- Google Register Button -->
            <button
              type="button"
              @click="handleGoogleRegister"
              :disabled="isGoogleLoading"
              class="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-300 group"
            >
              <svg class="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span class="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                {{ isGoogleLoading ? 'Inscription...' : "S'inscrire avec Google" }}
              </span>
            </button>
          </form>
        </transition>
      </div>

      <!-- Footer Switch -->
      <p class="text-center text-xs text-gray-500 mt-6 pt-5 border-t border-gray-200/50">
        <template v-if="activeTab === 'login'">
          Pas encore de compte ?
          <button @click="activeTab = 'register'" class="font-semibold ml-1 text-secondary hover:text-primary transition-colors duration-300 hover:underline">
            S'inscrire gratuitement
          </button>
        </template>
        <template v-else>
          Déjà un compte ?
          <button @click="activeTab = 'login'" class="font-semibold ml-1 text-secondary hover:text-primary transition-colors duration-300 hover:underline">
            Se connecter
          </button>
        </template>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const activeTab = ref('login')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isLoading = ref(false)
const isGoogleLoading = ref(false)
const errorMsg = ref('')

const loginForm = reactive({ email: '', password: '' })
const registerForm = reactive({
  firstName: '',
  lastName: '',
  email: '',
  birthDate: '',
  schoolQuery: '',
  school: '',
  class: '',
  password: '',
  confirmPassword: ''
})

// Liste d'écoles et classes
const schools = ['Lycée Victor Hugo', 'Collège Montaigne', 'École Nationale Supérieure', 'Université Paris-Sorbonne']
const filteredSchools = ref([])
const classes = ['6ème', '5ème', '4ème', '3ème', '2nde', '1ère', 'Terminale']

function filterSchools() {
  const query = registerForm.schoolQuery.toLowerCase()
  filteredSchools.value = schools.filter(s => s.toLowerCase().includes(query))
}

function selectSchool(school) {
  registerForm.school = school
  registerForm.schoolQuery = school
  filteredSchools.value = []
}

async function handleLogin() {
  errorMsg.value = ''
  if (!loginForm.email || !loginForm.password) {
    errorMsg.value = 'Veuillez remplir tous les champs'
    return
  }
  isLoading.value = true
  await new Promise(r => setTimeout(r, 1000))
  isLoading.value = false
}

async function handleRegister() {
  // Vérifier que les mots de passe correspondent
  if (registerForm.password !== registerForm.confirmPassword) {
    errorMsg.value = 'Les mots de passe ne correspondent pas'
    return
  }
  
  isLoading.value = true
  await new Promise(r => setTimeout(r, 1000))
  isLoading.value = false
  console.log(registerForm)
}

async function handleGoogleLogin() {
  isGoogleLoading.value = true
  errorMsg.value = ''
  
  try {
    // Simulation de l'appel API Google
    await new Promise(r => setTimeout(r, 1500))
    console.log('Google login initiated')
    // Ici, vous intégrerez l'API Google réelle
    // window.location.href = 'votre-endpoint-google'
  } catch (error) {
    errorMsg.value = 'Erreur lors de la connexion avec Google'
    console.error(error)
  } finally {
    isGoogleLoading.value = false
  }
}

async function handleGoogleRegister() {
  isGoogleLoading.value = true
  errorMsg.value = ''
  
  try {
    // Simulation de l'appel API Google
    await new Promise(r => setTimeout(r, 1500))
    console.log('Google registration initiated')
    // Ici, vous intégrerez l'API Google réelle
    // window.location.href = 'votre-endpoint-google-register'
  } catch (error) {
    errorMsg.value = 'Erreur lors de l\'inscription avec Google'
    console.error(error)
  } finally {
    isGoogleLoading.value = false
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active { transition: all 0.3s ease; }
.fade-enter-from { opacity:0; transform:translateX(20px); }
.fade-leave-to { opacity:0; transform:translateX(-20px); }
.shadow-3xl { box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); }
</style>