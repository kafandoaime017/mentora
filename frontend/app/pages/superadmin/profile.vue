<template>
  <div class="bg-[#f5f0e8] font-body">
    <SuperadminLayout>

      <div class="max-w-2xl mx-auto">
        <h2 class="font-body text-xl font-extrabold text-[#1e3a2f] mb-2">Mon profil</h2>

        <!-- AVATAR -->
        <div class="p-6 mb-3">
          <div class="flex flex-col items-center justify-center">
            <div class="relative">
              <div class="w-28 h-28 rounded-full bg-gradient-to-br from-[#1e3a2f] to-[#4a7c5e] flex items-center justify-center overflow-hidden">
                <img
:src="avatarURL"
                  alt="Avatar"
                  class="w-full h-full object-cover"
                />
              </div>
              <div v-if="avatarLoading" class="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                <div class="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"/>
              </div>
            </div>
            <button
              @click="changerAvatar"
              :disabled="avatarLoading"
              class="text-md font-body text-primary hover:text-[#1e3a2f] font-semibold transition-colors duration-200 mt-2"
            >
              {{ avatarLoading ? 'Chargement...' : "Changer d'avatar" }}
            </button>
            <input ref="avatarInput" type="file" accept="image/jpeg,image/png,image/jpg,image/webp" class="hidden" @change="onAvatarChange"/>
          </div>
        </div>

        <!-- INFORMATIONS -->
        <div class="bg-white border border-[#e2ddd4] rounded-lg overflow-hidden">

          <!-- Nom -->
          <div class="border-b font-body border-gray-200">
            <div class="p-4 flex items-center justify-between">
              <div class="flex-1">
                <p class="text-xs font-semibold text-[#9b9589] uppercase tracking-wide mb-1">Nom</p>
                <p class="text-base font-medium text-[#1e3a2f]">{{ userData.nom }}</p>
              </div>
              <button @click="ouvrirModalModification('nom')" class="text-[#4a7c5e] hover:text-[#1e3a2f] transition-colors p-2 rounded-full hover:bg-[#e2ddd4]">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Prénom -->
          <div class="border-b font-body border-gray-200">
            <div class="p-4 flex items-center justify-between">
              <div class="flex-1">
                <p class="text-xs font-semibold text-[#9b9589] uppercase tracking-wide mb-1">Prénom</p>
                <p class="text-base font-medium text-[#1e3a2f]">{{ userData.prenom }}</p>
              </div>
              <button @click="ouvrirModalModification('prenom')" class="text-[#4a7c5e] hover:text-[#1e3a2f] transition-colors p-2 rounded-full hover:bg-[#e2ddd4]">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- École (verrouillé) -->
          <div class="border-b font-body border-[#e2ddd4] bg-gray-50/30">
            <div class="p-4 flex items-center justify-between">
              <div class="flex-1">
                <p class="text-xs font-semibold text-[#9b9589] uppercase tracking-wide mb-1">École</p>
                <p class="text-base font-medium text-[#1e3a2f]">{{ userData.ecole || 'Non renseignée' }}</p>
              </div>
              <svg class="w-5 h-5 text-[#9b9589]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
            </div>
          </div>

          <!-- Email (verrouillé) -->
          <div class="border-b font-body border-[#e2ddd4] bg-gray-50/30">
            <div class="p-4 flex items-center justify-between">
              <div class="flex-1">
                <p class="text-xs font-semibold text-[#9b9589] uppercase tracking-wide mb-1">Email</p>
                <p class="text-base font-medium text-[#1e3a2f]">{{ userData.email }}</p>
              </div>
              <svg class="w-5 h-5 text-[#9b9589]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
            </div>
          </div>

          <!-- Classe (verrouillé) -->
          <div class="border-b font-body border-[#e2ddd4] bg-gray-50/30">
            <div class="p-4 flex items-center justify-between">
              <div class="flex-1">
                <p class="text-xs font-semibold text-[#9b9589] uppercase tracking-wide mb-1">Classe</p>
                <p class="text-base font-medium text-[#1e3a2f]">{{ userData.classe || 'Non renseignée' }}</p>
              </div>
              <svg class="w-5 h-5 text-[#9b9589]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
            </div>
          </div>

          <!-- Filière (verrouillé) -->
          <div class="bg-gray-50/30 font-body">
            <div class="p-4 flex items-center justify-between">
              <div class="flex-1">
                <p class="text-xs font-semibold text-[#9b9589] uppercase tracking-wide mb-1">Filière</p>
                <p class="text-base font-medium text-[#1e3a2f]">{{ userData.filiere || 'Non renseignée' }}</p>
              </div>
              <svg class="w-5 h-5 text-[#9b9589]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- Boutons actions -->
        <div class="flex flex-col items-center gap-3 my-8">
          <button
            @click="ouvrirModalMdp"
            class="text-md font-body border border-primary px-10 py-2 text-primary rounded-lg hover:text-white hover:bg-primary font-semibold transition-colors duration-200"
          >
            Changer le mot de passe
          </button>
          <button
            @click="handleLogout"
            class="text-md font-body border border-red-500 px-10 py-2 text-red-500 rounded-lg hover:text-white hover:bg-red-600 font-semibold transition-colors duration-200"
          >
            Se déconnecter
          </button>
        </div>

        <!-- MODAL MODIFICATION NOM/PRÉNOM -->
        <div v-if="modalVisible" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="fermerModal">
          <div class="bg-white rounded-lg border border-gray-200 max-w-md w-full">
            <div class="border-b border-[#e2ddd4] p-4">
              <h3 class="text-lg font-body font-bold text-[#1e3a2f]">
                Modifier {{ champActuel === 'nom' ? 'le nom' : 'le prénom' }}
              </h3>
            </div>
            <div class="p-4">
              <label class="block font-body text-sm font-semibold text-[#1e3a2f] mb-2">
                Nouveau {{ champActuel === 'nom' ? 'nom' : 'prénom' }}
              </label>
              <input
                v-model="nouvelleValeur"
                type="text"
                class="w-full font-body pl-4 pr-4 py-3 text-sm text-black placeholder-gray-600 bg-input rounded-lg focus:outline-none"
                :placeholder="champActuel === 'nom' ? 'Entrez votre nouveau nom' : 'Entrez votre nouveau prénom'"
                @keyup.enter="validerModification"
              />
            </div>
            <div class="border-t border-[#e2ddd4] p-4 flex gap-3 justify-end">
              <button @click="fermerModal" class="px-4 py-2 border font-body border-red-400 rounded-lg text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors">
                Annuler
              </button>
              <button
                @click="validerModification"
                :disabled="loading || !nouvelleValeur.trim()"
                class="px-4 py-2 bg-secondary text-white rounded-lg text-sm font-semibold hover:bg-[#4a7c5e] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {{ loading ? 'Enregistrement...' : 'Enregistrer' }}
              </button>
            </div>
          </div>
        </div>

        <!-- MODAL CHANGEMENT MOT DE PASSE -->
        <div v-if="modalMdpVisible" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="fermerModalMdp">
          <div class="bg-white rounded-lg border border-gray-200 max-w-md w-full">

            <div class="border-b border-[#e2ddd4] p-4 flex items-center justify-between">
              <h3 class="text-base font-body font-bold text-[#1e3a2f]">Changer le mot de passe</h3>
              <button @click="fermerModalMdp" class="text-black hover:text-black">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <div class="p-5">

              <!-- Étape 1 : envoyer le code -->
              <div v-if="mdpStep === 1" class="text-center">
                <div class="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg class="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                </div>
                <p class="text-sm text-black font-body mb-1">Un code sera envoyé à</p>
                <p class="font-bold text-black font-body mb-6">{{ userData.email }}</p>
                <div v-if="mdpErreur" class="bg-red-50 text-red-600 text-xs font-body rounded-lg px-4 py-2 mb-3">{{ mdpErreur }}</div>
                <button
                  @click="envoyerCode"
                  :disabled="mdpLoading"
                  class="w-full py-2.5 bg-primary text-white rounded-lg font-body font-semibold hover:bg-primary/80 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <div v-if="mdpLoading" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"/>
                  <span v-else>Envoyer le code</span>
                </button>
              </div>

              <!-- Étape 2 : saisir code + nouveau mdp -->
              <div v-else-if="mdpStep === 2" class="space-y-4">
                 <div class="bg-green-100 rounded-md px-4 py-2.5 text-center">
                  <p class="text-sm font-bold text-green-800 font-body">Code envoyé à <strong>{{ userData.email }}</strong></p>
                  <p class="text-sm font-bold text-green-800 font-body mt-0.5">Valable 10 minutes</p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-black font-body mb-1">Code à 6 chiffres</label>
                  <input
                    v-model="mdpCode"
                    type="text"
                    inputmode="numeric"
                    maxlength="6"
                    placeholder="000000"
                    @input="mdpCode = mdpCode.replace(/\D/g, '').slice(0, 6)"
                    class="w-full px-4 py-3 bg-input rounded-lg text-center text-2xl font-mono font-bold tracking-[0.4em] focus:outline-none"
                    autofocus
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-black font-body mb-1">Nouveau mot de passe</label>
                  <div class="relative">
                    <input
                      v-model="mdpNouveau"
                      :type="showMdp ? 'text' : 'password'"
                      placeholder="Minimum 8 caractères"
                      class="w-full px-4 py-3 pr-12 bg-input rounded-lg text-sm font-body focus:outline-none"
                    />
                    <button type="button" @click="showMdp = !showMdp" class="absolute inset-y-0 right-0 pr-4 flex items-center text-black">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path v-if="!showMdp" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                        <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-black font-body mb-1">Confirmer</label>
                  <input
                    v-model="mdpConfirmation"
                    :type="showMdp ? 'text' : 'password'"
                    placeholder="Répétez le mot de passe"
                    class="w-full px-4 py-3 bg-input rounded-lg text-sm font-body focus:outline-none"
                    :class="{ 'border-2 border-red-300': mdpConfirmation && mdpNouveau !== mdpConfirmation }"
                  />
                  <p v-if="mdpConfirmation && mdpNouveau !== mdpConfirmation" class="text-xs text-red-500 mt-1 font-body">
                    Les mots de passe ne correspondent pas
                  </p>
                </div>

                <div v-if="mdpErreur" class="bg-red-50 text-red-600 text-xs font-body rounded-lg px-4 py-2">
                  {{ mdpErreur }}
                </div>

                <div class="flex gap-3 pt-1">
                  <button
                    @click="mdpStep = 1; mdpErreur = ''"
                    class="flex-1 py-2.5 bg-gray-100 text-black rounded-lg text-sm font-body font-semibold hover:bg-gray-200 transition"
                  >Retour</button>
                  <button
                    @click="validerChangementMdp"
                    :disabled="mdpLoading || mdpCode.length !== 6 || mdpNouveau.length < 8 || mdpNouveau !== mdpConfirmation"
                    class="flex-1 py-2.5 bg-primary text-white rounded-lg text-sm font-body font-semibold hover:bg-primary/80 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <div v-if="mdpLoading" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"/>
                    <span v-else>Modifier</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

        <!-- Toast notification -->
        <div
          v-if="notification.show"
          class="fixed bottom-4 right-4 px-4 py-2 rounded-lg text-white z-50 font-body text-sm"
          :class="notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'"
        >
          {{ notification.message }}
        </div>

      </div>
    </SuperadminLayout>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useAuth } from '../../../composables/useAuth'

