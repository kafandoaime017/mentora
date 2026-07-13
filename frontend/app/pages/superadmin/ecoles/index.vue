<template>
  <div class="bg-layout font-body min-h-screen">
    <SuperadminLayout>
      <div>
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 class="text-2xl font-body font-extrabold text-gray-800">Écoles</h1>
            <p class="text-sm font-body text-gray-500 mt-1">{{ ecoles.length }} école(s) enregistrée(s)</p>
          </div>
          <button @click="ouvrirModalCreer"
            class="flex items-center gap-2 px-5 py-2.5 bg-[#024864] text-white font-body rounded-xl text-sm font-semibold hover:bg-blacky/80 transition"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Nouvelle école
          </button>
        </div>

        <div v-if="loading" class="bg-white shadow rounded-lg p-12 text-center">
          <div class="inline-block animate-spin rounded-full h-6 w-6 border-2 border-blacky border-t-transparent"/>
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <div v-for="ecole in ecoles" :key="ecole.id"
            class="group bg-white rounded-xl shadow-[1px_1px_7px_1px_rgba(0,0,0,0.08)] hover:shadow-[1px_1px_10px_2px_rgba(0,0,0,0.12)] transition-all overflow-hidden flex flex-col"
          >
            <!-- Header -->
            <div class="px-5 pt-5 pb-4 border-b border-gray-100">
              <div class="flex items-start justify-between mb-3">
                <div class="flex items-center gap-3 min-w-0">
                  <div class="w-11 h-11 bg-blacky/10 rounded-xl flex items-center justify-center shrink-0">
                    <svg class="w-5 h-5 text-blacky" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                    </svg>
                  </div>
                  <div class="min-w-0">
                    <h3 class="font-body font-bold text-gray-800 text-sm truncate">{{ ecole.nom }}</h3>
                    <p class="text-xs font-body text-gray-400 mt-0.5 truncate">{{ ecole.ville || 'Ville non renseignée' }}</p>
                  </div>
                </div>
                <div class="relative shrink-0">
                  <button @click.stop="menuOuvert = menuOuvert === ecole.id ? null : ecole.id" class="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 transition">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01"/></svg>
                  </button>
                  <div v-if="menuOuvert === ecole.id" class="absolute right-0 mt-1 w-44 bg-white rounded-lg shadow-[1px_1px_7px_1px_rgba(0,0,0,0.12)] py-1.5 z-20">
                    <button @click="ouvrirModalModifier(ecole)" class="w-full text-left px-4 py-2 text-xs font-body font-medium text-gray-600 hover:bg-gray-50">Modifier</button>
                    <button @click="confirmerSuppression(ecole)" class="w-full text-left px-4 py-2 text-xs font-body font-medium text-red-500 hover:bg-red-50">Supprimer</button>
                  </div>
                </div>
              </div>

              <div class="flex items-center gap-2 flex-wrap">
                <span class="px-2.5 py-1 rounded-full text-xs font-body font-semibold" :class="planStyle(ecole.plan)">{{ ecole.plan }}</span>
                <span class="px-2.5 py-1 rounded-full text-xs font-body font-semibold" :class="ecole.isActive ? 'bg-green-600 text-white' : 'bg-red-600 text-white'">
                  {{ ecole.isActive ? 'Active' : 'Inactive' }}
                </span>
              </div>
            </div>

            <!-- Directeur -->
            <div class="px-5 py-3 border-b border-gray-100">
              <div v-if="ecole.directeur" class="flex items-center gap-2 text-xs font-body">
                <div class="w-6 h-6 rounded-full bg-secondary/10 flex items-center justify-center font-bold text-secondary shrink-0">{{ ecole.directeur.prenom?.[0] }}</div>
                <span class="text-gray-600 truncate">{{ ecole.directeur.prenom }} {{ ecole.directeur.nom }}</span>
                <span v-if="!ecole.directeur.isVerified" class="text-yellow-600 font-semibold shrink-0">· en attente</span>
              </div>
              <p v-else class="text-xs font-body text-gray-300">Aucun directeur rattaché</p>
            </div>

            <!-- Usage vs limites -->
            <div class="px-5 py-4 space-y-3 flex-1">
              <div>
                <div class="flex items-center justify-between text-[11px] font-body mb-1">
                  <span class="text-gray-400">Étudiants</span>
                  <span class="font-semibold text-gray-600">{{ ecole.stats?.nbEtudiants || 0 }} / {{ ecole.limites?.maxEtudiants === -1 ? '∞' : ecole.limites?.maxEtudiants }}</span>
                </div>
                <div class="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div class="h-full bg-primary rounded-full" :style="{ width: usagePct(ecole.stats?.nbEtudiants, ecole.limites?.maxEtudiants) + '%' }"/>
                </div>
              </div>
              <div>
                <div class="flex items-center justify-between text-[11px] font-body mb-1">
                  <span class="text-gray-400">Professeurs</span>
                  <span class="font-semibold text-gray-600">{{ ecole.stats?.nbProfs || 0 }} / {{ ecole.limites?.maxProfs === -1 ? '∞' : ecole.limites?.maxProfs }}</span>
                </div>
                <div class="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div class="h-full bg-secondary rounded-full" :style="{ width: usagePct(ecole.stats?.nbProfs, ecole.limites?.maxProfs) + '%' }"/>
                </div>
              </div>
              <div class="flex items-center justify-between text-[11px] font-body pt-1">
                <span class="text-gray-400">Sessions</span>
                <span class="font-semibold text-gray-600">{{ ecole.stats?.nbSessions || 0 }}</span>
              </div>
            </div>

            <!-- Footer action -->
            <div class="px-5 pb-5">
              <nuxt-link :to="`/superadmin/ecoles/${ecole.id}`"
                class="flex items-center justify-center gap-1.5 w-full py-2.5 bg-blacky/5 group-hover:bg-blacky group-hover:text-white text-blacky rounded-xl text-xs font-body font-semibold transition"
              >
                Voir les détails
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
              </nuxt-link>
            </div>
          </div>

          <div v-if="ecoles.length === 0" class="col-span-full py-16 text-center text-gray-400">
            <svg class="w-14 h-14 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5"/>
            </svg>
            <p class="text-sm font-body">Aucune école créée</p>
          </div>
        </div>

        <!-- Modal créer/modifier -->
        <div v-if="modalVisible" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" @click.self="fermerModal">
          <div class="bg-white rounded-xl w-full max-w-md p-6">
            <h3 class="font-extrabold text-gray-900 text-center text-xl font-body mb-4">{{ modeEdition ? 'Modifier l\'école' : 'Nouvelle école' }}</h3>
            <div class="space-y-3">
              <div>
                <label class="block font-body text-xs font-semibold text-gray-600 mb-1">Nom *</label>
                <input v-model="form.nom" type="text" placeholder="Ex: HEC Paris"
                  class="w-full px-3 py-2.5 bg-input rounded-xl text-sm font-body focus:outline-none"/>
              </div>
              <div>
                <label class="block font-body text-xs font-semibold text-gray-600 mb-1">Ville</label>
                <input v-model="form.ville" type="text" placeholder="Ex: Paris"
                  class="w-full px-3 py-2.5 bg-input rounded-xl text-sm font-body focus:outline-none"/>
              </div>
              <div v-if="erreur" class="bg-red-50 text-red-600 text-xs font-body rounded-xl px-4 py-2">{{ erreur }}</div>
            </div>
            <div class="flex gap-3 mt-5">
              <button @click="fermerModal" class="flex-1 font-body py-2.5 bg-gray-200 text-gray-600 rounded-xl text-sm font-semibold">Annuler</button>
              <button @click="sauvegarder" :disabled="enregistrement || !form.nom"
                class="flex-1 font-body py-2.5 bg-[#024864] hover:bg-blacky/80 text-white rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <div v-if="enregistrement" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"/>
                <span v-else>{{ modeEdition ? 'Modifier' : 'Créer' }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Modal suppression -->
        <div v-if="modalSuppressionVisible" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" @click.self="modalSuppressionVisible = false">
          <div class="bg-white rounded-xl w-full max-w-sm p-6">
            <h3 class="font-extrabold text-gray-900 text-center text-xl font-body mb-2">Supprimer l'école</h3>
            <p class="text-sm font-body text-gray-500 text-center mb-6">Êtes-vous sûr de vouloir supprimer <strong>{{ ecoleASupprimer?.nom }}</strong> ?</p>
            <div class="flex gap-3">
              <button @click="modalSuppressionVisible = false" class="flex-1 font-body py-2.5 bg-gray-200 text-gray-600 rounded-xl text-sm font-semibold">Annuler</button>
              <button @click="supprimerEcole" :disabled="enregistrement"
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
import { ref, reactive, onMounted, onUnmounted } from 'vue'
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
const menuOuvert              = ref(null)
const form                    = reactive({ nom: '', ville: '' })

const planStyle = (plan) => ({
  gratuit: 'bg-gray-200 text-gray-600',
  starter: 'bg-blacky/10 text-blacky',
  pro:     'bg-secondary/10 text-secondary'
}[plan] || 'bg-gray-200 text-gray-600')

const usagePct = (val, max) => {
  val = val || 0
  if (max === -1 || max === undefined) return 8
  if (max === 0) return 0
  return Math.min(100, Math.round((val / max) * 100))
}

const fermerMenu = () => { menuOuvert.value = null }

const ouvrirModalCreer = () => { modeEdition.value = false; form.nom = ''; form.ville = ''; erreur.value = ''; modalVisible.value = true }
const ouvrirModalModifier = (ecole) => { fermerMenu(); modeEdition.value = true; ecoleEnEdition.value = ecole; form.nom = ecole.nom; form.ville = ecole.ville || ''; erreur.value = ''; modalVisible.value = true }
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

const confirmerSuppression = (ecole) => { fermerMenu(); ecoleASupprimer.value = ecole; modalSuppressionVisible.value = true }

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

onMounted(async () => {
  loading.value = true
  await chargerEcoles()
  loading.value = false
  document.addEventListener('click', fermerMenu)
})

onUnmounted(() => { document.removeEventListener('click', fermerMenu) })
</script>
