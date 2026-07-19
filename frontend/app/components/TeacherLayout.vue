<template>
  <div class="flex min-h-screen bg-layout font-['DM_Sans','Nunito',system-ui]" v-if="authChecked">

    <!-- ═══ DESKTOP SIDEBAR ═══ -->
    <aside
      class="hidden md:flex fixed left-0 top-0 bottom-0 bg-white flex-col p-3 z-40 shadow-[1px_1px_2px_1px_rgba(0,0,0,0.16)] transition-all duration-300"
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
        class="self-end w-7 h-7 rounded-lg bg-primary text-white hover:bg-primary/80 flex items-center justify-center cursor-pointer mb-5 flex-shrink-0 transition-colors duration-200"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path v-if="!sidebarCollapsed" d="M15 18l-6-6 6-6"/>
          <path v-else d="M9 18l6-6-6-6"/>
        </svg>
      </button>

      <nav class="flex flex-col flex-1 min-h-0 w-full gap-1 overflow-y-auto overflow-x-hidden pr-0.5 sidebar-scroll">
        <nuxt-link
          v-for="item in navItems"
          :key="item.key"
          :to="item.to"
          class="flex items-center font-body gap-2 bg-gray-200 px-2  rounded-md text-muted hover:bg-primary/10 hover:text-primary transition-all duration-200 w-full"
          :class="{ 'bg-secondary text-white': $route.path === item.to, 'justify-center': sidebarCollapsed }"
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
            <span v-if="!sidebarCollapsed" class="text-sm font-medium">Déconnexion</span>
          </transition>
        </button>
      </div>
    </aside>

    <!-- ═══ MAIN AREA ═══ -->
    <div
      class="flex-1 flex flex-col min-h-screen transition-all duration-300 w-full"
      :class="sidebarCollapsed ? 'md:ml-[68px]' : 'md:ml-[220px]'"
    >

      <!-- ═══ HEADER ═══ -->
      <header class="bg-secondary font-body px-4 h-16 flex items-center justify-between flex-shrink-0 sticky top-0 z-30 shadow-sm">

        <div class="md:hidden flex items-center gap-2">
          <img src="/images/logo-color.png" alt="Mentora" class="h-10 brightness-0 invert" />
          <img v-if="ecoleLogoUrl" :src="ecoleLogoUrl" alt="" class="w-8 h-8 rounded-lg object-cover border border-white/30"/>
        </div>

        <div class="hidden md:flex items-center gap-2">
          <img v-if="ecoleLogoUrl" :src="ecoleLogoUrl" alt="" class="w-7 h-7 rounded-lg object-cover border border-white/30"/>
          <p class="text-white font-semibold text-sm opacity-80">{{ ecoleNom || 'Espace enseignant' }}</p>
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
                <!-- Header -->
                <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <span class="text-sm font-semibold text-gray-800">
                    Notifications
                    <span v-if="unreadCount > 0" class="ml-1 text-xs text-primary font-normal">({{ unreadCount }} non lue{{ unreadCount > 1 ? 's' : '' }})</span>
                  </span>
                  <div class="flex gap-3">
                    <button
                      v-if="unreadCount > 0"
                      @click="markAllRead"
                      class="text-xs text-primary hover:text-[#1e3a2f] transition-colors font-medium"
                    >
                      Tout lire
                    </button>
                    <button
                      v-if="notifications.length > 0"
                      @click="clearAll"
                      class="text-xs text-gray-500 hover:text-red-500 transition-colors"
                    >
                      Effacer
                    </button>
                  </div>
                </div>

                <!-- Liste -->
                <div class="max-h-72 overflow-y-auto">
                  <div v-if="loading" class="px-4 py-8 text-center">
                    <div class="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent mx-auto" />
                  </div>

                  <div v-else-if="notifications.length === 0" class="px-4 py-8 text-center text-gray-500 text-sm">
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
                        <path
                          stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
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
                      <p class="text-xs font-semibold text-gray-800 leading-snug">{{ notif.titre }}</p>
                      <p class="text-xs text-gray-500 mt-0.5 line-clamp-2">{{ notif.message }}</p>
                      <p class="text-[10px] text-gray-500 mt-1">
                        {{ new Date(notif.createdAt).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) }}
                      </p>
                    </div>

                    <div v-if="!notif.isRead" class="w-2 h-2 rounded-full bg-primary shrink-0 mt-1" />
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
                :alt="teacher.firstName"
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
                  <p class="text-sm font-semibold text-gray-800">{{ teacher.firstName }} {{ teacher.lastName }}</p>
                  <p class="text-xs text-gray-500 mt-0.5">Enseignant</p>
                  <p class="text-xs text-gray-500 mt-0.5">{{ currentUser?.email }}</p>
                </div>
                <nuxt-link to="/teachers/profile" @click="closeDropdown" class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary/10 hover:text-primary transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                  Mon profil
                </nuxt-link>
                <div class="border-t border-gray-100 my-1"/>
                <button @click="handleLogoutClick" class="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                  Déconnexion
                </button>
              </div>
            </transition>
          </div>
        </div>
      </header>

      <!-- ═══ CONTENT ═══ -->
      <main class="flex-1 p-4 md:p-7 pb-24 md:pb-6">
        <AnnonceBanner />
        <slot />
      </main>
    </div>

    <!-- ═══ MOBILE BOTTOM NAV ═══ -->
    <nav class="md:hidden fixed bottom-0 left-0 right-0 z-50">
      <div class="w-full h-16 bg-white shadow-[0_-1px_2px_1px_rgba(0,0,0,0.10)] grid grid-cols-5">

        <nuxt-link to="/teachers" class="flex flex-col items-center justify-center gap-0.5 transition-colors" :class="$route.path === '/teachers' ? 'text-primary' : 'text-gray-500'">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m4 12 8-8 8 8M6 10.5V19a1 1 0 001 1h3v-3a1 1 0 011-1h2a1 1 0 011 1v3h3a1 1 0 001-1v-8.5"/></svg>
          <span class="text-[10px] font-medium">Accueil</span>
        </nuxt-link>

        <nuxt-link to="/teachers/sessions" class="flex flex-col items-center justify-center gap-0.5 transition-colors" :class="$route.path === '/teachers/sessions' ? 'text-primary' : 'text-gray-500'">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          <span class="text-[10px] font-medium">Sessions</span>
        </nuxt-link>

        <div class="flex items-center justify-center">
          <nuxt-link
            to="/teachers/create-session"
            class="w-12 h-12 rounded-full bg-secondary flex items-center justify-center  -mt-4 transition-transform hover:scale-105"
            :class="{ 'ring-4 ring-secondary/30': $route.path === '/teachers/create-session' }"
          >
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
          </nuxt-link>
        </div>

        <nuxt-link to="/teachers/profile" class="flex flex-col items-center justify-center gap-0.5 transition-colors" :class="$route.path === '/teachers/profile' ? 'text-primary' : 'text-gray-500'">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 21a9 9 0 100-18 9 9 0 000 18zm0 0a8.949 8.949 0 004.951-1.488A3.987 3.987 0 0013 16h-2a3.987 3.987 0 00-3.951 3.512A8.948 8.948 0 0012 21zm3-11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          <span class="text-[10px] font-medium">Profil</span>
        </nuxt-link>

        <button @click="showMobileMore = true" class="flex flex-col items-center justify-center gap-0.5 transition-colors text-gray-500">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
          <span class="text-[10px] font-medium">Plus</span>
        </button>

      </div>
    </nav>

    <!-- ═══ MENU MOBILE "PLUS" (tous les liens) ═══ -->
    <Teleport to="body">
      <Transition name="sheet-fade">
        <div v-if="showMobileMore" class="md:hidden fixed inset-0 z-[60] bg-black/50 flex items-end" @click.self="showMobileMore = false">
          <Transition name="sheet-pop" appear>
            <div v-if="showMobileMore" class="w-full bg-white rounded-t-2xl max-h-[75vh] overflow-y-auto pb-[env(safe-area-inset-bottom)]">
              <div class="w-10 h-1 bg-gray-300 rounded-full mx-auto mt-3 mb-1"/>
              <div class="px-4 py-2 flex items-center justify-between">
                <h3 class="font-body font-bold text-[#1e3a2f]">Menu</h3>
                <button @click="showMobileMore = false" class="p-1.5 text-gray-400 hover:text-gray-600">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
              <div class="px-3 pb-3 grid grid-cols-3 gap-2">
                <nuxt-link
                  v-for="item in navItems" :key="item.key" :to="item.to"
                  @click="showMobileMore = false"
                  class="flex flex-col items-center justify-center gap-1.5 rounded-xl p-3 transition-colors"
                  :class="$route.path === item.to ? 'bg-secondary text-white' : 'bg-[#f5f0e8] text-[#1e3a2f]'"
                >
                  <component :is="item.icon" class="w-5 h-5" />
                  <span class="text-[11px] font-medium text-center leading-tight">{{ item.label }}</span>
                </nuxt-link>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>

    <ConfirmModal />
  </div>
  <div v-else class="loading-screen"><div class="spinner" /></div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, onBeforeMount, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'
