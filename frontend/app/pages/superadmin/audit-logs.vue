<template>
  <div class="bg-layout font-body min-h-screen">
    <SuperadminLayout>
      <div class="max-w-8xl mx-auto">

        <!-- En-tête -->
        <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 class="text-2xl font-extrabold font-body text-black">Logs d'audit</h1>
            <p class="text-sm font-body text-black/60 mt-1">Historique de toutes les actions effectuées sur la plateforme, toutes écoles confondues.</p>
          </div>
          <span class="text-sm font-body text-black">{{ total }} log(s)</span>
        </div>

        <!-- Filtres -->
        <div class="flex flex-wrap gap-3 mb-4">
          <select v-model="filtreEcole" @change="rechercher" class="px-3 py-2 bg-gray-300/80 placeholder:text-black placeholder:font-bold rounded-lg text-sm font-body focus:outline-none">
            <option value="">Toutes les écoles</option>
            <option v-for="e in ecoles" :key="e.id" :value="e.id">{{ e.nom }}</option>
          </select>

          <select v-model="filtreAction" @change="rechercher" class="px-3 py-2 bg-gray-300/80 placeholder:text-black placeholder:font-bold rounded-lg text-sm font-body focus:outline-none">
            <option value="">Toutes les actions</option>
            <option v-for="a in actionsDisponibles" :key="a" :value="a">{{ actionLabel(a) }}</option>
          </select>

          <input v-model="filtreDateDebut" @change="rechercher" type="date" class="px-3 py-2 bg-gray-300/80 rounded-lg text-sm font-body focus:outline-none" />
          <input v-model="filtreDateFin" @change="rechercher" type="date" class="px-3 py-2 bg-gray-300/80 rounded-lg text-sm font-body focus:outline-none" />
        </div>

        <!-- Tableau -->
        <div class="bg-white rounded-sm border border-gray-200 overflow-hidden">
          <div v-if="loading" class="p-12 text-center">
            <div class="animate-spin rounded-full h-6 w-6 border-2 border-blacky border-t-transparent mx-auto"/>
          </div>

          <div v-else-if="logs.length === 0" class="p-12 text-center">
            <svg class="w-12 h-12 text-black mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <p class="text-black text-sm font-body">Aucun log trouvé</p>
          </div>

          <table v-else class="w-full">
            <thead class="bg-blacky border-b border-gray-100">
              <tr>
                <th class="px-4 py-3 uppercase font-body text-left text-xs font-bold text-white">Date</th>
                <th class="px-4 py-3 uppercase font-body text-left text-xs font-bold text-white hidden md:table-cell">École</th>
                <th class="px-4 py-3 uppercase font-body text-left text-xs font-bold text-white hidden md:table-cell">Utilisateur</th>
                <th class="px-4 py-3 uppercase font-body text-left text-xs font-bold text-white">Action</th>
                <th class="px-4 py-3 uppercase font-body text-left text-xs font-bold text-white hidden lg:table-cell">Détails</th>
                <th class="px-4 py-3 uppercase font-body text-left text-xs font-bold text-white hidden lg:table-cell">IP</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-for="log in logs" :key="log.id" class="hover:bg-gray-50 border border-gray-200 transition-colors">

                <!-- Date -->
                <td class="px-4 py-3 border border-gray-200">
                  <span class="text-xs font-body font-bold text-black whitespace-nowrap">{{ formatDate(log.created_at) }}</span>
                </td>

                <!-- École -->
                <td class="px-4 py-3 hidden md:table-cell border border-gray-200">
                  <p class="text-sm font-body text-black">{{ log.ecole_nom || '—' }}</p>
                </td>

                <!-- Utilisateur -->
                <td class="px-4 py-3 hidden md:table-cell border border-gray-200">
                  <div class="flex items-center gap-2">
                    <div class="w-7 h-7 rounded-full bg-secondary/30 flex items-center justify-center text-xs font-bold text-secondary shrink-0">
                      {{ (log.user_nom || 'S')[0] }}
                    </div>
                    <div>
                      <p class="text-sm font-bold font-body text-black">{{ log.user_nom || 'Système' }}</p>
                      <p v-if="log.user_role" class="text-[10px] font-body text-black/40">{{ log.user_role }}</p>
                    </div>
                  </div>
                </td>

                <!-- Action -->
                <td class="px-4 py-3 border border-gray-200">
                  <span class="inline-flex items-center gap-1 text-xs font-body font-semibold px-2 py-0.5 rounded-full" :class="actionClass(log.action)">
                    {{ actionLabel(log.action) }}
                  </span>
                </td>

                <!-- Détails -->
                <td class="px-4 py-3 hidden lg:table-cell border border-gray-200">
                  <p class="text-sm font-body text-black max-w-xs truncate">{{ detailsTexte(log) }}</p>
                </td>

                <!-- IP -->
                <td class="px-4 py-3 hidden lg:table-cell border border-gray-200">
                  <span class="text-xs font-body text-black/60">{{ log.ip_address || '—' }}</span>
                </td>

              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex items-center justify-center gap-3 mt-6">
          <button @click="changerPage(page - 1)" :disabled="page <= 1" class="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-body disabled:opacity-40">Précédent</button>
          <span class="text-sm font-body text-black/60">Page {{ page }} / {{ totalPages }}</span>
          <button @click="changerPage(page + 1)" :disabled="page >= totalPages" class="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-body disabled:opacity-40">Suivant</button>
        </div>

      </div>
    </SuperadminLayout>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSuperadmin } from '~~/composables/useSuperadmin'

