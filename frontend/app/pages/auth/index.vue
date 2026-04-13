<template>
  <div class="min-h-screen bg-layout font-body flex flex-col relative overflow-hidden">

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
<br/>
    <!-- Body -->
    <div class="flex-1 flex flex-col mt-20 items-center px-6 pb-10 relative z-10">
      <!-- Card -->
      <div style="box-shadow: 1px 1px 5px 1px #cfcfcf;" class="-mt-14 bg-white w-full max-w-md md:rounded-md backdrop-blur-sm px-8  pt-8 pb-8">
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

            <!-- Erreur serveur login -->
            <div v-if="serverError.login" class="flex items-start gap-2 bg-red-100  text-red-600 text-sm font-['Roboto'] rounded-md px-4 py-3">
              <svg class="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.75-11.25a.75.75 0 011.5 0v4.5a.75.75 0 01-1.5 0v-4.5zm.75 7.5a.75.75 0 100-1.5.75.75 0 000 1.5z" clip-rule="evenodd"/>
              </svg>
              <span>{{ serverError.login }}</span>
            </div>

            <!-- Email -->
            <div class="group">
              <label class="block text-sm font-medium text-gray-700 mb-1">Adresse email</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                  </svg>
                </div>
                <input
                  v-model="loginForm.email"
                  type="email"
                  placeholder="Adresse email"
                  :class="['w-full pl-11 pr-4 py-3 text-sm text-gray-800 placeholder-gray-600 bg-input rounded-xl focus:bg-input focus:outline-none transition-all duration-200',
                           errors.email ? 'border-2 border-red-500 bg-red-50' : 'border-gray-200']"
                />
              </div>
              <p v-if="errors.email" class="text-xs text-red-500 mt-1">{{ errors.email }}</p>
            </div>

            <!-- Password -->
            <div class="group">
              <label class="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                  </svg>
                </div>
                <input
                  v-model="loginForm.motDePasse"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Mot de passe"
                  :class="['w-full pl-11 pr-12 py-3 text-sm text-gray-800 placeholder-gray-600 bg-input rounded-xl focus:bg-input focus:outline-none transition-all duration-200',
                           errors.motDePasse ? 'border-2 border-red-500 bg-red-50' : 'border-gray-200']"
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

            <p>
              <small>
                <nuxt-link href="/auth/forgot-password" class="text-primary text-sm flex flex-end hover:underline">Mot de passe oublié?</nuxt-link>
              </small>
            </p>

            <button type="submit" :disabled="isLoading" class="relative w-full bg-primary text-white font-semibold py-2.5 rounded-xl hover:bg-primary/80 transition-all duration-300 disabled:opacity-50">
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

            <!-- Erreur serveur register -->
            <div v-if="serverError.register" class="flex items-start gap-2 bg-red-50 border border-red-300 text-red-700 text-sm rounded-lg px-4 py-3">
              <svg class="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-.75-11.25a.75.75 0 011.5 0v4.5a.75.75 0 01-1.5 0v-4.5zm.75 7.5a.75.75 0 100-1.5.75.75 0 000 1.5z" clip-rule="evenodd"/>
              </svg>
              <span>{{ serverError.register }}</span>
            </div>

            <!-- Nom -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input v-model="registerForm.nom" type="text" placeholder="Votre nom"
                     :class="['w-full pl-4 pr-4 py-3 text-sm text-gray-800 bg-input rounded-xl focus:bg-input focus:outline-none transition-all duration-200',
                              errors.nom ? 'border-2 border-red-500 bg-red-50' : 'border-gray-200']"/>
              <p v-if="errors.nom" class="text-xs text-red-500 mt-1">{{ errors.nom }}</p>
            </div>

            <!-- Prénom -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
              <input v-model="registerForm.prenom" type="text" placeholder="Votre prénom"
                     :class="['w-full pl-4 pr-4 py-3 text-sm text-gray-800 bg-input rounded-xl focus:bg-input focus:outline-none transition-all duration-200',
                              errors.prenom ? 'border-2 border-red-500 bg-red-50' : 'border-gray-200']"/>
              <p v-if="errors.prenom" class="text-xs text-red-500 mt-1">{{ errors.prenom }}</p>
            </div>

            <!-- Email -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input v-model="registerForm.email" type="email" placeholder="Adresse email"
                     :class="['w-full pl-4 pr-4 py-3 text-sm text-gray-800 bg-input rounded-xl focus:bg-input focus:outline-none transition-all duration-200',
                              errors.registerEmail ? 'border-2 border-red-500 bg-red-50' : 'border-gray-200']"/>
              <p v-if="errors.registerEmail" class="text-xs text-red-500 mt-1">{{ errors.registerEmail }}</p>
            </div>

            <!-- Date de naissance -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Date de naissance</label>
              <input v-model="registerForm.dateNaissance" type="date"
                     :class="['w-full pl-4 pr-4 py-3 text-sm text-gray-800 bg-input rounded-xl focus:bg-input focus:outline-none transition-all duration-200',
                              errors.dateNaissance ? 'border-2 border-red-500 bg-red-50' : 'border-gray-200']"/>
              <p v-if="errors.dateNaissance" class="text-xs text-red-500 mt-1">{{ errors.dateNaissance }}</p>
            </div>

            <!-- École avec icône -->
            <div class="relative">
              <label class="block text-sm font-medium text-gray-700 mb-1">École</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3L1 9l11 6 11-6-11-6zm0 11.5L3.5 9.5 12 15l8.5-5.5L12 14.5zm0 3L3.5 12.5 12 18l8.5-5.5L12 17.5z"/>
                  </svg>
                </div>
                <input
                  v-model="registerForm.schoolQuery"
                  @input="searchEcoles"
                  @focus="showSchoolDropdown = true"
                  type="text"
                  placeholder="Rechercher votre école"
                  :class="['w-full pl-11 pr-12 py-3 text-sm text-gray-800 bg-input rounded-xl focus:bg-input focus:outline-none transition-all duration-200 cursor-pointer',
                           errors.ecole ? 'border-2 border-red-500 bg-red-50' : 'border-gray-200']"
                />
                <button
                  type="button"
                  @click="toggleSchoolDropdown"
                  class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>
              </div>

              <!-- Dropdown écoles -->
              <div v-if="showSchoolDropdown && (filteredSchools.length > 0 || schools.length > 0)" class="absolute z-20 bg-white w-full mt-1 border  rounded-md max-h-60 overflow-auto" style="box-shadow: 1px 1px 8px 1px #cfcfcf;">
                <div v-if="filteredSchools.length === 0 && registerForm.schoolQuery === ''" class="px-4 py-2 text-gray-500">
                  Tapez pour rechercher une école
                </div>
                <div v-for="school in (filteredSchools.length > 0 ? filteredSchools : schools)" :key="school.id"
                     @click="selectSchool(school)"
                     class="px-4 py-3 cursor-pointer hover:bg-primary/10 border-b last:border-b-0 transition-colors">
                  <div class="font-medium text-gray-900">{{ school.nom }}</div>
                  <!-- <div class="text-xs text-gray-500 mt-1">{{ school.ville }}</div> -->
                </div>
              </div>
              <p v-if="errors.ecole" class="text-xs text-red-500 mt-1">{{ errors.ecole }}</p>
            </div>

            <!-- Filière -->
            <div v-if="selectedEcoleId">
              <label class="block text-sm font-medium text-gray-700 mb-1">Filière</label>
              <select v-model="selectedFiliereId" @change="loadClasses"
                      :class="['w-full pl-4 pr-4 py-3 text-sm text-gray-800 bg-gray-200 rounded-xl focus:bg-input focus:outline-none transition-all duration-200',
                               errors.filiere ? 'border-2 border-red-500 bg-red-50' : 'border-gray-200']">
                <option :value="null" disabled>Choisir une filière</option>
                <option v-for="filiere in filieres" :key="filiere.id" :value="filiere.id">
                  {{ filiere.nom }}
                </option>
              </select>
              <p v-if="errors.filiere" class="text-xs text-red-500 mt-1">{{ errors.filiere }}</p>
            </div>

            <!-- Classe -->
            <div v-if="selectedFiliereId">
              <label class="block text-sm font-medium text-gray-700 mb-1">Classe</label>
              <select v-model="selectedClasseId"
                      :class="['w-full pl-4 pr-4 py-3 text-sm text-gray-800 bg-gray-200 rounded-xl focus:bg-input focus:outline-none transition-all duration-200',
                               errors.classe ? 'border-2 border-red-500 bg-red-50' : 'border-gray-200']">
                <option :value="null" disabled>Choisir une classe</option>
                <option v-for="classe in classes" :key="classe.id" :value="classe.id">
                  {{ classe.nom }}
                </option>
              </select>
              <p v-if="errors.classe" class="text-xs text-red-500 mt-1">{{ errors.classe }}</p>
            </div>

            <!-- Mot de passe -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
              <div class="relative">
                <input v-model="registerForm.motDePasse" :type="showPassword ? 'text' : 'password'" placeholder="Mot de passe"
                       :class="['w-full pl-4 pr-10 py-3 text-sm text-gray-800 bg-input rounded-xl focus:bg-input focus:outline-none transition-all duration-200',
                                errors.registerPassword ? 'border-2 border-red-500 bg-red-50' : 'border-gray-200']"/>
                <button type="button" @click="showPassword = !showPassword"
                        class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600">
                  <svg v-if="!showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                  <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242"/>
                  </svg>
                </button>
              </div>
              <p v-if="errors.registerPassword" class="text-xs text-red-500 mt-1">{{ errors.registerPassword }}</p>
            </div>

            <!-- Confirmer Password -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
              <div class="relative">
                <input v-model="registerForm.confirmPassword" :type="showConfirmPassword ? 'text' : 'password'" placeholder="Confirmez votre mot de passe"
                       :class="['w-full pl-4 pr-10 py-3 text-sm text-gray-800 bg-input rounded-xl focus:bg-input focus:outline-none transition-all duration-200',
                                errors.confirmPassword ? 'border-2 border-red-500 bg-red-50' : 'border-gray-200']"/>
                <button type="button" @click="showConfirmPassword = !showConfirmPassword"
                        class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600">
                  <svg v-if="!showConfirmPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                  <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242"/>
                  </svg>
                </button>
              </div>
              <p v-if="errors.confirmPassword" class="text-xs text-red-500 mt-1">{{ errors.confirmPassword }}</p>
            </div>

            <button type="submit" :disabled="isLoading" class="relative w-full bg-primary text-white font-semibold py-3 rounded-xl hover:bg-primary/80 transition-all duration-300 disabled:opacity-50">
              <span class="flex justify-center items-center gap-2">
                <Spinner v-if="isLoading" />
                <span v-else>Créer mon compte</span>
              </span>
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
import { useToast } from '../../../composables/useToast'
import Spinner from '~/components/Spinner.vue'

