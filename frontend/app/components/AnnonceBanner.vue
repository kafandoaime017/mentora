<template>
  <Teleport to="body">
    <Transition name="annonce-modal">
      <!-- Pas de @click.self ni de touche Échap : ce modal ne peut être fermé
           que via les boutons d'action prévus (voir logique ci-dessous). -->
      <div v-if="courante" class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
          <div class="bg-amber-200 p-5">
            <div class="flex items-center gap-2 mb-2 flex-wrap">
              <span
                class="shrink-0 text-[10px] font-body font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
                :class="courante.type === 'sondage' ? 'bg-[#4a7c5e] text-white' : 'bg-[#054348] text-white'"
              >
                {{ courante.type === 'sondage' ? 'Sondage' : 'Annonce' }}
              </span>
              <span v-if="courante.type === 'sondage' && courante.obligatoire" class="text-[10px] font-body font-semibold text-red-700">
                Réponse obligatoire
              </span>
            </div>
            <h3 class="font-body font-bold text-[#1e3a2f] text-base leading-snug">{{ courante.titre }}</h3>
          </div>

          <div class="p-5">
            <p class="font-body text-sm text-gray-700 mb-4 whitespace-pre-line">{{ courante.contenu }}</p>

            <!-- Sondage : options (répondre ferme le modal) -->
            <div v-if="courante.type === 'sondage'" class="space-y-2">
              <button
                v-for="(option, idx) in courante.options" :key="idx"
                @click="voter(idx)"
                :disabled="envoiEnCours"
                class="w-full text-left px-3 py-2.5 rounded-lg bg-gray-50 hover:bg-amber-100 font-body text-sm text-gray-700 transition-colors disabled:opacity-50"
              >
                {{ option }}
              </button>

              <!-- Sondage facultatif uniquement : possibilité de répondre plus tard -->
              <button
                v-if="!courante.obligatoire"
                @click="ignorer"
                :disabled="envoiEnCours"
                class="w-full mt-1 px-4 py-2 bg-transparent text-gray-400 hover:text-gray-600 text-xs font-body font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                Répondre plus tard
              </button>
            </div>

            <!-- Annonce simple : seul "J'ai compris" ferme le modal -->
            <button
              v-else
              @click="ignorer"
              :disabled="envoiEnCours"
              class="w-full px-4 py-2.5 bg-[#054348] text-white text-sm font-body font-semibold rounded-lg hover:bg-[#054348]/80 transition-colors disabled:opacity-50"
            >
              J'ai compris
            </button>

            <div v-if="queue.length > 1" class="text-[10px] font-body text-gray-400 mt-3 text-center">
              {{ queue.length - 1 }} autre{{ queue.length - 1 > 1 ? 's' : '' }} annonce{{ queue.length - 1 > 1 ? 's' : '' }} en attente
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAnnouncements } from '../../composables/useAnnouncements'
import { useToast } from '../../composables/useToast'

const { getAnnoncesActives, marquerVue, repondreSondage } = useAnnouncements()
const toast = useToast()

const queue = ref([])
const envoiEnCours = ref(false)

const courante = computed(() => queue.value[0] || null)

// Bloque le scroll de la page tant qu'un modal d'annonce est affiché
watch(courante, (val) => {
  if (typeof document !== 'undefined') {
    document.body.style.overflow = val ? 'hidden' : ''
  }
})

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

<style scoped>
.annonce-modal-enter-active { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.annonce-modal-leave-active { transition: all 0.2s ease-in; }
.annonce-modal-enter-from   { opacity: 0; transform: scale(0.85); }
.annonce-modal-leave-to     { opacity: 0; transform: scale(0.9); }
</style>
