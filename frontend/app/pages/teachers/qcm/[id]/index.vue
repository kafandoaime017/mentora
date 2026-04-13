<template>
  <div class="bg-[#f5f0e8] font-body min-h-screen">
    <TeacherLayout>
      <div class="max-w-8xl mx-auto  py-6">
        
        <!-- En-tête avec navigation -->
        <div class="mb-6">
          <button 
            @click="$router.back()"
              class="text-[#4a7c5e] flex mx-1 bg-gray-200 hover:bg-gray-300 font-body font-bold px-1 py-2 rounded-lg hover:text-[#1e3a2f] transition-colors"
            >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            Retour
          </button>
          
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 class="font-body my-2 text-2xl font-extrabold text-[#1e3a2f]">{{ qcm.titre }}</h1>
              <div class="flex items-center gap-3 mt-1">
                <span 
                  class="inline-flex px-2 font-body py-0.5 text-xs rounded-full font-medium"
                  :class="getStatusClass(qcm.status)"
                >
                  {{ getStatusText(qcm.status) }}
                </span>
                <span class="text-xs font-body text-[#9b9589]">Créé le {{ formatDate(qcm.created_at) }}</span>
              </div>
            </div>
            <div class="flex gap-3">
              <button 
                v-if="qcm.status === 'pending'"
                @click="startSessionHandler"
                class="px-5 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Démarrer
              </button>
              <button 
                v-if="qcm.status === 'active'"
                @click="endSessionHandler"
                class="px-5 py-2.5 bg-orange-600 font-body text-white rounded-xl text-sm font-semibold hover:bg-orange-700 transition-colors flex items-center gap-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 10h6v4H9z"/>
                </svg>
                Terminer
              </button>
              <!-- <button 
                @click="exportResults"
                class="px-5 py-2.5 bg-[#4a7c5e] text-white rounded-xl text-sm font-semibold hover:bg-[#1e3a2f] transition-colors flex items-center gap-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                </svg>
                Exporter
              </button> -->
            </div>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="bg-white shadow-[1px_1px_3px_1px_rgba(0,0,0,0.16)] rounded-lg p-12 text-center">
          <div class="inline-block animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
          <!-- <SpinnerDark/> -->
          <!-- <p class="text-[#9b9589] text-sm mt-3">Chargement...</p> -->
        </div>

        <div v-else>
          <!-- ==================== SESSION PROGRAMMÉE (PENDING) ==================== -->
          <template v-if="qcm.status === 'pending'">
            <div class="max-w-8xl mx-auto">
              <!-- Informations générales -->
              <div class="bg-white shadow-[1px_1px_3px_1px_rgba(0,0,0,0.16)] rounded-lg overflow-hidden mb-6">
                <div class="border-b border-[#e2ddd4] p-4 bg-[#f5f0e8]/30">
                  <h3 class="font-body text-lg font-bold text-[#1e3a2f]">Informations générales</h3>
                </div>
                <div class="p-6">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><p class="text-sm text-[#9b9589] mb-1">Titre</p><p class="font-semibold text-[#1e3a2f]">{{ qcm.titre }}</p></div>
                    <div><p class="text-sm text-[#9b9589] mb-1">Thème</p><p class="text-[#1e3a2f]">{{ qcm.theme || 'Non défini' }}</p></div>
                    <div class="md:col-span-2"><p class="text-sm text-[#9b9589] mb-1">Description</p><p class="text-[#1e3a2f]">{{ qcm.description || 'Aucune description' }}</p></div>
                  </div>
                </div>
              </div>

              <!-- Planification -->
              <div class="bg-white shadow-[1px_1px_3px_1px_rgba(0,0,0,0.16)] rounded-lg overflow-hidden mb-6">
                <div class="border-b border-[#e2ddd4] font-body p-4 bg-[#f5f0e8]/30"><h3 class="font-bold text-[#1e3a2f]">Planification</h3></div>
                <div class="p-6">
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div><p class="text-sm text-[#9b9589] mb-1">Date début</p><p class="text-[#1e3a2f] bg-gray-200 px-3 py-1 font-body rounded-full text-sm">{{ formatDateTime(qcm.date_debut) }}</p></div>
                    <div><p class="text-sm text-[#9b9589] mb-1">Date fin</p><p class="text-[#1e3a2f] bg-gray-200 px-3 py-1 font-body rounded-full text-sm">{{ formatDateTime(qcm.date_fin) }}</p></div>
                    <div><p class="text-sm text-[#9b9589] mb-1">Durée</p><p class="text-[#1e3a2f] bg-gray-200 px-3 py-1 font-body rounded-full text-sm">{{ qcm.duree }} min</p></div>
                  </div>
                </div>
              </div>

              <!-- Cible -->
              <div class="bg-white shadow-[1px_1px_3px_1px_rgba(0,0,0,0.16)] rounded-lg overflow-hidden mb-6">
                <div class="border-b  border-[#e2ddd4] p-4 bg-[#f5f0e8]/30"><h3 class="font-bold text-[#1e3a2f]">Cible</h3></div>
                <div class="p-6">
                  <div class="flex gap-4">
                    <span class="bg-gray-200 px-3 py-1 font-body rounded-full text-sm">{{ qcm.filiere?.nom || '—' }}</span>
                    <span class="bg-gray-200 px-3 py-1 font-body rounded-full text-sm">{{ qcm.classe?.nom || '—' }}</span>
                  </div>
                </div>
              </div>

              <!-- Code et QR -->
              <div class="bg-white shadow-[1px_1px_3px_1px_rgba(0,0,0,0.16)] rounded-lg overflow-hidden mb-6">
                <div class="border-b border-[#e2ddd4] p-4 bg-[#f5f0e8]/30"><h3 class="font-bold font-body text-[#1e3a2f]">Accès étudiants</h3></div>
                <div class="p-6">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div><p class="text-sm text-[#9b9589] font-body mb-2">Code d'accès</p>
                      <div class="flex items-center gap-3"><code class="bg-gray-200 px-4 py-2 rounded-lg font-mono text-xl font-bold">{{ qcm.code }}</code>
                        <button @click="copyCode" class="p-2 text-[#4a7c5e] hover:bg-gray-100 rounded-lg"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg></button>
                        <button @click="regenerateCode" class="p-2 text-[#4a7c5e] hover:bg-gray-100 rounded-lg"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg></button>
                      </div>
                    </div>
                    <div><p class="text-sm text-[#9b9589] font-body mb-2">QR Code</p>
                      <div class="flex items-center gap-3"><img v-if="qcm.qr_code" :src="qcm.qr_code" class="w-24 h-24 border rounded-lg p-2"><div v-else class="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">Pas de QR</div>
                        <button @click="regenerateQR" class="p-2 text-[#4a7c5e] hover:bg-gray-100 rounded-lg"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg></button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Questions -->
              <div class="bg-white shadow-[1px_1px_3px_1px_rgba(0,0,0,0.16)] rounded-lg overflow-hidden">
                <div class="border-b border-[#e2ddd4] p-4 bg-[#f5f0e8]/30 flex justify-between font-body"><h3 class="font-bold">Questions ({{ qcm.questions?.length || 0 }})</h3><span class="text-sm">Total: {{ totalPoints }} pts</span></div>
                <div class="p-6 space-y-4">
                  <div v-for="(question, index) in qcm.questions" :key="question.id" class="border border-[#e2ddd4] rounded-lg overflow-hidden">
                    <div class="bg-[#f5f0e8]/50 p-4 flex justify-between flex-wrap gap-2">
                      <div class="flex items-center font-body gap-3"><span class="w-8 h-8 rounded-full bg-[#4a7c5e]/10 flex items-center justify-center font-bold">{{ index + 1 }}</span><span class="font-semibold">{{ question.texte }}</span></div>
                      <div class="flex gap-3 font-body"><span class="text-xs bg-gray-200 px-2 py-1 rounded-full">{{ getTypeLabel(question.type) }}</span><span class="text-sm font-semibold text-[#4a7c5e]">{{ question.points }} pts</span></div>
                    </div>
                    <div class="p-4">
                     <div v-if="question.type !== 'vrai_faux'" class="flex font-body flex-wrap gap-2">
  <div v-for="(opt, optIdx) in question.options" :key="optIdx" 
       class="px-3 py-1.5 rounded-full text-sm transition-all"
       :class="getReponseStyle(question.id, optIdx)">
    {{ opt }}
    <span v-if="getReponseStatus(question.id, optIdx)" class="ml-1 font-bold">
      {{ getReponseStatus(question.id, optIdx) === 'correct' ? '✓' : '✗' }}
    </span>
  </div>
