<template>
  <div class="bg-[#f5f0e8] font-body min-h-screen">
    <StudentLayout>

      <h2 class="font-body text-xl font-extrabold text-[#1e3a2f] mb-6">Mes sessions</h2>

      <!-- Onglets -->
      <div class="mb-6">
        <div class="border-b">
          <nav class="flex gap-1" aria-label="Tabs">
            <button
              v-for="onglet in onglets"
              :key="onglet.id"
              @click="changerOnglet(onglet.id)"
              class="px-6 py-2 border border-2 border-primary text-xs font-body font-semibold transition-all duration-200 relative"
              :class="ongletActif === onglet.id ? 'text-white bg-primary' : 'text-primary hover:text-[#4a7c5e]'"
            >
              {{ onglet.nom }}
              <span v-if="ongletActif === onglet.id" class="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary rounded-full"/>
            </button>
          </nav>
        </div>
      </div>

      <!-- Loading global -->
      <div v-if="loading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"/>
      </div>

      <!-- Loading onglet -->
      <div v-else-if="loadingOnglet" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-2 border-secondary border-t-transparent"/>
      </div>

      <template v-else>

        <!-- Toutes les sessions -->
        <section v-if="ongletActif === 'toutes'">
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
            <div
              v-for="item in sessionsPaginées"
              :key="item.id"
              class="flex flex-col justify-between shadow-[1px_1px_7px_1px_rgba(0,0,0,0.08)] p-4 bg-white rounded-xl transition-all"
              :class="item.statut === 'termine' && item.session.resultatsVisibles
                ? 'cursor-pointer hover:shadow-md'
                : 'cursor-default'"
              @click="item.statut === 'termine' && item.session.resultatsVisibles ? voirDetails(item.session.id) : null"
            >
              <div>
                <div class="flex justify-between items-start gap-2 mb-1">
                  <p class="font-extrabold text-base font-body text-black leading-snug line-clamp-2 flex-1">
                    {{ item.session.titre }}
                  </p>
                  <span
                    v-if="item.statut === 'termine'"
                    class="flex-shrink-0 inline-flex font-body items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                    :class="item.session.resultatsVisibles ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'"
                  >
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path v-if="item.session.resultatsVisibles" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                      <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242"/>
                    </svg>
                    {{ item.session.resultatsVisibles ? 'Notes dispo' : 'En attente' }}
                  </span>
                </div>
                <p class="text-xs font-body text-gray-600 mb-3">{{ formatDate(item.session.date_debut) }}</p>
                <div class="flex items-center gap-2 text-xs text-gray-600">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span>{{ item.session.duree }} min</span>
                  <span v-if="item.session.theme" class="text-gray-300">·</span>
                  <span v-if="item.session.theme">{{ item.session.theme }}</span>
                </div>
              </div>

              <div class="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                <span
                  class="inline-block font-body px-3 py-1 rounded-full text-xs font-semibold"
                  :class="item.statut === 'termine' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'"
                >
                  {{ item.statut === 'termine' ? 'Terminé' : item.statut }}
                </span>
                <button
                  v-if="item.statut === 'termine' && item.session.resultatsVisibles"
                  class="border border-primary text-primary text-xs font-semibold px-4 py-1.5 rounded-lg hover:bg-primary hover:text-white transition font-body"
                  @click.stop="voirDetails(item.session.id)"
                >Voir notes</button>
                <span v-else-if="item.statut === 'termine'" class="text-xs text-gray-500 font-body italic">
                  Notes non publiées
                </span>
              </div>
            </div>

            <div v-if="historiqueSessions.length === 0" class="col-span-full bg-white border border-[#e2ddd4] rounded-lg p-8 text-center">
              <p class="text-gray-500 font-body text-sm">Vous n'avez pas encore participé à des sessions</p>
            </div>
          </div>

          <!-- Pagination toutes -->
          <div v-if="totalPagesToutes > 1" class="flex items-center justify-center gap-2">
            <button @click="currentPageToutes--" :disabled="currentPageToutes === 1"
              class="px-4 py-2 rounded-lg text-sm font-body font-semibold transition-all"
              :class="currentPageToutes === 1 ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-secondary text-white hover:bg-secondary/80'"
            >← Préc</button>
            <button v-for="p in totalPagesToutes" :key="p" @click="currentPageToutes = p"
              class="w-9 h-9 rounded-full text-sm font-semibold font-body transition-all"
              :class="currentPageToutes === p ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-100'"
            >{{ p }}</button>
            <button @click="currentPageToutes++" :disabled="currentPageToutes === totalPagesToutes"
              class="px-4 py-2 rounded-lg text-sm font-body font-semibold transition-all"
              :class="currentPageToutes === totalPagesToutes ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-primary text-white hover:bg-primary/80'"
            >Suiv →</button>
          </div>
        </section>

        <!-- Sessions terminées -->
        <section v-if="ongletActif === 'terminees'">
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
            <div
              v-for="item in sessionsTermineesPaginées"
              :key="item.id"
              class="flex flex-col justify-between shadow-[1px_1px_7px_1px_rgba(0,0,0,0.08)] p-4 bg-white rounded-xl transition-all"
              :class="item.session.resultatsVisibles ? 'cursor-pointer hover:shadow-md' : 'cursor-default'"
              @click="item.session.resultatsVisibles ? voirDetails(item.session.id) : null"
            >
              <div>
                <div class="flex justify-between items-start gap-2 mb-1">
                  <p class="font-extrabold text-base font-body text-black leading-snug line-clamp-2 flex-1">
                    {{ item.session.titre }}
                  </p>
                  <span
                    class="flex-shrink-0 inline-flex font-body items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                    :class="item.session.resultatsVisibles ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'"
                  >
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path v-if="item.session.resultatsVisibles" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                      <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242"/>
                    </svg>
                    {{ item.session.resultatsVisibles ? 'Notes dispo' : 'En attente' }}
                  </span>
                </div>
                <p class="text-xs font-body text-gray-600 mb-3">{{ formatDate(item.session.date_debut) }}</p>
                <div class="flex items-center gap-2 text-xs text-gray-600">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span>{{ item.session.duree }} min</span>
                  <span v-if="item.session.theme" class="text-gray-300">·</span>
                  <span v-if="item.session.theme">{{ item.session.theme }}</span>
                </div>
              </div>

              <div class="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                <span class="inline-block font-body px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                  Terminé
                </span>
                <button
                  v-if="item.session.resultatsVisibles"
                  class="border border-primary text-primary text-xs font-semibold px-4 py-1.5 rounded-lg hover:bg-primary hover:text-white transition font-body"
                  @click.stop="voirDetails(item.session.id)"
                >Voir notes</button>
                <span v-else class="text-xs text-gray-500 font-body italic">Notes non publiées</span>
              </div>
            </div>

            <div v-if="sessionsTerminees.length === 0" class="col-span-full bg-white border border-[#e2ddd4] rounded-lg p-8 text-center">
              <p class="text-gray-500 font-body text-sm">Vous n'avez pas encore de sessions terminées</p>
            </div>
          </div>

          <!-- Pagination terminées -->
          <div v-if="totalPagesTerminees > 1" class="flex items-center justify-center gap-2">
            <button @click="currentPageTerminees--" :disabled="currentPageTerminees === 1"
              class="px-4 py-2 rounded-lg text-sm font-body font-semibold transition-all"
              :class="currentPageTerminees === 1 ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-secondary text-white hover:bg-secondary/80'"
            >← Préc</button>
            <button v-for="p in totalPagesTerminees" :key="p" @click="currentPageTerminees = p"
              class="w-9 h-9 rounded-full text-sm font-semibold font-body transition-all"
              :class="currentPageTerminees === p ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-100'"
            >{{ p }}</button>
            <button @click="currentPageTerminees++" :disabled="currentPageTerminees === totalPagesTerminees"
              class="px-4 py-2 rounded-lg text-sm font-body font-semibold transition-all"
              :class="currentPageTerminees === totalPagesTerminees ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-primary text-white hover:bg-primary/80'"
            >Suiv →</button>
          </div>
        </section>

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
const loadingOnglet      = ref(false)
const ongletActif        = ref('toutes')
const historiqueSessions = ref([])