const { getUser, getProfile, updateProfile, updateAvatar, logout, envoyerCodeChangementMdp, changerMotDePasse } = useAuth()

// ─── Données utilisateur ──────────────────────────────────────────────────────
const userData = reactive({
  id:      null,
  nom:     '',
  prenom:  '',
  email:   '',
  avatar:  null,
  ecole:   '',
  classe:  '',
  filiere: ''
})

const loading       = ref(false)
const avatarLoading = ref(false)
const avatarPreview = ref(null)
const avatarInput   = ref(null)
const notification  = ref({ show: false, message: '', type: 'success' })

// ─── Modal nom/prénom ─────────────────────────────────────────────────────────
const modalVisible  = ref(false)
const champActuel   = ref('')
const nouvelleValeur = ref('')

// ─── Modal mot de passe ───────────────────────────────────────────────────────
const modalMdpVisible = ref(false)
const mdpStep         = ref(1)
const mdpLoading      = ref(false)
const mdpCode         = ref('')
const mdpNouveau      = ref('')
const mdpConfirmation = ref('')
const mdpErreur       = ref('')
const showMdp         = ref(false)

const avatarURL = computed(() => {
  if (!userData.avatar) return ''

  if (userData.avatar.startsWith('http')) {
    return userData.avatar
  }

  return `http://localhost:5000${userData.avatar}`
})

