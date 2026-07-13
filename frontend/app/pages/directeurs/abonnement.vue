<template>
  <AdminLayout>
    <div class="max-w-4xl mx-auto">

      <!-- En-tête -->
      <div class="mb-8">
        <h1 class="text-2xl font-body font-extrabold text-black">Abonnement</h1>
        <p class="text-sm text-black font-body mt-1">Gérez le plan de votre établissement</p>
      </div>

      <!-- Banners -->
      <div v-if="success" class="mb-6 bg-green-50 border border-green-200 text-green-700 rounded-lg px-5 py-4 text-sm font-body font-semibold flex items-center gap-3">
        <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center shrink-0">
          <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        Paiement réussi ! Votre plan a été activé. Bienvenue sur Mentora {{ abonnement?.plan?.toUpperCase() }} 🎉
      </div>

      <div v-if="canceled" class="mb-6 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg px-5 py-4 text-sm font-body font-semibold flex items-center gap-3">
        <div class="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center shrink-0">
          <svg class="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        Paiement annulé. Vous pouvez réessayer à tout moment.
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-20">
        <div class="animate-spin rounded-full h-8 w-8 border-2 border-blacky border-t-transparent"/>
      </div>

      <div v-else class="space-y-6">

        <!-- Plan actuel card -->
        <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 class="font-body font-bold text-black">Plan actuel</h3>
            <span
              class="px-3 py-1 rounded-full text-xs font-body font-extrabold uppercase tracking-wide"
              :class="{
                'bg-gray-100 text-black':         abonnement?.plan === 'gratuit',
                'bg-blue-100 text-blue-700':         abonnement?.plan === 'starter',
                'bg-[#1e3a2f]/10 text-[#1e3a2f]':   abonnement?.plan === 'pro'
              }"
            >
              {{ abonnement?.plan }}
            </span>
          </div>

          <div class="p-6">
            <!-- Limites -->
            <div class="grid grid-cols-3 gap-4 mb-6">
              <div class="bg-gray-50 rounded-lg p-4 text-center">
                <p class="text-2xl font-body font-extrabold text-black">
                  {{ abonnement?.limites?.maxEtudiants === -1 ? '∞' : abonnement?.limites?.maxEtudiants }}
                </p>
                <p class="text-xs font-body text-black mt-1">Étudiants</p>
              </div>
              <div class="bg-gray-50 rounded-lg p-4 text-center">
                <p class="text-2xl font-body font-extrabold text-black">
                  {{ abonnement?.limites?.maxProfs === -1 ? '∞' : abonnement?.limites?.maxProfs }}
                </p>
                <p class="text-xs font-body text-black mt-1">Professeurs</p>
              </div>
              <div class="bg-gray-50 rounded-lg p-4 text-center">
                <p class="text-2xl font-body font-extrabold text-black">
                  {{ abonnement?.limites?.maxSessions === -1 ? '∞' : abonnement?.limites?.maxSessions }}
                </p>
                <p class="text-xs font-body text-black mt-1">Sessions/mois</p>
              </div>
            </div>

            <!-- Features du plan actuel -->
            <div class="flex flex-wrap gap-2 mb-6">
              <span class="px-3 py-1 bg-green-50 text-green-700 text-xs font-body font-semibold rounded-full flex items-center gap-1">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
                QCM illimités
              </span>
              <span v-if="abonnement?.plan !== 'gratuit'" class="px-3 py-1 bg-green-50 text-green-700 text-xs font-body font-semibold rounded-full flex items-center gap-1">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
                Export CSV
              </span>
              <span
                class="px-3 py-1 text-xs font-body font-semibold rounded-full flex items-center gap-1"
                :class="abonnement?.limites?.ia ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-black'"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path v-if="abonnement?.limites?.ia" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                  <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
                Génération IA
              </span>
            </div>

            <!-- Bouton portail Stripe -->
            <button
              v-if="abonnement?.has_stripe"
              @click="ouvrirPortail"
              :disabled="portalLoading"
              class="w-full py-3 bg-gray-50 border border-gray-200 text-black rounded-lg text-sm font-body font-semibold hover:bg-gray-100 transition flex items-center justify-center gap-2"
            >
              <div v-if="portalLoading" class="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent"/>
              <template v-else>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                Gérer mon abonnement · Factures · Annulation
              </template>
            </button>
          </div>
        </div>

        <!-- Toggle mensuel / annuel -->
        <div class="flex items-center justify-center gap-3">
          <span class="text-sm font-body font-medium" :class="billing === 'monthly' ? 'text-black' : 'text-black'">Mensuel</span>
          <button
            @click="billing = billing === 'monthly' ? 'yearly' : 'monthly'"
            class="relative inline-flex h-6 w-12 items-center rounded-full transition-colors duration-200"
            :class="billing === 'yearly' ? 'bg-blacky' : 'bg-gray-300'"
          >
            <span
              class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200"
              :style="billing === 'yearly' ? 'transform: translateX(28px)' : 'transform: translateX(4px)'"
            />
          </button>
          <span class="text-sm font-body font-medium" :class="billing === 'yearly' ? 'text-black' : 'text-black'">
            Annuel
            <span class="ml-1.5 px-2 py-0.5 bg-blacky/10 text-blacky text-xs font-body font-bold rounded-full">-17%</span>
          </span>
        </div>

        <!-- Plans -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

          <!-- Starter -->
          <div
            class="bg-white rounded-lg border overflow-hidden transition-all"
            :class="abonnement?.plan === 'starter' ? 'border-blue-300 ring-2 ring-blue-100' : 'border-gray-200'"
          >
            <div class="p-6">
              <div class="flex items-center justify-between mb-5">
                <div>
                  <span class="text-xs font-body font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Starter</span>
                  <h3 class="text-xl font-body font-extrabold text-black mt-2">
                    {{ billing === 'monthly' ? '39€' : '32€' }}
                    <span class="text-sm font-body font-normal text-black">/mois</span>
                  </h3>
                  <p v-if="billing === 'yearly'" class="text-xs font-body text-blacky font-semibold mt-0.5">390€/an — économisez 78€</p>
                </div>
                <span v-if="abonnement?.plan === 'starter'" class="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-body font-bold rounded-lg">Actuel ✓</span>
              </div>

              <ul class="space-y-2.5 mb-6">
                <li v-for="feat in starterFeats" :key="feat" class="flex items-center gap-2 text-sm font-body text-black">
                  <svg class="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                  </svg>
                  {{ feat }}
                </li>
                <li class="flex items-center gap-2 text-sm font-body text-black">
                  <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                  Génération IA
                </li>
              </ul>

              <button
                v-if="abonnement?.plan !== 'starter'"
                @click="passer('starter')"
                :disabled="!!checkoutLoading"
                class="w-full py-3 bg-blacky text-white rounded-lg text-sm font-body font-bold hover:bg-blacky/90 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <div v-if="checkoutLoading === 'starter'" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"/>
                <span v-else>Passer au Starter</span>
              </button>
              <div v-else class="w-full py-3 bg-blue-50 text-blue-600 rounded-lg text-sm font-body font-bold text-center">
                Plan actuel ✓
              </div>
            </div>
          </div>

          <!-- Pro -->
          <div
            class="bg-[#1e3a2f] rounded-lg border overflow-hidden transition-all relative"
            :class="abonnement?.plan === 'pro' ? 'border-[#919e19] ring-2 ring-[#919e19]/30' : 'border-transparent'"
          >
            <!-- Badge recommandé -->
            <div v-if="abonnement?.plan !== 'pro'" class="bg-[#919e19] text-white text-[10px] font-body font-extrabold text-center py-1.5 uppercase tracking-widest">
              Le plus populaire
            </div>

            <div class="p-6">
              <div class="flex items-center justify-between mb-5">
                <div>
                  <span class="text-xs font-body font-semibold text-[#919e19] bg-[#919e19]/20 px-2 py-0.5 rounded-full">Pro</span>
                  <h3 class="text-xl font-body font-extrabold text-white mt-2">
                    {{ billing === 'monthly' ? '89€' : '74€' }}
                    <span class="text-sm font-body font-normal text-white/40">/mois</span>
                  </h3>
                  <p v-if="billing === 'yearly'" class="text-xs font-body text-[#919e19] font-semibold mt-0.5">890€/an — économisez 178€</p>
                </div>
                <span v-if="abonnement?.plan === 'pro'" class="px-2 py-1 bg-[#919e19]/20 text-[#919e19] text-xs font-body font-bold rounded-lg">Actuel ✓</span>
              </div>

              <ul class="space-y-2.5 mb-6">
                <li v-for="feat in proFeats" :key="feat" class="flex items-center gap-2 text-sm font-body text-white/80">
                  <svg class="w-4 h-4 text-[#919e19] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                  </svg>
                  {{ feat }}
                </li>
              </ul>

              <button
                v-if="abonnement?.plan !== 'pro'"
                @click="passer('pro')"
                :disabled="!!checkoutLoading"
                class="w-full py-3 bg-[#919e19] text-white rounded-lg text-sm font-body font-bold hover:bg-[#919e19]/90 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <div v-if="checkoutLoading === 'pro'" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"/>
                <span v-else>Passer au Pro</span>
              </button>
              <div v-else class="w-full py-3 bg-[#919e19]/20 text-[#919e19] rounded-lg text-sm font-body font-bold text-center">
                Plan actuel ✓
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <p class="text-center text-xs font-body text-black">
          30 jours d'essai gratuit · Annulation à tout moment · Paiement sécurisé par
          <span class="font-semibold text-black">Stripe</span>
        </p>

      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from '~~/composables/useToast'

