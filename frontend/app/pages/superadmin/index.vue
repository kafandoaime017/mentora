<template>
  <div class="bg-layout font-body min-h-screen">
    <SuperadminLayout>
      <div>
        <div class="mb-6">
          <h1 class="text-2xl font-body font-extrabold text-[#1e3a2f]">Tableau de bord</h1>
          <p class="text-sm text-black font-body mt-1">Vue globale de la plateforme Mentora</p>
        </div>

        <div v-if="loading" class="bg-white shadow rounded-lg p-12 text-center">
          <div class="inline-block animate-spin rounded-full h-6 w-6 border-2 border-blacky border-t-transparent"/>
        </div>

        <div v-else>
          <!-- KPI Cards -->
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <div v-for="stat in statCards" :key="stat.label" class="rounded-lg p-5" :class="stat.bg">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-white font-body text-sm mb-1">{{ stat.label }}</p>
                  <p class="text-3xl font-body font-extrabold text-white">{{ stat.value }}</p>
                </div>
                <div class="w-11 h-11 rounded-full flex items-center justify-center shrink-0" :class="stat.iconBg">
                  <svg class="w-5 h-5" :class="stat.iconColor" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="stat.path"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- Accès rapides -->
          <div class="bg-white rounded-lg border border-gray-200 p-5 mb-6">
            <h3 class="text-sm font-body font-bold text-[#1e3a2f] mb-4">Accès rapides</h3>
            <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
              <nuxt-link to="/superadmin/ecoles" class="flex items-center gap-2 p-3 bg-blacky hover:bg-blacky/80 rounded-lg transition-colors">
                <svg class="w-5 h-5 text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                <span class="text-sm font-bold text-white font-body">Créer une école</span>
              </nuxt-link>
              <nuxt-link to="/superadmin/directeurs" class="flex items-center gap-2 p-3 bg-blacky hover:bg-blacky/80 rounded-lg transition-colors">
                <svg class="w-5 h-5 text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
                </svg>
                <span class="text-sm font-bold text-white font-body">Inviter directeur</span>
              </nuxt-link>
              <nuxt-link to="/superadmin/ecoles" class="flex items-center gap-2 p-3 bg-blacky hover:bg-blacky/80 rounded-lg transition-colors">
                <svg class="w-5 h-5 text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5"/>
                </svg>
                <span class="text-sm font-bold text-white font-body">Gérer les écoles</span>
              </nuxt-link>
              <nuxt-link to="/superadmin/users" class="flex items-center gap-2 p-3 bg-blacky hover:bg-blacky/80 rounded-lg transition-colors">
                <svg class="w-5 h-5 text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                </svg>
                <span class="text-sm font-bold text-white font-body">Tous les users</span>
              </nuxt-link>
              <nuxt-link to="/superadmin/abonnements" class="flex items-center gap-2 p-3 bg-blacky hover:bg-blacky/80 rounded-lg transition-colors">
                <svg class="w-5 h-5 text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                </svg>
                <span class="text-sm font-bold text-white font-body">Abonnements</span>
              </nuxt-link>
            </div>
          </div>

          <!-- Derniers directeurs -->
          <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 class="text-sm font-body font-bold text-[#1e3a2f]">Derniers directeurs</h3>
              <nuxt-link to="/superadmin/directeurs" class="text-xs font-body text-blacky font-semibold hover:underline">Voir tout →</nuxt-link>
            </div>
            <div v-if="derniersDirecteurs.length === 0" class="p-10 text-center text-black font-body text-sm">
              Aucun directeur enregistré
            </div>
            <div v-else class="divide-y divide-gray-50">
              <div v-for="d in derniersDirecteurs" :key="d.id" class="px-5 py-3 flex items-center justify-between hover:bg-[#f5f0e8]/40">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-xs font-bold text-secondary">
                    {{ d.prenom?.[0] }}{{ d.nom?.[0] }}
                  </div>
                  <div>
                    <p class="text-sm font-body font-semibold text-black">{{ d.prenom }} {{ d.nom }}</p>
                    <p class="text-xs font-body text-black">{{ d.email }}</p>
                  </div>
                </div>
                <span class="px-2.5 py-1 rounded-full text-xs font-body font-semibold"
                  :class="d.isVerified ? 'bg-green-600 text-white' : 'bg-yellow-600 text-white'">
                  {{ d.isVerified ? 'Actif' : 'En attente' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SuperadminLayout>
  </div>
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
    { label: 'Écoles',       value: statsData.value.totalEcoles,     bg: 'bg-blacky',    iconBg: 'bg-white/20', iconColor: 'text-white', path: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5' },
    { label: 'Directeurs',   value: statsData.value.totalDirecteurs, bg: 'bg-secondary', iconBg: 'bg-white/20', iconColor: 'text-white', path: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { label: 'Professeurs',  value: statsData.value.totalProfs,      bg: 'bg-danger',    iconBg: 'bg-white/20', iconColor: 'text-white', path: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13' },
    { label: 'Étudiants',    value: statsData.value.totalEtudiants,  bg: 'bg-primary',   iconBg: 'bg-white/20', iconColor: 'text-white', path: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { label: 'Sessions',     value: statsData.value.totalSessions,   bg: 'bg-blue-600',  iconBg: 'bg-white/20', iconColor: 'text-white', path: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2' },
    { label: 'Utilisateurs', value: statsData.value.totalUsers,      bg: 'bg-purple-600',iconBg: 'bg-white/20', iconColor: 'text-white', path: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857' },
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
