<template>
  <div class="bg-[#f5f0e8] font-body min-h-screen">
    <TeacherLayout>
      <!-- Message non autorisé -->
      <div v-if="!isAuthorized && !loading" class="max-w-4xl mx-auto py-3">
        <div class="bg-white rounded-lg shadow-sm p-12 text-center">
          <!-- <div class="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg class="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m0 0v2m0-2h2m-2 0H8m12-4a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div> -->
          <h2 class="text-2xl font-body font-bold text-red-600 mb-3">Accès non autorisé</h2>
          <p class="text-gray-600 font-body mb-6">{{ errorMessage }}</p>
          <div class="flex gap-3 justify-center">
            <button @click="$router.back()" class="px-6 font-body py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
              Retour
            </button>
            <button @click="$router.push('/teacher/qcm')" class="px-6 font-body py-2 bg-[#4a7c5e] text-white rounded-lg hover:bg-[#1e3a2f] transition-colors">
              Mes sessions
            </button>
          </div>
        </div>
      </div>

      <!-- Contenu principal -->
      <div v-else-if="!loading && isAuthorized" class="max-w-4xl mx-auto py-3">
        <!-- En-tête -->
        <div class="mb-8">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="font-body text-2xl font-extrabold text-[#1e3a2f] mb-2">
                Modifier la session de QCM
              </h2>
              <p class="text-sm text-[#9b9589]">
                Statut : 
                <span :class="getStatusClass(sessionData?.status)" class="inline-flex px-2 py-0.5 rounded-full text-xs font-medium">
                  {{ getStatusText(sessionData?.status) }}
                </span>
              </p>
            </div>
            <button 
              @click="$router.back()"
              class="text-[#4a7c5e] bg-gray-200 hover:bg-gray-300 font-body font-bold px-4 py-2 rounded-lg hover:text-[#1e3a2f] transition-colors"
            >
              ← Retour
            </button>
          </div>
        </div>

        <!-- Message si non modifiable -->
        <div v-if="!canModify" class="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded">
          <p class="font-bold font-body">⚠️ Session non modifiable</p>
          <p class="text-sm font-body">Seules les sessions programmées (PENDING) peuvent être modifiées.</p>
        </div>

        <!-- Formulaire -->
        <form @submit.prevent="submitUpdate" class="space-y-6">
          <!-- INFORMATIONS GÉNÉRALES -->
          <div class="bg-white font-body shadow-[1px_1px_7px_1px_rgba(0,0,0,0.16)] overflow-hidden rounded-lg">
            <div class="border-b border-[#e2ddd4] p-4 bg-[#f5f0e8]/30">
              <h3 class="font-['Roboto'] text-lg font-bold text-[#1e3a2f]">
                Informations générales
              </h3>
            </div>
            
            <div class="p-3 md:p-6 space-y-4">
              <div>
                <label class="block text-sm font-semibold text-[#1e3a2f] mb-2">
                  Titre <span class="text-red-500">*</span>
                </label>
                <input 
                  v-model="form.titre"
                  type="text"
                  :disabled="!canModify"
                  class="w-full font-body pl-4 pr-4 py-3 text-sm text-gray-800 placeholder-gray-600 bg-input rounded-xl focus:bg-input focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Ex: Examen JavaScript"
                  required
                >
              </div>
              
              <div>
                <label class="block text-sm font-semibold text-[#1e3a2f] mb-2">
                  Thème
                </label>
                <input 
                  v-model="form.theme"
                  type="text"
                  :disabled="!canModify"
                  class="w-full font-body pl-4 pr-4 py-3 text-sm text-gray-800 placeholder-gray-600 bg-input rounded-xl focus:bg-input focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Ex: JavaScript Fondamentaux"
                >
              </div>
              
              <div>
                <label class="block text-sm font-semibold text-[#1e3a2f] mb-2">
                  Description
                </label>
                <textarea 
                  v-model="form.description"
                  rows="3"
                  :disabled="!canModify"
                  class="w-full font-body pl-4 pr-4 py-3 text-sm text-gray-800 placeholder-gray-600 bg-input rounded-xl focus:bg-input focus:outline-none resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Décrivez l'objectif de cette évaluation..."
                ></textarea>
              </div>
            </div>
          </div>

          <!-- PLANIFICATION -->
          <div class="bg-white shadow-[1px_1px_7px_1px_rgba(0,0,0,0.16)] overflow-hidden rounded-lg">
            <div class="border-b border-[#e2ddd4] p-4 bg-[#f5f0e8]/30">
              <h3 class="font-['Roboto'] text-lg font-bold text-[#1e3a2f]">
                Planification
              </h3>
            </div>
            
            <div class="p-3 md:p-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-[#1e3a2f] mb-2">
                    Date et heure de début <span class="text-red-500">*</span>
                  </label>
                  <input 
                    ref="dateDebutInput"
                    type="text"
                    :disabled="!canModify"
                    class="w-full font-body pl-4 pr-4 py-3 text-sm text-gray-800 placeholder-gray-600 bg-input rounded-xl focus:bg-input focus:outline-none cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Sélectionner la date et l'heure"
                    readonly
                  >
                  <p class="text-xs text-[#9b9589] mt-1">
                    {{ formattedDateDebut }}
                  </p>
                </div>
                
                <div>
                  <label class="block text-sm font-semibold text-[#1e3a2f] mb-2">
                    Date et heure de fin <span class="text-red-500">*</span>
                  </label>
                  <input 
                    ref="dateFinInput"
                    type="text"
                    :disabled="!canModify"
                    class="w-full font-body pl-4 pr-4 py-3 text-sm text-gray-800 placeholder-gray-600 bg-input rounded-xl focus:bg-input focus:outline-none cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Sélectionner la date et l'heure"
                    readonly
                  >
                  <p class="text-xs text-[#9b9589] mt-1">
                    {{ formattedDateFin }}
                  </p>
                </div>
                
                <div>
                  <label class="block text-sm font-semibold text-[#1e3a2f] mb-2">
                    Durée (minutes)
                  </label>
                  <input 
                    :value="form.duree"
                    type="number"
                    disabled
                    class="w-full font-body pl-4 pr-4 py-3 text-sm text-gray-800 bg-gray-100 rounded-xl cursor-not-allowed opacity-75"
                  >
                  <p class="text-xs text-[#9b9589] mt-1">
                    Durée calculée automatiquement entre les dates
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- CIBLE -->
          <div class="bg-white shadow-[1px_1px_7px_1px_rgba(0,0,0,0.16)] overflow-hidden rounded-lg">
            <div class="border-b border-[#e2ddd4] p-4 bg-[#f5f0e8]/30">
              <h3 class="font-['Roboto'] text-lg font-bold text-[#1e3a2f]">
                Cible de la session
              </h3>
            </div>
            
            <div class="p-3 md:p-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-[#1e3a2f] mb-2">
                    Filière <span class="text-red-500">*</span>
                  </label>
                  <select 
                    v-model="form.filiere_id"
                    @change="onFiliereChange"
                    :disabled="!canModify"
                    class="w-full font-body pl-4 pr-4 py-3 text-sm text-gray-800 bg-input rounded-xl focus:bg-input focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                    required
                  >
                    <option value="">Sélectionner une filière</option>
                    <option v-for="filiere in filieres" :key="filiere.id" :value="filiere.id">
                      {{ filiere.nom }}
                    </option>
                  </select>
                  <p class="text-xs text-[#9b9589] mt-1">
                    Vous ne pouvez créer une session que pour votre propre filière
                  </p>
                </div>
                
                <div>
                  <label class="block text-sm font-semibold text-[#1e3a2f] mb-2">
                    Classe <span class="text-red-500">*</span>
                  </label>
                  <select 
                    v-model="form.classe_id"
                    :disabled="!canModify || !form.filiere_id"
                    class="w-full font-body pl-4 pr-4 py-3 text-sm text-gray-800 bg-input rounded-xl focus:bg-input focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                    required
                  >
                    <option value="">Sélectionner une classe</option>
                    <option v-for="classe in classes" :key="classe.id" :value="classe.id">
                      {{ classe.nom }}
                    </option>
                  </select>
                  <p class="text-xs text-[#9b9589] mt-1">
                    Seuls les étudiants de cette classe pourront rejoindre
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- QUESTIONS -->
          <div class="bg-white shadow-[1px_1px_7px_1px_rgba(0,0,0,0.16)] overflow-hidden rounded-lg">
            <div class="border-b border-[#e2ddd4] p-4 bg-[#f5f0e8]/30 flex justify-between items-center">
              <h3 class="font-['Roboto'] text-lg font-bold text-[#1e3a2f]">
                Questions ({{ form.questions.length }})
              </h3>
              <button 
                v-if="canModify"
                type="button"
                @click="addQuestion"
                class="px-4 py-2 bg-[#4a7c5e] text-white text-sm font-semibold hover:bg-[#1e3a2f] transition-colors rounded-lg"
              >
                + Ajouter une question
              </button>
            </div>
            
            <div class="p-3 md:p-6">
              <div v-if="form.questions.length === 0" class="text-center py-12 text-[#9b9589]">
                <svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <p>Aucune question</p>
                <p class="text-sm mt-1">Cliquez sur "Ajouter une question" pour commencer</p>
              </div>
              
              <div v-else class="space-y-6">
                <div 
                  v-for="(question, index) in form.questions" 
                  :key="index"
                  class="overflow-hidden bg-[#f5f0e8]/20 rounded-lg border border-[#e2ddd4]"
                >
                  <div class="bg-[#f5f0e8]/50 p-4 flex justify-between items-center border-b border-[#e2ddd4]">
                    <h4 class="font-['Roboto'] font-bold text-[#1e3a2f]">
                      Question {{ index + 1 }}
                    </h4>
                    <button 
                      v-if="canModify"
                      type="button"
                      @click="removeQuestion(index)"
                      class="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                  
                  <div class="p-4 space-y-4">
                    <div>
                      <label class="block text-sm font-semibold text-[#1e3a2f] mb-2">Texte de la question</label>
                      <textarea 
                        v-model="question.texte"
                        rows="2"
                        :disabled="!canModify"
                        class="w-full font-body pl-4 pr-4 py-3 text-sm text-gray-800 placeholder-gray-600 bg-input rounded-xl focus:bg-input focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                        placeholder="Ex: Qu'est-ce que JavaScript ?"
                      ></textarea>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <label class="block text-sm font-semibold text-[#1e3a2f] mb-2">Type</label>
                        <select 
                          v-model="question.type"
                          :disabled="!canModify"
                          class="w-full font-body pl-4 pr-4 py-3 text-sm text-gray-800 bg-input rounded-xl focus:bg-input focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                          <option value="qcm">QCM (une seule réponse)</option>
                          <option value="qcm_multiple">QCM multiple</option>
                          <option value="vrai_faux">Vrai / Faux</option>
                        </select>
                      </div>
                      <div>
                        <label class="block text-sm font-semibold text-[#1e3a2f] mb-2">Points</label>
                        <input 
                          v-model.number="question.points"
                          type="number"
                          min="1"
                          :disabled="!canModify"
                          class="w-full font-body pl-4 pr-4 py-3 text-sm text-gray-800 placeholder-gray-600 bg-input rounded-xl focus:bg-input focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                      </div>
                    </div>
                    
                    <div v-if="question.type !== 'vrai_faux'">
                      <label class="block text-sm font-semibold text-[#1e3a2f] mb-2">Options</label>
                      <div class="space-y-2">
                        <div 
                          v-for="(opt, optIndex) in question.options" 
                          :key="optIndex"
                          class="flex items-center gap-2"
                        >
                          <input 
                            v-model="question.options[optIndex]"
                            type="text"
                            :disabled="!canModify"
                            class="w-full font-body pl-4 pr-4 py-3 text-sm text-gray-800 placeholder-gray-600 bg-input rounded-xl focus:bg-input focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                            :placeholder="`Option ${optIndex + 1}`"
                          >
                          <button 
                            v-if="canModify"
                            type="button"
                            @click="removeOption(index, optIndex)"
                            class="text-red-500 hover:text-red-700"
                          >
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                          </button>
                          <div v-if="question.type === 'qcm_multiple'" class="w-5 h-5 flex items-center justify-center">
                            <input 
                              type="checkbox"
                              :value="optIndex"
                              v-model="question.reponses_correctes"
                              :disabled="!canModify"
                              class="w-5 h-5 accent-[#4a7c5e] disabled:opacity-50"
                            >
                          </div>
                          <div v-else class="w-5 h-5 flex items-center justify-center">
                            <input 
                              type="radio"
                              :value="optIndex"
                              v-model="question.reponses_correctes[0]"
                              :disabled="!canModify"
                              class="w-5 h-5 accent-[#4a7c5e] disabled:opacity-50"
                            >
                          </div>
                        </div>
                        <button 
                          v-if="canModify"
                          type="button"
                          @click="addOption(index)"
                          class="text-sm text-[#4a7c5e] hover:text-[#1e3a2f] transition-colors"
                        >
                          + Ajouter une option
                        </button>
                      </div>
                    </div>
                    
                    <div v-if="question.type === 'vrai_faux'">
                      <label class="block text-sm font-semibold text-[#1e3a2f] mb-2">Réponse correcte</label>
                      <div class="flex gap-4">
                        <label class="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="radio"
                            :value="0"
                            v-model="question.reponses_correctes[0]"
                            :disabled="!canModify"
                            class="w-5 h-5 accent-[#4a7c5e] disabled:opacity-50"
                          >
                          <span class="text-sm text-gray-700">Vrai</span>
                        </label>
                        <label class="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="radio"
                            :value="1"
                            v-model="question.reponses_correctes[0]"
                            :disabled="!canModify"
                            class="w-5 h-5 accent-[#4a7c5e] disabled:opacity-50"
                          >
                          <span class="text-sm text-gray-700">Faux</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Boutons d'action -->
          <div class="flex justify-end gap-3 pt-4">
            <button 
              type="button"
              @click="$router.back()"
              class="px-6 py-3 bg-red-500 font-body text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors"
            >
              Annuler
            </button>
            <button 
              v-if="canModify"
              type="submit"
              :disabled="submitting"
              class="px-6 py-3 bg-[#4a7c5e] text-white font-body rounded-xl text-sm font-semibold hover:bg-[#1e3a2f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <div v-if="submitting" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              {{ submitting ? 'Enregistrement...' : 'Enregistrer les modifications' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Chargement -->
      <div v-if="loading" class="max-w-3xl mx-auto py-3">
        <div class="bg-white shadow rounded-lg p-12 text-center">
          <div class="inline-block animate-spin rounded-full h-6 w-6 border-2 border-[#4a7c5e] border-t-transparent"></div>
        </div>
      </div>
    </TeacherLayout>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTeacher } from '../../../../../composables/useTeacher'
