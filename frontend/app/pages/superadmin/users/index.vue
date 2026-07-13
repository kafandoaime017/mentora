<template>
  <div class="bg-layout font-body min-h-screen">
    <SuperadminLayout>
      <div>
        <div class="mb-6 flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-body font-extrabold text-black">Utilisateurs</h1>
            <p class="text-sm font-body text-black mt-1">{{ users.length }} utilisateur(s)</p>
          </div>
          <button @click="ouvrirModalInvitation" class="px-4 py-2.5 rounded-lg bg-[#024864] text-white text-sm font-body font-semibold hover:bg-blacky/90 transition flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            Inviter un utilisateur
          </button>
        </div>

        <!-- Filtres + Recherche -->
        <div class="flex flex-col sm:flex-row gap-3 mb-5">
          <div class="flex flex-wrap gap-1">
            <button v-for="f in filtres" :key="f.value" @click="filtreActif = f.value"
              class="px-3 py-1.5 rounded-sm text-sm font-body font-semibold transition-colors"
              :class="filtreActif === f.value ? 'bg-[#024864] text-white' : 'bg-white text-black hover:bg-gray-100'"
            >
              {{ f.label }} <span class="ml-1 opacity-60 text-xs">({{ getCount(f.value) }})</span>
            </button>
          </div>
          <div class="relative flex-1 min-w-0">
            <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input v-model="search" type="text" placeholder="Rechercher..."
              class="w-full pl-11 pr-4 py-2.5 bg-input rounded-lg text-sm font-body focus:outline-none"/>
          </div>
        </div>

        <div v-if="loading" class="bg-white shadow rounded-lg p-12 text-center">
          <div class="inline-block animate-spin rounded-full h-6 w-6 border-2 border-blacky border-t-transparent"/>
        </div>

        <div v-else>
          <!-- Desktop table -->
          <div class="hidden md:block bg-white rounded-sm border border-gray-200 overflow-hidden">
            <table class="w-full">
              <thead class="bg-blacky">
                <tr>
                  <th class="px-5 py-3.5 text-left text-xs font-body font-bold text-white uppercase">Nom</th>
                  <th class="px-5 py-3.5 text-left text-xs font-body font-bold text-white uppercase">Email</th>
                  <th class="px-5 py-3.5 text-center text-xs font-body font-bold text-white uppercase">Rôle</th>
                  <th class="px-5 py-3.5 text-center text-xs font-body font-bold text-white uppercase">Statut</th>
                  <th class="px-5 py-3.5 text-center text-xs font-body font-bold text-white uppercase">Créé le</th>
                  <th class="px-5 py-3.5 text-center text-xs font-body font-bold text-white uppercase">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="u in usersFiltres" :key="u.id" class="hover:bg-gray-50 transition">
                  <td class="px-5 py-4">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                        :class="roleStyle(u.role).bg + ' ' + roleStyle(u.role).text">
                        {{ u.prenom?.[0] }}{{ u.nom?.[0] }}
                      </div>
                      <p class="font-body font-semibold text-black text-sm">{{ u.prenom }} {{ u.nom }}</p>
                    </div>
                  </td>
                  <td class="px-5 py-4 text-sm font-body text-black">{{ u.email }}</td>
                  <td class="px-5 py-4 text-center">
                    <span class="px-2.5 py-1 rounded-full text-xs font-body font-semibold"
                      :class="roleStyle(u.role).bg + ' ' + roleStyle(u.role).text">
                      {{ u.role }}
                    </span>
                  </td>
                  <td class="px-5 py-4 text-center">
                    <span class="px-2.5 py-1 rounded-full text-xs font-body font-semibold"
                      :class="u.isActive ? 'bg-green-600 text-white' : 'bg-red-600 text-white'">
                      {{ u.isActive ? 'Actif' : 'Inactif' }}
                    </span>
                  </td>
                  <td class="px-5 py-4 text-center text-xs font-body text-black">
                    {{ new Date(u.createdAt).toLocaleDateString('fr-FR') }}
                  </td>
                  <td class="px-5 py-4">
                    <div class="flex items-center justify-center gap-1.5">
                      <button @click="toggleActif(u)"
                        class="px-2.5 py-1.5 rounded-lg text-xs font-body font-semibold transition"
                        :class="u.isActive ? 'bg-yellow-400 text-black hover:bg-yellow-500' : 'bg-green-500 text-white hover:bg-green-600'"
                      >{{ u.isActive ? 'Désactiver' : 'Activer' }}</button>
                      <button @click="confirmerSuppression(u)" class="px-2.5 py-1.5 rounded-lg text-xs font-body font-semibold bg-red-500 text-white hover:bg-red-600 transition">Supprimer</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <div v-if="usersFiltres.length === 0" class="p-16 text-center text-black font-body text-sm">Aucun utilisateur trouvé</div>
          </div>

          <!-- Mobile cards -->
          <div class="md:hidden space-y-3">
            <div v-for="u in usersFiltres" :key="u.id" class="bg-white rounded-lg border border-gray-200 p-4">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    :class="roleStyle(u.role).bg + ' ' + roleStyle(u.role).text">
                    {{ u.prenom?.[0] }}{{ u.nom?.[0] }}
                  </div>
                  <div>
                    <p class="font-body font-semibold text-black text-sm">{{ u.prenom }} {{ u.nom }}</p>
                    <p class="text-xs font-body text-black">{{ u.email }}</p>
                  </div>
                </div>
                <div class="flex flex-col items-end gap-1">
                  <span class="px-2 py-0.5 rounded-full text-xs font-body font-semibold"
                    :class="roleStyle(u.role).bg + ' ' + roleStyle(u.role).text">
                    {{ u.role }}
                  </span>
                  <span class="px-2 py-0.5 rounded-full text-xs font-body font-semibold"
                    :class="u.isActive ? 'bg-green-600 text-white' : 'bg-red-600 text-white'">
                    {{ u.isActive ? 'Actif' : 'Inactif' }}
                  </span>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <button @click="toggleActif(u)" class="flex-1 py-2 rounded-lg text-xs font-body font-semibold" :class="u.isActive ? 'bg-yellow-400 text-black' : 'bg-green-500 text-white'">
                  {{ u.isActive ? 'Désactiver' : 'Activer' }}
                </button>
                <button @click="confirmerSuppression(u)" class="flex-1 py-2 rounded-lg text-xs font-body font-semibold bg-red-500 text-white">Supprimer</button>
              </div>
            </div>
            <div v-if="usersFiltres.length === 0" class="py-16 text-center text-black font-body text-sm">Aucun utilisateur trouvé</div>
          </div>
        </div>

        <!-- Modal suppression -->
        <div v-if="modalSuppressionVisible" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" @click.self="modalSuppressionVisible = false">
          <div class="bg-white rounded-lg w-full max-w-sm p-6">
            <h3 class="font-extrabold text-black text-center text-xl font-body mb-2">Supprimer l'utilisateur</h3>
            <p class="text-sm font-body text-black text-center mb-6">Êtes-vous sûr de vouloir supprimer <strong>{{ userASupprimer?.prenom }} {{ userASupprimer?.nom }}</strong> ? Cette action est irréversible.</p>
            <div class="flex gap-3">
              <button @click="modalSuppressionVisible = false" class="flex-1 font-body py-2.5 bg-gray-200 text-black rounded-lg text-sm font-semibold">Annuler</button>
              <button @click="supprimerUser" :disabled="enregistrement"
                class="flex-1 font-body py-2.5 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <div v-if="enregistrement" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"/>
                <span v-else>Supprimer</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Modal invitation utilisateur -->
        <div v-if="modalInvitationVisible" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" @click.self="fermerModalInvitation">
          <div class="bg-white rounded-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h3 class="font-extrabold text-black text-center text-xl font-body mb-5">Inviter un utilisateur</h3>

            <form @submit.prevent="envoyerInvitationUtilisateur" class="space-y-3">
              <!-- Rôle -->
              <div>
                <label class="block text-xs font-body font-semibold text-black mb-1.5">Rôle</label>
                <div class="grid grid-cols-3 gap-2">
                  <button type="button" v-for="r in rolesInvitables" :key="r.value" @click="invitationForm.role = r.value; onRoleChange()"
                    class="py-2 rounded-lg text-xs font-body font-semibold transition"
                    :class="invitationForm.role === r.value ? 'bg-[#024864] text-white' : 'bg-input text-black'"
                  >{{ r.label }}</button>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-body font-semibold text-black mb-1.5">Prénom</label>
                  <input v-model="invitationForm.prenom" type="text" required class="w-full px-3 py-2.5 bg-input rounded-lg text-sm font-body focus:outline-none"/>
                </div>
                <div>
                  <label class="block text-xs font-body font-semibold text-black mb-1.5">Nom</label>
                  <input v-model="invitationForm.nom" type="text" required class="w-full px-3 py-2.5 bg-input rounded-lg text-sm font-body focus:outline-none"/>
                </div>
              </div>

              <div>
                <label class="block text-xs font-body font-semibold text-black mb-1.5">Email</label>
                <input v-model="invitationForm.email" type="email" required class="w-full px-3 py-2.5 bg-input rounded-lg text-sm font-body focus:outline-none"/>
              </div>

              <div>
                <label class="block text-xs font-body font-semibold text-black mb-1.5">École</label>
                <select v-model.number="invitationForm.ecoleId" @change="onEcoleChange" required class="w-full px-3 py-2.5 bg-input rounded-lg text-sm font-body focus:outline-none">
                  <option :value="null" disabled>Sélectionner une école</option>
                  <option v-for="e in ecoles" :key="e.id" :value="e.id">{{ e.nom }}</option>
                </select>
              </div>

              <div v-if="invitationForm.role !== 'directeur'">
                <label class="block text-xs font-body font-semibold text-black mb-1.5">Filière</label>
                <select v-model.number="invitationForm.filiereId" @change="onFiliereChange" required class="w-full px-3 py-2.5 bg-input rounded-lg text-sm font-body focus:outline-none" :disabled="!invitationForm.ecoleId">
                  <option :value="null" disabled>Sélectionner une filière</option>
                  <option v-for="f in filieresDisponibles" :key="f.id" :value="f.id">{{ f.nom }}</option>
                </select>
                <p v-if="invitationForm.ecoleId && filieresDisponibles.length === 0" class="text-xs font-body text-yellow-600 mt-1">Cette école n'a aucune filière.</p>
              </div>

              <div v-if="invitationForm.role === 'etudiant'">
                <label class="block text-xs font-body font-semibold text-black mb-1.5">Classe</label>
                <select v-model.number="invitationForm.classeId" required class="w-full px-3 py-2.5 bg-input rounded-lg text-sm font-body focus:outline-none" :disabled="!invitationForm.filiereId">
                  <option :value="null" disabled>Sélectionner une classe</option>
                  <option v-for="c in classesDisponibles" :key="c.id" :value="c.id">{{ c.nom }}</option>
                </select>
                <p v-if="invitationForm.filiereId && classesDisponibles.length === 0" class="text-xs font-body text-yellow-600 mt-1">Cette filière n'a aucune classe.</p>
              </div>

              <div class="flex gap-3 pt-2">
                <button type="button" @click="fermerModalInvitation" class="flex-1 font-body py-2.5 bg-gray-200 text-black rounded-lg text-sm font-semibold">Annuler</button>
                <button type="submit" :disabled="envoiInvitation"
                  class="flex-1 font-body py-2.5 bg-[#024864] text-white rounded-lg text-sm font-semibold hover:bg-blacky/90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <div v-if="envoiInvitation" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"/>
                  <span v-else>Envoyer l'invitation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </SuperadminLayout>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSuperadmin } from '~~/composables/useSuperadmin'
