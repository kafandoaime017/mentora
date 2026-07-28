<template>
  <div class="bg-layout font-body min-h-screen">
    <AdminLayout>
      <div class="max-w-8xl mx-auto">

        <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h1 class="text-2xl font-extrabold text-black font-body">Invitations</h1>
          <div class="flex items-center gap-2">
            <!-- Import CSV/Excel -->
            <label class="flex items-center gap-2 bg-white border border-gray-300 text-black px-4 py-2 rounded-lg text-sm font-body font-semibold hover:bg-gray-50 transition-colors cursor-pointer">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
              </svg>
              Importer CSV/Excel
              <input type="file" accept=".csv,.xlsx,.xls" class="hidden" @change="handleFileImport" />
            </label>
            <!-- Nouvelle invitation -->
            <button
              @click="showForm = true"
              class="flex items-center gap-2 bg-[#024864] font-body text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blacky/80 transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              Nouvelle invitation
            </button>
          </div>
        </div>

        <!-- Filtres -->
        <div class="flex flex-wrap gap-1 mb-4">
          <button
            v-for="f in ['tous', 'etudiant', 'professeur', 'en_attente', 'expirée', 'utilisée']" :key="f"
            @click="filtre = f"
            class="px-3 font-body py-1.5 rounded-sm text-sm font-semibold transition-colors"
            :class="filtre === f ? 'bg-[#024864] text-white' : 'bg-white text-black hover:bg-gray-100'"
          >
            {{ f === 'tous' ? 'Toutes'
             : f === 'en_attente' ? 'En attente'
             : f === 'utilisée' ? 'Utilisées'
             : f === 'expirée' ? 'Expirées'
             : f }}
          </button>
        </div>

        <!-- Liste -->
        <div class="bg-white rounded-sm border border-gray-200 overflow-hidden">
          <div v-if="loading" class="p-12 text-center">
            <div class="animate-spin rounded-full h-6 w-6 border-2 border-[#3730a3] border-t-transparent mx-auto"/>
          </div>

          <div v-else-if="filteredInvitations.length === 0" class="p-12 text-center text-black text-md font-body">
            Aucune invitation
          </div>

          <table v-else class="w-full">
            <thead class="bg-blacky border-b border-gray-100">
              <tr>
                <th class="px-4 py-3 uppercase font-body text-left text-xs font-extrabold text-white">NOM & PRENOM</th>
                <th class="px-4 py-3 uppercase font-body text-left text-xs font-extrabold text-white">Rôle</th>
                <th class="px-4 py-3 uppercase font-body text-left text-xs font-extrabold text-white hidden md:table-cell">Classe / Filière</th>
                <th class="px-4 py-3 uppercase font-body text-center text-xs font-extrabold text-white">Statut</th>
                <th class="px-4 py-3 uppercase font-body text-center text-xs font-extrabold text-white">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-for="inv in filteredInvitations" :key="inv.id" class="hover:bg-gray-50 border border-gray-200 transition-colors">

                <!-- Personne -->
                <td class="px-4 py-3 border border-gray-200">
                  <p class="text-sm font-body font-semibold text-black">{{ inv.prenom }} {{ inv.nom }}</p>
                  <!-- <p class="text-xs font-body text-black">{{ inv.email }}</p> -->
                </td>

                <!-- Rôle -->
                <td class="px-4 py-3 border border-gray-200">
                  <span
                    class="text-xs font-body px-2 py-0.5 rounded-full font-semibold"
                    :class="inv.role === 'etudiant' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'"
                  >
                    {{ inv.role }}
                  </span>
                </td>

                <!-- Classe / Filière -->
                <td class="px-4 py-3 hidden md:table-cell border border-gray-200">
                  <p class="text-sm font-bold font-body text-black">{{ inv.filiere }}</p>
                  <p v-if="inv.classe" class="text-xs font-body italic text-black">{{ inv.classe }}</p>
                </td>

                <!-- Statut -->
                <td class="px-4 py-3 text-center border border-gray-200">
                  <span
                    class="text-xs font-body px-2 py-0.5 rounded-full font-semibold"
                    :class="{
                      'bg-green-600 text-white':   inv.used,
                      'bg-red-600 text-white':       !inv.used && inv.expired,
                      'bg-yellow-600 text-white': !inv.used && !inv.expired
                    }"
                  >
                    {{ inv.used ? 'Utilisée' : inv.expired ? 'Expirée' : 'En attente' }}
                  </span>
                </td>

                <!-- Actions -->
                <td class="px-4 py-3 border border-gray-200">
                  <div class="flex items-center justify-center gap-1.5 flex-wrap">

                    <!-- Copier lien — en attente uniquement -->
                    <button
                      v-if="!inv.used && !inv.expired"
                      @click="copyLink(inv)"
                      class="inline-flex items-center gap-1 text-xs font-body font-semibold px-2.5 py-1.5 rounded-lg bg-gray-300 text-black hover:bg-gray-200 transition-colors"
                      title="Copier le lien"
                    >
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2"/>
                      </svg>
                      Copier
                    </button>

                    <!-- Renvoyer — pas utilisée (en attente ou expirée) -->
                    <button
                      v-if="!inv.used"
                      @click="resendInvitation(inv)"
                      :disabled="resendingId === inv.id"
                      class="inline-flex items-center gap-1 text-xs font-body font-semibold px-2.5 py-1.5 rounded-lg bg-[#024864]/30 text-[#3730a3] hover:bg-[#024864]/20 transition-colors disabled:opacity-50"
                      title="Renvoyer l'invitation"
                    >
                      <div v-if="resendingId === inv.id" class="animate-spin rounded-full h-3 w-3 border border-[#3730a3] border-t-transparent"/>
                      <svg v-else class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                      </svg>
                      Renvoyer
                    </button>

                    <!-- Révoquer — en attente uniquement -->
                    <button
                      v-if="!inv.used && !inv.expired"
                      @click="revokeInvitation(inv)"
                      class="inline-flex items-center gap-1 text-xs font-body font-semibold px-2.5 py-1.5 rounded-lg bg-yellow-500 text-black hover:bg-yellow-600 transition-colors"
                      title="Révoquer"
                    >
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
                      </svg>
                      Révoquer
                    </button>

                    <!-- Supprimer — toujours -->
                    <button
                      @click="deleteInvitation(inv.id)"
                      class="inline-flex items-center gap-1 text-xs font-body font-semibold px-2.5 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                      title="Supprimer"
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

      <!-- Modal nouvelle invitation -->
      <div v-if="showForm" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" @click.self="showForm = false">
        <div class="bg-white rounded-lg w-full max-w-lg p-6">
          <h3 class="font-extrabold text-black text-center text-xl font-body mb-4">Créer une nouvelle invitation</h3>
          <div class="space-y-3">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-body text-xs font-semibold text-black mb-1">Prénom *</label>
                <input v-model="form.prenom" type="text" placeholder="Jean" class="w-full px-3 py-2.5 bg-input rounded-lg text-sm font-body focus:outline-none"/>
              </div>
              <div>
                <label class="block font-body text-xs font-semibold text-black mb-1">Nom *</label>
                <input v-model="form.nom" type="text" placeholder="Dupont" class="w-full px-3 py-2.5 bg-input rounded-lg text-sm font-body focus:outline-none"/>
              </div>
            </div>
            <div>
              <label class="block font-body text-xs font-semibold text-black mb-1">Email *</label>
              <input v-model="form.email" type="email" placeholder="jean.dupont@email.com" class="w-full px-3 py-2.5 bg-input rounded-lg text-sm font-body focus:outline-none"/>
            </div>
            <div>
              <label class="block font-body text-xs font-semibold text-black mb-1">Rôle *</label>
              <select v-model="form.role" class="w-full px-3 py-2.5 bg-input rounded-lg text-sm font-body focus:outline-none">
                <option value="">Sélectionner</option>
                <option value="etudiant">Étudiant</option>
                <option value="professeur">Professeur</option>
              </select>
            </div>
            <div>
              <label class="block font-body text-xs font-semibold text-black mb-1">Filière *</label>
              <select v-model="form.filiereId" @change="form.classeId = ''" class="w-full px-3 py-2.5 bg-input rounded-lg text-sm font-body focus:outline-none">
                <option value="">Sélectionner</option>
                <option v-for="f in filieres" :key="f.id" :value="f.id">{{ f.nom }}</option>
              </select>
            </div>
            <div v-if="form.role === 'etudiant'">
              <label class="block font-body text-xs font-semibold text-black mb-1">Classe *</label>
              <select v-model="form.classeId" class="w-full px-3 py-2.5 bg-input rounded-lg text-sm font-body focus:outline-none">
                <option value="">Sélectionner</option>
                <option v-for="c in classesFiltrees" :key="c.id" :value="c.id">{{ c.nom }}</option>
              </select>
            </div>
          </div>
          <div class="flex gap-3 mt-5">
            <button @click="showForm = false" class="flex-1 font-body py-2.5 bg-gray-200 hover:bg-gray-200 text-black rounded-lg text-sm font-semibold">Annuler</button>
            <button
              @click="sendInvitation"
              :disabled="sendingInvitation"
              class="flex-1 font-body py-2.5 bg-[#024864] hover:bg-blacky/80 text-white rounded-lg text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <div v-if="sendingInvitation" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"/>
              {{ sendingInvitation ? 'Envoi...' : "Envoyer l'invitation" }}
            </button>
          </div>
        </div>
      </div>

      <!-- Modal import CSV -->
      <div v-if="showImportModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="showImportModal = false">
        <div class="bg-white rounded-lg w-full max-w-3xl p-6 max-h-[85vh] flex flex-col">
          <div class="flex items-center justify-between mb-1">
            <h3 class="font-extrabold text-black text-xl font-body">Importer des invitations</h3>
            <button @click="showImportModal = false" class="text-black hover:text-black">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <p class="text-xs text-black mb-4">
            <span class="text-green-600 font-semibold">{{ importRows.filter(r => !r.error).length }} valide(s)</span>
            <span v-if="importRows.filter(r => r.error).length > 0" class="text-red-500 font-semibold ml-2">{{ importRows.filter(r => r.error).length }} erreur(s)</span>
          </p>
          <div v-if="importErrors.length > 0" class="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 shrink-0">
            <p class="text-xs font-semibold text-red-600 mb-1">Erreurs :</p>
            <ul class="text-xs text-red-500 space-y-0.5 max-h-20 overflow-y-auto">
              <li v-for="e in importErrors" :key="e">• {{ e }}</li>
            </ul>
          </div>
          <div class="overflow-auto flex-1 border border-gray-200 rounded-lg mb-4">
            <table class="w-full text-xs">
              <thead class="bg-gray-50 sticky top-0 border-b border-gray-200">
                <tr>
                  <th class="px-3 py-2 text-left font-semibold text-black">#</th>
                  <th class="px-3 py-2 text-left font-semibold text-black">Prénom</th>
                  <th class="px-3 py-2 text-left font-semibold text-black">Nom</th>
                  <th class="px-3 py-2 text-left font-semibold text-black">Email</th>
                  <th class="px-3 py-2 text-left font-semibold text-black">Rôle</th>
                  <th class="px-3 py-2 text-left font-semibold text-black">Filière</th>
                  <th class="px-3 py-2 text-left font-semibold text-black">Classe</th>
                  <th class="px-3 py-2 text-center font-semibold text-black">Statut</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="(row, idx) in importRows" :key="idx" :class="row.error ? 'bg-red-50' : 'hover:bg-gray-50'">
                  <td class="px-3 py-2 text-black">{{ idx + 1 }}</td>
                  <td class="px-3 py-2 text-black">{{ row.prenom }}</td>
                  <td class="px-3 py-2 text-black">{{ row.nom }}</td>
                  <td class="px-3 py-2 text-black">{{ row.email }}</td>
                  <td class="px-3 py-2">
                    <span class="px-1.5 py-0.5 rounded-full text-[10px] font-semibold"
                      :class="row.role === 'etudiant' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'"
                    >{{ row.role }}</span>
                  </td>
                  <td class="px-3 py-2 text-black">{{ row.filiere }}</td>
                  <td class="px-3 py-2 text-black">{{ row.classe || '—' }}</td>
                  <td class="px-3 py-2 text-center">
                    <span v-if="row.error" class="text-red-500 text-[10px] font-semibold" :title="row.error">❌ {{ row.error }}</span>
                    <span v-else class="text-green-600 text-[10px] font-semibold">✓ OK</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="bg-gray-50 rounded-lg px-4 py-3 mb-4 shrink-0">
            <p class="text-xs font-semibold text-black mb-1">Format attendu :</p>
            <code class="text-[10px] text-black block">prenom, nom, email, role (etudiant/professeur), filiere (nom exact), classe (vide si prof)</code>
            <button @click="downloadTemplate" class="mt-2 text-xs text-[#3730a3] hover:underline">↓ Télécharger le modèle CSV</button>
          </div>
          <div class="flex gap-3 shrink-0">
            <button @click="showImportModal = false" class="flex-1 py-2.5 bg-gray-200 hover:bg-gray-200 text-black rounded-lg text-sm font-body font-semibold">Annuler</button>
            <button
              @click="sendBulkInvitations"
              :disabled="sendingBulk || importRows.filter(r => !r.error).length === 0"
              class="flex-1 py-2.5 bg-[#024864] hover:bg-[#024864] text-white rounded-lg text-sm font-body font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <div v-if="sendingBulk" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"/>
              {{ sendingBulk ? 'Envoi...' : `Envoyer ${importRows.filter(r => !r.error).length} invitation(s)` }}
            </button>
          </div>
        </div>
      </div>

    </AdminLayout>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import * as XLSX from 'xlsx'
