<template>
  <div class="bg-layout font-body min-h-screen">
    <AdminLayout>
      <div class="max-w-5xl mx-auto">

        <!-- En-tête -->
        <div class="mb-6">
          <h1 class="text-2xl font-body font-extrabold text-black">Logs d'audit</h1>
          <p class="text-sm font-body text-black/60 mt-1">Historique des actions effectuées dans votre établissement (conformité).</p>
        </div>

        <!-- Filtres -->
        <div class="flex flex-col md:flex-row gap-3 mb-4">
          <select v-model="filtreAction" @change="rechercher" class="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-body focus:outline-none">
            <option value="">Toutes les actions</option>
            <option v-for="a in actionsDisponibles" :key="a" :value="a">{{ actionLabel(a) }}</option>
          </select>
          <input v-model="filtreDateDebut" @change="rechercher" type="date" class="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-body focus:outline-none" />
          <input v-model="filtreDateFin" @change="rechercher" type="date" class="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-body focus:outline-none" />
        </div>

        <!-- Loading -->
        <div v-if="loading" class="flex justify-center py-16">
          <div class="animate-spin rounded-full h-8 w-8 border-2 border-blacky border-t-transparent"/>
        </div>

        <!-- Vide -->
        <div v-else-if="logs.length === 0" class="bg-white rounded-lg p-12 text-center text-black">
          <p class="font-body text-sm">Aucun log trouvé</p>
        </div>

        <!-- Table -->
        <div v-else class="bg-white rounded-lg shadow-[1px_1px_3px_1px_rgba(0,0,0,0.08)] overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left font-body font-semibold text-black/60 text-xs">Date</th>
                <th class="px-4 py-3 text-left font-body font-semibold text-black/60 text-xs">Utilisateur</th>
                <th class="px-4 py-3 text-left font-body font-semibold text-black/60 text-xs">Action</th>
                <th class="px-4 py-3 text-left font-body font-semibold text-black/60 text-xs">Détails</th>
                <th class="px-4 py-3 text-left font-body font-semibold text-black/60 text-xs">IP</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="log in logs" :key="log.id" class="hover:bg-gray-50/50">
                <td class="px-4 py-3 font-body text-black/70 whitespace-nowrap">{{ formatDate(log.created_at) }}</td>
                <td class="px-4 py-3 font-body text-black">
                  {{ log.user_nom || 'Système' }}
                  <span v-if="log.user_role" class="block text-[10px] text-black/40">{{ log.user_role }}</span>
                </td>
                <td class="px-4 py-3">
                  <span class="text-xs font-body font-semibold px-2 py-0.5 rounded-full" :class="actionClass(log.action)">
                    {{ actionLabel(log.action) }}
                  </span>
                </td>
                <td class="px-4 py-3 font-body text-black/60 text-xs max-w-xs truncate">{{ detailsTexte(log) }}</td>
                <td class="px-4 py-3 font-body text-black/40 text-xs">{{ log.ip_address || '—' }}</td>
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
    </AdminLayout>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAdmin } from '~~/composables/useAdmin'

const { getAuditLogs } = useAdmin()

const loading = ref(true)
const logs = ref([])
const page = ref(1)
const totalPages = ref(1)
const actionsDisponibles = ref([])
const filtreAction = ref('')
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
    if (filtreDateDebut.value) params.dateDebut = filtreDateDebut.value
    if (filtreDateFin.value) params.dateFin = filtreDateFin.value

    const result = await getAuditLogs(params)
    if (result.success) {
      logs.value = result.data.logs || []
      totalPages.value = result.data.totalPages || 1
      actionsDisponibles.value = result.data.actionsDisponibles || []
    }
  } finally {
    loading.value = false
  }
}

const rechercher = () => { page.value = 1; charger() }
const changerPage = (p) => { if (p < 1 || p > totalPages.value) return; page.value = p; charger() }

onMounted(() => charger())
</script>
