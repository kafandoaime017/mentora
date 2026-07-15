<template>
  <div class="flex min-h-screen bg-layout font-['DM_Sans','Nunito',system-ui]" v-if="authChecked">

    <!-- ═══ DESKTOP SIDEBAR ═══ -->
    <aside
      v-if="!isParticipating"
      class="hidden md:flex fixed left-0 top-0 bottom-0 bg-white flex-col p-3 z-40 overflow-hidden shadow-[1px_1px_2px_1px_rgba(0,0,0,0.16)] transition-all duration-300"
      :class="sidebarCollapsed ? 'w-[68px] items-center' : 'w-[220px] items-start'"
    >
      <div class="flex items-center justify-center w-full h-16 mb-6 mt-3">
        <img src="/images/logo-color.png" alt="Mentora" class="h-20 transition-all duration-300" />
      </div>

      <div v-if="ecoleLogoUrl" class="flex items-center gap-2 w-full px-2 mb-4" :class="{ 'justify-center': sidebarCollapsed }">
        <img :src="ecoleLogoUrl" alt="" class="w-8 h-8 rounded-lg object-cover border border-gray-200 shrink-0"/>
        <span v-if="!sidebarCollapsed" class="text-xs font-semibold text-black truncate">{{ ecoleNom }}</span>
      </div>

      <button
        @click="sidebarCollapsed = !sidebarCollapsed"
        class="self-end w-7 h-7 rounded-lg bg-secondary text-primary hover:bg-primary hover:text-white flex items-center justify-center cursor-pointer mb-5 flex-shrink-0 transition-colors duration-200"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path v-if="!sidebarCollapsed" d="M15 18l-6-6 6-6"/>
          <path v-else d="M9 18l6-6-6-6"/>
        </svg>
      </button>

      <nav class="flex flex-col flex-1 w-full gap-1">
        <nuxt-link
          v-for="item in navItems"
          :key="item.key"
          :to="item.to"
          class="flex items-center font-body gap-2 bg-gray-200 px-2  rounded-md text-muted hover:bg-primary/10 hover:text-primary transition-all duration-200 w-full"
          :class="{ 'bg-primary text-white': $route.path === item.to, 'justify-center': sidebarCollapsed }"
          :title="item.label"
        >
          <span class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
            <component :is="item.icon" class="w-5 h-5" />
          </span>
          <transition name="fade-x">
            <span v-if="!sidebarCollapsed" class="flex-1 text-md font-medium truncate">{{ item.label }}</span>
          </transition>
        </nuxt-link>
      </nav>

      <div class="border-t border-[#f0ebe0] pt-2 mt-2 w-full">
        <button
          @click="handleLogoutClick"
          class="flex items-center gap-3 px-2  rounded-lg text-red-500 bg-red-200 hover:text-red-600 hover:bg-red-300 transition-all duration-200 w-full"
          :class="sidebarCollapsed ? 'justify-center' : 'justify-start'"
        >
          <span class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
            <IconLogout class="w-5 h-5" />
          </span>
          <transition name="fade-x">
            <span v-if="!sidebarCollapsed" class="text-sm font-body font-bold">Déconnexion</span>
          </transition>
        </button>
      </div>
    </aside>

    <!-- ═══ MAIN AREA ═══ -->
    <div
      class="flex-1 flex flex-col min-h-screen transition-all duration-300 w-full"
      :class="isParticipating ? 'ml-0' : (sidebarCollapsed ? 'md:ml-[68px]' : 'md:ml-[220px]')"
    >

      <!-- ═══ HEADER ═══ -->
      <header
        v-if="!isParticipating"
        class="bg-primary font-body px-4 h-16 flex items-center justify-between flex-shrink-0 sticky top-0 z-30 shadow-sm"
      >
        <div class="md:hidden flex items-center gap-2">
          <img src="/images/logo-blanc.png" alt="Mentora" class="h-10" />
          <img v-if="ecoleLogoUrl" :src="ecoleLogoUrl" alt="" class="w-8 h-8 rounded-lg object-cover border border-white/30"/>
        </div>
        <div class="hidden md:flex items-center gap-2">
          <img v-if="ecoleLogoUrl" :src="ecoleLogoUrl" alt="" class="w-7 h-7 rounded-lg object-cover border border-white/30"/>
          <p class="text-white font-semibold text-sm opacity-80">{{ ecoleNom || 'Espace étudiant' }}</p>
        </div>

        <div class="flex items-center gap-2">
          <!-- Notifications -->
          <div class="relative" ref="notifRef">
            <button
              @click="toggleNotifications"
              class="relative w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
              <span
                v-if="unreadCount > 0"
                class="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
              >
                {{ unreadCount > 9 ? '9+' : unreadCount }}
              </span>
            </button>

            <transition
              enter-active-class="transition duration-200 ease-out"
              enter-from-class="transform scale-95 opacity-0"
              enter-to-class="transform scale-100 opacity-100"
              leave-active-class="transition duration-150 ease-in"
              leave-from-class="transform scale-100 opacity-100"
              leave-to-class="transform scale-95 opacity-0"
            >
              <div
                v-if="notifOpen"
                class="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden"
                style="top: calc(100% + 8px)"
              >
                <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <span class="text-md font-bold text-gray-900">
                    Notifications
                    <span v-if="unreadCount > 0" class="ml-1 text-xs text-primary font-normal">({{ unreadCount }} non lue{{ unreadCount > 1 ? 's' : '' }})</span>
                  </span>
                  <div class="flex gap-3">
                    <button v-if="unreadCount > 0" @click="markAllRead" class="text-xs text-primary hover:text-[#1e3a2f] transition-colors font-medium">Tout lire</button>
                    <button v-if="notifications.length > 0" @click="clearAll" class="text-xs text-gray-500 hover:text-red-500 transition-colors">Effacer</button>
                  </div>
                </div>
                <div class="max-h-72 overflow-y-auto">
                  <div v-if="loading" class="px-4 py-8 text-center">
                    <div class="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent mx-auto"/>
                  </div>
                  <div v-else-if="notifications.length === 0" class="px-4 py-8 text-center text-gray-500 text-md">
                    Aucune notification
                  </div>
                  <div
                    v-else
                    v-for="notif in notifications"
                    :key="notif.id"
                    class="flex gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 cursor-pointer"
                    :class="{ 'bg-primary/5': !notif.isRead }"
                    @click="handleNotifClick(notif)"
                  >
                    <div
                      class="shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                      :class="{
                        'bg-blue-100 text-blue-600':     notif.type === 'new_session',
                        'bg-green-100 text-green-600':   notif.type === 'session_started',
                        'bg-gray-100 text-gray-500':     notif.type === 'session_completed',
                        'bg-orange-100 text-orange-600': notif.type === 'student_submitted',
                      }"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          :d="notif.type === 'new_session'
                            ? 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                            : notif.type === 'session_started'
                            ? 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                            : notif.type === 'student_submitted'
                            ? 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                            : 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9'"
                        />
                      </svg>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-md font-semibold text-gray-900 leading-snug">{{ notif.titre }}</p>
                      <p class="text-sm text-gray-900 mt-0.5 line-clamp-2">{{ notif.message }}</p>
                      <p class="text-[13px] text-gray-500 mt-1">
                        {{ new Date(notif.createdAt).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) }}
                      </p>
                    </div>
                    <div v-if="!notif.isRead" class="w-2 h-2 rounded-full bg-primary shrink-0 mt-1"/>
                  </div>
                </div>
              </div>
            </transition>
          </div>

          <!-- Avatar -->
          <div class="relative" ref="avatarRef">
            <button @click="toggleDropdown" class="flex items-center gap-2 focus:outline-none">
              <img
                :src="avatarUrl || 'https://img.freepik.com/premium-photo/young-student-avatar-generative-ai_138015-2404.jpg'"
                :alt="student.firstName"
                class="w-9 h-9 rounded-full object-cover border-2 border-white/40 hover:opacity-90 transition-opacity"
              />
              <svg
                class="w-4 h-4 text-white transition-transform duration-200 hidden sm:block"
                :class="{ 'rotate-180': dropdownOpen }"
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>

            <transition
              enter-active-class="transition duration-200 ease-out"
              enter-from-class="transform scale-95 opacity-0"
              enter-to-class="transform scale-100 opacity-100"
              leave-active-class="transition duration-150 ease-in"
              leave-from-class="transform scale-100 opacity-100"
              leave-to-class="transform scale-95 opacity-0"
            >
              <div
                v-if="dropdownOpen"
                class="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50"
                style="top: calc(100% + 8px)"
              >
                <div class="px-4 py-3 border-b border-gray-100">
                  <p class="text-sm font-semibold text-gray-800">{{ student.firstName }} {{ student.lastName }}</p>
                  <p class="text-xs text-gray-500 mt-0.5">{{ student.role }}</p>
                  <p class="text-xs text-gray-500 mt-0.5">{{ currentUser?.email }}</p>
                </div>
                <nuxt-link to="/students/profile" @click="closeDropdown" class="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-800 hover:bg-primary/10 hover:text-primary transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                  Mon profil
                </nuxt-link>
                <nuxt-link to="/students/settings" @click="closeDropdown" class="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-800 hover:bg-primary/10 hover:text-primary transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  Paramètres
                </nuxt-link>
                <div class="border-t border-gray-100 my-1"/>
                <button @click="handleLogoutClick" class="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 font-bold hover:bg-red-50 transition-colors w-full text-left">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                  Déconnexion
                </button>
              </div>
            </transition>
          </div>
        </div>
      </header>

      <!-- ═══ CONTENT ═══ -->
      <main :class="isParticipating ? 'flex-1' : 'flex-1 p-4 md:p-7 pb-24 md:pb-6'">
        <AnnonceBanner v-if="!isParticipating" />
        <slot />
      </main>
    </div>

    <!-- ═══ MOBILE BOTTOM NAV ═══ -->
    <nav v-if="!isParticipating" class="md:hidden fixed bottom-0 left-0 right-0 z-50">
      <div class="w-full h-16 bg-white shadow-[0_-1px_2px_1px_rgba(0,0,0,0.10)] grid grid-cols-5">
        <nuxt-link to="/students" class="flex flex-col items-center justify-center gap-0.5 transition-colors" :class="$route.path === '/students' ? 'text-primary' : 'text-gray-500'">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m4 12 8-8 8 8M6 10.5V19a1 1 0 001 1h3v-3a1 1 0 011-1h2a1 1 0 011 1v3h3a1 1 0 001-1v-8.5"/></svg>
          <span class="text-[10px] font-medium">Accueil</span>
        </nuxt-link>
        <nuxt-link to="/students/my-sessions" class="flex flex-col items-center justify-center gap-0.5 transition-colors" :class="$route.path === '/students/my-sessions' ? 'text-primary' : 'text-gray-500'">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          <span class="text-[10px] font-medium">Sessions</span>
        </nuxt-link>
        <div class="flex items-center justify-center">
          <nuxt-link
            to="/students/join-session"
            class="w-12 h-12 rounded-full bg-primary flex items-center justify-center -mt-4 transition-transform hover:scale-105"
            :class="{ 'ring-4 ring-primary/30': $route.path === '/students/join-session' }"
          >
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
          </nuxt-link>
        </div>
        <nuxt-link to="/students/notes" class="flex flex-col items-center justify-center gap-0.5 transition-colors" :class="$route.path === '/students/notes' ? 'text-primary' : 'text-gray-500'">
