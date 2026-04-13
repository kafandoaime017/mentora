<template>
  <div class="flex min-h-screen bg-layout font-['DM_Sans','Nunito',system-ui]" v-if="authChecked">
  
    <!-- ═══════════════════════════════
         DESKTOP SIDEBAR (cachée sur mobile)
    ════════════════════════════════ -->
   <aside 
  class="hidden md:flex fixed left-0 top-0 bottom-0 bg-white flex-col p-3 z-200 overflow-hidden shadow-[1px_1px_2px_1px_rgba(0,0,0,0.16)] transition-all duration-300"
  :class="sidebarCollapsed ? 'w-[68px] items-center' : 'w-[220px] items-start'"
    >

  <!-- Logo -->
  <div class="flex items-center justify-center w-full h-16 mb-6 mt-3">
    <img src="/images/logo-color.png" alt="Mentora" 
         class="h-20 transition-all duration-300"
         :class="sidebarCollapsed ? ' ' : ''"/>
  </div>

  <!-- Collapse btn -->
  <button 
    @click="sidebarCollapsed = !sidebarCollapsed"
    class="self-end w-7 h-7 rounded-lg bg-primary text-white hover:bg-primary hover:text-white flex items-center justify-center cursor-pointer mb-5 flex-shrink-0 transition-colors duration-200"
  >
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
      <path v-if="!sidebarCollapsed" d="M15 18l-6-6 6-6"/>
      <path v-else d="M9 18l6-6-6-6"/>
    </svg>
  </button>

  <!-- Nav -->
  <nav class="flex flex-col flex-1 w-full">
    <nuxt-link
      v-for="item in navItems" 
      :key="item.key"
      :to="item.to"
      class="flex items-center font-body gap-2 px-2 py-1 rounded-md text-muted hover:bg-primary/10 hover:text-primary transition-all duration-200 w-full"
      :class="{ 
        'bg-secondary/20 ': $route.path === item.to,
        'justify-center': sidebarCollapsed 
      }"
      :title="item.label"
    >
      <span 
        class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-200"
       
      >
        <component :is="item.icon" class="w-5 h-5"/>
      </span>
      <transition name="fade-x">
        <span v-if="!sidebarCollapsed" class="flex-1 text-md font-medium truncate">{{ item.label }}</span>
      </transition>
     
    </nuxt-link>
  </nav>

  <!-- Logout -->
  <div class="border-t border-[#f0ebe0] pt-2 mt-2 w-full flex justify-center md:justify-start">
    <button 
      @click="handleLogout" 
      class="flex items-center gap-3 px-2 py-2 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 w-full"
      :class="sidebarCollapsed ? 'justify-center' : 'justify-start'"
      title="Déconnexion"
    >
      <span class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
        <IconLogout class="w-5 h-5"/>
      </span>
      <transition name="fade-x">
        <span v-if="!sidebarCollapsed" class="text-sm font-medium truncate">Déconnexion</span>
      </transition>
    </button>
  </div>