import { useToast } from '~~/composables/useToast'
definePageMeta({ layout: false })

const toast = useToast()
const { getAllUsers, toggleUserActif, deleteUser, getEcoles, inviterUtilisateur } = useSuperadmin()

const loading         = ref(true)
const users           = ref([])
const filtreActif     = ref('tous')
const search          = ref('')
const modalSuppressionVisible = ref(false)
const enregistrement  = ref(false)
const userASupprimer  = ref(null)

// ─── Invitation d'un nouvel utilisateur (tous rôles, toutes écoles) ─────────
const ecoles                  = ref([])
const modalInvitationVisible  = ref(false)
const envoiInvitation         = ref(false)
const rolesInvitables = [
  { value: 'directeur',  label: 'Directeur' },
  { value: 'professeur', label: 'Professeur' },
  { value: 'etudiant',   label: 'Étudiant' }
]
const invitationFormDefaut = () => ({
  role: 'directeur', prenom: '', nom: '', email: '',
  ecoleId: null, filiereId: null, classeId: null
})
const invitationForm = ref(invitationFormDefaut())

const ecoleSelectionnee = computed(() => ecoles.value.find(e => e.id === invitationForm.value.ecoleId) || null)
const filieresDisponibles = computed(() => ecoleSelectionnee.value?.filieres || [])
const classeSelectionnee = computed(() => filieresDisponibles.value.find(f => f.id === invitationForm.value.filiereId) || null)
const classesDisponibles = computed(() => classeSelectionnee.value?.classes || [])