<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
</svg>
          <span class="text-[10px] font-medium">Mes notes</span>
        </nuxt-link>
        <nuxt-link to="/students/profile" class="flex flex-col items-center justify-center gap-0.5 transition-colors" :class="$route.path === '/students/profile' ? 'text-primary' : 'text-gray-500'">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 21a9 9 0 100-18 9 9 0 000 18zm0 0a8.949 8.949 0 004.951-1.488A3.987 3.987 0 0013 16h-2a3.987 3.987 0 00-3.951 3.512A8.948 8.948 0 0012 21zm3-11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          <span class="text-[10px] font-medium">Profil</span>
        </nuxt-link>
      </div>
    </nav>

  </div>
  <div v-else class="loading-screen"><div class="spinner"/></div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, onBeforeMount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'
import { useWebSocket } from '../../composables/useWebSocket'
import { useNotifications } from '../../composables/useNotifications'
import { useToast } from '../../composables/useToast'
import { useEcoleLogo } from '../../composables/useEcoleLogo'

const route  = useRoute()
const router = useRouter()
const { getUser, logout, getProfile } = useAuth()
const { connect, disconnect, getSocket, onNewSession, onSessionStarted } = useWebSocket()
const toast = useToast()
const { ecoleNom, logoUrl: ecoleLogoUrl, chargerEcoleLogo } = useEcoleLogo()

