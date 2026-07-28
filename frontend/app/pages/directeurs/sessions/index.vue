<template>
  <div class="bg-layout font-body min-h-screen">
    <AdminLayout>
      <div class="max-w-8xl mx-auto">

        <!-- En-tête -->
        <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h1 class="text-2xl font-extrabold font-body text-black">Sessions</h1>
          <span class="text-sm font-body text-black">{{ filteredSessions.length }} session(s)</span>
        </div>

        <!-- Filtres -->
        <div class="flex flex-wrap gap-3 mb-4">
          <!-- Statut -->
          <div class="flex gap-1">
            <button
              v-for="s in statusList" :key="s.value"
              @click="filters.status = s.value"
              class="px-3 py-22 rounded-sm text-sm font-body font-semibold transition-colors"
              :class="filters.status === s.value ? 'bg-blacky text-white' : 'bg-white text-black hover:bg-gray-100'"
            >
              {{ s.label }}
            </button>
          </div>

          <!-- Filière -->
          <select
            v-model="filters.filiereId"
            @change="filters.classeId = ''"
            class="px-3 py-2 bg-gray-300/80 placeholder:text-black placeholder:font-bold rounded-lg text-sm font-body focus:outline-none"
          >
            <option value="">Toutes les filières</option>
            <option v-for="f in filieres" :key="f.id" :value="f.id">{{ f.nom }}</option>
          </select>

          <!-- Classe -->
          <select
            v-model="filters.classeId"
            class="px-3 py-2 bg-gray-300/80 placeholder:text-black placeholder:font-bold rounded-lg text-sm font-body focus:outline-none"
            :disabled="!filters.filiereId"
          >
            <option value="">Toutes les classes</option>
            <option v-for="c in classesFiltrees" :key="c.id" :value="c.id">{{ c.nom }}</option>
          </select>

          <!-- Recherche -->
          <div class="relative flex-1 min-w-[200px]">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              v-model="filters.search"
              type="text"
              placeholder="Rechercher une session..."
              class="w-full pl-9 pr-4 py-2 bg-gray-300/80 placeholder:text-black placeholder:font-bold rounded-lg text-sm font-body focus:outline-none"
            />
          </div>
        </div>

        <!-- Tableau -->
        <div class="bg-white rounded-sm border border-gray-200 overflow-hidden">
          <div v-if="loading" class="p-12 text-center">
            <div class="animate-spin rounded-full h-6 w-6 border-2 border-[#3730a3] border-t-transparent mx-auto"/>
          </div>

          <div v-else-if="filteredSessions.length === 0" class="p-12 text-center">
            <svg class="w-12 h-12 text-black mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <p class="text-black text-sm font-body">Aucune session trouvée</p>
          </div>

          <table v-else class="w-full">
            <thead class="bg-blacky border-b border-gray-100">
              <tr>
                <th class="px-4 py-3 uppercase font-body text-left text-xs font-bold text-white">Session</th>
                <th class="px-4 py-3 uppercase font-body text-left text-xs font-bold text-white hidden md:table-cell">Professeur</th>
                <th class="px-4 py-3 uppercase font-body text-left text-xs font-bold text-white hidden lg:table-cell">Filière</th>
                <th class="px-4 py-3 uppercase font-body text-left text-xs font-bold text-white hidden lg:table-cell">Classe</th>
                <th class="px-4 py-3 uppercase font-body text-left text-xs font-bold text-white hidden lg:table-cell">Questions</th>
                  <th class="px-4 py-3 uppercase font-body text-center text-xs font-bold text-white hidden md:table-cell">Participants</th>

                <th class="px-4 py-3 uppercase font-body text-left text-xs font-bold text-white hidden lg:table-cell">Date</th>
                <th class="px-4 py-3 uppercase font-body text-left text-xs font-bold text-white hidden lg:table-cell">Durée</th>
                <th class="px-4 py-3 uppercase font-body text-center text-xs font-bold text-white">Statut</th>
                <th class="px-4 py-3 uppercase font-body text-center text-xs font-bold text-white">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-for="s in filteredSessions" :key="s.id" class="hover:bg-gray-50 border border-gray-200 transition-colors">

                <!-- Session -->
                <td class="px-4 py-3">
                  <p class="text-sm font-body font-semibold text-black">{{ s.titre }}</p>
                  <p class="text-xs font-body text-black">
                    {{ s.theme ? `${s.theme} · ` : '' }}
                  </p>

                </td>

                <!-- Professeur -->
                <td class="px-4 py-3 hidden md:table-cell border border-gray-200">
                  <div class="flex items-center gap-2">
                    <div class="w-7 h-7 rounded-full bg-secondary/30 flex items-center justify-center text-xs font-bold text-secondary shrink-0">
                      {{ s.professeur?.prenom?.[0] }}{{ s.professeur?.nom?.[0] }}
                    </div>
                    <p class="text-sm font-bold font-body text-black">{{ s.professeur?.prenom }} {{ s.professeur?.nom }}</p>
                  </div>
                </td>

                <!-- Classe -->
                <td class="px-4 py-3 hidden lg:table-cell border border-gray-200">
                  <p class="text-sm font-body text-black">{{ s.filiere }}</p>
                </td>
                <td class="px-4 py-3 hidden lg:table-cell border border-gray-200  ">
                  <p class="text-sm font-body text-black">{{ s.classe }}</p>
                </td>
                  <td class="px-4 py-3 hidden lg:table-cell border border-gray-200">
                  <p class="text-sm font-bold font-body text-black">{{ s.nb_questions }} question(s) · {{ s.duree }} min</p>
                </td>
                  <!-- Participants -->
                <td class="px-4 py-3 text-center hidden md:table-cell border border-gray-200">
                  <span class="text-sm font-body font-bold text-black">{{ s.nb_participants }}</span>
                </td>
                <td class="px-4 py-3 text-center hidden md:table-cell border border-gray-200">
                  <span class="text-xs font-body font-bold text-black">{{ new Date(s.date_debut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) }}</span>
                </td>
                <td class="px-4 py-3 text-center hidden md:table-cell border border-gray-200">
                  <span class="text-sm font-body font-bold text-black">{{ s.duree }} min</span>
                </td>

                <!-- Statut -->
                <td class="px-4 py-3 text-center border border-gray-200">
                  <span
                    class="inline-flex items-center gap-1 text-xs font-body font-semibold px-2 py-0.5 rounded-full"
                    :class="{
                      'bg-yellow-500 text-black': s.status === 'pending',
                      'bg-green-500 text-white':   s.status === 'active',
                      'bg-black text-white':     s.status === 'completed',
                      'bg-red-500 text-white':       s.status === 'cancelled',
                      'bg-blue-500 text-white':     s.status === 'draft',
                    }"
                  >

                    {{ statusLabel(s.status) }}
                  </span>
                </td>



                <!-- Actions -->
                <td class="px-4 py-3 border border-gray-200">
                  <div class="flex items-center justify-center gap-1.5">
                    <NuxtLink
                      :to="`/directeurs/sessions/${s.id}`"
                      class="inline-flex items-center gap-1 text-xs font-body font-semibold px-2.5 py-1.5 rounded-lg bg-blacky/80 text-white hover:bg-blacky transition-colors"
                    >
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                      </svg>
                      Détails
                    </NuxtLink>
                    <button
                      v-if="s.status === 'completed'"
                      @click="openStats(s)"
                      class="inline-flex items-center gap-1 text-xs font-body font-semibold px-2.5 py-1.5 rounded-lg bg-secondary/90 text-white hover:bg-secondary transition-colors"
                    >
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                      </svg>
                      Stats
                    </button>
                    <button
                      @click="duplicateSession(s)"
                      :disabled="duplicatingId === s.id"
                      class="inline-flex items-center gap-1 text-xs font-body font-semibold px-2.5 py-1.5 rounded-lg bg-gray-100 text-black hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                      </svg>
                      Dupliquer
                    </button>
                    <button
                      @click="deleteSession(s)"
                      class="inline-flex items-center gap-1 text-xs font-body font-semibold px-2.5 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                    >
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                      Supprimer
                    </button>
                  </div>
                </td>

              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modal Stats -->
      <Teleport to="body">
        <Transition name="stats-backdrop">
          <div v-if="showStatsModal" class="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/50" @click.self="showStatsModal = false">
            <Transition name="stats-pop" appear>
              <div v-if="showStatsModal" class="bg-white rounded-lg border border-gray-200 shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div class="flex items-center justify-between px-5 py-4 border-b border-gray-200">
                  <div class="min-w-0">
                    <h3 class="font-body font-extrabold text-black text-base truncate">{{ statsSession?.titre }}</h3>
                    <p v-if="!statsSession?.loading" class="font-body text-xs text-black/50 mt-0.5">
                      {{ statsSession?.participantsCount }} résultat(s) · moyenne {{ statsSession?.moyenneSur20 }}/20
                    </p>
                  </div>
                  <button @click="showStatsModal = false" class="shrink-0 text-black/40 hover:text-black transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                </div>

                <div class="p-5">
                  <div v-if="statsSession?.loading" class="flex justify-center py-12">
                    <div class="animate-spin rounded-full h-6 w-6 border-2 border-blacky border-t-transparent"/>
                  </div>
                  <div v-else-if="!statsSession?.participantsCount" class="py-8 text-center">
                    <p class="font-body text-sm text-black/50">Aucun résultat pour cette session.</p>
                  </div>
                  <StatsBarChart
                    v-else
                    title="Répartition des notes"
                    subtitle="Nombre d'étudiants par tranche de note (/20)"
                    :items="statsSession.distributionItems"
                    :min-height="220"
                  />
                </div>

                <div class="flex items-center justify-end px-5 py-3 bg-gray-50 border-t border-gray-200">
                  <button @click="showStatsModal = false" class="px-4 py-2 text-sm font-body font-semibold rounded-lg bg-white border border-gray-200 text-black hover:bg-gray-100 transition-colors">
                    Fermer
                  </button>
                </div>
              </div>
            </Transition>
          </div>
        </Transition>
      </Teleport>

    </AdminLayout>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from '~~/composables/useToast'
