<template>
  <div class="bg-layout font-body min-h-screen">
    <AdminLayout>
      <div class="max-w-8xl mx-auto">

        <!-- En-tête -->
        <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h1 class="text-2xl font-extrabold font-body text-black">Filières & Classes</h1>
          <span class="text-sm font-body text-black">{{ filieres.length }} filière(s) · {{ classes.length }} classe(s)</span>
        </div>

        <!-- Filières -->
        <div class="mb-6">
          <div class="flex items-center justify-between mb-3">
            <p class="text-xs font-body font-bold text-black uppercase tracking-wide">Filières</p>
            <button
              @click="showAddFiliere = true"
              class="flex items-center gap-1.5 text-xs font-body font-semibold px-3 py-1.5 rounded-lg bg-blacky text-white hover:bg-[#024864] transition-colors"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
              </svg>
              Nouvelle filière
            </button>
          </div>

          <div v-if="loading" class="flex gap-2">
            <div class="h-10 w-40 bg-white rounded-lg animate-pulse"/>
            <div class="h-10 w-40 bg-white rounded-lg animate-pulse"/>
          </div>

          <div v-else-if="filieres.length === 0" class="bg-white rounded-sm border border-gray-200 p-6 text-center">
            <p class="text-sm font-body text-black">Aucune filière pour le moment.</p>
          </div>

          <div v-else class="flex flex-wrap gap-2">
            <div
              v-for="f in filieres" :key="f.id"
              class="flex items-center gap-2 bg-white border border-gray-200 rounded-lg pl-3 pr-1.5 py-1.5"
            >
              <span
                class="w-2 h-2 rounded-full shrink-0"
                :class="f.isActive ? 'bg-green-500' : 'bg-gray-300'"
                :title="f.isActive ? 'Active' : 'Inactive'"
              />
              <span class="text-sm font-body font-semibold text-black">{{ f.nom }}</span>
              <span class="text-xs font-body text-black/50">({{ classesDe(f.id).length }})</span>

              <button @click="openAddClasse(f)" title="Ajouter une classe" class="w-6 h-6 rounded-md bg-secondary/10 text-secondary hover:bg-secondary/20 flex items-center justify-center transition-colors">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
              </button>
              <button @click="openRename('filiere', f)" title="Renommer" class="w-6 h-6 rounded-md bg-gray-100 text-black hover:bg-gray-200 flex items-center justify-center transition-colors">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
              </button>
              <button @click="toggleFiliereActive(f)" :title="f.isActive ? 'Désactiver' : 'Activer'" class="w-6 h-6 rounded-md bg-gray-100 text-black hover:bg-gray-200 flex items-center justify-center transition-colors">
                <svg v-if="f.isActive" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636a9 9 0 11-12.728 0M12 3v9"/></svg>
                <svg v-else class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
              </button>
              <button @click="deleteFiliere(f)" title="Supprimer" class="w-6 h-6 rounded-md bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Filtres classes -->
        <div class="flex flex-wrap gap-3 mb-4">
          <select
            v-model="filiereFilter"
            class="px-3 py-2 bg-gray-300/80 placeholder:text-black placeholder:font-bold rounded-lg text-sm font-body focus:outline-none"
          >
            <option value="">Toutes les filières</option>
            <option v-for="f in filieres" :key="f.id" :value="f.id">{{ f.nom }}</option>
          </select>

          <div class="relative flex-1 min-w-[200px]">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Rechercher une classe..."
              class="w-full pl-9 pr-4 py-2 bg-gray-300/80 placeholder:text-black placeholder:font-bold rounded-lg text-sm font-body focus:outline-none"
            />
          </div>
        </div>

        <!-- Tableau classes -->
        <div class="bg-white rounded-sm border border-gray-200 overflow-hidden">
          <div v-if="loading" class="p-12 text-center">
            <div class="animate-spin rounded-full h-6 w-6 border-2 border-blacky border-t-transparent mx-auto"/>
          </div>

          <div v-else-if="filteredClasses.length === 0" class="p-12 text-center">
            <svg class="w-12 h-12 text-black mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
            </svg>
            <p class="text-black text-sm font-body">Aucune classe trouvée</p>
          </div>

          <table v-else class="w-full">
            <thead class="bg-blacky border-b border-gray-100">
              <tr>
                <th class="px-4 py-3 uppercase font-body text-left text-xs font-bold text-white">Classe</th>
                <th class="px-4 py-3 uppercase font-body text-left text-xs font-bold text-white hidden md:table-cell">Filière</th>
                <th class="px-4 py-3 uppercase font-body text-center text-xs font-bold text-white hidden md:table-cell">Étudiants</th>
                <th class="px-4 py-3 uppercase font-body text-left text-xs font-bold text-white hidden lg:table-cell">Code d'inscription</th>
                <th class="px-4 py-3 uppercase font-body text-center text-xs font-bold text-white">Statut</th>
                <th class="px-4 py-3 uppercase font-body text-center text-xs font-bold text-white">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-for="c in filteredClasses" :key="c.id" class="hover:bg-gray-50 border border-gray-200 transition-colors">

                <!-- Classe -->
                <td class="px-4 py-3">
                  <p class="text-sm font-body font-semibold text-black">{{ c.nom }}</p>
                </td>

                <!-- Filière -->
                <td class="px-4 py-3 hidden md:table-cell border border-gray-200">
                  <span class="inline-block bg-secondary/10 text-secondary text-xs font-body font-semibold px-2 py-0.5 rounded-full">
                    {{ c.filiere || '—' }}
                  </span>
                </td>

                <!-- Étudiants -->
                <td class="px-4 py-3 text-center hidden md:table-cell border border-gray-200">
                  <span class="text-sm font-body font-bold text-black">{{ c.nbEtudiants }}</span>
                </td>

                <!-- Code -->
                <td class="px-4 py-3 hidden lg:table-cell border border-gray-200">
                  <button
                    v-if="c.codeInscription"
                    @click="copierCode(c.codeInscription)"
                    title="Copier le code"
                    class="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-black bg-gray-100 px-2 py-1 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    {{ c.codeInscription }}
                    <svg class="w-3 h-3 text-black/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                  </button>
                  <span v-else class="text-xs font-body text-black/40 italic">Aucun code</span>
                </td>

                <!-- Statut -->
                <td class="px-4 py-3 text-center border border-gray-200">
                  <span
                    class="inline-flex items-center gap-1 text-xs font-body font-semibold px-2 py-0.5 rounded-full"
                    :class="c.isActive ? 'bg-green-500 text-white' : 'bg-gray-300 text-black'"
                  >
                    {{ c.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>

                <!-- Actions -->
                <td class="px-4 py-3 border border-gray-200">
                  <div class="flex items-center justify-center gap-1.5 flex-wrap">
                    <button
                      @click="genererCode(c)"
                      :disabled="generatingCodeId === c.id"
                      class="inline-flex items-center gap-1 text-xs font-body font-semibold px-2.5 py-1.5 rounded-lg bg-secondary/90 text-white hover:bg-secondary transition-colors disabled:opacity-50"
                    >
                      <div v-if="generatingCodeId === c.id" class="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"/>
                      <svg v-else class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                      {{ c.codeInscription ? 'Régénérer' : 'Générer' }} le code
                    </button>
                    <button
                      @click="openRename('classe', c)"
                      class="inline-flex items-center gap-1 text-xs font-body font-semibold px-2.5 py-1.5 rounded-lg bg-gray-100 text-black hover:bg-gray-200 transition-colors"
                    >
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                      Renommer
                    </button>
                    <button
                      @click="toggleClasseActive(c)"
                      class="inline-flex items-center gap-1 text-xs font-body font-semibold px-2.5 py-1.5 rounded-lg bg-blacky/80 text-white hover:bg-blacky transition-colors"
                    >
                      <svg v-if="c.isActive" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636a9 9 0 11-12.728 0M12 3v9"/></svg>
                      <svg v-else class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                      {{ c.isActive ? 'Désactiver' : 'Activer' }}
                    </button>
                    <button
                      @click="deleteClasse(c)"
                      class="inline-flex items-center gap-1 text-xs font-body font-semibold px-2.5 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                    >
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      Supprimer
                    </button>
                  </div>
                </td>

              </tr>
            </tbody>
          </table>
        </div>

      </div>

      <!-- Modal ajouter filière -->
      <div v-if="showAddFiliere" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="showAddFiliere = false">
        <div class="bg-white rounded-lg w-full max-w-md p-6">
          <h3 class="font-body font-bold text-black mb-4 text-lg">Nouvelle filière</h3>
          <input
            v-model="newFiliereName"
            type="text"
            placeholder="Ex: Informatique"
            class="w-full px-4 py-3 bg-input rounded-lg font-body text-sm focus:outline-none mb-4"
            @keyup.enter="addFiliere"
            autofocus
          />
          <div class="flex gap-3">
            <button @click="showAddFiliere = false" class="flex-1 py-2.5 bg-gray-100 text-black rounded-lg text-sm font-body font-semibold">Annuler</button>
            <button @click="addFiliere" :disabled="!newFiliereName.trim()" class="flex-1 py-2.5 bg-blacky text-white rounded-lg text-sm font-body font-semibold disabled:opacity-50">Créer</button>
          </div>
        </div>
      </div>

      <!-- Modal ajouter classe -->
      <div v-if="showAddClasse" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="showAddClasse = false">
        <div class="bg-white rounded-lg w-full max-w-md p-6">
          <h3 class="font-body font-bold text-black mb-1 text-lg">Nouvelle classe</h3>
          <p class="text-xs text-black font-body mb-4">
            Filière : <span class="font-semibold text-secondary">{{ selectedFiliere?.nom }}</span>
          </p>
          <input
            v-model="newClassName"
            type="text"
            placeholder="Ex: 1ère année"
            class="w-full px-4 py-3 bg-input rounded-lg font-body text-sm focus:outline-none mb-4"
            @keyup.enter="addClasse"
            autofocus
          />
          <div class="flex gap-3">
            <button @click="showAddClasse = false" class="flex-1 py-2.5 bg-gray-100 text-black rounded-lg text-sm font-body font-semibold">Annuler</button>
            <button @click="addClasse" :disabled="!newClassName.trim()" class="flex-1 py-2.5 bg-blacky text-white rounded-lg text-sm font-body font-semibold disabled:opacity-50">Créer</button>
          </div>
        </div>
      </div>

      <!-- Modal renommer -->
      <div v-if="showRenameModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="showRenameModal = false">
        <div class="bg-white rounded-lg w-full max-w-md p-6">
          <h3 class="font-body font-bold text-black mb-4 text-lg">
            Renommer {{ renameType === 'filiere' ? 'la filière' : 'la classe' }}
          </h3>
          <input
            v-model="renameValue"
            type="text"
            class="w-full px-4 py-3 bg-input rounded-lg font-body text-sm focus:outline-none mb-4"
            @keyup.enter="confirmRename"
            autofocus
          />
          <div class="flex gap-3">
            <button @click="showRenameModal = false" class="flex-1 py-2.5 bg-gray-100 text-black rounded-lg text-sm font-body font-semibold">Annuler</button>
            <button @click="confirmRename" :disabled="!renameValue.trim() || renaming" class="flex-1 py-2.5 bg-blacky text-white rounded-lg text-sm font-body font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
              <div v-if="renaming" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"/>
              <span v-else>Renommer</span>
            </button>
          </div>
        </div>
      </div>

    </AdminLayout>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from '~~/composables/useToast'
import { useConfirm } from '~~/composables/useConfirm'
import { useAdmin } from '~~/composables/useAdmin'

const toast   = useToast()
const { confirm } = useConfirm()
const {
  getFilieres, getClasses,
  createFiliere: createFiliereApi, updateFiliere: updateFiliereApi, deleteFiliere: deleteFiliereApi,
  createClasse: createClasseApi, updateClasse: updateClasseApi, deleteClasse: deleteClasseApi,
  generateClasseCode: generateClasseCodeApi
} = useAdmin()

const loading      = ref(true)
const filieres      = ref([])
const classes       = ref([])
const searchQuery   = ref('')
const filiereFilter = ref('')

const showAddFiliere  = ref(false)
const showAddClasse   = ref(false)
const newFiliereName  = ref('')
const newClassName    = ref('')
const selectedFiliere = ref(null)

const showRenameModal = ref(false)
const renameType      = ref(null) // 'filiere' | 'classe'
const renameTarget    = ref(null)
const renameValue     = ref('')
const renaming        = ref(false)

const generatingCodeId = ref(null)

const classesDe = (filiereId) => classes.value.filter(c => c.filiereId === filiereId)

const filteredClasses = computed(() => {
  let result = classes.value
  if (filiereFilter.value) result = result.filter(c => c.filiereId === filiereFilter.value)
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(c =>
      c.nom.toLowerCase().includes(q) ||
      c.filiere?.toLowerCase().includes(q) ||
      c.codeInscription?.toLowerCase().includes(q)
    )
  }
  return result
})

const loadData = async () => {
  loading.value = true
  try {
    const [filRes, clsRes] = await Promise.all([getFilieres(), getClasses()])
    if (filRes.success) filieres.value = filRes.data
    if (clsRes.success) classes.value = clsRes.data
  } finally {
    loading.value = false
  }
}

// ─── Filières ─────────────────────────────────────────────────────────────────
const addFiliere = async () => {
  if (!newFiliereName.value.trim()) return
  try {
    const result = await createFiliereApi({ nom: newFiliereName.value })
    if (result.success) {
      toast.success('Filière créée')
      showAddFiliere.value = false
      newFiliereName.value = ''
      await loadData()
    } else {
      toast.error(result.message || 'Erreur')
    }
  } catch { toast.error('Erreur') }
}

const toggleFiliereActive = async (filiere) => {
  try {
    const result = await updateFiliereApi(filiere.id, { isActive: !filiere.isActive })
    if (result.success) {
      toast.success(filiere.isActive ? 'Filière désactivée' : 'Filière activée')
      await loadData()
    } else {
      toast.error(result.message || 'Erreur')
    }
  } catch (err) { toast.error(err?.data?.message || 'Erreur') }
}

const deleteFiliere = async (filiere) => {
  const nbClasses = classesDe(filiere.id).length
  const ok = await confirm({
    title: 'Supprimer la filière',
    message: nbClasses > 0
      ? `Impossible de supprimer "${filiere.nom}" tant que ${nbClasses} classe(s) y sont rattachée(s).`
      : `Supprimer "${filiere.nom}" ? Cette action est irréversible.`,
    confirmLabel: 'Supprimer',
    danger: true
  })
  if (!ok) return
  try {
    const result = await deleteFiliereApi(filiere.id)
    if (result.success) {
      toast.success('Filière supprimée')
      await loadData()
    } else {
      toast.error(result.message || 'Erreur')
    }
  } catch (err) { toast.error(err?.data?.message || 'Erreur') }
}

// ─── Classes ──────────────────────────────────────────────────────────────────
const openAddClasse = (filiere) => {
  selectedFiliere.value = filiere
  showAddClasse.value   = true
}

const addClasse = async () => {
  if (!newClassName.value.trim()) return
  try {
    const result = await createClasseApi({ nom: newClassName.value, filiereId: selectedFiliere.value.id })
    if (result.success) {
      toast.success('Classe créée')
      showAddClasse.value = false
      newClassName.value  = ''
      await loadData()
    } else {
      toast.error(result.message || 'Erreur')
    }
  } catch { toast.error('Erreur') }
}

const toggleClasseActive = async (classe) => {
  try {
    const result = await updateClasseApi(classe.id, { isActive: !classe.isActive })
    if (result.success) {
      toast.success(classe.isActive ? 'Classe désactivée' : 'Classe activée')
      await loadData()
    } else {
      toast.error(result.message || 'Erreur')
    }
  } catch (err) { toast.error(err?.data?.message || 'Erreur') }
}

const genererCode = async (classe) => {
  generatingCodeId.value = classe.id
  try {
    const result = await generateClasseCodeApi(classe.id)
    if (result.success) {
      classe.codeInscription = result.data.code
      toast.success('Code généré')
    } else {
      toast.error(result.message || 'Erreur')
    }
  } catch (err) {
    toast.error(err?.data?.message || 'Erreur')
  } finally {
    generatingCodeId.value = null
  }
}

const copierCode = async (code) => {
  try {
    await navigator.clipboard.writeText(code)
    toast.success('Code copié')
  } catch {
    toast.error('Impossible de copier le code')
  }
}

const deleteClasse = async (classe) => {
  const ok = await confirm({
    title: 'Supprimer la classe',
    message: classe.nbEtudiants > 0
      ? `Impossible de supprimer "${classe.nom}" tant que ${classe.nbEtudiants} étudiant(s) y sont rattaché(s).`
      : `Supprimer "${classe.nom}" ? Cette action est irréversible.`,
    confirmLabel: 'Supprimer',
    danger: true
  })
  if (!ok) return
  try {
    const result = await deleteClasseApi(classe.id)
    if (result.success) {
      toast.success('Classe supprimée')
      await loadData()
    } else {
      toast.error(result.message || 'Erreur')
    }
  } catch (err) { toast.error(err?.data?.message || 'Erreur') }
}

// ─── Renommer (filière ou classe) ─────────────────────────────────────────────
const openRename = (type, item) => {
  renameType.value   = type
  renameTarget.value = item
  renameValue.value  = item.nom
  showRenameModal.value = true
}

const confirmRename = async () => {
  if (!renameValue.value.trim() || renaming.value) return
  renaming.value = true
  try {
    const result = renameType.value === 'filiere'
      ? await updateFiliereApi(renameTarget.value.id, { nom: renameValue.value.trim() })
      : await updateClasseApi(renameTarget.value.id, { nom: renameValue.value.trim() })

    if (result.success) {
      toast.success(renameType.value === 'filiere' ? 'Filière renommée' : 'Classe renommée')
      showRenameModal.value = false
      await loadData()
    } else {
      toast.error(result.message || 'Erreur')
    }
  } catch (err) {
    toast.error(err?.data?.message || 'Erreur')
  } finally {
    renaming.value = false
  }
}

onMounted(() => loadData())
</script>
