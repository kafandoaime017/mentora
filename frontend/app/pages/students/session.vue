<template>
  <div class="bg-[#f5f0e8] font-body min-h-screen">
    <StudentLayout>
      
      <!-- En-tête avec timer et progression -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <button 
          @click="confirmerQuitter"
          class="flex items-center gap-2 text-primary hover:text-secondary transition-colors w-fit"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          <span class="text-sm font-semibold">Quitter le QCM</span>
        </button>

        <div class="flex items-center gap-6">
          <div class="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-[1px_1px_7px_1px_rgba(0,0,0,0.08)]">
            <svg class="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span class="text-xl font-bold text-primary" :class="{ 'text-red-600': tempsRestant <= 60 }">
              {{ formatTemps(tempsRestant) }}
            </span>
          </div>
          <div class="text-sm text-[#6b6b6b]">
            Question {{ currentIndex + 1 }} / {{ questions.length }}
          </div>
        </div>
      </div>

      <div class="max-w-4xl mx-auto">
        
        <!-- ══════════════════════════
             CARTE QUESTION
        ═══════════════════════════════ -->
        <div class="bg-white shadow-[1px_1px_7px_1px_rgba(0,0,0,0.16)] border border-[#e2ddd4] rounded-lg p-6 mb-6">
          

          <!-- Question -->
          <h2 class="font-bold text-xl font-body text-primary mb-6">
            {{ questions[currentIndex].texte }}
          </h2>

          <!-- RENDER SELON LE TYPE DE QUESTION -->
          
          <!-- 1. RADIO (Choix unique) -->
          <div v-if="questions[currentIndex].type === 'radio'" class="space-y-3 mb-8">
            <div 
              v-for="(option, optIndex) in questions[currentIndex].options"
              :key="optIndex"
              @click="reponseRadio(optIndex)"
              class="flex items-center font-body gap-3 p-4 border border-[#e2ddd4] rounded-lg cursor-pointer transition-all"
              :class="{
                'bg-secondary/10 border-secondary': getReponse(currentIndex) === optIndex,
                'hover:bg-[#f5f0e8] hover:border-secondary/50': getReponse(currentIndex) !== optIndex
              }"
            >
              <div 
                class="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                :class="getReponse(currentIndex) === optIndex ? 'border-secondary bg-secondary' : 'border-[#ccc7bc]'"
              >
                <div v-if="getReponse(currentIndex) === optIndex" class="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <span class="text-primary">{{ option }}</span>
            </div>
          </div>

          <!-- 2. CHECKBOX (Choix multiples) -->
          <div v-if="questions[currentIndex].type === 'checkbox'" class="space-y-3 mb-8">
            <div 
              v-for="(option, optIndex) in questions[currentIndex].options"
              :key="optIndex"
              @click="reponseCheckbox(optIndex)"
              class="flex items-center font-body gap-3 p-4 border border-[#e2ddd4] rounded-lg cursor-pointer transition-all hover:bg-[#f5f0e8]"
            >
              <div 
                class="w-5 h-5 rounded border-2 flex items-center justify-center"
                :class="isCheckboxChecked(currentIndex, optIndex) ? 'border-secondary bg-secondary' : 'border-[#ccc7bc]'"
              >
                <svg v-if="isCheckboxChecked(currentIndex, optIndex)" class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <span class="text-primary">{{ option }}</span>
            </div>
          </div>

          <!-- 3. INPUT TEXTE -->
          <div v-if="questions[currentIndex].type === 'input'" class="mb-8">
            <input 
              v-model="reponsesInput[currentIndex]"
              type="text"
              :placeholder="questions[currentIndex].placeholder || 'Votre réponse...'"
                  class="w-full pl-4 pfont-body pr-4 py-3 text-sm text-gray-800 placeholder-gray-600 focus:text-md focus:text-black focus:font-extrabold bg-input border-gray-200 rounded-xl focus:bg-input focus:outline-none"
            />
        
          </div>

          <!-- 4. VRAI / FAUX -->
          <div v-if="questions[currentIndex].type === 'vf'" class="flex gap-4 mb-8">
            <button
              @click="reponseVF(true)"
              class="flex-1 py-4 rounded-lg font-body border-2 font-semibold transition-all"
              :class="getReponse(currentIndex) === true 
                ? 'bg-secondary/20 border-secondary text-secondary' 
                : 'border-[#e2ddd4] text-primary hover:border-secondary/50'"
            >
               Vrai
            </button>
            <button
              @click="reponseVF(false)"
              class="flex-1 py-4 rounded-lg font-body border-2 font-semibold transition-all"
              :class="getReponse(currentIndex) === false 
                ? 'bg-secondary/20 border-secondary text-secondary' 
                : 'border-[#e2ddd4] text-primary hover:border-secondary/50'"
            >
               Faux
            </button>
          </div>

          <!-- 5. SELECT (Liste déroulante) -->
          <div v-if="questions[currentIndex].type === 'select'" class="mb-8">
            <select 
              v-model="reponsesSelect[currentIndex]"
              class="w-full border font-body border-[#ccc7bc] rounded-lg px-4 py-3 text-primary bg-white outline-none focus:border-secondary transition-colors"
            >
              <option value="" disabled>-- Sélectionnez une réponse --</option>
              <option v-for="(option, optIndex) in questions[currentIndex].options" :key="optIndex" :value="optIndex">
                {{ option }}
              </option>
            </select>
          </div>

          <!-- 6. NUMBER (Note ou valeur numérique) -->
          <div v-if="questions[currentIndex].type === 'number'" class="mb-8">
            <input 
              v-model.number="reponsesNumber[currentIndex]"
              type="number"
              :min="questions[currentIndex].min || 0"
              :max="questions[currentIndex].max || 20"
              :step="questions[currentIndex].step || 1"
              class="w-32 border border-[#ccc7bc] font-body rounded-lg px-4 py-3 text-primary bg-white outline-none focus:border-secondary transition-colors"
            />
            <p v-if="questions[currentIndex].unite" class="text-xs text-[#9b9589] mt-2">
              Unité : {{ questions[currentIndex].unite }}
            </p>
          </div>

          <!-- 7. TEXTE LONG (textarea) -->
          <div v-if="questions[currentIndex].type === 'textarea'" class="mb-8">
            <textarea 
              v-model="reponsesTextarea[currentIndex]"
              :rows="4"
              :placeholder="questions[currentIndex].placeholder || 'Votre réponse...'"
              class="w-full border border-[#ccc7bc] font-body rounded-lg px-4 py-3 text-primary bg-white placeholder-[#b0aa9f] outline-none focus:border-secondary transition-colors resize-none"
            ></textarea>
          </div>

          <!-- Navigation -->
          <div class="flex items-center justify-between gap-4 pt-4 border-t border-[#e2ddd4]">
            <button 
              @click="questionPrecedente"
              :disabled="currentIndex === 0"
              class="flex items-center gap-2 px-4 font-body py-2 rounded-lg text-sm font-semibold transition"
              :class="currentIndex === 0 
                ? 'text-[#ccc7bc] cursor-not-allowed' 
                : 'text-primary hover:bg-[#f5f0e8]'"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
              Précédent
            </button>

            <div class="flex gap-2">
              <button 
                v-for="(q, idx) in questions"
                :key="idx"
                @click="allerQuestion(idx)"
                class="w-8 h-8 font-body rounded-full text-xs font-semibold transition"
                :class="{
                  'bg-secondary text-white': currentIndex === idx,
                  'bg-primary/20 text-primary': currentIndex !== idx && isQuestionRepondue(idx),
                  'bg-[#e2ddd4] text-[#9b9589]': currentIndex !== idx && !isQuestionRepondue(idx)
                }"
              >
                {{ idx + 1 }}
              </button>
            </div>

            <button 
              v-if="currentIndex < questions.length - 1"
              @click="questionSuivante"
              class="flex items-center gap-2 font-body px-4 py-2 rounded-lg text-sm font-semibold text-primary hover:bg-[#f5f0e8] transition"
            >
              Suivant
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>

            <button 
              v-else
              @click="ouvrirModalConfirmation"
              class="bg-secondary text-white font-body px-6 py-2 rounded-lg text-sm font-semibold hover:bg-secondary/80 transition"
            >
              Envoyer mon travail
            </button>
          </div>

        </div>

      

      </div>

    </StudentLayout>

    <!-- MODAL CONFIRMATION -->
    <div v-if="modalVisible" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="fermerModal">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div class="border-b border-[#e2ddd4] p-4">
          <h3 class="text-lg font-bold text-primary">Confirmer l'envoi</h3>
        </div>
        <div class="p-4">
          <p class="text-[#6b6b6b] mb-4">
            Vous avez répondu à <strong>{{ reponsesCount }}</strong> question(s) sur <strong>{{ questions.length }}</strong>.
          </p>
          <p class="text-sm text-amber-600 mb-4">
            ⚠️ Attention : Une fois envoyé, vous ne pourrez plus modifier vos réponses.
          </p>
          <div class="flex gap-3 justify-end">
            <button @click="fermerModal" class="px-4 py-2 border border-[#ccc7bc] rounded-lg text-sm font-semibold text-[#6b6b6b] hover:bg-[#f5f0e8] transition">Annuler</button>
            <button @click="envoyerTravail" class="px-4 py-2 bg-secondary text-white rounded-lg text-sm font-semibold hover:bg-secondary/80 transition">Confirmer</button>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL TEMPS ÉCOULÉ -->
    <div v-if="tempsEcouleVisible" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full text-center p-6">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <h3 class="text-xl font-bold text-primary mb-2">Temps écoulé !</h3>
        <p class="text-[#6b6b6b] mb-6">Le temps imparti est terminé. Vos réponses ont été automatiquement enregistrées.</p>
        <button @click="envoyerAuto" class="bg-secondary text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-secondary/80 transition">Voir les résultats</button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from '#app'

