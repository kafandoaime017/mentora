<template>
  <Teleport to="body">
    <Transition name="avatar-backdrop">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/50"
        @click.self="close"
      >
        <Transition name="avatar-pop" appear>
          <div
            v-if="modelValue"
            class="bg-white rounded-lg border border-gray-200 shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div class="p-5 border-b border-gray-200">
              <h3 class="font-body font-extrabold text-black text-base">{{ title }}</h3>
              <p class="font-body text-sm text-black/60 mt-1">{{ subtitle }}</p>
            </div>

            <div class="p-5">
              <!-- Aperçu courant -->
              <div class="flex items-center justify-center mb-5">
                <div class="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 flex items-center justify-center">
                  <img
                    v-if="previewUrl"
                    :src="previewUrl"
                    alt="Avatar sélectionné"
                    class="w-full h-full object-cover"
                  />
                  <svg v-else class="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/>
                  </svg>
                </div>
              </div>

              <!-- Grille d'avatars générés -->
              <div class="flex items-center justify-between mb-2">
                <p class="font-body text-xs font-semibold text-gray-500 uppercase tracking-wide">Choisir un avatar</p>
                <button
                  type="button"
                  @click="randomizeGrid"
                  class="font-body text-xs font-semibold text-primary hover:text-secondary transition-colors flex items-center gap-1"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"/>
                  </svg>
                  Autres avatars
                </button>
              </div>
              <div class="grid grid-cols-4 sm:grid-cols-5 gap-2 mb-5">
                <button
                  v-for="seed in gridSeeds"
                  :key="seed"
                  type="button"
                  @click="selectGenerated(seed)"
                  class="aspect-square rounded-full overflow-hidden border-2 transition-all"
                  :class="selectedSource === 'generated' && selectedSeed === seed
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'border-gray-200 hover:border-gray-300'"
                >
                  <img :src="dicebearUrl(seed)" :alt="'Avatar ' + seed" class="w-full h-full object-cover bg-gray-50" />
                </button>
              </div>

              <!-- Photo personnalisée -->
              <div class="border-t border-gray-200 pt-4">
                <p class="font-body text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Ou utiliser une photo</p>
                <button
                  type="button"
                  @click="fileInput?.click()"
                  class="w-full font-body text-sm font-semibold text-gray-700 border border-gray-300 rounded-lg py-2.5 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/>
                  </svg>
                  Importer une photo
                </button>
                <input
                  ref="fileInput"
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,image/webp"
                  class="hidden"
                  @change="onFileChange"
                />
              </div>

              <p v-if="errorMessage" class="font-body text-xs text-red-600 mt-3">{{ errorMessage }}</p>
            </div>

            <div class="flex items-center justify-end gap-2 px-5 py-3 bg-gray-50 border-t border-gray-200">
              <button
                v-if="allowSkip"
                type="button"
                @click="skipWithRandom"
                :disabled="saving"
                class="px-4 py-2 text-sm font-body font-semibold rounded-lg bg-white border border-gray-200 text-black hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                {{ skipLabel }}
              </button>
              <button
                v-else
                type="button"
                @click="close"
                :disabled="saving"
                class="px-4 py-2 text-sm font-body font-semibold rounded-lg bg-white border border-gray-200 text-black hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="button"
                @click="confirmSelection"
                :disabled="saving || !hasSelection"
                class="px-4 py-2 text-sm font-body font-semibold rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <div v-if="saving" class="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent"/>
                {{ saving ? 'Enregistrement...' : confirmLabel }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useAuth } from '../../composables/useAuth'

const props = defineProps({
  modelValue:    { type: Boolean, default: false },
  currentAvatar: { type: String, default: null },
  allowSkip:     { type: Boolean, default: false },
  title:         { type: String, default: 'Choisis ton avatar' },
  subtitle:      { type: String, default: 'Sélectionne un avatar généré ou importe ta propre photo.' },
  // 'save'   : enregistre directement via l'API (compte déjà existant, ex: page profil)
  // 'select' : se contente d'émettre la sélection sans appeler l'API (ex: avant création du compte)
  mode:          { type: String, default: 'save' },
  confirmLabel:  { type: String, default: 'Confirmer' },
  skipLabel:     { type: String, default: 'Passer (aléatoire)' }
})

const emit = defineEmits(['update:modelValue', 'done', 'select'])

const { updateAvatarUrl, updateAvatar } = useAuth()

const STYLE = 'avataaars'
// Teintes pastel dérivées de la palette Mentora (teal/olive/or/terracotta) -
// on évite le bleu/violet qui sort de l'identité visuelle de l'app.
const BG_COLORS = ['a8d5c4', 'd4dba0', 'e8d4a0', 'e8b9a0', 'c9f2d1', 'ffdfbf']