const parPage            = 6
const currentPageToutes  = ref(1)
const currentPageTerminees = ref(1)

const onglets = computed(() => [
  { id: 'toutes',    nom: 'Toutes',    count: historiqueSessions.value.length },
  { id: 'terminees', nom: 'Terminées', count: historiqueSessions.value.filter(i => i.statut === 'termine').length }
])

// ─── Changer onglet ───────────────────────────────────────────────────────────
const changerOnglet = (id) => {
  if (id === ongletActif.value) return
  loadingOnglet.value = true
  setTimeout(() => {
    ongletActif.value   = id
    loadingOnglet.value = false
  }, 300)
}

// ─── Computed ─────────────────────────────────────────────────────────────────
const sessionsTerminees = computed(() =>
  historiqueSessions.value.filter(i => i.statut === 'termine')
)

// Pagination toutes
const totalPagesToutes = computed(() =>
  Math.ceil(historiqueSessions.value.length / parPage)
)
const sessionsPaginées = computed(() => {
  const debut = (currentPageToutes.value - 1) * parPage
  return historiqueSessions.value.slice(debut, debut + parPage)
})

// Pagination terminées
const totalPagesTerminees = computed(() =>
  Math.ceil(sessionsTerminees.value.length / parPage)
)
const sessionsTermineesPaginées = computed(() => {
  const debut = (currentPageTerminees.value - 1) * parPage
  return sessionsTerminees.value.slice(debut, debut + parPage)
})

// ─── Utils ────────────────────────────────────────────────────────────────────
const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString('fr-FR', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

// ─── Actions ──────────────────────────────────────────────────────────────────
const voirDetails = (sessionId) => navigateTo(`/students/notes/${sessionId}`)

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