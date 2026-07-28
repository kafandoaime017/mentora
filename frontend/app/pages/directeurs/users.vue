<template>
  <div class="bg-layout font-body min-h-screen">
    <AdminLayout>
      <div class="max-w-7xl mx-auto">

        <div class="flex items-center justify-between mb-6">
          <h1 class="text-2xl font-body font-extrabold text-black">Utilisateurs</h1>
          <span class="text-sm font-body text-black">{{ users.length }} utilisateur{{ users.length > 1 ? 's' : ''
            }}</span>
        </div>

        <!-- Filtres + recherche -->
        <div class="flex flex-wrap gap-3 mb-4">
          <div class="flex gap-1">
            <button v-for="r in ['tous', 'etudiant', 'professeur']" :key="r" @click="roleFiltre = r"
              class="px-3 py-1.5 rounded-sm text-sm font-body font-semibold transition-colors"
              :class="roleFiltre === r ? 'bg-[#024864] text-white' : 'bg-white text-black hover:bg-gray-100'">
              {{ r === 'tous' ? 'Tous' : r === 'etudiant' ? 'Étudiants' : 'Professeurs' }}
            </button>
          </div>
          <div class="relative flex-1 min-w-[200px]">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input v-model="search" type="text" placeholder="Rechercher un utilisateur..."
              class="w-full pl-9 pr-4 py-2 bg-gray-300/80 placeholder:text-black placeholder:font-bold rounded-lg text-sm font-body focus:outline-none focus:border-[#3730a3] transition-colors" />
          </div>
        </div>

        <!-- Tableau -->
        <div class="bg-white rounded-sm border border-gray-200 overflow-hidden">
          <div v-if="loading" class="p-12 text-center">
            <div class="animate-spin rounded-full h-6 w-6 border-2 border-[#3730a3] border-t-transparent mx-auto" />
          </div>

          <div v-else-if="users.length === 0" class="p-12 text-center">
            <svg class="w-12 h-12 mx-auto mb-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p class="text-black text-sm font-body">Aucun utilisateur trouvé</p>
          </div>

          <table v-else class="w-full border-collapse">
  <thead class="bg-blacky">
    <tr class="border-b border-gray-100">
      <th class="px-4 py-3 uppercase font-body text-left text-xs font-bold text-white">AVATAR</th>
      <th class="px-4 py-3 uppercase font-body text-left text-xs font-bold text-white">NOM</th>
      <th class="px-4 py-3 uppercase font-body text-left text-xs font-bold text-white">PRÉNOM</th>
      <th class="px-4 py-3 uppercase font-body text-left text-xs font-bold text-white">FILIÈRE</th>
      <th class="px-4 py-3 uppercase font-body text-left text-xs font-bold text-white">CLASSE</th>
      <th class="px-4 py-3 uppercase font-body text-left text-xs font-bold text-white">STATUT</th>
      <th class="px-4 py-3 uppercase font-body text-center text-xs font-bold text-white" colspan="4">ACTIONS</th>
    </tr>
  </thead>
  <tbody class="divide-y divide-gray-100">
    <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50/50 transition-colors border-b border-gray-200">
      
      <!-- Avatar -->
      <td class="px-4 py-3">
        <div class="flex items-center gap-3">
          <img
            v-if="avatarUrl(user)"
            :src="avatarUrl(user)"
            class="w-9 h-9 rounded-full object-cover shrink-0"
            alt=""
          />
          <div v-else class="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-xs font-bold font-body"
            :class="user.role === 'etudiant' ? 'bg-primary/20 text-primary' : 'bg-secondary/30 text-secondary'">
            {{ (user.prenom?.[0] || '') }}{{ (user.nom?.[0] || '') }}
          </div>
        </div>
      </td>

      <!-- Nom -->
      <td class="px-4 py-3">
        <p class="text-sm font-body font-semibold text-black">{{ user.nom || '—' }}</p>
      </td>

      <!-- Prénom -->
      <td class="px-4 py-3">
        <p class="text-sm font-body font-semibold text-black">{{ user.prenom || '—' }}</p>
      </td>

      <!-- Filière -->
      <td class="px-4 py-3">
        <p class="text-sm font-body text-black">{{ user.profil?.filiere || '—' }}</p>
      </td>

      <!-- Classe / Spécialité -->
      <td class="px-4 py-3">
        <div v-if="user.role === 'etudiant'">
          <span class="text-xs bg-gray-100 px-3 py-1 rounded-full font-medium font-body text-black">
            {{ user.profil?.classe || '—' }}
          </span>
        </div>
        <div v-else-if="user.role === 'professeur'">
          <span class="text-xs bg-gray-100 px-3 py-1 rounded-full font-medium font-body text-black">
            {{ user.profil?.specialite || '—' }}
          </span>
        </div>
        <div v-else>
          <span class="text-xs text-black">—</span>
        </div>
      </td>

      <!-- Statut -->
      <td class="px-4 py-3">
        <div class="flex flex-col gap-1">
          <!-- Statut actif/inactif -->
          <span class="inline-flex items-center gap-1 text-xs font-body font-semibold px-2 py-0.5 rounded-full w-fit"
            :class="user.isActive ? 'bg-green-600 text-white' : 'bg-red-600 text-white'">
            {{ user.isActive ? 'Actif' : 'Inactif' }}
          </span>
          
          <!-- Statut pending pour professeur -->
          <span v-if="user.role === 'professeur' && user.profil?.statut === 'pending'"
            class="inline-flex items-center gap-1 text-xs font-body font-semibold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 w-fit">
            <span class="w-1.5 h-1.5 rounded-full bg-yellow-500" />
            En attente
          </span>
        </div>
      </td>

      <!-- Actions -->
      <td class="px-4 py-3" colspan="4">
        <div class="flex flex-wrap gap-2">
          <!-- Détails -->
          <NuxtLink :to="`/directeurs/utilisateurs/${user.id}`"
            class="inline-flex items-center gap-1 text-xs font-body font-semibold px-2.5 py-2 rounded-md bg-blacky text-white hover:bg-blacky/90 transition-colors">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Détails
          </NuxtLink>

          <!-- Valider professeur -->
          <button v-if="user.role === 'professeur' && user.profil?.statut === 'pending'"
            @click="activateProf(user.id)"
            class="inline-flex items-center gap-1 text-xs font-body font-semibold px-2.5 py-2 rounded-md bg-green-100 text-green-700 hover:bg-green-200 transition-colors">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            Valider
          </button>

          <!-- Télécharger l'historique -->
          <button @click="downloadHistorique(user)"
            :disabled="downloadingId === user.id"
            class="inline-flex items-center gap-1 text-xs font-body font-semibold px-2.5 py-2 rounded-md bg-secondary text-white hover:bg-secondary/90 transition-colors disabled:opacity-50">
            <svg v-if="downloadingId !== user.id" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <div v-else class="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent"/>
            Historique
          </button>

          <!-- Activer/Désactiver -->
          <button @click="toggleActive(user)"
            class="inline-flex items-center gap-1 text-xs font-body font-semibold px-2.5 py-2 rounded-md transition-colors"
            :class="user.isActive ? 'bg-yellow-400 text-black hover:bg-yellow-500' : 'bg-green-500 text-white hover:bg-green-600'">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M18.364 5.636L16.95 7.05M12 4v2m0 12v2m-4.95-2.05L5.636 18.364M19 12h2M4 12H2m15.364 6.364l-1.414-1.414M6.636 7.05L5.222 5.636" />
            </svg>
            {{ user.isActive ? 'Désactiver' : 'Activer' }}
          </button>

          <!-- Supprimer -->
          <button @click="deleteUser(user)"
            class="inline-flex items-center gap-1 text-xs font-body font-semibold px-2.5 py-2 rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
    </AdminLayout>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from '~~/composables/useToast'
