<template>
  <div class="bg-input font-body min-h-screen">
    <TeacherLayout>
      <div class="max-w-8xl mx-auto py-4 sm:py-5">
        
        <!-- ==================== EN-TÊTE ==================== -->
        <div class="mb-8">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 class="font-body text-2xl font-extrabold text-[#1e3a2f]">
                Mes sessions
              </h2>
            </div>
            <NuxtLink 
              to="/teachers/create-session"
              class="px-5 py-2.5 bg-primary font-body text-white rounded-xl text-sm font-semibold hover:bg-primary/80 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              Créer une session
            </NuxtLink>
          </div>
        </div>

        <!-- ==================== BARRE DE RECHERCHE ET FILTRES ==================== -->
        <div class="bg-white shadow-[1px_1px_2px_1px_rgba(0,0,0,0.16)] mb-6">
          <div class="p-2 px-4 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
            <div class="relative flex-1 max-w-md">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9b9589]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input 
                v-model="searchQuery"
                type="text"
                placeholder="Rechercher un QCM..."
                class="w-full pl-11 pr-4 py-3 text-sm text-gray-800 placeholder-gray-600 bg-input font-body rounded-xl focus:bg-input focus:outline-none transition-all duration-200"
              >
            </div>
            
            <div class="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
              <button 
                v-for="status in statusFilters" 
                :key="status.value"
                @click="filterStatus = status.value"
                class="px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all"
                :class="filterStatus === status.value 
                  ? 'bg-secondary text-white' 
                  : 'bg-[#f5f0e8] text-[#1e3a2f] hover:bg-[#e2ddd4]'"
              >
                {{ status.label }}
                <span class="ml-1 text-xs opacity-75">({{ getCountByStatus(status.value) }})</span>
              </button>
            </div>
          </div>
        </div>

        <!-- ==================== LOADING ==================== -->
        <div v-if="loading" class="bg-white shadow-[1px_1px_3px_1px_rgba(0,0,0,0.16)] border border-[#e2ddd4] rounded-sm p-6 text-center">
          <div class="inline-block animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
        </div>

        <!-- ==================== AUCUN RÉSULTAT ==================== -->
        <div v-else-if="filteredQCMs.length === 0" class="bg-white shadow-[1px_1px_3px_1px_rgba(0,0,0,0.16)] border border-[#e2ddd4] rounded-lg p-12 text-center">
          <svg class="w-20 h-20 mx-auto mb-4 text-[#9b9589] opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          <h3 class="text-lg font-bold font-body text-[#1e3a2f] mb-2">Aucun QCM trouvé</h3>
          <p class="text-[#9b9589] text-sm mb-6 font-body">
            {{ searchQuery || filterStatus !== 'all' ? 'Aucun résultat pour cette recherche' : 'Vous n\'avez pas encore créé de QCM' }}
          </p>
          <NuxtLink 
            v-if="!searchQuery && filterStatus === 'all'"
            to="/teachers/create-session"
            class="px-5 py-2.5 font-body bg-[#4a7c5e] text-white rounded-xl text-sm font-semibold hover:bg-[#1e3a2f] transition-colors inline-flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Créer mon premier QCM
          </NuxtLink>
        </div>

        <!-- ==================== LISTE DES QCM ==================== -->
        <div v-else class="bg-white shadow-[1px_1px_2px_1px_rgba(0,0,0,0.16)] overflow-hidden">
          
          <!-- En-tête des colonnes -->
          <div class="hidden md:grid md:grid-cols-12 gap-3 px-4 py-2 bg-primary border-b border-[#e2ddd4] text-sm font-body font-semibold text-white font-bold uppercase tracking-wider">
            <div class="col-span-3">Titre</div>
            <div class="col-span-2">Classe</div>
            <div class="col-span-2">Date debut</div>
            <div class="col-span-2">Questions</div>
            <div class="col-span-1">Statut</div>
            <div class="col-span-2 text-right">Actions</div>
          </div>

          <!-- Lignes -->
          <div 
            v-for="qcm in filteredQCMs" 
            :key="qcm.id"
            class="group border-b border-[#e2ddd4] transition-all duration-200 hover:bg-[#f5f0e8]/30 cursor-pointer last:border-b-0"
            @click="viewQCM(qcm.id)"
          >
            <div class="px-4 py-4 md:grid md:grid-cols-12 md:gap-3">
              
              <!-- Titre -->
              <div class="flex items-start gap-3 md:col-span-3">
                <div class="flex-shrink-0 mt-0.5">
                  <div class="w-8 h-8 rounded-full bg-[#4a7c5e]/20 flex items-center justify-center">
                    <svg class="w-4 h-4 text-[#4a7c5e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                  </div>
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="font-semibold font-body text-[#1e3a2f] truncate group-hover:text-[#4a7c5e] transition-colors">
                    {{ qcm.titre }}
                  </h3>
                </div>
              </div>

              <!-- Cible -->
              <div class="hidden md:flex md:col-span-2 items-center text-sm text-[#1e3a2f]">
                <div class="flex flex-col bg-gray-100 px-2 py-1 rounded-sm">
                  <span class="text-sm font-medium font-body">{{ qcm.filiere?.nom || '—' }}(<span class="font-extrabold text-primary">{{ qcm.classe?.nom || '—' }}</span>)</span>
                </div>
              </div>

              <!-- Date -->
              <div class="hidden md:flex md:col-span-2 flex-col justify-center text-sm text-[#1e3a2f]">
                <div class="flex bg-gray-200 px-2 py-1 rounded-lg font-medium items-center gap-1">
                  <svg class="w-3 h-3 text-[#9b9589]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  <span>{{ formatDateShort(qcm.date_debut) }}</span>
                </div>
              </div>

              <!-- Questions -->
              <div class="hidden md:flex md:col-span-2 items-center gap-1 text-sm text-[#1e3a2f]">
                <svg class="w-4 h-4 text-[#9b9589]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>{{ qcm.questions?.length || 0 }}</span>
              </div>

              <!-- Statut et actions -->
              <div class="flex items-center justify-between md:col-span-3 mt-3 md:mt-0">
                <div>
                  <span 
                    class="inline-flex px-2 py-1 text-xs rounded-full font-medium"
                    :class="getStatusClass(qcm.status)"
                  >
                    {{ getStatusText(qcm.status) }}
                  </span>
                </div>

                <!-- Actions (mobile) -->
                <div class="flex items-center gap-1 md:hidden" @click.stop>
                  <button 
                    @click.stop="viewQCM(qcm.id)"
                    class="p-2 text-[#4a7c5e] hover:bg-[#e2ddd4] bg-[#e2ddd4] rounded-lg transition-colors"
                    title="Voir les détails"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  </button>
                  
                  <!-- ✅ BOUTON MODIFIER (mobile) -->
                  <button 
                    v-if="qcm.status === 'pending'"
                    @click.stop="editQCMHandler(qcm.id)"
                    class="p-2 text-blue-600 bg-[#e2ddd4] hover:bg-blue-50 rounded-lg transition-colors"
                    title="Modifier la session"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                  </button>
                  
                  <!-- Bouton Démarrer (pending) -->
                  <button 
                    v-if="qcm.status === 'pending'"
                    @click.stop="startSessionHandler(qcm.id)"
                    class="p-2 text-green-600 bg-[#e2ddd4] hover:bg-green-50 rounded-lg transition-colors"
                    title="Démarrer la session"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </button>
                  
                  <!-- Bouton Terminer (active) -->
                  <button 
                    v-if="qcm.status === 'active'"
                    @click.stop="endSessionHandler(qcm.id)"
                    class="p-2 text-orange-600 bg-[#e2ddd4] hover:bg-orange-50 rounded-lg transition-colors"
                    title="Terminer la session"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 10h6v4H9z"/>
                    </svg>
                  </button>
                  
                  <!-- Bouton QR code -->
                  <button 
                    @click.stop="openQRModal(qcm)"
                    class="p-2 text-blue-600 bg-[#e2ddd4] hover:bg-blue-50 rounded-lg transition-colors"
                    title="Afficher le QR code"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/>
                    </svg>
                  </button>
                  
                  <!-- Bouton Dupliquer -->
                  <button
                    @click.stop="duplicateQCMHandler(qcm.id)"
                    :disabled="duplicatingId === qcm.id"
                    class="p-2 text-[#4a7c5e] bg-[#e2ddd4] hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Dupliquer comme modèle"
                  >
                    <div v-if="duplicatingId === qcm.id" class="animate-spin rounded-full h-4 w-4 border-2 border-[#4a7c5e] border-t-transparent"/>
                    <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                    </svg>
                  </button>

                  <!-- Bouton Supprimer (pending seulement) -->
                  <button
                    v-if="qcm.status === 'pending'"
                    @click.stop="deleteQCMHandler(qcm.id)"
                    :disabled="deleting"
                    class="p-2 text-red-500 bg-[#e2ddd4] hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Supprimer"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>

                <!-- Actions (desktop) -->
                <div class="hidden md:flex items-center gap-1" @click.stop>
                  <button 
                    @click.stop="viewQCM(qcm.id)"
                    class="p-2 text-[#4a7c5e] hover:bg-[#e2ddd4] bg-gray-200 rounded-lg transition-colors"
                    title="Voir les détails"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  </button>
                  
                  <!-- ✅ BOUTON MODIFIER (desktop) -->
                  <button 
                    v-if="qcm.status === 'pending'"
                    @click.stop="editQCMHandler(qcm.id)"
                    class="p-2 text-blue-600 hover:bg-blue-50 bg-gray-200 rounded-lg transition-colors"
                    title="Modifier la session"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                  </button>
                  
                  <!-- Bouton Démarrer (pending) -->
                  <button 
                    v-if="qcm.status === 'pending'"
                    @click.stop="startSessionHandler(qcm.id)"
                    class="p-2 text-green-600 hover:bg-green-50 bg-gray-200 rounded-lg transition-colors"
                    title="Démarrer la session"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </button>
                  
                  <!-- Bouton Terminer (active) -->
                  <button 
                    v-if="qcm.status === 'active'"
                    @click.stop="endSessionHandler(qcm.id)"
                    class="p-2 text-orange-600 hover:bg-orange-50 bg-gray-200 rounded-lg transition-colors"
                    title="Terminer la session"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 10h6v4H9z"/>
                    </svg>
                  </button>
                  
                  <!-- Bouton QR code -->
                  <button 
                    @click.stop="openQRModal(qcm)"
                    class="p-2 text-blue-600 hover:bg-blue-50 bg-gray-200 rounded-lg transition-colors"
                    title="Afficher le QR code"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/>
                    </svg>
                  </button>
                  
                  <!-- Bouton Dupliquer (desktop) -->
                  <button
                    @click.stop="duplicateQCMHandler(qcm.id)"
                    :disabled="duplicatingId === qcm.id"
                    class="p-2 text-[#4a7c5e] hover:bg-green-50 bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                    title="Dupliquer comme modèle"
                  >
                    <div v-if="duplicatingId === qcm.id" class="animate-spin rounded-full h-4 w-4 border-2 border-[#4a7c5e] border-t-transparent"/>
                    <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                    </svg>
                  </button>

                  <!-- Bouton Supprimer (pending seulement) -->
                  <button
                    v-if="qcm.status === 'pending'"
                    @click.stop="deleteQCMHandler(qcm.id)"
                    :disabled="deleting"
                    class="p-2 text-red-500 hover:bg-red-50 bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                    title="Supprimer"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Infos supplémentaires sur mobile -->
            <div class="px-4 pb-4 flex flex-wrap gap-2 font-secondary text-sm text-gray-700 border-t border-[#e2ddd4] pt-3 md:hidden">
              <div class="flex items-center gap-1">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                <span>{{ formatDateTime(qcm.date_debut) }}</span>
              </div>
              <div class="flex items-center gap-1">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>{{ qcm.questions?.length || 0 }} questions</span>
              </div>
              <div class="flex items-center bg-secondary rounded-full px-1.5 text-white gap-1">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>{{ qcm.duree }} min</span>
              </div>
            </div>
          </div>
        </div>

        <!-- ==================== MODAL QR CODE ==================== -->
        <div v-if="qrModalVisible" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="qrModalVisible = false">
          <div class="bg-white shadow-xl max-w-sm w-full">
            <div class="border-b border-[#e2ddd4] p-4 py-2 flex justify-end">
              <button 
                @click="qrModalVisible = false"
                class="p-1 hover:bg-secondary/80 bg-secondary text-white rounded-full transition-colors"
              >
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div class="p-6 text-center">
              <div class="flex justify-center mb-1">
                <img 
                  v-if="selectedQCM?.qr_code" 
                  :src="selectedQCM.qr_code" 
                  alt="QR Code" 
                  class="w-56 h-56 border border-[#e2ddd4] rounded-xl p-2"
                >
                <div v-else class="w-56 h-56 bg-gray-100 rounded-xl flex items-center justify-center text-[#9b9589]">
                  QR code non disponible
                </div>
              </div>
              <div class="rounded-xl p-2 mb-1">
                <p class="text-xs text-secondary font-bold uppercase tracking-wider mb-1">Code d'accès</p>
                <p class="text-3xl font-mono font-extrabold text-black tracking-wider">{{ selectedQCM?.code }}</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </TeacherLayout>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useTeacher } from '../../../composables/useTeacher'
