<template>
  <div class="bg-layout font-body min-h-screen">
    <SuperadminLayout>
      <div>
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 class="text-2xl font-body font-extrabold text-gray-800">Directeurs</h1>
            <p class="text-sm font-body text-gray-500 mt-1">{{ directeurs.length }} directeur(s) · {{ invitations.length }} invitation(s) en attente</p>
          </div>
          <button @click="ouvrirModal"
            class="flex items-center gap-2 px-5 py-2.5 bg-[#024864] text-white font-body rounded-xl text-sm font-semibold hover:bg-blacky/80 transition"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Inviter un directeur
          </button>
        </div>

        <div v-if="loading" class="bg-white shadow rounded-lg p-12 text-center">
          <div class="inline-block animate-spin rounded-full h-6 w-6 border-2 border-blacky border-t-transparent"/>
        </div>

        <div v-else class="space-y-6">
          <!-- Invitations en attente -->
          <div v-if="invitations.length > 0" class="bg-white rounded-xl shadow-[1px_1px_7px_1px_rgba(0,0,0,0.08)] overflow-hidden">
            <div class="px-5 py-3.5 border-b border-gray-100">
              <h3 class="text-sm font-body font-bold text-gray-800">Invitations en attente</h3>
            </div>
            <div class="divide-y divide-gray-100">
              <div v-for="inv in invitations" :key="inv.id" class="px-5 py-3.5 flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p class="text-sm font-body font-semibold text-gray-800">{{ inv.prenom }} {{ inv.nom }}</p>
                  <p class="text-xs font-body text-gray-400">{{ inv.email }} · {{ inv.ecole || 'École inconnue' }}</p>
                </div>
                <div class="flex items-center gap-2">
                  <span v-if="inv.expiree" class="text-xs font-body font-semibold text-red-500">Expirée</span>
                  <span v-else class="text-xs font-body text-gray-400">Expire le {{ new Date(inv.expiresAt).toLocaleDateString('fr-FR') }}</span>
                  <button @click="renvoyer(inv)" class="px-3 py-1.5 bg-[#024864]/10 text-blacky rounded-lg text-xs font-body font-semibold hover:bg-[#024864]/20 transition">Renvoyer</button>
                  <button @click="annuler(inv)" class="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-body font-semibold hover:bg-red-600 transition">Annuler</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Desktop table -->
          <div class="hidden md:block bg-white rounded-sm shadow-[1px_1px_7px_1px_rgba(0,0,0,0.08)] overflow-hidden">
            <table class="w-full" v-if="directeurs.length > 0">
              <thead class="bg-blacky">
                <tr>
                  <th class="px-5 py-3.5 text-left text-xs font-body font-bold text-white uppercase">Nom</th>
                  <th class="px-5 py-3.5 text-left text-xs font-body font-bold text-white uppercase">Email</th>
                  <th class="px-5 py-3.5 text-left text-xs font-body font-bold text-white uppercase">École</th>
                  <th class="px-5 py-3.5 text-center text-xs font-body font-bold text-white uppercase">Statut</th>
                  <th class="px-5 py-3.5 text-center text-xs font-body font-bold text-white uppercase">Vérifié</th>
                  <th class="px-5 py-3.5 text-center text-xs font-body font-bold text-white uppercase">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="d in directeurs" :key="d.id" class="hover:bg-gray-50 transition">
                  <td class="px-5 py-4">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-xs font-bold text-secondary shrink-0">
                        {{ d.prenom?.[0] }}{{ d.nom?.[0] }}
                      </div>
                      <p class="font-body font-semibold text-gray-800 text-sm">{{ d.prenom }} {{ d.nom }}</p>
                    </div>
                  </td>
                  <td class="px-5 py-4 text-sm font-body text-gray-500">{{ d.email }}</td>
                  <td class="px-5 py-4 text-sm font-body text-gray-500">{{ d.ecole || '—' }}</td>
                  <td class="px-5 py-4 text-center">
                    <span class="px-2.5 py-1 rounded-full text-xs font-body font-semibold"
                      :class="d.isActive ? 'bg-green-600 text-white' : 'bg-red-600 text-white'">
                      {{ d.isActive ? 'Actif' : 'Inactif' }}
                    </span>
                  </td>
                  <td class="px-5 py-4 text-center">
                    <span class="px-2.5 py-1 rounded-full text-xs font-body font-semibold"
                      :class="d.isVerified ? 'bg-blue-600 text-white' : 'bg-yellow-600 text-white'">
                      {{ d.isVerified ? 'Vérifié' : 'En attente' }}
                    </span>
                  </td>
                  <td class="px-5 py-4">
                    <div class="flex items-center justify-center gap-1.5 flex-wrap">
                      <button v-if="!d.isVerified" @click="renvoyerVerif(d)"
                        class="px-2.5 py-1.5 rounded-lg text-xs font-body font-semibold bg-[#024864]/10 text-blacky hover:bg-[#024864]/20 transition"
                      >Renvoyer email</button>
                      <button @click="toggleActif(d)"
                        class="px-2.5 py-1.5 rounded-lg text-xs font-body font-semibold transition"
                        :class="d.isActive ? 'bg-yellow-400 text-black hover:bg-yellow-500' : 'bg-green-500 text-white hover:bg-green-600'"
                      >{{ d.isActive ? 'Désactiver' : 'Activer' }}</button>
                      <button @click="confirmerSuppression(d)" class="px-2.5 py-1.5 rounded-lg text-xs font-body font-semibold bg-red-500 text-white hover:bg-red-600 transition">Supprimer</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <div v-else class="p-16 text-center text-gray-400 font-body text-sm">Aucun directeur</div>
          </div>

          <!-- Mobile cards -->
          <div class="md:hidden space-y-3">
            <div v-for="d in directeurs" :key="d.id" class="bg-white rounded-xl shadow-[1px_1px_7px_1px_rgba(0,0,0,0.08)] p-4">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-full bg-secondary/10 flex items-center justify-center text-xs font-bold text-secondary">
                    {{ d.prenom?.[0] }}{{ d.nom?.[0] }}
                  </div>
                  <div>
                    <p class="font-body font-semibold text-gray-800 text-sm">{{ d.prenom }} {{ d.nom }}</p>
                    <p class="text-xs font-body text-gray-400">{{ d.email }}</p>
                    <p class="text-xs font-body text-gray-300">{{ d.ecole || '—' }}</p>
                  </div>
                </div>
                <span class="px-2.5 py-1 rounded-full text-xs font-body font-semibold"
                  :class="d.isActive ? 'bg-green-600 text-white' : 'bg-red-600 text-white'">
                  {{ d.isActive ? 'Actif' : 'Inactif' }}
                </span>
              </div>
              <div class="flex items-center justify-between mb-3">
                <span class="px-2.5 py-1 rounded-full text-xs font-body font-semibold"
                  :class="d.isVerified ? 'bg-blue-600 text-white' : 'bg-yellow-600 text-white'">
                  {{ d.isVerified ? 'Vérifié' : 'En attente' }}
                </span>
              </div>
              <div class="flex items-center gap-2 flex-wrap">
                <button v-if="!d.isVerified" @click="renvoyerVerif(d)" class="px-3 py-1.5 rounded-lg text-xs font-body font-semibold bg-[#024864]/10 text-blacky">Renvoyer email</button>
                <button @click="toggleActif(d)" class="px-3 py-1.5 rounded-lg text-xs font-body font-semibold" :class="d.isActive ? 'bg-yellow-400 text-black' : 'bg-green-500 text-white'">
                  {{ d.isActive ? 'Désactiver' : 'Activer' }}
                </button>
                <button @click="confirmerSuppression(d)" class="px-3 py-1.5 rounded-lg text-xs font-body font-semibold bg-red-500 text-white">Supprimer</button>
              </div>
            </div>
            <div v-if="directeurs.length === 0" class="py-16 text-center text-gray-400 font-body text-sm">Aucun directeur</div>
          </div>
        </div>

        <!-- Modal invitation -->
        <div v-if="modalVisible" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" @click.self="fermerModal">
          <div class="bg-white rounded-xl w-full max-w-md p-6">
            <h3 class="font-extrabold text-gray-900 text-center text-xl font-body mb-4">Inviter un directeur</h3>
            <div class="space-y-3">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block font-body text-xs font-semibold text-gray-600 mb-1">Prénom *</label>
                  <input v-model="form.prenom" type="text" placeholder="Jean"
                    class="w-full px-3 py-2.5 bg-input rounded-xl text-sm font-body focus:outline-none"/>
                </div>
                <div>
                  <label class="block font-body text-xs font-semibold text-gray-600 mb-1">Nom *</label>
                  <input v-model="form.nom" type="text" placeholder="Dupont"
                    class="w-full px-3 py-2.5 bg-input rounded-xl text-sm font-body focus:outline-none"/>
                </div>
              </div>
              <div>
                <label class="block font-body text-xs font-semibold text-gray-600 mb-1">Email *</label>
                <input v-model="form.email" type="email" placeholder="directeur@ecole.com"
                  class="w-full px-3 py-2.5 bg-input rounded-xl text-sm font-body focus:outline-none"/>
              </div>
              <div>
                <label class="block font-body text-xs font-semibold text-gray-600 mb-1">École *</label>
                <select v-model="form.ecoleId" class="w-full px-3 py-2.5 bg-input rounded-xl text-sm font-body focus:outline-none">
                  <option value="">-- Sélectionner --</option>
                  <option v-for="e in ecoles" :key="e.id" :value="e.id">{{ e.nom }}</option>
                </select>
              </div>
              <div v-if="erreur" class="bg-red-50 text-red-600 text-xs font-body rounded-xl px-4 py-2">{{ erreur }}</div>
            </div>
            <div class="flex gap-3 mt-5">
              <button @click="fermerModal" class="flex-1 font-body py-2.5 bg-gray-200 text-gray-600 rounded-xl text-sm font-semibold">Annuler</button>
              <button @click="envoyerInvitationForm" :disabled="enregistrement"
                class="flex-1 font-body py-2.5 bg-[#024864] hover:bg-blacky/80 text-white rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <div v-if="enregistrement" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"/>
                <span v-else>Envoyer</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Modal suppression -->
        <div v-if="modalSuppressionVisible" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" @click.self="modalSuppressionVisible = false">
          <div class="bg-white rounded-xl w-full max-w-sm p-6">
            <h3 class="font-extrabold text-gray-900 text-center text-xl font-body mb-2">Supprimer le directeur</h3>
            <p class="text-sm font-body text-gray-500 text-center mb-6">Êtes-vous sûr de vouloir supprimer <strong>{{ directeurASupprimer?.prenom }} {{ directeurASupprimer?.nom }}</strong> ? Cette action est irréversible.</p>
            <div class="flex gap-3">
              <button @click="modalSuppressionVisible = false" class="flex-1 font-body py-2.5 bg-gray-200 text-gray-600 rounded-xl text-sm font-semibold">Annuler</button>
              <button @click="supprimerDirecteur" :disabled="enregistrement"
                class="flex-1 font-body py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <div v-if="enregistrement" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"/>
                <span v-else>Supprimer</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </SuperadminLayout>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useSuperadmin } from '~~/composables/useSuperadmin'