import { useToast } from '../../composables/useToast'
import { useWebSocket } from '../../composables/useWebSocket'
import { useNotifications } from '../../composables/useNotifications'
import { useEcoleLogo } from '../../composables/useEcoleLogo'

const route  = useRoute()
const router = useRouter()
const { getUser, logout, getProfile } = useAuth()
const { connect, disconnect } = useWebSocket()
const toast = useToast()
const { ecoleNom, logoUrl: ecoleLogoUrl, chargerEcoleLogo } = useEcoleLogo()

const sidebarCollapsed = ref(false)
const dropdownOpen     = ref(false)
const notifOpen        = ref(false)
const authChecked      = ref(false)
const showMobileMore   = ref(false)
const currentUser      = ref(null)
const notifRef         = ref(null)
const avatarRef        = ref(null)

// ─── Notifications persistantes ───────────────────────────────────────────────
const { notifications, unreadCount, loading, load, markRead, markAllRead, clearAll, addRealtime } = useNotifications()

const toggleNotifications = () => {
  notifOpen.value = !notifOpen.value
  dropdownOpen.value = false
}

const handleNotifClick = async (notif) => {
  await markRead(notif.id)
  if (notif.link) navigateTo(notif.link)
  notifOpen.value = false
}

// Écouter les soumissions étudiants via window event
const handleStudentSubmitted = (e) => {
  const data = e.detail
  addRealtime({
    titre:   `${data.etudiant?.prenom} ${data.etudiant?.nom} a terminé`,
    message: `Score : ${data.score}/${data.totalPoints} pts`,
    type:    'student_submitted',
    link:    null
  })
}

