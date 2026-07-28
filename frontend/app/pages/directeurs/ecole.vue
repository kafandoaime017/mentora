<template>
  <div class="bg-layout font-body min-h-screen">
    <AdminLayout>
      <div class="max-w-2xl mx-auto">

        <h1 class="text-2xl font-extrabold font-body text-black mb-6">Mon établissement</h1>

        <div v-if="loading" class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-2 border-blacky border-t-transparent"/>
        </div>

        <div v-else class="space-y-6">

          <!-- Logo -->
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <h3 class="font-bold font-body text-black mb-4">Logo de l'établissement</h3>
            <div class="flex items-center gap-4">
              <div class="w-20 h-20 rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden bg-gray-50 shrink-0">
                <img v-if="logoPreview" :src="logoPreview" class="w-full h-full object-cover" />
                <svg v-else class="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
              </div>
              <div>
                <button type="button" @click="logoInput?.click()" :disabled="uploadingLogo"
                  class="text-sm font-body font-semibold text-blacky hover:underline disabled:opacity-50">
                  {{ uploadingLogo ? 'Envoi...' : (logoPreview ? 'Changer le logo' : 'Ajouter un logo') }}
                </button>
                <input ref="logoInput" type="file" accept="image/jpeg,image/png,image/jpg,image/webp" class="hidden" @change="onLogoChange"/>
              </div>
            </div>
          </div>

          <!-- Infos -->
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <h3 class="font-bold font-body text-black mb-4">Informations</h3>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-body font-semibold text-black mb-1">Nom de l'établissement *</label>
                <input
                  v-model="form.nom"
                  type="text"
                  placeholder="Ex: ESGI Paris"
                  class="w-full px-4 py-3 bg-input rounded-lg text-sm font-body focus:outline-none"
                />
              </div>
              <div>
                <label class="block font-body text-sm font-semibold text-black mb-1">Ville</label>
                <input
                  v-model="form.ville"
                  type="text"
                  placeholder="Ex: Paris"
                  class="w-full px-4 py-3 bg-input rounded-lg text-sm font-body focus:outline-none"
                />
              </div>
              <div>
                <label class="block font-body text-sm font-semibold text-black mb-1">Adresse</label>
                <input
                  v-model="form.adresse"
                  type="text"
                  placeholder="Ex: 12 rue des Écoles, 75005 Paris"
                  class="w-full px-4 py-3 bg-input rounded-lg text-sm font-body focus:outline-none"
                />
              </div>
              <div>
                <label class="block font-body text-sm font-semibold text-black mb-1">Téléphone</label>
                <div class="flex gap-2">
                  <select v-model="form.indicatif" class="px-2 py-3 bg-input rounded-lg text-sm font-body focus:outline-none shrink-0 w-28">
                    <option v-for="c in countries" :key="c.iso" :value="c.dial">{{ c.flag }} {{ c.dial }}</option>
                  </select>
                  <input
                    v-model="form.numero"
                    type="tel"
                    placeholder="6 12 34 56 78"
                    class="flex-1 min-w-0 px-4 py-3 bg-input rounded-lg text-sm font-body focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Stats structure -->
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <h3 class="font-bold font-body text-black mb-4">Structure</h3>
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-blacky/80 rounded-md p-4 text-center">
                <p class="text-2xl font-body font-extrabold text-white">{{ ecole?.filieres?.length || 0 }}</p>
                <p class="text-md font-body text-white mt-1">Filières</p>
              </div>
              <div class="bg-secondary rounded-md p-4 text-center">
                <p class="text-2xl font-body font-extrabold text-white">{{ totalClasses }}</p>
                <p class="text-md font-body text-white mt-1">Classes</p>
              </div>
            </div>
            <nuxt-link
              to="/directeurs/structure"
              class="mt-4 font-body underline flex items-center justify-center gap-2 text-sm text-blacky hover:underline font-semibold"
            >
              Gérer les filières et classes
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </nuxt-link>
          </div>

          <!-- Bouton save -->
          <div class="flex justify-end">
            <button
              @click="saveEcole"
              :disabled="saving"
              class="flex items-center gap-2 bg-blacky text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-[#312e81] disabled:opacity-50 transition-colors"
            >
              <div v-if="saving" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"/>
              {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
            </button>
          </div>

        </div>
      </div>
    </AdminLayout>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from '~~/composables/useToast'
import { countries, defaultCountry } from '~~/app/utils/countries'

const toast = useToast()
const loading = ref(true)
const saving  = ref(false)
const ecole   = ref(null)
const form    = ref({ nom: '', ville: '', adresse: '', indicatif: defaultCountry.dial, numero: '' })

const logoInput     = ref(null)
const logoPreview   = ref('')
const uploadingLogo = ref(false)

const apiFetch = async (url, options = {}) => {
  const config = useRuntimeConfig()
  const token = useCookie('auth_token').value
  return await $fetch(`${config.public.apiBase}${url}`, {
    ...options,
    headers: { 'Authorization': `Bearer ${token}`, ...options.headers }
  })
}

const logoUrl = (path) => {
  if (!path) return ''
  const config = useRuntimeConfig()
  return path.startsWith('http') ? path : `${config.public.apiBase.replace(/\/api$/, '')}${path}`
}

// Sépare une valeur "telephone" stockée (ex: "+225 0102030405") en indicatif + numéro
const parseTelephone = (telephone) => {
  if (!telephone) return { indicatif: defaultCountry.dial, numero: '' }
  const [indicatif, ...rest] = telephone.trim().split(' ')
  return { indicatif: indicatif || defaultCountry.dial, numero: rest.join(' ') }
}

const totalClasses = computed(() =>
  ecole.value?.filieres?.reduce((sum, f) => sum + (f.classes?.length || 0), 0) || 0
)

const loadEcole = async () => {
  loading.value = true
  try {
    const result = await apiFetch('/admin/ecole')
    if (result.success && result.data) {
      ecole.value  = result.data
      const { indicatif, numero } = parseTelephone(result.data.telephone)
      form.value   = {
        nom:       result.data.nom     || '',
        ville:     result.data.ville   || '',
        adresse:   result.data.adresse || '',
        indicatif,
        numero
      }
      logoPreview.value = logoUrl(result.data.logo)
    }
  } finally {
    loading.value = false
  }
}

const onLogoChange = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  uploadingLogo.value = true
  try {
    const formData = new FormData()
    formData.append('logo', file)
    const config = useRuntimeConfig()
    const token  = useCookie('auth_token').value
    const result = await $fetch(`${config.public.apiBase}/admin/ecole/logo`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    })
    if (result.success) {
      logoPreview.value = logoUrl(result.data.logo)
      toast.success('Logo mis à jour')
    } else {
      toast.error(result.message || "Erreur lors de l'envoi du logo")
    }
  } catch (err) {
    toast.error(err?.data?.message || "Erreur lors de l'envoi du logo")
  } finally {
    uploadingLogo.value = false
    if (logoInput.value) logoInput.value.value = ''
  }
}

const saveEcole = async () => {
  if (!form.value.nom.trim()) {
    toast.error('Le nom est requis')
    return
  }
  saving.value = true
  try {
    await apiFetch('/admin/ecole', {
      method: 'PUT',
      body: {
        nom: form.value.nom,
        ville: form.value.ville,
        adresse: form.value.adresse,
        telephone: form.value.numero.trim() ? `${form.value.indicatif} ${form.value.numero.trim()}` : ''
      }
    })
    toast.success('Établissement mis à jour')
  } catch {
    toast.error('Erreur lors de la sauvegarde')
  } finally {
    saving.value = false
  }
}

onMounted(() => loadEcole())
</script>