</div>

<div v-else class="flex gap-4">
  <div class="px-4 py-2 font-body rounded-full text-sm" :class="getVraiFauxReponseStyle(question.id, 0)">
    Vrai 
    <span v-if="getReponseStatus(question.id, 0) === 'correct'" class="ml-1 font-bold">✓</span>
    <span v-else-if="getReponseStatus(question.id, 0) === 'incorrect'" class="ml-1 font-bold">✗</span>
  </div>
  <div class="px-4 font-body py-2 rounded-full text-sm" :class="getVraiFauxReponseStyle(question.id, 1)">
    Faux 
    <span v-if="getReponseStatus(question.id, 1) === 'correct'" class="ml-1 font-bold">✓</span>
    <span v-else-if="getReponseStatus(question.id, 1) === 'incorrect'" class="ml-1 font-bold">✗</span>
  </div>
</div>
                     
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- ==================== SESSION EN COURS OU TERMINÉE ==================== -->
          <template v-else>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              <!-- Colonne gauche : Détails et Questions -->
              <div class="space-y-6">
                <!-- Sélecteur d'étudiant -->
                <div class="bg-white shadow-[1px_1px_3px_1px_rgba(0,0,0,0.16)] rounded-lg overflow-hidden">
                  <div class="border-b border-[#e2ddd4] p-4 bg-[#f5f0e8]/30">
                    <h3 class="font-body text-lg font-bold text-[#1e3a2f]">Étudiants (participants)</h3>
                  </div>
                  <div class="p-4">
                    <select v-model="selectedEtudiantId" @change="loadEtudiantReponses" class="w-full font-body pl-4 pr-4 py-3 text-sm text-gray-800 bg-input rounded-xl focus:bg-input focus:outline-none">
                      <option value="">-- Sélectionner un étudiant --</option>
                      <option v-for="p in participants" :key="p.id" :value="p.etudiant?.id">
                        {{ p.etudiant?.prenom }} {{ p.etudiant?.nom }} - {{ p.score || 0 }}/{{ totalPoints }} pts
                      </option>
                    </select>
                  </div>
                </div>

                <!-- Questions avec réponses colorées -->
                <div class="bg-white shadow-[1px_1px_3px_1px_rgba(0,0,0,0.16)] rounded-lg overflow-hidden">
                  <div class="border-b border-[#e2ddd4] p-4 bg-[#f5f0e8]/30 flex justify-between items-center">
                    <h3 class="font-body text-lg font-bold text-[#1e3a2f]">Questions et réponses</h3>
                    <!-- <span class="text-xs text-[#9b9589]">Vert = correct, Rouge = incorrect</span> -->
                  </div>
                  
                  <div v-if="loadingReponses" class="p-12 text-center">
                    <div class="inline-block animate-spin rounded-full h-6 w-6 border-2 border-[#4a7c5e] border-t-transparent"></div>
                  </div>
                  
                  <div v-else-if="!selectedEtudiantId" class="p-12 text-center text-[#9b9589]">
                    <svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                    </svg>
                    <p>Sélectionnez un étudiant pour voir ses réponses</p>
                  </div>
                  
                  <div v-else class="divide-y divide-[#e2ddd4]">
                    <div v-for="(question, idx) in qcm.questions" :key="question.id" class="p-4">
                      <div class="flex justify-between items-start mb-3">
                        <div class="flex items-center gap-2">
                          <span class="w-6 h-6 rounded-full bg-[#4a7c5e]/10 flex items-center justify-center text-xs font-bold">{{ idx + 1 }}</span>
                          <span class="font-medium font-body">{{ question.texte }}</span>
                        </div>
                        <!-- <span class="text-xs text-[#9b9589]">{{ question.points }} pts</span> -->
                      </div>
                      
                      <div class="ml-8 space-y-2">
                        <div v-if="question.type !== 'vrai_faux'" class="flex flex-wrap gap-2">
                          <div v-for="(opt, optIdx) in question.options" :key="optIdx" 
                               class="px-3 py-1.5 rounded-full text-sm font-body transition-all"
                               :class="getReponseStyle(question.id, optIdx, question.reponses_correctes.includes(optIdx))">
                            {{ opt }}
                            <span v-if="getReponseStatus(question.id, optIdx)" class="ml-1">
                              {{ getReponseStatus(question.id, optIdx) === 'correct' ? '✓' : '✗' }}
                            </span>
                          </div>
                        </div>
                        <div v-else class="flex gap-4">
                          <div class="px-4 font-body py-2 rounded-full text-sm" :class="getVraiFauxReponseStyle(question.id, 0, question.reponses_correctes[0] === 0)">
                            Vrai <span v-if="getReponseStatus(question.id, 0) === 'correct'" class="ml-1">✓</span><span v-else-if="getReponseStatus(question.id, 0) === 'incorrect'" class="ml-1">✗</span>
                          </div>
                          <div class="px-4 font-body py-2 rounded-full text-sm" :class="getVraiFauxReponseStyle(question.id, 1, question.reponses_correctes[0] === 1)">
                            Faux <span v-if="getReponseStatus(question.id, 1) === 'correct'" class="ml-1">✓</span><span v-else-if="getReponseStatus(question.id, 1) === 'incorrect'" class="ml-1">✗</span>
                          </div>
                        </div>
                      
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Colonne droite : Participants et résultats -->
              <div class="bg-white shadow-[1px_1px_3px_1px_rgba(0,0,0,0.16)] rounded-lg overflow-hidden">
                <div class="border-b border-[#e2ddd4] p-4 bg-[#f5f0e8]/30">
                  <h3 class="font-body text-lg font-bold text-[#1e3a2f]">Résultats</h3>
                </div>
                
                <div v-if="loadingParticipants" class="p-12 text-center">
                  <div class="inline-block animate-spin rounded-full h-6 w-6 border-2 border-[#4a7c5e] border-t-transparent"></div>
                </div>

                <div v-else-if="participants.length === 0" class="p-12 text-center text-[#9b9589]">
                  <svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                  </svg>
                  <p>Aucun participant pour l'instant</p>
                </div>

                <div v-else class="overflow-x-auto">
                  <table class="w-full">
                    <thead class="bg-[#f5f0e8]">
                      <tr>
                        <th class="px-4 font-body py-3 text-left text-xs font-semibold text-[#1e3a2f]">Étudiant</th>
                        <th class="px-4 font-body py-3 text-center text-xs font-semibold text-[#1e3a2f]">Score/note</th>
                        <!-- <th class="px-4 font-body py-3 text-center text-xs font-semibold text-[#1e3a2f]">Note /20</th> -->
                        <th class="px-4 font-body py-3 text-center text-xs font-semibold text-[#1e3a2f]">Actions</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-[#e2ddd4]">
                      <tr v-for="p in participants" :key="p.id" class="hover:bg-[#f5f0e8]/30 cursor-pointer transition-colors"  @click="selectedEtudiantId = p.etudiant?.id; loadEtudiantReponses()">
                        <td class="px-4 py-2">
                          <div>
                            <p class="font-medium font-body text-[#1e3a2f]">{{ p.etudiant?.prenom }} {{ p.etudiant?.nom }}</p>
                            <p class="text-xs font-body text-[#9b9589]">{{ p.etudiant?.email }}</p>
                          </div>
                        </td>
                        <td class="px-4 py-3 text-center font-semibold text-[#1e3a2f]">{{ p.score || 0 }} / {{ totalPoints }}</td>
                        <!-- <td class="px-4 py-3 text-center">
                          <span class="font-bold" :class="getNoteClass(p.score, totalPoints)">{{ totalPoints ? ((p.score || 0) / totalPoints * 20).toFixed(1) : 0 }}</span>
                        </td> -->
                        <td class="px-4 py-3 text-center">
                          <button @click.stop="viewEtudiantDetails(p.etudiant?.id)" class="text-primary font-bold font-body hover:bg-gray-400 bg-gray-300 px-4 py-2 rounded-lg text-sm">Voir détails</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

              
              </div>
            </div>
          </template>
        </div>
      </div>
    </TeacherLayout>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTeacher } from '../../../../../composables/useTeacher'
