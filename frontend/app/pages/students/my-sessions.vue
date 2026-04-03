<template>
  <div class="bg-[#f5f0e8] font-body min-h-screen">
    <StudentLayout>
      
      <!-- Titre page -->
      <h2 class="font-['Roboto'] text-xl font-extrabold text-[#1e3a2f] mb-6">
        Mes sessions
      </h2>

      <!-- ══════════════════════════
           ONGLETS
      ═══════════════════════════════ -->
      <div class="mb-6">
        <div class="border-b ">
          <nav class="flex gap-1" aria-label="Tabs">
            <button
              v-for="onglet in onglets"
              :key="onglet.id"
              @click="ongletActif = onglet.id"
              class="px-6 py-3  text-sm font-body font-semibold transition-all duration-200 relative"
              :class="ongletActif === onglet.id
                ? 'text-white rounded-md bg-primary'
                : 'text-[#9b9589] hover:text-[#4a7c5e]'"
            >
              {{ onglet.nom }}
              <span 
                v-if="ongletActif === onglet.id"
                class="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary rounded-full"
              ></span>
            </button>
          </nav>
        </div>
      </div>

      <!-- ══════════════════════════
           CONTENU DES ONGLETS
      ═══════════════════════════════ -->
      
      <!-- Toutes les sessions -->
      <section v-if="ongletActif === 'toutes'" class="md:w-[500px] lg:w-full border-[#e2ddd4] rounded-lg mb-5">
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div
            v-for="session in sessionsFiltrees"
            :key="session.id"
            class="flex flex-col justify-between shadow-[1px_1px_7px_1px_rgba(0,0,0,0.16)] p-4 bg-white rounded-lg  "
          >
            <!-- Titre -->
            <div>
              <p class="font-bold text-lg font-body text-primary leading-snug mb-1">
                {{ session.titre }}
              </p>
              <p class="text-[0.78rem] font-body text-[#6b6b6b] mb-3">
                {{ session.date }}
              </p>
            </div>

            <!-- Footer -->
            <div class="flex items-center justify-between gap-2 mt-3">
              <span
                class="inline-block px-3 rounded-full text-[0.80rem] font-semibold"
                :class="getStatutClass(session.statut)"
              >
                {{ session.statut }}
              </span>
              <button
                class="bg-primary text-white text-[0.8rem] font-semibold px-4 py-1.5 rounded-md hover:bg-primary/80 transition"
                :disabled="session.statut !== 'À venir' && session.statut !== 'En cours' && session.statut !== 'Publiée'"
                @click="rejoindreSession(session)"
              >
                {{ session.statut === 'Publiée' ? 'Voir note' : 'Rejoindre' }}
              </button>
            </div>
          </div>
        </div>
        
        <!-- Message si aucune session -->
        <div v-if="sessionsFiltrees.length === 0" class="bg-white border border-[#e2ddd4] rounded-lg p-8 text-center">
          <svg class="w-16 h-16 mx-auto text-[#ccc7bc] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          <p class="text-[#6b6b6b]">Aucune session trouvée</p>
          <p class="text-sm text-[#9b9589] mt-1">Aucune session ne correspond à cet onglet</p>
        </div>
      </section>

      <!-- Sessions terminées -->
      <section v-if="ongletActif === 'terminees'" class="md:w-[500px] lg:w-full border-[#e2ddd4] rounded-lg mb-5">
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div
            v-for="session in sessionsTerminees"
            :key="session.id"
            class="flex flex-col justify-between shadow-[1px_1px_7px_1px_rgba(0,0,0,0.16)] p-4 bg-white rounded-lg transition-all duration-200 "
          >
            <!-- Titre -->
            <div>
              <p class="font-bold text-lg font-body text-primary leading-snug mb-1">
                {{ session.titre }}
              </p>
              <p class="text-[0.78rem] font-body text-[#6b6b6b] mb-3">
                {{ session.date }}
              </p>
            </div>

            <!-- Footer -->
            <div class="flex items-center justify-between gap-2 mt-3">
              <span
                class="inline-block px-3 rounded-full text-[0.80rem] font-semibold bg-gray-100 text-gray-600"
              >
                Terminé
              </span>
              <button
                class="border border-[#1e3a2f] text-[#1e3a2f] text-[0.8rem] font-semibold px-4 py-1.5 rounded-md hover:bg-[#1e3a2f] hover:text-white transition"
                @click="voirDetails(session)"
              >
                Détails
              </button>
            </div>
          </div>
        </div>
        
        <div v-if="sessionsTerminees.length === 0" class="bg-white border border-[#e2ddd4] rounded-lg p-8 text-center">
          <svg class="w-16 h-16 mx-auto text-[#ccc7bc] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          <p class="text-[#6b6b6b]">Aucune session terminée</p>
          <p class="text-sm text-[#9b9589] mt-1">Vous n'avez pas encore de sessions terminées</p>
        </div>
      </section>

      <!-- Sessions publiées -->
      <section v-if="ongletActif === 'publiees'" class="md:w-[500px] lg:w-full border-[#e2ddd4] rounded-lg mb-5">
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div
            v-for="session in sessionsPubliees"
            :key="session.id"
            class="flex flex-col justify-between shadow-[1px_1px_7px_1px_rgba(0,0,0,0.16)] p-4 bg-white rounded-lg transition-all "
          >
            <!-- Titre -->
            <div>
              <p class="font-bold flex justify-between  text-lg font-body text-primary leading-snug mb-1">
                <span>
                  {{ session.titre }}
                </span>
                <span class="text-2xl font-bold">
                  {{ session.note }}/20
                </span>
              </p>
              <p class="text-[0.78rem] font-body text-[#6b6b6b] mb-3">
                {{ session.date }}
              </p>
            </div>

           

            <!-- Footer -->
            <div class="flex items-center justify-between gap-2 mt-2">
              <span
                class="inline-block px-3 rounded-full text-[0.80rem] font-semibold bg-blue-100 text-blue-700"
              >
                Publiée
              </span>
              <button
                class="bg-[#1e3a2f] text-white text-[0.8rem] font-semibold px-4 py-1.5 rounded-md hover:bg-[#4a7c5e] transition"
                @click="voirDetails(session)"
              >
                Voir détail
              </button>
            </div>
          </div>
        </div>
        
        <div v-if="sessionsPubliees.length === 0" class="bg-white border border-[#e2ddd4] rounded-lg p-8 text-center">
          <svg class="w-16 h-16 mx-auto text-[#ccc7bc] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
          </svg>
          <p class="text-[#6b6b6b]">Aucune session publiée</p>
          <p class="text-sm text-[#9b9589] mt-1">Aucune session n'est actuellement publiée</p>
        </div>
      </section>

    </StudentLayout>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Onglets
const onglets = [
  { id: 'toutes', nom: 'Toutes' },
  { id: 'terminees', nom: 'Terminées' },
  { id: 'publiees', nom: 'Publiées' }
]

const ongletActif = ref('toutes')

// Données mock des sessions
const toutesSessions = ref([
  {
    id: 1,
    titre: 'Mathématiques - Fonctions',
    date: '15 Mars 2024 · 14:00',
    statut: 'En cours'
  },
  {
    id: 2,
    titre: 'Algorithmique - Tri',
    date: '10 Mars 2024 · 10:00',
    statut: 'Terminé'
  },
  {
    id: 3,
    titre: 'Bases de données - SQL',
    date: '20 Mars 2024 · 09:00',
    statut: 'Publiée',
    note: 15.5
  },
  {
    id: 4,
    titre: 'Développement Web - Vue.js',
    date: '12 Mars 2024 · 14:00',
    statut: 'Terminé'
  },
  
 
])

// Sessions filtrées
const sessionsFiltrees = computed(() => {
  return toutesSessions.value
})

const sessionsTerminees = computed(() => {
  return toutesSessions.value.filter(s => s.statut === 'Terminé')
})

const sessionsPubliees = computed(() => {
  return toutesSessions.value.filter(s => s.statut === 'Publiée')
})

// Classe CSS pour le statut
function getStatutClass(statut) {
  const classes = {
    'En cours': 'bg-amber-100 text-amber-700',
    'À venir': 'bg-green-100 text-green-700',
    'Terminé': 'bg-gray-100 text-gray-600',
    'Publiée': 'bg-blue-100 text-blue-700'
  }
  return classes[statut] || 'bg-gray-100 text-gray-600'
}

// Couleur de la note
function getNoteColor(note) {
  if (note >= 16) return 'text-green-700'
  if (note >= 14) return 'text-blue-700'
  if (note >= 12) return 'text-cyan-700'
  if (note >= 10) return 'text-yellow-700'
  return 'text-red-700'
}

// Couleur de la barre de progression
function getProgressBarColor(note) {
  if (note >= 16) return 'bg-green-600'
  if (note >= 14) return 'bg-blue-600'
  if (note >= 12) return 'bg-cyan-600'
  if (note >= 10) return 'bg-yellow-600'
  return 'bg-red-600'
}

// Actions
function rejoindreSession(session) {
  console.log('Rejoindre session:', session.titre)
  alert(`Rejoindre la session: ${session.titre}`)
}

function voirDetails(session) {
  console.log('Voir détails:', session.titre)
  if (session.statut === 'Publiée') {
    alert(`Session: ${session.titre}\nNote: ${session.note}/20`)
  } else {
    alert(`Détails de la session: ${session.titre}`)
  }
}
</script>

<style scoped>
/* Animation smooth pour les onglets */
button {
  position: relative;
}

button span {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}

/* Hover effect sur les cartes */
.bg-white {
  transition: all 0.3s ease;
}

.bg-white:hover {
  transform: translateY(-2px);
}


</style>