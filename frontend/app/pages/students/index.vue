<template>
  <div class="bg-[#f5f0e8] font-body min-h-screen">
    <StudentLayout>

      <!-- En-tête avec infos étudiant -->
      <!-- <div class="p-4 bg-white rounded-lg mb-5">
        <p class="text-2xl font-extrabold text-black font-body leading-tight m-0 mb-1">
          Bonjour {{ user?.prenom }} 👋
        </p>
        <p class="font-light font-body text-[0.85rem] text-gray-600">
          <span class="font-bold">{{ user?.profil?.filiere || 'Non définie' }}</span>
          à
          <span class="font-bold">{{ user?.profil?.ecole || 'Non définie' }}</span>
        </p>
      </div> -->
        <p class="text-2xl font-extrabold text-black font-body leading-tight m-0 mb-1">
          Bonjour {{ user?.prenom }} 👋
        </p>

      <!-- Titre + lien voir tout -->
      <div class="flex items-center justify-between">
        <h2 class="font-body text-xl my-4 font-bold text-[#1e3a2f]">
          Mes sessions en cours et à venir
        </h2>
        <NuxtLink
          v-if="sessions.length > 3"
          to="/students/sessions"
          class="text-xs font-medium text-primary hover:underline"
        >
          Voir tout
        </NuxtLink>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-2 border-[#4a7c5e] border-t-transparent" />
      </div>

      <!-- Aucune session -->
      <div v-else-if="sessions.length === 0" class="bg-white rounded-lg p-8 text-center shadow">
        <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
        <p class="text-gray-500 font-body">Aucune session programmée pour le moment</p>
      </div>

      <!-- Liste des sessions -->
      <section v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <div
          v-for="session in sessions"
          :key="session.id"
          class="relative flex flex-col justify-between shadow-[1px_1px_7px_1px_rgba(0,0,0,0.16)] p-4 bg-white rounded-lg transition-all duration-200"
          :class="{ 'ring-2 ring-green-500': session.isNew }"
        >
          <!-- Badge Nouveau -->
          <div v-if="session.isNew" class="absolute -top-2 -right-2 z-10">
            <span class="bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-bounce">
              NOUVEAU
            </span>
          </div>

          <!-- Contenu -->
          <div>
            <p class="font-bold text-lg font-body text-primary leading-snug mb-1 line-clamp-2">
              {{ session.titre }}
            </p>
            <p class="text-[0.78rem] font-body text-[#6b6b6b] mb-2 flex items-center gap-1">
              <svg class="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              {{ formatDateTime(session.date_debut) }}
            </p>
            <p class="text-xs text-gray-600 font-body flex items-center gap-1">
              <svg class="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            Durée: {{ formatDuree(session.duree) }}
            </p>
            <p v-if="session.professeur" class="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <svg class="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              {{ session.professeur }}
            </p>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-between gap-2 mt-2 pt-3 border-t border-gray-100">
            <span
              class="inline-block px-3 py-0.5 font-body rounded-full text-[0.70rem] font-bold"
              :class="getStatusClass(session.status)"
            >
              {{ getStatusText(session.status) }}
            </span>

            <!-- Déjà complété -->
            <span
              v-if="aDejaParticipe(session.id)"
              class="flex items-center gap-1 text-xs font-body text-green-700 font-semibold"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              Déjà complété
            </span>

            <!-- Rejoindre -->
            <button
              v-else-if="session.status === 'active'"
              class="bg-primary text-white text-[0.8rem] font-semibold px-4 py-1.5 rounded-md hover:bg-primary/80 transition"
              @click="rejoindreSession(session)"
            >
              Rejoindre
            </button>
          </div>
        </div>
      </section>

    </StudentLayout>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuth } from '~~/composables/useAuth'
import { useStudent } from '~~/composables/useStudent'
import { useToast } from '~~/composables/useToast'
import { useWebSocket } from '~~/composables/useWebSocket'

const { getUser } = useAuth()
const { getAvailableSessions, getHistorique } = useStudent()
const { connect, disconnect, onNewSession, onSessionStarted, onSessionCompleted } = useWebSocket()
const toast = useToast()