const { login, register, getGoogleUrl } = useAuth()
const toast = useToast()

const activeTab = ref('login')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isLoading = ref(false)
const isGoogleLoading = ref(false)
const showSchoolDropdown = ref(false)

const serverError = reactive({ login: '', register: '' })

const loginForm = reactive({ email: '', motDePasse: '' })

const registerForm = reactive({
  nom: '',
  prenom: '',
  email: '',
  dateNaissance: '',
  schoolQuery: '',
  motDePasse: '',
  confirmPassword: ''
})

const errors = reactive({
  email: '', motDePasse: '', nom: '', prenom: '',
  registerEmail: '', dateNaissance: '', ecole: '',
  filiere: '', classe: '', registerPassword: '', confirmPassword: ''
})

const schools = ref([])
const filteredSchools = ref([])
const filieres = ref([])
const classes = ref([])
const selectedEcoleId = ref(null)
const selectedFiliereId = ref(null)
const selectedClasseId = ref(null)

onMounted(async () => {
  await loadEcoles()
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.relative')) showSchoolDropdown.value = false
  })
})

function validateLoginForm() {
  let isValid = true
  errors.email = ''
  errors.motDePasse = ''

  if (!loginForm.email) {
    errors.email = "L'email est requis"; isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginForm.email)) {
    errors.email = 'Email invalide'; isValid = false
  }

  if (!loginForm.motDePasse) {
    errors.motDePasse = 'Le mot de passe est requis'; isValid = false
  }

  return isValid
}

