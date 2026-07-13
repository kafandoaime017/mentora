<template>
  <div class="bg-[#f5f0e8] font-body min-h-screen">
    <AdminLayout>
      <div class="py-3">

        <!-- En-tête -->
        <div class="mb-6">
          <h1 class="text-2xl font-body font-extrabold text-[#1e3a2f]">Tableau de bord</h1>
          <p class="text-md text-blacky font-body">Bienvenue dans votre espace Mr./Mme <span class="font-bold">{{ currentUser?.nom }} {{ currentUser?.prenom }}</span></p>
        </div>

        <!-- Chargement -->
        <div v-if="loading" class="bg-white shadow rounded-lg p-12 text-center">
          <div class="inline-block animate-spin rounded-full h-6 w-6 border-2 border-[#4a7c5e] border-t-transparent">
          </div>
        </div>

        <div v-else>

          <!-- Bannière plan -->
          <div v-if="planInfo" class="mb-6 rounded-lg p-5 bg-blacky flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <p class="text-white font-body font-bold text-sm uppercase tracking-wide">Plan {{ planInfo.plan }}</p>
              <p v-if="planInfo.is_trial" class="text-white/80 font-body text-sm mt-1">
                Période d'essai : {{ planInfo.trial_days_left }} jour{{ planInfo.trial_days_left > 1 ? 's' : '' }} restant{{ planInfo.trial_days_left > 1 ? 's' : '' }}
              </p>
            </div>
            <nuxt-link to="/directeurs/abonnement" class="shrink-0 bg-white text-blacky font-body font-semibold text-sm px-4 py-2 rounded-lg hover:bg-white/90 transition-colors">
              Gérer l'abonnement
            </nuxt-link>
          </div>

          <!-- KPI Cards -->
          <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
            <div class="bg-primary rounded-lg p-5">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-white font-body text-sm mb-1">Étudiants</p>
                  <p class="text-3xl font-body font-extrabold text-white">{{ stats.totalEtudiants || 0 }}</p>
                </div>
                <div class="w-11 h-11 bg-green-100 rounded-full flex items-center justify-center">
                  <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
            </div>
            <div class="bg-danger rounded-lg p-5">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-white font-body text-sm">Professeurs</p>
                  <p class="text-3xl font-body font-bold text-white">{{ stats.totalProfesseurs || 0 }}</p>
                </div>
                <div class="w-11 h-11 bg-red-100 rounded-full flex items-center justify-center">
                  <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
            </div>
            <div class="bg-blue-600 rounded-lg p-5">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-white font-body text-sm">Filières</p>
                  <p class="text-3xl font-body font-bold text-white">{{ stats.totalFilieres || 0 }}</p>
                </div>
                <div class="w-11 h-11 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                </div>
              </div>
            </div>
            <div class="bg-purple-600 rounded-lg p-5">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-white font-body text-sm">Classes</p>
                  <p class="text-3xl font-body font-bold text-white">{{ stats.totalClasses || 0 }}</p>
                </div>
                <div class="w-11 h-11 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
            </div>
            <div class="bg-secondary rounded-lg p-5">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-white font-body text-sm">Sessions QCM</p>
                  <p class="text-3xl font-body font-bold text-white">{{ stats.totalSessions || 0 }}</p>
                </div>
                <div class="w-11 h-11 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg class="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- Profs en attente / Invitations en attente -->
          <div v-if="profsPending.length || invitationsEnAttente.length" class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

            <div v-if="profsPending.length" class="bg-white rounded-lg border border-gray-200 p-5">
              <h3 class="font-body font-bold text-[#1e3a2f] mb-3">Professeurs en attente de validation</h3>
              <div class="space-y-2">
                <div v-for="p in profsPending" :key="p.id" class="flex items-center justify-between gap-2 p-2 rounded-lg bg-[#f5f0e8]">
                  <span class="text-sm font-body text-black truncate">{{ p.nom }} {{ p.prenom }}</span>
                  <button
                    @click="activateProf(p.id)"
                    class="shrink-0 bg-primary text-white text-xs font-body font-semibold px-3 py-1.5 rounded-lg hover:bg-primary/80 transition-colors"
                  >
                    Activer
                  </button>
                </div>
              </div>
            </div>

            <div v-if="invitationsEnAttente.length" class="bg-white rounded-lg border border-gray-200 p-5">
              <h3 class="font-body font-bold text-[#1e3a2f] mb-3">Invitations en attente ({{ invitationsEnAttente.length }})</h3>
              <div class="space-y-2">
                <div v-for="inv in invitationsEnAttente.slice(0, 4)" :key="inv.id" class="flex items-center justify-between gap-2 p-2 rounded-lg bg-[#f5f0e8]">
                  <span class="text-sm font-body text-black truncate">{{ inv.nom }} {{ inv.prenom }} · {{ inv.email }}</span>
                  <span class="shrink-0 text-xs font-body font-semibold px-2 py-0.5 rounded-full bg-secondary/10 text-secondary">{{ inv.role }}</span>
                </div>
              </div>
              <nuxt-link to="/directeurs/invitations" class="mt-3 inline-block text-sm font-body font-semibold text-blacky hover:underline">
                Voir toutes les invitations →
              </nuxt-link>
            </div>

          </div>

          <!-- Dernières sessions -->
          <div v-if="dernieresSessions.length" class="bg-white rounded-lg border border-gray-200 p-5 mb-6">
            <h3 class="font-body font-bold text-[#1e3a2f] mb-3">Dernières sessions</h3>
            <div class="space-y-2">
              <div v-for="s in dernieresSessions" :key="s.id" class="flex items-center justify-between gap-2 p-2 rounded-lg bg-[#f5f0e8]">
                <span class="text-sm font-body text-black truncate">{{ s.titre }}</span>
                <span class="shrink-0 text-xs font-body font-semibold px-2 py-0.5 rounded-full bg-blacky/10 text-blacky">{{ s.status }}</span>
              </div>
            </div>
            <nuxt-link to="/directeurs/sessions" class="mt-3 inline-block text-sm font-body font-semibold text-blacky hover:underline">
              Voir toutes les sessions →
            </nuxt-link>
          </div>

          <!-- Accès rapides -->
          <div class="overflow-hidden mb-6">
            <!-- <div class="px-6 py-4 border-b border-gray-100">
              <h3 class="text-base font-body font-bold text-[#1e3a2f]">Accès rapides</h3>
            </div> -->

            <div class="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">

              <!-- Étudiant -->
              <nuxt-link to="/directeurs/invitations"
                class="flex items-center gap-2 p-4 bg-blacky hover:bg-blacky/80 rounded-lg transition-colors">
                <svg class="w-5 h-5 text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>

                <span class="text-sm font-bold text-white font-body">
                  Inviter un étudiant
                </span>
              </nuxt-link>

              <!-- Professeur -->
              <nuxt-link to="/directeurs/invitations"
                class="flex items-center gap-2 p-3 bg-blacky hover:bg-blacky/80 rounded-lg transition-colors">
                <svg class="w-5 h-5 text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M16 14a4 4 0 10-8 0m8 0v6m0 0H8m8 0H8" />
                </svg>

                <span class="text-sm font-bold text-white font-body">
                  Inviter un professeur
                </span>
              </nuxt-link>

              <!-- Filière -->
              <nuxt-link to="/directeurs/structure"
                class="flex items-center gap-2 p-3 bg-blacky hover:bg-blacky/80 rounded-lg transition-colors">
                <svg class="w-5 h-5 text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7h18M3 12h18M3 17h18" />
                </svg>

                <span class="text-sm font-bold text-white font-body">
                  Créer une filière
                </span>
              </nuxt-link>

              <!-- Classe -->
              <nuxt-link to="/directeurs/structure"
                class="flex items-center gap-2 p-3 bg-blacky hover:bg-blacky/80 rounded-lg transition-colors">
                <svg class="w-5 h-5 text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>

                <span class="text-sm font-bold text-white font-body">
                  Créer une classe
                </span>
              </nuxt-link>

            </div>
          </div>

       

        </div>
      </div>
    </AdminLayout>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAdmin } from '../../../composables/useAdmin'