import { useToast } from '../../../../../composables/useToast'
import { useAuth } from '../../../../../composables/useAuth'
import flatpickr from 'flatpickr'
import 'flatpickr/dist/flatpickr.css'
import 'flatpickr/dist/themes/material_green.css'

const route = useRoute()
const router = useRouter()
const { getQCMDetails, updateQCM, getFilieres, getClassesByFiliere } = useTeacher()
const { getUser } = useAuth()
const toast = useToast()

const loading = ref(true)
const submitting = ref(false)
const filieres = ref([])
const classes = ref([])
const sessionData = ref(null)
const isAuthorized = ref(true)
const errorMessage = ref('')
const currentUser = ref(null)

const dateDebutInput = ref(null)
const dateFinInput = ref(null)
let dateDebutPicker = null
let dateFinPicker = null

const form = ref({
  titre: '',
  description: '',
  theme: '',
  date_debut: '',
  date_fin: '',
  duree: 0,
  filiere_id: '',
  classe_id: '',
  questions: []
})

// Récupérer l'utilisateur connecté
const loadCurrentUser = () => {
  const userData = getUser()
  console.log('Utilisateur connecté :', userData)
  currentUser.value = userData
}

// Vérifier si l'utilisateur est autorisé
const checkAuthorization = (session) => {
  if (!currentUser.value || !currentUser.value.id) {
    isAuthorized.value = false
    errorMessage.value = 'Vous devez être connecté pour modifier cette session.'
    return false
  }
  
  const currentUserId = currentUser.value.id
  const sessionCreatorId = session.created_by
  
  if (currentUserId !== sessionCreatorId) {
    isAuthorized.value = false
    errorMessage.value = 'Vous n\'êtes pas autorisé à modifier cette session car vous n\'êtes pas le créateur.'
    return false
  }
  
  isAuthorized.value = true
  return true
}