import { useToast } from '~~/composables/useToast'
import { useConfirm } from '~~/composables/useConfirm'

const toast            = useToast()
const { confirm }      = useConfirm()
const loading          = ref(true)
const invitations      = ref([])
const filieres         = ref([])
const classes          = ref([])
const showForm         = ref(false)
const sendingInvitation = ref(false)
const filtre           = ref('tous')
const resendingId      = ref(null)

// Import
const showImportModal  = ref(false)
const importRows       = ref([])
const importErrors     = ref([])
const sendingBulk      = ref(false)

const form = ref({ prenom: '', nom: '', email: '', role: '', filiereId: '', classeId: '' })

// ─── API ──────────────────────────────────────────────────────────────────────
const apiFetch = async (url, options = {}) => {
  const config = useRuntimeConfig()
  const token  = useCookie('auth_token').value
  return await $fetch(`${config.public.apiBase}${url}`, {
    ...options,
    headers: { 'Authorization': `Bearer ${token}`, ...options.headers }
  })
}

// ─── Computed ─────────────────────────────────────────────────────────────────
const classesFiltrees = computed(() =>
  classes.value.filter(c => c.filiereId === form.value.filiereId)
)

const filteredInvitations = computed(() => {
  if (filtre.value === 'tous')       return invitations.value
  if (filtre.value === 'etudiant')   return invitations.value.filter(i => i.role === 'etudiant')
  if (filtre.value === 'professeur') return invitations.value.filter(i => i.role === 'professeur')
  if (filtre.value === 'en_attente') return invitations.value.filter(i => !i.used && !i.expired)
  if (filtre.value === 'expirée')    return invitations.value.filter(i => !i.used && i.expired)
  if (filtre.value === 'utilisée')   return invitations.value.filter(i => i.used)
  return invitations.value
})