import { useConfirm } from '~~/composables/useConfirm'

const toast   = useToast()
const { confirm } = useConfirm()
const loading = ref(true)
const sessions = ref([])
const filieres = ref([])
const classes  = ref([])

const filters = ref({ status: '', filiereId: '', classeId: '', search: '' })

const statusList = [
  { value: '',          label: 'Toutes'    },
  { value: 'pending',   label: 'Pending' },
  { value: 'active',    label: 'En cours'  },
  { value: 'completed', label: 'Terminées' },
  { value: 'draft',     label: 'Brouillons'},
]

const statusLabel = (s) => {
  const map = { pending: 'Pending', active: 'Active', completed: 'Completed', cancelled: 'Cancelled', draft: 'Draft' }
  return map[s] || s
}

const apiFetch = async (url, options = {}) => {
  const config = useRuntimeConfig()
  const token  = useCookie('auth_token').value
  return await $fetch(`${config.public.apiBase}${url}`, {
    ...options,
    headers: { 'Authorization': `Bearer ${token}`, ...options.headers }
  })
}

const classesFiltrees = computed(() =>
  classes.value.filter(c => c.filiereId === filters.value.filiereId)
)

const filteredSessions = computed(() => {
  return sessions.value.filter(s => {
    const matchStatus   = !filters.value.status   || s.status === filters.value.status
    const matchFiliere  = !filters.value.filiereId || s.filiere === filieres.value.find(f => f.id === filters.value.filiereId)?.nom
    const matchClasse   = !filters.value.classeId  || s.classe  === classes.value.find(c => c.id === filters.value.classeId)?.nom
    const matchSearch   = !filters.value.search    || [s.titre, s.theme, s.professeur?.nom, s.professeur?.prenom]
      .some(v => v?.toLowerCase().includes(filters.value.search.toLowerCase()))
    return matchStatus && matchFiliere && matchClasse && matchSearch
  })
})

