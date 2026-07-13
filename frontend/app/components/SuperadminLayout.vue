<template>
  <div class="flex min-h-screen bg-layout font-body" v-if="authChecked">

    <!-- SIDEBAR DESKTOP -->
    <aside
      class="hidden md:flex fixed left-0 top-0 bottom-0 bg-white flex-col p-3 z-40 overflow-hidden shadow-[1px_1px_2px_1px_rgba(0,0,0,0.16)] transition-all duration-300"
      :class="sidebarCollapsed ? 'w-[68px] items-center' : 'w-[220px] items-start'"
    >
      <div class="flex items-center justify-center w-full h-16 mb-4 mt-2">
        <img src="/images/logo-color.png" alt="Mentora" class="h-10"/>
      </div>

      <button
        @click="sidebarCollapsed = !sidebarCollapsed"
        class="self-end w-7 h-7 rounded-lg bg-blacky text-white hover:bg-blacky/80 flex items-center justify-center cursor-pointer mb-5 flex-shrink-0"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path v-if="!sidebarCollapsed" d="M15 18l-6-6 6-6"/>
          <path v-else d="M9 18l6-6-6-6"/>
        </svg>
      </button>

      <nav class="flex flex-col flex-1 w-full gap-1">
        <nuxt-link
          v-for="item in navItems" :key="item.key" :to="item.to"
          class="flex items-center gap-2 px-2 py-2 rounded-lg text-gray-500 hover:bg-blacky/80 hover:text-white transition-all w-full"
          :class="{ 'bg-[#024864] !text-white': $route.path === item.to || $route.path.startsWith(item.to + '/'), 'justify-center': sidebarCollapsed }"
          :title="item.label"
        >
          <span class="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0">
            <component :is="item.icon" class="w-5 h-5"/>
          </span>
          <transition name="fade-x">
            <span v-if="!sidebarCollapsed" class="text-sm font-medium truncate">{{ item.label }}</span>
          </transition>
        </nuxt-link>
      </nav>

      <!-- Profil + Paramètres + Déconnexion -->
      <div class="border-t border-gray-100 pt-2 mt-2 w-full space-y-1">
        <nuxt-link
          to="/superadmin/profile"
          class="flex items-center gap-2 px-2 py-2 rounded-lg text-gray-500 hover:bg-blacky/80 hover:text-white transition-all w-full"
          :class="{ 'bg-[#024864] !text-white': $route.path === '/superadmin/profile', 'justify-center': sidebarCollapsed }"
          title="Mon profil"
        >
          <span class="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
          </span>
          <transition name="fade-x">
            <span v-if="!sidebarCollapsed" class="text-sm font-medium truncate">Mon profil</span>
          </transition>
        </nuxt-link>

        <nuxt-link
          to="/superadmin/parametres"
          class="flex items-center gap-2 px-2 py-2 rounded-lg text-gray-500 hover:bg-blacky/80 hover:text-white transition-all w-full"
          :class="{ 'bg-[#024864] !text-white': $route.path === '/superadmin/parametres', 'justify-center': sidebarCollapsed }"
          title="Paramètres"
        >
          <span class="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </span>
          <transition name="fade-x">
            <span v-if="!sidebarCollapsed" class="text-sm font-medium truncate">Paramètres</span>
          </transition>
        </nuxt-link>

        <button
          @click="handleLogout"
          class="flex items-center gap-3 px-2 py-2 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600 transition-all w-full"
          :class="sidebarCollapsed ? 'justify-center' : ''"
        >
          <span class="w-9 h-9 flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
          </span>
          <transition name="fade-x">
            <span v-if="!sidebarCollapsed" class="text-sm font-medium">Déconnexion</span>
          </transition>
        </button>
      </div>
    </aside>

    <!-- MAIN -->
    <div
      class="flex-1 flex flex-col min-h-screen transition-all duration-300"
      :class="sidebarCollapsed ? 'md:ml-[68px]' : 'md:ml-[220px]'"
    >
      <!-- HEADER -->
      <header class="bg-blacky px-4 md:px-6 h-16 flex items-center justify-between flex-shrink-0 sticky top-0 z-30 shadow-sm">
        <div class="md:hidden">
          <img src="/images/logo-color.png" alt="Mentora" class="h-8 brightness-0 invert"/>
        </div>
        <div class="hidden md:flex items-center gap-2">
          <span class="text-xs font-semibold text-white/50 uppercase tracking-wider">Super Admin</span>
          <span class="text-white/20">·</span>
          <span class="text-sm text-white/80 font-medium">{{ currentUser?.prenom }} {{ currentUser?.nom }}</span>
        </div>
        <div class="flex items-center gap-3">
          <span class="px-3 py-1 bg-white/10 text-white text-xs font-semibold rounded-full hidden sm:block">
            Superadmin
          </span>
          <div class="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/40 text-white text-xs font-bold">
            {{ currentUser?.prenom?.[0] }}{{ currentUser?.nom?.[0] }}
          </div>
        </div>
      </header>

      <!-- CONTENT -->
      <main class="flex-1 p-4 md:p-6 pb-24 md:pb-6">
        <slot/>
      </main>
    </div>

    <!-- MOBILE BOTTOM NAV -->
    <nav class="md:hidden fixed bottom-0 left-0 right-0 z-50">
      <div class="w-full bg-white shadow-[0_-1px_2px_1px_rgba(0,0,0,0.10)]">

        <!-- Nav principale — 5 liens -->
        <div class="grid grid-cols-5 h-16">
          <nuxt-link v-for="item in navItems" :key="item.key" :to="item.to"
            class="flex flex-col items-center justify-center gap-0.5 transition-colors"
            :class="$route.path === item.to || $route.path.startsWith(item.to + '/') ? 'text-blacky' : 'text-gray-400'"
          >
            <component :is="item.icon" class="w-5 h-5"/>
            <span class="text-[9px] font-medium">{{ item.shortLabel }}</span>
          </nuxt-link>

          <!-- Bouton Plus -->
          <button @click="mobileMenuOpen = !mobileMenuOpen"
            class="flex flex-col items-center justify-center gap-0.5 transition-colors"
            :class="mobileMenuOpen ? 'text-blacky' : 'text-gray-400'"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
            <span class="text-[9px] font-medium">Plus</span>
          </button>
        </div>

        <!-- Menu Plus — slide up -->
        <transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="transform translate-y-full opacity-0"
          enter-to-class="transform translate-y-0 opacity-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="transform translate-y-0 opacity-100"
          leave-to-class="transform translate-y-full opacity-0"
        >
          <div v-if="mobileMenuOpen" class="border-t border-gray-100 grid grid-cols-3 py-3 px-2 gap-2">
            <nuxt-link to="/superadmin/profile" @click="mobileMenuOpen = false"
              class="flex flex-col items-center justify-center gap-1 py-3 rounded-xl hover:bg-gray-50 transition-colors"
              :class="$route.path === '/superadmin/profile' ? 'text-blacky' : 'text-gray-500'"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              <span class="text-[10px] font-medium">Mon profil</span>
            </nuxt-link>

            <nuxt-link to="/superadmin/parametres" @click="mobileMenuOpen = false"
              class="flex flex-col items-center justify-center gap-1 py-3 rounded-xl hover:bg-gray-50 transition-colors"
              :class="$route.path === '/superadmin/parametres' ? 'text-blacky' : 'text-gray-500'"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              <span class="text-[10px] font-medium">Paramètres</span>
            </nuxt-link>

            <button @click="handleLogout"
              class="flex flex-col items-center justify-center gap-1 py-3 rounded-xl hover:bg-red-50 transition-colors text-red-500"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
              <span class="text-[10px] font-medium">Déconnexion</span>
            </button>
          </div>
        </transition>

      </div>
    </nav>

  </div>
  <div v-else class="loading-screen"><div class="spinner"/></div>