// ─── Chargement ───────────────────────────────────────────────────────────────
const loadData = async () => {
  loading.value = true
  try {
    const [invRes, filRes, clsRes] = await Promise.all([
      apiFetch('/admin/invitations'),
      apiFetch('/admin/filieres'),
      apiFetch('/admin/classes')
    ])
    if (invRes.success) invitations.value = invRes.data
    if (filRes.success) filieres.value    = filRes.data
    if (clsRes.success) classes.value     = clsRes.data
  } finally {
    loading.value = false
  }
}

// ─── Invitation simple ────────────────────────────────────────────────────────
const sendInvitation = async () => {
  if (!form.value.prenom || !form.value.nom || !form.value.email || !form.value.role || !form.value.filiereId) {
    toast.error('Veuillez remplir tous les champs obligatoires')
    return
  }
  if (form.value.role === 'etudiant' && !form.value.classeId) {
    toast.error('Veuillez sélectionner une classe')
    return
  }
  sendingInvitation.value = true
  try {
    const res = await apiFetch('/admin/invitations', {
      method: 'POST',
      body: {
        prenom:    form.value.prenom,
        nom:       form.value.nom,
        email:     form.value.email,
        role:      form.value.role,
        filiereId: form.value.filiereId,
        classeId:  form.value.classeId || null
      }
    })
    if (res?.data?.emailEnvoye === false) {
      toast.error("Invitation créée, mais l'email n'a pas pu être envoyé. Copiez le lien manuellement.")
    } else {
      toast.success('Invitation envoyée !')
    }
    showForm.value = false
    form.value = { prenom: '', nom: '', email: '', role: '', filiereId: '', classeId: '' }
    await loadData()
  } catch (err) {
    toast.error(err?.data?.message || "Erreur lors de l'envoi")
  } finally {
    sendingInvitation.value = false
  }
}