const { getAuditLogs } = useSuperadmin()

const loading = ref(true)
const logs = ref([])
const total = ref(0)
const page = ref(1)
const totalPages = ref(1)
const actionsDisponibles = ref([])
const ecoles = ref([])
const filtreAction = ref('')
const filtreEcole = ref('')
const filtreDateDebut = ref('')
const filtreDateFin = ref('')

const LABELS = {
  connexion: 'Connexion',
  connexion_echouee: 'Connexion échouée',
  modification_ecole: "Modification de l'établissement",
  creation_filiere: "Création filière",
  modification_filiere: "Modification filière",
  suppression_filiere: "Suppression filière",
  creation_classe: "Création classe",
  modification_classe: "Modification classe",
  suppression_classe: "Suppression classe",
  activation_compte: "Activation compte",
  desactivation_compte: "Désactivation compte",
  suppression_utilisateur: "Suppression utilisateur",
  activation_professeur: "Activation professeur",
  envoi_invitation: "Invitation envoyée",
  invitation_renouvelee: "Invitation renouvelée",
  suppression_invitation: "Suppression invitation",
  creation_session: "Création session",
  suppression_session: "Suppression session",
  demarrage_session: "Démarrage session",
  fin_session: "Fin de session",
  publication_notes: "Publication des notes",
  masquage_notes: "Masquage des notes",
  creation_annonce: "Création annonce",
  creation_sondage: "Création sondage",
  reactivation_annonce: "Réactivation annonce",
  desactivation_annonce: "Désactivation annonce",
  suppression_annonce: "Suppression annonce"
}

const actionLabel = (a) => LABELS[a] || a

const actionClass = (a) => {
  if (a.includes('suppression') || a.includes('desactivation') || a.includes('echouee')) return 'bg-red-100 text-red-700'
  if (a.includes('creation') || a.includes('activation') || a.includes('envoi') || a.includes('publication')) return 'bg-green-100 text-green-700'
  return 'bg-gray-100 text-gray-600'
}

const detailsTexte = (log) => {
  if (!log.details) return '—'
  try {
    const d = typeof log.details === 'string' ? JSON.parse(log.details) : log.details
    return Object.entries(d).map(([k, v]) => `${k}: ${v}`).join(', ')
  } catch { return '—' }
}

const formatDate = (d) => d ? new Date(d).toLocaleString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''

const charger = async () => {
  loading.value = true
  try {
    const params = { page: page.value, limit: 30 }
    if (filtreAction.value) params.action = filtreAction.value
    if (filtreEcole.value) params.ecoleId = filtreEcole.value
    if (filtreDateDebut.value) params.dateDebut = filtreDateDebut.value
    if (filtreDateFin.value) params.dateFin = filtreDateFin.value

    const result = await getAuditLogs(params)
    if (result.success) {
      logs.value = result.data.logs || []
      total.value = result.data.total || 0
      totalPages.value = result.data.totalPages || 1
      actionsDisponibles.value = result.data.actionsDisponibles || []
      ecoles.value = result.data.ecoles || []
    }
  } finally {
    loading.value = false
  }
}

const rechercher = () => { page.value = 1; charger() }
const changerPage = (p) => { if (p < 1 || p > totalPages.value) return; page.value = p; charger() }

onMounted(() => charger())
</script>
