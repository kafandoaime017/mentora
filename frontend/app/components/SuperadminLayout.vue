<template>
  <div class="flex min-h-screen bg-layout font-body" v-if="authChecked">

    <!-- SIDEBAR DESKTOP -->
    <aside
      class="hidden md:flex fixed left-0 top-0 bottom-0 bg-white flex-col p-2 z-40 overflow-hidden shadow-[1px_1px_2px_1px_rgba(0,0,0,0.16)] transition-all duration-300"
      :class="sidebarCollapsed ? 'w-[68px] items-center' : 'w-[220px] items-start'"
    >
      <div class="flex items-center justify-center w-full h-16 mb-4 mt-2">
        <img src="/images/logo-color.png" alt="Mentora" class="h-20 transition-all duration-300" />
      </div>

      <button
        @click="toggleSidebar"
        class="self-end w-7 h-7 rounded-lg bg-blacky text-white hover:bg-blacky/80 flex items-center justify-center cursor-pointer mb-4 flex-shrink-0 transition-colors duration-200"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path v-if="!sidebarCollapsed" d="M15 18l-6-6 6-6"/>
          <path v-else d="M9 18l6-6-6-6"/>
        </svg>
      </button>

      <nav class="flex flex-col flex-1 w-full gap-2">
        <!-- Section Navigation -->
        <div class="w-full">
          <button
            v-if="!sidebarCollapsed"
            @click="toggleCollapse('main')"
            class="flex items-center justify-between w-full px-2 py-0.5 mb-0.5 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-blacky transition-colors"
          >
            <span class="text-primary">Navigation</span>
            <svg class="w-3 h-3 transition-transform duration-200" :class="{ 'rotate-180': collapsedSections.main }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
          <transition name="collapse" @enter="enter" @after-enter="afterEnter" @leave="leave">
            <div v-show="!sidebarCollapsed ? !collapsedSections.main : true" class="space-y-0.5">
              <nuxt-link
                v-for="item in mainNavItems" :key="item.key" :to="item.to"
                class="flex items-center font-body gap-2 bg-gray-100 px-2 py-0.5 rounded-md text-muted hover:bg-blacky/80 hover:text-white transition-all duration-200 w-full"
                :class="{ 'bg-[#024864] text-white': $route.path === item.to, 'justify-center': sidebarCollapsed }"
                :title="item.label"
              >
                <span class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
                  <component :is="item.icon" class="w-5 h-5" />
                </span>
                <transition name="fade-x">
                  <span v-if="!sidebarCollapsed" class="flex-1 text-md font-medium truncate">{{ item.label }}</span>
                </transition>
              </nuxt-link>
            </div>
          </transition>
        </div>

        <!-- Section Gestion -->
        <div class="w-full mt-1">
          <button
            v-if="!sidebarCollapsed"
            @click="toggleCollapse('gestion')"
            class="flex items-center justify-between w-full px-2 py-0.5 mb-0.5 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-blacky transition-colors"
          >
            <span class="text-primary">Gestion</span>
            <svg class="w-3 h-3 transition-transform duration-200" :class="{ 'rotate-180': collapsedSections.gestion }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
          <transition name="collapse" @enter="enter" @after-enter="afterEnter" @leave="leave">
            <div v-show="!sidebarCollapsed ? !collapsedSections.gestion : true" class="space-y-0.5">
              <nuxt-link
                v-for="item in gestionNavItems" :key="item.key" :to="item.to"
                class="flex items-center font-body gap-2 bg-gray-100 px-2 py-0.5 rounded-md text-muted hover:bg-blacky/80 hover:text-white transition-all duration-200 w-full"
                :class="{ 'bg-[#024864] text-white': $route.path === item.to || $route.path.startsWith(item.to + '/'), 'justify-center': sidebarCollapsed }"
                :title="item.label"
              >
                <span class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
                  <component :is="item.icon" class="w-5 h-5" />
                </span>
                <transition name="fade-x">
                  <span v-if="!sidebarCollapsed" class="flex-1 text-md font-medium truncate">{{ item.label }}</span>
                </transition>
              </nuxt-link>
            </div>
          </transition>
        </div>

        <!-- Section Système -->
        <div class="w-full mt-1">
          <button
            v-if="!sidebarCollapsed"
            @click="toggleCollapse('systeme')"
            class="flex items-center justify-between w-full px-2 py-0.5 mb-0.5 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-blacky transition-colors"
          >
            <span class="text-primary">Système</span>
            <svg class="w-3 h-3 transition-transform duration-200" :class="{ 'rotate-180': collapsedSections.systeme }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
          <transition name="collapse" @enter="enter" @after-enter="afterEnter" @leave="leave">
            <div v-show="!sidebarCollapsed ? !collapsedSections.systeme : true" class="space-y-0.5">
              <a
                v-for="item in monitoringLinks" :key="item.key" :href="item.href" target="_blank" rel="noopener"
                class="flex items-center font-body gap-2 bg-gray-100 px-2 py-0.5 rounded-md text-muted hover:bg-blacky/80 hover:text-white transition-all duration-200 w-full"
                :class="{ 'justify-center': sidebarCollapsed }"
                :title="item.label"
              >
                <span class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
                  <component :is="item.icon" class="w-5 h-5" />
                </span>
                <transition name="fade-x">
                  <span v-if="!sidebarCollapsed" class="flex-1 text-md font-medium truncate">{{ item.label }}</span>
                </transition>
              </a>
            </div>
          </transition>
        </div>
      </nav>

      <!-- Profil + Paramètres + Déconnexion -->
      <div class="border-t border-gray-100 pt-2 mt-2 w-full space-y-0.5">
        <nuxt-link
          to="/superadmin/profile"
          class="flex items-center gap-2 px-2 py-2 rounded-lg text-gray-500 hover:bg-blacky/80 hover:text-white transition-all w-full"
          :class="{ 'bg-[#024864] !text-white': $route.path === '/superadmin/profile', 'justify-center': sidebarCollapsed }"
          title="Mon profil"
        >
          <span class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
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
          <span class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </span>
          <transition name="fade-x">
            <span v-if="!sidebarCollapsed" class="text-sm font-medium truncate">Paramètres</span>
          </transition>
        </nuxt-link>

        <button
          @click="handleLogoutClick"
          class="flex items-center gap-2 px-2 py-2 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600 transition-all w-full"
          :class="sidebarCollapsed ? 'justify-center' : ''"
        >
          <span class="w-8 h-8 flex items-center justify-center flex-shrink-0">
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
      class="flex-1 flex flex-col min-h-screen transition-all duration-300 w-full"
      :class="sidebarCollapsed ? 'md:ml-[68px]' : 'md:ml-[220px]'"
    >
      <!-- HEADER -->
      <header class="bg-blacky font-body px-4 h-16 flex items-center justify-between flex-shrink-0 sticky top-0 z-30 shadow-sm">
        <div class="md:hidden">
          <img src="/images/logo-color.png" alt="Mentora" class="h-10 brightness-0 invert" />
        </div>
        <div class="hidden md:block">
          <p class="text-white font-semibold text-sm opacity-80">Super Administration</p>
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
              <span v-if="unreadCount > 0" class="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {{ unreadCount > 9 ? '9+' : unreadCount }}
              </span>
            </button>

            <transition enter-active-class="transition duration-200 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-150 ease-in" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
              <div v-if="notifOpen" class="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden" style="top: calc(100% + 8px)">
                <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <span class="text-sm font-semibold text-gray-800">
                    Notifications
                    <span v-if="unreadCount > 0" class="ml-1 text-xs text-blacky font-normal">({{ unreadCount }} non lue{{ unreadCount > 1 ? 's' : '' }})</span>
                  </span>
                  <div class="flex gap-3">
                    <button v-if="unreadCount > 0" @click="markAllRead" class="text-xs text-blacky hover:text-blacky/70 transition-colors font-medium">Tout lire</button>
                    <button v-if="notifications.length > 0" @click="clearAll" class="text-xs text-gray-400 hover:text-red-500 transition-colors">Effacer</button>
                  </div>
                </div>
                <div class="max-h-72 overflow-y-auto">
                  <div v-if="loading" class="px-4 py-8 text-center">
                    <div class="animate-spin rounded-full h-5 w-5 border-2 border-blacky border-t-transparent mx-auto"/>
                  </div>
                  <div v-else-if="notifications.length === 0" class="px-4 py-8 text-center text-gray-400 text-sm">Aucune notification</div>
                  <div v-else v-for="notif in notifications" :key="notif.id"
                    class="flex gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 cursor-pointer"
                    :class="{ 'bg-blacky/5': !notif.isRead }"
                    @click="handleNotifClick(notif)"
                  >
                    <div class="shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-blacky/10 text-blacky">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                      </svg>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-xs font-semibold text-gray-800 leading-snug">{{ notif.titre }}</p>
                      <p class="text-xs text-gray-500 mt-0.5 line-clamp-2">{{ notif.message }}</p>
                      <p class="text-[10px] text-gray-400 mt-1">{{ new Date(notif.createdAt).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) }}</p>
                    </div>
                    <div v-if="!notif.isRead" class="w-2 h-2 rounded-full bg-blacky shrink-0 mt-1"/>
                  </div>
                </div>
              </div>
            </transition>
          </div>

          <!-- Avatar -->
          <div class="relative" ref="avatarRef">
            <button @click="toggleDropdown" class="flex items-center gap-2 focus:outline-none">
              <div class="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/40 text-white text-xs font-bold">
                {{ currentUser?.prenom?.[0] }}{{ currentUser?.nom?.[0] }}
              </div>
              <svg class="w-4 h-4 text-white transition-transform duration-200 hidden sm:block" :class="{ 'rotate-180': dropdownOpen }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>

            <transition enter-active-class="transition duration-200 ease-out" enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-150 ease-in" leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
              <div v-if="dropdownOpen" class="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50" style="top: calc(100% + 8px)">
                <div class="px-4 py-3 border-b border-gray-100">
                  <p class="text-sm font-semibold text-gray-800">{{ currentUser?.prenom }} {{ currentUser?.nom }}</p>
                  <p class="text-xs text-blacky mt-0.5 font-medium">Super Admin</p>
                  <p class="text-xs text-gray-400 mt-0.5">{{ currentUser?.email }}</p>
                </div>
                <nuxt-link to="/superadmin/profile" @click="closeDropdown" class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blacky/10 hover:text-blacky transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                  Mon profil
                </nuxt-link>
                <nuxt-link to="/superadmin/parametres" @click="closeDropdown" class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blacky/10 hover:text-blacky transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  Paramètres
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

      <!-- CONTENT -->
      <main class="flex-1 p-4 md:p-7 pb-24 md:pb-6">
        <slot/>
      </main>
    </div>

    <!-- MOBILE BOTTOM NAV -->
    <nav class="md:hidden fixed bottom-0 left-0 right-0 z-50">
      <div class="w-full bg-white shadow-[0_-1px_2px_1px_rgba(0,0,0,0.10)]">
        <div class="grid grid-cols-5 h-16">
          <nuxt-link to="/superadmin" class="flex flex-col items-center justify-center gap-0.5 transition-colors" :class="$route.path === '/superadmin' ? 'text-blacky' : 'text-gray-400'">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m4 12 8-8 8 8M6 10.5V19a1 1 0 001 1h3v-3a1 1 0 011-1h2a1 1 0 011 1v3h3a1 1 0 001-1v-8.5"/></svg>
            <span class="text-[10px] font-medium">Accueil</span>
          </nuxt-link>

          <nuxt-link to="/superadmin/ecoles" class="flex flex-col items-center justify-center gap-0.5 transition-colors" :class="$route.path.startsWith('/superadmin/ecoles') ? 'text-blacky' : 'text-gray-400'">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5"/></svg>
            <span class="text-[10px] font-medium">Écoles</span>
          </nuxt-link>

          <nuxt-link to="/superadmin/directeurs" class="flex flex-col items-center justify-center gap-0.5 transition-colors" :class="$route.path.startsWith('/superadmin/directeurs') ? 'text-blacky' : 'text-gray-400'">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            <span class="text-[10px] font-medium">Direct.</span>
          </nuxt-link>

          <nuxt-link to="/superadmin/users" class="flex flex-col items-center justify-center gap-0.5 transition-colors" :class="$route.path.startsWith('/superadmin/users') ? 'text-blacky' : 'text-gray-400'">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
            <span class="text-[10px] font-medium">Users</span>
          </nuxt-link>

          <button @click="mobileMenuOpen = !mobileMenuOpen" class="flex flex-col items-center justify-center gap-0.5 transition-colors" :class="mobileMenuOpen ? 'text-blacky' : 'text-gray-400'">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
            <span class="text-[10px] font-medium">Plus</span>
          </button>
        </div>

        <transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="transform translate-y-full opacity-0"
          enter-to-class="transform translate-y-0 opacity-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="transform translate-y-0 opacity-100"
          leave-to-class="transform translate-y-full opacity-0"
        >
          <div v-if="mobileMenuOpen" class="border-t border-gray-100 grid grid-cols-4 py-3 px-2 gap-2">
            <nuxt-link to="/superadmin/abonnements" @click="mobileMenuOpen = false" class="flex flex-col items-center justify-center gap-1 py-2 rounded-xl hover:bg-gray-50 transition-colors" :class="$route.path.startsWith('/superadmin/abonnements') ? 'text-blacky' : 'text-gray-500'">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
              <span class="text-[10px] font-medium">Abonnements</span>
            </nuxt-link>

            <a href="https://errors.mentoraapp.online" target="_blank" rel="noopener" @click="mobileMenuOpen = false" class="flex flex-col items-center justify-center gap-1 py-2 rounded-xl hover:bg-gray-50 transition-colors text-gray-500">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              <span class="text-[10px] font-medium">Erreurs</span>
            </a>

            <a href="https://stats.mentoraapp.online" target="_blank" rel="noopener" @click="mobileMenuOpen = false" class="flex flex-col items-center justify-center gap-1 py-2 rounded-xl hover:bg-gray-50 transition-colors text-gray-500">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l7-3v13M9 19l-6-2V4l6 2m0 13l7 3V9m-7 10V6"/></svg>
              <span class="text-[10px] font-medium">Stats</span>
            </a>

            <nuxt-link to="/superadmin/parametres" @click="mobileMenuOpen = false" class="flex flex-col items-center justify-center gap-1 py-2 rounded-xl hover:bg-gray-50 transition-colors" :class="$route.path === '/superadmin/parametres' ? 'text-blacky' : 'text-gray-500'">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              <span class="text-[10px] font-medium">Paramètres</span>
            </nuxt-link>

            <nuxt-link to="/superadmin/profile" @click="mobileMenuOpen = false" class="flex flex-col items-center justify-center gap-1 py-2 rounded-xl hover:bg-gray-50 transition-colors" :class="$route.path === '/superadmin/profile' ? 'text-blacky' : 'text-gray-500'">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
              <span class="text-[10px] font-medium">Profil</span>
            </nuxt-link>

            <button @click="handleLogoutClick" class="flex flex-col items-center justify-center gap-1 py-2 rounded-xl hover:bg-red-50 transition-colors text-red-500">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
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
import { ref, onMounted, onUnmounted, onBeforeMount, h, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'
import { useNotifications } from '../../composables/useNotifications'
import { useCookie } from '#app'

const router = useRouter()
const { getUser, logout, getProfile } = useAuth()

const sidebarStateCookie = useCookie('sa_sidebar_collapsed', {
  default: () => false,
  maxAge: 365 * 24 * 60 * 60,
  sameSite: 'lax'
})

const sidebarCollapsedState = useCookie('sa_sidebar_collapsed_state', {
  default: () => false,
  maxAge: 365 * 24 * 60 * 60,
  sameSite: 'lax'
})

const sidebarCollapsed = ref(false)
const dropdownOpen     = ref(false)
const notifOpen        = ref(false)
const mobileMenuOpen   = ref(false)
const authChecked      = ref(false)
const currentUser      = ref(null)
const notifRef         = ref(null)
const avatarRef        = ref(null)

const collapsedSections = ref({ main: false, gestion: false, systeme: false })

const loadSavedStates = () => {
  const savedSidebarState = sidebarStateCookie.value
  if (savedSidebarState !== undefined && savedSidebarState !== null) sidebarCollapsed.value = savedSidebarState

  const savedCollapsedState = sidebarCollapsedState.value
  if (savedCollapsedState && typeof savedCollapsedState === 'object') {
    collapsedSections.value = {
      main: savedCollapsedState.main || false,
      gestion: savedCollapsedState.gestion || false,
      systeme: savedCollapsedState.systeme || false
    }
  }
}

const saveSidebarState = () => { sidebarStateCookie.value = sidebarCollapsed.value }
const saveCollapsedState = () => { sidebarCollapsedState.value = { ...collapsedSections.value } }

const toggleSidebar = () => { sidebarCollapsed.value = !sidebarCollapsed.value; saveSidebarState() }
const toggleCollapse = (section) => { collapsedSections.value[section] = !collapsedSections.value[section]; saveCollapsedState() }

watch(collapsedSections, () => { saveCollapsedState() }, { deep: true })

const enter = (el) => {
  el.style.height = '0'; el.style.opacity = '0'; el.style.overflow = 'hidden'
  el.offsetHeight
  el.style.transition = 'height 0.3s ease, opacity 0.3s ease'
  el.style.height = `${el.scrollHeight}px`; el.style.opacity = '1'
}
const afterEnter = (el) => { el.style.height = 'auto'; el.style.overflow = ''; el.style.transition = '' }
const leave = (el) => {
  el.style.height = `${el.scrollHeight}px`; el.style.opacity = '1'; el.style.overflow = 'hidden'
  el.offsetHeight
  el.style.transition = 'height 0.3s ease, opacity 0.3s ease'
  el.style.height = '0'; el.style.opacity = '0'
}

const { notifications, unreadCount, loading, load, markRead, markAllRead, clearAll } = useNotifications()

const toggleNotifications = () => { notifOpen.value = !notifOpen.value; dropdownOpen.value = false; mobileMenuOpen.value = false }

const handleNotifClick = async (notif) => {
  await markRead(notif.id)
  if (notif.link) navigateTo(notif.link)
  notifOpen.value = false
}

const loadUserData = async () => {
  try {
    const result = await getProfile()
    if (result.success && result.user) {
      currentUser.value = result.user
      localStorage.setItem('user', JSON.stringify(result.user))
    } else {
      currentUser.value = getUser()
    }
  } catch { currentUser.value = getUser() }
}

const handleClickOutside = (e) => {
  if (notifRef.value  && !notifRef.value.contains(e.target))  notifOpen.value = false
  if (avatarRef.value && !avatarRef.value.contains(e.target)) dropdownOpen.value = false
}

onBeforeMount(() => { currentUser.value = getUser(); loadSavedStates() })

onMounted(async () => {
  await load()
  authChecked.value = true
  await loadUserData()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => { document.removeEventListener('click', handleClickOutside) })

const toggleDropdown = () => { dropdownOpen.value = !dropdownOpen.value; notifOpen.value = false }
const closeDropdown  = () => { dropdownOpen.value = false }
const handleLogout   = async () => { await logout(); router.push('/auth') }
const handleLogoutClick = () => { closeDropdown(); handleLogout() }

const mainNavItems = [
  {
    key: 'dashboard', to: '/superadmin', label: 'Tableau de bord',
    icon: () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'm4 12 8-8 8 8' }),
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M6 10.5V19a1 1 0 001 1h3v-3a1 1 0 011-1h2a1 1 0 011 1v3h3a1 1 0 001-1v-8.5' })
    ])
  }
]

