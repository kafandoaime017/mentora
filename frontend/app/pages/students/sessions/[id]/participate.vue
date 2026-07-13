<template>
  <div class="bg-[#f5f0e8] font-body min-h-screen">
    <StudentLayout>
      <div class="max-w-2xl mx-auto">
<br/><br/>
        <!-- Bouton retour + fullscreen -->
        <div class="flex items-center justify-between mx-1 mb-3">
          <button
            @click="$router.back()"
            class="text-[#4a7c5e] flex bg-gray-200 hover:bg-gray-300 font-body font-bold px-3 py-2 rounded-lg hover:text-[#1e3a2f] transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            <span class="text-sm font-semibold">Retour</span>
          </button>

          <button
            @click="toggleFullscreen"
            class="flex items-center gap-2 bg-primary text-white font-body font-semibold px-3 py-2 rounded-lg hover:bg-primary/80 transition-colors text-sm"
          >
            <svg v-if="!isFullscreen" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/>
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 9V4m0 0H4m5 0L3 10m12-6v5m0 0h5m-5 0l6-6M9 15v5m0 0H4m5 0l-6 6m12-6h5m-5 0v5m0-5l6 6"/>
            </svg>
            <span class="hidden sm:inline">{{ isFullscreen ? 'Quitter' : 'Plein écran' }}</span>
          </button>
        </div>

        <!-- Session terminée -->
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

          <!-- En-tête -->
          <div class="bg-white  rounded-sm p-3 px-4 py-1 mb-6">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 class="text-xl font-bold font-body text-black">{{ session.titre }}</h1>
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
            <div class="animate-spin rounded-full h-8 w-8 " />
          </div>

          <!-- Question -->
          <div v-else class="bg-white  rounded-sm overflow-hidden">

            <!-- En-tête question -->
            <div class="bg-secondary  p-5 py-3 border  border-[#e2ddd4]">
              <div class="flex justify-between items-start gap-4">
                <h2 class="md:text-md sm:text-lg font-bold font-body text-white flex-1">{{ questions[currentIndex]?.texte }}</h2>
                <span class="text-sm font-semibold text-white whitespace-nowrap">{{ questions[currentIndex]?.points }} pts</span>
              </div>
            </div>

            <!-- Corps -->
            <div class="p-6">

              <!-- QCM simple -->
              <div v-if="questions[currentIndex]?.type === 'qcm'" class="space-y-3">
                <div
                  v-for="(opt, optIdx) in questions[currentIndex]?.options" :key="optIdx"
                  @click="reponseRadio(questions[currentIndex].id, optIdx)"
                  class="flex items-center font-body gap-3 p-4 py-2 rounded-xl cursor-pointer transition-all hover:bg-gray-200"
                  :class="getReponse(questions[currentIndex].id) === optIdx ? 'bg-gray-200 border ' : 'border-gray-200 border'"
                >
                  <div
                    class="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                    :class="getReponse(questions[currentIndex].id) === optIdx ? 'border-primary bg-primary' : 'border-gray-300'"
                  >
                    <div v-if="getReponse(questions[currentIndex].id) === optIdx" class="w-2 h-2 bg-white rounded-full" />
                  </div>
                  <span class="text-gray-700">{{ opt }}</span>
                </div>
              </div>

              <!-- QCM multiple -->
              <div v-else-if="questions[currentIndex]?.type === 'qcm_multiple'" class="space-y-3">
                <div
                  v-for="(opt, optIdx) in questions[currentIndex]?.options" :key="optIdx"
                  @click="reponseCheckbox(questions[currentIndex].id, optIdx)"
                  class="flex items-center gap-3 p-2.5 px-3 border rounded-xl cursor-pointer transition-all hover:bg-gray-200"
                  :class="isCheckboxChecked(questions[currentIndex].id, optIdx) ? 'bg-gray-200 ' : 'border-gray-200'"
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
                >Vrai</button>
                <button
                  @click="reponseVF(questions[currentIndex].id, false)"
                  class="flex-1 py-3 font-body rounded-xl font-medium transition-all"
                  :class="getReponse(questions[currentIndex].id) === 1 ? 'bg-primary/80 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'"
                >Faux</button>
              </div>

            </div>

            <!-- Navigation -->
            <div class="border-t border-[#e2ddd4] p-3">

              <!-- Desktop -->
              <div class="hidden md:flex justify-between items-center gap-4">
                <button
                  @click="previousQuestion" :disabled="currentIndex === 0"
                  class="flex items-center gap-2 px-5 py-2 rounded-lg font-semibold transition-all"
                  :class="currentIndex === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-secondary text-white hover:bg-secondary/80'"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
                  Prev
                </button>

                <div class="flex overflow-hidden px-4 gap-0.5 pb-1 max-w-[400px] justify-center">
                  <button
                    v-for="(q, idx) in questions" :key="idx"
                    @click="goToQuestion(idx)"
                    class="w-6 h-6 rounded-full text-sm font-medium transition-all flex-shrink-0"
                    :class="{
                      'bg-primary text-white': currentIndex === idx,
                      'bg-green-100 text-green-700': currentIndex !== idx && isQuestionRepondue(q.id),
                      'bg-gray-200 text-gray-500': currentIndex !== idx && !isQuestionRepondue(q.id)
                    }"
                  >{{ idx + 1 }}</button>
                </div>

                <button
                  v-if="currentIndex < questions.length - 1"
                  @click="nextQuestion"
                  class="flex items-center gap-2 px-5 py-2 rounded-lg font-semibold transition-all bg-primary text-white hover:bg-primary/80"
                >
                  Next
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                </button>
                <button
  v-else
  @click="submitAll"
  :disabled="submitting"
  class="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all flex items-center gap-2"