import { useToast } from '../../../composables/useToast'
import { useConfirm } from '../../../composables/useConfirm'

const { getQCMList, deleteQCM, startSession, endSession, duplicateQCM } = useTeacher()
const toast = useToast()
const { confirm } = useConfirm()

const loading = ref(true)
const qcms = ref([])
const searchQuery = ref('')
const filterStatus = ref('all')
const deleting = ref(false)
const duplicatingId = ref(null)

// QR Code modal
const qrModalVisible = ref(false)
const selectedQCM = ref(null)

const statusFilters = [
  { value: 'all', label: 'Tous' },
  { value: 'pending', label: 'Programmés' },
  { value: 'active', label: 'En cours' },
  { value: 'completed', label: 'Terminés' }
]

const filteredQCMs = computed(() => {
  let result = qcms.value
  
  if (filterStatus.value !== 'all') {
    result = result.filter(q => q.status === filterStatus.value)
  }
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(q => 
      q.titre.toLowerCase().includes(query) ||
      q.description?.toLowerCase().includes(query)
    )
  }
  
  return result
})

const getCountByStatus = (status) => {
  return qcms.value.filter(q => q.status === status).length
}

const getStatusText = (status) => {
  const statusMap = {
    pending: 'Programmé',
    active: 'En cours',
    completed: 'Terminé',
    draft: 'Brouillon'
  }
  return statusMap[status] || status
}