const onRoleChange = () => {
  invitationForm.value.filiereId = null
  invitationForm.value.classeId  = null
}
const onEcoleChange = () => {
  invitationForm.value.filiereId = null
  invitationForm.value.classeId  = null
}
const onFiliereChange = () => {
  invitationForm.value.classeId = null
}

const ouvrirModalInvitation = async () => {
  invitationForm.value = invitationFormDefaut()
  modalInvitationVisible.value = true
  if (ecoles.value.length === 0) {
    const result = await getEcoles()
    if (result.success) ecoles.value = result.data
  }
}
const fermerModalInvitation = () => { modalInvitationVisible.value = false }

const envoyerInvitationUtilisateur = async () => {
  envoiInvitation.value = true
  const { role, prenom, nom, email, ecoleId, filiereId, classeId } = invitationForm.value
  const payload = { role, prenom, nom, email, ecoleId }
  if (role !== 'directeur') payload.filiereId = filiereId
  if (role === 'etudiant')  payload.classeId  = classeId

  const result = await inviterUtilisateur(payload)
  if (result.success) {
    toast.success(result.message || 'Invitation envoyée')
    modalInvitationVisible.value = false
  } else toast.error(result.message || 'Erreur')
  envoiInvitation.value = false
}

const filtres = [
  { value: 'tous',       label: 'Tous' },
  { value: 'directeur',  label: 'Directeurs' },
  { value: 'professeur', label: 'Professeurs' },
  { value: 'etudiant',   label: 'Étudiants' }
]