</aside>

    <!-- ═══════════════════════════════
         MAIN AREA
    ════════════════════════════════ -->
    <div 
      class="flex-1 flex flex-col min-h-screen transition-all duration-300 w-full"
      :class="sidebarCollapsed ? 'md:ml-[68px]' : 'md:ml-[220px]'"
    >

      <!-- ── TEAL HEADER ── -->
     <header class="bg-secondary font-body px-5 p-2 flex items-center justify-between flex-shrink-0 
               fixed top-0 left-0 w-full z-50 md:static">
        <div class="flex-1">
          <img src="/images/logo-blanc.png" alt="Mentora" 
               class="h-16 md:hidden transition-all duration-300"/>
        </div>
        
        <!-- ── AVATAR DROPDOWN ── -->
        <div class="relative">
          <!-- Avatar button -->
          <button 
            @click="toggleDropdown"
            class="flex items-center gap-2 focus:outline-none group"
          >
            <img
              :src="student.avatar || 'https://img.freepik.com/premium-photo/young-student-avatar-generative-ai_138015-2404.jpg'"
              :alt="student.firstName"
              class="w-[40px] h-[40px] rounded-full object-cover border-3 border-white/50 bg-white/20 flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
            />
            <!-- Petit indicateur de dropdown (facultatif) -->
            <svg 
              class="w-4 h-4 text-white transition-transform duration-200 hidden sm:block"
              :class="{ 'rotate-180': dropdownOpen }"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <!-- Dropdown menu -->
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
              class="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-lg py-2 z-50 border border-gray-100"
            >
              <!-- Info utilisateur compacte -->
              <div class="px-4 py-3 border-b border-gray-100">
                <p class="text-sm font-semibold text-gray-800">{{ student.firstName }} {{ student.lastName || '' }}</p>
                <p class="text-xs text-gray-500 mt-0.5">{{ student.role || 'Étudiant' }}</p>
              </div>

              <!-- Liens -->
              <nuxt-link
                to="/students/profile"
                @click="closeDropdown"
                class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary/10 hover:text-primary transition-colors duration-200"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Mon profil</span>
              </nuxt-link>

              <nuxt-link
                to="/students/settings"
                @click="closeDropdown"
                class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary/10 hover:text-primary transition-colors duration-200"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Paramètres</span>
              </nuxt-link>

              <!-- Séparateur -->
              <div class="border-t border-gray-100 my-1"></div>

              <!-- Déconnexion -->
              <button 
                @click="handleLogoutClick"
                class="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 w-full text-left"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Déconnexion</span>
              </button>
            </div>
          </transition>
        </div>
      </header>

      <!-- ── PAGE CONTENT ── -->
      <main class="flex-1 mt-16 md:mt-4 p-6 md:p-7 pb-24 md:pb-6">
            <slot />
      </main>
    </div>

    <!-- ═══════════════════════════════
         MOBILE BOTTOM NAV (visible uniquement sur mobile)
    ════════════════════════════════ -->
    <nav class="md:hidden fixed bottom-0 left-0 right-0 z-50 pb-[env(safe-area-inset-bottom)]">
      <div class="fixed bottom-0 left-0 z-50 w-full h-20 bg-white shadow-[0_-1px_2px_1px_rgba(0,0,0,0.16)]">
      <div class="grid h-full max-w-lg grid-cols-5 mx-auto font-medium">
        
        <!-- Accueil -->
        <nuxt-link
        to="/teachers"
        class="inline-flex flex-col font-body items-center justify-center px-5 border-x border-gray-300 hover:bg-teal-800/10 transition-colors duration-200 group"
        :class="{ 'text-primary bg-primary/20' : $route.path === '/teachers' }"
        >
        <svg class="w-7 h-7 mb-1" :class="{ 'text-primary': $route.path === '/teachers', 'text-gray-500 group-hover:text-primary': $route.path !== '/teachers' }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m4 12 8-8 8 8M6 10.5V19a1 1 0 0 0 1 1h3v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3h3a1 1 0 0 1 1-1v-8.5"/>
        </svg>
        <span class="text-sm" :class="{ 'text-primary font-semibold': $route.path === '/teachers', 'text-gray-600': $route.path !== '/teachers' }">Accueil</span>
        </nuxt-link>

        <!-- Mes QCM -->
        <nuxt-link
        to="/teachers/my-sessions"
        class="inline-flex flex-col font-body items-center justify-center px-5 border-r border-gray-200 hover:bg-gray-50 transition-colors duration-200 group relative"
        :class="{ 'text-primary bg-primary/20': $route.path === '/teachers/my-sessions' }"
        >
        <svg class="w-7 h-7 mb-1" :class="{ 'text-primary': $route.path === '/teachers/my-sessions', 'text-gray-500 group-hover:text-primary': $route.path !== '/teachers/my-sessions' }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
        <span class="text-sm" :class="{ 'text-primary font-semibold': $route.path === '/teachers/my-sessions', 'text-gray-600': $route.path !== '/teachers/my-sessions' }">Sessions</span>
        </nuxt-link>

        <!-- Créer un QCM (bouton central surélevé) -->
        <div class="flex items-center justify-center">
        <nuxt-link
          to="/teachers/create-session"
          class="inline-flex font-body items-center justify-center text-white bg-secondary hover:bg-primary-dark focus:ring-4 focus:ring-primary/30 shadow-lg w-16 h-16 rounded-full focus:outline-none transition-all duration-200"
          :class="{ 'ring-4 ring-primary/50': $route.path === '/teachers/create-session' }"
        >
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
        </nuxt-link>
        </div>

        <!-- Sessions -->
        <nuxt-link
        to="/historique"
        class="inline-flex font-body flex-col items-center justify-center px-5 border-x border-gray-200 hover:bg-gray-50 transition-colors duration-200 group"
        :class="{ 'text-primary bg-primary/20': $route.path === '/historique' }"
        >
        <svg class="w-6 h-6 mb-1" :class="{ 'text-primary': $route.path === '/historique', 'text-gray-500 group-hover:text-primary': $route.path !== '/historique' }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
        <span class="text-sm" :class="{ 'text-primary font-semibold': $route.path === '/historique', 'text-gray-600': $route.path !== '/historique' }">Sessions</span>
        </nuxt-link>

        <!-- Profil -->
        <nuxt-link
        to="/teachers/profile"
        class="inline-flex font-body flex-col items-center justify-center px-5 border-r border-gray-200 hover:bg-gray-50 transition-colors duration-200 group"
        :class="{ 'text-primary bg-primary/20': $route.path === '/teachers/profile' }"
        >
        <svg class="w-6 h-6 mb-1" :class="{ 'text-primary': $route.path === '/teachers/profile', 'text-gray-500 group-hover:text-primary': $route.path !== '/teachers/profile' }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0 0a8.949 8.949 0 0 0 4.951-1.488A3.987 3.987 0 0 0 13 16h-2a3.987 3.987 0 0 0-3.951 3.512A8.948 8.948 0 0 0 12 21Zm3-11a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
        </svg>
        <span class="text-sm" :class="{ 'text-primary font-semibold': $route.path === '/teachers/profile', 'text-gray-600': $route.path !== '/teachers/profile' }">Profil</span>
        </nuxt-link>
      </div>
      </div>
    </nav>
  </div>
  <div v-else class="loading-screen">
    <div class="spinner"></div>
  </div>
