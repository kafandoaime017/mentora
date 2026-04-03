<template>
  <div class="bg-[#f5f0e8] font-body">
    <StudentLayout>

      <!-- Titre page -->
     

      <div class="flex flex-col lg:flex-row gap-6 lg:items-center">

        <!-- ══════════════════════════
             COLONNE PRINCIPALE (gauche)
        ═══════════════════════════════ -->
        <div class="w-full lg:max-w-[480px] mx-auto">
 <h2 class="font-['Roboto'] text-xl font-extrabold text-[#1e3a2f] mb-6">
        Rejoindre une session
      </h2>
          <!-- ── Scanner QR ── -->
          <section class="bg-white md:hidden font-body shadow-[1px_1px_7px_1px_rgba(0,0,0,0.16)] border border-[#e2ddd4] rounded-lg p-5 mb-5">
            <p class="font-bold text-lg text-[#1e3a2f] mb-1">Scanner le QR code</p>
            <p class="text-xs text-[#6b6b6b] mb-4 leading-relaxed">
              Positionne le QR code fourni par votre professeur dans le cadre.
            </p>

            <!-- Zone scanner -->
            <div class="b rounded-xl flex items-center justify-center p-5 mb-1">
              <div class="relative w-64 h-64 flex items-center justify-center">
                <!-- Coins de scan -->
                <span class="absolute top-0 left-0 w-7 h-7 border-t-[3px] border-l-[3px] border-[#4a7c5e] rounded-tl-xl"></span>
                <span class="absolute top-0 right-0 w-7 h-7 border-t-[3px] border-r-[3px] border-[#4a7c5e] rounded-tr-xl"></span>
                <span class="absolute bottom-0 left-0 w-7 h-7 border-b-[3px] border-l-[3px] border-[#4a7c5e] rounded-bl-xl"></span>
                <span class="absolute bottom-0 right-0 w-7 h-7 border-b-[3px] border-r-[3px] border-[#4a7c5e] rounded-br-xl"></span>

                <!-- Conteneur vidéo pour le scanner -->
                <div id="qr-reader" class="w-60 h-60 overflow-hidden rounded"></div>
                
                <!-- Message d'erreur caméra -->
                <div v-if="cameraError" class="absolute inset-0 bg-white rounded flex flex-col items-center justify-center gap-2 ">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#e74c3c" stroke-width="1.5">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <p class="text-[0.7rem] text-[#e74c3c] text-center px-2">{{ cameraError }}</p>
                </div>
              </div>
            </div>

            <!-- Bouton activer caméra -->
            <button
              @click="toggleCamera"
              class="w-full mt-3 border border-primary text-primary text-sm font-semibold py-2.5 rounded-lg hover:bg-primary/80 hover:text-white transition-colors duration-200"
            >
              {{ cameraActive ? 'Arrêter la caméra' : 'Activer la caméra' }}
            </button>
          </section>

          <!-- ── Séparateur ── -->
          <div class="flex md:hidden items-center gap-3 my-1 text-[#9b9589] text-xs font-semibold">
            <div class="flex-1 h-px bg-[#ccc7bc]"></div>
            ou
            <div class="flex-1 h-px bg-[#ccc7bc]"></div>
          </div>

          <!-- ── Code d'accès ── -->
          <section class="bg-white font-body shadow-[1px_1px_7px_1px_rgba(0,0,0,0.16)] border border-[#e2ddd4] rounded-lg p-5 mt-5">
            <label class="block text-[0.82rem] font-bold text-[#1e3a2f] mb-2">
              Code d'accès
            </label>
             <p class="text-xs hidden md:block text-black mb-4 leading-relaxed">
                Saisis le code d'accès fourni par ton professeur pour rejoindre la session.
            </p>
            <input
              v-model="codeAcces"
              type="text"
              placeholder="Ex. AB12-CD34"
              maxlength="9"
                  class="w-full mb-3 pl-4 pr-4 py-3 text-sm text-gray-800 placeholder-gray-600 focus:text-md focus:text-black focus:font-extrabold bg-input border-gray-200 rounded-xl focus:bg-input focus:outline-none"
            />

            <button
              @click="rejoindreParCode"
              :disabled="!codeAcces"
              class="w-full bg-secondary text-white text-sm font-bold py-3 rounded-lg transition-colors duration-200"
              :class="codeAcces ? 'hover:bg-secondary/80 cursor-pointer' : 'opacity-40 cursor-not-allowed'"
            >
              Rejoindre la session
            </button>
          </section>

         

        </div>

        <!-- ══════════════════════════
             COLONNE DROITE (desktop uniquement)
             Sessions disponibles
        ═══════════════════════════════ -->
     

      </div>

    </StudentLayout>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Html5Qrcode } from 'html5-qrcode'

