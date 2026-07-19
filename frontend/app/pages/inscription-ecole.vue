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
      <div style="box-shadow: 1px 1px 5px 1px #cfcfcf;" class="-mt-14 bg-white w-full max-w-lg md:rounded-md px-8 pt-8 pb-8">

        <!-- Étape 1 : formulaire -->
        <div v-if="!success">

          <div class="text-center mb-6">
            <h1 class="text-3xl font-extrabold text-black mb-2">Créez votre école</h1>
            <p class="text-xs text-gray-800">Votre compte directeur et votre espace Mentora en 2 minutes</p>
          </div>

          <!-- Récap du plan choisi -->
          <div
            class="rounded-xl p-4 mb-6 border"
            :class="plan === 'pro' ? 'bg-primary border-primary' : 'bg-gray-50 border-gray-200'"
          >
            <div class="flex items-center justify-between mb-2">
              <span
                class="text-xs font-semibold px-2 py-0.5 rounded-full"
                :class="plan === 'pro' ? 'bg-secondary/20 text-secondary' : plan === 'starter' ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-600'"
              >
                {{ planInfo.label }}
              </span>
              <span class="text-lg font-extrabold" :class="plan === 'pro' ? 'text-white' : 'text-black'">
                {{ planInfo.price[billing] }}<span class="text-xs font-normal opacity-60" v-if="plan !== 'gratuit'">/mois</span>
              </span>
            </div>
            <p class="text-xs mb-2" :class="plan === 'pro' ? 'text-white/70' : 'text-gray-500'">{{ planInfo.tagline }}</p>
            <p v-if="plan !== 'gratuit' && billing === 'yearly'" class="text-xs font-semibold mb-2" :class="plan === 'pro' ? 'text-secondary' : 'text-secondary'">
              {{ planInfo.yearlyNote }}
            </p>
            <ul class="flex flex-wrap gap-x-4 gap-y-1">
              <li v-for="feat in planInfo.features" :key="feat" class="text-xs flex items-center gap-1" :class="plan === 'pro' ? 'text-white/80' : 'text-gray-600'">
                <svg class="w-3 h-3 shrink-0" :class="plan === 'pro' ? 'text-secondary' : 'text-green-500'" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
                {{ feat }}
              </li>
            </ul>
            <p v-if="plan !== 'gratuit'" class="text-[11px] mt-3" :class="plan === 'pro' ? 'text-white/60' : 'text-gray-400'">
              30 jours d'essai gratuit, sans engagement — vous choisissez votre plan et changez à tout moment
              <nuxt-link to="/#tarifs" class="underline">ici</nuxt-link>.
            </p>
          </div>

          <!-- École -->
          <div class="space-y-4 mb-5">
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Votre établissement</p>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nom de l'école *</label>
              <input v-model.trim="ecoleNom" type="text" placeholder="Ex : Lycée Victor Hugo"
                class="w-full px-4 py-3 text-sm text-gray-800 placeholder-gray-600 bg-input rounded-xl focus:outline-none transition-all duration-200" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Ville</label>
              <input v-model.trim="ecoleVille" type="text" placeholder="Ex : Abidjan"
                class="w-full px-4 py-3 text-sm text-gray-800 placeholder-gray-600 bg-input rounded-xl focus:outline-none transition-all duration-200" />
            </div>
          </div>

          <!-- Directeur -->
          <div class="space-y-4">
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Votre compte directeur</p>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                <input v-model.trim="prenom" type="text" placeholder="Prénom"
                  class="w-full px-4 py-3 text-sm text-gray-800 placeholder-gray-600 bg-input rounded-xl focus:outline-none transition-all duration-200" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                <input v-model.trim="nom" type="text" placeholder="Nom"
                  class="w-full px-4 py-3 text-sm text-gray-800 placeholder-gray-600 bg-input rounded-xl focus:outline-none transition-all duration-200" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input v-model.trim="email" type="email" placeholder="vous@ecole.com"
                class="w-full px-4 py-3 text-sm text-gray-800 placeholder-gray-600 bg-input rounded-xl focus:outline-none transition-all duration-200" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Mot de passe *</label>
              <div class="relative">
                <input v-model="password" :type="showPwd ? 'text' : 'password'" placeholder="Minimum 8 caractères"
                  class="w-full px-4 pr-12 py-3 text-sm text-gray-800 placeholder-gray-600 bg-input rounded-xl focus:outline-none transition-all duration-200" />
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
              <input v-model="passwordConfirm" :type="showPwd ? 'text' : 'password'" placeholder="Répétez le mot de passe"
                class="w-full px-4 py-3 text-sm text-gray-800 placeholder-gray-600 bg-input rounded-xl focus:outline-none transition-all duration-200"
                :class="{ 'border-2 border-red-300': passwordConfirm && password !== passwordConfirm }" />
              <p v-if="passwordConfirm && password !== passwordConfirm" class="text-xs text-red-500 mt-1">
                Les mots de passe ne correspondent pas
              </p>
            </div>
          </div>

          <p v-if="error" class="text-xs text-red-500 mt-4 text-center">{{ error }}</p>

          <button
            @click="submit"
            :disabled="!canSubmit || submitting"
            class="w-full mt-6 bg-primary text-white font-semibold py-2.5 rounded-xl hover:bg-primary/80 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <div v-if="submitting" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"/>
            <span v-else>{{ plan === 'gratuit' ? 'Créer mon compte' : "Créer mon compte et démarrer l'essai" }}</span>
          </button>

          <p class="text-center text-xs text-gray-500 mt-4">
            Déjà un compte ?
            <nuxt-link to="/auth" class="font-semibold text-secondary hover:text-primary transition-colors hover:underline ml-1">
              Se connecter
            </nuxt-link>
          </p>
        </div>

        <!-- Étape 2 : vérification email -->
        <div v-else class="text-center">

          <div v-if="!redirecting">
            <div class="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg class="w-10 h-10 text-primary animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
            </div>
            <h2 class="text-xl font-bold text-gray-800 mb-2 font-body">Vérifiez votre email</h2>
            <p class="text-sm text-gray-500 font-body mb-4">
              Un lien de vérification a été envoyé à<br/>
              <strong class="text-gray-800">{{ email }}</strong>
            </p>
            <div class="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 mb-4">
              <p class="text-xs text-yellow-700 font-body">
                Cliquez sur le lien dans l'email pour activer votre compte
                {{ plan === 'gratuit' ? 'et accéder à votre espace.' : 'et démarrer votre essai gratuit de 30 jours.' }}
              </p>
            </div>
            <div class="flex items-center justify-center gap-2 text-xs text-gray-400">
              <div class="animate-spin rounded-full h-3 w-3 border border-gray-400 border-t-transparent"/>
              En attente de vérification...
            </div>
          </div>

          <div v-else>
            <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg class="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <h2 class="text-xl font-bold text-gray-800 mb-2 font-body">Email vérifié !</h2>
            <p class="text-sm text-gray-500 font-body mb-4">
              {{ plan === 'gratuit' ? 'Redirection vers votre espace...' : 'Redirection vers le paiement sécurisé...' }}
            </p>
            <div class="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent mx-auto"/>
          </div>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

