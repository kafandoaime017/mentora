<template>
  <div class="bg-[#f5f0e8] font-body min-h-screen">
    <StudentLayout>
      <div class="max-w-4xl mx-auto px-4">
        
        <!-- Bouton retour -->
        <button 
          @click="$router.back()"
              class="text-[#4a7c5e] flex mx-1 mb-3 bg-gray-200 hover:bg-gray-300 font-body font-bold px-3 py-2 rounded-lg hover:text-[#1e3a2f] transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          <span class="text-sm font-semibold">Retour</span>
        </button>

        <!-- Session terminée - Message d'erreur -->
        <div v-if="sessionTerminee" class="bg-white shadow rounded-lg p-8 text-center">
          <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <h2 class="text-2xl font-bold font-body text-[#1e3a2f] mb-2">Session terminée</h2>
          <p class="text-gray-600 mb-6">{{ messageErreur || 'Le temps imparti pour cette session est écoulé.' }}</p>
          <button 
            @click="$router.push('/students')"
            class="px-6 py-3 bg-primary font-body text-white rounded-lg font-semibold hover:bg-primary/80 transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>

        <!-- Session normale -->
        <template v-else>
          <!-- En-tête avec progression -->
          <div class="bg-white shadow rounded-lg p-3 px-4 py-1 mb-6">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 class="text-xl font-bold font-body text-[#1e3a2f]">{{ session.titre }}</h1>
              </div>
              <div class="flex items-center gap-4">
                <div class="text-center bg-gray-100 px-3 py-2 rounded-lg">
                  <p class="text-xs text-gray-500 font-body">Temps restant</p>
                  <p class="text-xl font-mono font-bold font-body" :class="tempsRestant <= 60 ? 'text-red-600' : 'text-primary'">
                    {{ formatTemps(tempsRestant) }}
                  </p>
                </div>
                <div class="text-center bg-gray-100 px-3 py-2 rounded-lg">
                  <p class="text-xs font-body text-gray-500">Question</p>
                  <p class="text-lg font-bold text-primary">{{ currentIndex + 1 }}/{{ questions.length }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Loading -->
          <div v-if="loading" class="flex justify-center py-12">
            <div class="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
          </div>

          <!-- Question courante -->
          <div v-else class="bg-white shadow rounded-lg overflow-hidden">
            <!-- En-tête question -->
            <div class="bg-white p-5 py-3 border rounded-t-lg border-[#e2ddd4]">
              <div class="flex justify-between items-start gap-4">
                <div class="flex-1">
                  <h2 class="md:text-md sm:text-lg font-bold font-body text-[#1e3a2f]">{{ questions[currentIndex]?.texte }}</h2>
                </div>
                <span class="text-sm font-semibold text-primary whitespace-nowrap">
                  {{ questions[currentIndex]?.points }} pts
                </span>
              </div>
            </div>

            <!-- Corps question -->
            <div class="p-6">
              <!-- QCM simple -->
              <div v-if="questions[currentIndex]?.type === 'qcm'" class="space-y-3">
                <div 
                  v-for="(opt, optIdx) in questions[currentIndex]?.options" 
                  :key="optIdx"
                  @click="reponseRadio(questions[currentIndex].id, optIdx)"
                  class="flex items-center font-body gap-3 p-4 py-2 rounded-xl cursor-pointer transition-all hover:bg-gray-50"
                  :class="getReponse(questions[currentIndex].id) === optIdx ? 'bg-gray-100 border border-primary' : 'border-gray-200 border'"
                >
                  <div 
                    class="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                    :class="getReponse(questions[currentIndex].id) === optIdx ? 'border-primary bg-primary' : 'border-gray-300'"
                  >
                    <div v-if="getReponse(questions[currentIndex].id) === optIdx" class="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span class="text-gray-700">{{ opt }}</span>
                </div>
              </div>

              <!-- QCM multiple -->
              <div v-else-if="questions[currentIndex]?.type === 'qcm_multiple'" class="space-y-3">
                <div 
                  v-for="(opt, optIdx) in questions[currentIndex]?.options" 
                  :key="optIdx"
                  @click="reponseCheckbox(questions[currentIndex].id, optIdx)"
                  class="flex items-center gap-3 p-2.5 px-3 border rounded-xl cursor-pointer transition-all hover:bg-gray-100"
                  :class="isCheckboxChecked(questions[currentIndex].id, optIdx) ? ' bg-gray-100 ' : 'border-gray-200'"
                >
                  <div 
                    class="w-5 h-5 rounded border-2 flex items-center justify-center"
                    :class="isCheckboxChecked(questions[currentIndex].id, optIdx) ? 'border-primary bg-primary' : 'border-gray-300'"
                  >
                    <svg v-if="isCheckboxChecked(questions[currentIndex].id, optIdx)" class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                    </svg>
                  </div>
                  <span class="text-gray-800 font-bold font-body">{{ opt }}</span>
                </div>
              </div>

              <!-- Vrai/Faux -->
              <div v-else-if="questions[currentIndex]?.type === 'vrai_faux'" class="flex gap-4">
                <button 
                  @click="reponseVF(questions[currentIndex].id, true)"
                  class="flex-1 font-body py-3 rounded-xl font-medium transition-all"
                  :class="getReponse(questions[currentIndex].id) === 0 ? 'bg-primary/80 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
                >
                  Vrai
                </button>
                <button 
                  @click="reponseVF(questions[currentIndex].id, false)"
                  class="flex-1 py-3 font-body rounded-xl font-medium transition-all"
                  :class="getReponse(questions[currentIndex].id) === 1 ? 'bg-primary/80 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
                >
                  Faux
                </button>
              </div>
            </div>

            <!-- Navigation -->
            <div class="border-t border-[#e2ddd4] p-3">
              <!-- Version desktop -->
              <div class="hidden md:flex justify-between items-center gap-4">
                <button 
                  @click="previousQuestion"
                  :disabled="currentIndex === 0"
                  class="flex items-center gap-2 px-5 py-2 rounded-lg font-semibold transition-all"
                  :class="currentIndex === 0 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-secondary text-white hover:bg-secondary/80'"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                  </svg>
                  Précédent
                </button>

                <div class="flex gap-2 overflow-x-auto pb-1 max-w-[400px] justify-center">
                  <button 
                    v-for="(q, idx) in questions"
                    :key="idx"
                    @click="goToQuestion(idx)"
                    class="w-9 h-9 rounded-full text-sm font-semibold transition-all flex-shrink-0"
                    :class="{
                      'bg-primary text-white': currentIndex === idx,
                      'bg-green-100 text-green-700': currentIndex !== idx && isQuestionRepondue(q.id),
                      'bg-gray-200 text-gray-500': currentIndex !== idx && !isQuestionRepondue(q.id)
                    }"
                  >
                    {{ idx + 1 }}
                  </button>
                </div>

                <button 
                  v-if="currentIndex < questions.length - 1"
                  @click="nextQuestion"
                  class="flex items-center gap-2 px-5 py-2 rounded-lg font-semibold transition-all bg-primary text-white hover:bg-primary/80"
                >
                  Suivant
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </button>

                <button 
                  v-else
                  @click="submitAll"
                  :disabled="submitting"
                  class="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all"
                >
                  {{ submitting ? 'Envoi...' : 'Terminer' }}
                </button>
              </div>

              <!-- Version mobile -->
              <div class="md:hidden space-y-4">
                <div class="flex justify-between items-center text-sm text-gray-500">
                  <span>Question {{ currentIndex + 1 }}/{{ questions.length }}</span>
                  <span>{{ Math.round(((currentIndex + 1) / questions.length) * 100) }}%</span>
                </div>
                
                <div class="flex gap-3">
                  <button 
                    @click="previousQuestion"
                    :disabled="currentIndex === 0"
                    class="flex-1 flex items-center justify-center gap-2 rounded-lg font-semibold transition-all"
                    :class="currentIndex === 0 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-secondary text-white hover:bg-secondary/80'"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                    </svg>
                    Précédent
                  </button>

                  <button 
                    v-if="currentIndex < questions.length - 1"
                    @click="nextQuestion"
                    class="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-semibold transition-all bg-primary text-white hover:bg-primary/80"
                  >
                    Suivant
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                    </svg>
                  </button>

                  <button 
                    v-else
                    @click="submitAll"
                    :disabled="submitting"
                    class="flex-1 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all"
                  >
                    {{ submitting ? 'Envoi...' : 'Terminer' }}
                  </button>
                </div>

                <div class="flex gap-2 overflow-x-auto pb-2 justify-center">
                  <button 
                    v-for="(q, idx) in questions"
                    :key="idx"
                    @click="goToQuestion(idx)"
                    class="w-8 h-8 rounded-full text-xs font-semibold transition-all flex-shrink-0"
                    :class="{
                      'bg-primary text-white': currentIndex === idx,
                      'bg-green-100 text-green-700': currentIndex !== idx && isQuestionRepondue(q.id),
                      'bg-gray-200 text-gray-500': currentIndex !== idx && !isQuestionRepondue(q.id)
                    }"
                  >
                    {{ idx + 1 }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </StudentLayout>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStudent } from '~~/composables/useStudent'
