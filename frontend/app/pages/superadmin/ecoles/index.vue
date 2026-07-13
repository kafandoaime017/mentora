<template>
  <SuperadminLayout>
    <div>
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 class="text-2xl font-extrabold text-gray-800">Écoles</h1>
          <p class="text-sm text-gray-400 mt-1">{{ ecoles.length }} école(s) enregistrée(s)</p>
        </div>
        <button @click="ouvrirModalCreer"
          class="flex items-center gap-2 px-5 py-2.5 bg-blacky text-white rounded-xl text-sm font-semibold hover:bg-blacky/80 transition"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Nouvelle école
        </button>
      </div>

      <div v-if="loading" class="flex justify-center py-16">
        <div class="animate-spin rounded-full h-8 w-8 border-2 border-blacky border-t-transparent"/>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <div v-for="ecole in ecoles" :key="ecole.id"
          class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-blacky/10 rounded-xl flex items-center justify-center shrink-0">
                <svg class="w-5 h-5 text-blacky" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
              </div>
              <div>
                <h3 class="font-bold text-gray-800 text-sm">{{ ecole.nom }}</h3>
                <p class="text-xs text-gray-400 mt-0.5">{{ ecole.ville || 'Ville non renseignée' }}</p>
              </div>
            </div>
            <span class="px-2 py-0.5 rounded-full text-xs font-semibold"
              :class="ecole.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'">
              {{ ecole.isActive ? 'Active' : 'Inactive' }}
            </span>
          </div>

          <div class="flex gap-3 text-xs text-gray-500 mb-4 bg-gray-50 rounded-xl p-3">
            <div class="flex-1 text-center">
              <p class="font-bold text-gray-800 text-base">{{ ecole.stats?.nbProfs || 0 }}</p>
              <p>Profs</p>
            </div>
            <div class="w-px bg-gray-200"/>
            <div class="flex-1 text-center">
              <p class="font-bold text-gray-800 text-base">{{ ecole.stats?.nbEtudiants || 0 }}</p>
              <p>Étudiants</p>
            </div>
            <div class="w-px bg-gray-200"/>
            <div class="flex-1 text-center">
              <p class="font-bold text-gray-800 text-base">{{ ecole.stats?.nbSessions || 0 }}</p>
              <p>Sessions</p>
            </div>
          </div>

          <div class="flex gap-2">
            <button @click="ouvrirModalModifier(ecole)"
              class="flex-1 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-200 transition"
            >Modifier</button>
            <button @click="confirmerSuppression(ecole)"
              class="flex-1 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-semibold hover:bg-red-100 transition"
            >Supprimer</button>
          </div>
        </div>

        <div v-if="ecoles.length === 0" class="col-span-full py-16 text-center text-gray-400">
          <svg class="w-14 h-14 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5"/>
          </svg>
          <p class="text-sm">Aucune école créée</p>
        </div>
      </div>

      <!-- Modal créer/modifier -->
      <div v-if="modalVisible" class="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4" @click.self="fermerModal">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-md">
          <div class="border-b border-gray-100 p-5 flex items-center justify-between">
            <h3 class="font-bold text-gray-800">{{ modeEdition ? 'Modifier l\'école' : 'Nouvelle école' }}</h3>
            <button @click="fermerModal" class="text-gray-400 hover:text-gray-600 w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
          <div class="p-5 space-y-4">
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1.5">Nom *</label>
              <input v-model="form.nom" type="text" placeholder="Ex: HEC Paris"
                class="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm focus:outline-none border border-gray-200 focus:border-blacky"/>
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-600 mb-1.5">Ville</label>
              <input v-model="form.ville" type="text" placeholder="Ex: Paris"
                class="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm focus:outline-none border border-gray-200 focus:border-blacky"/>
            </div>
            <div v-if="erreur" class="bg-red-50 text-red-600 text-xs rounded-xl px-4 py-2">{{ erreur }}</div>
            <div class="flex gap-3">
              <button @click="fermerModal" class="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold">Annuler</button>
              <button @click="sauvegarder" :disabled="enregistrement || !form.nom"
                class="flex-1 py-2.5 bg-blacky text-white rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <div v-if="enregistrement" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"/>
                <span v-else>{{ modeEdition ? 'Modifier' : 'Créer' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal suppression -->
      <div v-if="modalSuppressionVisible" class="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4" @click.self="modalSuppressionVisible = false">
        <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
          <h3 class="font-bold text-gray-800 mb-2">Supprimer l'école</h3>
          <p class="text-sm text-gray-500 mb-6">Êtes-vous sûr de vouloir supprimer <strong>{{ ecoleASupprimer?.nom }}</strong> ?</p>
          <div class="flex gap-3">
            <button @click="modalSuppressionVisible = false" class="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold">Annuler</button>
            <button @click="supprimerEcole" :disabled="enregistrement"
              class="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <div v-if="enregistrement" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"/>
              <span v-else>Supprimer</span>
            </button>
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
const { getEcoles, createEcole, updateEcole, deleteEcole } = useSuperadmin()

const loading                 = ref(true)
const ecoles                  = ref([])
const modalVisible            = ref(false)
const modalSuppressionVisible = ref(false)
const modeEdition             = ref(false)
const enregistrement          = ref(false)
const erreur                  = ref('')
const ecoleEnEdition          = ref(null)
const ecoleASupprimer         = ref(null)
const form                    = reactive({ nom: '', ville: '' })

const ouvrirModalCreer = () => { modeEdition.value = false; form.nom = ''; form.ville = ''; erreur.value = ''; modalVisible.value = true }
const ouvrirModalModifier = (ecole) => { modeEdition.value = true; ecoleEnEdition.value = ecole; form.nom = ecole.nom; form.ville = ecole.ville || ''; erreur.value = ''; modalVisible.value = true }
const fermerModal = () => { modalVisible.value = false }

const sauvegarder = async () => {
  if (!form.nom.trim()) { erreur.value = 'Le nom est requis'; return }
  enregistrement.value = true
  erreur.value = ''
  const result = modeEdition.value
    ? await updateEcole(ecoleEnEdition.value.id, { nom: form.nom, ville: form.ville })
    : await createEcole({ nom: form.nom, ville: form.ville })
  if (result.success) { toast.success(modeEdition.value ? 'École modifiée' : 'École créée'); fermerModal(); await chargerEcoles() }
  else erreur.value = result.message || 'Erreur'
  enregistrement.value = false
}

const confirmerSuppression = (ecole) => { ecoleASupprimer.value = ecole; modalSuppressionVisible.value = true }

const supprimerEcole = async () => {
  enregistrement.value = true
  const result = await deleteEcole(ecoleASupprimer.value.id)
  if (result.success) { toast.success('École supprimée'); modalSuppressionVisible.value = false; await chargerEcoles() }
  else toast.error(result.message || 'Erreur')
  enregistrement.value = false
}

const chargerEcoles = async () => {
  const result = await getEcoles()
  if (result.success) ecoles.value = result.data
}

onMounted(async () => { loading.value = true; await chargerEcoles(); loading.value = false })
</script>