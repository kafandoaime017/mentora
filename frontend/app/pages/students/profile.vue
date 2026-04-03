<template>
  <div class="bg-[#f5f0e8] font-body ">
    <StudentLayout>
      
      <!-- Titre page -->
      

      <div class="max-w-2xl mx-auto">
        <h2 class="font-['Roboto'] text-xl font-extrabold text-[#1e3a2f] mb-2">
        Mon profil
      </h2>
        <!-- ══════════════════════════
             SECTION AVATAR
        ═══════════════════════════════ -->
        <div class=" p-6 mb-3">
          <div class="flex flex-col items-center justify-center">
            
            <!-- Avatar -->
            <div class="relative ">
              <div class="w-28 h-28 rounded-full bg-gradient-to-br from-[#1e3a2f] to-[#4a7c5e] flex items-center justify-center overflow-hidden">
                
                <img 
                 src="https://img.freepik.com/premium-photo/young-student-avatar-generative-ai_138015-2404.jpg" 
                  alt="Avatar" 
                  class="w-full h-full object-cover"
                />
              </div>
            </div>
            
            <!-- Lien changer d'avatar -->
            <button 
              @click="changerAvatar"
              class="text-md font-body text-primary hover:text-[#1e3a2f] font-semibold transition-colors duration-200"
            >
              Changer d'avatar
            </button>
            
            <!-- Input file caché -->
            <input 
              ref="avatarInput" 
              type="file" 
              accept="image/*" 
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
          <div class="border-b font-body border-gray-200  transition-colors">
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
          <div class="border-b font-body border-gray-200  transition-colors">
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
                <p class="text-base font-medium text-[#1e3a2f]">{{ userData.ecole }}</p>
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
                <p class="text-base font-medium text-[#1e3a2f]">{{ userData.classe }}</p>
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
                <p class="text-base font-medium text-[#1e3a2f]">{{ userData.filiere }}</p>
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
              @click="changerAvatar"
              class="text-md font-body border border-danger  px-10 py-3 text-danger rounded-lg hover:text-white  hover:bg-red-600 font-semibold transition-colors duration-200"
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
                :disabled="!nouvelleValeur.trim()"
                class="px-4 py-2 bg-secondary text-white rounded-lg text-sm font-semibold hover:bg-[#4a7c5e] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>

      </div>

    </StudentLayout>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

// Données utilisateur
const userData = reactive({
  nom: 'Diallo',
  prenom: 'Amadou',
  ecole: 'Université Numérique',
  email: 'amadou.diallo@etu.univ.edu',
  classe: 'Master 1',
  filiere: 'Informatique - Génie Logiciel'
})

// Avatar
const avatarUrl = ref(null)
const avatarInput = ref(null)

// Modal
const modalVisible = ref(false)
const champActuel = ref('')
const nouvelleValeur = ref('')

// Changer d'avatar
function changerAvatar() {
  avatarInput.value.click()
}

function onAvatarChange(event) {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      avatarUrl.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

// Ouvrir modal de modification
function ouvrirModalModification(champ) {
  champActuel.value = champ
  nouvelleValeur.value = userData[champ]
  modalVisible.value = true
}

// Fermer modal
function fermerModal() {
  modalVisible.value = false
  champActuel.value = ''
  nouvelleValeur.value = ''
}

// Valider modification
function validerModification() {
  if (nouvelleValeur.value.trim()) {
    userData[champActuel.value] = nouvelleValeur.value.trim()
    fermerModal()
    
    // Optionnel: Afficher notification
    console.log(`${champActuel.value} mis à jour:`, nouvelleValeur.value)
  }
}
</script>

<style scoped>
/* Animation hover pour les items */
.border-b {
  transition: all 0.2s ease;
}
</style>