<template>
  <div class="bg-[#f5f0e8] font-body min-h-screen">
    <TeacherLayout>
      <div class="max-w-8xl mx-auto py-6">

        <!-- En-tête -->
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
                <span class="inline-flex px-2 font-body py-0.5 text-xs rounded-full font-medium" :class="getStatusClass(qcm.status)">
                  {{ getStatusText(qcm.status) }}
                </span>
                <span class="text-xs font-body text-[#9b9589]">Créé le {{ formatDate(qcm.created_at) }}</span>
              </div>
            </div>
            <div class="flex flex-wrap gap-3">
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

              <!-- Exporter PDF -->
              <button
                v-if="qcm.status === 'completed'"
                @click="imprimerPDF"
                :disabled="generatingPDF"
                class="px-5 py-2.5 bg-[#3730a3] font-body text-white rounded-xl text-sm font-semibold hover:bg-[#312e81] transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <div v-if="generatingPDF" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"/>
                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                {{ generatingPDF ? 'Génération...' : 'Exporter PDF' }}
              </button>

              <!-- Toggle notes visibles -->
              <button
                v-if="qcm.status === 'completed'"
                @click="toggleResultats"
                :disabled="togglingResultats"
                class="px-5 py-2.5 font-body text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
                :class="qcm.resultatsVisibles ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-500 hover:bg-gray-600'"
              >
                <div v-if="togglingResultats" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"/>
                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path v-if="qcm.resultatsVisibles" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242"/>
                </svg>
                {{ qcm.resultatsVisibles ? 'Notes visibles' : 'Notes masquées' }}
              </button>

            </div>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="bg-white shadow-[1px_1px_3px_1px_rgba(0,0,0,0.16)] rounded-lg p-12 text-center">
          <div class="inline-block animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"/>
        </div>

        <div v-else>

          <!-- SESSION PENDING -->
          <template v-if="qcm.status === 'pending'">
            <div class="space-y-6">
              <div class="bg-white shadow-[1px_1px_3px_1px_rgba(0,0,0,0.16)] rounded-lg overflow-hidden">
                <div class="border-b border-[#e2ddd4] p-4 bg-[#f5f0e8]/30">
                  <h3 class="font-body text-lg font-bold text-[#1e3a2f]">Informations générales</h3>
                </div>
                <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div><p class="text-sm text-[#9b9589] mb-1">Titre</p><p class="font-semibold text-[#1e3a2f]">{{ qcm.titre }}</p></div>
                  <div><p class="text-sm text-[#9b9589] mb-1">Thème</p><p class="text-[#1e3a2f]">{{ qcm.theme || 'Non défini' }}</p></div>
                  <div class="md:col-span-2"><p class="text-sm text-[#9b9589] mb-1">Description</p><p class="text-[#1e3a2f]">{{ qcm.description || 'Aucune description' }}</p></div>
                </div>
              </div>

              <div class="bg-white shadow-[1px_1px_3px_1px_rgba(0,0,0,0.16)] rounded-lg overflow-hidden">
                <div class="border-b border-[#e2ddd4] p-4 bg-[#f5f0e8]/30">
                  <h3 class="font-body font-bold text-[#1e3a2f]">Planification</h3>
                </div>
                <div class="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div><p class="text-sm text-[#9b9589] mb-1">Date début</p><p class="text-[#1e3a2f] bg-gray-200 px-3 py-1 font-body rounded-full text-sm inline-block">{{ formatDateTime(qcm.date_debut) }}</p></div>
                  <div><p class="text-sm text-[#9b9589] mb-1">Date fin</p><p class="text-[#1e3a2f] bg-gray-200 px-3 py-1 font-body rounded-full text-sm inline-block">{{ formatDateTime(qcm.date_fin) }}</p></div>
                  <div><p class="text-sm text-[#9b9589] mb-1">Durée</p><p class="text-[#1e3a2f] bg-gray-200 px-3 py-1 font-body rounded-full text-sm inline-block">{{ qcm.duree }} min</p></div>
                </div>
              </div>

              <div class="bg-white shadow-[1px_1px_3px_1px_rgba(0,0,0,0.16)] rounded-lg overflow-hidden">
                <div class="border-b border-[#e2ddd4] p-4 bg-[#f5f0e8]/30">
                  <h3 class="font-bold text-[#1e3a2f]">Cible</h3>
                </div>
                <div class="p-6 flex gap-4">
                  <span class="bg-gray-200 px-3 py-1 font-body rounded-full text-sm">{{ qcm.filiere?.nom || '—' }}</span>
                  <span class="bg-gray-200 px-3 py-1 font-body rounded-full text-sm">{{ qcm.classe?.nom || '—' }}</span>
                </div>
              </div>

              <div class="bg-white shadow-[1px_1px_3px_1px_rgba(0,0,0,0.16)] rounded-lg overflow-hidden">
                <div class="border-b border-[#e2ddd4] p-4 bg-[#f5f0e8]/30">
                  <h3 class="font-bold font-body text-[#1e3a2f]">Accès étudiants</h3>
                </div>
                <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p class="text-sm text-[#9b9589] font-body mb-2">Code d'accès</p>
                    <div class="flex items-center gap-3">
                      <code class="bg-gray-200 px-4 py-2 rounded-lg font-mono text-xl font-bold">{{ qcm.code }}</code>
                      <button @click="copyCode" class="p-2 text-[#4a7c5e] hover:bg-gray-100 rounded-lg">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>
                      </button>
                      <button @click="regenerateCode" class="p-2 text-[#4a7c5e] hover:bg-gray-100 rounded-lg">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                      </button>
                    </div>
                  </div>
                  <div>
                    <p class="text-sm text-[#9b9589] font-body mb-2">QR Code</p>
                    <div class="flex items-center gap-3">
                      <img v-if="qcm.qr_code" :src="qcm.qr_code" class="w-24 h-24 border rounded-lg p-2">
                      <div v-else class="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-400">Pas de QR</div>
                      <button @click="regenerateQR" class="p-2 text-[#4a7c5e] hover:bg-gray-100 rounded-lg">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div class="bg-white shadow-[1px_1px_3px_1px_rgba(0,0,0,0.16)] rounded-lg overflow-hidden">
                <div class="border-b border-[#e2ddd4] p-4 bg-[#f5f0e8]/30 flex justify-between font-body">
                  <h3 class="font-bold">Questions ({{ qcm.questions?.length || 0 }})</h3>
                  <span class="text-sm">Total: {{ totalPoints }} pts</span>
                </div>
                <div class="p-6 space-y-4">
                  <div v-for="(question, index) in qcm.questions" :key="question.id" class="border border-[#e2ddd4] rounded-lg overflow-hidden">
                    <div class="bg-[#f5f0e8]/50 p-4 flex justify-between flex-wrap gap-2">
                      <div class="flex items-center font-body gap-3">
                        <span class="w-8 h-8 rounded-full bg-[#4a7c5e]/10 flex items-center justify-center font-bold">{{ index + 1 }}</span>
                        <span class="font-semibold">{{ question.texte }}</span>
                      </div>
                      <div class="flex gap-3 font-body">
                        <span class="text-xs bg-gray-200 px-2 py-1 rounded-full">{{ getTypeLabel(question.type) }}</span>
                        <span class="text-sm font-semibold text-[#4a7c5e]">{{ question.points }} pts</span>
                      </div>
                    </div>
                    <div class="p-4">
                      <div v-if="question.type !== 'vrai_faux'" class="flex font-body flex-wrap gap-2">
                        <div
                          v-for="(opt, optIdx) in question.options" :key="optIdx"
                          class="px-3 py-1.5 rounded-full text-sm font-body"
                          :class="question.reponses_correctes?.includes(optIdx) ? 'bg-green-100 text-green-800 border border-green-400 font-semibold' : 'bg-gray-200 text-gray-700'"
                        >
                          {{ opt }}
                          <span v-if="question.reponses_correctes?.includes(optIdx)" class="ml-1">✓</span>
                        </div>
                      </div>
                      <div v-else class="flex gap-4">
                        <div class="px-4 py-2 font-body rounded-full text-sm" :class="question.reponses_correctes?.includes(0) ? 'bg-green-100 text-green-800 border border-green-400 font-semibold' : 'bg-gray-200 text-gray-700'">
                          Vrai <span v-if="question.reponses_correctes?.includes(0)" class="ml-1">✓</span>
                        </div>
                        <div class="px-4 py-2 font-body rounded-full text-sm" :class="question.reponses_correctes?.includes(1) ? 'bg-green-100 text-green-800 border border-green-400 font-semibold' : 'bg-gray-200 text-gray-700'">
                          Faux <span v-if="question.reponses_correctes?.includes(1)" class="ml-1">✓</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- SESSION ACTIVE / COMPLETED -->
          <template v-else>

            <!-- Réponses à corriger manuellement (texte_libre / fichier) -->
            <div v-if="qcm.status === 'completed' && (loadingCorrections || reponsesACorreger.length > 0)" class="bg-white shadow-[1px_1px_3px_1px_rgba(0,0,0,0.16)] rounded-lg overflow-hidden mb-6">
              <div class="border-b border-[#e2ddd4] p-4 bg-[#f5f0e8]/30 flex items-center justify-between">
                <h3 class="font-body text-lg font-bold text-[#1e3a2f]">Réponses à corriger</h3>
                <span v-if="!loadingCorrections" class="text-xs font-body text-[#9b9589]">
                  {{ reponsesACorreger.filter(r => !r.corrige_manuellement).length }} en attente
                </span>
              </div>

              <div v-if="loadingCorrections" class="p-12 text-center">
                <div class="inline-block animate-spin rounded-full h-6 w-6 border-2 border-[#4a7c5e] border-t-transparent"/>
              </div>

              <div v-else class="divide-y divide-[#e2ddd4]">
                <div v-for="r in reponsesACorreger" :key="r.id" class="p-4">
                  <div class="flex justify-between items-start gap-4 mb-2">
                    <div>
                      <p class="text-sm font-body font-semibold text-[#1e3a2f]">{{ r.etudiant.prenom }} {{ r.etudiant.nom }}</p>
                      <p class="text-xs font-body text-[#9b9589]">{{ r.question_texte }}</p>
                    </div>
                    <span
                      class="shrink-0 text-xs font-body px-2 py-0.5 rounded-full"
                      :class="r.corrige_manuellement ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'"
                    >{{ r.corrige_manuellement ? 'Corrigée' : 'En attente' }}</span>
                  </div>

                  <div v-if="r.question_type === 'texte_libre'" class="bg-[#f5f0e8]/40 rounded-lg p-3 text-sm font-body text-gray-700 mb-2">
                    {{ r.reponse_texte || '(réponse vide)' }}
                  </div>
                  <div v-else-if="r.question_type === 'fichier'" class="mb-2">
                    <a v-if="r.reponse_fichier" :href="fichierUrl(r.reponse_fichier)" target="_blank" class="text-sm font-body text-primary underline">
                      Voir le fichier envoyé
                    </a>
                    <span v-else class="text-sm font-body text-gray-400">(aucun fichier envoyé)</span>
                  </div>

                  <p v-if="r.reponse_indicative" class="text-xs font-body text-[#9b9589] mb-2">Réponse indicative : {{ r.reponse_indicative }}</p>

                  <div class="flex items-center gap-2">
                    <input
                      v-model.number="notesSaisies[r.id]"
                      type="number" min="0" :max="r.points_max"
                      class="w-24 font-body px-3 py-2 text-sm text-gray-800 bg-input rounded-lg focus:outline-none"
                      :placeholder="`/ ${r.points_max}`"
                    />
                    <span class="text-xs text-[#9b9589]">/ {{ r.points_max }} pts</span>
                    <button
                      @click="validerCorrection(r)"
                      :disabled="correctionEnCours === r.id"
                      class="px-3 py-2 bg-[#4a7c5e] text-white text-xs font-body font-semibold rounded-lg hover:bg-[#1e3a2f] disabled:opacity-50"
                    >
                      {{ r.corrige_manuellement ? 'Modifier la note' : 'Valider' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

              <div class="space-y-6">
                <div class="bg-white shadow-[1px_1px_3px_1px_rgba(0,0,0,0.16)] rounded-lg overflow-hidden">
                  <div class="border-b border-[#e2ddd4] p-4 bg-[#f5f0e8]/30 flex items-center justify-between">
                    <h3 class="font-body text-lg font-bold text-[#1e3a2f]">Étudiants (participants)</h3>
                    <span v-if="qcm.status === 'active'" class="flex items-center gap-1.5 text-xs font-body text-green-700">
                      <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"/>
                      Temps réel
                    </span>
                  </div>
                  <div class="p-4">
                    <select
                      v-model="selectedEtudiantId"
                      @change="loadEtudiantReponses"
                      class="w-full font-body pl-4 pr-4 py-3 text-sm text-gray-800 bg-input rounded-xl focus:outline-none"
                    >
                      <option value="">-- Sélectionner un étudiant --</option>
                      <option v-for="p in participants" :key="p.id" :value="p.etudiant?.id">
                        {{ p.etudiant?.prenom }} {{ p.etudiant?.nom }}
                        — {{ p.score || 0 }}/{{ totalPoints }} pts
                        ({{ totalPoints ? ((p.score || 0) / totalPoints * 20).toFixed(1) : 0 }}/20)
                      </option>
                    </select>
                  </div>
                </div>

                <div class="bg-white shadow-[1px_1px_3px_1px_rgba(0,0,0,0.16)] rounded-lg overflow-hidden">
                  <div class="border-b border-[#e2ddd4] p-4 bg-[#f5f0e8]/30 flex justify-between items-center">
                    <h3 class="font-body text-lg font-bold text-[#1e3a2f]">Questions et réponses</h3>
                    <div v-if="selectedEtudiantId" class="flex gap-3 text-xs font-body">
                      <span class="flex items-center gap-1"><span class="w-3 h-3 rounded-full bg-primary inline-block"/> Correct</span>
                      <span class="flex items-center gap-1"><span class="w-3 h-3 rounded-full bg-red-500 inline-block"/> Incorrect</span>
                      <span class="flex items-center gap-1"><span class="w-3 h-3 rounded-full bg-green-100 border border-green-400 inline-block"/> Manquée</span>
                    </div>
                  </div>
                  <div v-if="selectedEtudiantId && nbChangementsOngletSelection > 0" class="px-4 py-2 bg-amber-50 border-b border-amber-100 text-xs font-body text-amber-700 flex items-center gap-1.5">
                    <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                    {{ nbChangementsOngletSelection }} changement{{ nbChangementsOngletSelection > 1 ? 's' : '' }} d'onglet/plein écran détecté{{ nbChangementsOngletSelection > 1 ? 's' : '' }} pendant cette session
                  </div>

                  <div v-if="loadingReponses" class="p-12 text-center">
                    <div class="inline-block animate-spin rounded-full h-6 w-6 border-2 border-[#4a7c5e] border-t-transparent"/>
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
                          <span class="w-6 h-6 rounded-full bg-[#4a7c5e]/10 flex items-center justify-center text-xs font-bold shrink-0">{{ idx + 1 }}</span>
                          <span class="font-medium font-body text-sm">{{ question.texte }}</span>
                        </div>
                        <span class="flex items-center gap-1.5 shrink-0 ml-2">
                          <span
                            v-if="etudiantReponses[question.id]?.reponse_rapide_suspecte"
                            class="text-amber-600" title="Réponse anormalement rapide"
                          >
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                          </span>
                          <span
                            class="text-xs font-body px-2 py-0.5 rounded-full"
                            :class="getReponseStatus(question.id, null) === 'question_correct' ? 'bg-green-100 text-green-700' : etudiantReponses[question.id] ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'"
                          >{{ getQuestionResult(question.id) }}</span>
                        </span>
                      </div>
                      <div class="ml-8">
                        <div v-if="question.type !== 'vrai_faux'" class="flex flex-wrap gap-2">
                          <div
                            v-for="(opt, optIdx) in question.options" :key="optIdx"
                            class="px-3 py-1.5 rounded-full text-sm font-body transition-all"
                            :class="getReponseStyle(question.id, optIdx)"
                          >
                            {{ opt }}
                            <span v-if="getReponseStatus(question.id, optIdx) === 'correct'" class="ml-1 font-bold">✓</span>
                            <span v-if="getReponseStatus(question.id, optIdx) === 'incorrect'" class="ml-1 font-bold">✗</span>
                            <span v-if="getReponseStatus(question.id, optIdx) === 'missed'" class="ml-1 text-green-700 text-xs font-normal">(attendu)</span>
                          </div>
                        </div>
                        <div v-else class="flex gap-3">
                          <div
                            v-for="(item) in [{label:'Vrai',val:0},{label:'Faux',val:1}]" :key="item.val"
                            class="px-4 py-2 font-body rounded-full text-sm"
                            :class="getVraiFauxReponseStyle(question.id, item.val)"
                          >
                            {{ item.label }}
                            <span v-if="getReponseStatus(question.id, item.val) === 'correct'" class="ml-1 font-bold">✓</span>
                            <span v-if="getReponseStatus(question.id, item.val) === 'incorrect'" class="ml-1 font-bold">✗</span>
                            <span v-if="getReponseStatus(question.id, item.val) === 'missed'" class="ml-1 text-xs font-normal">(attendu)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Colonne droite -->
              <div class="bg-white shadow-[1px_1px_3px_1px_rgba(0,0,0,0.16)] rounded-lg overflow-hidden">
                <div class="border-b border-[#e2ddd4] p-4 bg-[#f5f0e8]/30 flex items-center justify-between">
                  <h3 class="font-body text-lg font-bold text-[#1e3a2f]">
                    Résultats
                    <span class="ml-2 text-xs font-normal text-gray-400">({{ participants.length }} participant{{ participants.length > 1 ? 's' : '' }})</span>
                  </h3>
                  <transition name="fade">
                    <span v-if="newSubmissionFlash" class="text-xs font-body text-green-700 flex items-center gap-1">
                      <span class="w-2 h-2 rounded-full bg-green-500 inline-block"/>
                      Mis à jour
                    </span>
                  </transition>
                </div>

                <div v-if="loadingParticipants" class="p-12 text-center">
                  <div class="inline-block animate-spin rounded-full h-6 w-6 border-2 border-[#4a7c5e] border-t-transparent"/>
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
                        <th class="px-4 font-body py-3 text-center text-xs font-semibold text-[#1e3a2f]">Score</th>
                        <th class="px-4 font-body py-3 text-center text-xs font-semibold text-[#1e3a2f]">Actions</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-[#e2ddd4]">
                      <tr
                        v-for="p in participants" :key="p.id"
                        class="hover:bg-[#f5f0e8]/30 cursor-pointer transition-all duration-300"
                        :class="[
                          selectedEtudiantId === p.etudiant?.id ? 'bg-[#f5f0e8]/50' : '',
                          recentlyUpdated.has(p.etudiant?.id) ? 'bg-green-50' : ''
                        ]"
                        @click="selectedEtudiantId = p.etudiant?.id; loadEtudiantReponses()"
                      >
                        <td class="px-4 py-3">
                          <div class="flex items-center gap-1.5">
                            <p class="font-medium font-body text-[#1e3a2f] text-sm">{{ p.etudiant?.prenom }} {{ p.etudiant?.nom }}</p>
                            <span
                              v-if="p.triche?.suspect"
                              class="shrink-0 text-amber-600"
                              :title="`Suspicion de triche : ${p.triche.nb_changements_onglet} changement(s) d'onglet, ${p.triche.nb_reponses_rapides} réponse(s) anormalement rapide(s)`"
                            >
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                            </span>
                          </div>
                          <p class="text-xs font-body text-[#9b9589]">{{ p.etudiant?.email }}</p>
                        </td>
                        <td class="px-4 py-3 text-center">
                          <span class="font-semibold text-[#1e3a2f] font-body text-sm">{{ p.score || 0 }}/{{ totalPoints }}</span>
                        </td>
                        <td class="px-4 py-3 text-center">
                          <button
                            @click.stop="viewEtudiantDetails(p.etudiant?.id)"
                            class="text-primary font-bold font-body hover:bg-gray-400 bg-gray-300 px-3 py-1.5 rounded-lg text-xs"
                          >
                            Voir détails
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </template>

          <!-- Zone PDF cachée -->
          <div id="pdf-content" class="fixed -left-[9999px] top-0 bg-white" style="width: 794px; font-family: Arial, sans-serif;">
            <div style="padding: 40px;">
              <div style="border-bottom: 3px solid #054348; padding-bottom: 20px; margin-bottom: 24px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <div>
                    <h1 style="font-size: 22px; font-weight: 800; color: #054348; margin: 0 0 6px 0;">{{ qcm.titre }}</h1>
                    <p style="font-size: 13px; color: #666; margin: 0;">Filière : <strong>{{ qcm.filiere?.nom || '—' }}</strong> &nbsp;|&nbsp; Classe : <strong>{{ qcm.classe?.nom || '—' }}</strong></p>
                    <p style="font-size: 13px; color: #666; margin: 4px 0 0 0;">Thème : {{ qcm.theme || 'Non défini' }} &nbsp;|&nbsp; Durée : {{ qcm.duree }} min</p>
                  </div>
                  <div style="text-align: right;">
                    <div style="background: #054348; color: white; padding: 6px 14px; border-radius: 8px; font-size: 13px; font-weight: 600;">Session terminée</div>
                    <p style="font-size: 11px; color: #999; margin: 6px 0 0 0;">{{ formatDate(qcm.date_debut) }}</p>
                  </div>
                </div>
              </div>
              <div style="display: flex; gap: 16px; margin-bottom: 28px;">
                <div style="flex: 1; background: #f0fdf4; border: 1px solid #86efac; border-radius: 10px; padding: 14px; text-align: center;">
                  <div style="font-size: 24px; font-weight: 800; color: #16a34a;">{{ participants.length }}</div>
                  <div style="font-size: 11px; color: #666; margin-top: 2px;">Participants</div>
                </div>
                <div style="flex: 1; background: #eff6ff; border: 1px solid #93c5fd; border-radius: 10px; padding: 14px; text-align: center;">
                  <div style="font-size: 24px; font-weight: 800; color: #2563eb;">{{ totalPoints }} pts</div>
                  <div style="font-size: 11px; color: #666; margin-top: 2px;">Total points</div>
                </div>
                <div style="flex: 1; background: #fefce8; border: 1px solid #fde047; border-radius: 10px; padding: 14px; text-align: center;">
                  <div style="font-size: 24px; font-weight: 800; color: #ca8a04;">{{ moyenneSur20 }}/20</div>
                  <div style="font-size: 11px; color: #666; margin-top: 2px;">Moyenne</div>
                </div>
                <div style="flex: 1; background: #fdf4ff; border: 1px solid #e879f9; border-radius: 10px; padding: 14px; text-align: center;">
                  <div style="font-size: 24px; font-weight: 800; color: #a21caf;">{{ tauxReussite }}%</div>
                  <div style="font-size: 11px; color: #666; margin-top: 2px;">Taux réussite</div>
                </div>
              </div>
              <h2 style="font-size: 15px; font-weight: 700; color: #1e3a2f; margin: 0 0 12px 0; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb;">Résultats par étudiant</h2>
              <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <thead>
                  <tr style="background: #054348; color: white;">
                    <th style="padding: 10px 12px; text-align: left;">#</th>
                    <th style="padding: 10px 12px; text-align: left;">Étudiant</th>
                    <th style="padding: 10px 12px; text-align: left;">Email</th>
                    <th style="padding: 10px 12px; text-align: center;">Score</th>
                    <th style="padding: 10px 12px; text-align: center;">Note /20</th>
                    <th style="padding: 10px 12px; text-align: center;">Résultat</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(p, idx) in participantsSorted" :key="p.id" :style="{ background: idx % 2 === 0 ? '#ffffff' : '#f9fafb' }">
                    <td style="padding: 9px 12px; color: #6b7280; font-weight: 600;">{{ idx + 1 }}</td>
                    <td style="padding: 9px 12px; font-weight: 600; color: #111827;">{{ p.etudiant?.prenom }} {{ p.etudiant?.nom }}</td>
                    <td style="padding: 9px 12px; color: #6b7280;">{{ p.etudiant?.email }}</td>
                    <td style="padding: 9px 12px; text-align: center; font-weight: 700; color: #054348;">{{ p.score || 0 }}/{{ totalPoints }}</td>
                    <td style="padding: 9px 12px; text-align: center; font-weight: 700;" :style="{ color: getNoteColor(p.score) }">{{ totalPoints ? ((p.score || 0) / totalPoints * 20).toFixed(2) : '0.00' }}/20</td>
                    <td style="padding: 9px 12px; text-align: center;">
                      <span :style="{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', background: getNoteBackground(p.score), color: getNoteColorText(p.score) }">{{ getNoteLabel(p.score) }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between;">
                <p style="font-size: 11px; color: #9ca3af; margin: 0;">Généré par Mentora — {{ new Date().toLocaleString('fr-FR') }}</p>
                <p style="font-size: 11px; color: #9ca3af; margin: 0;">mentora.foulisa.com</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </TeacherLayout>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTeacher } from '../../../../../composables/useTeacher'
import { useToast } from '../../../../../composables/useToast'
import { useWebSocket } from '../../../../../composables/useWebSocket'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

const route  = useRoute()
const router = useRouter()
const { getQCMDetails, startSession, endSession, generateQRCode, generateNewCode, getParticipants, getEtudiantReponses, getReponsesACorreger, corrigerReponse } = useTeacher()
const { getSocket } = useWebSocket()
const toast = useToast()
const config = useRuntimeConfig()

const loading             = ref(true)
const loadingParticipants = ref(false)
const loadingReponses     = ref(false)
const generatingPDF       = ref(false)
const togglingResultats   = ref(false)
const qcm                 = ref({})
const participants        = ref([])
const selectedEtudiantId  = ref('')
const etudiantReponses    = ref({})
const nbChangementsOngletSelection = ref(0)
const newSubmissionFlash  = ref(false)
const recentlyUpdated     = ref(new Set())
let participantsPollInterval = null

// ─── Correction manuelle (texte_libre / fichier) ──────────────────────────────
const loadingCorrections  = ref(false)
const reponsesACorreger   = ref([])
const notesSaisies        = ref({})
const correctionEnCours   = ref(null)

// ─── Computed ─────────────────────────────────────────────────────────────────
const totalPoints = computed(() => qcm.value.questions?.reduce((sum, q) => sum + q.points, 0) || 0)

const participantsSorted = computed(() => [...participants.value].sort((a, b) => (b.score || 0) - (a.score || 0)))

const moyenneScore = computed(() => {
  const scores = participants.value.filter(p => p.score !== null).map(p => p.score || 0)
  if (!scores.length) return 0
  return scores.reduce((a, b) => a + b, 0) / scores.length
})

const moyenneSur20 = computed(() => {
  if (!totalPoints.value) return '0.0'
  return ((moyenneScore.value / totalPoints.value) * 20).toFixed(1)
})

const tauxReussite = computed(() => {
  const termines = participants.value.filter(p => p.statut === 'termine')
  if (!termines.length) return 0
  const reussis = termines.filter(p => totalPoints.value > 0 && (p.score || 0) / totalPoints.value >= 0.5)
  return Math.round((reussis.length / termines.length) * 100)
})

// ─── Toggle notes ─────────────────────────────────────────────────────────────
const toggleResultats = async () => {
  togglingResultats.value = true
  try {
    const config = useRuntimeConfig()
    const token  = useCookie('auth_token').value
    const result = await $fetch(`${config.public.apiBase}/teacher/sessions/${qcm.value.id}/toggle-resultats`, {
      method:  'PATCH',
      headers: { Authorization: `Bearer ${token}` }
    })
    if (result.success) {
      qcm.value.resultatsVisibles = result.data.resultatsVisibles
      toast.success(result.data.resultatsVisibles
        ? '✅ Notes maintenant visibles pour les étudiants'
        : '🔒 Notes masquées'
      )
    }
  } catch {
    toast.error('Erreur lors du changement de visibilité')
  } finally {
    togglingResultats.value = false
  }
}

// ─── PDF ──────────────────────────────────────────────────────────────────────
const getNoteColor      = (score) => { if (!totalPoints.value || !score) return '#ef4444'; const n = (score / totalPoints.value) * 20; if (n >= 16) return '#16a34a'; if (n >= 12) return '#2563eb'; if (n >= 10) return '#ca8a04'; return '#ef4444' }
const getNoteBackground = (score) => { if (!totalPoints.value || !score) return '#fee2e2'; const n = (score / totalPoints.value) * 20; if (n >= 16) return '#dcfce7'; if (n >= 12) return '#dbeafe'; if (n >= 10) return '#fef9c3'; return '#fee2e2' }
const getNoteColorText  = (score) => { if (!totalPoints.value || !score) return '#dc2626'; const n = (score / totalPoints.value) * 20; if (n >= 16) return '#15803d'; if (n >= 12) return '#1d4ed8'; if (n >= 10) return '#b45309'; return '#dc2626' }
const getNoteLabel      = (score) => { if (!totalPoints.value || !score) return 'Insuffisant'; const n = (score / totalPoints.value) * 20; if (n >= 16) return 'Très bien'; if (n >= 14) return 'Bien'; if (n >= 12) return 'Assez bien'; if (n >= 10) return 'Passable'; return 'Insuffisant' }

const imprimerPDF = async () => {
  generatingPDF.value = true
  try {
    await nextTick()
    const element = document.getElementById('pdf-content')
    if (!element) { toast.error('Zone PDF introuvable'); return }
    const canvas = await html2canvas(element, { scale: 2, useCORS: true, allowTaint: true, backgroundColor: '#ffffff', logging: false })
    const imgData = canvas.toDataURL('image/png')
    const pdf     = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pdfW    = pdf.internal.pageSize.getWidth()
    const pdfH    = pdf.internal.pageSize.getHeight()
    const imgH    = pdfW / (canvas.width / canvas.height)
    if (imgH <= pdfH) {
      pdf.addImage(imgData, 'PNG', 0, 0, pdfW, imgH)
    } else {
      let rem = imgH
      while (rem > 0) {
        pdf.addImage(imgData, 'PNG', 0, -(imgH - rem), pdfW, imgH)
        rem -= pdfH
        if (rem > 0) pdf.addPage()
      }
    }
    pdf.save(`resultats_${qcm.value.titre?.replace(/\s/g, '_') || 'session'}_${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.pdf`)
    toast.success('PDF téléchargé !')
  } catch (err) {
    console.error(err)
    toast.error('Erreur lors de la génération du PDF')
  } finally {
    generatingPDF.value = false
  }
}

// ─── WebSocket ────────────────────────────────────────────────────────────────
const joinSessionRoom = () => {
  const socket = getSocket()
  if (socket && qcm.value.id) socket.emit('join-session-room', qcm.value.id)
}

const listenStudentSubmissions = () => {
  const socket = getSocket()
  if (!socket) return
  socket.off('student-submitted')
  socket.on('student-submitted', (data) => {
    const idx = participants.value.findIndex(p => p.etudiant?.id === data.etudiant.id)
    if (idx !== -1) {
      participants.value[idx] = { ...participants.value[idx], score: data.score, statut: data.statut, date_completed: data.date_completed }
    } else {
      participants.value.push({ id: Date.now(), etudiant: data.etudiant, score: data.score, statut: data.statut, date_completed: data.date_completed })
    }
    participants.value.sort((a, b) => (b.score || 0) - (a.score || 0))
    recentlyUpdated.value.add(data.etudiant.id)
    setTimeout(() => recentlyUpdated.value.delete(data.etudiant.id), 2000)
    newSubmissionFlash.value = true
    setTimeout(() => { newSubmissionFlash.value = false }, 3000)
    if (selectedEtudiantId.value === data.etudiant.id) loadEtudiantReponses()
    window.dispatchEvent(new CustomEvent('student-submitted-notif', { detail: data }))
  })
}

// ─── Styles réponses ──────────────────────────────────────────────────────────
const getReponseStyle = (questionId, optIndex) => {
  const reponse  = etudiantReponses.value[questionId]
  const question = qcm.value.questions?.find(q => q.id === questionId)
  if (!question) return 'bg-gray-200 text-gray-700'
  const isCorrect  = question.reponses_correctes?.includes(optIndex)
  const isSelected = reponse?.reponse_ids?.includes(optIndex)
  if (isSelected && isCorrect)  return 'bg-primary text-white font-semibold'
  if (isSelected && !isCorrect) return 'bg-red-500 text-white font-semibold'
  if (!isSelected && isCorrect) return 'bg-green-100 text-green-800 border border-green-400'
  return 'bg-gray-200 text-gray-700'
}

const getReponseStatus = (questionId, optIndex) => {
  if (optIndex === null) {
    const reponse  = etudiantReponses.value[questionId]
    const question = qcm.value.questions?.find(q => q.id === questionId)
    if (!reponse || !question) return null
    const ok = JSON.stringify([...reponse.reponse_ids].sort()) === JSON.stringify([...question.reponses_correctes].sort())
    return ok ? 'question_correct' : 'question_incorrect'
  }
  const reponse  = etudiantReponses.value[questionId]
  const question = qcm.value.questions?.find(q => q.id === questionId)
  const isSelected = reponse?.reponse_ids?.includes(optIndex)
  const isCorrect  = question?.reponses_correctes?.includes(optIndex)
  if (isSelected && isCorrect)  return 'correct'
  if (isSelected && !isCorrect) return 'incorrect'
  if (!isSelected && isCorrect) return 'missed'
  return null
}

const getVraiFauxReponseStyle = (questionId, value) => {
  const reponse  = etudiantReponses.value[questionId]
  const question = qcm.value.questions?.find(q => q.id === questionId)
  if (!question) return 'bg-gray-100 text-gray-700'
  const isCorrect  = question.reponses_correctes?.includes(value)
  const isSelected = reponse?.reponse_ids?.includes(value)
  if (isSelected && isCorrect)  return 'bg-primary text-white font-semibold'
  if (isSelected && !isCorrect) return 'bg-red-500 text-white font-semibold'
  if (!isSelected && isCorrect) return 'bg-green-100 text-green-800 border border-green-400'
  return 'bg-gray-100 text-gray-700'
}

const getQuestionResult = (questionId) => {
  const reponse  = etudiantReponses.value[questionId]
  const question = qcm.value.questions?.find(q => q.id === questionId)
  if (!reponse || !question) return 'Non répondu'
  const ok = JSON.stringify([...reponse.reponse_ids].sort()) === JSON.stringify([...question.reponses_correctes].sort())
  return ok ? `+${question.points} pts` : '0 pt'
}

// ─── Utils ────────────────────────────────────────────────────────────────────
const getTypeLabel   = (type)   => ({ qcm: 'QCM simple', qcm_multiple: 'QCM multiple', vrai_faux: 'Vrai / Faux', texte_libre: 'Texte libre', appariement: 'Appariement', fichier: 'Fichier' })[type] || type
const getStatusText  = (status) => ({ pending: 'Programmé', active: 'En cours', completed: 'Terminé', draft: 'Brouillon' })[status] || status
const getStatusClass = (status) => ({ pending: 'bg-yellow-200 text-yellow-800', active: 'bg-green-200 text-green-800', completed: 'bg-gray-200 text-gray-800', draft: 'bg-blue-100 text-blue-800' })[status] || 'bg-gray-200 text-gray-800'
const formatDate     = (date)   => date ? new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : ''
const formatDateTime = (date)   => date ? new Date(date).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''

// ─── Actions ──────────────────────────────────────────────────────────────────
const copyCode            = async () => { try { await navigator.clipboard.writeText(qcm.value.code); toast.success('Code copié') } catch { toast.error('Erreur') } }
const regenerateQR        = async () => { const r = await generateQRCode(qcm.value.id); if (r.success) { qcm.value.qr_code = r.data.qr_code; toast.success('QR régénéré') } else toast.error(r.message) }
const regenerateCode      = async () => { const r = await generateNewCode(qcm.value.id); if (r.success) { qcm.value.code = r.data.code; toast.success('Nouveau code'); await regenerateQR() } else toast.error(r.message) }
const startSessionHandler = async () => { const r = await startSession(qcm.value.id); if (r.success) { toast.success('Session démarrée !'); await loadQCMDetails() } else toast.error(r.message) }
const endSessionHandler   = async () => { const r = await endSession(qcm.value.id);   if (r.success) { toast.success('Session terminée !'); await loadQCMDetails() } else toast.error(r.message) }
const viewEtudiantDetails = (id) => { selectedEtudiantId.value = id; loadEtudiantReponses() }

const loadEtudiantReponses = async () => {
  if (!selectedEtudiantId.value) return
  loadingReponses.value = true
  try {
    const result = await getEtudiantReponses(qcm.value.id, selectedEtudiantId.value)
    if (result.success) {
      const arr = result.data?.reponses || result.data || []
      const map = {}
      if (Array.isArray(arr)) arr.forEach(r => { map[r.question_id] = r })
      etudiantReponses.value = map
      nbChangementsOngletSelection.value = result.data?.nb_changements_onglet || 0
    } else {
      toast.error(result.message || 'Erreur chargement réponses')
    }
  } catch { toast.error('Erreur') } finally { loadingReponses.value = false }
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
  if (result.success) {
    qcm.value = result.data
    await loadParticipants()
    if (qcm.value.status === 'completed') await chargerCorrections()
    await nextTick()
    const socket = getSocket()
    if (socket?.connected) { joinSessionRoom(); listenStudentSubmissions() }
    else setTimeout(() => { joinSessionRoom(); listenStudentSubmissions() }, 1500)
    demarrerPollingParticipants()
  } else {
    toast.error('Erreur de chargement')
    router.back()
  }
  loading.value = false
}

// ─── Rafraîchissement périodique des participants ─────────────────────────────
// Le socket 'student-submitted' ne met à jour que score/statut à la soumission
// finale ; les infos de détection de triche (changements d'onglet, réponses
// suspectes) ne sont recalculées que côté backend à chaque appel getParticipants.
// Sans ce polling, le badge de suspicion ne s'afficherait jamais tant que le
// professeur n'a pas rechargé la page manuellement pendant une session active.
const demarrerPollingParticipants = () => {
  if (participantsPollInterval) clearInterval(participantsPollInterval)
  if (qcm.value.status !== 'active') return
  participantsPollInterval = setInterval(() => {
    if (qcm.value.status !== 'active') {
      clearInterval(participantsPollInterval)
      participantsPollInterval = null
      return
    }
    loadParticipants()
  }, 15000)
}

// ─── Correction manuelle (texte_libre / fichier) ──────────────────────────────
const fichierUrl = (path) => path ? `${config.public.apiBase.replace(/\/api$/, '')}${path}` : ''

const chargerCorrections = async () => {
  loadingCorrections.value = true
  try {
    const result = await getReponsesACorreger(qcm.value.id)
    if (result.success) {
      reponsesACorreger.value = result.data || []
      reponsesACorreger.value.forEach(r => {
        notesSaisies.value[r.id] = r.note_manuelle ?? 0
      })
    } else {
      toast.error(result.message || 'Erreur chargement des réponses à corriger')
    }
  } catch {
    toast.error('Erreur chargement des réponses à corriger')
  } finally {
    loadingCorrections.value = false
  }
}

const validerCorrection = async (r) => {
  const points = Number(notesSaisies.value[r.id])
  if (isNaN(points) || points < 0) { toast.error('Note invalide'); return }
  correctionEnCours.value = r.id
  try {
    const result = await corrigerReponse(r.id, points)
    if (result.success) {
      toast.success('Correction enregistrée')
      await chargerCorrections()
      await loadParticipants()
    } else {
      toast.error(result.message || 'Erreur lors de la correction')
    }
  } catch {
    toast.error('Erreur lors de la correction')
  } finally {
    correctionEnCours.value = null
  }
}

onMounted(() => loadQCMDetails())

onUnmounted(() => {
  const socket = getSocket()
  if (socket) { socket.emit('leave-session-room', qcm.value.id); socket.off('student-submitted') }
  if (participantsPollInterval) { clearInterval(participantsPollInterval); participantsPollInterval = null }
})
</script>

<style scoped>
.border { transition: all 0.2s ease; }
.border-b { transition: all 0.2s ease; }
.fade-enter-active { transition: opacity 0.3s ease; }
.fade-leave-active { transition: opacity 0.5s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>