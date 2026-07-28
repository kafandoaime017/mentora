<template>
  <div class="bg-layout font-body min-h-screen">
    <AdminLayout>
      <div class="max-w-4xl mx-auto">

        <!-- En-tête -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 class="text-2xl font-body font-extrabold text-black">Annonces & sondages</h1>
            <p class="text-sm font-body text-black/60 mt-1">Publiez une information ou un sondage visible par vos étudiants et/ou professeurs.</p>
          </div>
          <button
            @click="ouvrirCreation"
            class="flex items-center gap-2 bg-blacky text-white px-4 py-2 rounded-lg text-sm font-body font-semibold hover:bg-[#024864] transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Nouvelle annonce
          </button>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="flex justify-center py-16">
          <div class="animate-spin rounded-full h-8 w-8 border-2 border-blacky border-t-transparent"/>
        </div>

        <!-- Vide -->
        <div v-else-if="annonces.length === 0" class="bg-white rounded-lg p-12 text-center text-black">
          <svg class="w-14 h-14 mx-auto mb-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"/>
          </svg>
          <p class="font-body text-sm">Aucune annonce publiée pour le moment</p>
        </div>

        <!-- Liste -->
        <div v-else class="space-y-3">
          <div v-for="a in annonces" :key="a.id" class="bg-white rounded-lg shadow-[1px_1px_3px_1px_rgba(0,0,0,0.08)] p-4">
            <div class="flex items-start justify-between gap-3 mb-2">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-[10px] font-body font-bold uppercase tracking-wide px-2 py-0.5 rounded-full" :class="a.type === 'sondage' ? 'bg-secondary text-white' : 'bg-blacky text-white'">
                  {{ a.type === 'sondage' ? 'Sondage' : 'Annonce' }}
                </span>
                <span v-if="a.type === 'sondage' && a.obligatoire" class="text-[10px] font-body font-semibold text-red-500">Obligatoire</span>
                <span class="text-[10px] font-body px-2 py-0.5 rounded-full" :class="a.actif ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'">
                  {{ a.actif ? 'Active' : 'Désactivée' }}
                </span>
              </div>
              <div class="flex items-center gap-1 shrink-0">
                <button @click="voirResultats(a)" class="w-7 h-7 rounded-full bg-blacky/10 text-blacky hover:bg-blacky/20 flex items-center justify-center transition-colors" title="Voir les résultats">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                </button>
                <button @click="toggleActif(a)" class="w-7 h-7 rounded-full bg-yellow-50 text-yellow-600 hover:bg-yellow-100 flex items-center justify-center transition-colors" :title="a.actif ? 'Désactiver' : 'Réactiver'">
                  <svg v-if="a.actif" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"/></svg>
                  <svg v-else class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                </button>
                <button @click="supprimer(a)" class="w-7 h-7 rounded-full bg-red-50 text-red-400 hover:bg-red-100 flex items-center justify-center transition-colors" title="Supprimer">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
              </div>
            </div>

            <h3 class="font-body font-bold text-black text-sm mb-1">{{ a.titre }}</h3>
            <p class="font-body text-sm text-black/70 mb-2 line-clamp-2">{{ a.contenu }}</p>

            <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-body text-black/50">
              <span>Cible : {{ cibleLabel(a) }}</span>
              <span>Audience : {{ a.audience }}</span>
              <span>Vus : {{ a.nb_vus }}/{{ a.audience }}</span>
              <span v-if="a.type === 'sondage'">Réponses : {{ a.nb_reponses }}/{{ a.audience }}</span>
              <span>{{ formatDate(a.created_at) }}</span>
            </div>
          </div>
        </div>

      </div>

      <!-- Modal création -->
      <Teleport to="body">
        <Transition name="annonce-backdrop">
          <div v-if="showCreate" class="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/50" @click.self="showCreate = false">
            <Transition name="annonce-pop" appear>
              <div v-if="showCreate" class="bg-white rounded-lg border border-gray-200 shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto flex flex-col">
                <div class="flex items-center justify-between px-5 py-4 border-b border-gray-200 shrink-0">
                  <h3 class="font-body font-extrabold text-black text-base">Nouvelle annonce</h3>
                  <button @click="showCreate = false" class="text-black/40 hover:text-black transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                </div>

                <div class="p-5 space-y-4 overflow-y-auto">
                  <div>
                    <label class="block text-xs font-body font-semibold text-black/60 mb-1">Type</label>
                    <div class="flex gap-2">
                      <button @click="form.type = 'info'" class="flex-1 py-2 rounded-lg text-sm font-body font-semibold transition-colors" :class="form.type === 'info' ? 'bg-blacky text-white' : 'bg-gray-100 text-black'">Annonce</button>
                      <button @click="form.type = 'sondage'" class="flex-1 py-2 rounded-lg text-sm font-body font-semibold transition-colors" :class="form.type === 'sondage' ? 'bg-secondary text-white' : 'bg-gray-100 text-black'">Sondage</button>
                    </div>
                  </div>

                  <div>
                    <label class="block text-xs font-body font-semibold text-black/60 mb-1">Titre</label>
                    <input v-model="form.titre" type="text" placeholder="Ex: Réunion parents-professeurs" class="w-full px-4 py-2.5 bg-input rounded-lg font-body text-sm focus:outline-none" />
                  </div>

                  <div>
                    <label class="block text-xs font-body font-semibold text-black/60 mb-1">{{ form.type === 'sondage' ? 'Question' : 'Contenu' }}</label>
                    <textarea v-model="form.contenu" rows="3" placeholder="Détails..." class="w-full px-4 py-2.5 bg-input rounded-lg font-body text-sm focus:outline-none"/>
                  </div>

                  <div v-if="form.type === 'sondage'" class="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <label class="block text-xs font-body font-semibold text-black/60 mb-2">Options</label>
                    <div class="space-y-2">
                      <div v-for="(opt, idx) in form.options" :key="idx" class="flex items-center gap-2">
                        <input v-model="form.options[idx]" type="text" :placeholder="`Option ${idx + 1}`" class="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg font-body text-sm focus:outline-none" />
                        <button v-if="form.options.length > 2" @click="form.options.splice(idx, 1)" class="w-8 h-8 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 flex items-center justify-center shrink-0 transition-colors">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                      </div>
                    </div>
                    <button @click="form.options.push('')" class="mt-2 text-xs font-body font-semibold text-blacky hover:underline">+ Ajouter une option</button>

                    <label class="flex items-center gap-2 mt-3 cursor-pointer">
                      <input v-model="form.obligatoire" type="checkbox" class="w-4 h-4" />
                      <span class="text-sm font-body text-black">Réponse obligatoire (bloque l'accès tant que non répondu)</span>
                    </label>
                  </div>

                  <div>
                    <label class="block text-xs font-body font-semibold text-black/60 mb-1">Destinataires</label>
                    <select v-model="form.cible_type" class="w-full px-4 py-2.5 bg-input rounded-lg font-body text-sm focus:outline-none">
                      <option value="tous">Tout le monde</option>
                      <option value="professeurs">Les professeurs</option>
                      <option value="filiere">Les étudiants d'une filière</option>
                      <option value="classe">Les étudiants d'une classe</option>
                    </select>
                  </div>

                  <div v-if="form.cible_type === 'filiere'">
                    <label class="block text-xs font-body font-semibold text-black/60 mb-1">Filière</label>
                    <select v-model="form.cible_filiere_id" class="w-full px-4 py-2.5 bg-input rounded-lg font-body text-sm focus:outline-none">
                      <option value="">-- Sélectionner --</option>
                      <option v-for="f in filieres" :key="f.id" :value="f.id">{{ f.nom }}</option>
                    </select>
                  </div>

                  <div v-if="form.cible_type === 'classe'">
                    <label class="block text-xs font-body font-semibold text-black/60 mb-1">Classe</label>
                    <select v-model="form.cible_classe_id" class="w-full px-4 py-2.5 bg-input rounded-lg font-body text-sm focus:outline-none">
                      <option value="">-- Sélectionner --</option>
                      <option v-for="c in classes" :key="c.id" :value="c.id">{{ c.nom }} ({{ c.filiere }})</option>
                    </select>
                  </div>
                </div>

                <div class="flex items-center justify-end gap-2 px-5 py-3 bg-gray-50 border-t border-gray-200 shrink-0">
                  <button @click="showCreate = false" :disabled="creerEnCours" class="px-4 py-2 text-sm font-body font-semibold rounded-lg bg-white border border-gray-200 text-black hover:bg-gray-100 transition-colors disabled:opacity-50">
                    Annuler
                  </button>
                  <button @click="creer" :disabled="creerEnCours" class="px-4 py-2 text-sm font-body font-semibold rounded-lg bg-blacky text-white hover:bg-[#024864] transition-colors disabled:opacity-50 flex items-center gap-2">
                    <div v-if="creerEnCours" class="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent"/>
                    {{ creerEnCours ? 'Publication...' : 'Publier' }}
                  </button>
                </div>
              </div>
            </Transition>
          </div>
        </Transition>
      </Teleport>

      <!-- Modal résultats -->
      <Teleport to="body">
        <Transition name="annonce-backdrop">
          <div v-if="resultats" class="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/50" @click.self="resultats = null">
            <Transition name="annonce-pop" appear>
              <div v-if="resultats" class="bg-white rounded-lg border border-gray-200 shadow-xl w-full max-w-md overflow-hidden">
                <div class="flex items-center justify-between px-5 py-4 border-b border-gray-200">
                  <h3 class="font-body font-extrabold text-black text-base">{{ resultats.titre }}</h3>
                  <button @click="resultats = null" class="text-black/40 hover:text-black transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                </div>

                <div class="p-5">
                  <p class="text-xs font-body text-black/50 mb-4">
                    Audience : {{ resultats.audience }} · Vus : {{ resultats.nb_vus }} · Réponses : {{ resultats.nb_reponses }}
                  </p>

                  <div v-if="resultats.resultats_options" class="space-y-3">
                    <div v-for="(opt, idx) in resultats.resultats_options" :key="idx">
                      <div class="flex justify-between text-xs font-body text-black mb-1">
                        <span>{{ opt.texte }}</span>
                        <span class="font-semibold">{{ opt.nb }}</span>
                      </div>
                      <div class="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div class="h-full bg-secondary rounded-full transition-all" :style="{ width: pourcentage(opt.nb) + '%' }"/>
                      </div>
                    </div>
                  </div>
                  <p v-else class="text-sm font-body text-black/60">Ceci est une annonce simple (pas de sondage).</p>
                </div>

                <div class="flex items-center justify-end px-5 py-3 bg-gray-50 border-t border-gray-200">
                  <button @click="resultats = null" class="px-4 py-2 text-sm font-body font-semibold rounded-lg bg-white border border-gray-200 text-black hover:bg-gray-100 transition-colors">
                    Fermer
                  </button>
                </div>
              </div>
            </Transition>
          </div>
        </Transition>
      </Teleport>

    </AdminLayout>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useToast } from '~~/composables/useToast'
