<template>
  <div class="bg-[#f5f0e8] font-body min-h-screen">
    <AdminLayout>
      <div class="max-w-3xl mx-auto py-3">

        <!-- En-tête -->
        <div class="mb-8">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="font-body text-2xl font-extrabold text-[#1e3a2f]">
                Créer une session (cas d'urgence)
              </h2>
              <p class="text-xs text-[#9b9589] mt-1">
                À utiliser quand un professeur est absent ou indisponible : la session sera créée en son nom.
              </p>
            </div>
            <button
              @click="$router.back()"
              class="text-[#4a7c5e] bg-gray-200 hover:bg-gray-300 font-body font-bold px-4 py-2 rounded-lg hover:text-[#1e3a2f] transition-colors shrink-0"
            >
              ← Retour
            </button>
          </div>
        </div>

        <form @submit.prevent="submitQCM" class="space-y-6">

          <!-- INFORMATIONS GÉNÉRALES -->
          <div class="bg-white font-body shadow-[1px_1px_7px_1px_rgba(0,0,0,0.16)] overflow-hidden rounded-lg">
            <div class="border-b border-[#e2ddd4] p-4 bg-[#f5f0e8]/30">
              <h3 class="font-body text-lg font-bold text-[#1e3a2f]">Informations générales</h3>
            </div>
            <div class="p-3 md:p-6 space-y-4">
              <div>
                <label class="block text-sm font-semibold text-[#1e3a2f] mb-2">Titre <span class="text-red-500">*</span></label>
                <input
                  v-model="form.titre"
                  type="text"
                  class="w-full font-body pl-4 pr-4 py-3 text-md text-gray-900 placeholder-gray-600 bg-input rounded-xl focus:outline-none"
                  placeholder="Ex: Examen JavaScript"
                  required
                />
              </div>
              <div>
                <label class="block text-sm font-semibold text-[#1e3a2f] mb-2">Thème</label>
                <input
                  v-model="form.theme"
                  type="text"
                  class="w-full font-body pl-4 pr-4 py-3 text-md text-gray-800 placeholder-gray-600 bg-input rounded-xl focus:outline-none"
                  placeholder="Ex: JavaScript Fondamentaux"
                />
              </div>
              <div>
                <label class="block text-sm font-semibold text-[#1e3a2f] mb-2">Description</label>
                <textarea
                  v-model="form.description"
                  rows="3"
                  class="w-full font-body pl-4 pr-4 py-3 text-md text-gray-800 placeholder-gray-600 bg-input rounded-xl focus:outline-none resize-none"
                  placeholder="Décrivez l'objectif de cette évaluation..."
                />
              </div>
            </div>
          </div>

          <!-- GÉNÉRATION IA (plan Pro uniquement) -->
          <div v-if="iaDisponible" class="bg-white shadow-[1px_1px_7px_1px_rgba(0,0,0,0.16)] overflow-hidden rounded-lg">
            <div class="border-b border-[#e2ddd4] p-4 bg-[#f5f0e8]/30 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 class="font-body text-lg font-bold text-[#1e3a2f]">Génération par IA</h3>
                <p class="text-xs text-[#9b9589] mt-0.5">Basée sur le titre, thème et description saisis</p>
              </div>
              <div class="flex items-center gap-3">
                <div class="flex items-center gap-2">
                  <label class="text-xs font-body text-gray-600 whitespace-nowrap">Nb questions</label>
                  <select
                    v-model="nombreQuestionsAI"
                    class="font-body px-2 py-1.5 text-sm text-gray-800 bg-input rounded-lg focus:outline-none"
                  >
                    <option v-for="n in [3, 5, 8, 10, 15]" :key="n" :value="n">{{ n }}</option>
                  </select>
                </div>
                <button
                  type="button"
                  @click="generateWithAI"
                  :disabled="loadingAI || !form.titre"
                  class="flex items-center gap-2 px-4 py-2 bg-[#1e3a2f] text-white text-sm font-semibold rounded-lg hover:bg-[#4a7c5e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div v-if="loadingAI" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  </svg>
                  {{ loadingAI ? 'Génération...' : 'Générer avec l\'IA' }}
                </button>
              </div>
            </div>
            <div class="px-4 py-3 bg-[#f5f0e8]/10">
              <div class="flex flex-wrap gap-4 text-xs font-body text-gray-500">
                <span><strong class="text-gray-700">Titre :</strong> {{ form.titre || '—' }}</span>
                <span><strong class="text-gray-700">Thème :</strong> {{ form.theme || '—' }}</span>
              </div>
              <p v-if="!form.titre" class="text-xs text-orange-500 mt-1">
                Saisissez au moins un titre pour activer la génération
              </p>
            </div>
          </div>
          <div v-else class="bg-white shadow-[1px_1px_7px_1px_rgba(0,0,0,0.16)] overflow-hidden rounded-lg p-4 flex items-center justify-between gap-3">
            <p class="text-xs font-body text-[#9b9589]">
              La génération de questions par IA est réservée au plan <strong class="text-[#1e3a2f]">Pro</strong>.
            </p>
            <NuxtLink to="/directeurs/abonnement" class="text-xs font-semibold text-[#4a7c5e] hover:text-[#1e3a2f] whitespace-nowrap">
              Voir les plans →
            </NuxtLink>
          </div>

          <!-- PLANIFICATION -->
          <div class="bg-white shadow-[1px_1px_7px_1px_rgba(0,0,0,0.16)] overflow-hidden rounded-lg">
            <div class="border-b border-[#e2ddd4] p-4 bg-[#f5f0e8]/30">
              <h3 class="font-body text-lg font-bold text-[#1e3a2f]">Planification</h3>
            </div>
            <div class="p-3 md:p-6">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-[#1e3a2f] mb-2">Date et heure de début <span class="text-red-500">*</span></label>
                  <input
                    ref="dateDebutInput"
                    type="text"
                    class="w-full font-body pl-4 pr-4 py-3 text-sm text-gray-800 placeholder-gray-600 bg-input rounded-xl focus:outline-none cursor-pointer"
                    placeholder="Sélectionner la date et l'heure"
                    readonly
                  />
                  <p class="text-xs text-[#9b9589] mt-1">{{ formattedDateDebut }}</p>
                </div>
                <div>
                  <label class="block text-sm font-semibold text-[#1e3a2f] mb-2">Date et heure de fin <span class="text-red-500">*</span></label>
                  <input
                    ref="dateFinInput"
                    type="text"
                    class="w-full font-body pl-4 pr-4 py-3 text-sm text-gray-800 placeholder-gray-600 bg-input rounded-xl focus:outline-none cursor-pointer"
                    placeholder="Sélectionner la date et l'heure"
                    readonly
                  />
                  <p class="text-xs text-[#9b9589] mt-1">{{ formattedDateFin }}</p>
                </div>
                <div>
                  <label class="block text-sm font-semibold text-[#1e3a2f] mb-2">Durée (minutes)</label>
                  <input
                    v-model.number="form.duree"
                    type="number"
                    disabled
                    class="w-full font-body pl-4 pr-4 py-3 text-sm text-gray-800 bg-gray-100 rounded-xl cursor-not-allowed opacity-75"
                  />
                  <p class="text-xs text-[#9b9589] mt-1">Calculée automatiquement</p>
                </div>
              </div>
            </div>
          </div>

          <!-- CIBLE -->
          <div class="bg-white shadow-[1px_1px_7px_1px_rgba(0,0,0,0.16)] overflow-hidden rounded-lg">
            <div class="border-b border-[#e2ddd4] p-4 bg-[#f5f0e8]/30">
              <h3 class="font-body text-lg font-bold text-[#1e3a2f]">Professeur & cible de la session</h3>
            </div>
            <div class="p-3 md:p-6 space-y-4">
              <div>
                <label class="block text-sm font-semibold text-[#1e3a2f] mb-2">Créer au nom de <span class="text-red-500">*</span></label>
                <select
                  v-model="form.professeur_id"
                  class="w-full font-body pl-4 pr-4 py-3 text-sm text-gray-800 bg-input rounded-xl focus:outline-none"
                  required
                >
                  <option value="">Sélectionner un professeur</option>
                  <option v-for="p in professeurs" :key="p.id" :value="p.id">
                    {{ p.prenom }} {{ p.nom }}{{ p.profil?.filiere ? ' — ' + p.profil.filiere : '' }}
                  </option>
                </select>
                <p class="text-xs text-[#9b9589] mt-1">La session apparaîtra dans l'espace de ce professeur, comme s'il l'avait créée lui-même</p>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-[#1e3a2f] mb-2">Filière <span class="text-red-500">*</span></label>
                  <select
                    v-model="form.filiere_id"
                    @change="onFiliereChange"
                    class="w-full font-body pl-4 pr-4 py-3 text-sm text-gray-800 bg-input rounded-xl focus:outline-none"
                    required
                  >
                    <option value="">Sélectionner une filière</option>
                    <option v-for="filiere in filieres" :key="filiere.id" :value="filiere.id">{{ filiere.nom }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-semibold text-[#1e3a2f] mb-2">Classe <span class="text-red-500">*</span></label>
                  <select
                    v-model="form.classe_id"
                    class="w-full font-body pl-4 pr-4 py-3 text-sm text-gray-800 bg-input rounded-xl focus:outline-none"
                    :disabled="!form.filiere_id"
                    required
                  >
                    <option value="">Sélectionner une classe</option>
                    <option v-for="classe in classes" :key="classe.id" :value="classe.id">{{ classe.nom }}</option>
                  </select>
                  <p class="text-xs text-[#9b9589] mt-1">Seuls les étudiants de cette classe pourront rejoindre</p>
                </div>
              </div>
            </div>
          </div>

          <!-- QUESTIONS -->
          <div class="bg-white shadow-[1px_1px_7px_1px_rgba(0,0,0,0.16)] overflow-hidden rounded-lg">
            <div class="border-b border-[#e2ddd4] p-4 bg-[#f5f0e8]/30 flex justify-between items-center">
              <div>
                <h3 class="font-body text-lg font-bold text-[#1e3a2f]">Questions</h3>
                <p v-if="form.questions.length > 0" class="text-xs text-[#9b9589] mt-0.5">
                  {{ form.questions.length }} question{{ form.questions.length > 1 ? 's' : '' }} —
                  {{ totalPointsForm }} pts au total
                </p>
              </div>
              <button
                type="button"
                @click="addQuestion"
                class="px-4 py-2 bg-[#4a7c5e] text-white text-sm font-semibold hover:bg-[#1e3a2f] transition-colors rounded-lg"
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
                <p class="text-sm mt-1">Cliquez sur "Ajouter une question" ou utilisez la génération IA</p>
              </div>

              <div v-else class="space-y-6">
                <div
                  v-for="(question, index) in form.questions"
                  :key="index"
                  class="overflow-hidden bg-[#f5f0e8]/20 rounded-lg border border-[#e2ddd4]"
                >
                  <div class="bg-[#f5f0e8]/50 p-4 flex justify-between items-center border-b border-[#e2ddd4]">
                    <div class="flex items-center gap-2">
                      <span class="w-7 h-7 rounded-full bg-[#4a7c5e]/10 flex items-center justify-center text-xs font-bold text-[#1e3a2f]">
                        {{ index + 1 }}
                      </span>
                      <h4 class="font-body font-bold text-[#1e3a2f]">Question {{ index + 1 }}</h4>
                      <span class="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-body">
                        {{ getTypeLabel(question.type) }}
                      </span>
                      <span v-if="question.generatedByAI" class="text-[10px] bg-[#1e3a2f]/10 text-[#1e3a2f] px-2 py-0.5 rounded-full font-body flex items-center gap-1">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                        </svg>
                        IA
                      </span>
                    </div>
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

                    <div v-if="question.explication" class="flex gap-2 bg-[#1e3a2f]/5 border border-[#1e3a2f]/10 rounded-lg px-3 py-2">
                      <svg class="w-4 h-4 text-[#4a7c5e] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      <p class="text-xs text-[#4a7c5e] font-body">{{ question.explication }}</p>
                    </div>

                    <div>
                      <label class="block text-sm font-semibold text-[#1e3a2f] mb-2">Texte de la question</label>
                      <textarea
                        v-model="question.texte"
                        rows="2"
                        class="w-full font-body pl-4 pr-4 py-3 text-sm text-gray-800 placeholder-gray-600 bg-input rounded-xl focus:outline-none"
                        placeholder="Ex: Qu'est-ce que JavaScript ?"
                      />
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <label class="block text-sm font-semibold text-[#1e3a2f] mb-2">Type</label>
                        <select
                          v-model="question.type"
                          @change="onTypeChange(index)"
                          class="w-full font-body pl-4 pr-4 py-3 text-sm text-gray-800 bg-input rounded-xl focus:outline-none"
                        >
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
                        <input
                          v-model.number="question.points"
                          type="number"
                          min="1"
                          class="w-full font-body pl-4 pr-4 py-3 text-sm text-gray-800 bg-input rounded-xl focus:outline-none"
                        />
                      </div>
                    </div>

                    <div v-if="!['vrai_faux', 'texte_libre', 'appariement', 'fichier'].includes(question.type)">
                      <label class="block text-sm font-semibold text-[#1e3a2f] mb-2">Options</label>
                      <div class="space-y-2">
                        <div
                          v-for="(opt, optIndex) in question.options"
                          :key="optIndex"
                          class="flex items-center gap-2"
                        >
                          <div class="shrink-0">
                            <input
                              v-if="question.type === 'qcm_multiple'"
                              type="checkbox"
                              :value="optIndex"
                              v-model="question.reponses_correctes"
                              class="w-4 h-4 accent-[#4a7c5e]"
                            />
                            <input
                              v-else
                              type="radio"
                              :name="`q${index}`"
                              :value="optIndex"
                              :checked="question.reponses_correctes[0] === optIndex"
                              @change="question.reponses_correctes = [optIndex]"
                              class="w-4 h-4 accent-[#4a7c5e]"
                            />
                          </div>
                          <input
                            v-model="question.options[optIndex]"
                            type="text"
                            class="flex-1 font-body pl-4 pr-4 py-2.5 text-sm text-gray-800 placeholder-gray-600 bg-input rounded-xl focus:outline-none"
                            :class="isOptionCorrect(question, optIndex) ? 'border border-green-400 bg-green-50' : ''"
                            :placeholder="`Option ${optIndex + 1}`"
                          />
                          <span v-if="isOptionCorrect(question, optIndex)" class="text-green-600 shrink-0">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                            </svg>
                          </span>
                          <button
                            type="button"
                            @click="removeOption(index, optIndex)"
                            class="text-red-400 hover:text-red-600 shrink-0"
                          >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                          </button>
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

                    <div v-if="question.type === 'vrai_faux'">
                      <label class="block text-sm font-semibold text-[#1e3a2f] mb-2">Réponse correcte</label>
                      <div class="flex gap-4">
                        <label class="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            :name="`vf${index}`"
                            :value="0"
                            :checked="question.reponses_correctes[0] === 0"
                            @change="question.reponses_correctes = [0]"
                            class="w-4 h-4 accent-[#4a7c5e]"
                          />
                          <span class="text-sm font-body" :class="question.reponses_correctes[0] === 0 ? 'text-green-700 font-semibold' : 'text-gray-700'">Vrai</span>
                        </label>
                        <label class="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            :name="`vf${index}`"
                            :value="1"
                            :checked="question.reponses_correctes[0] === 1"
                            @change="question.reponses_correctes = [1]"
                            class="w-4 h-4 accent-[#4a7c5e]"
                          />
                          <span class="text-sm font-body" :class="question.reponses_correctes[0] === 1 ? 'text-green-700 font-semibold' : 'text-gray-700'">Faux</span>
                        </label>
                      </div>
                    </div>

                    <div v-if="question.type === 'texte_libre'">
                      <label class="block text-sm font-semibold text-[#1e3a2f] mb-2">Réponse indicative (facultatif)</label>
                      <textarea
                        v-model="question.reponse_indicative"
                        rows="2"
                        class="w-full font-body pl-4 pr-4 py-3 text-sm text-gray-800 placeholder-gray-600 bg-input rounded-xl focus:outline-none"
                        placeholder="Ex: réponse attendue, pour vous aider lors de la correction"
                      />
                      <p class="text-xs text-[#9b9589] mt-1">
                        Cette question sera à corriger manuellement après la session (pas de note automatique).
                      </p>
                    </div>

                    <div v-if="question.type === 'appariement'">
                      <label class="block text-sm font-semibold text-[#1e3a2f] mb-2">Paires à apparier</label>
                      <div class="space-y-2">
                        <div
                          v-for="(_, pIndex) in question.appariement_gauche"
                          :key="pIndex"
                          class="flex items-center gap-2"
                        >
                          <input
                            v-model="question.appariement_gauche[pIndex]"
                            type="text"
                            class="flex-1 font-body pl-4 pr-4 py-2.5 text-sm text-gray-800 placeholder-gray-600 bg-input rounded-xl focus:outline-none"
                            :placeholder="`Terme ${pIndex + 1}`"
                          />
                          <svg class="w-4 h-4 text-[#9b9589] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                          </svg>
                          <input
                            v-model="question.appariement_droite[pIndex]"
                            type="text"
                            class="flex-1 font-body pl-4 pr-4 py-2.5 text-sm text-gray-800 placeholder-gray-600 bg-input rounded-xl focus:outline-none"
                            :placeholder="`Correspond à ${pIndex + 1}`"
                          />
                          <button
                            type="button"
                            @click="removePaire(index, pIndex)"
                            class="text-red-400 hover:text-red-600 shrink-0"
                          >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                          </button>
                        </div>
                        <button
                          type="button"
                          @click="addPaire(index)"
                          class="text-sm text-[#4a7c5e] hover:text-[#1e3a2f] transition-colors"
                        >
                          + Ajouter une paire
                        </button>
                      </div>
                      <p class="text-xs text-[#9b9589] mt-1">
                        L'étudiant devra associer chaque terme de gauche à sa correspondance (mélangée) à droite.
                      </p>
                    </div>

                    <div v-if="question.type === 'fichier'">
                      <p class="text-xs text-[#9b9589] bg-[#f5f0e8]/50 rounded-lg p-3">
                        L'étudiant devra téléverser un fichier (max 10 Mo) en réponse à cette question.
                        Cette question sera à corriger manuellement après la session (pas de note automatique).
                      </p>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Boutons -->
          <div class="flex justify-end gap-3 pt-4">
            <button
              type="button"
              @click="$router.back()"
              class="px-6 py-3 bg-red-500 font-body text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="px-6 py-3 bg-[#4a7c5e] text-white font-body rounded-xl text-sm font-semibold hover:bg-[#1e3a2f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <div v-if="loading" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              {{ loading ? 'Création en cours...' : 'Créer la session' }}
            </button>
          </div>

        </form>
      </div>
    </AdminLayout>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useAdmin } from '../../../composables/useAdmin'
import { useToast } from '../../../composables/useToast'
import flatpickr from 'flatpickr'
import 'flatpickr/dist/flatpickr.css'
import 'flatpickr/dist/themes/material_green.css'

const { getFilieres, getClasses, getUsers, getEcole, createSession } = useAdmin()
const toast = useToast()

const loading           = ref(false)
const loadingAI         = ref(false)
const filieres          = ref([])
const classes           = ref([])
const professeurs       = ref([])
const nombreQuestionsAI = ref(5)
// Génération IA réservée au plan Pro de l'école — masquée sinon
const iaDisponible = ref(false)

const dateDebutInput  = ref(null)
const dateFinInput    = ref(null)
let dateDebutPicker   = null
let dateFinPicker     = null

const formattedDateDebut = ref('')
const formattedDateFin   = ref('')

const form = ref({
  titre: '',
  description: '',
  theme: '',
  date_debut: '',
  date_fin: '',
  duree: 0,
  filiere_id: '',
  classe_id: '',
  professeur_id: '',
  questions: []
})

// ─── Computed ─────────────────────────────────────────────────────────────────

const totalPointsForm = computed(() =>
  form.value.questions.reduce((sum, q) => sum + (q.points || 0), 0)
)

// ─── Utils ────────────────────────────────────────────────────────────────────

const getTypeLabel = (type) => ({
  qcm: 'QCM', qcm_multiple: 'QCM multiple', vrai_faux: 'Vrai/Faux',
  texte_libre: 'Texte libre', appariement: 'Appariement', fichier: 'Fichier'
})[type] || type

const isOptionCorrect = (question, optIndex) => {
  if (question.type === 'qcm_multiple') {
    return question.reponses_correctes.includes(optIndex)
  }
  return question.reponses_correctes[0] === optIndex
}

const formatDateDisplay = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

const calculateDuration = () => {
  if (form.value.date_debut && form.value.date_fin) {
    const debut = new Date(form.value.date_debut)
    const fin   = new Date(form.value.date_fin)
    if (fin > debut) {
      form.value.duree = Math.round((fin - debut) / (1000 * 60))
    } else {
      form.value.duree = 0
    }
  }
}

watch(() => [form.value.date_debut, form.value.date_fin], calculateDuration)

// ─── Questions ────────────────────────────────────────────────────────────────

const addQuestion = () => {
  form.value.questions.push({
    texte: '',
    type: 'qcm',
    points: 1,
    options: ['', ''],
    reponses_correctes: [],
    reponse_indicative: '',
    appariement_gauche: ['', ''],
    appariement_droite: ['', ''],
    generatedByAI: false,
    explication: ''
  })
}

const removeQuestion = (index) => {
  form.value.questions.splice(index, 1)
}

const addOption = (questionIndex) => {
  form.value.questions[questionIndex].options.push('')
}

const removeOption = (questionIndex, optionIndex) => {
  const q = form.value.questions[questionIndex]
  q.options.splice(optionIndex, 1)
  q.reponses_correctes = q.reponses_correctes
    .filter(i => i !== optionIndex)
    .map(i => i > optionIndex ? i - 1 : i)
}

const addPaire = (questionIndex) => {
  const q = form.value.questions[questionIndex]
  q.appariement_gauche.push('')
  q.appariement_droite.push('')
}

const removePaire = (questionIndex, paireIndex) => {
  const q = form.value.questions[questionIndex]
  q.appariement_gauche.splice(paireIndex, 1)
  q.appariement_droite.splice(paireIndex, 1)
}

const onTypeChange = (index) => {
  const q = form.value.questions[index]
  q.reponses_correctes = []
  if (q.type === 'vrai_faux') {
    q.options = ['Vrai', 'Faux']
  } else if (q.type === 'appariement') {
    if (!q.appariement_gauche || q.appariement_gauche.length < 2) q.appariement_gauche = ['', '']
    if (!q.appariement_droite || q.appariement_droite.length < 2) q.appariement_droite = ['', '']
  } else if (q.type === 'texte_libre' || q.type === 'fichier') {
    // Pas d'options nécessaires pour ces types
  } else if (q.options.length < 2) {
    q.options = ['', '']
  }
}

// ─── IA ───────────────────────────────────────────────────────────────────────

const generateWithAI = async () => {
  if (!form.value.titre) {
    toast.error('Veuillez d\'abord saisir un titre')
    return
  }

  loadingAI.value = true

  try {
    const config = useRuntimeConfig()
    const token  = useCookie('auth_token').value

    const response = await fetch(`${config.public.apiBase}/ai/generate-questions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        titre: form.value.titre,
        theme: form.value.theme,
        description: form.value.description,
        nombreQuestions: nombreQuestionsAI.value
      })
    })

    const result = await response.json()

    if (!result.success || !result.data?.questions) {
      toast.error(result.message || 'Erreur lors de la génération')
      return
    }

    const questionsGenerees = result.data.questions.map(q => ({
      texte: q.texte,
      type: q.type || 'qcm',
      points: q.points || 1,
      options: q.type === 'vrai_faux' ? ['Vrai', 'Faux'] : (q.options || ['', '']),
      reponses_correctes: q.reponses_correctes || [],
      generatedByAI: true,
      explication: q.explication || ''
    }))

    if (form.value.questions.length > 0) {
      const confirm = window.confirm(
        `Voulez-vous remplacer les ${form.value.questions.length} question(s) existante(s) par les ${questionsGenerees.length} questions générées ?\n\nCliquez "Annuler" pour les ajouter à la suite.`
      )
      if (confirm) {
        form.value.questions = questionsGenerees
      } else {
        form.value.questions.push(...questionsGenerees)
      }
    } else {
      form.value.questions = questionsGenerees
    }

    toast.success(`${questionsGenerees.length} questions générées avec succès !`)
  } catch (err) {
    console.error('Erreur AI:', err)
    toast.error('Erreur lors de la génération IA')
  } finally {
    loadingAI.value = false
  }
}

// ─── Filière ──────────────────────────────────────────────────────────────────

const onFiliereChange = async () => {
  form.value.classe_id = ''
  classes.value = []
  if (form.value.filiere_id) {
    const res = await getClasses(form.value.filiere_id)
    if (res.success) classes.value = res.data
  }
}

// ─── Validation ───────────────────────────────────────────────────────────────

const validateDates = () => {
  if (!form.value.date_debut || !form.value.date_fin) return false
  const debut = new Date(form.value.date_debut)
  const fin   = new Date(form.value.date_fin)
  const now   = new Date()
  if (debut < now) { toast.error('La date de début ne peut pas être dans le passé'); return false }
  if (fin <= debut) { toast.error('La date de fin doit être postérieure à la date de début'); return false }
  if (form.value.duree <= 0) { toast.error('La durée doit être positive'); return false }
  return true
}

// ─── Soumission ───────────────────────────────────────────────────────────────

const submitQCM = async () => {
  if (!form.value.titre) { toast.error('Veuillez saisir un titre'); return }
  if (!form.value.professeur_id) { toast.error('Veuillez sélectionner le professeur au nom duquel créer la session'); return }
  if (!validateDates()) return
  if (!form.value.filiere_id || !form.value.classe_id) { toast.error('Veuillez sélectionner une filière et une classe'); return }
  if (form.value.questions.length === 0) { toast.error('Veuillez ajouter au moins une question'); return }

  for (let i = 0; i < form.value.questions.length; i++) {
    const q = form.value.questions[i]
    if (!q.texte.trim()) { toast.error(`Question ${i + 1} : veuillez saisir le texte`); return }

    if (q.type === 'appariement') {
      if (q.appariement_gauche.length < 2 || q.appariement_gauche.some(v => !v.trim()) || q.appariement_droite.some(v => !v.trim())) {
        toast.error(`Question ${i + 1} : veuillez remplir toutes les paires à apparier (au moins 2)`)
        return
      }
    } else if (q.type === 'texte_libre' || q.type === 'fichier') {
      // Rien à valider
    } else {
      if (q.options.some(opt => !opt.trim())) { toast.error(`Question ${i + 1} : veuillez remplir toutes les options`); return }
      if (q.reponses_correctes.length === 0) { toast.error(`Question ${i + 1} : veuillez sélectionner la réponse correcte`); return }
    }
  }

  loading.value = true

  const questionsAEnvoyer = form.value.questions.map(q => {
    if (q.type === 'appariement') {
      return {
        ...q,
        options: { gauche: q.appariement_gauche, droite: q.appariement_droite },
        reponses_correctes: q.appariement_gauche.map((_, idx) => idx)
      }
    }
    if (q.type === 'texte_libre' || q.type === 'fichier') {
      return { ...q, options: [], reponses_correctes: [] }
    }
    return q
  })

  const result = await createSession({
    ...form.value,
    questions: questionsAEnvoyer,
    date_debut: new Date(form.value.date_debut).toISOString(),
    date_fin:   new Date(form.value.date_fin).toISOString()
  })

  if (result.success) {
    toast.success('Session créée avec succès !')
    await navigateTo('/directeurs/sessions')
  } else {
    toast.error(result.message || 'Erreur lors de la création')
    if (result.redirect) await navigateTo(result.redirect)
  }

  loading.value = false
}

// ─── Flatpickr ────────────────────────────────────────────────────────────────

const initDatePickers = () => {
  if (dateDebutInput.value) {
    dateDebutPicker = flatpickr(dateDebutInput.value, {
      enableTime: true,
      dateFormat: 'Y-m-d H:i:s',
      time_24hr: true,
      minDate: 'today',
      minuteIncrement: 1,
      onChange: (selectedDates, dateStr) => {
        form.value.date_debut = dateStr
        formattedDateDebut.value = formatDateDisplay(dateStr)
        if (dateFinPicker && selectedDates[0]) {
          const minEnd = new Date(selectedDates[0])
          minEnd.setMinutes(minEnd.getMinutes() + 1)
          dateFinPicker.set('minDate', minEnd)
        }
        if (form.value.date_fin && new Date(form.value.date_fin) <= new Date(dateStr)) {
          form.value.date_fin = ''
          formattedDateFin.value = ''
          dateFinPicker?.clear()
        }
      }
    })
  }

  if (dateFinInput.value) {
    dateFinPicker = flatpickr(dateFinInput.value, {
      enableTime: true,
      dateFormat: 'Y-m-d H:i:s',
      time_24hr: true,
      minDate: 'today',
      minuteIncrement: 1,
      onChange: (selectedDates, dateStr) => {
        form.value.date_fin = dateStr
        formattedDateFin.value = formatDateDisplay(dateStr)
      }
    })
  }
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────

onMounted(async () => {
  getEcole().then(res => { iaDisponible.value = res?.data?.plan === 'pro' })

  const [filieresRes, profsRes] = await Promise.all([
    getFilieres(),
    getUsers({ role: 'professeur' })
  ])
  if (filieresRes.success) filieres.value = filieresRes.data
  if (profsRes.success) professeurs.value = profsRes.data

  setTimeout(() => initDatePickers(), 100)
})

onUnmounted(() => {
  dateDebutPicker?.destroy()
  dateFinPicker?.destroy()
})
</script>

<style scoped>
.border { transition: all 0.2s ease; }
.border:hover { border-color: #4a7c5e; }

:deep(.flatpickr-calendar) {
  border-radius: 12px;
  box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
  font-family: 'DM Sans', system-ui;
}
:deep(.flatpickr-day.selected) { background: #4a7c5e; border-color: #4a7c5e; }
:deep(.flatpickr-day.selected:hover) { background: #1e3a2f; border-color: #1e3a2f; }
</style>