import { useToast } from '~~/composables/useToast'
definePageMeta({ layout: false })

const toast = useToast()
const {
  getDirecteurs, inviterDirecteur, toggleDirecteur, deleteDirecteur,
  resendVerificationDirecteur, resendInvitation, revokeInvitation, getEcoles
} = useSuperadmin()

const loading                 = ref(true)
const directeurs               = ref([])
const invitations               = ref([])
const ecoles                   = ref([])
const modalVisible             = ref(false)
const modalSuppressionVisible  = ref(false)
const enregistrement           = ref(false)
const erreur                   = ref('')
const directeurASupprimer      = ref(null)
const form                     = reactive({ prenom: '', nom: '', email: '', ecoleId: '' })

const ouvrirModal  = () => { Object.assign(form, { prenom: '', nom: '', email: '', ecoleId: '' }); erreur.value = ''; modalVisible.value = true }
const fermerModal  = () => { modalVisible.value = false }

const envoyerInvitationForm = async () => {
  if (!form.prenom || !form.nom || !form.email || !form.ecoleId) { erreur.value = 'Tous les champs sont requis'; return }
  enregistrement.value = true
  erreur.value = ''
  const result = await inviterDirecteur({ prenom: form.prenom, nom: form.nom, email: form.email, ecoleId: form.ecoleId })
  if (result.success) { toast.success('Invitation envoyée !'); fermerModal(); await chargerDirecteurs() }
  else erreur.value = result.message || 'Erreur'
  enregistrement.value = false
}

