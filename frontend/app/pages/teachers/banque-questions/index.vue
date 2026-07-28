<template>
  <div class="bg-[#f5f0e8] font-body min-h-screen">
    <TeacherLayout>
      <div class="max-w-5xl mx-auto py-3">

        <!-- En-tête -->
        <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h2 class="font-body text-2xl font-extrabold text-[#1e3a2f]">Banque de questions</h2>
          <div class="flex items-center gap-2">
            <label class="flex items-center gap-2 bg-white border border-[#e2ddd4] text-[#1e3a2f] px-4 py-2.5 rounded-lg text-sm font-body font-semibold hover:bg-gray-50 transition-colors cursor-pointer">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
              </svg>
              Importer CSV/Excel
              <input type="file" accept=".csv,.xlsx,.xls" class="hidden" @change="handleFileImport" />
            </label>
            <button
              @click="ouvrirCreation"
              class="px-4 py-2.5 bg-[#4a7c5e] text-white text-sm font-body font-semibold rounded-lg hover:bg-[#1e3a2f] transition-colors"
            >
              + Nouvelle question
            </button>
          </div>
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

      <!-- Modal import CSV/Excel -->
      <div v-if="showImportModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="showImportModal = false">
        <div class="bg-white rounded-lg w-full max-w-3xl p-6 max-h-[85vh] flex flex-col">
          <div class="flex items-center justify-between mb-1">
            <h3 class="font-extrabold text-[#1e3a2f] text-xl font-body">Importer des questions</h3>
            <button @click="showImportModal = false" class="text-[#9b9589] hover:text-[#1e3a2f]">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <p class="text-xs text-[#9b9589] mb-4">
            <span class="text-green-600 font-semibold">{{ importRows.filter(r => !r.error).length }} valide(s)</span>
            <span v-if="importRows.filter(r => r.error).length > 0" class="text-red-500 font-semibold ml-2">{{ importRows.filter(r => r.error).length }} erreur(s)</span>
          </p>

          <div class="overflow-auto flex-1 border border-[#e2ddd4] rounded-lg mb-4">
            <table class="w-full text-xs">
              <thead class="bg-[#f5f0e8] sticky top-0 border-b border-[#e2ddd4]">
                <tr>
                  <th class="px-3 py-2 text-left font-semibold text-[#1e3a2f]">#</th>
                  <th class="px-3 py-2 text-left font-semibold text-[#1e3a2f]">Texte</th>
                  <th class="px-3 py-2 text-left font-semibold text-[#1e3a2f]">Type</th>
                  <th class="px-3 py-2 text-left font-semibold text-[#1e3a2f]">Points</th>
                  <th class="px-3 py-2 text-left font-semibold text-[#1e3a2f]">Thème</th>
                  <th class="px-3 py-2 text-center font-semibold text-[#1e3a2f]">Statut</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="(row, idx) in importRows" :key="idx" :class="row.error ? 'bg-red-50' : 'hover:bg-[#f5f0e8]/40'">
                  <td class="px-3 py-2 text-[#1e3a2f]">{{ idx + 1 }}</td>
                  <td class="px-3 py-2 text-[#1e3a2f] max-w-xs truncate">{{ row.texte }}</td>
                  <td class="px-3 py-2">
                    <span class="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-gray-200 text-gray-700">{{ getTypeLabel(row.type) }}</span>
                  </td>
                  <td class="px-3 py-2 text-[#1e3a2f]">{{ row.points }}</td>
                  <td class="px-3 py-2 text-[#1e3a2f]">{{ row.theme || '—' }}</td>
                  <td class="px-3 py-2 text-center">
                    <span v-if="row.error" class="text-red-500 text-[10px] font-semibold" :title="row.error">❌ {{ row.error }}</span>
                    <span v-else class="text-green-600 text-[10px] font-semibold">✓ OK</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="bg-[#f5f0e8]/50 rounded-lg px-4 py-3 mb-4 shrink-0">
            <p class="text-xs font-semibold text-[#1e3a2f] mb-1">Format attendu (types appariement/fichier non pris en charge par l'import) :</p>
            <code class="text-[10px] text-[#1e3a2f] block">texte, type (qcm/qcm_multiple/vrai_faux/texte_libre), points, option1, option2, option3, option4, reponses_correctes (index séparés par point-virgule, ex: 0 ou 0;2 — ou "vrai"/"faux" pour ce type), theme, difficulte</code>
            <button @click="downloadTemplate" class="mt-2 text-xs text-[#4a7c5e] hover:underline">↓ Télécharger le modèle CSV</button>
          </div>

          <div class="flex gap-3 shrink-0">
            <button @click="showImportModal = false" class="flex-1 py-2.5 bg-gray-200 hover:bg-gray-300 text-[#1e3a2f] rounded-lg text-sm font-body font-semibold">Annuler</button>
            <button
              @click="sendBulkImport"
              :disabled="sendingBulk || importRows.filter(r => !r.error).length === 0"
              class="flex-1 py-2.5 bg-[#4a7c5e] hover:bg-[#1e3a2f] text-white rounded-lg text-sm font-body font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <div v-if="sendingBulk" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"/>
              {{ sendingBulk ? 'Import...' : `Importer ${importRows.filter(r => !r.error).length} question(s)` }}
            </button>
          </div>
        </div>
      </div>
    </TeacherLayout>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as XLSX from 'xlsx'
import { useTeacher } from '~~/composables/useTeacher'
import { useToast } from '~~/composables/useToast'

const { getBanqueQuestions, createBanqueQuestion, createBanqueQuestionsBulk, updateBanqueQuestion, deleteBanqueQuestion } = useTeacher()
const toast = useToast()

const loading = ref(true)
const saving  = ref(false)
const questions = ref([])
const filtres = ref({ theme: '', difficulte: '', type: '' })
const showModal = ref(false)

// Import CSV/Excel
const showImportModal = ref(false)
const importRows       = ref([])
const sendingBulk      = ref(false)

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

// ─── Import CSV/Excel ─────────────────────────────────────────────────────────

const TYPES_IMPORTABLES = ['qcm', 'qcm_multiple', 'vrai_faux', 'texte_libre']

const handleFileImport = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = async (e) => {
    try {
      let rows = []
      if (file.name.endsWith('.csv')) {
        const text  = e.target.result
        const lines = text.split('\n').filter(l => l.trim())
        if (lines.length < 2) { toast.error('Fichier vide'); return }
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''))
        rows = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim().replace(/['"]/g, ''))
          const obj = {}
          headers.forEach((h, i) => obj[h] = values[i] || '')
          return obj
        })
      } else {
        const data     = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheet    = workbook.Sheets[workbook.SheetNames[0]]
        const raw      = XLSX.utils.sheet_to_json(sheet, { defval: '' })
        rows = raw.map(row => {
          const n = {}
          Object.keys(row).forEach(k => n[k.toLowerCase().trim()] = String(row[k]).trim())
          return n
        })
      }

      const validated = rows
        .filter(row => Object.values(row).some(v => v))
        .map(row => {
          const texte      = row.texte || ''
          const type       = (row.type || '').toLowerCase().trim()
          const points     = parseInt(row.points) || 1
          const theme      = row.theme || ''
          const difficulte = (row.difficulte || row['difficulté'] || 'moyen').toLowerCase().trim()
          const options    = [row.option1, row.option2, row.option3, row.option4].filter(o => o && o.trim())
          const repBrut    = (row.reponses_correctes || '').toLowerCase().trim()

          let error = ''
          let reponses_correctes = []
          let optionsFinales = options

          if (!texte) error = 'Texte manquant'
          else if (!TYPES_IMPORTABLES.includes(type)) error = `Type "${type}" invalide ou non pris en charge par l'import`
          else if (!['facile', 'moyen', 'difficile'].includes(difficulte)) error = `Difficulté "${difficulte}" invalide`

          if (!error && type === 'vrai_faux') {
            optionsFinales = ['Vrai', 'Faux']
            if (repBrut === 'vrai') reponses_correctes = [0]
            else if (repBrut === 'faux') reponses_correctes = [1]
            else if (repBrut === '0' || repBrut === '1') reponses_correctes = [parseInt(repBrut)]
            else error = 'reponses_correctes doit être "vrai", "faux", 0 ou 1'
          } else if (!error && type === 'texte_libre') {
            optionsFinales = []
            reponses_correctes = []
          } else if (!error) {
            // qcm / qcm_multiple - separateur ";" (pas ",") : un fichier CSV
            // decoupe deja les colonnes sur la virgule, une valeur du type
            // "0,2" y serait incorrectement coupee en deux colonnes.
            if (options.length < 2) error = 'Au moins 2 options requises'
            else {
              reponses_correctes = repBrut.split(';').map(v => parseInt(v.trim())).filter(n => !isNaN(n))
              if (reponses_correctes.length === 0) error = 'reponses_correctes manquant (index séparés par point-virgule)'
              else if (reponses_correctes.some(i => i < 0 || i >= options.length)) error = 'reponses_correctes contient un index hors limites'
              else if (type === 'qcm' && reponses_correctes.length !== 1) error = 'Le type qcm ne doit avoir qu\'une seule bonne réponse'
            }
          }

          return {
            texte, type, points, theme: theme || null, difficulte,
            options: optionsFinales, reponses_correctes, reponse_indicative: null,
            error
          }
        })

      importRows.value = validated
      showImportModal.value = true
    } catch {
      toast.error('Erreur lors de la lecture du fichier')
    }
  }

  file.name.endsWith('.csv') ? reader.readAsText(file, 'UTF-8') : reader.readAsArrayBuffer(file)
  event.target.value = ''
}

