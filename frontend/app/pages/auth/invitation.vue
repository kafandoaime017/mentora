<template>
  <div class="min-h-screen bg-layout font-body flex flex-col relative overflow-hidden">

    <!-- Header -->
    <div style="box-shadow: 1px 1px 8px 1px #cfcfcf;" class="h-20 flex-shrink-0 bg-white flex items-center px-6 md:px-20">
      <nuxt-link to="/">
        <img src="/images/logo-color.png" alt="Mentora" class="h-16 w-auto transform hover:scale-105 transition-transform duration-300" />
      </nuxt-link>
    </div>

    <br/>

    <!-- Body -->
    <div class="flex-1 flex flex-col mt-20 items-center px-6 pb-10 relative z-10">
      <div style="box-shadow: 1px 1px 5px 1px #cfcfcf;" class="-mt-14 bg-white w-full max-w-md md:rounded-md px-8 pt-8 pb-8">

        <!-- Loading -->
        <div v-if="loading" class="text-center py-8">
          <div class="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent mx-auto mb-4"/>
          <p class="text-gray-500 text-sm">Vérification de l'invitation...</p>
        </div>

        <!-- Erreur -->
        <div v-else-if="error">
          <div class="text-center mb-6">
            <h1 class="text-3xl font-extrabold text-black mb-2">Invitation invalide</h1>
            <p class="text-xs text-gray-800">{{ error }}</p>
          </div>
          <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <nuxt-link to="/auth" class="block w-full py-2.5 bg-primary text-white rounded-xl text-sm font-semibold text-center hover:bg-primary/80 transition-colors">
            Retour à la connexion
          </nuxt-link>
        </div>

       <!-- Remplace le bloc "Succès inscription" par : -->
<div v-else-if="success" class="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">

  <!-- Animation en attente -->
  <div v-if="!emailVerified" class="text-center">
    <div class="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-5">
      <svg class="w-10 h-10 text-primary animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
      </svg>
    </div>
    <h2 class="text-xl font-bold text-gray-800 mb-2 font-body">Vérifiez votre email</h2>
    <p class="text-sm text-gray-500 font-body mb-4">
      Un lien de vérification a été envoyé à<br/>
      <strong class="text-gray-800">{{ pendingEmail }}</strong>
    </p>
    <div class="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 mb-4">
      <p class="text-xs text-yellow-700 font-body">
        Cliquez sur le lien dans l'email pour activer votre compte et accéder à votre espace.
      </p>
    </div>
    <div class="flex items-center justify-center gap-2 text-xs text-gray-400">
      <div class="animate-spin rounded-full h-3 w-3 border border-gray-400 border-t-transparent"/>
      En attente de vérification...
    </div>
  </div>

  <!-- Email vérifié -->
  <div v-else class="text-center">
    <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
      <svg class="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
      </svg>
    </div>
    <h2 class="text-xl font-bold text-gray-800 mb-2 font-body">Email vérifié !</h2>
    <p class="text-sm text-gray-500 font-body mb-4">Redirection en cours...</p>
    <div class="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent mx-auto"/>
  </div>