const loadData = async () => {
  loading.value = true
  try {
    const [sessRes, filRes, clsRes] = await Promise.all([
      apiFetch('/admin/sessions'),
      apiFetch('/admin/filieres'),
      apiFetch('/admin/classes')
    ])
    if (sessRes.success) sessions.value = sessRes.data
    if (filRes.success)  filieres.value = filRes.data
    if (clsRes.success)  classes.value  = clsRes.data
  } finally {
    loading.value = false
  }
}

const duplicatingId = ref(null)

const duplicateSession = async (session) => {
  const ok = await confirm({
    title: 'Dupliquer la session',
    message: `Une copie de "${session.titre}" sera créée avec des dates provisoires à redéfinir.`,
    confirmLabel: 'Dupliquer'
  })
  if (!ok) return

  duplicatingId.value = session.id
  try {
    const result = await apiFetch(`/admin/sessions/${session.id}/dupliquer`, { method: 'POST' })
    if (result.success) {
      toast.success(result.message || 'Session dupliquée')
      await navigateTo(`/directeurs/sessions/${result.data.id}`)
    } else {
      toast.error(result.message || 'Erreur lors de la duplication')
    }
  } catch (err) {
    toast.error(err?.data?.message || 'Erreur lors de la duplication')
  } finally {
    duplicatingId.value = null
  }
}

