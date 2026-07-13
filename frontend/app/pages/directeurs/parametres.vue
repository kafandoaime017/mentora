<template>
  <div class="bg-[#f5f0e8] font-body min-h-screen">
    <AdminLayout>
      <div class="max-w-2xl mx-auto">

        <h2 class="font-body text-xl font-extrabold text-[#1e3a2f] mb-6">Paramètres</h2>

        <!-- Loading -->
        <div v-if="loading" class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
        </div>

        <template v-else>

          <!-- NOTIFICATIONS EMAIL -->
          <!-- <div class="bg-white border border-gray-200 rounded-lg overflow-hidden mb-4">
            <div class="p-4 border-b border-gray-100">
              <h3 class="font-bold text-[#1e3a2f] font-body">Notifications email</h3>
              <p class="text-sm text-black font-body mt-0.5">Choisissez les emails que vous souhaitez recevoir</p>
            </div>

            <div class="divide-y divide-gray-50">

              <div class="flex items-center justify-between p-4">
                <div>
                  <p class="text-sm font-semibold text-black font-body">Nouvelle session créée</p>
                  <p class="text-sm text-black font-body mt-0.5">Quand votre prof crée une nouvelle session</p>
                </div>
                <button @click="toggle('notifNouvelleSession')"
                  class="relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 flex-shrink-0 focus:outline-none"
                  :class="settings.notifNouvelleSession ? 'bg-primary' : 'bg-gray-300'">
                  <span class="inline-block h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-300"
                    :style="settings.notifNouvelleSession ? 'transform: translateX(32px)' : 'transform: translateX(4px)'" />
                </button>
              </div>

              <div class="flex items-center justify-between p-4">
                <div>
                  <p class="text-sm font-semibold text-black font-body">Session démarrée</p>
                  <p class="text-sm text-black font-body mt-0.5">Quand votre prof démarre une session</p>
                </div>
                <button @click="toggle('notifSessionDemarree')"
                  class="relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 flex-shrink-0 focus:outline-none"
                  :class="settings.notifSessionDemarree ? 'bg-primary' : 'bg-gray-300'">
                  <span class="inline-block h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-300"
                    :style="settings.notifSessionDemarree ? 'transform: translateX(32px)' : 'transform: translateX(4px)'" />
                </button>
              </div>

              <div class="flex items-center justify-between p-4">
                <div>
                  <p class="text-sm font-semibold text-black font-body">Notes publiées</p>
                  <p class="text-sm text-black font-body mt-0.5">Quand vos notes sont disponibles</p>
                </div>
                <button @click="toggle('notifNotesPubliees')"
                  class="relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 flex-shrink-0 focus:outline-none"
                  :class="settings.notifNotesPubliees ? 'bg-primary' : 'bg-gray-300'">
                  <span class="inline-block h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-300"
                    :style="settings.notifNotesPubliees ? 'transform: translateX(32px)' : 'transform: translateX(4px)'" />
                </button>
              </div>

            </div>
          </div> -->

          <!-- SÉCURITÉ 2FA -->
          <div class="bg-white border border-gray-200 rounded-lg overflow-hidden mb-4">
            <div class="p-4 border-b border-gray-100">
              <h3 class="font-bold text-[#1e3a2f] font-body">Sécurité</h3>
              <p class="text-xs text-black font-body mt-0.5">Authentification à deux facteurs (2FA)</p>
            </div>

            <div class="p-4">

              <!-- 2FA désactivé -->
              <div v-if="!settings.totpEnabled">
                <div class="flex items-start gap-4 mb-4">
                  <div class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg class="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-black font-body">2FA désactivé</p>
                    <p class="text-sm text-black font-body mt-0.5">Activez pour sécuriser votre compte avec Google
                      Authenticator, Microsoft Authenticator ou Authy</p>
                  </div>
                </div>
                <button @click="demarrerSetup2FA" :disabled="totpLoading"
                  class="w-full py-2.5 bg-primary text-white rounded-lg font-body font-semibold text-sm hover:bg-primary/80 transition disabled:opacity-50">
                  Activer la 2FA
                </button>
              </div>

              <!-- 2FA activé -->
              <div v-else>
                <div class="flex items-start gap-4 mb-4">
                  <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-green-700 font-body">2FA activé ✓</p>
                    <p class="text-xs text-black font-body mt-0.5">Votre compte est protégé par authentification à
                      deux facteurs</p>
                  </div>
                </div>
                <button @click="ouvrirModalDesactiver2FA"
                  class="w-full py-2.5 border border-red-400 text-red-500 rounded-lg font-body font-semibold text-sm hover:bg-red-50 transition">
                  Désactiver la 2FA
                </button>
              </div>

            </div>
          </div>

        </template>

        <!-- MODAL SETUP 2FA -->
        <div v-if="modal2FAVisible" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          @click.self="fermerModal2FA">
          <div class="bg-white rounded-lg border border-gray-200 max-w-md w-full">

            <div class="border-b border-gray-100 p-4 flex items-center justify-between">
              <h3 class="font-bold text-[#1e3a2f] font-body">Activer la 2FA</h3>
              <button @click="fermerModal2FA" class="text-black hover:text-black">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div class="p-5">

              <!-- Étape 1 : QR code -->
              <div v-if="totpStep === 1" class="text-center">
                <p class="text-sm text-black font-body mb-4">
                  Scannez ce QR code avec <strong>Google Authenticator</strong>, <strong>Microsoft
                    Authenticator</strong> ou
                  <strong>Authy</strong>
                </p>
                <div v-if="totpLoading" class="flex justify-center py-8">
                  <div class="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
                </div>
                <img v-else-if="totpQrCode" :src="totpQrCode" class="w-48 h-48 mx-auto border rounded-lg p-2 mb-4" />
                <div v-if="totpSecret" class="bg-gray-50 rounded-lg p-3 mb-4 text-left">
                  <p class="text-xs text-black font-body mb-1">Ou entrez la clé manuellement</p>
                  <p class="font-mono text-sm font-bold text-black break-all select-all">{{ totpSecret }}</p>
                </div>
                <button @click="totpStep = 2" :disabled="!totpQrCode"
                  class="w-full py-2.5 bg-primary text-white rounded-lg font-body font-semibold text-sm hover:bg-primary/80 transition disabled:opacity-50">
                  J'ai scanné → Continuer
                </button>
              </div>

              <!-- Étape 2 : confirmer avec code -->
              <div v-else-if="totpStep === 2" class="space-y-4">
                <p class="text-sm text-black font-body text-center">
                  Entrez le code affiché dans votre application
                </p>
                <input v-model="totpCode" type="text" inputmode="numeric" maxlength="6" placeholder="000000"
                  @input="totpCode = totpCode.replace(/\D/g, '').slice(0, 6)"
                  class="w-full px-4 py-3 bg-input rounded-lg text-center text-2xl font-mono font-bold tracking-[0.4em] focus:outline-none"
                  autofocus />
                <div v-if="totpErreur"
                  class="bg-red-50 text-red-600 text-xs font-body rounded-lg px-4 py-2 text-center">
                  {{ totpErreur }}
                </div>
                <div class="flex gap-3">
                  <button @click="totpStep = 1; totpErreur = ''"
                    class="flex-1 py-2.5 bg-gray-100 text-black rounded-lg text-sm font-body font-semibold hover:bg-gray-200 transition">Retour</button>
                  <button @click="confirmerActivation2FA" :disabled="totpLoading || totpCode.length !== 6"
                    class="flex-1 py-2.5 bg-primary text-white rounded-lg text-sm font-body font-semibold hover:bg-primary/80 transition disabled:opacity-50 flex items-center justify-center gap-2">
                    <div v-if="totpLoading"
                      class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    <span v-else>Activer</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

        <!-- MODAL DÉSACTIVER 2FA -->
        <div v-if="modalDesactiver2FAVisible"
          class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          @click.self="modalDesactiver2FAVisible = false">
          <div class="bg-white rounded-lg border border-gray-200 max-w-sm w-full">

            <div class="border-b border-gray-100 p-4 flex items-center justify-between">
              <h3 class="font-bold text-[#1e3a2f] font-body">Désactiver la 2FA</h3>
              <button @click="modalDesactiver2FAVisible = false" class="text-black hover:text-black">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div class="p-5 space-y-4">
              <p class="text-sm text-black font-body text-center">
                Entrez votre code Google Authenticator pour confirmer
              </p>
              <input v-model="totpDesactiverCode" type="text" inputmode="numeric" maxlength="6" placeholder="000000"
                @input="totpDesactiverCode = totpDesactiverCode.replace(/\D/g, '').slice(0, 6)"
                class="w-full px-4 py-1 bg-input rounded-lg text-center text-2xl font-mono font-bold tracking-[0.4em] focus:outline-none"
                autofocus />
              <div v-if="totpErreur" class="bg-red-50 text-red-600 text-xs font-body rounded-lg px-4 py-2 text-center">
                {{ totpErreur }}
              </div>
              <div class="flex gap-3">
                <button @click="modalDesactiver2FAVisible = false; totpErreur = ''"
                  class="flex-1 py-2.5 bg-gray-100 text-black rounded-lg text-sm font-body font-semibold hover:bg-gray-200 transition">Annuler</button>
                <button @click="confirmerDesactivation2FA" :disabled="totpLoading || totpDesactiverCode.length !== 6"
                  class="flex-1 py-2.5 bg-red-500 text-white rounded-lg text-sm font-body font-semibold hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-2">
                  <div v-if="totpLoading"
                    class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  <span v-else>Désactiver</span>
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </AdminLayout>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useSettings } from '~~/composables/useSettings'
import { useAuth } from '~~/composables/useAuth'
import { useToast } from '~~/composables/useToast'

