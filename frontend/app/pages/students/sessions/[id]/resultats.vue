<template>
  <div class="bg-[#f5f0e8] font-body min-h-screen">
    <StudentLayout>
      <div class="max-w-3xl mx-auto px-4 py-6">
        
        <!-- Bouton retour -->
        <button 
          @click="$router.back()"
          class="flex items-center gap-2 text-[#4a7c5e] hover:text-[#1e3a2f] transition-colors mb-4"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          <span class="text-sm font-semibold">Retour</span>
        </button>

        <!-- Loading -->
        <div v-if="loading" class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
        </div>

        <!-- Résultats -->
        <div v-else>
          <!-- En-tête avec score -->
          <div class="bg-white shadow rounded-lg p-5 mb-6">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 class="text-2xl font-bold text-[#1e3a2f]">{{ session.titre }}</h1>
                <p class="text-sm text-gray-500 mt-1">Professeur: {{ session.professeur?.prenom }} {{ session.professeur?.nom }}</p>
              </div>
              <div class="text-center bg-gray-50 px-6 py-3 rounded-lg">
                <p class="text-xs text-gray-500">Votre note</p>
                <p class="text-3xl font-bold text-green-600">{{ noteSur20 }}/20</p>
                <p class="text-sm text-gray-500 mt-1">{{ totalPoints }} points sur {{ totalPointsMax }}</p>
              </div>
            </div>
            
            <!-- Barre de progression du score -->
            <div class="mt-4">
              <div class="flex justify-between text-xs text-gray-500 mb-1">
                <span>Score</span>
                <span>{{ pourcentage }}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2.5">
                <div class="bg-green-500 h-2.5 rounded-full transition-all duration-500" :style="{ width: `${pourcentage}%` }"></div>
              </div>
              <p class="text-sm text-gray-600 mt-2">{{ getMention(noteSur20) }}</p>
            </div>
          </div>

          <!-- Questions et réponses -->
          <div class="space-y-4">
            <div 
              v-for="(question, idx) in questions" 
              :key="question.id" 
              class="bg-white shadow rounded-lg overflow-hidden"
            >
              <!-- En-tête question -->
              <div class="bg-gray-50 p-4 border-b border-gray-200">
                <div class="flex justify-between items-start gap-4">
                  <div class="flex items-center gap-3">
                    <span class="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                      {{ idx + 1 }}
                    </span>
                    <h3 class="font-semibold text-[#1e3a2f]">{{ question.texte }}</h3>
                  </div>
                  <div class="flex items-center gap-3">
                    <span class="text-xs bg-gray-200 px-2 py-1 rounded-full text-gray-600">
                      {{ getTypeLabel(question.type) }}
                    </span>
                    <span class="text-sm font-semibold" :class="reponseEstCorrecte(question.id) ? 'text-green-600' : 'text-red-600'">
                      {{ reponseEstCorrecte(question.id) ? '+' : '' }}{{ question.points }} pts
                    </span>
                  </div>
                </div>
              </div>

              <!-- Corps question - version désactivée (consultation seule) -->
              <div class="p-5">
                <!-- QCM simple -->
                <div v-if="question.type === 'qcm'" class="space-y-2">
                  <div 
                    v-for="(opt, optIdx) in question.options" 
                    :key="optIdx"
                    class="flex items-center gap-3 p-3 rounded-xl border transition-all"
                    :class="{
                      'bg-green-50 border-green-500': estBonneReponse(question.id, optIdx) && estReponseChoisie(question.id, optIdx),
                      'bg-red-50 border-red-500': !estBonneReponse(question.id, optIdx) && estReponseChoisie(question.id, optIdx),
                      'bg-green-50 border-green-300 opacity-60': estBonneReponse(question.id, optIdx) && !estReponseChoisie(question.id, optIdx),
                      'border-gray-200': !estBonneReponse(question.id, optIdx) && !estReponseChoisie(question.id, optIdx)
                    }"
                  >
                    <div 
                      class="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                      :class="{
                        'border-green-500 bg-green-500': estBonneReponse(question.id, optIdx),
                        'border-red-500 bg-red-500': !estBonneReponse(question.id, optIdx) && estReponseChoisie(question.id, optIdx),
                        'border-gray-300': !estBonneReponse(question.id, optIdx) && !estReponseChoisie(question.id, optIdx)
                      }"
                    >
                      <div v-if="estBonneReponse(question.id, optIdx)" class="w-2 h-2 bg-white rounded-full"></div>
                      <svg v-else-if="estReponseChoisie(question.id, optIdx)" class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </div>
                    <span class="text-gray-700">{{ opt }}</span>
                    <div class="ml-auto flex gap-2">
                      <span v-if="estBonneReponse(question.id, optIdx)" class="text-xs text-green-600 font-semibold">✓ Bonne réponse</span>
                      <span v-if="estReponseChoisie(question.id, optIdx) && !estBonneReponse(question.id, optIdx)" class="text-xs text-red-600 font-semibold">✗ Votre réponse</span>
                    </div>
                  </div>
                </div>

                <!-- QCM multiple -->
                <div v-else-if="question.type === 'qcm_multiple'" class="space-y-2">
                  <div 
                    v-for="(opt, optIdx) in question.options" 
                    :key="optIdx"
                    class="flex items-center gap-3 p-3 rounded-xl border transition-all"
                    :class="{
                      'bg-green-50 border-green-500': estBonneReponse(question.id, optIdx) && estReponseChoisie(question.id, optIdx),
                      'bg-red-50 border-red-500': !estBonneReponse(question.id, optIdx) && estReponseChoisie(question.id, optIdx),
                      'bg-green-50 border-green-300 opacity-60': estBonneReponse(question.id, optIdx) && !estReponseChoisie(question.id, optIdx),
                      'border-gray-200': !estBonneReponse(question.id, optIdx) && !estReponseChoisie(question.id, optIdx)
                    }"
                  >
                    <div 
                      class="w-5 h-5 rounded border-2 flex items-center justify-center"
                      :class="{
                        'border-green-500 bg-green-500': estBonneReponse(question.id, optIdx),
                        'border-red-500 bg-red-500': !estBonneReponse(question.id, optIdx) && estReponseChoisie(question.id, optIdx),
                        'border-gray-300': !estBonneReponse(question.id, optIdx) && !estReponseChoisie(question.id, optIdx)
                      }"
                    >
                      <svg v-if="estBonneReponse(question.id, optIdx) || estReponseChoisie(question.id, optIdx)" class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path v-if="estBonneReponse(question.id, optIdx)" stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                        <path v-else-if="estReponseChoisie(question.id, optIdx) && !estBonneReponse(question.id, optIdx)" stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </div>
                    <span class="text-gray-700">{{ opt }}</span>
                    <div class="ml-auto flex gap-2">
                      <span v-if="estBonneReponse(question.id, optIdx)" class="text-xs text-green-600 font-semibold">✓ Bonne réponse</span>
                      <span v-if="estReponseChoisie(question.id, optIdx) && !estBonneReponse(question.id, optIdx)" class="text-xs text-red-600 font-semibold">✗ Votre réponse</span>
                    </div>
                  </div>
                </div>

                <!-- Vrai/Faux -->
                <div v-else-if="question.type === 'vrai_faux'" class="flex gap-4">
                  <div 
                    class="flex-1 p-3 rounded-xl text-center font-medium transition-all"
                    :class="{
                      'bg-green-500 text-white': estBonneReponse(question.id, 0) && estReponseChoisie(question.id, 0),
                      'bg-red-500 text-white': !estBonneReponse(question.id, 0) && estReponseChoisie(question.id, 0),
                      'bg-green-100 text-green-700 border border-green-300': estBonneReponse(question.id, 0) && !estReponseChoisie(question.id, 0),
                      'bg-gray-100 text-gray-500': !estBonneReponse(question.id, 0) && !estReponseChoisie(question.id, 0)
                    }"
                  >
                    Vrai
                    <span v-if="estBonneReponse(question.id, 0) && estReponseChoisie(question.id, 0)" class="ml-2">✓</span>
                    <span v-else-if="!estBonneReponse(question.id, 0) && estReponseChoisie(question.id, 0)" class="ml-2">✗</span>
                  </div>
                  <div 
                    class="flex-1 p-3 rounded-xl text-center font-medium transition-all"
                    :class="{
                      'bg-green-500 text-white': estBonneReponse(question.id, 1) && estReponseChoisie(question.id, 1),
                      'bg-red-500 text-white': !estBonneReponse(question.id, 1) && estReponseChoisie(question.id, 1),
                      'bg-green-100 text-green-700 border border-green-300': estBonneReponse(question.id, 1) && !estReponseChoisie(question.id, 1),
                      'bg-gray-100 text-gray-500': !estBonneReponse(question.id, 1) && !estReponseChoisie(question.id, 1)
                    }"
                  >
                    Faux
                    <span v-if="estBonneReponse(question.id, 1) && estReponseChoisie(question.id, 1)" class="ml-2">✓</span>
                    <span v-else-if="!estBonneReponse(question.id, 1) && estReponseChoisie(question.id, 1)" class="ml-2">✗</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStudent } from '~~/composables/useStudent'