>
  <svg
    v-if="!submitting"
    xmlns="http://www.w3.org/2000/svg"
    class="w-5 h-5"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.2 14.2l-3.5-3.5 1.4-1.4 2.1 2.1 4.5-4.5 1.4 1.4-5.9 5.9z"
    />
  </svg>

  {{ submitting ? 'Envoi...' : 'Soumettre' }}
</button>
              </div>

              <!-- Mobile -->
              <div class="md:hidden space-y-4">
                <div class="flex justify-between items-center text-sm text-gray-500">
                  <span>Question {{ currentIndex + 1 }}/{{ questions.length }}</span>
                  <span>{{ Math.round(((currentIndex + 1) / questions.length) * 100) }}%</span>
                </div>
                <div class="flex gap-3">
                  <button
                    @click="previousQuestion" :disabled="currentIndex === 0"
                    class="px-4 flex items-center justify-center gap-2 rounded-lg font-semibold transition-all"
                    :class="currentIndex === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-secondary text-white hover:bg-secondary/80'"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
                    Prev
                  </button>
                  <button
                    v-if="currentIndex < questions.length - 1"
                    @click="nextQuestion"
                    class="px-4 flex items-center justify-center gap-2 py-2 rounded-lg font-semibold transition-all bg-primary text-white hover:bg-primary/80"
                  >
                    Next
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                  </button>
                  <button
                    v-else @click="submitAll" :disabled="submitting"
                    class="flex-1 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all"
                  >{{ submitting ? 'Envoi...' : 'Terminer' }}</button>
                </div>
                <div class="flex gap-2 overflow-x-auto pb-2 justify-center">
                  <button
                    v-for="(q, idx) in questions" :key="idx"
                    @click="goToQuestion(idx)"
                    class="w-4 h-4 rounded-full text-xs font-semibold transition-all flex-shrink-0"
                    :class="{
                      'bg-primary text-white': currentIndex === idx,
                      'bg-green-100 text-green-700': currentIndex !== idx && isQuestionRepondue(q.id),
                      'bg-gray-200 text-gray-500': currentIndex !== idx && !isQuestionRepondue(q.id)
                    }"
                  >{{ idx + 1 }}</button>
                </div>
              </div>

            </div>
          </div>
        </template>
      </div>

      <!-- Modal force-end -->
      <Teleport to="body">
        <Transition name="modal">
          <div v-if="showForceEndModal" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div class="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl">
              <div class="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 10h6v4H9z"/>
                </svg>
              </div>
              <h3 class="text-lg font-body font-bold text-[#1e3a2f] mb-2">Session terminée</h3>
              <p class="text-sm font-body text-gray-500 mb-2">{{ forceEndMessage }}</p>
              <p class="text-xs font-body text-gray-400 mb-6">Vos réponses ont été enregistrées automatiquement.</p>
              <button
                @click="quitterEtRediriger"
                class="w-full py-3 bg-primary font-body text-white font-bold rounded-xl hover:bg-primary/80 transition-colors"
              >
                Voir mes résultats
              </button>
            </div>
          </div>
        </Transition>
      </Teleport>

    </StudentLayout>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStudent } from '~~/composables/useStudent'
import { useToast } from '~~/composables/useToast'
import { useWebSocket } from '~~/composables/useWebSocket'

const route  = useRoute()
const router = useRouter()
const { getSessionForStudent, submitAllReponses } = useStudent()
const { getSocket } = useWebSocket()
const toast  = useToast()

