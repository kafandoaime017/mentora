<template>
  <div class="bg-layout font-body min-h-screen">
    <SuperadminLayout>
      <div>
        <div class="mb-6">
          <h1 class="text-2xl font-body font-extrabold text-gray-800">Utilisateurs</h1>
          <p class="text-sm font-body text-gray-500 mt-1">{{ users.length }} utilisateur(s)</p>
        </div>

        <!-- Filtres + Recherche -->
        <div class="flex flex-col sm:flex-row gap-3 mb-5">
          <div class="flex flex-wrap gap-1">
            <button v-for="f in filtres" :key="f.value" @click="filtreActif = f.value"
              class="px-3 py-1.5 rounded-sm text-sm font-body font-semibold transition-colors"
              :class="filtreActif === f.value ? 'bg-[#024864] text-white' : 'bg-white text-gray-500 hover:bg-gray-100'"
            >
              {{ f.label }} <span class="ml-1 opacity-60 text-xs">({{ getCount(f.value) }})</span>
            </button>
          </div>
          <div class="relative flex-1 min-w-0">
            <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div class="hidden md:block bg-white rounded-xl shadow-[1px_1px_7px_1px_rgba(0,0,0,0.08)] overflow-hidden">
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
                      <p class="font-body font-semibold text-gray-800 text-sm">{{ u.prenom }} {{ u.nom }}</p>
                    </div>
                  </td>
                  <td class="px-5 py-4 text-sm font-body text-gray-500">{{ u.email }}</td>
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
                  <td class="px-5 py-4 text-center text-xs font-body text-gray-400">
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
            <div v-if="usersFiltres.length === 0" class="p-16 text-center text-gray-400 font-body text-sm">Aucun utilisateur trouvé</div>
          </div>

          <!-- Mobile cards -->
          <div class="md:hidden space-y-3">
            <div v-for="u in usersFiltres" :key="u.id" class="bg-white rounded-xl shadow-[1px_1px_7px_1px_rgba(0,0,0,0.08)] p-4">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    :class="roleStyle(u.role).bg + ' ' + roleStyle(u.role).text">
                    {{ u.prenom?.[0] }}{{ u.nom?.[0] }}
                  </div>
                  <div>
                    <p class="font-body font-semibold text-gray-800 text-sm">{{ u.prenom }} {{ u.nom }}</p>
                    <p class="text-xs font-body text-gray-400">{{ u.email }}</p>
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
            <div v-if="usersFiltres.length === 0" class="py-16 text-center text-gray-400 font-body text-sm">Aucun utilisateur trouvé</div>
          </div>
        </div>

        <!-- Modal suppression -->
        <div v-if="modalSuppressionVisible" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" @click.self="modalSuppressionVisible = false">
          <div class="bg-white rounded-xl w-full max-w-sm p-6">
            <h3 class="font-extrabold text-gray-900 text-center text-xl font-body mb-2">Supprimer l'utilisateur</h3>
            <p class="text-sm font-body text-gray-500 text-center mb-6">Êtes-vous sûr de vouloir supprimer <strong>{{ userASupprimer?.prenom }} {{ userASupprimer?.nom }}</strong> ? Cette action est irréversible.</p>
            <div class="flex gap-3">
              <button @click="modalSuppressionVisible = false" class="flex-1 font-body py-2.5 bg-gray-200 text-gray-600 rounded-xl text-sm font-semibold">Annuler</button>
              <button @click="supprimerUser" :disabled="enregistrement"
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
import { ref, computed, onMounted } from 'vue'
import { useSuperadmin } from '~~/composables/useSuperadmin'
import { useToast } from '~~/composables/useToast'
definePageMeta({ layout: false })

const toast = useToast()
const { getAllUsers, toggleUserActif, deleteUser } = useSuperadmin()

const loading         = ref(true)
const users           = ref([])
const filtreActif     = ref('tous')
const search          = ref('')
const modalSuppressionVisible = ref(false)
const enregistrement  = ref(false)
const userASupprimer  = ref(null)

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
