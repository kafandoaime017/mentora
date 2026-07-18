<template>
  <div class="bg-white rounded-lg shadow-[1px_1px_3px_1px_rgba(0,0,0,0.1)] overflow-hidden">
    <!-- En-tête navigation -->
    <div class="flex items-center justify-between p-4 border-b border-[#e2ddd4] bg-[#f5f0e8]/30">
      <button @click="moisPrecedent" class="p-2 rounded-lg hover:bg-gray-200 transition-colors text-[#1e3a2f]">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
      </button>
      <div class="flex items-center gap-3">
        <h3 class="font-body text-lg font-bold text-[#1e3a2f] capitalize">{{ libelleMois }}</h3>
        <button @click="allerAujourdhui" class="text-xs font-body font-semibold text-[#4a7c5e] hover:text-[#1e3a2f] bg-gray-100 px-2.5 py-1 rounded-full">
          Aujourd'hui
        </button>
      </div>
      <button @click="moisSuivant" class="p-2 rounded-lg hover:bg-gray-200 transition-colors text-[#1e3a2f]">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
      </button>
    </div>

    <div v-if="loading" class="p-12 text-center">
      <div class="inline-block animate-spin rounded-full h-6 w-6 border-2 border-[#4a7c5e] border-t-transparent"/>
    </div>

    <template v-else>
      <!-- Grille du mois -->
      <div class="grid grid-cols-7 border-b border-[#e2ddd4] bg-[#f5f0e8]/50">
        <div v-for="j in joursSemaine" :key="j" class="py-2 text-center text-[10px] font-bold uppercase tracking-wide text-[#9b9589]">
          {{ j }}
        </div>
      </div>
      <div class="grid grid-cols-7">
        <div
          v-for="(jour, idx) in joursGrille" :key="idx"
          class="min-h-[92px] border-b border-r border-[#eee] p-1.5"
          :class="[
            idx % 7 === 6 ? 'border-r-0' : '',
            jour.horsMois ? 'bg-gray-50' : '',
          ]"
        >
          <div class="flex items-center justify-center mb-1">
            <span
              class="text-xs w-6 h-6 flex items-center justify-center rounded-full font-body"
              :class="[
                jour.horsMois ? 'text-gray-300' : 'text-[#1e3a2f]',
                jour.estAujourdhui ? 'bg-[#4a7c5e] text-white font-bold' : ''
              ]"
            >{{ jour.date.getDate() }}</span>
          </div>
          <div class="space-y-1">
            <button
              v-for="s in jour.sessions.slice(0, 3)" :key="s.id"
              @click="ouvrir(s)"
              class="w-full text-left px-1.5 py-0.5 rounded text-[10px] font-body font-semibold truncate block transition-colors"
              :class="badgeClass(s.status)"
              :title="`${s.titre} — ${formatHeure(s.date_debut)}`"
            >
              {{ formatHeure(s.date_debut) }} {{ s.titre }}
            </button>
            <p v-if="jour.sessions.length > 3" class="text-[10px] text-[#9b9589] pl-1.5">
              +{{ jour.sessions.length - 3 }} autre{{ jour.sessions.length - 3 > 1 ? 's' : '' }}
            </p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  sessions: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  // Prefixe de route pour cliquer sur une session (ex: '/directeurs/sessions/').
  // Laisser vide pour désactiver le clic (ex: espace étudiant).
  detailPrefix: { type: String, default: '' }
})

const affiche = ref(new Date())
affiche.value.setDate(1)

const joursSemaine = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

const libelleMois = computed(() =>
  affiche.value.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
)

const memeJour = (a, b) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

const joursGrille = computed(() => {
  const premier = new Date(affiche.value.getFullYear(), affiche.value.getMonth(), 1)
  const dernier = new Date(affiche.value.getFullYear(), affiche.value.getMonth() + 1, 0)

  // Lundi = debut de semaine
  const decalageDebut = (premier.getDay() + 6) % 7
  const debutGrille = new Date(premier)
  debutGrille.setDate(premier.getDate() - decalageDebut)

  const decalageFin = (7 - ((dernier.getDay() + 6) % 7 + 1)) % 7
  const finGrille = new Date(dernier)
  finGrille.setDate(dernier.getDate() + decalageFin)

  const jours = []
  const curseur = new Date(debutGrille)
  const aujourdhui = new Date()

  while (curseur <= finGrille) {
    const jourCourant = new Date(curseur)
    const sessionsJour = props.sessions.filter(s => s.date_debut && memeJour(new Date(s.date_debut), jourCourant))
      .sort((a, b) => new Date(a.date_debut) - new Date(b.date_debut))

    jours.push({
      date: jourCourant,
      horsMois: jourCourant.getMonth() !== affiche.value.getMonth(),
      estAujourdhui: memeJour(jourCourant, aujourdhui),
      sessions: sessionsJour
    })
    curseur.setDate(curseur.getDate() + 1)
  }
  return jours
})

const moisPrecedent = () => {
  affiche.value = new Date(affiche.value.getFullYear(), affiche.value.getMonth() - 1, 1)
}
const moisSuivant = () => {
  affiche.value = new Date(affiche.value.getFullYear(), affiche.value.getMonth() + 1, 1)
}
const allerAujourdhui = () => {
  const d = new Date(); d.setDate(1); affiche.value = d
}

const formatHeure = (date) => new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

const badgeClass = (status) => ({
  pending:   'bg-gray-200 text-gray-700 hover:bg-gray-300',
  active:    'bg-green-100 text-green-800 hover:bg-green-200',
  completed: 'bg-blue-100 text-blue-800 hover:bg-blue-200'
})[status] || 'bg-gray-200 text-gray-700 hover:bg-gray-300'

const ouvrir = (session) => {
  if (!props.detailPrefix) return
  navigateTo(`${props.detailPrefix}${session.id}`)
}
</script>