// ─── Utils ────────────────────────────────────────────────────────────────────
function showNotification(message, type = 'success') {
  notification.value = { show: true, message, type }
  setTimeout(() => { notification.value.show = false }, 3000)
}

// ─── Chargement profil ────────────────────────────────────────────────────────
async function loadUserData() {
  try {
    const result = await getProfile()
    if (result.success && result.user) {
      userData.id     = result.user.id
      userData.nom    = result.user.nom
      userData.prenom = result.user.prenom
      userData.email  = result.user.email
      userData.avatar = result.user.avatar
      if (result.user.profil) {
        userData.ecole   = result.user.profil.ecole   || ''
        userData.classe  = result.user.profil.classe  || ''
        userData.filiere = result.user.profil.filiere || ''
      }
    }
  } catch (error) {
    showNotification('Erreur lors du chargement du profil', 'error')
  }
}

// ─── Mise à jour nom/prénom ───────────────────────────────────────────────────
async function updateUserProfile(field, value) {
  loading.value = true
  try {
    const updateData = {}
    updateData[field] = value
    const result = await updateProfile(updateData)
    if (result.success) {
      userData[field] = value
      const currentUser = getUser()
      if (currentUser) {
        currentUser[field] = value
        localStorage.setItem('user', JSON.stringify(currentUser))
      }
      showNotification(`${field === 'nom' ? 'Nom' : 'Prénom'} mis à jour avec succès`)
      return true
    } else {
      showNotification(result.message || 'Erreur', 'error')
      return false
    }
  } catch {
    showNotification('Erreur lors de la mise à jour', 'error')
    return false
  } finally {
    loading.value = false
  }
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function changerAvatar() { avatarInput.value.click() }

async function onAvatarChange(event) {
  const file = event.target.files[0]
  if (!file) return
  if (!file.type.startsWith('image/')) { showNotification('Veuillez sélectionner une image', 'error'); return }
  if (file.size > 5 * 1024 * 1024) { showNotification("L'image ne doit pas dépasser 5MB", 'error'); return }

  const reader = new FileReader()
  reader.onload = (e) => { avatarPreview.value = e.target.result }
  reader.readAsDataURL(file)

  avatarLoading.value = true
  try {
    const result = await updateAvatar(file)
    if (result.success) {
      userData.avatar  = result.user.avatar
      avatarPreview.value = null
      showNotification('Avatar mis à jour avec succès')
      const currentUser = getUser()
      if (currentUser) {
        currentUser.avatar = result.user.avatar
        localStorage.setItem('user', JSON.stringify(currentUser))
      }
    } else {
      showNotification(result.message || "Erreur lors de l'upload", 'error')
      avatarPreview.value = null
    }
  } catch {
    showNotification("Erreur lors de l'upload", 'error')
    avatarPreview.value = null
  } finally {
    avatarLoading.value = false
    avatarInput.value.value = ''
  }
}

// ─── Modal nom/prénom ─────────────────────────────────────────────────────────
function ouvrirModalModification(champ) {
  champActuel.value   = champ
  nouvelleValeur.value = userData[champ]
  modalVisible.value  = true
}

function fermerModal() {
  modalVisible.value   = false
  champActuel.value    = ''
  nouvelleValeur.value = ''
}

async function validerModification() {
  if (nouvelleValeur.value.trim() && nouvelleValeur.value.trim() !== userData[champActuel.value]) {
    const success = await updateUserProfile(champActuel.value, nouvelleValeur.value.trim())
    if (success) fermerModal()
  } else {
    fermerModal()
  }
}

// ─── Modal mot de passe ───────────────────────────────────────────────────────
function ouvrirModalMdp() {
  mdpStep.value         = 1
  mdpCode.value         = ''
  mdpNouveau.value      = ''
  mdpConfirmation.value = ''
  mdpErreur.value       = ''
  showMdp.value         = false
  modalMdpVisible.value = true
}

function fermerModalMdp() {
  modalMdpVisible.value = false
}

async function envoyerCode() {
  mdpLoading.value = true
  mdpErreur.value  = ''
  const result = await envoyerCodeChangementMdp()
  if (result.success) {
    mdpStep.value = 2
  } else {
    mdpErreur.value = result.message || 'Erreur'
  }
  mdpLoading.value = false
}

async function validerChangementMdp() {
  mdpErreur.value = ''
  if (mdpCode.value.length !== 6)                         { mdpErreur.value = 'Entrez le code à 6 chiffres'; return }
  if (mdpNouveau.value.length < 8)                        { mdpErreur.value = 'Minimum 8 caractères'; return }
  if (mdpNouveau.value !== mdpConfirmation.value)          { mdpErreur.value = 'Les mots de passe ne correspondent pas'; return }

  mdpLoading.value = true
  const result = await changerMotDePasse(mdpCode.value, mdpNouveau.value, mdpConfirmation.value)
  if (result.success) {
    fermerModalMdp()
    showNotification('Mot de passe modifié avec succès')
  } else {
    mdpErreur.value = result.message || 'Erreur'
  }
  mdpLoading.value = false
}

// ─── Déconnexion ──────────────────────────────────────────────────────────────
async function handleLogout() { await logout() }

onMounted(() => { loadUserData() })
</script>

<style scoped>
.border-b { transition: all 0.2s ease; }
</style>