const canModify = computed(() => {
  return isAuthorized.value && sessionData.value?.status === 'pending'
})

const formatDateDisplay = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formattedDateDebut = ref('')
const formattedDateFin = ref('')

const getStatusText = (status) => {
  const map = { draft: 'Brouillon', pending: 'Programmée', active: 'En cours', completed: 'Terminé' }
  return map[status] || status
}

const getStatusClass = (status) => {
  const map = { 
    draft: 'bg-gray-200 text-gray-800', 
    pending: 'bg-yellow-200 text-yellow-800', 
    active: 'bg-green-200 text-green-800', 
    completed: 'bg-blue-200 text-blue-800' 
  }
  return map[status] || 'bg-gray-200 text-gray-800'
}

const calculateDuration = () => {
  if (form.value.date_debut && form.value.date_fin) {
    const debut = new Date(form.value.date_debut)
    const fin = new Date(form.value.date_fin)
    if (fin > debut) {
      form.value.duree = Math.round((fin - debut) / (1000 * 60))
    }
  }
}

watch(() => [form.value.date_debut, form.value.date_fin], () => {
  calculateDuration()
})

const addQuestion = () => {
  form.value.questions.push({
    texte: '',
    type: 'qcm',
    points: 1,
    options: ['', ''],
    reponses_correctes: []
  })
}

