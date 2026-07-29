<template>
  <div class="bg-[#f5f0e8] font-body min-h-screen">
    <StudentLayout>

      <h2 class="font-body text-xl font-extrabold text-[#1e3a2f] mb-6">Mes sessions</h2>

      <!-- Onglets -->
      <div class="mb-6 border-b">
        <nav class="flex gap-1">
          <button
            v-for="onglet in onglets" :key="onglet.id"
            @click="ongletActif = onglet.id; currentPage = 1"
            class="px-6 py-2 border-2 border-primary text-xs font-body font-semibold transition-all"
            :class="ongletActif === onglet.id ? 'text-white bg-primary' : 'text-primary hover:text-[#4a7c5e]'"
          >
            {{ onglet.nom }}
            <span v-if="onglet.count !== undefined" class="ml-1 bg-white/30 px-1.5 py-0.5 rounded-full text-[10px]">
              {{ onglet.count }}
            </span>
          </button>
        </nav>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"/>
      </div>

      <template v-else>
        <!-- Grille -->
        <section class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
          <template v-if="sessionsPaginées.length > 0">
            <div
              v-for="item in sessionsPaginées"
              :key="item.id"
              class="flex flex-col justify-between shadow-[1px_1px_7px_1px_rgba(0,0,0,0.08)] p-4 bg-white rounded-xl cursor-pointer hover:shadow-md transition-all"
              @click="voirDetails(item.session.id)"
            >
              <div>
                <div class="flex justify-between items-start gap-2 mb-1">
                  <p class="font-bold text-base font-body text-primary leading-snug line-clamp-2 flex-1">
                    {{ item.session.titre }}
                  </p>
                  <!-- Note si disponible -->
                  <span
                    v-if="item.score !== null && item.score !== undefined"
                    class="text-lg font-extrabold whitespace-nowrap font-body"
                    :class="getNoteColor(calculerNote(item))"
                  >
                    {{ calculerNote(item) }}/20
                  </span>
                </div>

                <p class="text-xs font-body text-gray-400 mb-3">
                  {{ formatDate(item.session.date_debut) }}
                </p>

                <div class="flex items-center gap-3 text-xs text-gray-400 mb-2">
                  <span class="flex items-center gap-1">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    {{ item.session.duree }} min
                  </span>
                  <span v-if="item.session.theme" class="text-gray-400">· {{ item.session.theme }}</span>
                </div>
              </div>

              <div class="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <span
                  class="inline-block px-3 py-1 rounded-full text-xs font-semibold"
                  :class="item.statut === 'termine' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'"
                >
                  {{ item.statut === 'termine' ? 'Terminé' : item.statut }}
                </span>
                <button
                  class="border border-primary text-primary text-xs font-semibold px-4 py-1.5 rounded-lg hover:bg-primary hover:text-white transition font-body"
                  @click.stop="voirDetails(item.session.id)"
                >
                  Voir détails
                </button>
              </div>
            </div>
          </template>

          <!-- Empty state -->
          <div v-else class="col-span-full bg-white border border-[#e2ddd4] rounded-xl p-10 text-center">
            <svg class="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
            <p class="text-gray-500 font-body text-sm">Aucune session trouvée</p>
          </div>
        </section>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex items-center justify-center gap-2">
          <button
            @click="currentPage--"
            :disabled="currentPage === 1"
            class="px-4 py-2 rounded-lg text-sm font-body font-semibold transition-all"
            :class="currentPage === 1 ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-secondary text-white hover:bg-secondary/80'"
          >
            ← Préc
          </button>

          <button
            v-for="p in totalPages" :key="p"
            @click="currentPage = p"
            class="w-9 h-9 rounded-full text-sm font-semibold font-body transition-all"
            :class="currentPage === p ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-100'"
          >
            {{ p }}
          </button>

          <button
            @click="currentPage++"
            :disabled="currentPage === totalPages"
            class="px-4 py-2 rounded-lg text-sm font-body font-semibold transition-all"
            :class="currentPage === totalPages ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-primary text-white hover:bg-primary/80'"
          >
            Suiv →
          </button>
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
const ongletActif        = ref('toutes')
const currentPage        = ref(1)
const parPage            = 9

const onglets = computed(() => [
  { id: 'toutes',    nom: 'Toutes',      count: historiqueSessions.value.length },
  { id: 'terminees', nom: 'Terminées',   count: historiqueSessions.value.filter(i => i.statut === 'termine').length },
  { id: 'publiees',  nom: 'Avec notes',  count: historiqueSessions.value.filter(i => i.statut === 'termine' && i.score > 0).length }
])

// ─── Sessions filtrées selon l'onglet ────────────────────────────────────────
const sessionsFiltrees = computed(() => {
  if (ongletActif.value === 'terminees')
    return historiqueSessions.value.filter(i => i.statut === 'termine')
  if (ongletActif.value === 'publiees')
    return historiqueSessions.value.filter(i => i.statut === 'termine' && i.score > 0)
  return historiqueSessions.value
})

const totalPages     = computed(() => Math.ceil(sessionsFiltrees.value.length / parPage))
const sessionsPaginées = computed(() => {
  const debut = (currentPage.value - 1) * parPage
  return sessionsFiltrees.value.slice(debut, debut + parPage)
})

// ─── Utils ────────────────────────────────────────────────────────────────────
const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString('fr-FR', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

// Calcul correct : score en points bruts / total points * 20
// Le backend renvoie note_sur_20 si disponible, sinon on utilise score
const calculerNote = (item) => {
  if (item.note_sur_20 !== undefined && item.note_sur_20 !== null)
    return parseFloat(item.note_sur_20).toFixed(1)
  // Fallback : si score <= 20 c'est déjà une note, sinon c'est des points
  return item.score <= 20
    ? parseFloat(item.score).toFixed(1)
    : (item.score).toFixed(1)
}

const getNoteColor = (note) => {
  const n = parseFloat(note)
  if (n >= 16) return 'text-green-600'
  if (n >= 14) return 'text-blue-600'
  if (n >= 12) return 'text-cyan-600'
  if (n >= 10) return 'text-yellow-600'
  return 'text-red-600'
}

// ─── Actions ──────────────────────────────────────────────────────────────────
const voirDetails = (sessionId) => navigateTo(`/students/sessions/${sessionId}/resultats`)

const loadHistorique = async () => {
  loading.value = true
  const result = await getHistorique()
  if (result.success) historiqueSessions.value = result.data || []
  else toast.error(result.message || 'Erreur lors du chargement')
  loading.value = false
}

onMounted(loadHistorique)
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>