<template>
  <div class="bg-[#f5f0e8] font-body min-h-screen">
    <TeacherLayout>
      <div class="max-w-3xl mx-auto  py-3">
        <!-- En-tête -->
        <div class="mb-8">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="font-body text-2xl font-extrabold text-[#1e3a2f] mb-2">
                Créer une session de QCM
              </h2>
              <!-- <p class="text-[#9b9589] text-sm">
                Créez votre évaluation et planifiez-la pour vos étudiants
              </p> -->
            </div>
            <button 
              @click="$router.back()"
              class="text-[#4a7c5e] hover:text-[#1e3a2f] transition-colors"
            >
              ← Retour
            </button>
          </div>
        </div>

        <!-- Formulaire -->
        <form @submit.prevent="submitQCM" class="space-y-6">
          <!-- ═══════════════════════════════════════
               INFORMATIONS GÉNÉRALES
          ═══════════════════════════════════════ -->
          <div class="bg-white font-body shadow-[1px_1px_7px_1px_rgba(0,0,0,0.16)]   overflow-hidden">
            <div class="border-b border-[#e2ddd4] p-4 bg-[#f5f0e8]/30">
              <h3 class="font-['Roboto'] text-lg font-bold text-[#1e3a2f]">
                Informations générales
              </h3>
            </div>
            
            <div class="p-3 md:p-6 space-y-4">
              <div>
                <label class="block text-sm font-semibold text-[#1e3a2f] mb-2">
                  Titre <span class="text-red-500">*</span>
                </label>
                <input 
                  v-model="form.titre"
                  type="text"
                  class="w-full font-body pl-4 pr-4 py-3 text-sm text-gray-800 placeholder-gray-600 focus:text-md focus:text-black  bg-input  rounded-xl focus:bg-input focus:outline-none "
                  placeholder="Ex: Examen JavaScript"
                  required
                >
              </div>
              
              <div>
                <label class="block text-sm font-semibold text-[#1e3a2f] mb-2">
                  Thème
                </label>
                <input 
                  v-model="form.theme"
                  type="text"
                  class="w-full font-body pl-4 pr-4 py-3 text-sm text-gray-800 placeholder-gray-600 focus:text-md focus:text-black  bg-input  rounded-xl focus:bg-input focus:outline-none "
                  placeholder="Ex: JavaScript Fondamentaux"
                >
              </div>
              
              <div>
                <label class="block text-sm font-semibold text-[#1e3a2f] mb-2">
                  Description
                </label>
                <textarea 
                  v-model="form.description"
                  rows="3"
                  class="w-full font-body pl-4 pr-4 py-3 text-sm text-gray-800 placeholder-gray-600 focus:text-md focus:text-black  bg-input  rounded-xl focus:bg-input focus:outline-none  resize-none"
                  placeholder="Décrivez l'objectif de cette évaluation..."
                ></textarea>
              </div>
            </div>
          </div>

          <!-- ═══════════════════════════════════════
               PLANIFICATION
          ═══════════════════════════════════════ -->
          <div class="bg-white shadow-[1px_1px_7px_1px_rgba(0,0,0,0.16)]   overflow-hidden">
            <div class="border-b border-[#e2ddd4] p-4 bg-[#f5f0e8]/30">
              <h3 class="font-['Roboto'] text-lg font-bold text-[#1e3a2f]">
                Planification
              </h3>
            </div>
            
            <div class="p-3 md:p-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-[#1e3a2f] mb-2">
                    Date et heure de début <span class="text-red-500">*</span>
                  </label>
                  <input 
                    v-model="form.date_debut"
                    type="datetime-local"
                    class="w-full font-body pl-4 pr-4 py-3 text-sm text-gray-800 placeholder-gray-600 bg-input  rounded-xl focus:bg-input focus:outline-none "
                    required
                  >
                </div>
                
                <div>
                  <label class="block text-sm font-semibold text-[#1e3a2f] mb-2">
                    Date et heure de fin <span class="text-red-500">*</span>
                  </label>
                  <input 
                    v-model="form.date_fin"
                    type="datetime-local"
                    class="w-full font-body pl-4 pr-4 py-3 text-sm text-gray-800 placeholder-gray-600 bg-input  rounded-xl focus:bg-input focus:outline-none "
                    required
                  >
                </div>
                
                <div>
                  <label class="block text-sm font-semibold text-[#1e3a2f] mb-2">
                    Durée (minutes) <span class="text-red-500">*</span>
                  </label>
                  <input 
                    v-model.number="form.duree"
                    type="number"
                    min="1"
                    class="w-full font-body pl-4 pr-4 py-3 text-sm text-gray-800 placeholder-gray-600 bg-input  rounded-xl focus:bg-input focus:outline-none "
                    required
                  >
                </div>
              </div>
            </div>
          </div>

          <!-- ═══════════════════════════════════════
               CIBLE (Filière et Classe)
          ═══════════════════════════════════════ -->
          <div class="bg-white shadow-[1px_1px_7px_1px_rgba(0,0,0,0.16)]   overflow-hidden">
            <div class="border-b border-[#e2ddd4] p-4 bg-[#f5f0e8]/30">
              <h3 class="font-['Roboto'] text-lg font-bold text-[#1e3a2f]">
                Cible de la session
              </h3>
            </div>
            
            <div class="p-3 md:p-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-[#1e3a2f] mb-2">
                    Filière <span class="text-red-500">*</span>
                  </label>
                  <select 
                    v-model="form.filiere_id"
                    @change="onFiliereChange"
                    class="w-full font-body pl-4 pr-4 py-3 text-sm text-gray-800 bg-input  rounded-xl focus:bg-input focus:outline-none "
                    required
                  >
                    <option value="">Sélectionner une filière</option>
                    <option v-for="filiere in filieres" :key="filiere.id" :value="filiere.id">
                      {{ filiere.nom }}
                    </option>
                  </select>
                  <p class="text-xs text-[#9b9589] mt-1">
                    Seules les filières de votre école sont visibles
                  </p>
                </div>
                
                <div>
                  <label class="block text-sm font-semibold text-[#1e3a2f] mb-2">
                    Classe <span class="text-red-500">*</span>
                  </label>
                  <select 
                    v-model="form.classe_id"
                    class="w-full font-body pl-4 pr-4 py-3 text-sm text-gray-800 bg-input  rounded-xl focus:bg-input focus:outline-none "
                    :disabled="!form.filiere_id"
                    required
                  >
                    <option value="">Sélectionner une classe</option>
                    <option v-for="classe in classes" :key="classe.id" :value="classe.id">
                      {{ classe.nom }}
                    </option>
                  </select>
                  <p class="text-xs text-[#9b9589] mt-1">
                    Seuls les étudiants de cette classe pourront rejoindre
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- ═══════════════════════════════════════
               QUESTIONS
          ═══════════════════════════════════════ -->
          <div class="bg-white shadow-[1px_1px_7px_1px_rgba(0,0,0,0.16)]   overflow-hidden">
            <div class="border-b border-[#e2ddd4] p-4 bg-[#f5f0e8]/30 flex justify-between items-center">
              <h3 class="font-['Roboto'] text-lg font-bold text-[#1e3a2f]">
                Questions
              </h3>
              <button 
                type="button"
                @click="addQuestion"
                class="px-4 py-2 bg-[#4a7c5e] text-white text-sm font-semibold hover:bg-[#1e3a2f] transition-colors"
              >
                + Ajouter une question
              </button>
            </div>
            
            <div class="p-3 md:p-6">
              <div v-if="form.questions.length === 0" class="text-center py-12 text-[#9b9589]">
                <svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <p>Aucune question ajoutée</p>
                <p class="text-sm mt-1">Cliquez sur "Ajouter une question" pour commencer</p>
              </div>
              
              <div v-else class="space-y-6">
                <div 
                  v-for="(question, index) in form.questions" 
                  :key="index"
                  class="  overflow-hidden bg-[#f5f0e8]/20"
                >
                  <div class="bg-[#f5f0e8]/50 p-4 flex justify-between items-center border-b border-[#e2ddd4]">
                    <h4 class="font-['Roboto'] font-bold text-[#1e3a2f]">
                      Question {{ index + 1 }}
                    </h4>
                    <button 
                      type="button"
                      @click="removeQuestion(index)"
                      class="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                  
                  <div class="p-4 space-y-4">
                    <!-- Texte de la question -->
                    <div>
                      <label class="block text-sm font-semibold text-[#1e3a2f] mb-2">Texte de la question</label>
                      <textarea 
                        v-model="question.texte"
                        rows="2"
                    class="w-full font-body pl-4 pr-4 py-3 text-sm text-gray-800 placeholder-gray-600 bg-input  rounded-xl focus:bg-input focus:outline-none "
                        placeholder="Ex: Qu'est-ce que JavaScript ?"
                      ></textarea>
                    </div>
                    
                    <!-- Type et points -->
                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <label class="block text-sm font-semibold text-[#1e3a2f] mb-2">Type</label>
                        <select 
                          v-model="question.type"
                    class="w-full font-body pl-4 pr-4 py-3 text-sm text-gray-800 placeholder-gray-600 bg-input  rounded-xl focus:bg-input focus:outline-none "
                        >
                          <option value="qcm">QCM (une seule réponse)</option>
                          <option value="qcm_multiple">QCM multiple</option>
                          <option value="vrai_faux">Vrai / Faux</option>
                        </select>
                      </div>
                      <div>
                        <label class="block text-sm font-semibold text-[#1e3a2f] mb-2">Points</label>
                        <input 
                          v-model.number="question.points"
                          type="number"
                          min="1"
                    class="w-full font-body pl-4 pr-4 py-3 text-sm text-gray-800 placeholder-gray-600 bg-input  rounded-xl focus:bg-input focus:outline-none "
                        >
                      </div>
                    </div>
                    
                    <!-- Options pour QCM -->
                    <div v-if="question.type !== 'vrai_faux'">
                      <label class="block text-sm font-semibold text-[#1e3a2f] mb-2">Options</label>
                      <div class="space-y-2">
                        <div 
                          v-for="(opt, optIndex) in question.options" 
                          :key="optIndex"
                          class="flex items-center gap-2"
                        >
                          <input 
                            v-model="question.options[optIndex]"
                            type="text"
                            class="w-full font-body pl-4 pr-4 py-3 text-sm text-gray-800 placeholder-gray-600 bg-input  rounded-xl focus:bg-input focus:outline-none "
                            :placeholder="`Option ${optIndex + 1}`"
                          >
                          <button 
                            type="button"
                            @click="removeOption(index, optIndex)"
                            class="text-red-500 hover:text-red-700"
                          >
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                          </button>
                          <div v-if="question.type === 'qcm_multiple'" class="w-5 h-5 flex items-center justify-center">
                            <input 
                              type="checkbox"
                              :value="optIndex"
                              v-model="question.reponses_correctes"
                              class="w-5 h-5 accent-[#4a7c5e]"
                            >
                          </div>
                          <div v-else class="w-5 h-5 flex items-center justify-center">
                            <input 
                              type="radio"
                              :value="optIndex"
                              v-model="question.reponses_correctes[0]"
                              class="w-5 h-5 accent-[#4a7c5e]"
                            >
                          </div>
                        </div>
                        <button 
                          type="button"
                          @click="addOption(index)"
                          class="text-sm text-[#4a7c5e] hover:text-[#1e3a2f] transition-colors"
                        >
                          + Ajouter une option
                        </button>
                      </div>
                    </div>
                    
                    <!-- Vrai/Faux -->
                    <div v-if="question.type === 'vrai_faux'">
                      <label class="block text-sm font-semibold text-[#1e3a2f] mb-2">Réponse correcte</label>
                      <div class="flex gap-4">
                        <label class="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="radio"
                            :value="0"
                            v-model="question.reponses_correctes[0]"
                            class="w-5 h-5 accent-[#4a7c5e]"
                          >
                          <span class="text-sm text-gray-700">Vrai</span>
                        </label>
                        <label class="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="radio"
                            :value="1"
                            v-model="question.reponses_correctes[0]"
                            class="w-5 h-5 accent-[#4a7c5e]"
                          >
                          <span class="text-sm text-gray-700">Faux</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Boutons d'action -->
          <div class="flex justify-end gap-3 pt-4">
            <button 
              type="button"
              @click="$router.back()"
              class="px-6 py-3  bg-red-500 font-body text-white  rounded-xl text-sm font-semibold text-[#1e3a2f] hover:bg-red-700 transition-colors"
            >
              Annuler
            </button>
            <button 
              type="submit"
              :disabled="loading"
              class="px-6 py-3 bg-[#4a7c5e] text-white font-body rounded-xl text-sm font-semibold hover:bg-[#1e3a2f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <div v-if="loading" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              {{ loading ? 'Création en cours...' : 'Créer le QCM' }}
            </button>
          </div>
        </form>
      </div>
    </TeacherLayout>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useTeacher } from '../../../composables/useTeacher'