import { useToast } from '~~/composables/useToast'

const route = useRoute()
const router = useRouter()
const { getSessionForStudent, submitAllReponses } = useStudent()
const toast = useToast()

const sessionId = parseInt(route.params.id)
const loading = ref(true)
const submitting = ref(false)
const session = ref({})
const questions = ref([])
const reponses = ref({})
const tempsRestant = ref(0)
const currentIndex = ref(0)
const sessionTerminee = ref(false)
const messageErreur = ref('')
let timerInterval = null
let soumissionAutoEffectuee = ref(false) // Éviter les doubles soumissions

const getReponse = (questionId) => reponses.value[questionId]

const isQuestionRepondue = (questionId) => {
  const rep = reponses.value[questionId]
  if (!rep) return false
  if (Array.isArray(rep)) return rep.length > 0
  return rep !== undefined && rep !== null
}

const isCheckboxChecked = (questionId, optIndex) => {
  const rep = reponses.value[questionId]
  return rep?.includes(optIndex) || false
}

const reponseRadio = (questionId, optIndex) => {
  reponses.value[questionId] = optIndex
}

const reponseCheckbox = (questionId, optIndex) => {
  const current = reponses.value[questionId] || []
  if (current.includes(optIndex)) {
    reponses.value[questionId] = current.filter(i => i !== optIndex)
  } else {
    reponses.value[questionId] = [...current, optIndex]
  }
}