const getStatusClass = (status) => {
  const classMap = {
    pending: 'bg-yellow-200 text-yellow-800',
    active: 'bg-green-200 text-green-800',
    completed: 'bg-gray-200 text-gray-800',
    draft: 'bg-blue-200 text-blue-800'
  }
  return classMap[status] || 'bg-gray-200 text-gray-800'
}

const formatDateShort = (date) => {
  if (!date) return ''
  const dateObj = new Date(date)
  if (isNaN(dateObj.getTime())) return ''
  const dateOptions = { day: 'numeric', month: 'long', year: 'numeric' }
  const timeOptions = { hour: '2-digit', minute: '2-digit' }
  const formattedDate = dateObj.toLocaleDateString('fr-FR', dateOptions)
  const formattedTime = dateObj.toLocaleTimeString('fr-FR', timeOptions)
  return `${formattedDate} à ${formattedTime}`
}

const formatDateTime = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// ✅ Fonction pour rediriger vers la page de modification
const editQCMHandler = (id) => {
  navigateTo(`/teachers/qcm/${id}/edit`)
}

const openQRModal = (qcm) => {
  selectedQCM.value = qcm
  qrModalVisible.value = true
}

const loadQCMs = async () => {
  loading.value = true
  const result = await getQCMList()
  if (result.success) {
    qcms.value = result.data
  } else {
    toast.error('Erreur lors du chargement des QCM')
  }
  loading.value = false
}

