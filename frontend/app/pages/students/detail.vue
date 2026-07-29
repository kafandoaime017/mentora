<template>
  <div class="bg-[#f5f0e8] font-body min-h-screen">
    <StudentLayout>
      
      <!-- Bouton retour -->
      <button 
        @click="router.back()"
        class="flex items-center gap-2 text-[#1e3a2f] mb-6 hover:text-[#4a7c5e] transition-colors"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
        </svg>
        <span class="text-sm font-semibold">Retour</span>
      </button>

      <div class="max-w-4xl mx-auto">
        
        <!-- ══════════════════════════
             EN-TÊTE DE LA SESSION
        ═══════════════════════════════ -->
        <div class="bg-white shadow-[1px_1px_7px_1px_rgba(0,0,0,0.16)] border border-[#e2ddd4] rounded-lg p-6 mb-6">
          <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-3 flex-wrap">
                <h1 class="font-bold text-2xl font-body text-[#1e3a2f]">{{ session.titre }}</h1>
                <span 
                  class="px-3 py-1 rounded-full text-sm font-semibold"
                  :class="{
                    'bg-green-100 text-green-700': session.statut === 'Terminé',
                    'bg-amber-100 text-amber-700': session.statut === 'En cours',
                    'bg-blue-100 text-blue-700': session.statut === 'Publiée',
                    'bg-gray-100 text-gray-500': session.statut === 'À venir'
                  }"
                >
                  {{ session.statut }}
                </span>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-[#9b9589]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  <span class="text-[#6b6b6b] font-body">{{ session.date }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-[#9b9589]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span class="text-[#6b6b6b] font-body">{{ session.heure }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-[#9b9589]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                  </svg>
                  <span class="text-[#6b6b6b] font-body">{{ session.professeur }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-[#9b9589]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                  <span class="text-[#6b6b6b] font-body">{{ session.participants }} participants</span>
                </div>
              </div>
            </div>

            <!-- Bouton d'action principal -->
            <nuxt-link 
              v-if="session.statut !== 'Terminé'"
              to="/students/session"
              class="bg-primary text-white font-body px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/80 transition-colors whitespace-nowrap"
            >
              Rejoindre la session
            </nuxt-link>
          </div>
        </div>

        <!-- ══════════════════════════
             NOTE (si publiée)
        ═══════════════════════════════ -->
        <div v-if="session.statut === 'Publiée' && session.note" class="bg-white shadow-[1px_1px_7px_1px_rgba(0,0,0,0.16)] border border-[#e2ddd4] rounded-lg p-6 mb-6">
          <h2 class="font-bold text-lg text-[#1e3a2f] mb-4">Note obtenue</h2>
          <div class="flex items-center gap-4">
            <div class="text-center">
              <span class="text-4xl font-bold" :class="getNoteColor(session.note)">{{ session.note }}</span>
              <span class="text-lg text-[#9b9589]">/20</span>
            </div>
            <div class="flex-1">
              <div class="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  class="h-2.5 rounded-full transition-all duration-500"
                  :class="getProgressBarColor(session.note)"
                  :style="{ width: `${(session.note / 20) * 100}%` }"
                ></div>
              </div>
              <p class="text-sm text-[#6b6b6b] mt-2">{{ getMention(session.note) }}</p>
            </div>
          </div>
        </div>

        <!-- ══════════════════════════
             DESCRIPTION
        ═══════════════════════════════ -->
        <div class="bg-white shadow-[1px_1px_7px_1px_rgba(0,0,0,0.16)] border border-[#e2ddd4] rounded-lg p-6 mb-6">
          <h2 class="font-bold text-lg text-[#1e3a2f] mb-3">Description</h2>
          <p class="text-gray-700 leading-relaxed font-body">
            {{ session.description || 'Aucune description disponible pour cette session.' }}
          </p>
        </div>

        <!-- ══════════════════════════
             INFORMATIONS SUPPLÉMENTAIRES
        ═══════════════════════════════ -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-white shadow-[1px_1px_7px_1px_rgba(0,0,0,0.16)] border border-[#e2ddd4] rounded-lg p-6">
            <h2 class="font-bold text-lg text-[#1e3a2f] mb-3">Lieu</h2>
            <div class="flex items-center gap-2">
              <svg class="w-5 h-5 text-[#4a7c5e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              <span class="text-[#6b6b6b] font-body">{{ session.lieu || 'En ligne' }}</span>
            </div>
          </div>

          <div class="bg-white shadow-[1px_1px_7px_1px_rgba(0,0,0,0.16)] border border-[#e2ddd4] rounded-lg p-6">
            <h2 class="font-bold  text-lg text-[#1e3a2f] mb-3">Capacité</h2>
            <div class="flex items-center gap-2">
              <svg class="w-5 h-5 text-[#4a7c5e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
              </svg>
              <span class="text-[#6b6b6b] font-body">{{ session.participants }} / {{ session.capacite || 'Illimitée' }} participants</span>
            </div>
            <!-- Barre de progression capacité -->
            <div v-if="session.capacite" class="mt-3">
              <div class="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  class="h-1.5 rounded-full bg-[#4a7c5e]"
                  :style="{ width: `${(session.participants / session.capacite) * 100}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </StudentLayout>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// Récupérer l'ID de la session
const sessionId = route.params.id

// Données mock de la session (à remplacer par un appel API)
const session = ref({
  id: sessionId,
  titre: 'Mathématiques - Fonctions & Limites',
  date: '15 Mars 2024',
  heure: '14:00 - 16:00',
  professeur: 'Dr. Martin Bernard',
  participants: 24,
  capacite: 30,
  lieu: 'Amphithéâtre A - Bâtiment Principal',
  statut: 'En cours',
  description: 'Cette session aborde les concepts fondamentaux des fonctions mathématiques, les limites et leurs applications. Nous travaillerons sur des exercices pratiques et des études de cas concrets.',
  note: null
})

// Si session publiée avec note
if (session.value.statut === 'Publiée') {
  session.value.note = 15.5
}

// Fonctions
function rejoindreSession() {
  console.log('Rejoindre la session:', session.value.titre)
  alert(`Vous rejoignez la session: ${session.value.titre}`)
}

function getNoteColor(note) {
  if (note >= 16) return 'text-green-700'
  if (note >= 14) return 'text-blue-700'
  if (note >= 12) return 'text-cyan-700'
  if (note >= 10) return 'text-yellow-700'
  return 'text-red-700'
}

function getProgressBarColor(note) {
  if (note >= 16) return 'bg-green-600'
  if (note >= 14) return 'bg-blue-600'
  if (note >= 12) return 'bg-cyan-600'
  if (note >= 10) return 'bg-yellow-600'
  return 'bg-red-600'
}

function getMention(note) {
  if (note >= 16) return '✨ Excellent ! Félicitations !'
  if (note >= 14) return '🌟 Très bien !'
  if (note >= 12) return '👍 Bien'
  if (note >= 10) return '📚 Passable'
  return '💪 À améliorer, ne lâchez rien !'
}
</script>