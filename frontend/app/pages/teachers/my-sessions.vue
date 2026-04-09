<template>
  <div class="bg-[#f5f0e8] font-body min-h-screen">
    <TeacherLayout>
      <div class="max-w-7xl mx-auto   py-4 sm:py-5">
        
        <!-- ==================== EN-TÊTE ==================== -->
        <div class="mb-8">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 class="font-body text-2xl font-extrabold text-[#1e3a2f] ">
                Mes sessions
              </h2>
              <!-- <p class="text-black text-sm">
                Gérez vos sessions et suivez les résultats
              </p> -->
            </div>
            <NuxtLink 
              to="/teachers/create-session"
              class="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/80 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              Créer une session
            </NuxtLink>
          </div>
        </div>

        <!-- ==================== BARRE DE RECHERCHE ET FILTRES ==================== -->
        <div class="bg-white shadow-[1px_1px_2px_1px_rgba(0,0,0,0.16)]   mb-6">
          <div class="p-2 px-4 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
            <!-- Recherche -->
            <div class="relative flex-1 max-w-md">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9b9589]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input 
                v-model="searchQuery"
                type="text"
                placeholder="Rechercher un QCM..."
                class="'w-full pl-11 w-100 pr-4 py-3 text-sm text-gray-800 placeholder-gray-600 bg-input font-body rounded-xl focus:bg-input focus:outline-none transition-all duration-200"
              >
            </div>
            
            <!-- Filtres -->
            <div class="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
              <button 
                v-for="status in statusFilters" 
                :key="status.value"
                @click="filterStatus = status.value"
                class="px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all"
                :class="filterStatus === status.value 
                  ? 'bg-secondary text-white' 
                  : 'bg-[#f5f0e8] text-[#1e3a2f] hover:bg-[#e2ddd4]'"
              >
                {{ status.label }}
                <span class="ml-1 text-xs opacity-75">({{ getCountByStatus(status.value) }})</span>
              </button>
            </div>
          </div>
        </div>

        <!-- ==================== LOADING ==================== -->
        <div v-if="loading" class="bg-white shadow-[1px_1px_7px_1px_rgba(0,0,0,0.16)] border border-[#e2ddd4] rounded-lg p-12 text-center">
            <SpinnerDark />
        </div>

        <!-- ==================== AUCUN RÉSULTAT ==================== -->
        <div v-else-if="filteredQCMs.length === 0" class="bg-white shadow-[1px_1px_7px_1px_rgba(0,0,0,0.16)] border border-[#e2ddd4] rounded-lg p-12 text-center">
          <svg class="w-20 h-20 mx-auto mb-4 text-[#9b9589] opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          <h3 class="text-lg font-bold text-[#1e3a2f] mb-2">Aucun QCM trouvé</h3>
          <p class="text-[#9b9589] text-sm mb-6">
            {{ searchQuery || filterStatus !== 'all' ? 'Aucun résultat pour cette recherche' : 'Vous n\'avez pas encore créé de QCM' }}
          </p>
          <NuxtLink 
            v-if="!searchQuery && filterStatus === 'all'"
            to="/teachers/create-session"
            class="px-5 py-2.5 bg-[#4a7c5e] text-white rounded-xl text-sm font-semibold hover:bg-[#1e3a2f] transition-colors inline-flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Créer mon premier QCM
          </NuxtLink>
        </div>

        <!-- ==================== LISTE DES QCM (STYLE GMAIL) ==================== -->
        <div v-else class="bg-white shadow-[1px_1px_7px_1px_rgba(0,0,0,0.16)] overflow-hidden">
          
          <!-- En-tête des colonnes (caché sur mobile) -->
         <div class="hidden md:grid md:grid-cols-12 gap-3 px-4 py-2 bg-primary border-b border-[#e2ddd4] text-sm font-body font-semibold text-white font-bold uppercase tracking-wider">
  <div class="col-span-3">Titre</div>
  <div class="col-span-2">Cible</div>
  <div class="col-span-2">Date</div>
  <div class="col-span-2">Questions</div>
  <div class="col-span-1">Statut</div>
  <div class="col-span-2 text-right">Actions</div>
</div>

         <!-- Lignes -->
<div 
  v-for="qcm in filteredQCMs" 
  :key="qcm.id"
  class="group border-b border-[#e2ddd4] transition-all duration-200 hover:bg-[#f5f0e8]/30 cursor-pointer last:border-b-0"
  @click="viewQCM(qcm.id)"
>
  <div class="px-4 py-4 md:grid md:grid-cols-12 md:gap-3">
    
    <!-- Titre (col-span-3) -->
    <div class="flex items-start gap-3 md:col-span-3">
      <div class="flex-shrink-0 mt-0.5">
        <div class="w-8 h-8 rounded-lg bg-[#4a7c5e]/10 flex items-center justify-center">
          <svg class="w-4 h-4 text-[#4a7c5e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
        </div>
      </div>
      <div class="flex-1 min-w-0">
        <h3 class="font-semibold font-body text-[#1e3a2f] truncate group-hover:text-[#4a7c5e] transition-colors">
          {{ qcm.titre }}
        </h3>
        <p class="text-xs text-gray-800 mt-0.5 line-clamp-1 md:hidden">
          {{ qcm.classe?.nom }} - {{ qcm.filiere?.nom }}
        </p>
      </div>
    </div>

    <!-- Cible (col-span-2) -->
    <div class="hidden md:flex md:col-span-2 items-center text-sm text-[#1e3a2f]">
      <div class="flex flex-col bg-gray-200 px-2 py-1 rounded-full">
        <span class="text-sm font-bold">{{ qcm.classe?.nom || '—' }}</span>
      </div>
    </div>

    <!-- Date (col-span-2) -->
    <div class="hidden md:flex md:col-span-2 flex-col justify-center text-sm text-[#1e3a2f]">
      <div class="flex items-center gap-1">
        <svg class="w-3 h-3 text-[#9b9589]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
        <span>{{ formatDateShort(qcm.date_debut) }}</span>
      </div>
      <span class="text-xs text-[#9b9589]">{{ formatTime(qcm.date_debut) }}</span>
    </div>

    <!-- Questions (col-span-2) -->
    <div class="hidden md:flex md:col-span-2 items-center gap-1 text-sm text-[#1e3a2f]">
      <svg class="w-4 h-4 text-[#9b9589]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <span>{{ qcm.questions?.length || 0 }}</span>
    </div>

    <!-- Statut et actions -->
    <div class="flex items-center justify-between md:col-span-3 mt-3 md:mt-0">
      <div>
        <span 
          class="inline-flex px-2 py-1  text-xs rounded-full font-medium"
          :class="getStatusClass(qcm.status)"
        >
          {{ getStatusText(qcm.status) }}
        </span>
      </div>

      <!-- Actions (visible sur mobile) -->
      <div class="flex items-center gap-1 md:hidden" @click.stop>
        <button 
          @click.stop="viewQCM(qcm.id)"
          class="p-2 text-[#4a7c5e] hover:bg-[#e2ddd4] bg-[#e2ddd4] rounded-lg transition-colors"
          title="Voir les détails"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
          </svg>
        </button>
        <button 
          v-if="qcm.status === 'pending'"
          @click.stop="startSessionHandler(qcm.id)"
          class="p-2 text-green-600 bg-[#e2ddd4] hover:bg-green-50 rounded-lg transition-colors"
          title="Démarrer la session"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </button>
        <button 
          @click.stop="deleteQCMHandler(qcm.id)"
          class="p-2 text-red-500 bg-[#e2ddd4] hover:bg-red-50 rounded-lg transition-colors"
          title="Supprimer"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
        </button>
      </div>

      <!-- Actions (desktop, TOUJOURS VISIBLES) -->
      <div class="hidden md:flex items-center gap-1" @click.stop>
        <button 
          @click.stop="viewQCM(qcm.id)"
          class="p-2 text-[#4a7c5e] hover:bg-[#e2ddd4] bg-gray-200 rounded-lg transition-colors"
          title="Voir les détails"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
          </svg>
        </button>
        <button 
          v-if="qcm.status === 'pending'"
          @click.stop="startSessionHandler(qcm.id)"
          class="p-2 text-green-600 hover:bg-green-50 bg-gray-200 rounded-lg transition-colors"
          title="Démarrer la session"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </button>
        <button 
          @click.stop="deleteQCMHandler(qcm.id)"
          class="p-2 text-red-500 hover:bg-red-50 bg-gray-200 rounded-lg transition-colors"
          title="Supprimer"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
        </button>
      </div>
    </div>
  </div>

  <!-- Infos supplémentaires sur mobile -->
  <div class="px-4 pb-4 flex flex-wrap gap-2 font-secondary text-sm text-gray-700 border-t border-[#e2ddd4] pt-3 md:hidden">
    <div class="flex items-center gap-1">
      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
      </svg>
      <span>{{ formatDateTime(qcm.date_debut) }}</span>
    </div>
    <!-- <div class="flex items-center gap-1">
      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
      </svg>
      <span>{{ qcm.classe?.nom || '—' }} - {{ qcm.filiere?.nom || '—' }}</span>
    </div> -->
    <div class="flex items-center gap-1">
      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <!-- <span class="">{{ qcm.questions?.length || 0 }} questions</span> -->
    </div>
    <div class="flex items-center bg-secondary rounded-full  px-1.5 text-white  gap-1">
      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <span>{{ qcm.duree }} min</span>
    </div>
  </div>
</div>
        </div>

        <!-- ==================== MODAL DE SUPPRESSION ==================== -->
        <div v-if="deleteModalVisible" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="deleteModalVisible = false">
          <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div class="border-b border-[#e2ddd4] p-4">
              <h3 class="text-lg font-bold text-[#1e3a2f]">Confirmer la suppression</h3>
            </div>
            <div class="p-6">
              <p class="text-[#1e3a2f] mb-6">
                Êtes-vous sûr de vouloir supprimer ce QCM ? Cette action est irréversible.
              </p>
              <div class="flex gap-3 justify-end">
                <button 
                  @click="deleteModalVisible = false"
                  class="px-4 py-2 border border-[#e2ddd4] rounded-lg text-sm font-semibold text-[#1e3a2f] hover:bg-[#f5f0e8] transition-colors"
                >
                  Annuler
                </button>
                <button 
                  @click="confirmDelete"
                  :disabled="deleting"
                  class="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {{ deleting ? 'Suppression...' : 'Supprimer' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TeacherLayout>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTeacher } from '../../../composables/useTeacher'
import { useToast } from '../../../composables/useToast'

const { getQCMList, deleteQCM, startSession } = useTeacher()
const toast = useToast()

const loading = ref(true)
const qcms = ref([])
const searchQuery = ref('')
const filterStatus = ref('all')
const deleteModalVisible = ref(false)
const deleting = ref(false)
const qcmToDelete = ref(null)

const statusFilters = [
  { value: 'all', label: 'Tous' },
  { value: 'pending', label: 'Programmés' },
  { value: 'active', label: 'En cours' },
  { value: 'completed', label: 'Terminés' }
]

const filteredQCMs = computed(() => {
  let result = qcms.value
  
  if (filterStatus.value !== 'all') {
    result = result.filter(q => q.status === filterStatus.value)
  }
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(q => 
      q.titre.toLowerCase().includes(query) ||
      q.description?.toLowerCase().includes(query)
    )
  }
  
  return result
})

