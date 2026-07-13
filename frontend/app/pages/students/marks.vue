<template>
  <div class="bg-[#f5f0e8] font-body min-h-screen">
    <StudentLayout>

      <h2 class="font-body text-xl font-extrabold text-[#1e3a2f] mb-1">Mes notes</h2>
      <p class="text-xs text-gray-400 font-body mb-6">Notes publiées par vos professeurs</p>

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"/>
      </div>

      <template v-else>

        <!-- Résumé stats -->
        <div v-if="sessionsAvecNotes.length > 0" class="grid grid-cols-3 gap-3 mb-6">
          <div class="bg-white rounded-xl p-4 text-center shadow-[1px_1px_7px_1px_rgba(0,0,0,0.06)]">
            <p class="text-2xl font-extrabold font-body" :class="getNoteColor(moyenneGenerale)">
              {{ moyenneGenerale }}/20
            </p>
            <p class="text-xs text-gray-400 font-body mt-1">Moyenne générale</p>
          </div>
          <div class="bg-white rounded-xl p-4 text-center shadow-[1px_1px_7px_1px_rgba(0,0,0,0.06)]">
            <p class="text-2xl font-extrabold font-body text-primary">{{ sessionsAvecNotes.length }}</p>
            <p class="text-xs text-gray-400 font-body mt-1">Notes publiées</p>
          </div>
          <div class="bg-white rounded-xl p-4 text-center shadow-[1px_1px_7px_1px_rgba(0,0,0,0.06)]">
            <p class="text-2xl font-extrabold font-body text-green-600">{{ nbReussies }}</p>
            <p class="text-xs text-gray-400 font-body mt-1">Réussites</p>
          </div>
        </div>

        <!-- Liste notes -->
        <div v-if="sessionsAvecNotes.length > 0" class="space-y-3 mb-6">
          <div
            v-for="item in notesPaginées"
            :key="item.id"
            class="bg-white rounded-xl shadow-[1px_1px_7px_1px_rgba(0,0,0,0.06)] p-4 flex items-center justify-between gap-4 cursor-pointer hover:shadow-md transition-all"
            @click="voirDetails(item.session.id)"
          >
            <div class="flex-1 min-w-0">
              <p class="font-bold font-body text-gray-800 truncate mb-0.5">{{ item.session.titre }}</p>
              <p class="text-xs text-gray-400 font-body">{{ formatDate(item.session.date_debut) }}</p>
              <p v-if="item.session.theme" class="text-xs text-gray-400 font-body mt-0.5">{{ item.session.theme }}</p>
            </div>

            <div class="flex items-center gap-3 flex-shrink-0">
              <!-- Barre mini -->
              <div class="hidden sm:flex flex-col items-end gap-1">
                <div class="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all"
                    :class="getBarColor(calculerNote(item))"
                    :style="{ width: (calculerNote(item) / 20 * 100) + '%' }"
                  />
                </div>
                <span class="text-[10px] text-gray-400 font-body">{{ item.score }}/{{ item.total_points || '?' }} pts</span>
              </div>

              <!-- Note -->
              <div class="text-right">
                <p class="text-2xl font-extrabold font-body leading-none" :class="getNoteColor(calculerNote(item))">
                  {{ calculerNote(item) }}
                </p>
                <p class="text-xs text-gray-400 font-body">/20</p>
              </div>

              <!-- Mention -->
              <span
                class="hidden sm:inline-block px-3 py-1 rounded-full text-xs font-semibold font-body whitespace-nowrap"
                :class="getMentionClass(calculerNote(item))"
              >
                {{ getMention(calculerNote(item)) }}
              </span>

              <svg class="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div v-else class="bg-white rounded-xl p-12 text-center shadow-[1px_1px_7px_1px_rgba(0,0,0,0.06)]">
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
          </div>
          <p class="font-bold text-gray-600 font-body mb-1">Aucune note publiée</p>
          <p class="text-sm text-gray-400 font-body">Vos notes apparaîtront ici quand votre professeur les publiera.</p>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex items-center justify-center gap-2">
          <button
            @click="currentPage--" :disabled="currentPage === 1"
            class="px-4 py-2 rounded-lg text-sm font-body font-semibold transition-all"
            :class="currentPage === 1 ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-secondary text-white hover:bg-secondary/80'"
          >← Préc</button>

          <button
            v-for="p in totalPages" :key="p"
            @click="currentPage = p"
            class="w-9 h-9 rounded-full text-sm font-semibold font-body transition-all"
            :class="currentPage === p ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-100'"
          >{{ p }}</button>

          <button
            @click="currentPage++" :disabled="currentPage === totalPages"
            class="px-4 py-2 rounded-lg text-sm font-body font-semibold transition-all"
            :class="currentPage === totalPages ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-primary text-white hover:bg-primary/80'"
          >Suiv →</button>
        </div>

      </template>

    </StudentLayout>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStudent } from '~~/composables/useStudent'
import { useToast } from '~~/composables/useToast'

const { getHistorique } = useStudent()
const toast = useToast()

const loading            = ref(true)
const historiqueSessions = ref([])
const currentPage        = ref(1)
const parPage            = 8

// Sessions avec notes publiées = terminées + score > 0
const sessionsAvecNotes = computed(() =>
  historiqueSessions.value.filter(i => i.statut === 'termine' && (i.score ?? 0) > 0)
)

const totalPages    = computed(() => Math.ceil(sessionsAvecNotes.value.length / parPage))
const notesPaginées = computed(() => {
  const debut = (currentPage.value - 1) * parPage
  return sessionsAvecNotes.value.slice(debut, debut + parPage)
})

const calculerNote = (item) => {
  if (item.note_sur_20 !== undefined && item.note_sur_20 !== null)
    return parseFloat(item.note_sur_20).toFixed(1)
  return parseFloat(item.score ?? 0).toFixed(1)
}

const moyenneGenerale = computed(() => {
  if (!sessionsAvecNotes.value.length) return '0.0'
  const total = sessionsAvecNotes.value.reduce((sum, i) => sum + parseFloat(calculerNote(i)), 0)
  return (total / sessionsAvecNotes.value.length).toFixed(1)
})

const nbReussies = computed(() =>
  sessionsAvecNotes.value.filter(i => parseFloat(calculerNote(i)) >= 10).length
)

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString('fr-FR', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}

const getNoteColor = (note) => {
  const n = parseFloat(note)
  if (n >= 16) return 'text-green-600'
  if (n >= 14) return 'text-blue-600'
  if (n >= 12) return 'text-cyan-600'
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
  if (n >= 16) return 'bg-green-100 text-green-700'
  if (n >= 14) return 'bg-blue-100 text-blue-700'
  if (n >= 12) return 'bg-cyan-100 text-cyan-700'
  if (n >= 10) return 'bg-yellow-100 text-yellow-700'
  return 'bg-red-100 text-red-700'
}

const voirDetails = (sessionId) => navigateTo(`/students/sessions/${sessionId}/resultats`)

onMounted(async () => {
  loading.value = true
  const result = await getHistorique()
  if (result.success) historiqueSessions.value = result.data || []
  else toast.error(result.message || 'Erreur')
  loading.value = false
})
</script>