const route = useRoute()
const router = useRouter()
const sessionId = route.params.id

// Types de questions
const questions = ref([
  {
    id: 1,
    type: 'radio',
    texte: 'Quelle est la dérivée de f(x) = x² ?',
    options: ['2x', 'x²', '2', 'x']
  },
  {
    id: 2,
    type: 'vf',
    texte: 'La limite de sin(x)/x quand x tend vers 0 est égale à 0.',
  },
  {
    id: 3,
    type: 'checkbox',
    texte: 'Parmi ces langages, lesquels sont des langages backend ?',
    options: ['Python', 'JavaScript', 'HTML', 'PHP', 'CSS']
  },
  {
    id: 4,
    type: 'input',
    texte: 'Quelle est la capitale de la France ?',
    placeholder: 'Entrez une ville...',
    indice: 'Commence par la lettre P'
  },
  {
    id: 5,
    type: 'select',
    texte: 'Quel est le framework JavaScript le plus populaire ?',
    options: ['React', 'Vue.js', 'Angular', 'Svelte']
  },
  {
    id: 6,
    type: 'number',
    texte: 'Combien font 7 × 8 ?',
    min: 0,
    max: 100,
    unite: 'unités'
  },
  {
    id: 7,
    type: 'textarea',
    texte: 'Expliquez en quelques mots ce qu\'est une API REST.',
    placeholder: 'Votre explication...'
  }
])

