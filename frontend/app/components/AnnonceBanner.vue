<template>
  <div v-if="courante" class="mb-4 rounded-xl overflow-hidden bg-amber-50">
    <div class="p-4">
      <div class="flex items-start justify-between gap-3 mb-2">
        <div class="flex items-center gap-2">
          <span class="shrink-0 text-[10px] font-body font-bold uppercase tracking-wide px-2 py-0.5 rounded-full" :class="courante.type === 'sondage' ? 'bg-[#4a7c5e] text-white' : 'bg-[#054348] text-white'">
            {{ courante.type === 'sondage' ? 'Sondage' : 'Annonce' }}
          </span>
          <span v-if="courante.type === 'sondage' && courante.obligatoire" class="text-[10px] font-body font-semibold text-red-600">Réponse obligatoire</span>
        </div>
        <button
          v-if="!(courante.type === 'sondage' && courante.obligatoire)"
          @click="ignorer"
          class="text-gray-400 hover:text-gray-600 shrink-0"
          title="Fermer"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      <h3 class="font-body font-bold text-[#1e3a2f] text-sm mb-1">{{ courante.titre }}</h3>
      <p class="font-body text-sm text-gray-700 mb-3 whitespace-pre-line">{{ courante.contenu }}</p>

      <!-- Sondage : options -->
      <div v-if="courante.type === 'sondage'" class="space-y-2">
        <button
          v-for="(option, idx) in courante.options" :key="idx"
          @click="voter(idx)"
          :disabled="envoiEnCours"
          class="w-full text-left px-3 py-2 rounded-lg bg-white border border-[#e2ddd4] hover:border-[#4a7c5e] hover:bg-[#4a7c5e]/5 font-body text-sm text-gray-700 transition-colors disabled:opacity-50"
        >
          {{ option }}
        </button>
      </div>

      <!-- Info : simple accusé de réception -->
      <button
        v-else
        @click="ignorer"
        :disabled="envoiEnCours"
        class="px-4 py-1.5 bg-[#054348] text-white text-xs font-body font-semibold rounded-lg hover:bg-[#054348]/80 transition-colors disabled:opacity-50"
      >
        J'ai compris
      </button>

      <div v-if="queue.length > 1" class="text-[10px] font-body text-gray-400 mt-2">
        {{ queue.length - 1 }} autre{{ queue.length - 1 > 1 ? 's' : '' }} annonce{{ queue.length - 1 > 1 ? 's' : '' }} en attente
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAnnouncements } from '../../composables/useAnnouncements'
import { useToast } from '../../composables/useToast'

const { getAnnoncesActives, marquerVue, repondreSondage } = useAnnouncements()
const toast = useToast()

const queue = ref([])
const envoiEnCours = ref(false)

const courante = computed(() => queue.value[0] || null)

const charger = async () => {
  const result = await getAnnoncesActives()
  if (result.success) queue.value = result.data || []
}

const ignorer = async () => {
  if (!courante.value) return
  envoiEnCours.value = true
  const result = await marquerVue(courante.value.id)
  envoiEnCours.value = false
  if (result.success) {
    queue.value.shift()
  } else {
    toast.error(result.message || 'Erreur')
  }
}

const voter = async (optionIndex) => {
  if (!courante.value) return
  envoiEnCours.value = true
  const result = await repondreSondage(courante.value.id, optionIndex)
  envoiEnCours.value = false
  if (result.success) {
    toast.success('Réponse enregistrée, merci !')
    queue.value.shift()
  } else {
    toast.error(result.message || 'Erreur')
  }
}

onMounted(charger)
</script>
