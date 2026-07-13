<template>
  <div class="bg-layout font-body min-h-screen">
    <SuperadminLayout>
      <div>
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 class="text-2xl font-body font-extrabold text-black">Administration</h1>
            <p class="text-sm font-body text-black mt-1">{{ superadmins.length }} superadmin(s) · {{ invitations.length }} invitation(s) en attente</p>
          </div>
          <button @click="ouvrirModal"
            class="flex items-center gap-2 px-5 py-2.5 bg-[#024864] text-white font-body rounded-lg text-sm font-semibold hover:bg-blacky/80 transition"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Inviter un superadmin
          </button>
        </div>

        <div class="bg-[#f5f0e8] rounded-lg px-5 py-3.5 mb-6 flex items-start gap-3">
          <svg class="w-4 h-4 text-yellow-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          <p class="text-xs font-body text-black">Par sécurité, vous ne pouvez pas désactiver, révoquer ou supprimer votre propre compte depuis cette page.</p>
        </div>

        <div v-if="loading" class="bg-white shadow rounded-lg p-12 text-center">
          <div class="inline-block animate-spin rounded-full h-6 w-6 border-2 border-blacky border-t-transparent"/>
        </div>

        <div v-else class="space-y-6">
          <!-- Invitations en attente -->
          <div v-if="invitations.length > 0" class="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div class="px-5 py-3.5 border-b border-gray-100">
              <h3 class="text-sm font-body font-bold text-black">Invitations en attente</h3>
            </div>
            <div class="divide-y divide-gray-100">
              <div v-for="inv in invitations" :key="inv.id" class="px-5 py-3.5 flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p class="text-sm font-body font-semibold text-black">{{ inv.prenom }} {{ inv.nom }}</p>
                  <p class="text-xs font-body text-black">{{ inv.email }}</p>
                </div>
                <div class="flex items-center gap-2">
                  <span v-if="inv.expiree" class="text-xs font-body font-semibold text-red-500">Expirée</span>
                  <span v-else class="text-xs font-body text-black">Expire le {{ new Date(inv.expiresAt).toLocaleDateString('fr-FR') }}</span>
                  <button @click="renvoyer(inv)" class="px-3 py-1.5 bg-[#024864]/10 text-blacky rounded-lg text-xs font-body font-semibold hover:bg-[#024864]/20 transition">Renvoyer</button>
                  <button @click="annuler(inv)" class="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-body font-semibold hover:bg-red-600 transition">Annuler</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Desktop table -->
          <div class="hidden md:block bg-white rounded-sm border border-gray-200 overflow-hidden">
            <table class="w-full" v-if="superadmins.length > 0">
              <thead class="bg-blacky">
                <tr>
                  <th class="px-5 py-3.5 text-left text-xs font-body font-bold text-white uppercase">Nom</th>
                  <th class="px-5 py-3.5 text-left text-xs font-body font-bold text-white uppercase">Email</th>
                  <th class="px-5 py-3.5 text-center text-xs font-body font-bold text-white uppercase">Statut</th>
                  <th class="px-5 py-3.5 text-center text-xs font-body font-bold text-white uppercase">Créé le</th>
                  <th class="px-5 py-3.5 text-center text-xs font-body font-bold text-white uppercase">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="s in superadmins" :key="s.id" class="hover:bg-gray-50 transition">
                  <td class="px-5 py-4">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-full bg-danger/10 flex items-center justify-center text-xs font-bold text-danger shrink-0">
                        {{ s.prenom?.[0] }}{{ s.nom?.[0] }}
                      </div>
                      <div>
                        <p class="font-body font-semibold text-black text-sm">{{ s.prenom }} {{ s.nom }}</p>
                        <p v-if="s.id === moi" class="text-[10px] font-body font-semibold text-secondary">Vous</p>
                      </div>
                    </div>
                  </td>
                  <td class="px-5 py-4 text-sm font-body text-black">{{ s.email }}</td>
                  <td class="px-5 py-4 text-center">
                    <span class="px-2.5 py-1 rounded-full text-xs font-body font-semibold"
                      :class="s.isActive ? 'bg-green-600 text-white' : 'bg-red-600 text-white'">
                      {{ s.isActive ? 'Actif' : 'Inactif' }}
                    </span>
                  </td>
                  <td class="px-5 py-4 text-center text-xs font-body text-black">
                    {{ new Date(s.createdAt).toLocaleDateString('fr-FR') }}
                  </td>
                  <td class="px-5 py-4">
                    <div v-if="s.id !== moi" class="flex items-center justify-center gap-1.5 flex-wrap">
                      <button @click="toggleActif(s)"
                        class="px-2.5 py-1.5 rounded-lg text-xs font-body font-semibold transition"
                        :class="s.isActive ? 'bg-yellow-400 text-black hover:bg-yellow-500' : 'bg-green-500 text-white hover:bg-green-600'"
                      >{{ s.isActive ? 'Désactiver' : 'Activer' }}</button>
                      <button @click="confirmerSuppression(s)" class="px-2.5 py-1.5 rounded-lg text-xs font-body font-semibold bg-red-500 text-white hover:bg-red-600 transition">Supprimer</button>
                    </div>
                    <div v-else class="text-center text-xs font-body text-black">—</div>
                  </td>
                </tr>
              </tbody>
            </table>
            <div v-else class="p-16 text-center text-black font-body text-sm">Aucun superadmin</div>
          </div>

          <!-- Mobile cards -->
          <div class="md:hidden space-y-3">
            <div v-for="s in superadmins" :key="s.id" class="bg-white rounded-lg border border-gray-200 p-4">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-full bg-danger/10 flex items-center justify-center text-xs font-bold text-danger">
                    {{ s.prenom?.[0] }}{{ s.nom?.[0] }}
                  </div>
                  <div>
                    <p class="font-body font-semibold text-black text-sm">{{ s.prenom }} {{ s.nom }} <span v-if="s.id === moi" class="text-[10px] text-secondary">(Vous)</span></p>
                    <p class="text-xs font-body text-black">{{ s.email }}</p>
                  </div>
                </div>
                <span class="px-2.5 py-1 rounded-full text-xs font-body font-semibold"
                  :class="s.isActive ? 'bg-green-600 text-white' : 'bg-red-600 text-white'">
                  {{ s.isActive ? 'Actif' : 'Inactif' }}
                </span>
              </div>
              <div v-if="s.id !== moi" class="flex items-center gap-2 flex-wrap">
                <button @click="toggleActif(s)" class="px-3 py-1.5 rounded-lg text-xs font-body font-semibold" :class="s.isActive ? 'bg-yellow-400 text-black' : 'bg-green-500 text-white'">
                  {{ s.isActive ? 'Désactiver' : 'Activer' }}
                </button>
                <button @click="confirmerSuppression(s)" class="px-3 py-1.5 rounded-lg text-xs font-body font-semibold bg-red-500 text-white">Supprimer</button>
              </div>
            </div>
            <div v-if="superadmins.length === 0" class="py-16 text-center text-black font-body text-sm">Aucun superadmin</div>
          </div>
        </div>

        <!-- Modal invitation -->
        <div v-if="modalVisible" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" @click.self="fermerModal">
          <div class="bg-white rounded-lg w-full max-w-md p-6">
            <h3 class="font-extrabold text-gray-900 text-center text-xl font-body mb-4">Inviter un superadmin</h3>
            <div class="space-y-3">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block font-body text-xs font-semibold text-black mb-1">Prénom *</label>
                  <input v-model="form.prenom" type="text" placeholder="Jean"
                    class="w-full px-3 py-2.5 bg-input rounded-lg text-sm font-body focus:outline-none"/>
                </div>
                <div>
                  <label class="block font-body text-xs font-semibold text-black mb-1">Nom *</label>
                  <input v-model="form.nom" type="text" placeholder="Dupont"
                    class="w-full px-3 py-2.5 bg-input rounded-lg text-sm font-body focus:outline-none"/>
                </div>
              </div>
              <div>
                <label class="block font-body text-xs font-semibold text-black mb-1">Email *</label>
                <input v-model="form.email" type="email" placeholder="superadmin@mentora.com"
                  class="w-full px-3 py-2.5 bg-input rounded-lg text-sm font-body focus:outline-none"/>
              </div>
              <div v-if="erreur" class="bg-red-50 text-red-600 text-xs font-body rounded-lg px-4 py-2">{{ erreur }}</div>
            </div>
            <div class="flex gap-3 mt-5">
              <button @click="fermerModal" class="flex-1 font-body py-2.5 bg-gray-200 text-black rounded-lg text-sm font-semibold">Annuler</button>
              <button @click="envoyerInvitationForm" :disabled="enregistrement"
                class="flex-1 font-body py-2.5 bg-[#024864] hover:bg-blacky/80 text-white rounded-lg text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <div v-if="enregistrement" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"/>
                <span v-else>Envoyer</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Modal suppression -->
        <div v-if="modalSuppressionVisible" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" @click.self="modalSuppressionVisible = false">
          <div class="bg-white rounded-lg w-full max-w-sm p-6">
            <h3 class="font-extrabold text-gray-900 text-center text-xl font-body mb-2">Supprimer le superadmin</h3>
            <p class="text-sm font-body text-black text-center mb-6">Êtes-vous sûr de vouloir supprimer <strong>{{ superadminASupprimer?.prenom }} {{ superadminASupprimer?.nom }}</strong> ? Cette action est irréversible.</p>
            <div class="flex gap-3">
              <button @click="modalSuppressionVisible = false" class="flex-1 font-body py-2.5 bg-gray-200 text-black rounded-lg text-sm font-semibold">Annuler</button>
              <button @click="supprimerSuperadmin" :disabled="enregistrement"
                class="flex-1 font-body py-2.5 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
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
  getSuperadmins, inviterSuperadmin, toggleSuperadminActif, deleteSuperadmin,
  resendSuperadminInvitation, revokeSuperadminInvitation
} = useSuperadmin()