// Stockage des réponses par type
const reponsesRadio = ref(new Array(questions.value.length).fill(undefined))
const reponsesCheckbox = ref(new Array(questions.value.length).fill([]))
const reponsesInput = ref(new Array(questions.value.length).fill(''))
const reponsesVF = ref(new Array(questions.value.length).fill(undefined))
const reponsesSelect = ref(new Array(questions.value.length).fill(''))
const reponsesNumber = ref(new Array(questions.value.length).fill(null))
const reponsesTextarea = ref(new Array(questions.value.length).fill(''))

// Index courant
const currentIndex = ref(0)

// Timer
const tempsTotal = 60 // 10 minutes
const tempsRestant = ref(tempsTotal)
let timerInterval = null

// Modals
const modalVisible = ref(false)
const tempsEcouleVisible = ref(false)

// Récupérer la réponse selon le type
function getReponse(index) {
  const type = questions.value[index].type
  if (type === 'radio') return reponsesRadio.value[index]
  if (type === 'vf') return reponsesVF.value[index]
  if (type === 'select') return reponsesSelect.value[index]
  return null
}

// Vérifier si checkbox est cochée
function isCheckboxChecked(qIndex, optIndex) {
  return reponsesCheckbox.value[qIndex]?.includes(optIndex) || false
}