import { useAdmin } from '~~/composables/useAdmin'
import { useConfirm } from '~~/composables/useConfirm'

const toast = useToast()
const { confirm } = useConfirm()
const {
  getAnnonces, createAnnonce, getAnnonceResultats, toggleAnnonceActif, deleteAnnonce,
  getFilieres, getClasses
} = useAdmin()

const loading       = ref(true)
const annonces      = ref([])
const filieres      = ref([])
const classes       = ref([])
const showCreate    = ref(false)
const creerEnCours  = ref(false)
const resultats     = ref(null)

const formVide = () => ({
  type: 'info',
  titre: '',
  contenu: '',
  options: ['', ''],
  obligatoire: false,
  cible_type: 'tous',
  cible_filiere_id: '',
  cible_classe_id: ''
})
const form = ref(formVide())

const cibleLabel = (a) => {
  if (a.cible_type === 'tous') return 'Tout le monde'
  if (a.cible_type === 'professeurs') return 'Professeurs'
  if (a.cible_type === 'filiere') return `Filière : ${a.cible_filiere?.nom || '—'}`
  if (a.cible_type === 'classe') return `Classe : ${a.cible_classe?.nom || '—'}`
  return a.cible_type
}

const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : ''

const pourcentage = (nb) => {
  if (!resultats.value?.nb_reponses) return 0
  return Math.round((nb / resultats.value.nb_reponses) * 100)
}

