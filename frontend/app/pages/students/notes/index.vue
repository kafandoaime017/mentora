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

        <!-- Barre de recherche -->
        <div class="mb-4">
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
            <input
              v-model="recherche"
              type="text"
              placeholder="Rechercher une session..."
              class="w-full pl-9 pr-10 py-2.5 bg-gray-200 rounded-xl text-sm font-body text-gray-700 placeholder-gray-600 focus:outline-none"
            />
            <button
              v-if="recherche"
              @click="recherche = ''"
              class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Liste notes -->
        <div v-if="sessionsAvecNotes.length > 0" class="space-y-3 mb-6">
          <div
  v-for="item in notesPaginées"
  :key="item.id"
  class="bg-white rounded-xl shadow-[1px_1px_7px_1px_rgba(0,0,0,0.06)] p-3 flex items-center justify-between gap-4 transition-all"
  :class="item.session.resultatsVisibles
    ? 'cursor-pointer hover:shadow-md'
    : 'opacity-90 cursor-not-allowed'"
  @click="item.session.resultatsVisibles ? voirDetails(item.session.id) : null"
>
  <div class="flex-1 min-w-0">
    <div class="flex items-center gap-2 mb-0.5">
      <p class="font-bold font-body text-gray-800 truncate">{{ item.session.titre }}</p>
      <!-- Badge masqué -->
      <span
        v-if="!item.session.resultatsVisibles"
        class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-yellow-200 text-yellow-900 whitespace-nowrap flex-shrink-0"
      >
        <!-- <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242"/>
        </svg> -->
        En attente
      </span>
    </div>
    <p class="text-xs text-gray-600 italic font-bold font-body">{{ formatDate(item.session.date_debut) }}</p>
    <p v-if="item.session.theme" class="text-xs text-gray-400 font-body mt-0.5">{{ item.session.theme }}</p>
  </div>

  <div class="flex items-center gap-3 flex-shrink-0">
    <!-- Si masqué : afficher un cadenas à la place de la note -->
    <template v-if="!item.session.resultatsVisibles">
      <div class="text-right">
        <div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mx-auto">
          <svg class="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
          </svg>
        </div>
        <!-- <p class="text-[10px] text-gray-800 font-body mt-1">Non publié</p> -->
      </div>
    </template>

    <!-- Si visible : afficher la note normalement -->
    <template v-else>
      <div class="hidden sm:flex flex-col items-end gap-1">
        <!-- <div class="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            class="h-full rounded-full transition-all"
            :class="getBarColor(calculerNote(item))"
            :style="{ width: (parseFloat(calculerNote(item)) / 20 * 100) + '%' }"
          />
        </div> -->
        <!-- <span class="text-[10px] text-gray-400 font-body">
          {{ item.score }}/{{ item.session.total_points || '?' }} pts
        </span> -->
      </div>
      <div class="flex">
        <p class="text-2xl font-bold font- leading-none" :class="getNoteColor(getNoteReference(item))">
          {{ calculerNote(item) }}
        </p>
        <p class="text-xl text-black font-bold ">/{{ item.session.total_points  }}</p>
      </div>
      <span
        class="hidden sm:inline-block px-3 py-1 rounded-full text-xs font-semibold font-body whitespace-nowrap"
        :class="getMentionClass(getNoteReference(item))"
      >
        {{ getMention(getNoteReference(item)) }}
      </span>
      <svg class="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
      </svg>
    </template>
  </div>
</div>

          <!-- Aucun résultat de recherche -->
          <div v-if="notesPaginées.length === 0 && recherche" class="bg-white rounded-xl p-8 text-center">
            <p class="text-gray-500 font-body text-sm">Aucun résultat pour "{{ recherche }}"</p>
          </div>
        </div>

        <!-- Empty state global -->
        <div v-else class="bg-white rounded-xl p-12 text-center ">
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
          </div>
          <p class="font-bold text-gray-800 font-body mb-1">Aucune note publiée</p>
          <p class="text-sm text-gray-600 font-body">
            Vos notes apparaîtront ici quand votre professeur les publiera.
          </p>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 mt-2">
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
import { ref, computed, watch, onMounted } from 'vue'
import { useStudent } from '~~/composables/useStudent'
import { useToast } from '~~/composables/useToast'

const { getHistorique } = useStudent()
const toast = useToast()


const loading            = ref(true)
const historiqueSessions = ref([])
const recherche          = ref('')
const currentPage        = ref(1)
const parPage            = 4

// ─── Sessions avec notes + filtre recherche ───────────────────────────────────
const sessionsAvecNotes = computed(() => {
  const base = historiqueSessions.value.filter(
    i => i.statut === 'termine' && (i.score ?? 0) > 0
  )
  if (!recherche.value.trim()) return base
  const q = recherche.value.toLowerCase().trim()
  return base.filter(i =>
    i.session.titre?.toLowerCase().includes(q) ||
    i.session.theme?.toLowerCase().includes(q)
  )
})



const totalPages    = computed(() => Math.ceil(sessionsAvecNotes.value.length / parPage))
const notesPaginées = computed(() => {
  const debut = (currentPage.value - 1) * parPage
  return sessionsAvecNotes.value.slice(debut, debut + parPage)
})

// Reset page quand on recherche
watch(recherche, () => { currentPage.value = 1 })

// ─── Utils ────────────────────────────────────────────────────────────────────
const calculerNote = (item) => {
  let note

  if (item.note_sur_20 !== undefined && item.note_sur_20 !== null) {
    note = parseFloat(item.note_sur_20)
  } else {
    note = parseFloat(item.score ?? 0)
  }

  return Number.isInteger(note) ? note : note.toFixed(1)
}

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

const getNoteReference = (item) => {
  if (item.note_sur_20 != null) {
    return parseFloat(item.note_sur_20)
  }

  const score = parseFloat(item.score ?? 0)
  const total = parseFloat(item.session.total_points ?? 0)

  if (!total) return 0

  return (score / total) * 20
}

// ─── Actions ──────────────────────────────────────────────────────────────────
const voirDetails = (sessionId) => navigateTo(`/students/notes/${sessionId}`)

onMounted(async () => {
  loading.value = true
  const result = await getHistorique()
  if (result.success) historiqueSessions.value = result.data || []
  else toast.error(result.message || 'Erreur')
  loading.value = false
})
</script>