const route           = useRoute()
const toast           = useToast()
const loading         = ref(true)
const portalLoading   = ref(false)
const checkoutLoading = ref(null)
const billing         = ref('monthly')
const abonnement      = ref(null)
const success         = ref(false)
const canceled        = ref(false)

const starterFeats = [
  '100 étudiants',
  '15 professeurs',
  'Sessions illimitées',
  'Export CSV',
  'Support email'
]

const proFeats = [
  'Étudiants illimités',
  'Professeurs illimités',
  'Sessions illimitées',
  'Génération IA de QCM',
  'Stats avancées',
  'Export CSV',
  'Support prioritaire'
]

const token = () => useCookie('auth_token').value

onMounted(async () => {
  success.value  = route.query.success === 'true'
  canceled.value = route.query.canceled === 'true'
  await chargerAbonnement()
})

const chargerAbonnement = async () => {
  loading.value = true
  try {
    const result = await $fetch('/api/stripe/abonnement', {
      headers: { Authorization: `Bearer ${token()}` }
    })
    if (result.success) abonnement.value = result.data
  } catch {}
  loading.value = false
}

const passer = async (plan) => {
  checkoutLoading.value = plan
  try {
    const ecoleId = abonnement.value?.ecoleId
    if (!ecoleId) {
      toast.error('École non trouvée')
      checkoutLoading.value = null
      return
    }

    const result = await $fetch('/api/stripe/checkout', {
      method:  'POST',
      headers: { Authorization: `Bearer ${token()}` },
      body:    { plan, billing: billing.value, ecoleId }
    })

    if (result.success && result.data?.url) {
      window.location.href = result.data.url
    } else if (result.code === 'ABONNEMENT_ACTIF') {
      toast.error('Abonnement actif — utilisez le portail pour modifier')
      await ouvrirPortail()
    } else {
      toast.error(result.message || 'Erreur')
    }
  } catch {
    toast.error('Erreur lors de la création du paiement')
  }
  checkoutLoading.value = null
}

const ouvrirPortail = async () => {
  portalLoading.value = true
  try {
    const result = await $fetch('/api/stripe/portal', {
      method:  'POST',
      headers: { Authorization: `Bearer ${token()}` },
      body:    { ecoleId: abonnement.value?.ecoleId }
    })
    if (result.success && result.data?.url) {
      window.location.href = result.data.url
    } else {
      toast.error(result.message || 'Erreur portail')
    }
  } catch {
    toast.error('Erreur portail Stripe')
  }
  portalLoading.value = false
}
</script>