import { useToast } from '../../../composables/useToast'
import { useAuth } from '../../../composables/useAuth'

const toast = useToast()
const { getDashboard, getUsers, activateProfesseur, getInvitations, getSessions } = useAdmin()
const { getUser } = useAuth()

const loading = ref(true)
const stats = ref({})
const profsPending = ref([])
const invitationsEnAttente = ref([])
const dernieresSessions = ref([])
const planInfo = ref(null)

//Recuperer l'utilisateur connecté par sa session
const currentUser = getUser()

const token = () => useCookie('auth_token').value

const activateProf = async (userId) => {
  try {
    const result = await activateProfesseur(userId)
    if (result.success) {
      toast.success('Professeur activé')
      await loadDashboard()
    } else {
      toast.error(result.message || 'Erreur lors de l\'activation')
    }
  } catch {
    toast.error('Erreur lors de l\'activation')
  }
}

const chargerPlan = async () => {
  try {
    const result = await $fetch('/api/stripe/abonnement', {
      headers: { Authorization: `Bearer ${token()}` }
    })
    if (result.success) {
      planInfo.value = {
        plan: result.data.plan,
        is_trial: result.data.is_trial,
        trial_days_left: result.data.trial_days_left,
        limites: result.data.limites
      }
    }
  } catch { }
}

const loadDashboard = async () => {
  loading.value = true
  try {
    const [dashResult, usersResult, invitResult, sessionsResult] = await Promise.all([
      getDashboard(),
      getUsers({ role: 'professeur' }),
      getInvitations(),
      getSessions(),
      chargerPlan()
    ])

    if (dashResult.success) stats.value = dashResult.data.stats

    if (usersResult.success) {
      profsPending.value = usersResult.data.filter(u => u.profil?.statut === 'pending')
    }

    if (invitResult.success) {
      invitationsEnAttente.value = invitResult.data.filter(inv => !inv.used && !inv.expired)
    }

    if (sessionsResult.success) {
      dernieresSessions.value = sessionsResult.data.slice(0, 4)
    }

    if (!dashResult.success) toast.error(dashResult.message || 'Erreur chargement dashboard')
  } catch {
    toast.error('Erreur chargement dashboard')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (process.client) loadDashboard()
})
</script>

<style scoped>
.bg-primary {
  background-color: #4a7c5e;
}

.bg-secondary {
  background-color: #919e19;
}

.bg-danger {
  background-color: #dc2626;
}

.bg-blue-600 {
  background-color: #2563eb;
}

.bg-purple-600 {
  background-color: #9333ea;
}

</style>