import { useToast } from '../../../composables/useToast'

const { getFilieres, getClassesByFiliere, createQCM } = useTeacher()
const toast = useToast()

const loading = ref(false)
const filieres = ref([])
const classes = ref([])

const form = ref({
  titre: '',
  description: '',
  theme: '',
  date_debut: '',
  date_fin: '',
  duree: 60,
  filiere_id: '',
  classe_id: '',
  questions: []
})

// Ajouter une question
const addQuestion = () => {
  form.value.questions.push({
    texte: '',
    type: 'qcm',
    points: 1,
    options: ['', ''],
    reponses_correctes: []
  })
}

// Supprimer une question
const removeQuestion = (index) => {
  form.value.questions.splice(index, 1)
}

// Ajouter une option
const addOption = (questionIndex) => {
  form.value.questions[questionIndex].options.push('')
}

// Supprimer une option
const removeOption = (questionIndex, optionIndex) => {
  form.value.questions[questionIndex].options.splice(optionIndex, 1)
}

// Quand la filière change
const onFiliereChange = async () => {
  form.value.classe_id = ''
  if (form.value.filiere_id) {
    const res = await getClassesByFiliere(form.value.filiere_id)
    if (res.success) {
      classes.value = res.data
    }
  }
}

// Soumettre le formulaire
const submitQCM = async () => {
  // Validation
  if (!form.value.titre) {
    toast.error('Veuillez saisir un titre')
    return
  }
  if (!form.value.date_debut || !form.value.date_fin) {
    toast.error('Veuillez définir les dates')
    return
  }
  if (!form.value.filiere_id || !form.value.classe_id) {
    toast.error('Veuillez sélectionner une filière et une classe')
    return
  }
  if (form.value.questions.length === 0) {
    toast.error('Veuillez ajouter au moins une question')
    return
  }
  
  // Vérifier que chaque question a du texte et des options
  for (let i = 0; i < form.value.questions.length; i++) {
    const q = form.value.questions[i]
    if (!q.texte.trim()) {
      toast.error(`Question ${i + 1} : veuillez saisir le texte de la question`)
      return
    }
    if (q.type !== 'vrai_faux' && q.options.some(opt => !opt.trim())) {
      toast.error(`Question ${i + 1} : veuillez remplir toutes les options`)
      return
    }
    if (q.reponses_correctes.length === 0) {
      toast.error(`Question ${i + 1} : veuillez sélectionner la réponse correcte`)
      return
    }
  }
  
  loading.value = true
  
  const result = await createQCM({
    ...form.value,
    date_debut: new Date(form.value.date_debut).toISOString(),
    date_fin: new Date(form.value.date_fin).toISOString()
  })
  
  if (result.success) {
    toast.success('QCM créé avec succès !')
    await navigateTo(`/teacher/qcm/${result.data.id}`)
  } else {
    toast.error(result.message || 'Erreur lors de la création')
  }
  
  loading.value = false
}

// Charger les filières
onMounted(async () => {
  const res = await getFilieres()
  if (res.success) {
    filieres.value = res.data
  }
})
</script>

<style scoped>
/* Animation pour les questions */
.border {
  transition: all 0.2s ease;
}

.border:hover {
  border-color: #4a7c5e;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
</style>