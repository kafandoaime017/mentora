<template>
  <div class="bg-[#f5f0e8] font-body min-h-screen">
    <TeacherLayout>
      <div class="py-3">
        
        <!-- En-tête -->
        <div class="mb-8">
          <h1 class="text-2xl font-body font-extrabold text-[#1e3a2f]">Tableau de bord</h1>
          <p class="text-sm text-[#9b9589] font-body">Bienvenue dans votre espace professeur</p>
        </div>

        <!-- Chargement -->
        <div v-if="loading" class="bg-white shadow rounded-lg p-12 text-center">
          <div class="inline-block animate-spin rounded-full h-6 w-6 border-2 border-[#4a7c5e] border-t-transparent"></div>
        </div>

        <div v-else>
          <!-- Cartes statistiques -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <!-- Total sessions -->
            <div class="bg-primary rounded-xl  p-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-white font-body  mb-1">Total sessions</p>
                  <p class="text-3xl font-body font-extrabold text-white">{{ statsData.stats.total }}</p>
                </div>
                <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                  </svg>
                </div>
              </div>
            </div>

            <!-- Sessions à venir -->
            <div class="bg-danger rounded-xl shadow p-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-white font-body ">Sessions à venir</p>
                  <p class="text-3xl font-body font-bold text-white">{{ statsData.stats.aVenir }}</p>
                </div>
                <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                </div>
              </div>
            </div>

            <!-- Sessions en cours -->
            <div class="bg-yellow-600 rounded-xl shadow p-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-white font-body ">En cours</p>
                  <p class="text-3xl font-body font-bold text-white">{{ statsData.stats.enCours }}</p>
                </div>
                <div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                  </svg>
                </div>
              </div>
            </div>

            <!-- Sessions terminées -->
            <div class="bg-secondary rounded-xl shadow p-6">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-white font-body ">Terminées</p>
                  <p class="text-3xl font-body font-bold text-white">{{ statsData.stats.terminees }}</p>
                </div>
                <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

         

          <!-- Liste des sessions à venir -->
          <div class="bg-white rounded-xl shadow overflow-hidden">
            <div class="px-6 py-4 border-b border-[#e2ddd4] bg-[#f5f0e8]/30">
              <h3 class="text-lg font-body font-bold text-[#1e3a2f]">Sessions à venir</h3>
            </div>
            
            <div v-if="statsData.sessionsAVenir?.length === 0" class="p-12 text-center text-[#9b9589]">
              <svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              <p class="font-body">Aucune session programmée</p>
              <NuxtLink to="/teachers/create-session" class="text-[#4a7c5e] font-body hover:underline text-sm mt-2 inline-block">
                Créer une session →
              </NuxtLink>
            </div>

            <div v-else class="divide-y divide-[#e2ddd4]">
              <div 
                v-for="session in statsData.sessionsAVenir" 
                :key="session.id"
                class="p-4 hover:bg-[#f5f0e8]/30 cursor-pointer transition-colors"
                @click="navigateTo(`/teachers/qcm/${session.id}`)"
              >
                <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div class="flex-1">
                    <h4 class="font-semibold text-[#1e3a2f]">{{ session.titre }}</h4>
                    <div class="flex flex-wrap gap-3 mt-1 text-sm text-[#9b9589]">
                      <span class="flex items-center gap-1">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                        </svg>
                        {{ session.classe || '—' }}
                      </span>
                      <span class="flex items-center gap-1">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                        {{ formatDate(session.date_debut) }}
                      </span>
                      <span class="flex items-center gap-1">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        {{ session.duree }} min
                      </span>
                      <span class="flex items-center gap-1">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        {{ session.questions_count || 0 }} questions
                      </span>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="px-3 py-1 text-xs rounded-full bg-yellow-200 text-yellow-800">
                      Programmée
                    </span>
                    <button 
                      @click.stop="navigateTo(`/teachers/qcm/${session.id}/edit`)"
                      class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TeacherLayout>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useTeacher } from '../../../composables/useTeacher'
import { useToast } from '../../../composables/useToast'

const { getTeacherStats } = useTeacher()
const toast = useToast()

const loading = ref(true)
const statsData = ref({
  stats: { total: 0, aVenir: 0, enCours: 0, terminees: 0 },
  moyenne: { generale: 0, sur20: 0 },
  sessionsAVenir: []
})

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const loadStats = async () => {
  loading.value = true
  const result = await getTeacherStats()
  if (result.success) {
    statsData.value = result.data
  } else {
    toast.error('Erreur lors du chargement des statistiques')
  }
  loading.value = false
}

onMounted(() => {
  loadStats()
})
</script>