const toggleActif = async (d) => {
  const result = await toggleDirecteur(d.id)
  if (result.success) { d.isActive = result.data.isActive; toast.success(result.message) }
  else toast.error(result.message || 'Erreur')
}

const renvoyerVerif = async (d) => {
  const result = await resendVerificationDirecteur(d.id)
  if (result.success) toast.success(result.message)
  else toast.error(result.message || 'Erreur')
}

const renvoyer = async (inv) => {
  const result = await resendInvitation(inv.id)
  if (result.success) { toast.success(result.message); await chargerDirecteurs() }
  else toast.error(result.message || 'Erreur')
}

const annuler = async (inv) => {
  const result = await revokeInvitation(inv.id)
  if (result.success) { toast.success(result.message); await chargerDirecteurs() }
  else toast.error(result.message || 'Erreur')
}

const confirmerSuppression = (d) => { directeurASupprimer.value = d; modalSuppressionVisible.value = true }

const supprimerDirecteur = async () => {
  enregistrement.value = true
  const result = await deleteDirecteur(directeurASupprimer.value.id)
  if (result.success) { toast.success(result.message); modalSuppressionVisible.value = false; await chargerDirecteurs() }
  else toast.error(result.message || 'Erreur')
  enregistrement.value = false
}

const chargerDirecteurs = async () => {
  const result = await getDirecteurs()
  if (result.success) {
    directeurs.value  = result.data.directeurs || []
    invitations.value = result.data.invitations || []
  }
}

onMounted(async () => {
  loading.value = true
  const [resEcoles] = await Promise.all([getEcoles(), chargerDirecteurs()])
  if (resEcoles.success) ecoles.value = resEcoles.data
  loading.value = false
})
</script>
