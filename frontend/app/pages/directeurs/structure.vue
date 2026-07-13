<template>
  <div class="bg-layout font-body min-h-screen">
    <AdminLayout>
      <div class="max-w-4xl mx-auto">

        <!-- En-tête -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <h1 class="text-2xl font-body font-extrabold text-black">Filières & Classes</h1>
          <div class="flex items-center gap-3">
            <div class="relative">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Rechercher..."
                class="w-56 pl-9 pr-4 py-2 rounded-lg  bg-gray-300/80 placeholder:text-black placeholder:font-bold text-sm font-body focus:outline-none focus:border-blacky"
              />
            </div>
            <button
              @click="showAddFiliere = true"
              class="flex items-center gap-2 bg-blacky text-white px-4 py-2 rounded-lg text-sm font-body font-semibold hover:bg-[#024864] transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              Ajouter une filière
            </button>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="flex justify-center py-16">
          <div class="animate-spin rounded-full h-8 w-8 border-2 border-blacky border-t-transparent"/>
        </div>

        <!-- Vide -->
        <div v-else-if="filteredFilieres.length === 0" class="bg-white rounded-lg p-12 text-center text-black">
          <svg class="w-14 h-14 mx-auto mb-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
          </svg>
          <p class="font-body text-sm">Aucune filière trouvée</p>
        </div>

        <!-- Arbre -->
        <div v-else class="flex gap-0 items-start">

          <!-- Nœud École -->
          <div class="flex flex-col items-center shrink-0" style="padding-top: 16px;">
            <div class="bg-primary text-white px-5 py-4 rounded-2xl font-body font-bold text-sm shadow-md w-[120px] text-center">
              <svg class="w-5 h-5 mx-auto mb-1.5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
              </svg>
                {{ ecole?.nom || 'Écolre' }}

            </div>
          </div>

          <!-- Ligne horizontale École → filières -->
          <div class="shrink-0 w-8 border-t-2 border-gray-300" style="margin-top: 38px;"/>

          <!-- Colonne de droite : filières + classes -->
          <div class="flex-1 flex flex-col">

            <!-- Ligne verticale qui longe toutes les filières -->
            <div class="relative">

              <!-- Barre verticale gauche -->
              <div
                class="absolute left-0 top-0 border-l-2 border-gray-300"
                :style="{ height: verticalBarHeight }"
                ref="verticalBar"
              />

              <!-- Filières visibles -->
              <div
                v-for="(filiere, fIdx) in visibleFilieres"
                :key="filiere.id"
                class="relative"
                :style="{ paddingBottom: fIdx < visibleFilieres.length - 1 ? '24px' : '0' }"
              >
                <!-- Connecteur horizontal filière -->
                <div class="flex items-center gap-0">
                  <div class="w-8 shrink-0 border-t-2 border-gray-300" style="margin-top: 0; align-self: flex-start; margin-top: 20px;"/>

                  <div class="flex-1">

                    <!-- Nœud filière -->
                    <div class="flex items-center gap-2 mb-2">
                      <div class="bg-secondary text-white pl-3 pr-4 py-2 rounded-2xl font-body font-bold text-sm shadow flex items-center gap-2">
                        <svg class="w-3.5 h-3.5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
                        </svg>
                        {{ filiere.nom }}
                      </div>
                      <!-- Actions filière -->
                      <button
                        @click="openAddClasse(filiere)"
                        class="w-7 h-7 rounded-full bg-blacky/10 text-blacky hover:bg-blacky/20 flex items-center justify-center transition-colors border border-blacky/20"
                        title="Ajouter une classe"
                      >
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
                        </svg>
                      </button>
                      <button
                        @click="deleteFiliere(filiere)"
                        class="w-7 h-7 rounded-full bg-red-50 text-red-400 hover:bg-red-100 flex items-center justify-center transition-colors"
                        title="Supprimer la filière"
                      >
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                      </button>
                    </div>

                    <!-- Aucune classe -->
                    <div v-if="!filiere.classes || filiere.classes.length === 0" class="ml-8 mb-1">
                      <p class="text-xs font-body text-black italic">Aucune classe</p>
                    </div>

                    <!-- Classes -->
                    <div v-else class="relative ml-8">
                      <!-- Barre verticale classes -->
                      <div
                        class="absolute left-0 border-l-2 border-gray-300"
                        :style="{
                          top: '20px',
                          height: `calc(100% - 20px - 20px)`
                        }"
                      />

                      <div
                        v-for="(classe, cIdx) in filiere.classes"
                        :key="classe.id"
                        class="flex items-center gap-3 relative"
                        :style="{ marginBottom: cIdx < filiere.classes.length - 1 ? '12px' : '0' }"
                      >
                        <!-- Connecteur horizontal classe (style ├─) -->
                        <div class="shrink-0 flex items-center">
                          <!-- Petit tiret horizontal -->
                          <div class="w-6 border-t-2 border-gray-300"/>
                        </div>

                        <!-- Badge classe -->
                        <div class="bg-gray-300 text-black px-4 py-2 rounded-2xl font-body font-semibold text-sm  w-[130px]">
                          <p>{{ classe.nom }}</p>
                        </div>

                        <!-- Code -->
                      

                        <!-- Actions classe -->
                        <div class="flex items-center gap-1">
                         
                          
                          <button
                            @click="deleteClasse(classe)"
                            class="w-7 h-7 rounded-full bg-red-200 text-red-600 hover:bg-red-100 flex items-center justify-center transition-colors"
                            title="Supprimer"
                          >
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              <!-- Bouton Afficher plus -->
              <div v-if="filteredFilieres.length > visibleCount" class="flex justify-center mt-6 pl-8">
                <button
                  @click="showMore"
                  class="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-black rounded-lg text-sm font-body font-semibold hover:bg-gray-50 hover:border-blacky/30 hover:text-blacky transition-all"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                  Afficher plus
                  <span class="bg-gray-100 text-black text-xs px-2 py-0.5 rounded-full">
                    {{ filteredFilieres.length - visibleCount }} restante(s)
                  </span>
                </button>
              </div>

              <!-- Bouton Réduire -->
              <div v-if="visibleCount > INITIAL_COUNT && filteredFilieres.length > INITIAL_COUNT" class="flex justify-center mt-2 pl-8">
                <button
                  @click="visibleCount = INITIAL_COUNT"
                  class="text-xs font-body text-black hover:text-black transition-colors"
                >
                  Réduire
                </button>
              </div>

            </div>
          </div>
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

    </AdminLayout>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from '~~/composables/useToast'