const removeQuestion = (index) => {
  form.value.questions.splice(index, 1)
}

const addOption = (questionIndex) => {
  form.value.questions[questionIndex].options.push('')
}

const removeOption = (questionIndex, optionIndex) => {
  form.value.questions[questionIndex].options.splice(optionIndex, 1)
}

const onFiliereChange = async () => {
  form.value.classe_id = ''
  if (form.value.filiere_id) {
    const res = await getClassesByFiliere(parseInt(form.value.filiere_id))
    if (res.success) {
      classes.value = res.data
    }
  }
}

const initDatePickers = () => {
  if (dateDebutInput.value && canModify.value) {
    dateDebutPicker = flatpickr(dateDebutInput.value, {
      enableTime: true,
      dateFormat: 'Y-m-d H:i:s',
      time_24hr: true,
      locale: 'fr',
      minDate: 'today',
      minuteIncrement: 1,
      onChange: (selectedDates, dateStr) => {
        form.value.date_debut = dateStr
        formattedDateDebut.value = formatDateDisplay(dateStr)
        if (dateFinPicker && selectedDates[0]) {
          const minEndDate = new Date(selectedDates[0])
          minEndDate.setMinutes(minEndDate.getMinutes() + 1)
          dateFinPicker.set('minDate', minEndDate)
        }
        if (form.value.date_fin && new Date(form.value.date_fin) <= new Date(dateStr)) {
          form.value.date_fin = ''
          formattedDateFin.value = ''
          if (dateFinPicker) dateFinPicker.clear()
        }
      }
    })
  }
  
  if (dateFinInput.value && canModify.value) {
    dateFinPicker = flatpickr(dateFinInput.value, {
      enableTime: true,
      dateFormat: 'Y-m-d H:i:s',
      time_24hr: true,
      locale: 'fr',
      minDate: form.value.date_debut ? new Date(new Date(form.value.date_debut).getTime() + 60000) : 'today',
      minuteIncrement: 1,
      onChange: (selectedDates, dateStr) => {
        form.value.date_fin = dateStr
        formattedDateFin.value = formatDateDisplay(dateStr)
      }
    })
  }
}

