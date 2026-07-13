<template>
  <div class="bg-layout font-body min-h-screen">
    <StudentLayout>

      <div class="max-w-xl mx-auto">
        <h2 class="font-body text-2xl font-extrabold text-[#1e3a2f] mb-6">
          Rejoindre une session
        </h2>

        <!-- Desktop : Formulaire de code uniquement -->
        <div class="hidden md:block">
          <section class="bg-white shadow-[1px_1px_7px_1px_rgba(0,0,0,0.16)] rounded-lg p-6">
            <label class="block font-body text-md font-bold text-black mb-2">Code d'accès</label>
            <p class="text-sm font-body text-gray-900 mb-4">
              Saisissez le code d'accès fourni par l'intervenant.
            </p>
            <input
              v-model="code"
              type="text"
              placeholder="Ex: XXXXXX"
              maxlength="6"
              class="w-full mb-4 px-3 py-3 font-body font-bold text-sm text-gray-800 bg-input outline-none border-gray-200 rounded-lg focus:outline-none focus:border-primary uppercase"
              @keyup.enter="verifyAndJoin"
            />
            <button
              @click="verifyAndJoin"
              :disabled="loading || !code"
              class="w-full bg-secondary font-body text-white text-md font-bold py-2.5 rounded-lg hover:bg-secondary/80 disabled:opacity-50"
            >
              {{ loading ? 'Vérification...' : 'Rejoindre' }}
            </button>
          </section>
        </div>

        <!-- Mobile : Scanner + lien saisie manuelle -->
        <div class="md:hidden space-y-4">
          <button
            @click="requestCameraAndScan"
            class="w-full bg-primary text-white text-sm font-bold py-3 rounded-lg flex items-center justify-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/>
            </svg>
            Scanner un QR code
          </button>

          <!-- Lien saisie manuelle -->
          <div class="text-center">
            <button
              @click="showCodeModal = true"
              class="text-sm font-body text-[#4a7c5e] underline underline-offset-2 hover:text-[#1e3a2f] transition-colors"
            >
              Saisir le code manuellement
            </button>
          </div>
        </div>
      </div>

      <!-- ─── Scanner fullscreen (mobile) ─── -->
      <Teleport to="body">
        <div
          v-if="showScanner"
          class="fixed inset-0 z-[9999] bg-black flex flex-col"
          style="height: 100dvh; width: 100dvw;"
        >
          <div class="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 pt-10 pb-4 bg-gradient-to-b from-black/70 to-transparent">
            <span class="text-white font-body font-bold text-base">Scanner le QR code</span>
            <button @click="closeScanner" class="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white text-xl font-bold">
              &times;
            </button>
          </div>

          <video ref="videoRef" autoplay playsinline muted class="absolute inset-0 w-full h-full object-cover" />

          <div class="absolute inset-0 flex items-center justify-center">
            <div class="absolute inset-0 bg-black/55" />
            <div class="relative z-10" style="width: 260px; height: 260px;">
              <span class="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-md" />
              <span class="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-md" />
              <span class="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-md" />
              <span class="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-md" />
              <div class="absolute left-2 right-2 h-0.5 bg-primary/90 rounded scan-line" />
            </div>
          </div>

          <div class="absolute bottom-0 left-0 right-0 pb-10 flex flex-col items-center gap-4 bg-gradient-to-t from-black/70 to-transparent pt-6">
            <p class="text-white/80 font-body text-sm text-center px-8">
              Positionnez le QR code dans le cadre pour le scanner automatiquement
            </p>
            <!-- Lien saisie manuelle depuis le scanner aussi -->
            <button
              @click="closeScanner(); showCodeModal = true"
              class="text-white/70 text-xs font-body underline underline-offset-2"
            >
              Saisir le code manuellement
            </button>
          </div>
        </div>
      </Teleport>

      <!-- ─── Modal saisie code manuelle (mobile) ─── -->
      <Teleport to="body">
        <div
          v-if="showCodeModal"
          class="fixed inset-0 bg-black/50 flex items-end justify-center z-50 p-0"
          @click.self="showCodeModal = false"
        >
          <div class="bg-white rounded-t-2xl w-full p-6 pb-10">
            <!-- Handle -->
            <div class="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-5" />

            <h3 class="text-lg font-body font-bold text-[#1e3a2f] mb-1">Code d'accès</h3>
            <p class="text-sm font-body text-gray-500 mb-4">Saisissez le code fourni par votre intervenant.</p>

            <input
              v-model="codeModal"
              type="text"
              placeholder="XXXXXX"
              maxlength="6"
              autofocus
              class="w-full mb-4 px-4 py-2 font-body font-bold text-lg text-center tracking-[0.3em] text-gray-800 bg-input rounded-xl focus:outline-none uppercase border-0 border-transparent focus:border-primary transition-colors"
              @keyup.enter="verifyAndJoinFromModal"
            />

            <div class="flex gap-3">
              <button
                @click="showCodeModal = false; codeModal = ''"
                class="flex-1 py-2 font-body font-semibold text-sm bg-danger text-white rounded-xl hover:bg-danger/80 transition-colors"
              >
                Annuler
              </button>
              <button
                @click="verifyAndJoinFromModal"
                :disabled="loadingModal || !codeModal.trim()"
                class="flex-1 py-2 font-body font-bold text-sm bg-primary text-white rounded-xl hover:bg-primary/80 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                <div v-if="loadingModal" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                {{ loadingModal ? 'Vérification...' : 'Rejoindre' }}
              </button>
            </div>
          </div>
        </div>
      </Teleport>

      <!-- ─── Modal confirmation ─── -->
      <div v-if="showConfirmModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="showConfirmModal = false">
        <div class="bg-white rounded-xl max-w-md w-full p-6 text-center">
          <div class="w-16 h-16 bg-green-200 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg class="w-14 h-14 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <h3 class="text-lg font-body font-bold text-[#1e3a2f] mb-2">Session trouvée !</h3>
          <p class="text-gray-600 text-xl font-body font-extrabold">{{ sessionInfo?.titre }}</p>
          <!-- <p class="text-sm text-gray-500 font-body mt-1">Par : {{ sessionInfo?.professeur }}</p> -->
          <p class="text-sm text-gray-700 font-body mt-1">Durée : {{ sessionInfo?.duree }} minutes</p>
          <div class="flex gap-3 mt-6">
            <button @click="showConfirmModal = false" class="flex-1 bg-red-500 text-white hover:bg-red-700 font-body py-1.5 rounded-lg">Annuler</button>
            <button @click="confirmJoin" class="flex-1 py-1.5 bg-primary font-body text-white hover:bg-primary/80 rounded-lg">Rejoindre</button>
          </div>
        </div>
      </div>

      <!-- ─── Modal erreur ─── -->
      <div v-if="errorModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="errorModal = false">
        <div class="bg-white rounded-xl max-w-md w-full p-6 text-center">
          <div class="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg class="w-14 h-14 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <p class="text-gray-600 font-body mb-6">{{ errorMessage }}</p>
          <button @click="errorModal = false" class="w-full font-body py-2.5 font-bold bg-primary text-white rounded-lg">OK</button>
        </div>
      </div>

    </StudentLayout>
  </div>