definePageMeta({ layout: false })

const route = useRoute()

const PLANS = {
  gratuit: {
    label: 'Gratuit',
    price: { monthly: '0€', yearly: '0€' },
    tagline: 'Pour découvrir Mentora',
    features: ["Jusqu'à 25 étudiants", "Jusqu'à 5 professeurs", '100 sessions/mois', 'QCM illimités']
  },
  starter: {
    label: 'Starter',
    price: { monthly: '39€', yearly: '32€' },
    yearlyNote: '390€/an — économisez 78€',
    tagline: 'Pour les petits établissements',
    features: ["Jusqu'à 100 étudiants", "Jusqu'à 15 professeurs", 'Sessions illimitées', 'Export CSV', 'Support email']
  },
  pro: {
    label: 'Pro',
    price: { monthly: '89€', yearly: '74€' },
    yearlyNote: '890€/an — économisez 178€',
    tagline: 'Pour les établissements ambitieux',
    features: ['Étudiants illimités', 'Professeurs illimités', 'Sessions illimitées', 'Génération IA de QCM', 'Stats avancées', 'Export CSV']
  }
}

const plan    = computed(() => ['gratuit', 'starter', 'pro'].includes(route.query.plan) ? route.query.plan : 'gratuit')
const billing = computed(() => route.query.billing === 'yearly' ? 'yearly' : 'monthly')
const planInfo = computed(() => PLANS[plan.value])