// ─── Actions sur invitations existantes ───────────────────────────────────────
const copyLink = async (inv) => {
  const config = useRuntimeConfig()
  const link   = `${config.public.frontendUrl || 'https://mentora.foulisa.com'}/auth/invitation?token=${inv.token}`
  await navigator.clipboard.writeText(link)
  toast.success('Lien copié !')
}

const resendInvitation = async (inv) => {
  resendingId.value = inv.id
  try {
    const res = await apiFetch(`/admin/invitations/${inv.id}/resend`, { method: 'POST' })
    if (res?.data?.emailEnvoye === false) {
      toast.error(`Lien régénéré, mais l'email n'a pas pu être envoyé à ${inv.email}. Copiez le lien manuellement.`)
    } else {
      toast.success(`Invitation renvoyée à ${inv.email}`)
    }
    await loadData()
  } catch (err) {
    toast.error(err?.data?.message || 'Erreur lors du renvoi')
  } finally {
    resendingId.value = null
  }
}

const revokeInvitation = async (inv) => {
  const ok = await confirm({
    title: 'Révoquer l\'invitation',
    message: `L'invitation de ${inv.prenom} ${inv.nom} ne pourra plus être utilisée.`,
    confirmLabel: 'Révoquer',
    danger: true
  })
  if (!ok) return
  try {
    await apiFetch(`/admin/invitations/${inv.id}/revoke`, { method: 'PATCH' })
    toast.success('Invitation révoquée')
    await loadData()
  } catch (err) {
    toast.error(err?.data?.message || 'Erreur')
  }
}

