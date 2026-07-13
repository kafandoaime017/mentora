<template>
  <div class="bg-[#f5f0e8] font-body min-h-screen">
    <StudentLayout>
      <div class="max-w-2xl mx-auto">

        <!-- Bouton retour -->
        <button
          @click="$router.back()"
          class="text-[#4a7c5e] flex bg-gray-200 hover:bg-gray-300 font-body font-bold px-3 py-2 rounded-lg hover:text-[#1e3a2f] transition-colors mb-4"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          <span class="text-sm font-semibold ml-1">Retour</span>
        </button>

        <!-- Loading -->
        <div v-if="loading" class="bg-white shadow-[1px_1px_3px_1px_rgba(0,0,0,0.16)] rounded-lg p-12 text-center">
          <div class="inline-block animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"/>
        </div>

        <!-- Résultats masqués -->
        <div v-else-if="hidden" class="bg-white rounded-xl p-12 text-center shadow-sm">
          <div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242"/>
            </svg>
          </div>
          <h2 class="text-xl font-bold text-gray-800 mb-2 font-body">Résultats non disponibles</h2>
          <p class="text-sm text-gray-500 font-body">Le professeur n'a pas encore publié les résultats.</p>
        </div>

        <template v-else-if="data">

          <!-- En-tête session -->
          <div class="bg-white shadow-[1px_1px_3px_1px_rgba(0,0,0,0.16)] rounded-lg overflow-hidden mb-4">
            <div class="border-b border-[#e2ddd4] p-4 bg-[#f5f0e8]/30 flex items-center justify-between">
              <div>
                <h1 class="font-body text-lg font-bold text-[#1e3a2f]">{{ data.session.titre }}</h1>
                <p class="text-xs text-gray-400 font-body mt-0.5">{{ formatDate(data.session.date_debut) }}</p>
              </div>
              <span class="inline-flex px-3 py-1 text-xs rounded-full font-semibold font-body bg-gray-200 text-gray-700">
                Terminé
              </span>
            </div>

            <!-- Score résumé -->
            <div class="p-4 grid grid-cols-3 gap-3">
              <div class="text-center bg-[#f5f0e8]/50 rounded-lg py-3">
                <p class="text-2xl font-extrabold font-body" :class="getNoteColor(data.resultats.note_sur_20)">
                  {{ data.resultats.note_sur_20 }}/20
                </p>
                <p class="text-xs text-gray-500 font-body mt-0.5">Note</p>
              </div>
              <div class="text-center bg-[#f5f0e8]/50 rounded-lg py-3">
                <p class="text-2xl font-extrabold font-body text-primary">
                  {{ data.resultats.points_obtenus }}/{{ data.resultats.total_points }}
                </p>
                <p class="text-xs text-gray-500 font-body mt-0.5">Points</p>
              </div>
              <div class="text-center bg-[#f5f0e8]/50 rounded-lg py-3">
                <p class="text-xl font-extrabold font-body" :class="getMentionClass(data.resultats.note_sur_20)">
                  {{ getMention(data.resultats.note_sur_20) }}
                </p>
                <p class="text-xs text-gray-500 font-body mt-0.5">Mention</p>
              </div>
            </div>

            <!-- Barre progression -->
           
          </div>

          <!-- Questions et réponses -->
          <div class="bg-white shadow-[1px_1px_3px_1px_rgba(0,0,0,0.16)] rounded-lg overflow-hidden mb-4">
            <div class="border-b border-[#e2ddd4] p-4 bg-[#f5f0e8]/30 flex items-center justify-between">
              <h3 class="font-body text-base font-bold text-[#1e3a2f]">Mes réponses</h3>
              <div class="flex gap-3 text-xs font-body">
                <span class="flex items-center gap-1">
                  <span class="w-3 h-3 rounded-full bg-primary inline-block"/>
                  Correct
                </span>
                <span class="flex items-center gap-1">
                  <span class="w-3 h-3 rounded-full bg-red-500 inline-block"/>
                  Incorrect
                </span>
                <span class="flex items-center gap-1">
                  <span class="w-3 h-3 rounded-full bg-green-100 border border-green-400 inline-block"/>
                  Manquée
                </span>
              </div>
            </div>

            <!-- Liste questions paginées -->
            <div class="divide-y divide-[#e2ddd4]">
              <div v-for="(question, idx) in questionsPaginées" :key="question.question_id" class="p-4">

                <!-- En-tête question -->
                <div class="flex justify-between items-start mb-3">
                  <div class="flex items-center gap-2 flex-1">
                    <span class="w-6 h-6 rounded-full bg-[#4a7c5e]/10 flex items-center justify-center text-xs font-bold shrink-0 text-[#1e3a2f]">
                      {{ (currentPage - 1) * parPage + idx + 1 }}
                    </span>
                    <span class="font-medium font-body text-sm text-gray-800">{{ question.texte }}</span>
                  </div>
                  <span
                    class="shrink-0 ml-2 text-xs font-body px-2 py-0.5 rounded-full"
                    :class="getQuestionResultClass(question)"
                  >
                    {{ getQuestionResultLabel(question) }}
                  </span>
                </div>

                <!-- Options -->
                <div class="ml-8">

                  <!-- QCM simple / multiple -->
                  <div v-if="question.type !== 'vrai_faux'" class="flex flex-wrap gap-2">
                    <div
                      v-for="(opt, optIdx) in question.options"
                      :key="optIdx"
                      class="px-3 py-1.5 rounded-full text-sm font-body transition-all"
                      :class="getOptionStyle(question, optIdx)"
                    >
                      {{ opt }}
                      <span v-if="getOptionStatus(question, optIdx) === 'correct'"   class="ml-1 font-bold">✓</span>
                      <span v-if="getOptionStatus(question, optIdx) === 'incorrect'" class="ml-1 font-bold">✗</span>
                      <span v-if="getOptionStatus(question, optIdx) === 'missed'"    class="ml-1 text-green-700 text-xs font-normal">(attendu)</span>
                    </div>
                  </div>

                  <!-- Vrai / Faux -->
                  <div v-else class="flex gap-3">
                    <div
                      v-for="(item) in [{label:'Vrai', val:0}, {label:'Faux', val:1}]"
                      :key="item.val"
                      class="px-4 py-2 font-body rounded-full text-sm"
                      :class="getOptionStyle(question, item.val)"
                    >
                      {{ item.label }}
                      <span v-if="getOptionStatus(question, item.val) === 'correct'"   class="ml-1 font-bold">✓</span>
                      <span v-if="getOptionStatus(question, item.val) === 'incorrect'" class="ml-1 font-bold">✗</span>
                      <span v-if="getOptionStatus(question, item.val) === 'missed'"    class="ml-1 text-xs font-normal">(attendu)</span>
                    </div>
                  </div>

                  <!-- Non répondu -->
                  <p v-if="!question.a_repondu" class="text-xs text-gray-400 font-body italic mt-1">
                    Aucune réponse fournie
                  </p>

                </div>
              </div>
            </div>

            <!-- Pagination -->
            <div class="border-t border-[#e2ddd4] p-3 flex items-center justify-between">
              <button
                @click="currentPage--" :disabled="currentPage === 1"
                class="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-semibold font-body transition-all"
                :class="currentPage === 1 ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-secondary text-white hover:bg-secondary/80'"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                </svg>
                Préc
              </button>

              <div class="flex gap-1">
                <button
                  v-for="p in totalPages" :key="p"
                  @click="currentPage = p"
                  class="w-7 h-7 rounded-full text-xs font-semibold font-body transition-all"
                  :class="currentPage === p ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'"
                >{{ p }}</button>
              </div>

              <button
                @click="currentPage++" :disabled="currentPage === totalPages"
                class="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-semibold font-body transition-all"
                :class="currentPage === totalPages ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-primary text-white hover:bg-primary/80'"
              >
                Suiv
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          </div>

        </template>

      </div>
    </StudentLayout>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useStudent } from '~~/composables/useStudent'