import { useConfirm } from '~~/composables/useConfirm'

const toast = useToast()
const { confirm } = useConfirm()
const loading = ref(true)
const allUsers = ref([])
const roleFiltre = ref('tous')
const search = ref('')
const downloadingId = ref(null)

const apiFetch = async (url, options = {}) => {
  const config = useRuntimeConfig()
  const token = useCookie('auth_token').value
  return await $fetch(`${config.public.apiBase}${url}`, {
    ...options,
    headers: { 'Authorization': `Bearer ${token}`, ...options.headers }
  })
}

const avatarUrl = (user) => {
  if (!user?.avatar) return ''
  if (user.avatar.startsWith('http')) return user.avatar
  const config = useRuntimeConfig()
  return `${config.public.apiBase.replace(/\/api$/, '')}${user.avatar}`
}

const users = computed(() =>
  allUsers.value.filter(u => {
    const matchRole = roleFiltre.value === 'tous' || u.role === roleFiltre.value
    const matchSearch = !search.value || [u.nom, u.prenom, u.email]
      .some(v => v?.toLowerCase().includes(search.value.toLowerCase()))
    return matchRole && matchSearch
  })
)

const loadUsers = async () => {
  loading.value = true
  try {
    const result = await apiFetch('/admin/users')
    if (result.success) allUsers.value = result.data
  } finally {
    loading.value = false
  }
}