const deleteInvitation = async (id) => {
  const ok = await confirm({
    title: 'Supprimer cette invitation',
    message: 'Cette action est irréversible.',
    confirmLabel: 'Supprimer',
    danger: true
  })
  if (!ok) return
  try {
    await apiFetch(`/admin/invitations/${id}`, { method: 'DELETE' })
    toast.success('Invitation supprimée')
    await loadData()
  } catch { toast.error('Erreur') }
}

// ─── Import CSV/Excel ─────────────────────────────────────────────────────────
const handleFileImport = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = async (e) => {
    try {
      let rows = []
      if (file.name.endsWith('.csv')) {
        const text    = e.target.result
        const lines   = text.split('\n').filter(l => l.trim())
        if (lines.length < 2) { toast.error('Fichier vide'); return }
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''))
        rows = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim().replace(/['"]/g, ''))
          const obj = {}
          headers.forEach((h, i) => obj[h] = values[i] || '')
          return obj
        })
      } else {
        const data     = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheet    = workbook.Sheets[workbook.SheetNames[0]]
        const raw      = XLSX.utils.sheet_to_json(sheet, { defval: '' })
        rows = raw.map(row => {
          const n = {}
          Object.keys(row).forEach(k => n[k.toLowerCase().trim()] = String(row[k]).trim())
          return n
        })
      }

      const validated = rows
        .filter(row => Object.values(row).some(v => v))
        .map(row => {
          const prenom     = row.prenom || row['prénom'] || ''
          const nom        = row.nom || ''
          const email      = row.email || ''
          const role       = (row.role || '').toLowerCase().trim()
          const filiereNom = row.filiere || row['filière'] || ''
          const classeNom  = row.classe || ''

          const filiereObj = filieres.value.find(f => f.nom.toLowerCase().trim() === filiereNom.toLowerCase().trim())
          const classeObj  = filiereObj && classeNom
            ? classes.value.find(c => c.nom.toLowerCase().trim() === classeNom.toLowerCase().trim() && c.filiereId === filiereObj.id)
            : null

          let error = ''
          if (!prenom) error = 'Prénom manquant'
          else if (!nom) error = 'Nom manquant'
          else if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) error = 'Email invalide'
          else if (!['etudiant', 'professeur'].includes(role)) error = 'Rôle invalide'
          else if (!filiereObj) error = `Filière "${filiereNom}" introuvable`
          else if (role === 'etudiant' && !classeObj) error = `Classe "${classeNom}" introuvable`

          return { prenom, nom, email, role, filiere: filiereObj?.nom || filiereNom, filiereId: filiereObj?.id || null, classe: classeObj?.nom || classeNom || null, classeId: classeObj?.id || null, error }
        })

      importRows.value   = validated
      importErrors.value = validated.filter(r => r.error).map((r, i) => `Ligne ${i + 1} (${r.email || 'vide'}) : ${r.error}`)
      showImportModal.value = true
    } catch {
      toast.error('Erreur lors de la lecture du fichier')
    }
  }

  file.name.endsWith('.csv') ? reader.readAsText(file, 'UTF-8') : reader.readAsArrayBuffer(file)
  event.target.value = ''
}

