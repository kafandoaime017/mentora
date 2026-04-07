<template>
  <div class="bg-[#f5f0e8] font-body ">
    <TeacherLayout>
      
      <div class="max-w-2xl mx-auto">
        <h2 class="font-['Roboto'] text-xl font-extrabold text-[#1e3a2f] mb-2">
          Mon profil
        </h2>
        
        <!-- ══════════════════════════
             SECTION AVATAR
        ═══════════════════════════════ -->
        <div class="p-6 mb-3">
          <div class="flex flex-col items-center justify-center">
            
            <!-- Avatar avec prévisualisation -->
            <div class="relative">
              <div class="w-28 h-28 rounded-full bg-gradient-to-br from-[#1e3a2f] to-[#4a7c5e] flex items-center justify-center overflow-hidden">
              <img 
:src="avatarPreview || userData.avatar?.startsWith('http') ? userData.avatar : `http://localhost:5000${userData.avatar || ''}`" 
      alt="Avatar" 
      class="w-full h-full object-cover"
    />
              </div>
              <!-- Indicateur de chargement -->
              <div v-if="avatarLoading" class="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                <div class="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
              </div>
            </div>
            
            <!-- Lien changer d'avatar -->
            <button 
              @click="changerAvatar"
              :disabled="avatarLoading"
              class="text-md font-body text-primary hover:text-[#1e3a2f] font-semibold transition-colors duration-200 mt-2"
            >
              {{ avatarLoading ? 'Chargement...' : 'Changer d\'avatar' }}
            </button>
            
            <!-- Input file caché -->
            <input 
              ref="avatarInput" 
              type="file" 
              accept="image/jpeg,image/png,image/jpg,image/webp" 
              class="hidden" 
              @change="onAvatarChange"
            />
          </div>
        </div>


        <!-- ══════════════════════════
             SECTION INFORMATIONS
        ═══════════════════════════════ -->
        <div class="bg-white shadow-[1px_1px_7px_1px_rgba(0,0,0,0.16)] border border-[#e2ddd4] rounded-lg overflow-hidden">
          
          <!-- Nom -->
          <div class="border-b font-body border-gray-200 transition-colors">
            <div class="p-4 flex items-center justify-between">
              <div class="flex-1">
                <p class="text-xs font-semibold text-[#9b9589] uppercase tracking-wide mb-1">Nom</p>
                <p class="text-base font-medium text-[#1e3a2f]">{{ userData.nom }}</p>
              </div>
              <button 
                @click="ouvrirModalModification('nom')"
                class="text-[#4a7c5e] hover:text-[#1e3a2f] transition-colors p-2 rounded-full hover:bg-[#e2ddd4]"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Prénom -->
          <div class="border-b font-body border-gray-200 transition-colors">
            <div class="p-4 flex items-center justify-between">
              <div class="flex-1">
                <p class="text-xs font-semibold text-[#9b9589] uppercase tracking-wide mb-1">Prénom</p>
                <p class="text-base font-medium text-[#1e3a2f]">{{ userData.prenom }}</p>
              </div>
              <button 
                @click="ouvrirModalModification('prenom')"
                class="text-[#4a7c5e] hover:text-[#1e3a2f] transition-colors p-2 rounded-full hover:bg-[#e2ddd4]"
              >
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
              <div class="flex items-center gap-2 text-[#9b9589]">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
              </div>
            </div>
          </div>

          <!-- Email (verrouillé) -->
          <div class="border-b font-body border-[#e2ddd4] bg-gray-50/30">
            <div class="p-4 flex items-center justify-between">
              <div class="flex-1">
                <p class="text-xs font-semibold text-[#9b9589] uppercase tracking-wide mb-1">Email</p>
                <p class="text-base font-medium text-[#1e3a2f]">{{ userData.email }}</p>
              </div>
              <div class="flex items-center gap-2 text-[#9b9589]">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
              </div>
            </div>
          </div>

          <!-- Classe (verrouillé) -->
          <div class="border-b font-body border-[#e2ddd4] bg-gray-50/30">
            <div class="p-4 flex items-center justify-between">
              <div class="flex-1">
                <p class="text-xs font-semibold text-[#9b9589] uppercase tracking-wide mb-1">Classe</p>
                <p class="text-base font-medium text-[#1e3a2f]">{{ userData.classe || 'Non renseignée' }}</p>
              </div>
              <div class="flex items-center gap-2 text-[#9b9589]">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
              </div>
            </div>
          </div>

          <!-- Filière (verrouillé) -->
          <div class="bg-gray-50/30 font-body">
            <div class="p-4 flex items-center justify-between">
              <div class="flex-1">
                <p class="text-xs font-semibold text-[#9b9589] uppercase tracking-wide mb-1">Filière</p>
                <p class="text-base font-medium text-[#1e3a2f]">{{ userData.filiere || 'Non renseignée' }}</p>
              </div>
              <div class="flex items-center gap-2 text-[#9b9589]">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        <p class="text-center my-8">
          <button 
            @click="handleLogout"
            class="text-md font-body border border-danger px-10 py-3 text-danger rounded-lg hover:text-white hover:bg-red-600 font-semibold transition-colors duration-200"
          >
            Se déconnecter
          </button>
        </p>

        <!-- ══════════════════════════
             MODAL MODIFICATION
        ═══════════════════════════════ -->
        <div v-if="modalVisible" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="fermerModal">
          <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
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
                class="w-full font-body pl-4 pr-4 py-3 text-sm text-gray-800 placeholder-gray-600 focus:text-md focus:text-black focus:font-extrabold bg-input border-gray-200 rounded-xl focus:bg-input focus:outline-none"
                :placeholder="champActuel === 'nom' ? 'Entrez votre nouveau nom' : 'Entrez votre nouveau prénom'"
                @keyup.enter="validerModification"
              />
            </div>
            
            <div class="border-t border-[#e2ddd4] p-4 flex gap-3 justify-end">
              <button 
                @click="fermerModal"
                class="px-4 py-2 border font-body border-danger rounded-lg text-sm font-semibold text-danger hover:bg-danger hover:text-white transition-colors"
              >
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

        <!-- Notification toast -->
        <div v-if="notification.show" 
             class="fixed bottom-4 right-4 px-4 py-2 rounded-lg text-white z-50"
             :class="notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'">
          {{ notification.message }}
        </div>
      </div>
    </TeacherLayout>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useAuth } from '../../../composables/useAuth'