import { useToast } from '~~/composables/useToast'

const route = useRoute()
const router = useRouter()
const { getSessionForStudent } = useStudent()
const toast = useToast()

const sessionId = parseInt(route.params.id)
const loading = ref(true)
const session = ref({})
const questions = ref([])
const reponses = ref({})
const totalPointsMax = ref(0)

const totalPoints = computed(() => {
  let points = 0
  for (const q of questions.value) {
    if (reponseEstCorrecte(q.id)) {
      points += q.points
    }
  }
  return points
})

const pourcentage = computed(() => {
  if (totalPointsMax.value === 0) return 0
  return Math.round((totalPoints.value / totalPointsMax.value) * 100)
})

const noteSur20 = computed(() => {
  if (totalPointsMax.value === 0) return 0
  return ((totalPoints.value / totalPointsMax.value) * 20).toFixed(1)
})

const getTypeLabel = (type) => {
  const labels = {
    qcm: 'Choix unique',
    qcm_multiple: 'Choix multiples',
    vrai_faux: 'Vrai / Faux'
  }
  return labels[type] || type
}

const getMention = (note) => {
  if (note >= 16) return '✨ Excellent ! Félicitations !'
  if (note >= 14) return '🌟 Très bien !'
  if (note >= 12) return '👍 Bien'
  if (note >= 10) return '📚 Passable'
  return '💪 À améliorer, ne lâchez rien !'
}