const sendBulkInvitations = async () => {
  const validRows = importRows.value.filter(r => !r.error)
  if (!validRows.length) return
  sendingBulk.value = true
  let success = 0, failed = 0, echecsEmail = 0
  let limiteAtteinte = null
  for (const row of validRows) {
    // Une fois la limite du plan atteinte, inutile de continuer à envoyer -
    // chaque ligne suivante échouerait pour la même raison.
    if (limiteAtteinte) { failed++; continue }
    try {
      const res = await apiFetch('/admin/invitations', { method: 'POST', body: { prenom: row.prenom, nom: row.nom, email: row.email, role: row.role, filiereId: row.filiereId, classeId: row.classeId || null } })
      if (res?.data?.emailEnvoye === false) echecsEmail++
      success++
    } catch (err) {
      if (err?.data?.code === 'LIMITE_ETUDIANTS' || err?.data?.code === 'LIMITE_PROFESSEURS') {
        limiteAtteinte = err.data.message
      }
      failed++
    }
  }
  sendingBulk.value = false
  showImportModal.value = false
  importRows.value = []
  if (success > 0) toast.success(`${success} invitation(s) envoyée(s)`)
  if (echecsEmail > 0) toast.error(`${echecsEmail} invitation(s) créée(s) mais l'email n'a pas pu être envoyé — pensez à copier les liens manuellement.`)
  if (limiteAtteinte) toast.error(limiteAtteinte)
  else if (failed > 0) toast.error(`${failed} échec(s)`)
  await loadData()
}

const downloadTemplate = () => {
  const csv  = 'prenom,nom,email,role,filiere,classe\nJean,Dupont,jean@email.com,etudiant,Informatique,1ère année\nMarie,Martin,marie@email.com,professeur,Informatique,'
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url; a.download = 'modele_invitations.csv'; a.click()
  URL.revokeObjectURL(url)
}

onMounted(() => loadData())
</script>