import { useAdmin } from '~~/composables/useAdmin'

const toast           = useToast()
const { getFilieres, getClasses, getEcole, createFiliere, createClasse, deleteFiliere: deleteFilieresApi, deleteClasse: deleteClasseApi } = useAdmin()

const loading         = ref(true)
const filieres        = ref([])
const ecole           = ref(null)
const searchQuery     = ref('')
const showAddFiliere  = ref(false)
const showAddClasse   = ref(false)
const newFiliereName  = ref('')
const newClassName    = ref('')
const selectedFiliere = ref(null)

const INITIAL_COUNT = 5
const visibleCount  = ref(INITIAL_COUNT)

const filteredFilieres = computed(() => {
  if (!searchQuery.value.trim()) return filieres.value
  const q = searchQuery.value.toLowerCase()
  return filieres.value.filter(f =>
    f.nom.toLowerCase().includes(q) ||
    f.classes?.some(c => c.nom.toLowerCase().includes(q))
  )
})

const visibleFilieres = computed(() =>
  filteredFilieres.value.slice(0, visibleCount.value)
)

const verticalBarHeight = computed(() => {
  if (visibleFilieres.value.length === 0) return '0px'
  return `calc(100% - 20px)`
})

const showMore = () => {
  visibleCount.value = Math.min(visibleCount.value + 5, filteredFilieres.value.length)
}

const loadFilieres = async () => {
  loading.value = true
  try {
    const [filRes, clsRes, ecoleRes] = await Promise.all([
      getFilieres(),
      getClasses(),
      getEcole()
    ])
    if (filRes.success) {
      filieres.value = filRes.data.map(f => ({
        ...f,
        classes: clsRes.data?.filter(c => c.filiereId === f.id) || []
      }))
    }
    if (ecoleRes.success) {
      ecole.value = ecoleRes.data
    }
  } finally {
    loading.value = false
  }
}

const addFiliere = async () => {
  if (!newFiliereName.value.trim()) return
  try {
    const result = await createFiliere({ nom: newFiliereName.value })
    if (result.success) {
      toast.success('Filière créée')
      showAddFiliere.value = false
      newFiliereName.value = ''
      await loadFilieres()
    } else {
      toast.error(result.message || 'Erreur')
    }
  } catch { toast.error('Erreur') }
}

const openAddClasse = (filiere) => {
  selectedFiliere.value = filiere
  showAddClasse.value   = true
}

const addClasse = async () => {
  if (!newClassName.value.trim()) return
  try {
    const result = await createClasse({ nom: newClassName.value, filiereId: selectedFiliere.value.id })
    if (result.success) {
      toast.success('Classe créée')
      showAddClasse.value = false
      newClassName.value  = ''
      await loadFilieres()
    } else {
      toast.error(result.message || 'Erreur')
    }
  } catch { toast.error('Erreur') }
}

const deleteFiliere = async (filiere) => {
  if (!confirm(`Supprimer la filière "${filiere.nom}" ?`)) return
  try {
    const result = await deleteFilieresApi(filiere.id)
    if (result.success) {
      toast.success('Filière supprimée')
      await loadFilieres()
    } else {
      toast.error(result.message || 'Erreur')
    }
  } catch (err) { toast.error(err?.data?.message || 'Erreur') }
}

const deleteClasse = async (classe) => {
  if (!confirm(`Supprimer la classe "${classe.nom}" ?`)) return
  try {
    const result = await deleteClasseApi(classe.id)
    if (result.success) {
      toast.success('Classe supprimée')
      await loadFilieres()
    } else {
      toast.error(result.message || 'Erreur')
    }
  } catch (err) { toast.error(err?.data?.message || 'Erreur') }
}

onMounted(() => loadFilieres())
</script>