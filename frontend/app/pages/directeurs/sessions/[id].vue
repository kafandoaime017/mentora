<template>
  <div class="bg-layout font-body min-h-screen">
    <AdminLayout>
      <div class="max-w-5xl mx-auto">

        <!-- Retour -->
        <nuxt-link to="/directeurs/sessions"
          class="inline-flex items-center gap-1.5 text-sm font-body text-black hover:opacity-70 transition-colors mb-6"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
          Retour aux sessions
        </nuxt-link>

        <div v-if="loading" class="flex justify-center py-20">
          <div class="animate-spin rounded-full h-6 w-6 border-2 border-blacky border-t-transparent"/>
        </div>

        <div v-else-if="!data" class="text-center py-20">
          <p class="text-sm font-body text-black">Session introuvable</p>
        </div>

        <div v-else class="space-y-4">

          <!-- En-tête -->
          <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div class="px-5 py-4 border-b border-gray-100 flex items-start justify-between flex-wrap gap-3">
              <div class="flex-1 min-w-0">
                <h1 class="font-body font-bold text-black text-xl truncate">{{ data.session.titre }}</h1>
                <div class="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span class="text-sm font-body text-black">{{ data.session.filiere }}</span>
                  <span v-if="data.session.classe" class="text-black">·</span>
                  <span v-if="data.session.classe" class="text-sm font-body text-black">{{ data.session.classe }}</span>
                  <span class="text-black">·</span>
                  <span class="text-sm font-body text-black">{{ data.session.professeur }}</span>
                  <span class="text-black">·</span>
                  <code class="text-xs font-mono text-black bg-gray-100 px-1.5 py-0.5 rounded">{{ data.session.code }}</code>
                </div>
              </div>
              <span
                class="text-xs font-body px-2.5 py-1 rounded-full font-semibold shrink-0"
                :class="{
                  'bg-yellow-100 text-yellow-700': data.session.status === 'pending',
                  'bg-green-100 text-green-700':   data.session.status === 'active',
                  'bg-gray-100 text-black':        data.session.status === 'completed',
                  'bg-red-100 text-red-700':       data.session.status === 'cancelled',
                  'bg-blue-100 text-blue-700':      data.session.status === 'draft',
                }"
              >
                {{ statusLabel(data.session.status) }}
              </span>
            </div>

            <!-- Stats -->
            <div class="grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-200 border-b border-gray-200">
              <div class="px-4 py-3 bg-secondary text-center">
                <p class="text-xl font-body font-bold text-white">{{ data.stats.nb_questions }}</p>
                <p class="text-sm font-body text-white mt-0.5">Questions</p>
              </div>
              <div class="px-4 py-3 bg-blacky text-center">
                <p class="text-xl font-body font-bold text-white">{{ data.stats.nb_participants }}</p>
                <p class="text-sm font-body text-white mt-0.5">Participants</p>
              </div>
              <div class="px-4 py-3 bg-secondary text-center">
                <p class="text-xl font-body font-bold text-white">{{ data.stats.nb_termines }}</p>
                <p class="text-sm font-body text-white mt-0.5">Terminés</p>
              </div>
              <div class="px-4 py-3 bg-blacky text-center">
                <p class="text-xl font-body font-bold text-white">
                  {{ data.stats.moyenne_sur_20 }}<span class="text-xs font-normal text-white/70">/20</span>
                </p>
                <p class="text-sm font-body text-white mt-0.5">Moyenne</p>
              </div>
            </div>

            <!-- Détails -->
            <div class="px-5 py-4">
              <p class="text-xs font-body font-semibold text-black uppercase tracking-wider mb-3">Détails</p>
              <div class="grid grid-cols-2 gap-2">
                <div class="flex items-center justify-between py-1">
                  <span class="text-sm font-bold font-body text-black">Durée</span>
                  <span class="text-xs font-bold font-body text-black">{{ data.session.duree }} min</span>
                </div>
                <div class="flex items-center justify-between py-1">
                  <span class="text-xs font-bold font-body text-black">Total points</span>
                  <span class="text-xs font-bold font-body text-black">{{ data.stats.total_points }} pts</span>
                </div>
                <div class="flex items-center justify-between py-1">
                  <span class="text-xs font-bold font-body text-black">Début</span>
                  <span class="text-xs font-bold font-body text-black">{{ formatDate(data.session.date_debut) }}</span>
                </div>
                <div class="flex items-center justify-between py-1">
                  <span class="text-xs font-bold font-body text-black">Fin</span>
                  <span class="text-xs font-bold font-body text-black">{{ formatDate(data.session.date_fin) }}</span>
                </div>
                <div class="flex items-center justify-between py-1">
                  <span class="text-xs font-bold font-body text-black">Taux complétion</span>
                  <span class="text-xs font-bold font-body text-black">
                    {{ data.stats.nb_participants > 0 ? Math.round((data.stats.nb_termines / data.stats.nb_participants) * 100) : 0 }}%
                  </span>
                </div>
                <div class="flex items-center justify-between py-1">
                  <span class="text-xs font-bold font-body text-black">Résultats visibles</span>
                  <span class="text-xs font-bold font-body" :class="resultatsVisibles ? 'text-green-600' : 'text-black'">
                    {{ resultatsVisibles ? 'Oui' : 'Non' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="bg-white border border-gray-200 rounded-lg p-5">
            <h2 class="text-sm font-body font-semibold text-black uppercase tracking-wide mb-4">Actions</h2>

            <!-- PENDING -->
            <div v-if="data.session.status === 'pending'" class="flex flex-wrap gap-2">
              <button
                @click="editing = !editing"
                class="text-sm font-body font-semibold px-4 py-2 bg-gray-100 text-black rounded-lg hover:bg-gray-200 transition-colors"
              >
                {{ editing ? 'Annuler la modification' : 'Modifier la session' }}
              </button>
              <button
                @click="startSession"
                :disabled="acting"
                class="text-sm font-body font-semibold px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
              >
                Démarrer la session
              </button>
              <button
                @click="removeSession"
                :disabled="acting"
                class="text-sm font-body font-semibold px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                Supprimer
              </button>
            </div>

            <!-- ACTIVE -->
            <div v-else-if="data.session.status === 'active'" class="space-y-3">
              <p class="text-sm font-body text-black">Cette session est en cours. Les étudiants peuvent y répondre.</p>
              <button
                @click="endSession"
                :disabled="acting"
                class="text-sm font-body font-semibold px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                Terminer la session
              </button>
            </div>

            <!-- COMPLETED -->
            <div v-else-if="data.session.status === 'completed'" class="flex flex-wrap gap-2">
              <button
                @click="toggleResultats"
                :disabled="acting"
                class="text-sm font-body font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                :class="resultatsVisibles ? 'bg-gray-100 text-black hover:bg-gray-200' : 'bg-blacky text-white hover:bg-blacky/90'"
              >
                {{ resultatsVisibles ? 'Masquer les notes' : 'Publier les notes' }}
              </button>
              <button
                @click="downloadPdf"
                :disabled="downloading"
                class="text-sm font-body font-semibold px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50"
              >
                {{ downloading ? 'Génération...' : 'Télécharger les résultats (PDF)' }}
              </button>
            </div>

            <!-- AUTRE (draft / cancelled) -->
            <div v-else>
              <p class="text-sm font-body text-black">Aucune action disponible pour cette session.</p>
            </div>

            <!-- Dupliquer (toujours disponible, quel que soit le statut) -->
            <div class="mt-3 pt-3 border-t border-gray-100">
              <button
                @click="duplicateSession"
                :disabled="duplicating"
                class="text-sm font-body font-semibold px-4 py-2 bg-gray-100 text-black rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {{ duplicating ? 'Duplication...' : 'Dupliquer comme modèle' }}
              </button>
            </div>

            <!-- Formulaire de modification -->
            <div v-if="editing" class="mt-5 pt-5 border-t border-gray-100 space-y-4">
              <div>
                <label class="block text-sm font-body font-semibold text-black mb-1">Titre</label>
                <input v-model="form.titre" type="text"
                  class="w-full px-4 py-2.5 bg-input rounded-lg text-sm font-body focus:outline-none"/>
              </div>
              <div>
                <label class="block text-sm font-body font-semibold text-black mb-1">Description</label>
                <textarea v-model="form.description" rows="2"
                  class="w-full px-4 py-2.5 bg-input rounded-lg text-sm font-body focus:outline-none resize-none"/>
              </div>
              <div>
                <label class="block text-sm font-body font-semibold text-black mb-1">Thème</label>
                <input v-model="form.theme" type="text"
                  class="w-full px-4 py-2.5 bg-input rounded-lg text-sm font-body focus:outline-none"/>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-body font-semibold text-black mb-1">Filière</label>
                  <select v-model="form.filiere_id" @change="form.classe_id = null"
                    class="w-full px-4 py-2.5 bg-input rounded-lg text-sm font-body focus:outline-none">
                    <option v-for="f in filieres" :key="f.id" :value="f.id">{{ f.nom }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-body font-semibold text-black mb-1">Classe</label>
                  <select v-model="form.classe_id"
                    class="w-full px-4 py-2.5 bg-input rounded-lg text-sm font-body focus:outline-none">
                    <option v-for="c in classesFiltrees" :key="c.id" :value="c.id">{{ c.nom }}</option>
                  </select>
                </div>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-body font-semibold text-black mb-1">Début</label>
                  <input v-model="form.date_debut" type="datetime-local"
                    class="w-full px-4 py-2.5 bg-input rounded-lg text-sm font-body focus:outline-none"/>
                </div>
                <div>
                  <label class="block text-sm font-body font-semibold text-black mb-1">Fin</label>
                  <input v-model="form.date_fin" type="datetime-local"
                    class="w-full px-4 py-2.5 bg-input rounded-lg text-sm font-body focus:outline-none"/>
                </div>
                <div>
                  <label class="block text-sm font-body font-semibold text-black mb-1">Durée (min)</label>
                  <input v-model.number="form.duree" type="number" min="1"
                    class="w-full px-4 py-2.5 bg-input rounded-lg text-sm font-body focus:outline-none"/>
                </div>
              </div>
              <div class="flex justify-end gap-3">
                <button @click="editing = false"
                  class="text-sm font-body font-semibold px-4 py-2 bg-gray-100 text-black rounded-lg hover:bg-gray-200 transition-colors">
                  Annuler
                </button>
                <button @click="saveSession" :disabled="saving"
                  class="text-sm font-body font-semibold px-4 py-2 bg-blacky text-white rounded-lg hover:bg-blacky/90 transition-colors disabled:opacity-50">
                  {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Participants -->
          <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div class="px-5 py-4 border-b border-gray-100">
              <h2 class="text-sm font-body font-semibold text-black uppercase tracking-wide">
                Participants
                <span class="ml-1 normal-case font-normal">({{ data.participants?.length || 0 }})</span>
              </h2>
            </div>

            <div v-if="!data.participants?.length" class="py-8 text-center">
              <p class="text-sm font-body text-black">Aucun participant pour cette session</p>
            </div>

            <table v-else class="w-full text-sm">
              <thead>
                <tr class="border-b border-gray-100 bg-gray-50">
                  <th class="px-5 py-2.5 text-left text-xs font-body font-semibold text-black">Étudiant</th>
                  <th class="px-5 py-2.5 text-center text-xs font-body font-semibold text-black">Note</th>
                  <th class="px-5 py-2.5 text-center text-xs font-body font-semibold text-black hidden sm:table-cell">Score</th>
                  <th class="px-5 py-2.5 text-center text-xs font-body font-semibold text-black">Statut</th>
                  <th class="px-5 py-2.5 text-right text-xs font-body font-semibold text-black hidden md:table-cell">Terminé le</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in data.participants" :key="p.id" class="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                  <td class="px-5 py-3">
                    <p class="font-body font-medium text-black">{{ p.etudiant.prenom }} {{ p.etudiant.nom }}</p>
                  </td>
                  <td class="px-5 py-3 text-center">
                    <span
                      class="font-body font-bold text-sm"
                      :class="{
                        'text-blacky': p.note_sur_20 >= 14,
                        'text-amber-500': p.note_sur_20 >= 10 && p.note_sur_20 < 14,
                        'text-red-500':   p.note_sur_20 < 10,
                        'text-black':     p.note_sur_20 === null
                      }"
                    >
                      {{ p.note_sur_20 !== null ? p.note_sur_20 + '/20' : '—' }}
                    </span>
                  </td>
                  <td class="px-5 py-3 text-center hidden sm:table-cell">
                    <span class="text-xs font-body text-black">{{ p.score !== null ? p.score + ' pts' : '—' }}</span>
                  </td>
                  <td class="px-5 py-3 text-center">
                    <span
                      class="text-xs font-body px-2 py-0.5 rounded-full font-medium"
                      :class="{
                        'bg-green-500 text-white': p.statut === 'termine',
                        'bg-blue-500 text-white':  p.statut === 'present',
                        'bg-black text-white':     p.statut === 'inscrit',
                      }"
                    >
                      {{ p.statut === 'termine' ? 'Terminé' : p.statut === 'present' ? 'En cours' : 'Inscrit' }}
                    </span>
                  </td>
                  <td class="px-5 py-3 text-right hidden md:table-cell">
                    <span class="text-xs font-body text-black">
                      {{ p.date_completed ? formatDate(p.date_completed) : '—' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </AdminLayout>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from '~~/composables/useToast'

const route  = useRoute()
const router = useRouter()
const toast  = useToast()

const loading  = ref(true)
const data     = ref(null)
const editing  = ref(false)
const saving   = ref(false)
const acting   = ref(false)
const downloading = ref(false)
const duplicating = ref(false)
const filieres = ref([])
const classes   = ref([])

const form = ref({
  titre: '', description: '', theme: '',
  filiere_id: null, classe_id: null,
  date_debut: '', date_fin: '', duree: 30
})

const resultatsVisibles = computed(() => !!data.value?.session?.resultatsVisibles)

const classesFiltrees = computed(() =>
  classes.value.filter(c => c.filiereId === form.value.filiere_id)
)

const statusLabel = (s) => {
  const map = { pending: 'Pending', active: 'Active', completed: 'Terminée', cancelled: 'Annulée', draft: 'Brouillon' }
  return map[s] || s
}

const formatDate = (d) => d
  ? new Date(d).toLocaleString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  : '—'

const toLocalInput = (d) => {
  if (!d) return ''
  const date = new Date(d)
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const apiFetch = async (url, options = {}) => {
  const config = useRuntimeConfig()
  const token  = useCookie('auth_token').value
  return await $fetch(`${config.public.apiBase}${url}`, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, ...options.headers }
  })
}

const loadData = async () => {
  loading.value = true
  try {
    const [result, filRes, clsRes] = await Promise.all([
      apiFetch(`/admin/sessions/${route.params.id}`),
      apiFetch('/admin/filieres'),
      apiFetch('/admin/classes')
    ])
    if (result.success) {
      data.value = result.data
      form.value = {
        titre: data.value.session.titre,
        description: data.value.session.description || '',
        theme: data.value.session.theme || '',
        filiere_id: data.value.session.filiere_id || null,
        classe_id: data.value.session.classe_id || null,
        date_debut: toLocalInput(data.value.session.date_debut),
        date_fin: toLocalInput(data.value.session.date_fin),
        duree: data.value.session.duree
      }
    }
    if (filRes.success) filieres.value = filRes.data
    if (clsRes.success)  classes.value  = clsRes.data
  } catch {
    toast.error('Session introuvable')
  } finally {
    loading.value = false
  }
}

const saveSession = async () => {
  saving.value = true
  try {
    const result = await apiFetch(`/admin/sessions/${route.params.id}`, {
      method: 'PUT',
      body: {
        titre: form.value.titre,
        description: form.value.description,
        theme: form.value.theme,
        filiere_id: form.value.filiere_id,
        classe_id: form.value.classe_id,
        date_debut: form.value.date_debut,
        date_fin: form.value.date_fin,
        duree: form.value.duree
      }
    })
    if (result.success) {
      toast.success('Session mise à jour')
      editing.value = false
      await loadData()
    }
  } catch (err) {
    toast.error(err?.data?.message || 'Erreur lors de la mise à jour')
  } finally {
    saving.value = false
  }
}

const startSession = async () => {
  if (!confirm('Démarrer cette session maintenant ?')) return
  acting.value = true
  try {
    await apiFetch(`/admin/sessions/${route.params.id}/start`, { method: 'POST' })
    toast.success('Session démarrée')
    await loadData()
  } catch (err) {
    toast.error(err?.data?.message || 'Erreur')
  } finally {
    acting.value = false
  }
}

const endSession = async () => {
  if (!confirm('Terminer cette session maintenant ?')) return
  acting.value = true
  try {
    await apiFetch(`/admin/sessions/${route.params.id}/end`, { method: 'POST' })
    toast.success('Session terminée')
    await loadData()
  } catch (err) {
    toast.error(err?.data?.message || 'Erreur')
  } finally {
    acting.value = false
  }
}

const toggleResultats = async () => {
  acting.value = true
  try {
    const result = await apiFetch(`/admin/sessions/${route.params.id}/toggle-resultats`, { method: 'PATCH' })
    if (result.success) {
      data.value.session.resultatsVisibles = result.data.resultatsVisibles
      toast.success(result.data.resultatsVisibles ? 'Notes publiées' : 'Notes masquées')
    }
  } catch (err) {
    toast.error(err?.data?.message || 'Erreur')
  } finally {
    acting.value = false
  }
}

const removeSession = async () => {
  if (!confirm(`Supprimer la session "${data.value.session.titre}" ?`)) return
  acting.value = true
  try {
    await apiFetch(`/admin/sessions/${route.params.id}`, { method: 'DELETE' })
    toast.success('Session supprimée')
    router.push('/directeurs/sessions')
  } catch (err) {
    toast.error(err?.data?.message || 'Erreur')
    acting.value = false
  }
}

const downloadPdf = async () => {
  downloading.value = true
  try {
    const config = useRuntimeConfig()
    const token  = useCookie('auth_token').value
    const res = await fetch(`${config.public.apiBase}/admin/sessions/${route.params.id}/export/pdf`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) throw new Error('Erreur lors de la génération du PDF')
    const blob = await res.blob()
    const url  = window.URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url
    a.download = `resultats_session_${route.params.id}.pdf`
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)
  } catch {
    toast.error('Erreur lors du téléchargement du PDF')
  } finally {
    downloading.value = false
  }
}

const duplicateSession = async () => {
  duplicating.value = true
  try {
    const result = await apiFetch(`/admin/sessions/${route.params.id}/dupliquer`, { method: 'POST' })
    if (result.success) {
      toast.success(result.message || 'Session dupliquée')
      await router.push(`/directeurs/sessions/${result.data.id}`)
    } else {
      toast.error(result.message || 'Erreur lors de la duplication')
    }
  } catch (err) {
    toast.error(err?.data?.message || 'Erreur lors de la duplication')
  } finally {
    duplicating.value = false
  }
}

onMounted(() => loadData())
</script>