const deleteSession = async (session) => {
  const ok = await confirm({
    title: 'Supprimer la session',
    message: `Supprimer définitivement "${session.titre}" ? Cette action est irréversible.`,
    confirmLabel: 'Supprimer',
    danger: true
  })
  if (!ok) return
  try {
    await apiFetch(`/admin/sessions/${session.id}`, { method: 'DELETE' })
    toast.success('Session supprimée')
    await loadData()
  } catch (err) {
    toast.error(err?.data?.message || 'Erreur')
  }
}

// ─── Modal Stats ──────────────────────────────────────────────────────────────
const showStatsModal = ref(false)
const statsSession    = ref(null)

const distributionColors = ['#d97757', '#c9a95c', '#4a7c5e', '#054348']
const distributionLabels = ['0-5', '5-10', '10-15', '15-20']

const openStats = async (session) => {
  statsSession.value = { titre: session.titre, loading: true }
  showStatsModal.value = true
  try {
    const result = await apiFetch(`/admin/sessions/${session.id}`)
    if (!result.success) { toast.error('Erreur lors du chargement des statistiques'); showStatsModal.value = false; return }

    const notes = (result.data.participants || [])
      .map(p => p.note_sur_20)
      .filter(n => n !== null && n !== undefined)

    const distribution = [0, 0, 0, 0]
    for (const note of notes) {
      if (note < 5) distribution[0]++
      else if (note < 10) distribution[1]++
      else if (note < 15) distribution[2]++
      else distribution[3]++
    }

    const moyenne = notes.length > 0 ? notes.reduce((a, b) => a + b, 0) / notes.length : 0

    statsSession.value = {
      titre: session.titre,
      loading: false,
      participantsCount: notes.length,
      moyenneSur20: Math.round(moyenne * 100) / 100,
      distributionItems: distribution.map((count, i) => ({
        label: distributionLabels[i],
        value: count,
        color: distributionColors[i],
        displayValue: `${count}`
      }))
    }
  } catch (err) {
    toast.error(err?.data?.message || 'Erreur lors du chargement des statistiques')
    showStatsModal.value = false
  }
}

onMounted(() => loadData())
</script>

<style scoped>
.stats-backdrop-enter-active,
.stats-backdrop-leave-active {
  transition: opacity 0.2s ease;
}
.stats-backdrop-enter-from,
.stats-backdrop-leave-to {
  opacity: 0;
}

.stats-pop-enter-active {
  transition: opacity 0.22s ease, transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.stats-pop-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.stats-pop-enter-from {
  opacity: 0;
  transform: scale(0.92) translateY(12px);
}
.stats-pop-leave-to {
  opacity: 0;
  transform: scale(0.96) translateY(4px);
}
</style>