// ─── User ─────────────────────────────────────────────────────────────────────
const loadUserData = async () => {
  try {
    const result = await getProfile()
    if (result.success && result.user) {
      currentUser.value = result.user
      localStorage.setItem('user', JSON.stringify(result.user))
    } else {
      currentUser.value = getUser()
    }
  } catch {
    currentUser.value = getUser()
  }
}

const teacher = computed(() => ({
  firstName: currentUser.value?.prenom || 'Enseignant',
  lastName:  currentUser.value?.nom    || '',
  avatar:    currentUser.value?.avatar || null
}))

const avatarUrl = computed(() => {
  if (!teacher.value.avatar) return null
  if (teacher.value.avatar.startsWith('http')) return teacher.value.avatar
  return `${useRuntimeConfig().public.apiBase?.replace('/api', '') || 'http://localhost:5000'}${teacher.value.avatar}`
})

// ─── Click outside ────────────────────────────────────────────────────────────
const handleClickOutside = (e) => {
  if (notifRef.value  && !notifRef.value.contains(e.target))  notifOpen.value = false
  if (avatarRef.value && !avatarRef.value.contains(e.target)) dropdownOpen.value = false
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────
onBeforeMount(() => { currentUser.value = getUser() })

onMounted(async () => {
  await load() // ← en premier
  authChecked.value = true
  await loadUserData()
  chargerEcoleLogo()

  if (currentUser.value?.id) {
    connect(currentUser.value.id, 'professeur')
  }

  document.addEventListener('click', handleClickOutside)
  window.addEventListener('student-submitted-notif', handleStudentSubmitted)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('student-submitted-notif', handleStudentSubmitted)
})

const toggleDropdown    = () => { dropdownOpen.value = !dropdownOpen.value; notifOpen.value = false }
const closeDropdown     = () => { dropdownOpen.value = false }
const handleLogout      = () => { disconnect(); logout(); router.push('/auth') }
const handleLogoutClick = () => { closeDropdown(); handleLogout() }

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconLogout = () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
  h('path', { d: 'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4' }),
  h('polyline', { points: '16 17 21 12 16 7' }),
  h('line', { x1: 21, y1: 12, x2: 9, y2: 12 })
])