// Gestionnaires de réponses
function reponseRadio(optIndex) {
  reponsesRadio.value[currentIndex.value] = optIndex
}

function reponseCheckbox(optIndex) {
  const current = reponsesCheckbox.value[currentIndex.value] || []
  if (current.includes(optIndex)) {
    reponsesCheckbox.value[currentIndex.value] = current.filter(i => i !== optIndex)
  } else {
    reponsesCheckbox.value[currentIndex.value] = [...current, optIndex]
  }
}

function reponseVF(valeur) {
  reponsesVF.value[currentIndex.value] = valeur
}

// Vérifier si une question est répondue
function isQuestionRepondue(index) {
  const type = questions.value[index].type
  if (type === 'radio') return reponsesRadio.value[index] !== undefined
  if (type === 'checkbox') return (reponsesCheckbox.value[index] || []).length > 0
  if (type === 'input') return reponsesInput.value[index]?.trim() !== ''
  if (type === 'vf') return reponsesVF.value[index] !== undefined
  if (type === 'select') return reponsesSelect.value[index] !== ''
  if (type === 'number') return reponsesNumber.value[index] !== null
  if (type === 'textarea') return reponsesTextarea.value[index]?.trim() !== ''
  return false
}

// Compteur de réponses
const reponsesCount = computed(() => {
  let count = 0
  for (let i = 0; i < questions.value.length; i++) {
    if (isQuestionRepondue(i)) count++
  }
  return count
})

// Navigation
function questionSuivante() {
  if (currentIndex.value < questions.value.length - 1) {
    currentIndex.value++
  }
}

function questionPrecedente() {
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}

function allerQuestion(index) {
  currentIndex.value = index
}

// Badge type
function getTypeLabel(type) {
  const labels = {
    radio: 'Choix unique',
    checkbox: 'Choix multiples',
    input: 'Réponse courte',
    vf: 'Vrai / Faux',
    select: 'Liste déroulante',
    number: 'Valeur numérique',
    textarea: 'Réponse développée'
  }
  return labels[type] || type
}

function getTypeBadgeClass(type) {
  const classes = {
    radio: 'bg-blue-100 text-blue-700',
    checkbox: 'bg-purple-100 text-purple-700',
    input: 'bg-green-100 text-green-700',
    vf: 'bg-orange-100 text-orange-700',
    select: 'bg-cyan-100 text-cyan-700',
    number: 'bg-indigo-100 text-indigo-700',
    textarea: 'bg-pink-100 text-pink-700'
  }
  return classes[type] || 'bg-gray-100 text-gray-700'
}

// Format temps
function formatTemps(secondes) {
  const minutes = Math.floor(secondes / 60)
  const secs = secondes % 60
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// Timer
function demarrerTimer() {
  timerInterval = setInterval(() => {
    if (tempsRestant.value > 0) {
      tempsRestant.value--
    } else {
      arreterTimer()
      tempsEcouleVisible.value = true
    }
  }, 1000)
}

function arreterTimer() {
  if (timerInterval) clearInterval(timerInterval)
}

// Envoi
function ouvrirModalConfirmation() {
  modalVisible.value = true
}

function fermerModal() {
  modalVisible.value = false
}

function envoyerTravail() {
  arreterTimer()
  modalVisible.value = false
  
  const toutesReponses = {
    radio: reponsesRadio.value,
    checkbox: reponsesCheckbox.value,
    input: reponsesInput.value,
    vf: reponsesVF.value,
    select: reponsesSelect.value,
    number: reponsesNumber.value,
    textarea: reponsesTextarea.value
  }
  
  console.log('Travail envoyé !', { sessionId, toutesReponses })
  router.push(`/session/${sessionId}/resultat`)
}

function envoyerAuto() {
  tempsEcouleVisible.value = false
  envoyerTravail()
}

function confirmerQuitter() {
  if (confirm('Voulez-vous vraiment quitter ? Vos réponses non envoyées seront perdues.')) {
    arreterTimer()
    router.back()
  }
}

onMounted(() => {
  demarrerTimer()
})

onUnmounted(() => {
  arreterTimer()
})
</script>