const charger = async () => {
  loading.value = true
  try {
    const [aRes, fRes, cRes] = await Promise.all([getAnnonces(), getFilieres(), getClasses()])
    if (aRes.success) annonces.value = aRes.data || []
    if (fRes.success) filieres.value = fRes.data || []
    if (cRes.success) classes.value = cRes.data || []
  } finally {
    loading.value = false
  }
}

const ouvrirCreation = () => {
  form.value = formVide()
  showCreate.value = true
}

const creer = async () => {
  if (!form.value.titre.trim() || !form.value.contenu.trim()) { toast.error('Titre et contenu requis'); return }
  if (form.value.type === 'sondage' && form.value.options.filter(o => o.trim()).length < 2) {
    toast.error('Un sondage nécessite au moins 2 options'); return
  }
  if (form.value.cible_type === 'filiere' && !form.value.cible_filiere_id) { toast.error('Sélectionnez une filière'); return }
  if (form.value.cible_type === 'classe' && !form.value.cible_classe_id) { toast.error('Sélectionnez une classe'); return }

  creerEnCours.value = true
  const result = await createAnnonce({
    titre: form.value.titre,
    contenu: form.value.contenu,
    type: form.value.type,
    obligatoire: form.value.obligatoire,
    options: form.value.type === 'sondage' ? form.value.options : undefined,
    cible_type: form.value.cible_type,
    cible_filiere_id: form.value.cible_type === 'filiere' ? form.value.cible_filiere_id : undefined,
    cible_classe_id: form.value.cible_type === 'classe' ? form.value.cible_classe_id : undefined
  })
  creerEnCours.value = false

  if (result.success) {
    toast.success('Publié !')
    showCreate.value = false
    await charger()
  } else {
    toast.error(result.message || 'Erreur')
  }
}