const getCountByStatus = (status) => {
  return qcms.value.filter(q => q.status === status).length
}

const getStatusText = (status) => {
  const statusMap = {
    pending: 'Programmé',
    active: 'En cours',
    completed: 'Terminé',
    draft: 'Brouillon'
  }
  return statusMap[status] || status
}

const getStatusClass = (status) => {
  const classMap = {
    pending: 'bg-yellow-100 text-yellow-800',
    active: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800',
    draft: 'bg-blue-100 text-blue-800'
  }
  return classMap[status] || 'bg-gray-100 text-gray-800'
}

const formatDateShort = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short'
  })
}

const formatTime = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDateTime = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const loadQCMs = async () => {
  loading.value = true
  const result = await getQCMList()
  if (result.success) {
    qcms.value = result.data
  } else {
    toast.error('Erreur lors du chargement des QCM')
  }
  loading.value = false
}

const viewQCM = (id) => {
  navigateTo(`/teachers/qcm/${id}`)
}

const startSessionHandler = async (id) => {
  const result = await startSession(id)
  if (result.success) {
    toast.success('Session démarrée !')
    await loadQCMs()
  } else {
    toast.error(result.message || 'Erreur lors du démarrage')
  }
}

const deleteQCMHandler = (id) => {
  qcmToDelete.value = id
  deleteModalVisible.value = true
}

const confirmDelete = async () => {
  if (!qcmToDelete.value) return
  
  deleting.value = true
  const result = await deleteQCM(qcmToDelete.value)
  
  if (result.success) {
    toast.success('QCM supprimé avec succès')
    await loadQCMs()
  } else {
    toast.error(result.message || 'Erreur lors de la suppression')
  }
  
  deleting.value = false
  deleteModalVisible.value = false
  qcmToDelete.value = null
}

onMounted(() => {
  loadQCMs()
})
</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>