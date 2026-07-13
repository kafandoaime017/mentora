<template>
  <div class="bg-layout font-body min-h-screen">
    <AdminLayout>
      <div class="max-w-3xl mx-auto">

        <!-- Retour -->
        <nuxt-link to="/directeurs/users"
          class="inline-flex items-center gap-1.5 text-sm font-body text-gray-900 hover:text-gray-600 transition-colors mb-6"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
          Retour aux utilisateurs
        </nuxt-link>

        <div v-if="loading" class="flex justify-center py-20">
          <div class="animate-spin rounded-full h-6 w-6 border-2 border-blacky border-t-transparent"/>
        </div>

        <div v-else-if="!user" class="text-center py-20">
          <p class="text-sm font-body text-gray-900">Utilisateur introuvable</p>
        </div>

        <div v-else class="space-y-4">

          <!-- Carte principale -->
          <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 class="text-sm font-body font-semibold text-gray-500 uppercase tracking-wide">Profil</h2>
              <div class="flex items-center gap-2">
                <span
                  class="text-xs font-body px-2 py-0.5 rounded font-medium"
                  :class="user.role === 'etudiant' ? 'bg-blue-50 text-blue-700' : 'bg-secondary/20 text-secondary'"
                >
                  {{ user.role === 'etudiant' ? 'Étudiant' : 'Professeur' }}
                </span>
                <span
                  class="text-xs font-body px-2 py-0.5 rounded font-medium"
                  :class="user.isActive ? 'bg-green-500 text-white' : 'bg-red-500 text-white'"
                >
                  {{ user.isActive ? 'Actif' : 'Inactif' }}
                </span>
              </div>
            </div>

            <div class="p-5 flex items-center gap-4">
              <div
                class="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold font-body shrink-0"
                :class="user.role === 'etudiant' ? 'bg-primary text-white' : 'bg-secondary/20 text-secondary'"
              >
                {{ user.prenom?.[0] }}{{ user.nom?.[0] }}
              </div>
              <div>
                <h1 class="text-xl font-body font-bold text-gray-800">{{ user.prenom }} {{ user.nom }}</h1>
                <p class="text-sm font-body text-gray-900 mt-0.5">{{ user.email }}</p>
                <p class="text-xs font-body text-gray-900 mt-1">
                  Inscrit le {{ new Date(user.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Infos académiques -->
          <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div class="px-5 py-4 border-b border-gray-100">
              <h2 class="text-sm font-body font-semibold text-gray-500 uppercase tracking-wide">Informations académiques</h2>
            </div>
            <div class="p-5">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-xs font-body text-gray-900 mb-1">Filière</p>
                  <p class="text-sm font-body font-medium text-gray-800">{{ user.profil?.filiere || '—' }}</p>
                </div>
                <div v-if="user.role === 'etudiant'">
                  <p class="text-xs font-body text-gray-900 mb-1">Classe</p>
                  <p class="text-sm font-body font-medium text-gray-800">{{ user.profil?.classe || '—' }}</p>
                </div>
                <div v-if="user.role === 'professeur'">
                  <p class="text-xs font-body text-gray-900 mb-1">Statut</p>
                  <span
                    class="text-xs font-body px-2 py-0.5 rounded font-medium"
                    :class="user.profil?.statut === 'active' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'"
                  >
                    {{ user.profil?.statut === 'active' ? 'Validé' : 'En attente' }}
                  </span>
                </div>
                <div>
                  <p class="text-xs font-body text-gray-900 mb-1">Email vérifié</p>
                  <span
                    class="text-xs font-body px-2 py-0.5 rounded font-medium"
                    :class="user.isVerified ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'"
                  >
                    {{ user.isVerified ? 'Oui' : 'Non' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Sessions (étudiant) -->
          <div v-if="user.role === 'etudiant' && sessions.length > 0" class="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div class="px-5 py-4 border-b border-gray-100">
              <h2 class="text-sm font-body font-semibold text-gray-500 uppercase tracking-wide">
                Sessions passées
                <span class="ml-1 font-normal normal-case text-gray-900">({{ sessions.length }})</span>
              </h2>
            </div>
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-gray-100 bg-gray-50">
                  <th class="px-5 py-2.5 text-left text-xs font-body font-semibold text-gray-900">Session</th>
                  <th class="px-5 py-2.5 text-center text-xs font-body font-semibold text-gray-900">Note</th>
                  <th class="px-5 py-2.5 text-center text-xs font-body font-semibold text-gray-900">Statut</th>
                  <th class="px-5 py-2.5 text-right text-xs font-body font-semibold text-gray-900 hidden md:table-cell">Date</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="s in sessions" :key="s.id" class="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                  <td class="px-5 py-3">
                    <p class="font-body font-medium text-gray-800">{{ s.titre }}</p>
                    <p class="text-xs font-body text-gray-900">{{ s.filiere }} · {{ s.classe }}</p>
                  </td>
                  <td class="px-5 py-3 text-center">
                    <span
                      class="font-body font-bold text-sm"
                      :class="{
                        'text-green-600': s.note_sur_20 >= 14,
                        'text-amber-500': s.note_sur_20 >= 10 && s.note_sur_20 < 14,
                        'text-red-500':   s.note_sur_20 < 10,
                        'text-gray-300':  s.note_sur_20 === null
                      }"
                    >
                      {{ s.note_sur_20 !== null ? s.note_sur_20 + '/20' : '—' }}
                    </span>
                  </td>
                  <td class="px-5 py-3 text-center">
                    <span
                      class="text-xs font-body px-2 py-0.5 rounded font-medium"
                      :class="{
                        'bg-green-50 text-green-700': s.statut === 'termine',
                        'bg-blue-50 text-blue-600':   s.statut === 'present',
                        'bg-gray-100 text-gray-500':  s.statut === 'inscrit',
                      }"
                    >
                      {{ s.statut === 'termine' ? 'Terminé' : s.statut === 'present' ? 'En cours' : 'Inscrit' }}
                    </span>
                  </td>
                  <td class="px-5 py-3 text-right hidden md:table-cell">
                    <span class="text-xs font-body text-gray-900">
                      {{ new Date(s.date_debut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Sessions (professeur) -->
          <div v-if="user.role === 'professeur' && sessions.length > 0" class="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div class="px-5 py-4 border-b border-gray-100">
              <h2 class="text-sm font-body font-semibold text-gray-500 uppercase tracking-wide">
                Sessions créées
                <span class="ml-1 font-normal normal-case text-gray-900">({{ sessions.length }})</span>
              </h2>
            </div>
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-gray-100 bg-gray-50">
                  <th class="px-5 py-2.5 text-left text-xs font-body font-semibold text-gray-900">Session</th>
                  <th class="px-5 py-2.5 text-center text-xs font-body font-semibold text-gray-900">Participants</th>
                  <th class="px-5 py-2.5 text-center text-xs font-body font-semibold text-gray-900">Statut</th>
                  <th class="px-5 py-2.5 text-right text-xs font-body font-semibold text-gray-900 hidden md:table-cell">Date</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="s in sessions" :key="s.id" class="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                  <td class="px-5 py-3">
                    <p class="font-body font-medium text-gray-800">{{ s.titre }}</p>
                    <p class="text-xs font-body text-gray-900">{{ s.filiere }} · {{ s.classe }}</p>
                  </td>
                  <td class="px-5 py-3 text-center">
                    <span class="font-body text-sm text-gray-700">{{ s.nb_participants }}</span>
                  </td>
                  <td class="px-5 py-3 text-center">
                    <span
                      class="text-xs font-body px-2 py-0.5 rounded font-medium"
                      :class="{
                        'bg-green-50 text-green-700':  s.status === 'active',
                        'bg-gray-100 text-gray-600':   s.status === 'completed',
                        'bg-amber-50 text-amber-700':  s.status === 'pending',
                        'bg-blue-50 text-blue-600':    s.status === 'draft',
                      }"
                    >
                      {{ s.status === 'active' ? 'En cours' : s.status === 'completed' ? 'Terminée' : s.status === 'pending' ? 'En attente' : 'Brouillon' }}
                    </span>
                  </td>
                  <td class="px-5 py-3 text-right hidden md:table-cell">
                    <span class="text-xs font-body text-gray-900">
                      {{ new Date(s.date_debut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Actions -->
          <div class="bg-white border border-gray-200 rounded-lg p-5">
            <h2 class="text-sm font-body font-semibold text-gray-500 uppercase tracking-wide mb-4">Actions</h2>
            <div class="flex flex-wrap gap-2">
              <button
                v-if="user.role === 'professeur' && user.profil?.statut === 'pending'"
                @click="activateProf"
                class="text-sm font-body font-semibold px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
              >
                Valider le professeur
              </button>
              <button
                @click="toggleActive"
                class="text-sm font-body font-semibold px-4 py-2 rounded-lg transition-colors"
                :class="user.isActive ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-green-500 text-white hover:bg-green-600'"
              >
                {{ user.isActive ? 'Désactiver le compte' : 'Réactiver le compte' }}
              </button>
              <button
                @click="deleteUser"
                class="text-sm font-body font-semibold px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Supprimer l'utilisateur
              </button>
            </div>
          </div>

        </div>
      </div>
    </AdminLayout>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from '~~/composables/useToast'

const route  = useRoute()
const router = useRouter()
const toast  = useToast()

const loading  = ref(true)
const user     = ref(null)
const sessions = ref([])

const apiFetch = async (url, options = {}) => {
  const config = useRuntimeConfig()
  const token  = useCookie('auth_token').value
  return await $fetch(`${config.public.apiBase}${url}`, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, ...options.headers }
  })
}

const loadUser = async () => {
  loading.value = true
  try {
    const result = await apiFetch(`/admin/users/${route.params.id}`)
    if (result.success) {
      user.value     = result.data.user
      sessions.value = result.data.sessions || []
    }
  } catch {
    toast.error('Utilisateur introuvable')
  } finally {
    loading.value = false
  }
}

const toggleActive = async () => {
  try {
    await apiFetch(`/admin/users/${user.value.id}/toggle-active`, { method: 'PATCH' })
    user.value.isActive = !user.value.isActive
    toast.success(user.value.isActive ? 'Compte réactivé' : 'Compte désactivé')
  } catch {
    toast.error('Erreur')
  }
}

const activateProf = async () => {
  try {
    await apiFetch(`/admin/users/${user.value.id}/activate-prof`, { method: 'PATCH' })
    user.value.profil.statut = 'active'
    user.value.isActive      = true
    toast.success('Professeur validé')
  } catch {
    toast.error('Erreur')
  }
}

const deleteUser = async () => {
  if (!confirm(`Supprimer définitivement ${user.value.prenom} ${user.value.nom} ?`)) return
  try {
    await apiFetch(`/admin/users/${user.value.id}`, { method: 'DELETE' })
    toast.success('Utilisateur supprimé')
    router.push('/directeurs/users')
  } catch (err) {
    toast.error(err?.data?.message || 'Erreur')
  }
}

onMounted(() => loadUser())
</script>