</template>

<script setup>
import { ref, onMounted, onBeforeMount, h } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'

const router = useRouter()
const { getUser, logout, getProfile } = useAuth()

const sidebarCollapsed = ref(false)
const authChecked      = ref(false)
const currentUser      = ref(null)
const mobileMenuOpen   = ref(false)

onBeforeMount(() => { try { currentUser.value = getUser() } catch {} })

onMounted(async () => {
  authChecked.value = true
  try {
    const result = await getProfile()
    if (result.success && result.user) currentUser.value = result.user
  } catch {}
})

const handleLogout = async () => {
  await logout()
  router.push('/auth')
}

const navItems = [
  {
    key: 'dashboard', to: '/superadmin', label: 'Dashboard', shortLabel: 'Accueil',
    icon: () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
      h('rect', { x: 3, y: 3, width: 7, height: 7, rx: 1 }),
      h('rect', { x: 14, y: 3, width: 7, height: 7, rx: 1 }),
      h('rect', { x: 14, y: 14, width: 7, height: 7, rx: 1 }),
      h('rect', { x: 3, y: 14, width: 7, height: 7, rx: 1 })
    ])
  },
  {
    key: 'ecoles', to: '/superadmin/ecoles', label: 'Écoles', shortLabel: 'Écoles',
    icon: () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' })
    ])
  },
  {
    key: 'directeurs', to: '/superadmin/directeurs', label: 'Directeurs', shortLabel: 'Direct.',
    icon: () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' })
    ])
  },
  {
    key: 'users', to: '/superadmin/users', label: 'Utilisateurs', shortLabel: 'Users',
    icon: () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' })
    ])
  }
]
</script>

<style scoped>
.fade-x-enter-active { transition: all .18s ease; }
.fade-x-leave-active { transition: all .12s ease; }
.fade-x-enter-from, .fade-x-leave-to { opacity: 0; transform: translateX(-6px); }
.spinner { border: 4px solid rgba(0,0,0,0.1); border-top-color: #024864; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; }
.loading-screen { display: flex; align-items: center; justify-content: center; height: 100vh; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>