import { useToast } from '../../../composables/useToast'

const toast = useToast()

const { getUser, getProfile, updateProfile, updateAvatar, logout } = useAuth()

// Données utilisateur
const userData = reactive({
  id: null,
  nom: '',
  prenom: '',
  email: '',
  avatar: null,
  ecole: '',
  classe: '',
  filiere: ''
})

const loading = ref(false)
const avatarLoading = ref(false)
const avatarPreview = ref(null)
const notification = ref({ show: false, message: '', type: 'success' })

// Avatar
const avatarInput = ref(null)

// Modal
const modalVisible = ref(false)
const champActuel = ref('')
const nouvelleValeur = ref('')

function showNotification(message, type = 'success') {
  notification.value = { show: true, message, type }
  setTimeout(() => {
    notification.value.show = false
  }, 3000)
}

async function loadUserData() {
  try {
    const result = await getProfile()
    if (result.success && result.user) {
      userData.id = result.user.id
      userData.nom = result.user.nom
      userData.prenom = result.user.prenom
      userData.email = result.user.email
      userData.avatar = result.user.avatar
      
      if (result.user.profil) {
        userData.ecole = result.user.profil.ecole || ''
        userData.classe = result.user.profil.classe || ''
        userData.filiere = result.user.profil.filiere || ''
      }
    }
  } catch (error) {
    console.error('Erreur chargement profil:', error)
    showNotification('Erreur lors du chargement du profil', 'error')
  }
}

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
      
    //   showNotification(`${field === 'nom' ? 'Nom' : 'Prénom'} mis à jour avec succès`, 'success')
      toast.success(`${field === 'nom' ? 'Nom' : 'Prénom'} mis à jour avec succès`)
      return true
    } else {
      showNotification(result.message || 'Erreur lors de la mise à jour', 'error')
      return false
    }
  } catch (error) {
    console.error('Erreur update:', error)
    showNotification('Erreur lors de la mise à jour', 'error')
    return false
  } finally {
    loading.value = false
  }
}

function changerAvatar() {
  avatarInput.value.click()
}

async function onAvatarChange(event) {
  const file = event.target.files[0]
  if (!file) return
  
  // Vérifier le type
  if (!file.type.startsWith('image/')) {
    showNotification('Veuillez sélectionner une image', 'error')
    return
  }
  
  // Vérifier la taille (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    showNotification('L\'image ne doit pas dépasser 5MB', 'error')
    return
  }
  
  // Prévisualisation
  const reader = new FileReader()
  reader.onload = (e) => {
    avatarPreview.value = e.target.result
  }
  reader.readAsDataURL(file)
  
  // Upload
  avatarLoading.value = true
  try {
    const result = await updateAvatar(file)
    
    if (result.success) {
      userData.avatar = result.user.avatar
      avatarPreview.value = null
      showNotification('Avatar mis à jour avec succès', 'success')
      
      // Mettre à jour le localStorage
      const currentUser = getUser()
      if (currentUser) {
        currentUser.avatar = result.user.avatar
        localStorage.setItem('user', JSON.stringify(currentUser))
      }
    } else {
      showNotification(result.message || 'Erreur lors de l\'upload', 'error')
      avatarPreview.value = null
    }
  } catch (error) {
    console.error('Erreur upload:', error)
    showNotification('Erreur lors de l\'upload', 'error')
    avatarPreview.value = null
  } finally {
    avatarLoading.value = false
    // Reset input
    avatarInput.value.value = ''
  }
}

function ouvrirModalModification(champ) {
  champActuel.value = champ
  nouvelleValeur.value = userData[champ]
  modalVisible.value = true
}

function fermerModal() {
  modalVisible.value = false
  champActuel.value = ''
  nouvelleValeur.value = ''
}

async function validerModification() {
  if (nouvelleValeur.value.trim() && nouvelleValeur.value.trim() !== userData[champActuel.value]) {
    const success = await updateUserProfile(champActuel.value, nouvelleValeur.value.trim())
    if (success) {
      fermerModal()
    }
  } else {
    fermerModal()
  }
}

async function handleLogout() {
  await logout()
}

onMounted(() => {
  loadUserData()
})
</script>

<style scoped>
.border-b {
  transition: all 0.2s ease;
}
</style>