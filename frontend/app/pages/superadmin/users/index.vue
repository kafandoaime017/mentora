<template>
  <SuperadminLayout>
    <div>
      <div class="mb-6">
        <h1 class="text-2xl font-extrabold text-gray-800">Utilisateurs</h1>
        <p class="text-sm text-gray-400 mt-1">{{ users.length }} utilisateur(s)</p>
      </div>

      <!-- Filtres + Recherche -->
      <div class="flex flex-col sm:flex-row gap-3 mb-5">
        <div class="flex flex-wrap gap-2">
          <button v-for="f in filtres" :key="f.value" @click="filtreActif = f.value"
            class="px-4 py-2 rounded-xl text-sm font-semibold transition"
            :class="filtreActif === f.value ? 'bg-blacky text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'"
          >
            {{ f.label }} <span class="ml-1 opacity-60 text-xs">({{ getCount(f.value) }})</span>
          </button>
        </div>
        <div class="relative flex-1 min-w-0">
          <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input v-model="search" type="text" placeholder="Rechercher..."
            class="w-full pl-11 pr-4 py-2.5 bg-white rounded-xl text-sm border border-gray-200 focus:outline-none focus:border-blacky"/>
        </div>
      </div>

      <div v-if="loading" class="flex justify-center py-16">
        <div class="animate-spin rounded-full h-8 w-8 border-2 border-blacky border-t-transparent"/>
      </div>

      <div v-else>
        <!-- Desktop table -->
        <div class="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-100">
              <tr>
                <th class="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Nom</th>
                <th class="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
                <th class="px-5 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase">Rôle</th>
                <th class="px-5 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase">Statut</th>
                <th class="px-5 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase">Créé le</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-for="u in usersFiltres" :key="u.id" class="hover:bg-gray-50 transition">
                <td class="px-5 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      :class="roleStyle(u.role).bg + ' ' + roleStyle(u.role).text">
                      {{ u.prenom?.[0] }}{{ u.nom?.[0] }}
                    </div>
                    <p class="font-semibold text-gray-800 text-sm">{{ u.prenom }} {{ u.nom }}</p>
                  </div>
                </td>
                <td class="px-5 py-4 text-sm text-gray-500">{{ u.email }}</td>
                <td class="px-5 py-4 text-center">
                  <span class="px-2.5 py-1 rounded-full text-xs font-semibold"
                    :class="roleStyle(u.role).bg + ' ' + roleStyle(u.role).text">
                    {{ u.role }}
                  </span>
                </td>
                <td class="px-5 py-4 text-center">
                  <span class="px-2.5 py-1 rounded-full text-xs font-semibold"
                    :class="u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'">
                    {{ u.isActive ? 'Actif' : 'Inactif' }}
                  </span>
                </td>
                <td class="px-5 py-4 text-center text-xs text-gray-400">
                  {{ new Date(u.createdAt).toLocaleDateString('fr-FR') }}
                </td>
              </tr>
            </tbody>
          </table>
          <div v-if="usersFiltres.length === 0" class="p-16 text-center text-gray-400 text-sm">Aucun utilisateur trouvé</div>
        </div>

        <!-- Mobile cards -->
        <div class="md:hidden space-y-3">
          <div v-for="u in usersFiltres" :key="u.id" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  :class="roleStyle(u.role).bg + ' ' + roleStyle(u.role).text">
                  {{ u.prenom?.[0] }}{{ u.nom?.[0] }}
                </div>
                <div>
                  <p class="font-semibold text-gray-800 text-sm">{{ u.prenom }} {{ u.nom }}</p>
                  <p class="text-xs text-gray-400">{{ u.email }}</p>
                </div>
              </div>
              <div class="flex flex-col items-end gap-1">
                <span class="px-2 py-0.5 rounded-full text-xs font-semibold"
                  :class="roleStyle(u.role).bg + ' ' + roleStyle(u.role).text">
                  {{ u.role }}
                </span>
                <span class="px-2 py-0.5 rounded-full text-xs font-semibold"
                  :class="u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'">
                  {{ u.isActive ? 'Actif' : 'Inactif' }}
                </span>
              </div>
            </div>
          </div>
          <div v-if="usersFiltres.length === 0" class="py-16 text-center text-gray-400 text-sm">Aucun utilisateur trouvé</div>
        </div>
      </div>
    </div>
  </SuperadminLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSuperadmin } from '~~/composables/useSuperadmin'
import { useToast } from '~~/composables/useToast'
definePageMeta({ layout: false })

const { getAllUsers } = useSuperadmin()

const loading     = ref(true)
const users       = ref([])
const filtreActif = ref('tous')
const search      = ref('')

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

onMounted(async () => {
  loading.value = true
  const result = await getAllUsers()
  if (result.success) users.value = result.data
  loading.value = false
})
</script>