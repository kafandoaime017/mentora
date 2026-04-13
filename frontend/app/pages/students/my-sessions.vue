<template>
  <div class="bg-[#f5f0e8] font-body min-h-screen">
    <StudentLayout>
      
      <!-- Titre page -->
      <h2 class="font-['Roboto'] text-xl font-extrabold text-[#1e3a2f] mb-6">
        Mes sessions
      </h2>

      <!-- ══════════════════════════
           ONGLETS
      ═══════════════════════════════ -->
      <div class="mb-6">
        <div class="border-b">
          <nav class="flex gap-1" aria-label="Tabs">
            <button
              v-for="onglet in onglets"
              :key="onglet.id"
              @click="ongletActif = onglet.id"
              class="px-6 py-3 text-sm font-body font-semibold transition-all duration-200 relative"
              :class="ongletActif === onglet.id
                ? 'text-white rounded-md bg-primary'
                : 'text-[#9b9589] hover:text-[#4a7c5e]'"
            >
              {{ onglet.nom }}
              <span 
                v-if="ongletActif === onglet.id"
                class="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary rounded-full"
              ></span>
            </button>
          </nav>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
      </div>

      <!-- ══════════════════════════
           CONTENU DES ONGLETS
      ═══════════════════════════════ -->
      
      <!-- Toutes les sessions -->
      <section v-if="ongletActif === 'toutes'" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <div
          v-for="item in historiqueSessions"
          :key="item.id"
          class="flex flex-col justify-between shadow-[1px_1px_7px_1px_rgba(0,0,0,0.16)] p-4 bg-white rounded-lg hover:shadow-md transition-all cursor-pointer"
          @click="voirDetails(item.session.id)"
        >
          <div>
            <p class="font-bold text-lg font-body text-primary leading-snug mb-1 line-clamp-2">
              {{ item.session.titre }}
            </p>
            <p class="text-xs font-body text-[#6b6b6b] mb-3">
              {{ formatDate(item.session.date_debut) }}
            </p>
            <div class="flex items-center gap-2 text-xs text-gray-400">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>{{ item.session.duree }} min</span>
            </div>
            
           
          </div>

          <div class="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-gray-100">
            <span class="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
              {{ item.statut === 'termine' ? 'Terminé' : item.statut }}
            </span>
            <button
              class="border border-primary text-primary text-xs font-semibold px-4 py-1.5 rounded-md hover:bg-primary hover:text-white transition"
              @click.stop="voirDetails(item.session.id)"
            >
              Voir détails
            </button>
          </div>
        </div>
        
        <div v-if="historiqueSessions.length === 0" class="col-span-full bg-white border border-[#e2ddd4] rounded-lg p-8 text-center">
          <svg class="w-16 h-16 mx-auto text-[#ccc7bc] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          <p class="text-[#6b6b6b]">Aucune session trouvée</p>
          <p class="text-sm text-[#9b9589] mt-1">Vous n'avez pas encore participé à des sessions</p>
        </div>
      </section>

      <!-- Sessions terminées -->
      <section v-if="ongletActif === 'terminees'" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <div
          v-for="item in sessionsTerminees"
          :key="item.id"
          class="flex flex-col justify-between shadow-[1px_1px_7px_1px_rgba(0,0,0,0.16)] p-4 bg-white rounded-lg hover:shadow-md transition-all cursor-pointer"
          @click="voirDetails(item.session.id)"
        >
          <div>
            <p class="font-bold text-lg font-body text-primary leading-snug mb-1 line-clamp-2">
              {{ item.session.titre }}
            </p>
            <p class="text-xs font-body text-[#6b6b6b] mb-3">
              {{ formatDate(item.session.date_debut) }}
            </p>
            <div class="flex items-center gap-2 text-xs text-gray-400">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>{{ item.session.duree }} min</span>
            </div>
           
          </div>

          <div class="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-gray-100">
            <span class="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
              Terminé
            </span>
            <button
              class="border border-primary text-primary text-xs font-semibold px-4 py-1.5 rounded-md hover:bg-primary hover:text-white transition"
              @click.stop="voirDetails(item.session.id)"
            >
              Voir détails
            </button>
          </div>
        </div>
        
        <div v-if="sessionsTerminees.length === 0" class="col-span-full bg-white border border-[#e2ddd4] rounded-lg p-8 text-center">
          <svg class="w-16 h-16 mx-auto text-[#ccc7bc] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          <p class="text-[#6b6b6b]">Aucune session terminée</p>
          <p class="text-sm text-[#9b9589] mt-1">Vous n'avez pas encore de sessions terminées</p>
        </div>
      </section>

      <!-- Sessions publiées (avec notes) -->
      <section v-if="ongletActif === 'publiees'" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <div
          v-for="item in sessionsPubliees"
          :key="item.id"
          class="flex flex-col justify-between shadow-[1px_1px_7px_1px_rgba(0,0,0,0.16)] p-4 bg-white rounded-lg hover:shadow-md transition-all cursor-pointer"
          @click="voirDetails(item.session.id)"
        >
          <div>
            <div class="flex justify-between items-start gap-2">
              <p class="font-bold text-lg font-body text-primary leading-snug mb-1 line-clamp-2 flex-1">
                {{ item.session.titre }}
              </p>
              <span class="text-2xl font-bold text-green-600 whitespace-nowrap">
                {{ item.score }}/20
              </span>
            </div>
            <p class="text-xs font-body text-[#6b6b6b] mb-3">
              {{ formatDate(item.session.date_debut) }}
            </p>
            <div class="flex items-center gap-2 text-xs text-gray-400">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>{{ item.session.duree }} min</span>
            </div>
            <div class="mt-3">
              <div class="flex justify-between items-center text-xs mb-1">
                <span class="text-gray-500">Note /20</span>
                <span class="font-bold" :class="getNoteColor(item.score)">{{ item.score }}/20</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="h-2 rounded-full transition-all duration-500" :class="getProgressBarColor(item.score)" :style="{ width: `${(item.score / 20) * 100}%` }"></div>
              </div>
              <p class="text-xs text-gray-500 mt-2">{{ getMention(item.score) }}</p>
            </div>
          </div>

          <div class="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-gray-100">
            <span class="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
              Publiée
            </span>
            <button
              class="bg-primary text-white text-xs font-semibold px-4 py-1.5 rounded-md hover:bg-primary/80 transition"
              @click.stop="voirDetails(item.session.id)"
            >
              Voir détail
            </button>
          </div>
        </div>
        
        <div v-if="sessionsPubliees.length === 0" class="col-span-full bg-white border border-[#e2ddd4] rounded-lg p-8 text-center">
          <svg class="w-16 h-16 mx-auto text-[#ccc7bc] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
          </svg>
          <p class="text-[#6b6b6b]">Aucune session publiée</p>
          <p class="text-sm text-[#9b9589] mt-1">Aucune note n'a encore été publiée</p>
        </div>
      </section>

    </StudentLayout>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStudent } from '~~/composables/useStudent'
import { useToast } from '~~/composables/useToast'

const { getHistorique } = useStudent()
const toast = useToast()

const loading = ref(true)
const historiqueSessions = ref([])

// Onglets
const onglets = [
  { id: 'toutes', nom: 'Toutes' },
  { id: 'terminees', nom: 'Terminées' },
  { id: 'publiees', nom: 'Publiées' }
]
const ongletActif = ref('toutes')

// Formater la date
const formatDate = (date) => {
  if (!date) return 'Date non définie'
  return new Date(date).toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Statuts et classes
const getStatutTexte = (status) => {
  const map = {
    pending: 'À venir',
    active: 'En cours',
    completed: 'Terminé',
    cancelled: 'Annulé'
  }
  return map[status] || status
}

const getStatutClass = (status) => {
  const map = {
    pending: 'bg-blue-100 text-blue-700',
    active: 'bg-green-100 text-green-700',
    completed: 'bg-gray-100 text-gray-600',
    cancelled: 'bg-red-100 text-red-700'
  }
  return map[status] || 'bg-gray-100 text-gray-600'
}

const getNoteColor = (note) => {
  if (note >= 16) return 'text-green-700'
  if (note >= 14) return 'text-blue-700'
  if (note >= 12) return 'text-cyan-700'
  if (note >= 10) return 'text-yellow-700'
  return 'text-red-700'
}

const getProgressBarColor = (note) => {
  if (note >= 16) return 'bg-green-600'
  if (note >= 14) return 'bg-blue-600'
  if (note >= 12) return 'bg-cyan-600'
  if (note >= 10) return 'bg-yellow-600'
  return 'bg-red-600'
}

const getMention = (note) => {
  if (note >= 16) return '✨ Excellent ! Félicitations !'
  if (note >= 14) return '🌟 Très bien !'
  if (note >= 12) return '👍 Bien'
  if (note >= 10) return '📚 Passable'
  return '💪 À améliorer'
}

// Sessions filtrées
const sessionsFiltrees = computed(() => {
  return historiqueSessions.value
})

const sessionsTerminees = computed(() => {
  return historiqueSessions.value.filter(item => item.statut === 'termine')
})

const sessionsPubliees = computed(() => {
  return historiqueSessions.value.filter(item => item.score > 0)
})

// Actions
const rejoindreSession = (session) => {
  navigateTo(`/students/join?sessionId=${session.id}&code=${session.code}`)
}

const voirDetails = (sessionId) => {
  navigateTo(`/students/sessions/${sessionId}/resultats`)
}

// Charger l'historique
const loadHistorique = async () => {
  loading.value = true
  const result = await getHistorique()
  if (result.success) {
    historiqueSessions.value = result.data || []
  } else {
    toast.error(result.message || 'Erreur lors du chargement de l\'historique')
  }
  loading.value = false
}

onMounted(() => {
  loadHistorique()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

button {
  position: relative;
}

.bg-white {
  transition: all 0.3s ease;
}

.bg-white:hover {
  transform: translateY(-2px);
}
</style>