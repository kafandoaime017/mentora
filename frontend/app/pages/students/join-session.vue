<template>
  <div class="bg-layout font-body min-h-screen">
    <StudentLayout>

      <div class="max-w-xl mx-auto">
        <h2 class=" font-body text-2xl font-extrabold text-[#1e3a2f] mb-6">
          Rejoindre une session
        </h2>

        <!-- Desktop : Formulaire de code uniquement -->
        <div class="hidden md:block">
          <section class="bg-white shadow-[1px_1px_7px_1px_rgba(0,0,0,0.16)] rounded-lg p-6">
            <label class="block  font-body text-md font-bold text-black mb-2">Code d'accès</label>
            <p class="text-sm font-body text-gray-800 mb-4">
              Saisissez le code d'accès fourni par l'intervenant.
            </p>
            <input
              v-model="code"
              type="text"
              placeholder="Ex: XK7P9M"
              maxlength="10"
              class="w-full mb-4 px-4 py-3 font-body font-bold text-sm text-gray-800 bg-input  outline-none focus:border-0  border-gray-200 rounded-lg focus:outline-none focus:border-primary uppercase"
              @keyup.enter="verifyAndJoin"
            />
            <button
              @click="verifyAndJoin"
              :disabled="loading || !code"
              class="w-full bg-secondary  font-body text-white text-md font-bold py-2.5 rounded-lg hover:bg-secondary/80 disabled:opacity-50"
            >
              {{ loading ? 'Vérification...' : 'Rejoindre' }}
            </button>
          </section>
        </div>

        <!-- Mobile : Bouton scanner QR code uniquement -->
        <div class="md:hidden">
          <button
            @click="openScanner"
            class="w-full bg-primary text-white text-sm font-bold py-3 rounded-lg flex items-center justify-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/>
            </svg>
            Scanner un QR code
          </button>
        </div>
      </div>

      <!-- Modal scanner QR code (mobile) -->
      <div v-if="showScanner" class="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" @click.self="closeScanner">
        <div class="bg-white rounded-xl w-full max-w-sm p-4">
          <div class="flex justify-between items-center mb-4">
            <h3 class="font-bold text-[#1e3a2f]">Scanner le QR code</h3>
            <button @click="closeScanner" class="text-gray-500">&times;</button>
          </div>
          <div id="qr-reader" class="w-full"></div>
          <p class="text-xs text-center text-gray-500 mt-4">Positionnez le QR code dans le cadre</p>
        </div>
      </div>

      <!-- Modal de confirmation -->
      <div v-if="showConfirmModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="showConfirmModal = false">
        <div class="bg-white rounded-xl max-w-md w-full p-6 text-center">
          <div class="w-16 h-16 bg-green-200 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg class="w-14 h-14 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <h3 class="text-lg font-body font-bold text-[#1e3a2f] mb-2">Session trouvée !</h3>
          <p class="text-gray-600 text-xl font-body font-extrabold">{{ sessionInfo?.titre }}</p>
          <p class="text-sm text-gray-500 font-body mt-1">Par : {{ sessionInfo?.professeur?.prenom }} {{ sessionInfo?.professeur?.nom }}</p>
          <p class="text-sm text-gray-500 font-body mt-1">Durée: {{ sessionInfo?.duree }} minutes</p>
          <div class="flex gap-3 mt-6">
            <button @click="showConfirmModal = false" class="flex-1 bg-red-500 text-white hover:bg-red-700 font-body py-2 border rounded-lg">Annuler</button>
            <button @click="confirmJoin" class="flex-1 py-2 bg-primary font-body text-white rounded-lg">Rejoindre</button>
          </div>
        </div>
      </div>

      <!-- Modal d'erreur -->
      <div v-if="errorModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="errorModal = false">
        <div class="bg-white rounded-xl max-w-md w-full p-6 text-center">
          <div class="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg class="w-14 h-14 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <!-- <h3 class="text-xl font-bold font-body text-red-600 mb-2">Accès refusé</h3> -->
          <p class="text-gray-600 font-body mb-6">{{ errorMessage }}</p>
          <button @click="errorModal = false" class="w-full font-body py-2.5 font-bold bg-primary text-white rounded-lg">OK</button>
        </div>
      </div>

    </StudentLayout>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'
import { Html5Qrcode } from 'html5-qrcode'
import { useStudent } from '~~/composables/useStudent'
import { useToast } from '~~/composables/useToast'


const route = useRoute()  // ✅ Récupérer la route


const { verifySessionCode, joinSession } = useStudent()
const toast = useToast()


// ✅ Fonction pour préremplir le code depuis l'URL
const prefillCodeFromUrl = () => {
  // Récupérer le paramètre 'code' dans l'URL
  const urlCode = route.query.code
  
  if (urlCode && typeof urlCode === 'string') {
    code.value = urlCode.toUpperCase()
    
    // Optionnel : Auto-vérifier après un court délai
    setTimeout(() => {
      if (code.value) {
        verifyAndJoin()
      }
    }, 500)
  }
}

onMounted(() => {
  prefillCodeFromUrl()
})



const code = ref('')
const loading = ref(false)
const showConfirmModal = ref(false)
const errorModal = ref(false)
const errorMessage = ref('')
const sessionInfo = ref(null)
const showScanner = ref(false)
let html5QrCode = null

const verifyAndJoin = async () => {
  if (!code.value.trim()) return
  
  loading.value = true
  const cleanCode = code.value.trim().toUpperCase()
  
  const result = await verifySessionCode(cleanCode)
  
  if (result.success) {
    sessionInfo.value = result.data
    showConfirmModal.value = true
  } else {
    errorMessage.value = result.message || 'Code invalide'
    errorModal.value = true
  }
  loading.value = false
}

const confirmJoin = async () => {
  showConfirmModal.value = false
  loading.value = true
  
  const result = await joinSession(sessionInfo.value.sessionId)
  
  if (result.success) {
    toast.success('Vous avez rejoint la session !')
    await navigateTo(`/students/sessions/${sessionInfo.value.sessionId}/participate?code=${code.value}`)
  } else {
    errorMessage.value = result.message || 'Erreur lors du rejoignement'
    errorModal.value = true
  }
  loading.value = false
}

const openScanner = () => {
  showScanner.value = true
  setTimeout(() => {
    startScanner()
  }, 100)
}

const closeScanner = () => {
  showScanner.value = false
  stopScanner()
}

const startScanner = async () => {
  try {
    html5QrCode = new Html5Qrcode('qr-reader')
    await html5QrCode.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      (decodedText) => {
        code.value = decodedText
        closeScanner()
        verifyAndJoin()
      },
      (error) => {
        console.log('Scan error:', error)
      }
    )
  } catch (error) {
    console.error('Erreur caméra:', error)
    toast.error('Impossible d\'accéder à la caméra')
    closeScanner()
  }
}

const stopScanner = () => {
  if (html5QrCode && html5QrCode.isScanning) {
    html5QrCode.stop()
    html5QrCode.clear()
    html5QrCode = null
  }
}

onUnmounted(() => {
  stopScanner()
})
</script>

<style scoped>
#qr-reader video {
  width: 100%;
  height: auto;
}
#qr-reader button, #qr-reader select {
  display: none !important;
}
</style>