const isParticipating  = useState('isParticipating', () => false)
const sidebarCollapsed = ref(false)
const dropdownOpen     = ref(false)
const notifOpen        = ref(false)
const authChecked      = ref(false)
const currentUser      = ref(null)
const etudiantProfil   = ref(null)
const notifRef         = ref(null)
const avatarRef        = ref(null)

const { notifications, unreadCount, loading, load, markRead, markAllRead, clearAll, addRealtime } = useNotifications()

const toggleNotifications = () => { notifOpen.value = !notifOpen.value; dropdownOpen.value = false }

const handleNotifClick = async (notif) => {
  await markRead(notif.id)
  if (notif.link) navigateTo(notif.link)
  notifOpen.value = false
}

const handleClickOutside = (e) => {
  if (notifRef.value  && !notifRef.value.contains(e.target))  notifOpen.value = false
  if (avatarRef.value && !avatarRef.value.contains(e.target)) dropdownOpen.value = false
}

const loadUserData = async () => {
  try {
    const result = await getProfile()
    if (result.success && result.user) {
      currentUser.value = result.user
      localStorage.setItem('user', JSON.stringify(result.user))
      if (result.user.etudiantProfil) {
        etudiantProfil.value = result.user.etudiantProfil
        localStorage.setItem('etudiantProfil', JSON.stringify(etudiantProfil.value))
      }
    } else {
      currentUser.value = getUser()
      const saved = localStorage.getItem('etudiantProfil')
      if (saved) etudiantProfil.value = JSON.parse(saved)
    }
  } catch {
    currentUser.value = getUser()
  }
}