const viewQCM = (id) => {
  navigateTo(`/teachers/qcm/${id}`)
}

const startSessionHandler = async (id) => {
  const ok = await confirm({
    title: 'Démarrer la session',
    message: 'Les étudiants pourront rejoindre et répondre dès que la session est démarrée. Continuer ?',
    confirmLabel: 'Démarrer'
  })
  if (!ok) return

  const result = await startSession(id)
  if (result.success) {
    toast.success('Session démarrée !')
    await loadQCMs()
  } else {
    toast.error(result.message || 'Erreur lors du démarrage')
  }
}

const endSessionHandler = async (id) => {
  const ok = await confirm({
    title: 'Terminer la session',
    message: 'Les étudiants ne pourront plus soumettre de réponses une fois la session terminée. Continuer ?',
    confirmLabel: 'Terminer',
    danger: true
  })
  if (!ok) return

  const result = await endSession(id)
  if (result.success) {
    toast.success('Session terminée !')
    await loadQCMs()
  } else {
    toast.error(result.message || 'Erreur lors de la fin de session')
  }
}

const deleteQCMHandler = async (id) => {
  const ok = await confirm({
    title: 'Supprimer le QCM',
    message: 'Cette action est irréversible.',
    confirmLabel: 'Supprimer',
    danger: true
  })
  if (!ok) return

  deleting.value = true
  const result = await deleteQCM(id)
  deleting.value = false

  if (result.success) {
    toast.success('QCM supprimé avec succès')
    await loadQCMs()
  } else {
    toast.error(result.message || 'Erreur lors de la suppression')
  }
}

const duplicateQCMHandler = async (id) => {
  const ok = await confirm({
    title: 'Dupliquer la session',
    message: 'Une copie de cette session sera créée avec des dates provisoires à redéfinir.',
    confirmLabel: 'Dupliquer'
  })
  if (!ok) return

  duplicatingId.value = id
  const result = await duplicateQCM(id)
  duplicatingId.value = null
  if (result.success) {
    toast.success(result.message || 'Session dupliquée')
    await loadQCMs()
    if (result.data?.id) {
      await navigateTo(`/teachers/qcm/${result.data.id}/edit`)
    }
  } else {
    toast.error(result.message || 'Erreur lors de la duplication')
  }
}

onMounted(() => {
  loadQCMs()
})
</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>