function randomSeed() {
  return `${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`
}

function dicebearUrl(seed) {
  const bg = BG_COLORS[Math.abs(hashCode(seed)) % BG_COLORS.length]
  return `https://api.dicebear.com/7.x/${STYLE}/svg?seed=${encodeURIComponent(seed)}&backgroundColor=${bg}`
}

function hashCode(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return hash
}

const gridSeeds = ref([])
function randomizeGrid() {
  gridSeeds.value = Array.from({ length: 10 }, () => randomSeed())
}
randomizeGrid()

const selectedSource = ref(null) // 'generated' | 'file' | null
const selectedSeed   = ref(null)
const selectedFile   = ref(null)
const filePreview    = ref(null)
const fileInput      = ref(null)
const saving         = ref(false)
const errorMessage   = ref('')

const previewUrl = computed(() => {
  if (selectedSource.value === 'generated' && selectedSeed.value) return dicebearUrl(selectedSeed.value)
  if (selectedSource.value === 'file' && filePreview.value) return filePreview.value
  return props.currentAvatar || null
})

const hasSelection = computed(() => selectedSource.value === 'generated' || selectedSource.value === 'file')

function selectGenerated(seed) {
  selectedSource.value = 'generated'
  selectedSeed.value = seed
  selectedFile.value = null
  filePreview.value = null
  errorMessage.value = ''
}

function onFileChange(event) {
  const file = event.target.files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) { errorMessage.value = 'Veuillez sélectionner une image'; return }
  if (file.size > 5 * 1024 * 1024) { errorMessage.value = "L'image ne doit pas dépasser 5MB"; return }

  errorMessage.value = ''
  selectedSource.value = 'file'
  selectedFile.value = file
  selectedSeed.value = null

  const reader = new FileReader()
  reader.onload = (e) => { filePreview.value = e.target.result }
  reader.readAsDataURL(file)
}

async function confirmSelection() {
  errorMessage.value = ''

  // Mode 'select' : pas de compte/token disponible pour l'instant, on se contente
  // de remonter le choix au parent qui l'appliquera plus tard.
  if (props.mode === 'select') {
    if (selectedSource.value === 'generated' && selectedSeed.value) {
      emit('select', { avatarUrl: dicebearUrl(selectedSeed.value), file: null })
      close()
    } else if (selectedSource.value === 'file' && selectedFile.value) {
      emit('select', { avatarUrl: null, file: selectedFile.value })
      close()
    }
    return
  }

  saving.value = true
  try {
    if (selectedSource.value === 'generated' && selectedSeed.value) {
      const result = await updateAvatarUrl(dicebearUrl(selectedSeed.value))
      if (result.success) {
        emit('done', result.user.avatar)
        close()
      } else {
        errorMessage.value = result.message || "Erreur lors de la mise à jour de l'avatar"
      }
    } else if (selectedSource.value === 'file' && selectedFile.value) {
      const result = await updateAvatar(selectedFile.value)
      if (result.success) {
        emit('done', result.user.avatar)
        close()
      } else {
        errorMessage.value = result.message || "Erreur lors de l'upload"
      }
    }
  } finally {
    saving.value = false
  }
}

async function skipWithRandom() {
  errorMessage.value = ''
  const seed = gridSeeds.value[Math.floor(Math.random() * gridSeeds.value.length)] || randomSeed()

  if (props.mode === 'select') {
    emit('select', { avatarUrl: dicebearUrl(seed), file: null })
    close()
    return
  }

  saving.value = true
  try {
    const result = await updateAvatarUrl(dicebearUrl(seed))
    if (result.success) {
      emit('done', result.user.avatar)
      close()
    } else {
      errorMessage.value = result.message || "Erreur lors de la mise à jour de l'avatar"
    }
  } finally {
    saving.value = false
  }
}

function close() {
  emit('update:modelValue', false)
}

watch(() => props.modelValue, (open) => {
  if (open) {
    selectedSource.value = null
    selectedSeed.value = null
    selectedFile.value = null
    filePreview.value = null
    errorMessage.value = ''
    randomizeGrid()
  }
})
</script>

<style scoped>
.avatar-backdrop-enter-active,
.avatar-backdrop-leave-active {
  transition: opacity 0.2s ease;
}
.avatar-backdrop-enter-from,
.avatar-backdrop-leave-to {
  opacity: 0;
}

.avatar-pop-enter-active {
  transition: opacity 0.22s ease, transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.avatar-pop-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.avatar-pop-enter-from {
  opacity: 0;
  transform: scale(0.92) translateY(12px);
}
.avatar-pop-leave-to {
  opacity: 0;
  transform: scale(0.96) translateY(4px);
}
</style>