const loading                 = ref(true)
const superadmins              = ref([])
const invitations               = ref([])
const moi                      = ref(null)
const modalVisible             = ref(false)
const modalSuppressionVisible  = ref(false)
const enregistrement           = ref(false)
const erreur                   = ref('')
const superadminASupprimer     = ref(null)
const form                     = reactive({ prenom: '', nom: '', email: '' })

const ouvrirModal  = () => { Object.assign(form, { prenom: '', nom: '', email: '' }); erreur.value = ''; modalVisible.value = true }
const fermerModal  = () => { modalVisible.value = false }

const envoyerInvitationForm = async () => {
  if (!form.prenom || !form.nom || !form.email) { erreur.value = 'Tous les champs sont requis'; return }
  enregistrement.value = true
  erreur.value = ''
  const result = await inviterSuperadmin({ prenom: form.prenom, nom: form.nom, email: form.email })
  if (result.success) { toast.success('Invitation envoyée !'); fermerModal(); await charger() }
  else erreur.value = result.message || 'Erreur'
  enregistrement.value = false
}

const toggleActif = async (s) => {
  const result = await toggleSuperadminActif(s.id)
  if (result.success) { s.isActive = result.data.isActive; toast.success(result.message) }
  else toast.error(result.message || 'Erreur')
}

const renvoyer = async (inv) => {
  const result = await resendSuperadminInvitation(inv.id)
  if (result.success) { toast.success(result.message); await charger() }
  else toast.error(result.message || 'Erreur')
}

const annuler = async (inv) => {
  const result = await revokeSuperadminInvitation(inv.id)
  if (result.success) { toast.success(result.message); await charger() }
  else toast.error(result.message || 'Erreur')
}

const confirmerSuppression = (s) => { superadminASupprimer.value = s; modalSuppressionVisible.value = true }

const supprimerSuperadmin = async () => {
  enregistrement.value = true
  const result = await deleteSuperadmin(superadminASupprimer.value.id)
  if (result.success) { toast.success(result.message); modalSuppressionVisible.value = false; await charger() }
  else toast.error(result.message || 'Erreur')
  enregistrement.value = false
}

const charger = async () => {
  const result = await getSuperadmins()
  if (result.success) {
    superadmins.value = result.data.superadmins || []
    invitations.value  = result.data.invitations || []
    moi.value          = result.data.moi
  }
}

onMounted(async () => {
  loading.value = true
  await charger()
  loading.value = false
})
</script>