import { useToast } from '../../../../../composables/useToast'

const route = useRoute()
const router = useRouter()
const { getQCMDetails, startSession, endSession, generateQRCode, generateNewCode, getParticipants, getEtudiantReponses } = useTeacher()
const toast = useToast()

const loading = ref(true)
const loadingParticipants = ref(false)
const loadingReponses = ref(false)
const qcm = ref({})
const participants = ref([])
const selectedEtudiantId = ref('')
const etudiantReponses = ref({})

const totalPoints = computed(() => qcm.value.questions?.reduce((sum, q) => sum + q.points, 0) || 0)

const averageScore = computed(() => {
  const scores = participants.value.filter(p => p.score !== null).map(p => p.score)
  return scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
})

const averageNote = computed(() => totalPoints.value ? (averageScore.value / totalPoints.value) * 20 : 0)

const successRate = computed(() => {
  const total = participants.value.filter(p => p.statut === 'termine').length
  if (!total) return 0
  const success = participants.value.filter(p => p.score && p.score / totalPoints.value >= 0.5).length
  return Math.round((success / total) * 100)
})

const getReponseStyle = (questionId, optIndex) => {
  const reponse = etudiantReponses.value[questionId]
  const question = qcm.value.questions?.find(q => q.id === questionId)
  
  if (!reponse || !question) return 'bg-gray-200 text-gray-700'
  
  const isSelected = reponse.reponse_ids?.includes(optIndex)
  const isCorrect = question.reponses_correctes?.includes(optIndex)
  
  // Si l'étudiant a sélectionné cette option
  if (isSelected) {
    return isCorrect ? 'bg-primary text-white' : 'bg-red-500 text-white'
  }
  
  // Option non sélectionnée par l'étudiant
  return 'bg-gray-200 text-gray-700'
}