const { getSettings, updateSettings } = useSettings()
const { getAuthHeader } = useAuth()
const toast = useToast()

const loading = ref(true)
const settings = reactive({
  notifNouvelleSession: true,
  notifSessionDemarree: true,
  notifNotesPubliees: true,
  totpEnabled: false
})

// ─── TOTP ─────────────────────────────────────────────────────────────────────
const modal2FAVisible = ref(false)
const modalDesactiver2FAVisible = ref(false)
const totpStep = ref(1)
const totpLoading = ref(false)
const totpCode = ref('')
const totpDesactiverCode = ref('')
const totpQrCode = ref('')
const totpSecret = ref('')
const totpErreur = ref('')

// ─── Chargement ───────────────────────────────────────────────────────────────
onMounted(async () => {
  loading.value = true
  const result = await getSettings()
  if (result.success) {
    settings.notifNouvelleSession = result.data.notifNouvelleSession
    settings.notifSessionDemarree = result.data.notifSessionDemarree
    settings.notifNotesPubliees = result.data.notifNotesPubliees
    settings.totpEnabled = result.data.totpEnabled
  }
  loading.value = false
})

// ─── Toggle notifs ────────────────────────────────────────────────────────────
const toggle = async (key) => {
  settings[key] = !settings[key]
  const result = await updateSettings({ [key]: settings[key] })
  if (result.success) {
    toast.success('Préférences mises à jour')
  } else {
    settings[key] = !settings[key] // rollback
    toast.error('Erreur lors de la mise à jour')
  }
}