</div>

        <!-- Formulaire -->
        <div v-else-if="invitation">

          <!-- Title -->
          <div class="text-center mb-6">
            <h1 class="text-3xl font-extrabold text-black mb-2">Bienvenue !</h1>
            <p class="text-xs text-gray-800">Finalisez votre inscription sur Mentora</p>
          </div>

          <!-- Infos pré-remplies -->
          <div class="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-5 space-y-2">
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Votre invitation</p>
            <div class="flex justify-between">
              <span class="text-xs text-gray-500">Prénom</span>
              <span class="text-xs font-semibold text-gray-800">{{ invitation.prenom }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-xs text-gray-500">Nom</span>
              <span class="text-xs font-semibold text-gray-800">{{ invitation.nom }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-xs text-gray-500">Email</span>
              <span class="text-xs font-semibold text-gray-800 truncate ml-4">{{ invitation.email }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-xs text-gray-500">Rôle</span>
              <span
                class="text-xs font-semibold px-2 py-0.5 rounded-full"
                :class="invitation.role === 'etudiant' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'"
              >
                {{ invitation.role === 'etudiant' ? 'Étudiant' : 'Professeur' }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-xs text-gray-500">Filière</span>
              <span class="text-xs font-semibold text-gray-800">{{ invitation.filiere }}</span>
            </div>
            <div v-if="invitation.classe" class="flex justify-between">
              <span class="text-xs text-gray-500">Classe</span>
              <span class="text-xs font-semibold text-gray-800">{{ invitation.classe }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-xs text-gray-500">École</span>
              <span class="text-xs font-semibold text-gray-800">{{ invitation.ecole }}</span>
            </div>
          </div>

          <!-- Mot de passe -->
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Choisissez un mot de passe *</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                </div>
                <input
                  v-model="password"
                  :type="showPwd ? 'text' : 'password'"
                  placeholder="Minimum 8 caractères"
                  class="w-full pl-11 pr-12 py-3 text-sm text-gray-800 placeholder-gray-600 bg-input rounded-xl focus:outline-none transition-all duration-200"
                />
                <button type="button" @click="showPwd = !showPwd" class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600">
                  <svg v-if="!showPwd" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                  <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242"/>
                  </svg>
                </button>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe *</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                </div>
                <input
                  v-model="passwordConfirm"
                  :type="showPwd ? 'text' : 'password'"
                  placeholder="Répétez le mot de passe"
                  class="w-full pl-11 pr-4 py-3 text-sm text-gray-800 placeholder-gray-600 bg-input rounded-xl focus:outline-none transition-all duration-200"
                  :class="{ 'border-2 border-red-300': passwordConfirm && password !== passwordConfirm }"
                />
              </div>
              <p v-if="passwordConfirm && password !== passwordConfirm" class="text-xs text-red-500 mt-1">
                Les mots de passe ne correspondent pas
              </p>
            </div>
          </div>

          <!-- Bouton -->
          <button
            @click="registerViaInvitation"
            :disabled="registering || !password || password !== passwordConfirm || password.length < 8"
            class="w-full mt-5 bg-primary text-white font-semibold py-2.5 rounded-xl hover:bg-primary/80 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <div v-if="registering" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"/>
            <span v-else>Créer mon compte</span>
          </button>

          <p class="text-center text-xs text-gray-500 mt-4">
            Déjà un compte ?
            <nuxt-link to="/auth" class="font-semibold text-secondary hover:text-primary transition-colors hover:underline ml-1">
              Se connecter
            </nuxt-link>
          </p>
        </div>

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
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

definePageMeta({ layout: false })

const route           = useRoute()
const loading         = ref(true)
const error           = ref('')
const success         = ref(false)
const invitation      = ref(null)
const emailVerified = ref(false)
const pendingEmail  = ref('')
let pollingInterval = null

const password        = ref('')
const passwordConfirm = ref('')
const showPwd         = ref(false)
const registering     = ref(false)

const apiFetch = async (url, options = {}) => {
  const config = useRuntimeConfig()
  return await $fetch(`${config.public.apiBase}${url}`, options)
}

const loadInvitation = async () => {
  const token = route.query.token
  if (!token) {
    error.value = 'Token manquant dans l\'URL'
    loading.value = false
    return
  }
  try {
    const result = await apiFetch(`/admin/invitations/verify?token=${token}`)
    if (result.success) invitation.value = result.data
  } catch (err) {
    error.value = err?.data?.message || 'Invitation invalide ou expirée'
  } finally {
    loading.value = false
  }
}

const registerViaInvitation = async () => {
  if (password.value.length < 8 || password.value !== passwordConfirm.value) return
  registering.value = true
  try {
    const result = await apiFetch('/admin/invitations/register', {
      method: 'POST',
      body: { token: route.query.token, password: password.value }
    })
    if (result.success) {
      // Rediriger vers la page de vérification email avec l'email en query
      navigateTo({
        path:  '/verify-email',
        query: { email: invitation.value?.email }
      })
    } else {
      error.value = result.message || 'Erreur'
    }
  } catch (err) {
    error.value = err?.data?.message || 'Erreur lors de la création du compte'
  } finally {
    registering.value = false
  }
}

onMounted(() => loadInvitation())
</script>