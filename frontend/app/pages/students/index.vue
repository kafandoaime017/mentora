<template>
  <div class="bg-[#f5f0e8] font-body min-h-screen">
    <StudentLayout>

      <!-- Indicateur de connexion WebSocket -->
      <!-- <div class="flex justify-end mb-2">
        <div class="flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm text-xs">
          <div 
            class="w-2 h-2 rounded-full"
            :class="isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'"
          ></div>
          <span class="text-gray-500">
            {{ isConnected ? 'Connecté en temps réel' : 'Connexion en cours...' }}
          </span> 
        </div>
      </div> -->

      <!-- En-tête avec infos étudiant -->
      <div class="p-4 bg-white rounded-lg mb-5">
        <p class="text-2xl font-extrabold text-black font-body leading-tight m-0 mb-1">
          Bonjour {{ user?.prenom }} 👋
        </p>
        <p class="font-light font-body text-[0.85rem] text-gray-600">
          <span class="font-bold">{{ user?.profil?.filiere || 'Non définie' }}</span> 
          à 
          <span class="font-bold">{{ user?.profil?.ecole || 'Non définie' }}</span>
        </p>
      </div>

      <!-- Mes sessions à venir -->
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
        <div class="animate-spin rounded-full h-8 w-8 border-2 border-[#4a7c5e] border-t-transparent"></div>
      </div>

      <!-- Aucune session -->
      <div v-else-if="sessions.length === 0" class="bg-white rounded-lg p-8 text-center shadow">
        <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
        <p class="text-gray-500">Aucune session programmée pour le moment</p>
      </div>

      <!-- Liste des sessions -->
      <section class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <div
          v-for="session in sessions"
          :key="session.id"
          class="flex flex-col justify-between shadow-[1px_1px_7px_1px_rgba(0,0,0,0.16)] p-4 bg-white rounded-lg transition-all duration-200"
          :class="{ 'ring-2 ring-green-500 animate-pulse': session.isNew }"
        >
          <!-- Badge Nouveau -->
          <div v-if="session.isNew" class="absolute -top-2 -right-2">
            <span class="bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-bounce">
              NOUVEAU
            </span>
          </div>

          <!-- Titre -->
          <div>
            <p class="font-bold text-lg font-body text-primary leading-snug mb-1 line-clamp-2">
              {{ session.titre }}
            </p>
            <p class="text-[0.78rem] font-body text-[#6b6b6b] mb-2 flex items-center gap-1">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              {{ formatDateTime(session.date_debut) }}
            </p>
            <p class="text-xs text-gray-600 font-body flex items-center gap-1">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              Durée: {{ session.duree }} minutes
            </p>
            <p v-if="session.professeur" class="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

            <button
              v-if="session.status == 'active'"
              class="bg-primary text-white text-[0.8rem] font-semibold px-4 py-1.5 rounded-md hover:bg-primary/80 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
const { getAvailableSessions } = useStudent()
const { connect, disconnect, isConnected, onNewSession } = useWebSocket()
const toast = useToast()

const user = ref(null)
const sessions = ref([])
const loading = ref(true)
const etudiantProfil = ref(null)

// Récupérer l'utilisateur depuis localStorage
const loadUser = () => {
  user.value = getUser()
  console.log('Utilisateur connecté :', user.value)
}

const formatDateTime = (date) => {
  if (!date) return 'Date non définie'
  return new Date(date).toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusText = (status) => {
  const statusMap = {
    pending: 'Programmée',
    active: 'En cours',
    completed: 'Terminée',
    cancelled: 'Annulée'
  }
  return statusMap[status] || status
}

const getStatusClass = (status) => {
  const classMap = {
    pending: 'bg-yellow-100 text-yellow-700',
    active: 'bg-green-200 text-green-800',
    completed: 'bg-gray-100 text-gray-600',
    cancelled: 'bg-red-100 text-red-700'
  }
  return classMap[status] || 'bg-gray-100 text-gray-600'
}

const rejoindreSession = (session) => {
  navigateTo(`/students/join-session?code=${session.code}`)
}

const loadSessions = async () => {
  loading.value = true
  const result = await getAvailableSessions()
  if (result.success) {
    sessions.value = result.data || []
  } else {
    toast.error(result.message || 'Erreur lors du chargement des sessions')
  }
  loading.value = false
}

const loadProfil = async () => {
  try {
    const { data } = await useFetch('/api/students/profil')
    if (data.value?.success) {
      etudiantProfil.value = data.value.data
      console.log('Profil étudiant:', etudiantProfil.value)
    }
  } catch (error) {
    console.error('Erreur chargement profil:', error)
  }
}

// Gérer l'arrivée d'une nouvelle session
const handleNewSession = (data) => {
  console.log('Vous avez reçu une nouvelle session :', data)
  
  const newSession = data.session
  
  // Vérifier si la session existe déjà
  const exists = sessions.value.some(s => s.id === newSession.id)
  
  if (!exists) {
    // Ajouter un flag pour l'animation
    newSession.isNew = true
    
    // Ajouter la session au début de la liste
    sessions.value.unshift(newSession)
    
    // Supprimer le flag après 5 secondes
    setTimeout(() => {
      const sessionIndex = sessions.value.findIndex(s => s.id === newSession.id)
      if (sessionIndex !== -1) {
        sessions.value[sessionIndex].isNew = false
      }
    }, 5000)
    
    // Afficher une notification toast
    toast.success(data.message)
      
    
    // Jouer un son (optionnel)
    // const audio = new Audio('/notification.mp3')
    // audio.play()
  }
}

onMounted(async () => {
  loadUser()
  await loadProfil()
  await loadSessions()
  
  // Connecter WebSocket si l'étudiant a un profil
  if (user.value?.id && etudiantProfil.value) {
    console.log('🔌 Connexion WebSocket...')
    connect(
      user.value.id,
      'etudiant',
      etudiantProfil.value.classeId,
      etudiantProfil.value.filiereId
    )
    
    // Écouter les nouvelles sessions
    onNewSession(handleNewSession)
  }
})

onUnmounted(() => {
  disconnect()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Animation pour les nouvelles sessions */
@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4);
  }
  50% {
    box-shadow: 0 0 0 4px rgba(34, 197, 94, 0);
  }
}

.ring-2 {
  animation: pulse 1.5s ease-in-out;
}

.animate-bounce {
  animation: bounce 0.5s ease-in-out 2;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}
</style>