function validateRegisterForm() {
  let isValid = true
  errors.nom = ''; errors.prenom = ''; errors.registerEmail = ''
  errors.dateNaissance = ''; errors.ecole = ''; errors.filiere = ''
  errors.classe = ''; errors.registerPassword = ''; errors.confirmPassword = ''

  if (!registerForm.nom) { errors.nom = 'Le nom est requis'; isValid = false }
  if (!registerForm.prenom) { errors.prenom = 'Le prénom est requis'; isValid = false }

  if (!registerForm.email) {
    errors.registerEmail = "L'email est requis"; isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.email)) {
    errors.registerEmail = 'Email invalide'; isValid = false
  }

  if (!registerForm.dateNaissance) { errors.dateNaissance = 'La date de naissance est requise'; isValid = false }
  if (!selectedEcoleId.value) { errors.ecole = 'Veuillez sélectionner une école'; isValid = false }
  if (!selectedFiliereId.value) { errors.filiere = 'Veuillez sélectionner une filière'; isValid = false }
  if (!selectedClasseId.value) { errors.classe = 'Veuillez sélectionner une classe'; isValid = false }

  if (!registerForm.motDePasse) {
    errors.registerPassword = 'Le mot de passe est requis'; isValid = false
  } else if (registerForm.motDePasse.length < 6) {
    errors.registerPassword = 'Le mot de passe doit contenir au moins 6 caractères'; isValid = false
  }

  if (registerForm.motDePasse !== registerForm.confirmPassword) {
    errors.confirmPassword = 'Les mots de passe ne correspondent pas'; isValid = false
  }

  return isValid
}