// ─── Setup 2FA ────────────────────────────────────────────────────────────────
const demarrerSetup2FA = async () => {
  totpLoading.value = true
  totpStep.value = 1
  totpCode.value = ''
  totpErreur.value = ''
  totpQrCode.value = ''
  totpSecret.value = ''
  modal2FAVisible.value = true

  try {
    const res = await $fetch('/api/totp/setup', {
      method: 'POST',
      headers: getAuthHeader()
    })
    if (res.success) {
      totpQrCode.value = res.data.qrCode
      totpSecret.value = res.data.secret
    } else {
      toast.error(res.message || 'Erreur')
      modal2FAVisible.value = false
    }
  } catch (err) {
    toast.error(err?.data?.message || 'Erreur lors de la configuration')
    modal2FAVisible.value = false
  } finally {
    totpLoading.value = false
  }
}

const confirmerActivation2FA = async () => {
  totpErreur.value = ''
  totpLoading.value = true
  try {
    const res = await $fetch('/api/totp/enable', {
      method: 'POST',
      headers: getAuthHeader(),
      body: { code: totpCode.value }
    })
    if (res.success) {
      settings.totpEnabled = true
      modal2FAVisible.value = false
      toast.success('2FA activé avec succès !')
    } else {
      totpErreur.value = res.message || 'Code invalide'
    }
  } catch (err) {
    totpErreur.value = err?.data?.message || 'Code invalide'
  } finally {
    totpLoading.value = false
  }
}

const fermerModal2FA = () => {
  modal2FAVisible.value = false
  totpStep.value = 1
  totpCode.value = ''
  totpErreur.value = ''
  totpQrCode.value = ''
  totpSecret.value = ''
}

// ─── Désactiver 2FA ───────────────────────────────────────────────────────────
const ouvrirModalDesactiver2FA = () => {
  totpDesactiverCode.value = ''
  totpErreur.value = ''
  modalDesactiver2FAVisible.value = true
}

const confirmerDesactivation2FA = async () => {
  totpErreur.value = ''
  totpLoading.value = true
  try {
    const res = await $fetch('/api/totp/disable', {
      method: 'POST',
      headers: getAuthHeader(),
      body: { code: totpDesactiverCode.value }
    })
    if (res.success) {
      settings.totpEnabled = false
      modalDesactiver2FAVisible.value = false
      toast.success('2FA désactivé')
    } else {
      totpErreur.value = res.message || 'Code invalide'
    }
  } catch (err) {
    totpErreur.value = err?.data?.message || 'Code invalide'
  } finally {
    totpLoading.value = false
  }
}
</script>