const loadSession = async () => {
  const id = parseInt(route.params.id)
  const result = await getQCMDetails(id)
  
  if (result.success) {
    sessionData.value = result.data
    
    if (!checkAuthorization(result.data)) {
      loading.value = false
      return
    }
    
    form.value = {
      titre: result.data.titre || '',
      description: result.data.description || '',
      theme: result.data.theme || '',
      date_debut: result.data.date_debut || '',
      date_fin: result.data.date_fin || '',
      duree: result.data.duree || 0,
      filiere_id: result.data.filiere_id ? String(result.data.filiere_id) : '',
      classe_id: result.data.classe_id ? String(result.data.classe_id) : '',
      questions: result.data.questions || []
    }
    
    formattedDateDebut.value = formatDateDisplay(result.data.date_debut)
    formattedDateFin.value = formatDateDisplay(result.data.date_fin)
    
    if (result.data.filiere_id) {
      const res = await getClassesByFiliere(result.data.filiere_id)
      if (res.success) classes.value = res.data
    }
    
    setTimeout(() => {
      initDatePickers()
      if (dateDebutPicker && form.value.date_debut) dateDebutPicker.setDate(form.value.date_debut)
      if (dateFinPicker && form.value.date_fin) dateFinPicker.setDate(form.value.date_fin)
    }, 100)
  } else {
    toast.error('Erreur lors du chargement de la session')
    router.back()
  }
  
  loading.value = false
}