// État global partagé avec le layout
const isParticipating = useState('isParticipating', () => false)

// Dans loadSession, après demarrerTimer() :
isParticipating.value = true

// Dans onUnmounted :
isParticipating.value = false

// Dans soumettreReponses, après soumissionAutoEffectuee = true :
isParticipating.value = false

const sessionId = parseInt(route.params.id)

const loading         = ref(true)
const submitting      = ref(false)
const session         = ref({})
const questions       = ref([])
const tempsRestant    = ref(0)
const currentIndex    = ref(0)
const sessionTerminee = ref(false)
const messageErreur   = ref('')
const soumissionAutoEffectuee = ref(false)
const showForceEndModal = ref(false)
const forceEndMessage   = ref('')
const isFullscreen      = ref(false)

// ─── RÉPONSES : reactive() au lieu de ref({}) pour garantir la réactivité ────
const reponses = reactive({})

let timerInterval    = null
let autoSaveInterval = null

// ─── Fullscreen ───────────────────────────────────────────────────────────────
const enterFullscreen = async () => {
  try { await document.documentElement.requestFullscreen(); isFullscreen.value = true } catch {}
}
const exitFullscreen = async () => {
  try { if (document.fullscreenElement) await document.exitFullscreen(); isFullscreen.value = false } catch {}
}
const toggleFullscreen = async () => {
  document.fullscreenElement ? await exitFullscreen() : await enterFullscreen()
}
const handleFullscreenChange = () => {
  isFullscreen.value    = !!document.fullscreenElement
  isParticipating.value = !!document.fullscreenElement // ← sync avec le layout

  if (!document.fullscreenElement && !soumissionAutoEffectuee.value && session.value?.status === 'active') {
    toast.warning('⚠️ Sortie du plein écran détectée !')
    logSortie('ecran')
  }
}
// ─── Réponses ─────────────────────────────────────────────────────────────────
const getReponse = (qId) => reponses[qId]

const isQuestionRepondue = (qId) => {
  const r = reponses[qId]
  if (r === undefined || r === null) return false
  if (Array.isArray(r)) return r.length > 0
  return true
}

const isCheckboxChecked = (qId, optIdx) => {
  const r = reponses[qId]
  return Array.isArray(r) && r.includes(optIdx)
}

const reponseRadio = (qId, optIdx) => {
  reponses[qId] = Number(optIdx)
}

const reponseVF = (qId, valeur) => {
  reponses[qId] = valeur ? 0 : 1
}

const reponseCheckbox = (qId, optIdx) => {
  const current = Array.isArray(reponses[qId]) ? [...reponses[qId]] : []
  const idx     = current.indexOf(optIdx)
  if (idx === -1) {
    current.push(Number(optIdx))
  } else {
    current.splice(idx, 1)
  }
  reponses[qId] = current
}

// ─── Normaliser les réponses (forcer les valeurs en Number) ───────────────────
const normaliserReponses = (raw) => {
  const normalized = {}
  Object.keys(raw).forEach(qId => {
    const val = raw[qId]
    if (Array.isArray(val)) {
      normalized[qId] = val.map(Number)
    } else if (val !== null && val !== undefined) {
      normalized[qId] = Number(val)
    }
  })
  return normalized
}

// ─── Soumission ───────────────────────────────────────────────────────────────
const soumettreReponses = async (auto = false) => {
  if (soumissionAutoEffectuee.value) return

  // Construire le tableau de réponses — forcer Number partout
  const reponsesFormatees = questions.value.map(q => {
    const rep = reponses[q.id]
    let reponseIds = []

    if (rep !== undefined && rep !== null) {
      if (Array.isArray(rep)) {
        reponseIds = rep.map(Number)
      } else {
        reponseIds = [Number(rep)]
      }
    }

    return {
      questionId: Number(q.id),
      reponseIds
    }
  })


  submitting.value = true
  if (auto) toast.info('Soumission automatique en cours...')

  const result = await submitAllReponses(sessionId, reponsesFormatees)

  if (result.success) {
    soumissionAutoEffectuee.value = true
    sessionStorage.removeItem(`session_${sessionId}_reponses`)
    if (!auto) {
      await exitFullscreen()
      await router.push('/students/session-participate-success')
    }
  } else {
    toast.error(result.message || "Erreur lors de l'envoi")
    submitting.value = false
  }
}

const submitAll = async () => { await soumettreReponses(false) }

