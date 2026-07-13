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
                    <button
                      @click="openDetail(s)"
                      class="inline-flex items-center gap-1 text-xs font-body font-semibold px-2.5 py-1.5 rounded-lg bg-blacky/80 text-white hover:bg-blacky transition-colors"
                    >
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                      </svg>
                      Détails
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

    <!-- Modal détails session -->
    <div v-if="showDetail && selectedSession" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="showDetail = false">
      <div class="bg-white rounded-sm w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-200">

        <!-- Header -->
        <div class="px-5 py-4 border-b border-gray-100 flex items-start justify-between">
          <div class="flex-1 min-w-0">
            <h3 class="font-body font-bold text-black text-base truncate">{{ selectedSession.session?.titre }}</h3>
            <div class="flex items-center gap-2 mt-1 flex-wrap">
              <span class="text-sm font-body text-black">{{ selectedSession.session?.filiere }}</span>
              <span v-if="selectedSession.session?.classe" class="text-black">·</span>
              <span v-if="selectedSession.session?.classe" class="text-xs font-body text-black">{{ selectedSession.session?.classe }}</span>
              <span class="text-black">·</span>
              <span class="text-xs font-body text-black">{{ selectedSession.session?.professeur }}</span>
              <span class="text-black">·</span>
              <code class="text-xs font-mono text-black bg-gray-100 px-1.5 py-0.5 rounded">{{ selectedSession.session?.code }}</code>
            </div>
          </div>
          <div class="flex items-center gap-3 ml-4 shrink-0">
            <span
              class="text-xs font-body px-2.5 py-1 rounded-full font-semibold"
              :class="{
                'bg-yellow-100 text-yellow-700': selectedSession.session?.status === 'pending',
                'bg-green-100 text-green-700':   selectedSession.session?.status === 'active',
                'bg-gray-100 text-black':     selectedSession.session?.status === 'completed',
                'bg-blue-100 text-blue-700':     selectedSession.session?.status === 'draft',
              }"
            >
              {{ statusLabel(selectedSession.session?.status) }}
            </span>
            <button @click="showDetail = false" class="text-black hover:text-black transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="overflow-y-auto flex-1">

          <!-- Stats -->
          <div class="grid grid-cols-4 divide-x divide-gray-200 border-b border-gray-200">
            <div class="px-4 py-3 bg-secondary text-center">
              <p class="text-xl font-body font-bold text-white">{{ selectedSession.stats?.nb_questions }}</p>
              <p class="text-sm font-body text-white mt-0.5">Questions</p>
            </div>
            <div class="px-4 py-3 bg-blacky text-center">
              <p class="text-xl font-body font-bold text-white">{{ selectedSession.stats?.nb_participants }}</p>
              <p class="text-sm font-body text-white mt-0.5">Participants</p>
            </div>
            <div class="px-4 py-3 bg-secondary text-center">
              <p class="text-xl font-body font-bold text-white">{{ selectedSession.stats?.nb_termines }}</p>
              <p class="text-sm font-body text-white mt-0.5">Terminés</p>
            </div>
            <div class="px-4 py-3 bg-blacky text-center">
              <p class="text-xl font-body font-bold text-white">
                {{ selectedSession.stats?.moyenne_sur_20 }}<span class="text-xs font-normal text-black">/20</span>
              </p>
              <p class="text-sm font-body text-white mt-0.5">Moyenne</p>
            </div>
          </div>

          <!-- Infos -->
          <div class="px-5 py-4 border-b border-gray-100">
            <p class="text-xs font-body font-semibold text-black uppercase tracking-wider mb-3">Détails</p>
            <div class="grid grid-cols-2 gap-2">
              <div class="flex items-center justify-between py-1">
                <span class="text-sm font-bold font-body text-black">Durée</span>
                <span class="text-xs font-bold font-body text-black">{{ selectedSession.session?.duree }} min</span>
              </div>
              <div class="flex items-center justify-between py-1">
                <span class="text-xs font-bold font-body text-black">Total points</span>
                <span class="text-xs font-bold font-body text-black">{{ selectedSession.stats?.total_points }} pts</span>
              </div>
              <div class="flex items-center justify-between py-1">
                <span class="text-xs font-bold font-body text-black">Début</span>
                <span class="text-xs font-bold font-body text-black">
                  {{ selectedSession.session?.date_debut
                    ? new Date(selectedSession.session.date_debut).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
                    : '—' }}
                </span>
              </div>
              <div class="flex items-center justify-between py-1">
                <span class="text-xs font-bold font-body text-black">Fin</span>
                <span class="text-xs font-bold font-body text-black">
                  {{ selectedSession.session?.date_fin
                    ? new Date(selectedSession.session.date_fin).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
                    : '—' }}
                </span>
              </div>
              <div class="flex items-center justify-between py-1">
                <span class="text-xs font-bold font-body text-black">Taux complétion</span>
                <span class="text-xs font-bold font-body text-black">
                  {{ selectedSession.stats?.nb_participants > 0
                    ? Math.round((selectedSession.stats.nb_termines / selectedSession.stats.nb_participants) * 100)
                    : 0 }}%
                </span>
              </div>
              <div class="flex items-center justify-between py-1">
                <span class="text-xs font-bold font-body text-black">Résultats visibles</span>
                <span class="text-xs font-bold font-body" :class="selectedSession.session?.resultats_visibles ? 'text-green-600' : 'text-black'">
                  {{ selectedSession.session?.resultats_visibles ? 'Oui' : 'Non' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Participants -->
          <div class="px-3 py-4">
            <p class="text-xs font-body font-semibold text-black uppercase tracking-wider mb-3">
              Participants
              <span class="ml-1 normal-case font-normal">({{ selectedSession.participants?.length || 0 }})</span>
            </p>

            <div v-if="!selectedSession.participants?.length" class="py-8 text-center">
              <p class="text-sm font-body text-black">Aucun participant pour cette session</p>
            </div>

            <table v-else class="w-full ">
              <thead class="bg-primary ">
                <tr class="border border-gray-100">
                  <th class="pb-2 text-left text-xs font-body font-semibold text-white">Étudiant</th>
                  <th class="pb-2 text-center text-xs font-body font-semibold text-white">Note</th>
                  <th class="pb-2 text-center text-xs font-body font-semibold text-white hidden sm:table-cell">Score</th>
                  <th class="pb-2 text-center text-xs font-body font-semibold text-white">Statut</th>
                  <th class="pb-2 text-right text-xs font-body font-semibold text-white hidden md:table-cell">Terminé le</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="p in selectedSession.participants" :key="p.id"
                  class="border border-gray-100 hover:bg-gray-50/50 transition-colors"
                >
                  <td class="py-2.5 border border-gray-200">
                    <p class="font-body font-medium text-black text-sm">{{ p.etudiant.prenom }} {{ p.etudiant.nom }}</p>
                    <!-- <p class="font-body text-xs text-black">{{ p.etudiant.email }}</p> -->
                  </td>
                  <td class="py-2.5 text-center border border-gray-200">
                    <span
                      class="font-body font-bold text-sm"
                      :class="{
                        'text-blacky': p.note_sur_20 >= 14,
                        'text-amber-500': p.note_sur_20 >= 10 && p.note_sur_20 < 14,
                        'text-red-500':   p.note_sur_20 < 10,
                        'text-black':  p.note_sur_20 === null
                      }"
                    >
                      {{ p.note_sur_20 !== null ? p.note_sur_20 + '/20' : '—' }}
                    </span>
                  </td>
                  <td class="py-2.5 text-center hidden sm:table-cell border border-gray-200">
                    <span class="text-xs font-body text-black">{{ p.score !== null ? p.score + ' pts' : '—' }}</span>
                  </td>
                  <td class="py-2.5 text-center border border-gray-200">
                    <span
                      class="text-xs font-body px-2 py-0.5 rounded-full font-medium"
                      :class="{
                        'bg-green-500 text-white': p.statut === 'termine',
                        'bg-blue-500 text-white':   p.statut === 'present',
                        'bg-gray-500 text-white':  p.statut === 'inscrit',
                      }"
                    >
                      {{ p.statut === 'termine' ? 'Terminé' : p.statut === 'present' ? 'En cours' : 'Inscrit' }}
                    </span>
                  </td>
                  <td class="py-2.5 text-right hidden md:table-cell border border-gray-200">
                    <span class="text-xs font-body text-black">
                      {{ p.date_completed
                        ? new Date(p.date_completed).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
                        : '—' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
          <p class="text-xs font-body text-black">Créée par {{ selectedSession.session?.professeur }}</p>
          <button
            @click="showDetail = false"
            class="text-xs font-body px-4 py-1.5 bg-gray-100 text-black rounded-lg hover:bg-gray-200 transition-colors"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>

    </AdminLayout>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from '~~/composables/useToast'

const toast   = useToast()
const loading = ref(true)
const sessions = ref([])
const filieres = ref([])
const classes  = ref([])
const showDetail      = ref(false)
const selectedSession = ref(null)
const loadingDetail   = ref(false)

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

const openDetail = async (session) => {
  loadingDetail.value   = true
  showDetail.value      = true
  selectedSession.value = null
  try {
    const result = await apiFetch(`/admin/sessions/${session.id}`)
    if (result.success) selectedSession.value = result.data
  } catch {
    toast.error('Erreur lors du chargement')
    showDetail.value = false
  } finally {
    loadingDetail.value = false
  }
}

const deleteSession = async (session) => {
  if (!confirm(`Supprimer la session "${session.titre}" ?`)) return
  try {
    await apiFetch(`/admin/sessions/${session.id}`, { method: 'DELETE' })
    toast.success('Session supprimée')
    await loadData()
  } catch (err) {
    toast.error(err?.data?.message || 'Erreur')
  }
}

onMounted(() => loadData())
</script>