const validateDates = () => {
  if (!form.value.date_debut || !form.value.date_fin) {
    toast.error('Veuillez sélectionner les dates')
    return false
  }
  const debut = new Date(form.value.date_debut)
  const fin = new Date(form.value.date_fin)
  if (debut < new Date()) {
    toast.error('La date de début ne peut pas être dans le passé')
    return false
  }
  if (fin <= debut) {
    toast.error('La date de fin doit être postérieure à la date de début')
    return false
  }
  return true
}

const submitUpdate = async () => {
  if (!canModify.value) {
    toast.error('Cette session ne peut plus être modifiée')
    return
  }
  
  if (!form.value.titre) {
    toast.error('Veuillez saisir un titre')
    return
  }
  
  if (!validateDates()) return
  
  if (!form.value.filiere_id || !form.value.classe_id) {
    toast.error('Veuillez sélectionner une filière et une classe')
    return
  }
  
  for (let i = 0; i < form.value.questions.length; i++) {
    const q = form.value.questions[i]
    if (!q.texte.trim()) {
      toast.error(`Question ${i + 1} : veuillez saisir le texte`)
      return
    }
    if (q.type !== 'vrai_faux' && q.options.some(opt => !opt.trim())) {
      toast.error(`Question ${i + 1} : veuillez remplir toutes les options`)
      return
    }
    if (q.reponses_correctes.length === 0) {
      toast.error(`Question ${i + 1} : veuillez sélectionner la réponse correcte`)
      return
    }
  }
  
  submitting.value = true
  const id = parseInt(route.params.id)
  const result = await updateQCM(id, {
    titre: form.value.titre,
    description: form.value.description,
    theme: form.value.theme,
    date_debut: new Date(form.value.date_debut).toISOString(),
    date_fin: new Date(form.value.date_fin).toISOString(),
    duree: form.value.duree,
    filiere_id: parseInt(form.value.filiere_id),
    classe_id: parseInt(form.value.classe_id),
    questions: form.value.questions
  })
  
  if (result.success) {
    toast.success('Session modifiée avec succès !')
    router.push(`/teachers/my-sessions`)
  } else {
    toast.error(result.message || 'Erreur lors de la modification')
  }
  submitting.value = false
}

const loadFilieres = async () => {
  const res = await getFilieres()
  if (res.success) filieres.value = res.data
}

onUnmounted(() => {
  if (dateDebutPicker) dateDebutPicker.destroy()
  if (dateFinPicker) dateFinPicker.destroy()
})

onMounted(async () => {
  loadCurrentUser()
  await loadFilieres()
  await loadSession()
})
</script>

<style scoped>
.border { transition: all 0.2s ease; }
.border:hover { border-color: #4a7c5e; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }

:deep(.flatpickr-calendar) {
  border-radius: 12px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
}

:deep(.flatpickr-day.selected) {
  background: #4a7c5e;
  border-color: #4a7c5e;
}

:deep(.flatpickr-day.selected:hover) {
  background: #1e3a2f;
  border-color: #1e3a2f;
}

input:disabled::-webkit-inner-spin-button, 
input:disabled::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>