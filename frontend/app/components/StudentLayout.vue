<template>
  <div class="flex min-h-screen bg-layout font-['DM_Sans','Nunito',system-ui]" v-if="authChecked">
  
    <!-- Indicateur de connexion WebSocket (fixe en bas à droite) -->
    <div class="fixed bottom-20 right-4 z-50 md:bottom-4">
      <div class="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-lg text-xs border border-gray-200">
        <div 
          class="w-2 h-2 rounded-full"
          :class="isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'"
        ></div>
        <span class="text-gray-500">
          {{ isConnected ? 'Connecté' : 'Connexion...' }}
        </span>
      </div>
    </div>

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
        class="self-end w-7 h-7 rounded-lg bg-secondary text-primary hover:bg-primary hover:text-white flex items-center justify-center cursor-pointer mb-5 flex-shrink-0 transition-colors duration-200"
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
          @click="handleLogoutClick" 
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
      <header class="bg-primary font-body px-5 pt-4 pb-3 flex items-center justify-between flex-shrink-0">
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
              :src="avatarUrl || 'https://img.freepik.com/premium-photo/young-student-avatar-generative-ai_138015-2404.jpg'"
              :alt="student.firstName"
              class="w-[40px] h-[40px] rounded-full object-cover border-3 border-white/50 bg-white/20 flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
            />
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
              style="box-shadow: 1px 1px 8px 1px #cfcfcf;"
              class="absolute right-0 mt-3 w-56 bg-white rounded-xl py-2 z-50 border border-gray-100"
            >
              <div class="px-4 py-3 border-b border-gray-100">
                <p class="text-sm font-medium text-gray-800">{{ student.firstName }} {{ student.lastName }}</p>
                <p class="text-xs font-medium text-gray-800 mt-0.5">{{ student.role }}</p>
                <p class="text-xs font-medium text-gray-800 mt-1">{{ currentUser?.email }}</p>
              </div>

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

              <div class="border-t border-gray-100 my-1"></div>

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
      <main class="flex-1 p-6 md:p-7 pb-24 md:pb-6">
        <slot />
      </main>
    </div>

    <!-- ═══════════════════════════════
         MOBILE BOTTOM NAV
    ════════════════════════════════ -->
    <nav class="md:hidden fixed bottom-0 left-0 right-0 z-50 pb-[env(safe-area-inset-bottom)]">
      <div class="fixed bottom-0 left-0 z-50 w-full h-20 bg-white shadow-[0_-1px_2px_1px_rgba(0,0,0,0.16)]">
        <div class="grid h-full max-w-lg grid-cols-5 mx-auto font-medium">
          
          <nuxt-link
            to="/students"
            class="inline-flex flex-col font-body items-center justify-center px-5 border-x border-gray-300 hover:bg-teal-800/10 transition-colors duration-200 group"
            :class="{ 'text-primary bg-primary/20' : $route.path === '/students' }"
          >
            <svg class="w-7 h-7 mb-1" :class="{ 'text-primary': $route.path === '/students', 'text-gray-500 group-hover:text-primary': $route.path !== '/students' }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m4 12 8-8 8 8M6 10.5V19a1 1 0 0 0 1 1h3v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3h3a1 1 0 0 0 1-1v-8.5"/>
            </svg>
            <span class="text-sm" :class="{ 'text-primary font-semibold': $route.path === '/students', 'text-gray-600': $route.path !== '/students' }">Accueil</span>
          </nuxt-link>

          <nuxt-link
            to="/students/my-sessions"
            class="inline-flex flex-col font-body items-center justify-center px-5 border-r border-gray-200 hover:bg-gray-50 transition-colors duration-200 group relative"
            :class="{ 'text-primary bg-primary/20': $route.path === '/students/my-sessions' }"
          >
            <svg class="w-7 h-7 mb-1" :class="{ 'text-primary': $route.path === '/students/my-sessions', 'text-gray-500 group-hover:text-primary': $route.path !== '/students/my-sessions' }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <span class="text-sm" :class="{ 'text-primary font-semibold': $route.path === '/students/my-sessions', 'text-gray-600': $route.path !== '/students/my-sessions' }">Sessions</span>
          </nuxt-link>

          <div class="flex items-center justify-center">
            <nuxt-link
              to="/students/join-session"
              class="inline-flex font-body items-center justify-center text-white bg-primary hover:bg-primary-dark focus:ring-4 focus:ring-primary/30 shadow-lg w-16 h-16 rounded-full focus:outline-none transition-all duration-200"
              :class="{ 'ring-4 ring-primary/50': $route.path === '/students/join-session' }"
            >
              <svg fill="#FFFF" width="32px" height="32px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.1666667,6 C16.0746192,6 16,6.07461921 16,6.16666667 L16,7.83333333 C16,7.92538079 16.0746192,8 16.1666667,8 L17.8333333,8 C17.9253808,8 18,7.92538079 18,7.83333333 L18,6.16666667 C18,6.07461921 17.9253808,6 17.8333333,6 L16.1666667,6 Z M16,18 L16,17.5 C16,17.2238576 16.2238576,17 16.5,17 C16.7761424,17 17,17.2238576 17,17.5 L17,18 L18,18 L18,17.5 C18,17.2238576 18.2238576,17 18.5,17 C18.7761424,17 19,17.2238576 19,17.5 L19,18.5 C19,18.7761424 18.7761424,19 18.5,19 L14.5,19 C14.2238576,19 14,18.7761424 14,18.5 L14,17.5 C14,17.2238576 14.2238576,17 14.5,17 C14.7761424,17 15,17.2238576 15,17.5 L15,18 L16,18 L16,18 Z M13,11 L13.5,11 C13.7761424,11 14,11.2238576 14,11.5 C14,11.7761424 13.7761424,12 13.5,12 L11.5,12 C11.2238576,12 11,11.7761424 11,11.5 C11,11.2238576 11.2238576,11 11.5,11 L12,11 L12,10 L10.5,10 C10.2238576,10 10,9.77614237 10,9.5 C10,9.22385763 10.2238576,9 10.5,9 L13.5,9 C13.7761424,9 14,9.22385763 14,9.5 C14,9.77614237 13.7761424,10 13.5,10 L13,10 L13,11 Z M18,12 L17.5,12 C17.2238576,12 17,11.7761424 17,11.5 C17,11.2238576 17.2238576,11 17.5,11 L18,11 L18,10.5 C18,10.2238576 18.2238576,10 18.5,10 C18.7761424,10 19,10.2238576 19,10.5 L19,12.5 C19,12.7761424 18.7761424,13 18.5,13 C18.2238576,13 18,12.7761424 18,12.5 L18,12 Z M13,14 L12.5,14 C12.2238576,14 12,13.7761424 12,13.5 C12,13.2238576 12.2238576,13 12.5,13 L13.5,13 C13.7761424,13 14,13.2238576 14,13.5 L14,15.5 C14,15.7761424 13.7761424,16 13.5,16 L10.5,16 C10.2238576,16 10,15.7761424 10,15.5 C10,15.2238576 10.2238576,15 10.5,15 L13,15 L13,14 L13,14 Z M16.1666667,5 L17.8333333,5 C18.4776655,5 19,5.52233446 19,6.16666667 L19,7.83333333 C19,8.47766554 18.4776655,9 17.8333333,9 L16.1666667,9 C15.5223345,9 15,8.47766554 15,7.83333333 L15,6.16666667 C15,5.52233446 15.5223345,5 16.1666667,5 Z M6.16666667,5 L7.83333333,5 C8.47766554,5 9,5.52233446 9,6.16666667 L9,7.83333333 C9,8.47766554 8.47766554,9 7.83333333,9 L6.16666667,9 C5.52233446,9 5,8.47766554 5,7.83333333 L5,6.16666667 C5,5.52233446 5.52233446,5 6.16666667,5 Z M6.16666667,6 C6.07461921,6 6,6.07461921 6,6.16666667 L6,7.83333333 C6,7.92538079 6.07461921,8 6.16666667,8 L7.83333333,8 C7.92538079,8 8,7.92538079 8,7.83333333 L8,6.16666667 C8,6.07461921 7.92538079,6 7.83333333,6 L6.16666667,6 Z M6.16666667,15 L7.83333333,15 C8.47766554,15 9,15.5223345 9,16.1666667 L9,17.8333333 C9,18.4776655 8.47766554,19 7.83333333,19 L6.16666667,19 C5.52233446,19 5,18.4776655 5,17.8333333 L5,16.1666667 C5,15.5223345 5.52233446,15 6.16666667,15 Z M6.16666667,16 C6.07461921,16 6,16.0746192 6,16.1666667 L6,17.8333333 C6,17.9253808 6.07461921,18 6.16666667,18 L7.83333333,18 C7.92538079,18 8,17.9253808 8,17.8333333 L8,16.1666667 C8,16.0746192 7.92538079,16 7.83333333,16 L6.16666667,16 Z M13,6 L10.5,6 C10.2238576,6 10,5.77614237 10,5.5 C10,5.22385763 10.2238576,5 10.5,5 L13.5,5 C13.7761424,5 14,5.22385763 14,5.5 L14,7.5 C14,7.77614237 13.7761424,8 13.5,8 C13.2238576,8 13,7.77614237 13,7.5 L13,6 Z M10.5,8 C10.2238576,8 10,7.77614237 10,7.5 C10,7.22385763 10.2238576,7 10.5,7 L11.5,7 C11.7761424,7 12,7.22385763 12,7.5 C12,7.77614237 11.7761424,8 11.5,8 L10.5,8 Z M5.5,14 C5.22385763,14 5,13.7761424 5,13.5 C5,13.2238576 5.22385763,13 5.5,13 L7.5,13 C7.77614237,13 8,13.2238576 8,13.5 C8,13.7761424 7.77614237,14 7.5,14 L5.5,14 Z M9.5,14 C9.22385763,14 9,13.7761424 9,13.5 C9,13.2238576 9.22385763,13 9.5,13 L10.5,13 C10.7761424,13 11,13.2238576 11,13.5 C11,13.7761424 10.7761424,14 10.5,14 L9.5,14 Z M11,18 L11,18.5 C11,18.7761424 10.7761424,19 10.5,19 C10.2238576,19 10,18.7761424 10,18.5 L10,17.5 C10,17.2238576 10.2238576,17 10.5,17 L12.5,17 C12.7761424,17 13,17.2238576 13,17.5 C13,17.7761424 12.7761424,18 12.5,18 L11,18 Z M9,11 L9.5,11 C9.77614237,11 10,11.2238576 10,11.5 C10,11.7761424 9.77614237,12 9.5,12 L8.5,12 C8.22385763,12 8,11.7761424 8,11.5 L8,11 L7.5,11 C7.22385763,11 7,10.7761424 7,10.5 C7,10.2238576 7.22385763,10 7.5,10 L8.5,10 C8.77614237,10 9,10.2238576 9,10.5 L9,11 Z M5,10.5 C5,10.2238576 5.22385763,10 5.5,10 C5.77614237,10 6,10.2238576 6,10.5 L6,11.5 C6,11.7761424 5.77614237,12 5.5,12 C5.22385763,12 5,11.7761424 5,11.5 L5,10.5 Z M15,10.5 C15,10.2238576 15.2238576,10 15.5,10 C15.7761424,10 16,10.2238576 16,10.5 L16,12.5 C16,12.7761424 15.7761424,13 15.5,13 C15.2238576,13 15,12.7761424 15,12.5 L15,10.5 Z M17,15 L17,14.5 C17,14.2238576 17.2238576,14 17.5,14 L18.5,14 C18.7761424,14 19,14.2238576 19,14.5 C19,14.7761424 18.7761424,15 18.5,15 L18,15 L18,15.5 C18,15.7761424 17.7761424,16 17.5,16 L15.5,16 C15.2238576,16 15,15.7761424 15,15.5 L15,14.5 C15,14.2238576 15.2238576,14 15.5,14 C15.7761424,14 16,14.2238576 16,14.5 L16,15 L17,15 Z M3,6.5 C3,6.77614237 2.77614237,7 2.5,7 C2.22385763,7 2,6.77614237 2,6.5 L2,4.5 C2,3.11928813 3.11928813,2 4.5,2 L6.5,2 C6.77614237,2 7,2.22385763 7,2.5 C7,2.77614237 6.77614237,3 6.5,3 L4.5,3 C3.67157288,3 3,3.67157288 3,4.5 L3,6.5 Z M17.5,3 C17.2238576,3 17,2.77614237 17,2.5 C17,2.22385763 17.2238576,2 17.5,2 L19.5,2 C20.8807119,2 22,3.11928813 22,4.5 L22,6.5 C22,6.77614237 21.7761424,7 21.5,7 C21.2238576,7 21,6.77614237 21,6.5 L21,4.5 C21,3.67157288 20.3284271,3 19.5,3 L17.5,3 Z M6.5,21 C6.77614237,21 7,21.2238576 7,21.5 C7,21.7761424 6.77614237,22 6.5,22 L4.5,22 C3.11928813,22 2,20.8807119 2,19.5 L2,17.5 C2,17.2238576 2.22385763,17 2.5,17 C2.77614237,17 3,17.2238576 3,17.5 L3,19.5 C3,20.3284271 3.67157288,21 4.5,21 L6.5,21 Z M21,17.5 C21,17.2238576 21.2238576,17 21.5,17 C21.7761424,17 22,17.2238576 22,17.5 L22,19.5 C22,20.8807119 20.8807119,22 19.5,22 L17.5,22 C17.2238576,22 17,21.7761424 17,21.5 C17,21.2238576 17.2238576,21 17.5,21 L19.5,21 C20.3284271,21 21,20.3284271 21,19.5 L21,17.5 Z"/>
              </svg>
            </nuxt-link>
          </div>

          <nuxt-link
            to="/historique"
            class="inline-flex font-body flex-col items-center justify-center px-5 border-x border-gray-200 hover:bg-gray-50 transition-colors duration-200 group"
            :class="{ 'text-primary bg-primary/20': $route.path === '/historique' }"
          >
            <svg class="w-6 h-6 mb-1" :class="{ 'text-primary': $route.path === '/historique', 'text-gray-500 group-hover:text-primary': $route.path !== '/historique' }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <span class="text-sm" :class="{ 'text-primary font-semibold': $route.path === '/historique', 'text-gray-600': $route.path !== '/historique' }">Historique</span>
          </nuxt-link>

          <nuxt-link
            to="/students/profile"
            class="inline-flex font-body flex-col items-center justify-center px-5 border-r border-gray-200 hover:bg-gray-50 transition-colors duration-200 group"
            :class="{ 'text-primary bg-primary/20': $route.path === '/students/profile' }"
          >
            <svg class="w-6 h-6 mb-1" :class="{ 'text-primary': $route.path === '/students/profile', 'text-gray-500 group-hover:text-primary': $route.path !== '/students/profile' }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0 0a8.949 8.949 0 0 0 4.951-1.488A3.987 3.987 0 0 0 13 16h-2a3.987 3.987 0 0 0-3.951 3.512A8.948 8.948 0 0 0 12 21Zm3-11a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
            </svg>
            <span class="text-sm" :class="{ 'text-primary font-semibold': $route.path === '/students/profile', 'text-gray-600': $route.path !== '/students/profile' }">Profil</span>
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
import { ref, h, onMounted, onUnmounted, computed, onBeforeMount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'
import { useWebSocket } from '../../composables/useWebSocket'
import { useToast } from '../../composables/useToast'

const route = useRoute()
const router = useRouter()
const { getUser, logout, getProfile } = useAuth()
const { connect, disconnect, isConnected, onNewSession, onSessionStarted } = useWebSocket()
const toast = useToast()

const sidebarCollapsed = ref(false)
const dropdownOpen = ref(false)
const authChecked = ref(false)
const currentUser = ref(null)
const etudiantProfil = ref(null)

// Charger les données utilisateur
const loadUserData = async () => {
  try {
    const result = await getProfile()
    if (result.success && result.user) {
      currentUser.value = result.user
      localStorage.setItem('user', JSON.stringify(result.user))
      
      // Extraire le profil étudiant
      if (result.user.etudiantProfil) {
        etudiantProfil.value = result.user.etudiantProfil
        localStorage.setItem('etudiantProfil', JSON.stringify(etudiantProfil.value))
      }
    } else {
      currentUser.value = getUser()
      // Essayer de récupérer le profil depuis le localStorage
      const savedProfil = localStorage.getItem('etudiantProfil')
      if (savedProfil) {
        etudiantProfil.value = JSON.parse(savedProfil)
      }
    }
  } catch (error) {
    console.error('Erreur chargement profil:', error)
    currentUser.value = getUser()
  }
}

// Données pour l'affichage
const student = computed(() => ({
  firstName: currentUser.value?.prenom || 'Utilisateur',
  lastName: currentUser.value?.nom || '',
  role: currentUser.value?.role === 'etudiant' ? 'Étudiant' : 'Utilisateur',
  avatar: currentUser.value?.avatar || null
}))

// URL complète de l'avatar
const avatarUrl = computed(() => {
  if (!student.value.avatar) return null
  if (student.value.avatar.startsWith('http')) return student.value.avatar
  return `http://localhost:5000${student.value.avatar}`
})

// ==================== WEBSOCKET GLOBAL ====================

// Initialiser la connexion WebSocket
const initWebSocket = () => {
  if (currentUser.value?.id && etudiantProfil.value) {
    console.log('🔌 Initialisation WebSocket globale...')
    console.log('User ID:', currentUser.value.id)
    console.log('Classe ID:', etudiantProfil.value.classeId)
    console.log('Filière ID:', etudiantProfil.value.filiereId)
    
    connect(
      currentUser.value.id,
      'etudiant',
      etudiantProfil.value.classeId,
      etudiantProfil.value.filiereId
    )
  } else {
    console.warn('⚠️ Impossible d\'initialiser WebSocket: données manquantes', {
      userId: currentUser.value?.id,
      profil: etudiantProfil.value
    })
  }
}

// Gérer l'arrivée d'une nouvelle session (notification globale)
const handleNewSession = (data) => {
  console.log('📢 Nouvelle session - Notification globale:', data)
  
  toast.info(data.message, {
    duration: 8000,
    position: 'top-right',
    action: {
      text: 'Voir',
      onClick: () => router.push('/students')
    }
  })
  
  // Déclencher un événement pour que les pages puissent réagir
  window.dispatchEvent(new CustomEvent('global-new-session', { detail: data }))
}

// Gérer le démarrage d'une session
const handleSessionStarted = (data) => {
  console.log('▶️ Session démarrée - Notification globale:', data)
  
  toast.warning(data.message, {
    duration: 10000,
    position: 'top-right',
    action: {
      text: 'Rejoindre',
      onClick: () => router.push(`/students/join?sessionId=${data.session.id}&code=${data.session.code}`)
    }
  })
  
  window.dispatchEvent(new CustomEvent('global-session-started', { detail: data }))
}

// ==================== FIN WEBSOCKET ====================

// Fermer le dropdown en cliquant à l'extérieur
const handleClickOutside = (event) => {
  const dropdown = document.querySelector('.relative')
  if (dropdown && !dropdown.contains(event.target)) {
    dropdownOpen.value = false
  }
}

// Écouter les changements dans localStorage
const handleStorageChange = () => {
  currentUser.value = getUser()
}

onBeforeMount(() => {
  currentUser.value = getUser()
})

onMounted(async () => {
  authChecked.value = true
  await loadUserData()
  
  // Initialiser WebSocket après chargement des données
  setTimeout(() => {
    initWebSocket()
  }, 1000)
  
  // Écouter les événements WebSocket
  onNewSession(handleNewSession)
  onSessionStarted(handleSessionStarted)
  
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('storage', handleStorageChange)
})

onUnmounted(() => {
  disconnect()
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('storage', handleStorageChange)
})

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value
}

const closeDropdown = () => {
  dropdownOpen.value = false
}

function handleLogout() {
  disconnect() // Déconnecter WebSocket avant logout
  logout()
  router.push('/auth')
}

function handleLogoutClick() {
  closeDropdown()
  handleLogout()
}

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
  { key: 'home',     to: '/students',  label: 'Accueil',      shortLabel: 'Accueil',    icon: IconHome,     badge: null },
  { key: 'sessions', to: '/students/my-sessions',   label: 'Mes sessions', shortLabel: 'Sessions',   icon: IconCalendar, badge: 3 },
  { key: 'join',     to: '/students/join-session',  label: 'Rejoindre',    shortLabel: 'Rejoindre',  icon: IconUsers,    badge: null },
  { key: 'history',  to: '/historique', label: 'Historique',   shortLabel: 'Historique', icon: IconHistory,  badge: null },
  { key: 'profile',  to: '/students/profile',     label: 'Profil',       shortLabel: 'Profil',     icon: IconUser,     badge: null },
]
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