const navItems = [
  { key: 'home',     to: '/teachers',                label: 'Accueil',           icon: () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z' }), h('polyline', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', points: '9 22 9 12 15 12 15 22' })]) },
  { key: 'sessions', to: '/teachers/sessions',       label: 'Mes sessions',      icon: () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [h('rect', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', x: 3, y: 4, width: 18, height: 18, rx: 2 }), h('line', { x1: 16, y1: 2, x2: 16, y2: 6 }), h('line', { x1: 8, y1: 2, x2: 8, y2: 6 }), h('line', { x1: 3, y1: 10, x2: 21, y2: 10 })]) },
  { key: 'create',   to: '/teachers/create-session', label: 'Créer une session', icon: () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M12 4v16m8-8H4' })]) },
  { key: 'calendrier', to: '/teachers/calendrier', label: 'Calendrier', icon: () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [h('rect', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', x: 3, y: 4, width: 18, height: 18, rx: 2 }), h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M16 2v4M8 2v4M3 10h18' })]) },
  { key: 'banque',   to: '/teachers/banque-questions', label: 'Banque de questions', icon: () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z' })]) },
  { key: 'stats',    to: '/teachers/stats',            label: 'Statistiques',      icon: () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' })]) },
  { key: 'profile',  to: '/teachers/profile',        label: 'Profil',            icon: () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2' }), h('circle', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', cx: 12, cy: 7, r: 4 })]) },
{
  key: 'parametres',
  to: '/teachers/parametres',
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
}]
</script>

<style scoped>
.fade-x-enter-active { transition: all .18s ease; }
.fade-x-leave-active { transition: all .12s ease; }
.fade-x-enter-from, .fade-x-leave-to { opacity: 0; transform: translateX(-6px); }

.spinner {
  border: 4px solid rgba(0,0,0,0.1);
  border-top-color: #054348;
  border-radius: 50%;
  width: 40px; height: 40px;
  animation: spin 1s linear infinite;
}
.loading-screen { display: flex; align-items: center; justify-content: center; height: 100vh; }
@keyframes spin { to { transform: rotate(360deg); } }

.sidebar-scroll::-webkit-scrollbar { width: 4px; }
.sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
.sidebar-scroll::-webkit-scrollbar-thumb { background: #e2ddd4; border-radius: 4px; }
.sidebar-scroll { scrollbar-width: thin; scrollbar-color: #e2ddd4 transparent; }

.sheet-fade-enter-active, .sheet-fade-leave-active { transition: opacity 0.2s ease; }
.sheet-fade-enter-from, .sheet-fade-leave-to { opacity: 0; }
.sheet-pop-enter-active { transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1); }
.sheet-pop-leave-active { transition: transform 0.15s ease; }
.sheet-pop-enter-from, .sheet-pop-leave-to { transform: translateY(100%); }
</style>