<template>
  <SuperadminLayout>
    <div>
      <div class="mb-6">
        <h1 class="text-2xl font-extrabold text-gray-800">Dashboard</h1>
        <p class="text-sm text-gray-400 mt-1">Vue globale de la plateforme Mentora</p>
      </div>

      <div v-if="loading" class="flex justify-center py-16">
        <div class="animate-spin rounded-full h-8 w-8 border-2 border-blacky border-t-transparent"/>
      </div>

      <div v-else>
        <!-- Stats -->
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div v-for="stat in statCards" :key="stat.label"
            class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
          >
            <div class="w-9 h-9 rounded-xl flex items-center justify-center mb-3" :class="stat.bg">
              <svg class="w-5 h-5" :class="stat.color" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="stat.path"/>
              </svg>
            </div>
            <p class="text-2xl font-extrabold text-gray-800">{{ stat.value }}</p>
            <p class="text-xs text-gray-400 mt-0.5">{{ stat.label }}</p>
          </div>
        </div>

        <!-- Accès rapides -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6">
          <h3 class="text-sm font-bold text-gray-700 mb-4">Accès rapides</h3>
          <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
            <nuxt-link to="/superadmin/ecoles"
              class="flex flex-col items-center gap-2 p-4 bg-blacky/5 hover:bg-blacky/10 rounded-xl transition-colors"
            >
              <div class="w-10 h-10 bg-blacky rounded-full flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
              </div>
              <span class="text-xs font-semibold text-gray-700 text-center">Créer une école</span>
            </nuxt-link>
            <nuxt-link to="/superadmin/directeurs"
              class="flex flex-col items-center gap-2 p-4 bg-secondary/10 hover:bg-secondary/20 rounded-xl transition-colors"
            >
              <div class="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
                </svg>
              </div>
              <span class="text-xs font-semibold text-gray-700 text-center">Inviter directeur</span>
            </nuxt-link>
            <nuxt-link to="/superadmin/ecoles"
              class="flex flex-col items-center gap-2 p-4 bg-primary/5 hover:bg-primary/10 rounded-xl transition-colors"
            >
              <div class="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5"/>
                </svg>
              </div>
              <span class="text-xs font-semibold text-gray-700 text-center">Gérer les écoles</span>
            </nuxt-link>
            <nuxt-link to="/superadmin/users"
              class="flex flex-col items-center gap-2 p-4 bg-danger/5 hover:bg-danger/10 rounded-xl transition-colors"
            >
              <div class="w-10 h-10 bg-danger rounded-full flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                </svg>
              </div>
              <span class="text-xs font-semibold text-gray-700 text-center">Tous les users</span>
            </nuxt-link>
            <nuxt-link to="/superadmin/abonnements"
              class="flex flex-col items-center gap-2 p-4 bg-secondary/10 hover:bg-secondary/20 rounded-xl transition-colors"
            >
              <div class="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                </svg>
              </div>
              <span class="text-xs font-semibold text-gray-700 text-center">Abonnements</span>
            </nuxt-link>
          </div>
        </div>

        <!-- Derniers directeurs -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 class="text-sm font-bold text-gray-700">Derniers directeurs</h3>
            <nuxt-link to="/superadmin/directeurs" class="text-xs text-blacky font-semibold hover:underline">Voir tout →</nuxt-link>
          </div>
          <div v-if="derniersDirecteurs.length === 0" class="p-10 text-center text-gray-400 text-sm">
            Aucun directeur enregistré
          </div>
          <div v-else class="divide-y divide-gray-50">
            <div v-for="d in derniersDirecteurs" :key="d.id" class="px-5 py-3 flex items-center justify-between hover:bg-gray-50">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-xs font-bold text-secondary">
                  {{ d.prenom?.[0] }}{{ d.nom?.[0] }}
                </div>
                <div>
                  <p class="text-sm font-semibold text-gray-800">{{ d.prenom }} {{ d.nom }}</p>
                  <p class="text-xs text-gray-400">{{ d.email }}</p>
                </div>
              </div>
              <span class="px-2.5 py-1 rounded-full text-xs font-semibold"
                :class="d.isVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'">
                {{ d.isVerified ? 'Actif' : 'En attente' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </SuperadminLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSuperadmin } from '../../../composables/useSuperadmin'

definePageMeta({ layout: false })

const { getStats, getDirecteurs } = useSuperadmin()

const loading           = ref(true)
const statsData         = ref(null)
const derniersDirecteurs = ref([])

const statCards = computed(() => {
  if (!statsData.value) return []
  return [
    { label: 'Écoles',       value: statsData.value.totalEcoles,     bg: 'bg-blacky/10',   color: 'text-blacky',   path: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5' },
    { label: 'Directeurs',   value: statsData.value.totalDirecteurs, bg: 'bg-secondary/10', color: 'text-secondary', path: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { label: 'Professeurs',  value: statsData.value.totalProfs,      bg: 'bg-danger/10',    color: 'text-danger',    path: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13' },
    { label: 'Étudiants',    value: statsData.value.totalEtudiants,  bg: 'bg-primary/10',  color: 'text-primary',  path: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { label: 'Sessions',     value: statsData.value.totalSessions,   bg: 'bg-blacky/10',  color: 'text-blacky',  path: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2' },
    { label: 'Utilisateurs', value: statsData.value.totalUsers,      bg: 'bg-gray-100',  color: 'text-gray-600',   path: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857' },
  ]
})

onMounted(async () => {
  loading.value = true
  const [statsRes, dirsRes] = await Promise.all([getStats(), getDirecteurs()])
  if (statsRes.success) statsData.value = statsRes.data
  if (dirsRes.success)  derniersDirecteurs.value = (dirsRes.data.directeurs || []).slice(0, 5)
  loading.value = false
})
</script>