const sendBulkImport = async () => {
  const validRows = importRows.value.filter(r => !r.error)
  if (!validRows.length) return
  sendingBulk.value = true

  const result = await createBanqueQuestionsBulk(validRows.map(r => ({
    texte: r.texte, type: r.type, points: r.points,
    options: r.options, reponses_correctes: r.reponses_correctes,
    reponse_indicative: r.reponse_indicative, theme: r.theme, difficulte: r.difficulte
  })))

  sendingBulk.value = false
  showImportModal.value = false
  importRows.value = []

  if (result.success) {
    toast.success(result.message || 'Questions importées')
    await charger()
  } else {
    toast.error(result.message || 'Erreur lors de l\'import')
  }
}

const downloadTemplate = () => {
  const csv  = 'texte,type,points,option1,option2,option3,option4,reponses_correctes,theme,difficulte\n' +
    '"Quelle est la capitale de la France ?",qcm,2,Paris,Lyon,Marseille,Nice,0,Géographie,facile\n' +
    '"Quels langages sont orientés objet ?",qcm_multiple,3,Java,HTML,Python,CSS,0;2,Informatique,moyen\n' +
    '"Le soleil est une étoile.",vrai_faux,1,,,,,vrai,Sciences,facile\n' +
    '"Citez deux gaz à effet de serre.",texte_libre,3,,,,,,"Environnement",moyen'
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url; a.download = 'modele_questions.csv'; a.click()
  URL.revokeObjectURL(url)
}

onMounted(charger)
</script>