const gestionNavItems = [
  {
    key: 'ecoles', to: '/superadmin/ecoles', label: 'Écoles',
    icon: () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' })
    ])
  },
  {
    key: 'directeurs', to: '/superadmin/directeurs', label: 'Directeurs',
    icon: () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' })
    ])
  },
  {
    key: 'users', to: '/superadmin/users', label: 'Utilisateurs',
    icon: () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' })
    ])
  },
  {
    key: 'abonnements', to: '/superadmin/abonnements', label: 'Abonnements',
    icon: () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' })
    ])
  }
]

const monitoringLinks = [
  {
    key: 'glitchtip', href: 'https://errors.mentoraapp.online', label: 'Erreurs (Glitchtip)',
    icon: () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' })
    ])
  },
  {
    key: 'umami', href: 'https://stats.mentoraapp.online', label: 'Statistiques (Umami)',
    icon: () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M9 19V6l7-3v13M9 19l-6-2V4l6 2m0 13l7 3V9m-7 10V6' })
    ])
  }
]
</script>

<style scoped>
.fade-x-enter-active { transition: all .18s ease; }
.fade-x-leave-active { transition: all .12s ease; }
.fade-x-enter-from, .fade-x-leave-to { opacity: 0; transform: translateX(-6px); }

.collapse-enter-active,
.collapse-leave-active { transition: all 0.3s ease; overflow: hidden; }
.collapse-enter-from,
.collapse-leave-to { opacity: 0; transform: translateY(-10px); }
.collapse-enter-to,
.collapse-leave-from { opacity: 1; transform: translateY(0); }

.spinner { border: 4px solid rgba(0,0,0,0.1); border-top-color: #024864; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; }
.loading-screen { display: flex; align-items: center; justify-content: center; height: 100vh; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