import { useToast } from '~~/composables/useToast'

const route = useRoute()
const { getSessionResult } = useStudent()
const toast = useToast()

const sessionId   = parseInt(route.params.id)
const loading     = ref(true)
const hidden      = ref(false)
const data        = ref(null)
const currentPage = ref(1)
const parPage     = 5

// ─── Pagination ───────────────────────────────────────────────────────────────
const totalPages       = computed(() => Math.ceil((data.value?.details?.length || 0) / parPage))
const questionsPaginées = computed(() => {
  if (!data.value?.details) return []
  const debut = (currentPage.value - 1) * parPage
  return data.value.details.slice(debut, debut + parPage)
})

// ─── Styles options ───────────────────────────────────────────────────────────
const getOptionStatus = (question, optIdx) => {
  const isSelected = question.reponse_donnee?.includes(optIdx)
  const isCorrect  = question.reponses_correctes?.includes(optIdx)
  if (isSelected && isCorrect)   return 'correct'
  if (isSelected && !isCorrect)  return 'incorrect'
  if (!isSelected && isCorrect)  return 'missed'
  return null
}

const getOptionStyle = (question, optIdx) => {
  const status = getOptionStatus(question, optIdx)
  if (status === 'correct')   return 'bg-primary text-white font-semibold'
  if (status === 'incorrect') return 'bg-red-500 text-white font-semibold'
  if (status === 'missed')    return 'bg-green-100 text-green-800 border border-green-400'
  return 'bg-gray-200 text-gray-700'
}

const getQuestionResultClass = (question) => {
  if (!question.a_repondu)   return 'bg-gray-100 text-gray-500'
  if (question.est_correcte) return 'bg-green-100 text-green-700'
  return 'bg-red-100 text-red-700'
}

const getQuestionResultLabel = (question) => {
  if (!question.a_repondu)   return 'Non répondu'
  if (question.est_correcte) return `+${question.points} pts`
  return '0 pt'
}

// ─── Utils ────────────────────────────────────────────────────────────────────
const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric'
  })
}

const getNoteColor = (note) => {
  const n = parseFloat(note)
  if (n >= 16) return 'text-green-600'
  if (n >= 12) return 'text-blue-600'
  if (n >= 10) return 'text-yellow-600'
  return 'text-red-600'
}

const getBarColor = (note) => {
  const n = parseFloat(note)
  if (n >= 16) return 'bg-green-500'
  if (n >= 12) return 'bg-blue-500'
  if (n >= 10) return 'bg-yellow-500'
  return 'bg-red-500'
}

const getMention = (note) => {
  const n = parseFloat(note)
  if (n >= 16) return 'Excellent'
  if (n >= 14) return 'Très bien'
  if (n >= 12) return 'Bien'
  if (n >= 10) return 'Passable'
  return 'Insuffisant'
}

const getMentionClass = (note) => {
  const n = parseFloat(note)
  if (n >= 16) return 'text-green-600'
  if (n >= 14) return 'text-blue-600'
  if (n >= 12) return 'text-cyan-600'
  if (n >= 10) return 'text-yellow-600'
  return 'text-red-600'
}

// ─── Chargement ───────────────────────────────────────────────────────────────
onMounted(async () => {
  loading.value = true
  const result = await getSessionResult(sessionId)
  if (result.success) {
    data.value = result.data
  } else if (result.code === 'RESULTS_HIDDEN') {
    hidden.value = true
  } else {
    toast.error(result.message || 'Erreur lors du chargement')
  }
  loading.value = false
})
</script>