const user              = ref(null)
const sessions          = ref([])
const loading           = ref(true)
const etudiantProfil    = ref(null)
const sessionsTerminees = ref(new Set())

// ─── Utils ────────────────────────────────────────────────────────────────────

const loadUser = () => {
  user.value = getUser()
}

const formatDateTime = (date) => {
  if (!date) return 'Date non définie'
  return new Date(date).toLocaleString('fr-FR', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
  })
}

const formatDuree = (minutes) => {
  if (!minutes && minutes !== 0) return '—'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}min`
  if (m === 0) return `${h}h`
  return `${h}h${m}min`
}

const getStatusText = (status) => ({
  pending:   'Programmée',
  active:    'En cours',
  completed: 'Terminée',
  cancelled: 'Annulée'
})[status] || status

const getStatusClass = (status) => ({
  pending:   'bg-yellow-100 text-yellow-700',
  active:    'bg-green-200 text-green-800',
  completed: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-700'
})[status] || 'bg-gray-100 text-gray-600'

const aDejaParticipe = (sessionId) => sessionsTerminees.value.has(sessionId)

const rejoindreSession = (session) => {
  navigateTo(`/students/join-session`)
}

// ─── Chargement ───────────────────────────────────────────────────────────────

const loadSessions = async () => {
  loading.value = true

  const [sessionsResult, historiqueResult] = await Promise.all([
    getAvailableSessions(),
    getHistorique()
  ])

  if (sessionsResult.success) {
    sessions.value = sessionsResult.data || []
  } else {
    toast.error(sessionsResult.message || 'Erreur chargement sessions')
  }

  if (historiqueResult.success) {
    const ids = (historiqueResult.data || [])
      .filter(item => item.statut === 'termine')
      .map(item => item.session.id)
    sessionsTerminees.value = new Set(ids)
  }

  loading.value = false
}

const loadProfil = async () => {
  try {
    const { data } = await useFetch('/api/students/profil')
    if (data.value?.success) etudiantProfil.value = data.value.data
  } catch (e) {
    console.error('Erreur chargement profil:', e)
  }
}

// ─── WebSocket ────────────────────────────────────────────────────────────────

const handleNewSession = (data) => {
  const newSession = data.session
  const exists = sessions.value.some(s => s.id === newSession.id)
  if (!exists) {
    newSession.isNew = true
    sessions.value.unshift(newSession)
    setTimeout(() => {
      const idx = sessions.value.findIndex(s => s.id === newSession.id)
      if (idx !== -1) sessions.value[idx].isNew = false
    }, 5000)
    toast.success(data.message || 'Nouvelle session disponible')
  }
}

const handleSessionStarted = (data) => {
  const idx = sessions.value.findIndex(s => s.id === (data.sessionId || data.session?.id))
  if (idx !== -1) {
    sessions.value[idx] = { ...sessions.value[idx], status: 'active' }
  } else if (data.session) {
    sessions.value.unshift({ ...data.session, isNew: true })
    setTimeout(() => {
      const i = sessions.value.findIndex(s => s.id === data.session.id)
      if (i !== -1) sessions.value[i].isNew = false
    }, 5000)
  }
  toast.success(data.message || 'Une session vient de démarrer !')
}

const handleSessionCompleted = (data) => {
  const idx = sessions.value.findIndex(s => s.id === data.sessionId)
  if (idx !== -1) sessions.value.splice(idx, 1)
  toast.info(data.message || 'Une session est maintenant terminée.')
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────

onMounted(async () => {
  loadUser()
  await loadProfil()
  await loadSessions()

  if (user.value?.id && etudiantProfil.value) {
    connect(user.value.id, 'etudiant', etudiantProfil.value.classeId, etudiantProfil.value.filiereId)
    onNewSession(handleNewSession)
    onSessionStarted(handleSessionStarted)
    onSessionCompleted(handleSessionCompleted) // ← AJOUTE
  }
})

onUnmounted(() => disconnect())
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-5px); }
}

.animate-bounce {
  animation: bounce 0.5s ease-in-out 2;
}
</style>