const reponseVF = (questionId, valeur) => {
  reponses.value[questionId] = valeur ? 0 : 1
}

// 🔴 FONCTION POUR SOUMETTRE LES RÉPONSES (peut être appelée manuellement ou automatiquement)
const soumettreReponses = async (auto = false) => {
  if (soumissionAutoEffectuee.value) return // Éviter double soumission
  
  // Formater les réponses pour l'API (même celles qui sont vides)
  const reponsesFormatees = questions.value.map(q => ({
    questionId: q.id,
    reponseIds: reponses.value[q.id] ? (Array.isArray(reponses.value[q.id]) ? reponses.value[q.id] : [reponses.value[q.id]]) : []
  }))
  
  submitting.value = true
  
  if (auto) {
    toast.info('⏰ Temps écoulé ! Soumission automatique de vos réponses...')
  }
  
  console.log('📤 Soumission des réponses:', reponsesFormatees)
  
  const result = await submitAllReponses(sessionId, reponsesFormatees)
  
  if (result.success) {
    soumissionAutoEffectuee.value = true
    if (auto) {
      toast.success('Vos réponses ont été soumises automatiquement')
    } else {
      toast.success('Toutes vos réponses ont été enregistrées !')
    }
    // Rediriger vers la page des résultats
    await router.push(`/students/my-sessions`)
  } else {
    toast.error(result.message || 'Erreur lors de l\'envoi')
    submitting.value = false
  }
}

