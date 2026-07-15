<template>
  <div class="bg-[#f5f0e8] font-body min-h-screen">
    <TeacherLayout>
      <div class="max-w-5xl mx-auto py-3">

        <!-- En-tête -->
        <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h2 class="font-body text-2xl font-extrabold text-[#1e3a2f]">Banque de questions</h2>
          <button
            @click="ouvrirCreation"
            class="px-4 py-2.5 bg-[#4a7c5e] text-white text-sm font-body font-semibold rounded-lg hover:bg-[#1e3a2f] transition-colors"
          >
            + Nouvelle question
          </button>
        </div>

        <p class="text-sm text-[#9b9589] mb-4">
          Réutilisez vos questions d'une session à l'autre. Filtrez par thème ou difficulté pour les retrouver rapidement.
        </p>

        <!-- Filtres -->
        <div class="flex flex-wrap gap-3 mb-5">
          <input
            v-model="filtres.theme"
            @change="charger"
            type="text"
            placeholder="Filtrer par thème..."
            class="px-3 py-2 bg-white border border-[#e2ddd4] placeholder:text-[#9b9589] rounded-lg text-sm font-body focus:outline-none"
          />
          <select
            v-model="filtres.difficulte"
            @change="charger"
            class="px-3 py-2 bg-white border border-[#e2ddd4] rounded-lg text-sm font-body focus:outline-none"
          >
            <option value="">Toutes difficultés</option>
            <option value="facile">Facile</option>
            <option value="moyen">Moyen</option>
            <option value="difficile">Difficile</option>
          </select>
          <select
            v-model="filtres.type"
            @change="charger"
            class="px-3 py-2 bg-white border border-[#e2ddd4] rounded-lg text-sm font-body focus:outline-none"
          >
            <option value="">Tous types</option>
            <option value="qcm">QCM</option>
            <option value="qcm_multiple">QCM multiple</option>
            <option value="vrai_faux">Vrai / Faux</option>
            <option value="texte_libre">Texte libre</option>
            <option value="appariement">Appariement</option>
            <option value="fichier">Fichier</option>
          </select>
        </div>

        <!-- Liste -->
        <div v-if="loading" class="bg-white rounded-lg p-12 text-center">
          <div class="inline-block animate-spin rounded-full h-6 w-6 border-2 border-[#4a7c5e] border-t-transparent" />
        </div>

        <div v-else-if="questions.length === 0" class="bg-white rounded-lg p-12 text-center text-[#9b9589]">
          Aucune question dans la banque pour le moment.
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="q in questions"
            :key="q.id"
            class="bg-white rounded-lg border border-[#e2ddd4] p-4 flex items-start justify-between gap-4"
          >
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2 mb-1.5">
                <span class="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-body">{{ getTypeLabel(q.type) }}</span>
                <span
                  class="text-[10px] px-2 py-0.5 rounded-full font-body"
                  :class="{
                    'bg-green-100 text-green-700': q.difficulte === 'facile',
                    'bg-yellow-100 text-yellow-700': q.difficulte === 'moyen',
                    'bg-red-100 text-red-700': q.difficulte === 'difficile'
                  }"
                >{{ q.difficulte }}</span>
                <span v-if="q.theme" class="text-[10px] bg-[#4a7c5e]/10 text-[#1e3a2f] px-2 py-0.5 rounded-full font-body">{{ q.theme }}</span>
                <span class="text-[10px] text-[#9b9589]">{{ q.points }} pt{{ q.points > 1 ? 's' : '' }}</span>
              </div>
              <p class="text-sm font-body text-[#1e3a2f] truncate">{{ q.texte }}</p>
            </div>
            <div class="flex items-center gap-1.5 shrink-0">
              <button @click="ouvrirEdition(q)" class="px-2.5 py-1.5 rounded-lg text-xs font-body font-semibold bg-gray-100 text-[#1e3a2f] hover:bg-gray-200 transition-colors">
                Modifier
              </button>
              <button @click="supprimer(q)" class="px-2.5 py-1.5 rounded-lg text-xs font-body font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal création/édition -->
      <div v-if="showModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" @click.self="showModal = false">
        <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div class="border-b border-[#e2ddd4] p-4 bg-[#f5f0e8]/30 flex justify-between items-center">
            <h3 class="font-body text-lg font-bold text-[#1e3a2f]">{{ edition.id ? 'Modifier la question' : 'Nouvelle question' }}</h3>
            <button @click="showModal = false" class="text-[#9b9589] hover:text-[#1e3a2f]">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <div class="p-4 md:p-6 space-y-4">
            <div>
              <label class="block text-sm font-semibold text-[#1e3a2f] mb-2">Texte de la question</label>
              <textarea v-model="edition.texte" rows="2" class="w-full font-body px-4 py-3 text-sm text-gray-800 bg-input rounded-xl focus:outline-none" />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold text-[#1e3a2f] mb-2">Type</label>
                <select v-model="edition.type" @change="onTypeChange" class="w-full font-body px-4 py-3 text-sm text-gray-800 bg-input rounded-xl focus:outline-none">
                  <option value="qcm">QCM (une seule réponse)</option>
                  <option value="qcm_multiple">QCM multiple</option>
                  <option value="vrai_faux">Vrai / Faux</option>
                  <option value="texte_libre">Texte libre (correction manuelle)</option>
                  <option value="appariement">Appariement</option>
                  <option value="fichier">Upload de fichier</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-semibold text-[#1e3a2f] mb-2">Points</label>
                <input v-model.number="edition.points" type="number" min="1" class="w-full font-body px-4 py-3 text-sm text-gray-800 bg-input rounded-xl focus:outline-none" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold text-[#1e3a2f] mb-2">Thème (facultatif)</label>
                <input v-model="edition.theme" type="text" placeholder="Ex: Grammaire" class="w-full font-body px-4 py-3 text-sm text-gray-800 bg-input rounded-xl focus:outline-none" />
              </div>
              <div>
                <label class="block text-sm font-semibold text-[#1e3a2f] mb-2">Difficulté</label>
                <select v-model="edition.difficulte" class="w-full font-body px-4 py-3 text-sm text-gray-800 bg-input rounded-xl focus:outline-none">
                  <option value="facile">Facile</option>
                  <option value="moyen">Moyen</option>
                  <option value="difficile">Difficile</option>
                </select>
              </div>
            </div>

            <!-- Options QCM -->
            <div v-if="!['vrai_faux', 'texte_libre', 'appariement', 'fichier'].includes(edition.type)">
              <label class="block text-sm font-semibold text-[#1e3a2f] mb-2">Options</label>
              <div class="space-y-2">
                <div v-for="(opt, optIndex) in edition.options" :key="optIndex" class="flex items-center gap-2">
                  <input
                    v-if="edition.type === 'qcm_multiple'"
                    type="checkbox" :value="optIndex" v-model="edition.reponses_correctes"
                    class="w-4 h-4 accent-[#4a7c5e]"
                  />
                  <input
                    v-else type="radio" :name="'edit-q'"
                    :checked="edition.reponses_correctes[0] === optIndex"
                    @change="edition.reponses_correctes = [optIndex]"
                    class="w-4 h-4 accent-[#4a7c5e]"
                  />
                  <input v-model="edition.options[optIndex]" type="text" class="flex-1 font-body px-4 py-2.5 text-sm text-gray-800 bg-input rounded-xl focus:outline-none" :placeholder="`Option ${optIndex + 1}`" />
                  <button type="button" @click="edition.options.splice(optIndex, 1)" class="text-red-400 hover:text-red-600">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                </div>
                <button type="button" @click="edition.options.push('')" class="text-sm text-[#4a7c5e] hover:text-[#1e3a2f]">+ Ajouter une option</button>
              </div>
            </div>

            <!-- Vrai/Faux -->
            <div v-if="edition.type === 'vrai_faux'">
              <label class="block text-sm font-semibold text-[#1e3a2f] mb-2">Réponse correcte</label>
              <div class="flex gap-4">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" :checked="edition.reponses_correctes[0] === 0" @change="edition.reponses_correctes = [0]" class="w-4 h-4 accent-[#4a7c5e]" />
                  <span class="text-sm">Vrai</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="radio" :checked="edition.reponses_correctes[0] === 1" @change="edition.reponses_correctes = [1]" class="w-4 h-4 accent-[#4a7c5e]" />
                  <span class="text-sm">Faux</span>
                </label>
              </div>
            </div>

            <!-- Texte libre -->
            <div v-if="edition.type === 'texte_libre'">
              <label class="block text-sm font-semibold text-[#1e3a2f] mb-2">Réponse indicative (facultatif)</label>
              <textarea v-model="edition.reponse_indicative" rows="2" class="w-full font-body px-4 py-3 text-sm text-gray-800 bg-input rounded-xl focus:outline-none" />
            </div>

            <!-- Appariement -->
            <div v-if="edition.type === 'appariement'">
              <label class="block text-sm font-semibold text-[#1e3a2f] mb-2">Paires à apparier</label>
              <div class="space-y-2">
                <div v-for="(_, pIndex) in edition.appariement_gauche" :key="pIndex" class="flex items-center gap-2">
                  <input v-model="edition.appariement_gauche[pIndex]" type="text" class="flex-1 font-body px-4 py-2.5 text-sm text-gray-800 bg-input rounded-xl focus:outline-none" :placeholder="`Terme ${pIndex + 1}`" />
                  <span class="text-[#9b9589]">→</span>
                  <input v-model="edition.appariement_droite[pIndex]" type="text" class="flex-1 font-body px-4 py-2.5 text-sm text-gray-800 bg-input rounded-xl focus:outline-none" :placeholder="`Correspond à ${pIndex + 1}`" />
                  <button type="button" @click="edition.appariement_gauche.splice(pIndex, 1); edition.appariement_droite.splice(pIndex, 1)" class="text-red-400 hover:text-red-600">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                </div>
                <button type="button" @click="edition.appariement_gauche.push(''); edition.appariement_droite.push('')" class="text-sm text-[#4a7c5e] hover:text-[#1e3a2f]">+ Ajouter une paire</button>
              </div>
            </div>

            <!-- Fichier -->
            <div v-if="edition.type === 'fichier'">
              <p class="text-xs text-[#9b9589] bg-[#f5f0e8]/50 rounded-lg p-3">
                L'étudiant devra téléverser un fichier. Cette question sera à corriger manuellement.
              </p>
            </div>
          </div>

          <div class="border-t border-[#e2ddd4] p-4 flex justify-end gap-3">
            <button @click="showModal = false" class="px-4 py-2.5 bg-gray-200 text-[#1e3a2f] text-sm font-body font-semibold rounded-lg hover:bg-gray-300">Annuler</button>
            <button @click="enregistrer" :disabled="saving" class="px-4 py-2.5 bg-[#4a7c5e] text-white text-sm font-body font-semibold rounded-lg hover:bg-[#1e3a2f] disabled:opacity-50">
              {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
          </div>
        </div>
      </div>
    </TeacherLayout>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useTeacher } from '~~/composables/useTeacher'
import { useToast } from '~~/composables/useToast'

const { getBanqueQuestions, createBanqueQuestion, updateBanqueQuestion, deleteBanqueQuestion } = useTeacher()
const toast = useToast()

const loading = ref(true)
const saving  = ref(false)
const questions = ref([])
const filtres = ref({ theme: '', difficulte: '', type: '' })
const showModal = ref(false)

const videEdition = () => ({
  id: null,
  texte: '',
  type: 'qcm',
  points: 1,
  options: ['', ''],
  reponses_correctes: [],
  reponse_indicative: '',
  appariement_gauche: ['', ''],
  appariement_droite: ['', ''],
  theme: '',
  difficulte: 'moyen'
})

const edition = ref(videEdition())

const getTypeLabel = (type) => ({
  qcm: 'QCM', qcm_multiple: 'QCM multiple', vrai_faux: 'Vrai/Faux',
  texte_libre: 'Texte libre', appariement: 'Appariement', fichier: 'Fichier'
})[type] || type

const charger = async () => {
  loading.value = true
  const res = await getBanqueQuestions(filtres.value)
  if (res.success) questions.value = res.data
  loading.value = false
}

const onTypeChange = () => {
  const q = edition.value
  q.reponses_correctes = []
  if (q.type === 'vrai_faux') {
    q.options = ['Vrai', 'Faux']
  } else if (q.type === 'appariement') {
    if (q.appariement_gauche.length < 2) q.appariement_gauche = ['', '']
    if (q.appariement_droite.length < 2) q.appariement_droite = ['', '']
  } else if (q.type !== 'texte_libre' && q.type !== 'fichier' && q.options.length < 2) {
    q.options = ['', '']
  }
}

const ouvrirCreation = () => {
  edition.value = videEdition()
  showModal.value = true
}

const ouvrirEdition = (q) => {
  edition.value = {
    id: q.id,
    texte: q.texte,
    type: q.type,
    points: q.points,
    options: q.type === 'appariement' ? ['', ''] : (Array.isArray(q.options) ? q.options : ['', '']),
    reponses_correctes: q.reponses_correctes || [],
    reponse_indicative: q.reponse_indicative || '',
    appariement_gauche: q.type === 'appariement' ? (q.options?.gauche || ['', '']) : ['', ''],
    appariement_droite: q.type === 'appariement' ? (q.options?.droite || ['', '']) : ['', ''],
    theme: q.theme || '',
    difficulte: q.difficulte || 'moyen'
  }
  showModal.value = true
}

const enregistrer = async () => {
  const q = edition.value
  if (!q.texte.trim()) { toast.error('Veuillez saisir le texte de la question'); return }

  let payload = { ...q }
  if (q.type === 'appariement') {
    if (q.appariement_gauche.length < 2 || q.appariement_gauche.some(v => !v.trim()) || q.appariement_droite.some(v => !v.trim())) {
      toast.error('Veuillez remplir toutes les paires à apparier (au moins 2)')
      return
    }
    payload.options = { gauche: q.appariement_gauche, droite: q.appariement_droite }
    payload.reponses_correctes = q.appariement_gauche.map((_, idx) => idx)
  } else if (q.type === 'texte_libre' || q.type === 'fichier') {
    payload.options = []
    payload.reponses_correctes = []
  } else {
    if (q.options.some(opt => !opt.trim())) { toast.error('Veuillez remplir toutes les options'); return }
    if (q.reponses_correctes.length === 0) { toast.error('Veuillez sélectionner la réponse correcte'); return }
  }

  saving.value = true
  const result = q.id
    ? await updateBanqueQuestion(q.id, payload)
    : await createBanqueQuestion(payload)

  if (result.success) {
    toast.success(q.id ? 'Question modifiée' : 'Question ajoutée à la banque')
    showModal.value = false
    await charger()
  } else {
    toast.error(result.message || 'Erreur lors de l\'enregistrement')
  }
  saving.value = false
}

const supprimer = async (q) => {
  if (!confirm(`Supprimer cette question de la banque ?`)) return
  const result = await deleteBanqueQuestion(q.id)
  if (result.success) {
    toast.success('Question supprimée')
    await charger()
  } else {
    toast.error(result.message || 'Erreur lors de la suppression')
  }
}

onMounted(charger)
</script>