const student = computed(() => ({
  firstName: currentUser.value?.prenom || 'Utilisateur',
  lastName:  currentUser.value?.nom    || '',
  role:      currentUser.value?.role === 'etudiant' ? 'Étudiant' : 'Utilisateur',
  avatar:    currentUser.value?.avatar || null
}))

const avatarUrl = computed(() => {
  if (!student.value.avatar) return null
  if (student.value.avatar.startsWith('http')) return student.value.avatar
  return `${useRuntimeConfig().public.apiBase?.replace('/api', '') || 'http://localhost:5000'}${student.value.avatar}`
})

const initWebSocket = () => {
  if (currentUser.value?.id && etudiantProfil.value) {
    connect(currentUser.value.id, 'etudiant', etudiantProfil.value.classeId, etudiantProfil.value.filiereId)
  }
}

const handleNotesPubliees = (data) => {
  addRealtime({
    titre:   'Notes disponibles',
    message: data.message,
    type:    'session_completed',
    link:    `/students/notes/${data.sessionId}`
  })
  toast.success(data.message || 'Vos notes sont disponibles !')
  window.dispatchEvent(new CustomEvent('global-notes-publiees', { detail: data }))
}

const handleNewSession = (data) => {
  addRealtime({ titre: 'Nouvelle session', message: data.session?.titre || data.message, type: 'new_session', link: '/students' })
  toast.success(data.message || 'Nouvelle session disponible')
  window.dispatchEvent(new CustomEvent('global-new-session', { detail: data }))
}