const submitAll = async () => {
  await soumettreReponses(false)
}

const nextQuestion = () => {
  if (currentIndex.value < questions.value.length - 1) {
    currentIndex.value++
  }
}

const previousQuestion = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}

const goToQuestion = (index) => {
  currentIndex.value = index
}

const formatTemps = (secondes) => {
  const minutes = Math.floor(secondes / 60)
  const secs = secondes % 60
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const verrouillerSession = (message) => {
  sessionTerminee.value = true
  messageErreur.value = message
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

// 🔴 MODIFIÉ: Timer avec soumission automatique à la fin
const demarrerTimer = () => {
  if (timerInterval) clearInterval(timerInterval)
  
  timerInterval = setInterval(() => {
    if (tempsRestant.value > 0) {
      tempsRestant.value--
      
      // Optionnel: alerter quand il reste 10 secondes
      if (tempsRestant.value === 10) {
        toast.warning('⚠️ Il vous reste 10 secondes !', { duration: 3000 })
      }
      if (tempsRestant.value === 5) {
        toast.warning('⚠️ 5 secondes restantes !', { duration: 3000 })
      }
      if (tempsRestant.value === 3) {
        toast.warning('⚠️ 3... 2... 1...', { duration: 2000 })
      }
      
    } else {
      // 🔴 TEMPS ÉCOULÉ ! Soumettre automatiquement
      clearInterval(timerInterval)
      timerInterval = null
      
      // Soumettre automatiquement les réponses
      if (!soumissionAutoEffectuee.value) {
        soumettreReponses(true)
      }
      
      // Afficher le message de fin
      verrouillerSession('⏰ Temps écoulé ! Vos réponses ont été soumises automatiquement.')
    }
  }, 1000)
}

const loadSession = async () => {
  loading.value = true
  const result = await getSessionForStudent(sessionId)
  
  if (result.success && result.data) {
    session.value = result.data
    questions.value = result.data.questions || []
    tempsRestant.value = result.data.temps_restant || 0
    
    // Charger les réponses existantes si l'étudiant a déjà commencé
    if (result.data.reponses_existantes) {
      reponses.value = result.data.reponses_existantes
    }
    
    if (tempsRestant.value <= 0 && result.data.status === 'active') {
      // Si déjà écoulé au chargement, soumettre immédiatement
      if (!soumissionAutoEffectuee.value) {
        await soumettreReponses(true)
      }
      verrouillerSession('⏰ Le temps imparti pour cette session est écoulé. Vos réponses ont été soumises.')
    } else {
      demarrerTimer()
    }
  } else if (result.message?.includes('terminée') || result.message?.includes('écoulé')) {
    verrouillerSession(result.message)
  } else {
    toast.error(result.message || 'Erreur lors du chargement')
    router.back()
  }
  loading.value = false
}

// 🔴 Sauvegarder les réponses dans sessionStorage avant de quitter (optionnel)
const sauvegarderLocalement = () => {
  if (Object.keys(reponses.value).length > 0) {
    sessionStorage.setItem(`session_${sessionId}_reponses`, JSON.stringify(reponses.value))
  }
}

// 🔴 Restaurer les réponses depuis sessionStorage (optionnel)
const restaurerDepuisLocal = () => {
  const sauvegarde = sessionStorage.getItem(`session_${sessionId}_reponses`)
  if (sauvegarde) {
    try {
      const anciennesReponses = JSON.parse(sauvegarde)
      reponses.value = { ...reponses.value, ...anciennesReponses }
    } catch (e) {
      console.error('Erreur restauration:', e)
    }
  }
}

// Sauvegarde automatique toutes les 5 secondes (optionnel)
let autoSaveInterval = null
const demarrerAutoSave = () => {
  autoSaveInterval = setInterval(() => {
    sauvegarderLocalement()
  }, 5000)
}

onMounted(() => {
  restaurerDepuisLocal()
  loadSession()
  demarrerAutoSave()
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
  if (autoSaveInterval) clearInterval(autoSaveInterval)
  sauvegarderLocalement() // Dernière sauvegarde avant de quitter
})
</script>