const getReponseStatus = (questionId, optIndex) => {
  const reponse = etudiantReponses.value[questionId]
  const isSelected = reponse?.reponse_ids?.includes(optIndex)
  const question = qcm.value.questions?.find(q => q.id === questionId)
  const estCorrecte = question?.reponses_correctes?.includes(optIndex)
  if (isSelected && estCorrecte) return 'correct'
  if (isSelected && !estCorrecte) return 'incorrect'
  return null
}

const getVraiFauxReponseStyle = (questionId, value) => {
  const reponse = etudiantReponses.value[questionId]
  const question = qcm.value.questions?.find(q => q.id === questionId)
  
  if (!reponse || !question) return 'bg-gray-100 text-gray-700'
  
  const isSelected = reponse.reponse_ids?.includes(value)
  const isCorrect = question.reponses_correctes?.includes(value)
  
  if (isSelected) {
    return isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
  }
  
  return 'bg-gray-100 text-gray-700'
}

const getNoteClass = (score, total) => {
  if (!score || !total) return 'text-gray-500'
  const note = (score / total) * 20
  if (note >= 16) return 'text-green-600'
  if (note >= 12) return 'text-blue-600'
  if (note >= 10) return 'text-yellow-600'
  return 'text-red-600'
}

const getTypeLabel = (type) => {
  const types = { qcm: 'QCM simple', qcm_multiple: 'QCM multiple', vrai_faux: 'Vrai / Faux' }
  return types[type] || type
}