const estBonneReponse = (questionId, optIndex) => {
  const question = questions.value.find(q => q.id === questionId)
  if (!question) return false
  return question.reponses_correctes?.includes(optIndex) || false
}

const estReponseChoisie = (questionId, optIndex) => {
  const reponse = reponses.value[questionId]
  if (!reponse) return false
  if (Array.isArray(reponse)) {
    return reponse.includes(optIndex)
  }
  return reponse === optIndex
}

const reponseEstCorrecte = (questionId) => {
  const reponse = reponses.value[questionId]
  const question = questions.value.find(q => q.id === questionId)
  if (!reponse || !question) return false
  
  if (Array.isArray(reponse)) {
    return JSON.stringify(reponse.sort()) === JSON.stringify(question.reponses_correctes?.sort())
  }
  return reponse === question.reponses_correctes?.[0]
}

const loadSession = async () => {
  loading.value = true
  const result = await getSessionForStudent(sessionId)
  
  if (result.success && result.data) {
    session.value = result.data
    questions.value = result.data.questions || []
    totalPointsMax.value = result.data.total_points || 0
    
    if (result.data.reponses_existantes) {
      reponses.value = result.data.reponses_existantes
    }
  } else {
    toast.error(result.message || 'Erreur lors du chargement')
    router.back()
  }
  loading.value = false
}

onMounted(() => {
  loadSession()
})
</script>

<style scoped>
/* Styles supplémentaires si nécessaire */
</style>