const handleSessionStarted = (data) => {
  addRealtime({
    titre:   'Session démarrée',
    message: data.session?.titre || data.message,
    type:    'session_started',
    link:    data.session?.code ? `/students/join-session?code=${data.session.code}` : '/students'
  })
  toast.warning(data.message || 'Une session vient de démarrer')
  window.dispatchEvent(new CustomEvent('global-session-started', { detail: data }))
}

onBeforeMount(() => { currentUser.value = getUser() })

onMounted(async () => {
  await load()
  authChecked.value = true
  await loadUserData()
  chargerEcoleLogo()
  initWebSocket()
  onNewSession(handleNewSession)
  onSessionStarted(handleSessionStarted)

  // ← AJOUTE
  setTimeout(() => {
  const socket = getSocket()
  if (socket) socket.on('notes-publiees', handleNotesPubliees)
}, 1000)

  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  disconnect()
  document.removeEventListener('click', handleClickOutside)

  // ← AJOUTE
 const socket = getSocket()
if (socket) socket.off('notes-publiees', handleNotesPubliees)
})

const toggleDropdown    = () => { dropdownOpen.value = !dropdownOpen.value; notifOpen.value = false }
const closeDropdown     = () => { dropdownOpen.value = false }
const handleLogout      = () => { disconnect(); logout(); router.push('/auth') }
const handleLogoutClick = () => { closeDropdown(); handleLogout() }

const IconLogout = () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
  h('path', { d: 'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4' }),
  h('polyline', { points: '16 17 21 12 16 7' }),
  h('line', { x1: 21, y1: 12, x2: 9, y2: 12 })
])

const navItems = [
  { key: 'home',     to: '/students',              label: 'Accueil',      icon: () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z' }), h('polyline', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', points: '9 22 9 12 15 12 15 22' })]) },
  { key: 'sessions', to: '/students/my-sessions',  label: 'Mes sessions', icon: () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [h('rect', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', x: 3, y: 4, width: 18, height: 18, rx: 2 }), h('line', { x1: 16, y1: 2, x2: 16, y2: 6 }), h('line', { x1: 8, y1: 2, x2: 8, y2: 6 }), h('line', { x1: 3, y1: 10, x2: 21, y2: 10 })]) },
  { key: 'join',     to: '/students/join-session', label: 'Rejoindre',    icon: () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M12 4v16m8-8H4' })]) },
  { key: 'notes', to: '/students/notes', label: 'Mes notes', icon: () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' })]) },
  { key: 'profile',  to: '/students/profile',      label: 'Profil',       icon: () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2' }), h('circle', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', cx: 12, cy: 7, r: 4 })]) },
{
  key: 'parametres',
  to: '/students/settings',
  label: 'Paramètres',
  icon: () => h('svg', {
    width: 20,
    height: 20,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': 2
  }, [
    h('path', {
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      d: 'M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7z'
    }),
    h('path', {
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      d: 'M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1.08 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.06A1.65 1.65 0 0 0 10 3.09V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.06A1.65 1.65 0 0 0 20.91 10H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z'
    })
  ])
}
]
</script>

<style scoped>
.fade-x-enter-active { transition: all .18s ease; }
.fade-x-leave-active { transition: all .12s ease; }
.fade-x-enter-from, .fade-x-leave-to { opacity: 0; transform: translateX(-6px); }
.spinner { border: 4px solid rgba(0,0,0,0.1); border-top-color: #054348; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; }
.loading-screen { display: flex; align-items: center; justify-content: center; height: 100vh; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>