const roleStyle = (role) => ({
  directeur:  { bg: 'bg-secondary/10', text: 'text-secondary' },
  professeur: { bg: 'bg-blacky/10',    text: 'text-blacky'    },
  etudiant:   { bg: 'bg-primary/10',   text: 'text-primary'   }
}[role] || { bg: 'bg-gray-100', text: 'text-gray-600' })

const getCount = (role) => role === 'tous' ? users.value.length : users.value.filter(u => u.role === role).length

const usersFiltres = computed(() => {
  let list = filtreActif.value === 'tous' ? users.value : users.value.filter(u => u.role === filtreActif.value)
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    list = list.filter(u =>
      u.nom.toLowerCase().includes(q) ||
      u.prenom.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    )
  }
  return list
})

const toggleActif = async (u) => {
  const result = await toggleUserActif(u.id)
  if (result.success) { u.isActive = result.data.isActive; toast.success(result.message) }
  else toast.error(result.message || 'Erreur')
}

const confirmerSuppression = (u) => { userASupprimer.value = u; modalSuppressionVisible.value = true }

const supprimerUser = async () => {
  enregistrement.value = true
  const result = await deleteUser(userASupprimer.value.id)
  if (result.success) {
    toast.success(result.message)
    users.value = users.value.filter(u => u.id !== userASupprimer.value.id)
    modalSuppressionVisible.value = false
  } else toast.error(result.message || 'Erreur')
  enregistrement.value = false
}

onMounted(async () => {
  loading.value = true
  const result = await getAllUsers()
  if (result.success) users.value = result.data
  loading.value = false
})
</script>