const ecoleNom  = ref('')
const ecoleVille = ref('')
const prenom = ref('')
const nom    = ref('')
const email  = ref('')
const password = ref('')
const passwordConfirm = ref('')
const showPwd = ref(false)

const submitting = ref(false)
const error       = ref('')
const success     = ref(false)
const redirecting = ref(false)
let pollingInterval = null
let ecoleIdCree = null

const canSubmit = computed(() => (
  ecoleNom.value.trim() && prenom.value.trim() && nom.value.trim() &&
  email.value.trim() && password.value.length >= 8 && password.value === passwordConfirm.value
))

const apiFetch = async (url, options = {}) => {
  const config = useRuntimeConfig()
  return await $fetch(`${config.public.apiBase}${url}`, options)
}

const dashboardParRole = { directeur: '/directeurs' }

const stopPolling = () => {
  if (pollingInterval) {
    clearInterval(pollingInterval)
    pollingInterval = null
  }
}

const startPolling = () => {
  pollingInterval = setInterval(async () => {
    try {
      const result = await apiFetch(`/admin/invitations/check-verified?email=${encodeURIComponent(email.value)}`)
      if (result.success && result.data?.isVerified) {
        stopPolling()
        const tokenCookie = useCookie('auth_token', { maxAge: 60 * 60 * 24 * 7 })
        tokenCookie.value = result.data.token
        localStorage.setItem('user', JSON.stringify(result.data.user))
        redirecting.value = true

        if (plan.value === 'gratuit') {
          setTimeout(() => navigateTo(dashboardParRole[result.data.user?.role] || '/directeurs'), 1200)
          return
        }

        // Plan payant : on enchaîne directement sur le paiement Stripe (essai 30 jours)
        try {
          const checkout = await $fetch('/api/stripe/checkout', {
            method:  'POST',
            headers: { Authorization: `Bearer ${result.data.token}` },
            body:    { plan: plan.value, billing: billing.value, ecoleId: ecoleIdCree }
          })
          if (checkout.success && checkout.data?.url) {
            window.location.href = checkout.data.url
          } else {
            setTimeout(() => navigateTo('/directeurs/abonnement'), 1200)
          }
        } catch {
          setTimeout(() => navigateTo('/directeurs/abonnement'), 1200)
        }
      }
    } catch {
      // on ignore les erreurs de polling, on réessaie au prochain tick
    }
  }, 4000)
}

const submit = async () => {
  if (!canSubmit.value) return
  submitting.value = true
  error.value = ''
  try {
    const result = await apiFetch('/auth/ecole/inscription', {
      method: 'POST',
      body: {
        ecole:     { nom: ecoleNom.value, ville: ecoleVille.value || null },
        directeur: { nom: nom.value, prenom: prenom.value, email: email.value, password: password.value },
        plan:      plan.value
      }
    })
    if (result.success) {
      ecoleIdCree = result.data?.ecoleId || null
      success.value = true
      startPolling()
    } else {
      error.value = result.message || 'Erreur lors de la création du compte'
    }
  } catch (err) {
    error.value = err?.data?.message || 'Erreur lors de la création du compte'
  } finally {
    submitting.value = false
  }
}

onUnmounted(() => stopPolling())
</script>