</template>

<script setup>
import { ref, onUnmounted, onMounted, nextTick } from 'vue'
import jsQR from 'jsqr'
import { useStudent } from '~~/composables/useStudent'
import { useToast } from '~~/composables/useToast'

const route = useRoute()
const { verifySessionCode, joinSession } = useStudent()
const toast = useToast()

const code            = ref('')
const codeModal       = ref('')
const loading         = ref(false)
const loadingModal    = ref(false)
const showConfirmModal = ref(false)
const showCodeModal   = ref(false)
const errorModal      = ref(false)
const errorMessage    = ref('')
const sessionInfo     = ref(null)
const showScanner     = ref(false)

const videoRef = ref(null)
let stream         = null
let animationFrame = null
let canvasCtx      = null
let canvas         = null

// ─── Préremplir depuis l'URL ───────────────────────────────────────────────
onMounted(() => {
  const urlCode = route.query.code
  if (urlCode && typeof urlCode === 'string') {
    code.value = urlCode.toUpperCase()
    setTimeout(() => { if (code.value) verifyAndJoin() }, 500)
  }
})

// ─── Caméra ───────────────────────────────────────────────────────────────
const requestCameraAndScan = async () => {
  if (!navigator.mediaDevices?.getUserMedia) {
    errorMessage.value = 'Votre navigateur ne supporte pas l\'accès à la caméra.'
    errorModal.value = true
    return
  }
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }
    })
    showScanner.value = true
    await nextTick()
    startVideoStream()
  } catch (err) {
    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      errorMessage.value = 'Accès à la caméra refusé. Vous pouvez saisir le code manuellement.'
    } else if (err.name === 'NotFoundError') {
      errorMessage.value = 'Aucune caméra détectée. Vous pouvez saisir le code manuellement.'
    } else {
      errorMessage.value = 'Impossible d\'accéder à la caméra. Vous pouvez saisir le code manuellement.'
    }
    errorModal.value = true
  }
}