</template>

<script setup>
import { ref, h, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const sidebarCollapsed = ref(false)
const dropdownOpen = ref(false)
const authChecked = ref(false)

import { useAuth } from '../../composables/useAuth'

import { useToast } from '../../composables/useToast'

const toast = useToast()
const { logout } = useAuth()

// Fermer le dropdown en cliquant à l'extérieur
const handleClickOutside = (event) => {
  const dropdown = document.querySelector('.relative')
  if (dropdown && !dropdown.contains(event.target)) {
    dropdownOpen.value = false
  }
}

onMounted(() => {
  authChecked.value = true
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value
}

const closeDropdown = () => {
  dropdownOpen.value = false
}

const student = ref({
  firstName: 'Julie',
  lastName: 'Martin',
  role: 'Étudiante en L2 Informatique',
  avatar: null
})

// ── Icons as functional components ──
const IconHome = () => h('svg', {
  width: 20, height: 20, viewBox: '0 0 24 24',
  fill: 'none', stroke: 'currentColor', 'stroke-width': 2,
  'stroke-linecap': 'round', 'stroke-linejoin': 'round'
}, [
  h('path', { d: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z' }),
  h('polyline', { points: '9 22 9 12 15 12 15 22' })
])

const IconCalendar = () => h('svg', {
  width: 20, height: 20, viewBox: '0 0 24 24',
  fill: 'none', stroke: 'currentColor', 'stroke-width': 2,
  'stroke-linecap': 'round', 'stroke-linejoin': 'round'
}, [
  h('rect', { x: 3, y: 4, width: 18, height: 18, rx: 2 }),
  h('line', { x1: 16, y1: 2, x2: 16, y2: 6 }),
  h('line', { x1: 8, y1: 2, x2: 8, y2: 6 }),
  h('line', { x1: 3, y1: 10, x2: 21, y2: 10 })
])

const IconUsers = () => h('svg', {
  width: 22, height: 22, viewBox: '0 0 24 24',
  fill: 'none', stroke: 'currentColor', 'stroke-width': 2,
  'stroke-linecap': 'round', 'stroke-linejoin': 'round'
}, [
  h('path', { d: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2' }),
  h('circle', { cx: 9, cy: 7, r: 4 }),
  h('path', { d: 'M23 21v-2a4 4 0 00-3-3.87' }),
  h('path', { d: 'M16 3.13a4 4 0 010 7.75' })
])

const IconHistory = () => h('svg', {
  width: 20, height: 20, viewBox: '0 0 24 24',
  fill: 'none', stroke: 'currentColor', 'stroke-width': 2,
  'stroke-linecap': 'round', 'stroke-linejoin': 'round'
}, [
  h('polyline', { points: '12 8 12 12 14 14' }),
  h('path', { d: 'M3.05 11a9 9 0 1 0 .5-4' }),
  h('polyline', { points: '3 3 3 9 9 9' })
])

const IconUser = () => h('svg', {
  width: 20, height: 20, viewBox: '0 0 24 24',
  fill: 'none', stroke: 'currentColor', 'stroke-width': 2,
  'stroke-linecap': 'round', 'stroke-linejoin': 'round'
}, [
  h('path', { d: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2' }),
  h('circle', { cx: 12, cy: 7, r: 4 })
])

const IconBell = () => h('svg', {
  width: 20, height: 20, viewBox: '0 0 24 24',
  fill: 'none', stroke: 'currentColor', 'stroke-width': 2,
  'stroke-linecap': 'round', 'stroke-linejoin': 'round'
}, [
  h('path', { d: 'M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9' }),
  h('path', { d: 'M13.73 21a2 2 0 01-3.46 0' })
])

const IconLogout = () => h('svg', {
  width: 20, height: 20, viewBox: '0 0 24 24',
  fill: 'none', stroke: 'currentColor', 'stroke-width': 2,
  'stroke-linecap': 'round', 'stroke-linejoin': 'round'
}, [
  h('path', { d: 'M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4' }),
  h('polyline', { points: '16 17 21 12 16 7' }),
  h('line', { x1: 21, y1: 12, x2: 9, y2: 12 })
])

const navItems = [
  { key: 'home',     to: '/teachers',  label: 'Accueil',      shortLabel: 'Accueil',    icon: IconHome,     badge: null },
  { key: 'sessions', to: '/teachers/my-sessions',   label: 'Sessions', shortLabel: 'Sessions',   icon: IconCalendar, badge: 3 },
  { key: 'join',     to: '/teachers/create-session',  label: 'Créer une Session',    shortLabel: 'Rejoindre',  icon: IconUsers,    badge: null },
  { key: 'profile',  to: '/teachers/profile',     label: 'Profil',       shortLabel: 'Profil',     icon: IconUser,     badge: null },
]

function handleLogout() {
  logout()
  router.push('/login')
}

function handleLogoutClick() {
  closeDropdown()
  handleLogout()
}
</script>

<style scoped>
/* Transitions */
.fade-x-enter-active { transition: all .18s ease; }
.fade-x-leave-active { transition: all .12s ease; }
.fade-x-enter-from,
.fade-x-leave-to { opacity: 0; transform: translateX(-6px); }

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-top-color: #054348;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

.loading-screen {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>