const getStatusText = (status) => {
  const statusMap = { pending: 'Programmé', active: 'En cours', completed: 'Terminé', draft: 'Brouillon' }
  return statusMap[status] || status
}

const getStatusClass = (status) => {
  const classMap = { pending: 'bg-yellow-200 text-yellow-800', active: 'bg-green-200 text-green-800', completed: 'bg-gray-200 text-gray-800', draft: 'bg-blue-100 text-blue-800' }
  return classMap[status] || 'bg-gray-200 text-gray-800'
}

const formatDate = (date) => date ? new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : ''
const formatDateTime = (date) => date ? new Date(date).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''

const copyCode = async () => { try { await navigator.clipboard.writeText(qcm.value.code); toast.success('Code copié') } catch { toast.error('Erreur') } }
const regenerateQR = async () => { const r = await generateQRCode(qcm.value.id); if (r.success) { qcm.value.qr_code = r.data.qr_code; toast.success('QR code régénéré') } else toast.error(r.message) }
const regenerateCode = async () => { const r = await generateNewCode(qcm.value.id); if (r.success) { qcm.value.code = r.data.code; toast.success('Nouveau code'); await regenerateQR() } else toast.error(r.message) }
const startSessionHandler = async () => { const r = await startSession(qcm.value.id); if (r.success) { toast.success('Session démarrée !'); await loadQCMDetails() } else toast.error(r.message) }
const endSessionHandler = async () => { const r = await endSession(qcm.value.id); if (r.success) { toast.success('Session terminée !'); await loadQCMDetails() } else toast.error(r.message) }
const exportResults = () => window.open(`/api/teacher/sessions/${qcm.value.id}/export`, '_blank')
const viewEtudiantDetails = (id) => { selectedEtudiantId.value = id; loadEtudiantReponses() }