const toggleActive = async (user) => {
  const activation = !user.isActive
  const ok = await confirm({
    title: activation ? 'Réactiver le compte' : 'Désactiver le compte',
    message: activation
      ? `${user.prenom} ${user.nom} pourra de nouveau se connecter.`
      : `${user.prenom} ${user.nom} ne pourra plus se connecter tant que le compte n'est pas réactivé.`,
    confirmLabel: activation ? 'Réactiver' : 'Désactiver',
    danger: !activation
  })
  if (!ok) return

  try {
    await apiFetch(`/admin/users/${user.id}/toggle-active`, { method: 'PATCH' })
    user.isActive = !user.isActive
    toast.success(user.isActive ? 'Compte réactivé' : 'Compte désactivé')
  } catch {
    toast.error('Erreur')
  }
}

const activateProf = async (userId) => {
  try {
    await apiFetch(`/admin/users/${userId}/activate-prof`, { method: 'PATCH' })
    toast.success('Professeur validé')
    await loadUsers()
  } catch {
    toast.error('Erreur')
  }
}

const downloadHistorique = async (user) => {
  downloadingId.value = user.id
  try {
    const config = useRuntimeConfig()
    const token  = useCookie('auth_token').value
    const res = await fetch(`${config.public.apiBase}/admin/users/${user.id}/historique/pdf`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) throw new Error('Erreur lors de la génération du PDF')
    const blob = await res.blob()
    const url  = window.URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url
    a.download = `historique_${user.nom}_${user.prenom}.pdf`
    document.body.appendChild(a)
    a.click()
    a.remove()
    window.URL.revokeObjectURL(url)
  } catch {
    toast.error('Erreur lors du téléchargement de l\'historique')
  } finally {
    downloadingId.value = null
  }
}

const deleteUser = async (user) => {
  const ok = await confirm({
    title: 'Supprimer cet utilisateur',
    message: `Supprimer définitivement ${user.prenom} ${user.nom} ? Cette action est irréversible.`,
    confirmLabel: 'Supprimer',
    danger: true
  })
  if (!ok) return
  try {
    await apiFetch(`/admin/users/${user.id}`, { method: 'DELETE' })
    toast.success('Utilisateur supprimé')
    await loadUsers()
  } catch (err) {
    toast.error(err?.data?.message || 'Erreur')
  }
}

onMounted(() => loadUsers())
</script>