// ─── Navigation ───────────────────────────────────────────────────────────────
const nextQuestion     = () => { if (currentIndex.value < questions.value.length - 1) currentIndex.value++ }
const previousQuestion = () => { if (currentIndex.value > 0) currentIndex.value-- }
const goToQuestion     = (idx) => { currentIndex.value = idx }

// ─── Timer ────────────────────────────────────────────────────────────────────
const formatTemps = (secondes) => {
  const m = Math.floor(secondes / 60)
  const s = secondes % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

const verrouillerSession = (message) => {
  sessionTerminee.value = true
  messageErreur.value   = message
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null }
}

const demarrerTimer = () => {
  if (timerInterval) clearInterval(timerInterval)
  timerInterval = setInterval(async () => {
    if (tempsRestant.value > 0) {
      tempsRestant.value--
      if (tempsRestant.value === 10) toast.warning('Il vous reste 10 secondes !')
      if (tempsRestant.value === 5)  toast.warning('5 secondes restantes !')
    } else {
      clearInterval(timerInterval)
      timerInterval = null
      if (!soumissionAutoEffectuee.value) await soumettreReponses(true)
      await exitFullscreen()
      verrouillerSession('Temps écoulé ! Vos réponses ont été soumises automatiquement.')
    }
  }, 1000)
}

// ─── WebSocket ────────────────────────────────────────────────────────────────
const initWebSocket = () => {
  const socket = getSocket()
  if (!socket) return
  socket.on('session-force-ended', async (data) => {
    if (data.sessionId !== sessionId) return
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null }
    if (!soumissionAutoEffectuee.value) await soumettreReponses(true)
    forceEndMessage.value   = data.message || 'La session a été terminée par le professeur.'
    showForceEndModal.value = true
  })
}

const quitterEtRediriger = async () => {
  await exitFullscreen()
  navigateTo(`/students/sessions/${sessionId}/resultats`)
}

// ─── Sauvegarde locale ────────────────────────────────────────────────────────
const sauvegarderLocalement = () => {
  const data = { ...reponses }
  if (Object.keys(data).length > 0) {
    sessionStorage.setItem(`session_${sessionId}_reponses`, JSON.stringify(data))
  }
}

const restaurerDepuisLocal = () => {
  const s = sessionStorage.getItem(`session_${sessionId}_reponses`)
  if (s) {
    try {
      const raw        = JSON.parse(s)
      const normalized = normaliserReponses(raw)
      Object.assign(reponses, normalized)
    } catch {}
  }
}

// ─── Chargement ───────────────────────────────────────────────────────────────
const loadSession = async () => {
  loading.value = true
  const result  = await getSessionForStudent(sessionId)

  if (result.success && result.data) {
    session.value      = result.data
    questions.value    = result.data.questions || []
    tempsRestant.value = result.data.temps_restant || 0

    // Fusionner les réponses existantes depuis l'API SANS écraser les réponses locales
    if (result.data.reponses_existantes) {
      const normalized = normaliserReponses(result.data.reponses_existantes)
      // On ne remplace que les questions sans réponse locale
      Object.keys(normalized).forEach(qId => {
        if (reponses[qId] === undefined) {
          reponses[qId] = normalized[qId]
        }
      })
    }

    if (tempsRestant.value <= 0 && result.data.status === 'active') {
      if (!soumissionAutoEffectuee.value) await soumettreReponses(true)
      verrouillerSession('Le temps imparti est écoulé. Vos réponses ont été soumises.')
    } else {
      demarrerTimer()
      await enterFullscreen()
    }
  } else if (result.message?.includes('terminée') || result.message?.includes('écoulé')) {
    verrouillerSession(result.message)
  } else {
    toast.error(result.message || 'Erreur lors du chargement')
    router.back()
  }

  loading.value = false
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────
onMounted(() => {
  restaurerDepuisLocal()   // ← d'abord restaurer
  loadSession()            // ← ensuite charger (fusionnera sans écraser)
  autoSaveInterval = setInterval(sauvegarderLocalement, 5000)
  setTimeout(initWebSocket, 1000)
  document.addEventListener('fullscreenchange', handleFullscreenChange)
})

onUnmounted(() => {
  if (timerInterval)    clearInterval(timerInterval)
  if (autoSaveInterval) clearInterval(autoSaveInterval)
  sauvegarderLocalement()
  exitFullscreen()
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  const socket = getSocket()
  if (socket) socket.off('session-force-ended')
})
</script>

<style scoped>
.modal-enter-active { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.modal-leave-active { transition: all 0.2s ease-in; }
.modal-enter-from   { opacity: 0; transform: scale(0.85); }
.modal-leave-to     { opacity: 0; transform: scale(0.9); }
</style>