const startVideoStream = () => {
  if (!videoRef.value || !stream) return
  videoRef.value.srcObject = stream
  videoRef.value.onloadedmetadata = () => {
    videoRef.value.play()
    canvas    = document.createElement('canvas')
    canvasCtx = canvas.getContext('2d')
    scanFrame()
  }
}

const scanFrame = () => {
  if (!videoRef.value || videoRef.value.readyState !== videoRef.value.HAVE_ENOUGH_DATA) {
    animationFrame = requestAnimationFrame(scanFrame)
    return
  }
  canvas.width  = videoRef.value.videoWidth
  canvas.height = videoRef.value.videoHeight
  canvasCtx.drawImage(videoRef.value, 0, 0, canvas.width, canvas.height)
  const imageData = canvasCtx.getImageData(0, 0, canvas.width, canvas.height)
  const qrCode = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'dontInvert' })
  if (qrCode) { handleQRResult(qrCode.data); return }
  animationFrame = requestAnimationFrame(scanFrame)
}

const handleQRResult = (data) => {
  closeScanner()
  try {
    const parsed = JSON.parse(data)
    code.value = (parsed.code || data).toUpperCase()
  } catch {
    code.value = data.toUpperCase()
  }
  verifyAndJoin()
}

const closeScanner = () => {
  showScanner.value = false
  if (animationFrame) { cancelAnimationFrame(animationFrame); animationFrame = null }
  if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null }
  if (videoRef.value) videoRef.value.srcObject = null
}

// ─── Vérification code ─────────────────────────────────────────────────────
const verifyAndJoin = async () => {
  if (!code.value.trim()) return
  loading.value = true
  const result = await verifySessionCode(code.value.trim().toUpperCase())
  if (result.success) {
    sessionInfo.value = result.data
    showConfirmModal.value = true
  } else {
    errorMessage.value = result.message || 'Code invalide'
    errorModal.value = true
  }
  loading.value = false
}

// ─── Vérification depuis modal mobile ─────────────────────────────────────
const verifyAndJoinFromModal = async () => {
  if (!codeModal.value.trim()) return
  loadingModal.value = true
  const cleanCode = codeModal.value.trim().toUpperCase()
  const result = await verifySessionCode(cleanCode)
  loadingModal.value = false

  if (result.success) {
    code.value = cleanCode
    sessionInfo.value = result.data
    showCodeModal.value = false
    codeModal.value = ''
    showConfirmModal.value = true
  } else {
    errorMessage.value = result.message || 'Code invalide'
    showCodeModal.value = false
    codeModal.value = ''
    errorModal.value = true
  }
}

// ─── Confirmer join ────────────────────────────────────────────────────────
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

onUnmounted(() => closeScanner())
</script>

<style scoped>
.scan-line {
  animation: scanMove 2s ease-in-out infinite;
  top: 10%;
}
@keyframes scanMove {
  0%   { top: 10%; opacity: 1; }
  50%  { top: 85%; opacity: 0.8; }
  100% { top: 10%; opacity: 1; }
}
</style>