const codeAcces = ref('')
const cameraActive = ref(false)
const cameraError = ref('')
let html5QrCode = null

// Fonction pour arrêter le scanner
async function stopScanner() {
  if (html5QrCode && html5QrCode.isScanning) {
    try {
      await html5QrCode.stop()
      html5QrCode.clear()
    } catch (error) {
      console.error('Erreur arrêt scanner:', error)
    }
  }
  html5QrCode = null
  cameraActive.value = false
}

// Fonction pour démarrer le scanner
async function startScanner() {
  cameraError.value = ''
  
  try {
    html5QrCode = new Html5Qrcode('qr-reader')
    
    await html5QrCode.start(
      { facingMode: 'environment' }, // Caméra arrière par défaut
      {
        fps: 10,
        qrbox: { width: 150, height: 150 },
        aspectRatio: 1.0
      },
      (decodedText) => {
        // QR code scanné avec succès
        console.log('QR code scanné:', decodedText)
        codeAcces.value = decodedText
        rejoindreParCode()
        stopScanner()
      },
      (errorMessage) => {
        // Ignorer les erreurs de scan normales
        if (!errorMessage.includes('No MultiFormat Readers')) {
          console.debug('Erreur scan:', errorMessage)
        }
      }
    )
    
    cameraActive.value = true
  } catch (error) {
    console.error('Erreur démarrage caméra:', error)
    cameraError.value = 'Impossible d\'accéder à la caméra. Vérifiez les permissions.'
    cameraActive.value = false
  }
}

// Fonction pour activer/désactiver la caméra
async function toggleCamera() {
  if (cameraActive.value) {
    await stopScanner()
  } else {
    await startScanner()
  }
}

// Fonction pour rejoindre par code
function rejoindreParCode() {
  if (!codeAcces.value) return
  
  // Nettoyer le code (enlever espaces, mettre en majuscules)
  const cleanCode = codeAcces.value.trim().toUpperCase()
  
  console.log('Rejoindre avec code :', cleanCode)
  alert(`Rejoindre la session avec le code: ${cleanCode}`)
  // Redirection vers la session
  // navigateTo(`/session/${cleanCode}`)
}

// Fonction pour rejoindre une session depuis la liste
function rejoindreSession(session) {
  console.log('Rejoindre session :', session.titre)
  alert(`Rejoindre la session: ${session.titre}`)
  // navigateTo(`/session/${session.id}`)
}

// Nettoyage au démontage du composant
onUnmounted(() => {
  stopScanner()
})

// Sessions disponibles (mock)
const sessionsDisponibles = ref([
  {
    id: 1,
    titre: 'Mathématiques - Fonctions & Limites',
    date: "Aujourd'hui · 14:00 – 15:00",
    statut: 'En cours',
  },
  {
    id: 2,
    titre: 'Algorithmique - Tri et Complexité',
    date: "Aujourd'hui · 16:00 – 17:30",
    statut: 'À venir',
  },
  {
    id: 3,
    titre: 'Bases de données - Modèle relationnel',
    date: "Aujourd'hui · 18:00 – 19:00",
    statut: 'À venir',
  },
])
</script>

<style scoped>
#qr-reader video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

#qr-reader {
  position: relative;
}

/* Style pour le cadre du scanner */
#qr-reader__scan_region {
  border: none !important;
  background: transparent !important;
}

/* Masquer les éléments par défaut de html5-qrcode */
#qr-reader button {
  display: none !important;
}

#qr-reader select {
  display: none !important;
}
</style>