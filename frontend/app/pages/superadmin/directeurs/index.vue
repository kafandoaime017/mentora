<template>
  <SuperadminLayout>
    <div>
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 class="text-2xl font-extrabold text-gray-800">Directeurs</h1>
          <p class="text-sm text-gray-400 mt-1">{{ directeurs.length }} directeur(s)</p>
        </div>
        <button @click="ouvrirModal"
          class="flex items-center gap-2 px-5 py-2.5 bg-[#0f172a] text-white rounded-xl text-sm font-semibold hover:bg-[#1e293b] transition"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Inviter un directeur
        </button>
      </div>

      <div v-if="loading" class="flex justify-center py-16">
        <div class="animate-spin rounded-full h-8 w-8 border-2 border-[#0f172a] border-t-transparent"/>
      </div>

      <div v-else>
        <!-- Desktop table -->
        <div class="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table class="w-full" v-if="directeurs.length > 0">
            <thead class="bg-gray-50 border-b border-gray-100">
              <tr>
                <th class="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Nom</th>
                <th class="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
                <th class="px-5 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase">Statut</th>
                <th class="px-5 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase">Vérifié</th>
                <th class="px-5 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-for="d in directeurs" :key="d.id" class="hover:bg-gray-50 transition">
                <td class="px-5 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-xs font-bold text-purple-600 shrink-0">
                      {{ d.prenom?.[0] }}{{ d.nom?.[0] }}
                    </div>
                    <p class="font-semibold text-gray-800 text-sm">{{ d.prenom }} {{ d.nom }}</p>
                  </div>
                </td>
                <td class="px-5 py-4 text-sm text-gray-500">{{ d.email }}</td>
                <td class="px-5 py-4 text-center">
                  <span class="px-2.5 py-1 rounded-full text-xs font-semibold"
                    :class="d.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'">
                    {{ d.isActive ? 'Actif' : 'Inactif' }}
                  </span>
                </td>
                <td class="px-5 py-4 text-center">
                  <span class="px-2.5 py-1 rounded-full text-xs font-semibold"
                    :class="d.isVerified ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'">
                    {{ d.isVerified ? 'Vérifié' : 'En attente' }}
                  </span>
                </td>
                <td class="px-5 py-4 text-center">
                  <button @click="toggleActif(d)"
                    class="px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                    :class="d.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'"
                  >
                    {{ d.isActive ? 'Désactiver' : 'Activer' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-else class="p-16 text-center text-gray-400 text-sm">Aucun directeur</div>
        </div>

        <!-- Mobile cards -->
        <div class="md:hidden space-y-3">
          <div v-for="d in directeurs" :key="d.id" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-xs font-bold text-purple-600">
                  {{ d.prenom?.[0] }}{{ d.nom?.[0] }}
                </div>
                <div>
                  <p class="font-semibold text-gray-800 text-sm">{{ d.prenom }} {{ d.nom }}</p>
                  <p class="text-xs text-gray-400">{{ d.email }}</p>
                </div>
              </div>
              <span class="px-2.5 py-1 rounded-full text-xs font-semibold"
                :class="d.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'">
                {{ d.isActive ? 'Actif' : 'Inactif' }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="px-2.5 py-1 rounded-full text-xs font-semibold"
                :class="d.isVerified ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'">
                {{ d.isVerified ? 'Vérifié' : 'En attente' }}
              </span>
              <button @click="toggleActif(d)"
                class="px-3 py-1.5 rounded-lg text-xs font-semibold"
                :class="d.isActive ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'"
              >
                {{ d.isActive ? 'Désactiver' : 'Activer' }}
              </button>
            </div>
          </div>
          <div v-if="directeurs.length === 0" class="py-16 text-center text-gray-400 text-sm">Aucun directeur</div>
        </div>
      </div>

      <!-- Modal invitation -->
      <div v-if="modalVisible" class="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4" @click.self="fermerModal">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-md">
          <div class="border-b border-gray-100 p-5 flex items-center justify-between">
            <h3 class="font-bold text-gray-800">Inviter un directeur</h3>
            <button @click="fermerModal" class="text-gray-400 hover:text-gray-600 w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
          <div class="p-5 space-y-4">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1.5">Prénom *</label>
                <input v-model="form.prenom" type="text" placeholder="Jean"
                  class="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm focus:outline-none border border-gray-200"/>
              </div>
              <div>
                <label class="block text-xs font-semibold text-gray-600 mb-1.5">Nom *</label>
                <input v-model="form.nom" type="text" placeholder="Dupont"
                  class="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm focus:outline-none border border-gray-200"/>
              </div>
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1.5">Email *</label>
              <input v-model="form.email" type="email" placeholder="directeur@ecole.com"
                class="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm focus:outline-none border border-gray-200"/>
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1.5">École *</label>
              <select v-model="form.ecoleId" class="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm focus:outline-none border border-gray-200">
                <option value="">-- Sélectionner --</option>
                <option v-for="e in ecoles" :key="e.id" :value="e.id">{{ e.nom }}</option>
              </select>
            </div>
            <div v-if="erreur" class="bg-red-50 text-red-600 text-xs rounded-xl px-4 py-2">{{ erreur }}</div>
            <div class="flex gap-3">
              <button @click="fermerModal" class="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold">Annuler</button>
              <button @click="envoyerInvitation" :disabled="enregistrement"
                class="flex-1 py-2.5 bg-[#0f172a] text-white rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <div v-if="enregistrement" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"/>
                <span v-else>Envoyer</span>
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  </SuperadminLayout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useSuperadmin } from '~~/composables/useSuperadmin'
import { useToast } from '~~/composables/useToast'
definePageMeta({ layout: false })

const toast = useToast()
const { getDirecteurs, inviterDirecteur, toggleDirecteur, getEcoles } = useSuperadmin()

const loading        = ref(true)
const directeurs     = ref([])
const ecoles         = ref([])
const modalVisible   = ref(false)
const enregistrement = ref(false)
const erreur         = ref('')
const form           = reactive({ prenom: '', nom: '', email: '', ecoleId: '' })

const ouvrirModal  = () => { Object.assign(form, { prenom: '', nom: '', email: '', ecoleId: '' }); erreur.value = ''; modalVisible.value = true }
const fermerModal  = () => { modalVisible.value = false }

const envoyerInvitation = async () => {
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

const chargerDirecteurs = async () => {
  const result = await getDirecteurs()
  if (result.success) directeurs.value = result.data
}

onMounted(async () => {
  loading.value = true
  const [resDir, resEcoles] = await Promise.all([getDirecteurs(), getEcoles()])
  if (resDir.success)    directeurs.value = resDir.data
  if (resEcoles.success) ecoles.value     = resEcoles.data
  loading.value = false
})
</script>