const loadEtudiantReponses = async () => {
  if (!selectedEtudiantId.value) return
  loadingReponses.value = true
  try {
    const result = await getEtudiantReponses(qcm.value.id, selectedEtudiantId.value)
    if (result.success) {
      const reponsesMap = {}
      // ✅ Correction : result.data.reponses est le tableau, pas result.data directement
      const reponsesArray = result.data.reponses || result.data || []
      
      if (Array.isArray(reponsesArray)) {
        reponsesArray.forEach(r => { 
          reponsesMap[r.question_id] = r 
        })
      }
      etudiantReponses.value = reponsesMap
    } else {
      console.error('Erreur chargement réponses:', result.message)
      toast.error(result.message || 'Erreur lors du chargement des réponses')
    }
  } catch (error) {
    console.error('Erreur loadEtudiantReponses:', error)
    toast.error('Erreur lors du chargement des réponses')
  } finally {
    loadingReponses.value = false
  }
}

const loadParticipants = async () => {
  if (qcm.value.status === 'pending') return
  loadingParticipants.value = true
  const result = await getParticipants(qcm.value.id)
  if (result.success) participants.value = result.data?.participants || []
  loadingParticipants.value = false
}

const loadQCMDetails = async () => {
  const id = parseInt(route.params.id)
  const result = await getQCMDetails(id)
  if (result.success) { qcm.value = result.data; await loadParticipants() }
  else { toast.error('Erreur de chargement'); router.back() }
  loading.value = false
}

onMounted(() => loadQCMDetails())
</script>

<style scoped>
.border { transition: all 0.2s ease; }
.border-b { transition: all 0.2s ease; }
</style>