async function loadEcoles() {
  try {
    const response = await $fetch('/api/ref/ecoles')
    schools.value = response.success && response.data ? response.data : []
  } catch { schools.value = [] }
}

function searchEcoles() {
  const query = registerForm.schoolQuery.toLowerCase()
  if (!query) { filteredSchools.value = []; return }
  filteredSchools.value = schools.value.filter(s => s.nom.toLowerCase().includes(query))
  showSchoolDropdown.value = true
}

function toggleSchoolDropdown() {
  showSchoolDropdown.value = !showSchoolDropdown.value
  if (showSchoolDropdown.value && !registerForm.schoolQuery) {
    filteredSchools.value = schools.value
  }
}

async function selectSchool(school) {
  registerForm.schoolQuery = school.nom
  selectedEcoleId.value = school.id
  filteredSchools.value = []
  showSchoolDropdown.value = false
  errors.ecole = ''
  await loadFilieres(school.id)
}

async function loadFilieres(ecoleId) {
  try {
    const response = await $fetch(`/api/ref/ecoles/${ecoleId}/filieres`)
    filieres.value = response.success && response.data ? response.data : []
    selectedFiliereId.value = null
    classes.value = []
    selectedClasseId.value = null
  } catch { filieres.value = [] }
}

async function loadClasses() {
  if (!selectedFiliereId.value) return
  try {
    const response = await $fetch(`/api/ref/filieres/${selectedFiliereId.value}/classes`)
    classes.value = response.success && response.data ? response.data : []
    selectedClasseId.value = null
  } catch { classes.value = [] }
}

// ── Handlers ──────────────────────────────────────────────
async function handleLogin() {
  if (!validateLoginForm()) return
  serverError.login = ''
  isLoading.value = true


  try {
    const result = await login(loginForm.email, loginForm.motDePasse)
    if (!result.success) serverError.login = result.message
  } catch (err) {
    if (err?.data?.details && Array.isArray(err.data.details)) {
      serverError.login = err.data.details.join(' — ')
    } else {
      serverError.login = err?.data?.message || 'Identifiants incorrects. Veuillez réessayer.'
    }
  } finally {
    isLoading.value = false
  }
}

async function handleRegister() {
  if (!validateRegisterForm()) return
  serverError.register = ''
  isLoading.value = true

  try {
    const result = await register({
      nom: registerForm.nom,
      prenom: registerForm.prenom,
      email: registerForm.email,
      dateNaissance: registerForm.dateNaissance,
      ecoleId: selectedEcoleId.value,
      filiereId: selectedFiliereId.value,
      classeId: selectedClasseId.value,
      motDePasse: registerForm.motDePasse
    })
    if (!result.success) serverError.register = result.message
  } catch (err) {
    if (err?.data?.details && Array.isArray(err.data.details)) {
      serverError.register = err.data.details.join(' — ')
    } else {
      serverError.register = err?.data?.message || "Erreur lors de l'inscription"
    }
  } finally {
    isLoading.value = false
  }
}

async function handleGoogleLogin() {
  isGoogleLoading.value = true
  serverError.login = ''
  try {
    const result = await getGoogleUrl()
    if (!result.success) serverError.login = result.message
  } catch {
    serverError.login = 'Erreur lors de la connexion avec Google'
  } finally {
    isGoogleLoading.value = false
  }
}

async function handleGoogleRegister() {
  isGoogleLoading.value = true
  serverError.register = ''
  try {
    const result = await getGoogleUrl()
    if (!result.success) serverError.register = result.message
  } catch {
    serverError.register = "Erreur lors de l'inscription avec Google"
  } finally {
    isGoogleLoading.value = false
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>