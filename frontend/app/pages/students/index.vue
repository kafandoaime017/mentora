<template>
  <div class=" bg-[#f5f0e8]  font-body">
    <StudentLayout>

      <!-- Ma classe -->
         <p class="text-2xl font-extrabold text-black font-body leading-tight m-0 mb-4">Bonjour Aimé 👋</p>
               <h2 class="font-[Roboto] text-xl font-extrabold text-[#1e3a2f] text-base mb-4">Ma classe</h2>

      <section
        class="bg-secondary shadow-[1px_1px_7px_1px_rgba(0,0,0,0.16)]  md:w-[500px]  border-[#e2ddd4] rounded-lg p-5 mb-5">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8  rounded-md flex items-center justify-center   shrink-0">

            <svg class="" width="500px" height="500px" viewBox="0 0 24 24" fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <path
                d="M21 10L12 5L3 10L6 11.6667M21 10L18 11.6667M21 10V10C21.6129 10.3064 22 10.9328 22 11.618V16.9998M6 11.6667L12 15L18 11.6667M6 11.6667V17.6667L12 21L18 17.6667L18 11.6667"
                stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <div>
            <p class="font-bold font-body text-[0.95rem] text-">{{ classe.nom }}</p>
            <p class="text-xs font-body text-black mt-0.5">{{ classe.filiere }}</p>
          </div>
        </div>
      </section>

      <!-- Mes sessions à venir -->
      <div class="flex items-center md:w-[500px] justify-between ">
        <h2 class="font-['Roboto'] text-xl my-4 font-bold text-[#1e3a2f] text-base">Mes sessions à venir</h2>

        <!-- <a href="#" class="text-xs font-medium text-primary font-['Roboto'] hover:underline">Voir tout</a> -->
      </div>
     <section class="md:w-[500px] lg:w-full border-[#e2ddd4] rounded-lg  mb-5">

  <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
    
    <div
      v-for="session in sessions"
      :key="session.id"
      class="flex flex-col justify-between shadow-[1px_1px_7px_1px_rgba(0,0,0,0.16)] p-4 bg-white rounded-lg transition-all duration-200  hover:-translate-y-0.2"
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
          :class="session.statut === 'En cours'
            ? 'bg-amber-100 text-amber-700'
            : 'bg-gray-100 text-gray-600'"
        >
          {{ session.statut }}
        </span>

        <button
          class="bg-primary text-white text-[0.8rem] font-semibold px-4 py-1.5 rounded-md hover:bg-primary/80 transition"
          :disabled="session.statut !== 'À venir' && session.statut !== 'En cours'"
          @click="rejoindreSession(session)"
        >
          Rejoindre
        </button>

      </div>
    </div>

  </div>
</section>

    </StudentLayout>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const classe = ref({
  nom: 'L2 Informatique',
  filiere: 'Filière Informatique',
})

const sessions = ref([
  {
    id: 1,
    titre: 'Mathématiques - Fonctions & Limites',
    date: "Aujourd'hui · 14:00 – 15:00",
    statut: 'À venir',

  },
  {
    id: 2,
    titre: 'Histoire - Révolution Française',
    date: '18 Sept. 2025 · 10:00 – 11:00',
    statut: 'À venir',
  },
  {
    id: 3,
    titre: 'Algorithmique - Tri et Complexité',
    date: '20 Sept. 2025 · 08:00 – 09:30',
    statut: 'À venir',
  },
])

function rejoindreSession(session) {
  console.log('Rejoindre session :', session.titre)
}
</script>