const voirResultats = async (a) => {
  const result = await getAnnonceResultats(a.id)
  if (result.success) resultats.value = result.data
  else toast.error(result.message || 'Erreur')
}

const toggleActif = async (a) => {
  const result = await toggleAnnonceActif(a.id)
  if (result.success) {
    a.actif = result.data.actif
    toast.success(a.actif ? 'Annonce réactivée' : 'Annonce désactivée')
  } else {
    toast.error(result.message || 'Erreur')
  }
}

const supprimer = async (a) => {
  const ok = await confirm({
    title: 'Supprimer l\'annonce',
    message: `Supprimer "${a.titre}" ? Cette action est irréversible.`,
    confirmLabel: 'Supprimer',
    danger: true
  })
  if (!ok) return

  const result = await deleteAnnonce(a.id)
  if (result.success) {
    toast.success('Supprimée')
    await charger()
  } else {
    toast.error(result.message || 'Erreur')
  }
}

onMounted(() => charger())
</script>

<style scoped>
.annonce-backdrop-enter-active,
.annonce-backdrop-leave-active {
  transition: opacity 0.2s ease;
}
.annonce-backdrop-enter-from,
.annonce-backdrop-leave-to {
  opacity: 0;
}

.annonce-pop-enter-active {
  transition: opacity 0.22s ease, transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.annonce-pop-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.annonce-pop-enter-from {
  opacity: 0;
  transform: scale(0.92) translateY(12px);
}
.annonce-pop-leave-to {
  opacity: 0;
  transform: scale(0.96) translateY(4px);
}
</style>
