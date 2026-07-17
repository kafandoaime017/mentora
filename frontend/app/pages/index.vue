<template>
  <div class="min-h-screen bg-primary font-sans flex flex-col font-body">

    <!-- Navbar with dynamic styling and max-width container -->
    <nav 
      :class="[
        'fixed top-0 left-0 w-full z-50 transition-all duration-300 ease-in-out',
        isScrolled 
          ? 'bg-white shadow-md py-1' 
          : 'bg-transparent py-5'
      ]"
    >
      <!-- Inner container with same max-width as content -->
      <div class="max-w-5xl mx-auto px-8 md:px-16 flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <!-- Dynamic logo based on scroll -->
          <img 
            v-if="isScrolled" 
            src="/images/logo-color.png" 
            alt="Mentora Logo" 
            class="h-20 w-auto"
          />
          <img 
            v-else 
            src="/images/logo-blanc.png" 
            alt="Mentora Logo" 
            class="h-20 w-auto"
          />
        </div>
        
        <div class="hidden md:flex gap-8">
          <a
            href="#fonctionnalites"
            :class="[
              'text-sm font-medium uppercase transition-colors',
              isScrolled
                ? 'text-gray-600 hover:text-secondary'
                : 'text-white/60 hover:text-white'
            ]"
          >
            Fonctionnalités
          </a>
          <a
            href="#tarifs"
            :class="[
              'text-sm font-medium uppercase transition-colors',
              isScrolled
                ? 'text-gray-600 hover:text-secondary'
                : 'text-white/60 hover:text-white'
            ]"
          >
            Tarifs
          </a>
          <a
            href="#apropos"
            :class="[
              'text-sm font-medium uppercase transition-colors',
              isScrolled
                ? 'text-gray-600 hover:text-secondary'
                : 'text-white/60 hover:text-white'
            ]"
          >
            À propos
          </a>
          <a
            href="#contact"
            :class="[
              'text-sm font-medium uppercase transition-colors',
              isScrolled
                ? 'text-gray-600 hover:text-secondary'
                : 'text-white/60 hover:text-white'
            ]"
          >
            Contact
          </a>
        </div>
        
        <nuxt-link 
          to="/auth" 
          :class="[
            'font-medium text-sm px-5 py-3 rounded-md transition-colors',
            isScrolled 
              ? 'bg-secondary text-white hover:bg-secondary/90' 
              : 'bg-cream text-primary hover:bg-cream/90'
          ]"
        >
          Connexion
        </nuxt-link>
      </div>
    </nav>

    <!-- Hero Section -->
    <div class="pt-20 sm:pt-12 md:pt-16 flex-1">
      <div class="max-w-7xl mx-auto">
        <section class="flex-1 flex flex-col md:flex-row items-center justify-center gap-8 py-16 md:py-20 px-8 md:px-16">
          <!-- Left Column - Content -->
          <div class="max-w-xl flex-1">
            <h1 class="text-5xl font-body font-bold text-white leading-tight tracking-tight mb-5">
              Évaluez vos étudiants,<br>on <span class="text-secondary">simplifie votre travail.</span>
            </h1>
            <p class="text-white text-base leading-relaxed mb-9 max-w-md">
             Créez des QCM, suivez les progrès de vos classes et obtenez des statistiques détaillées
            pour mieux accompagner vos étudiants.
            </p>
            <div class="flex gap-3 flex-wrap md:flex-nowrap">
              <!-- <button class="w-full md:w-auto font-body  bg-cream text-primary font-bold px-7 py-3.5 rounded-md hover:bg-cream/90 transition-colors">
              Espace Étudiant
              </button> -->
              <nuxt-link to="/auth" class="w-full text-center  bg-secondary font-body text-white font-bold px-7 py-3.5 rounded-md hover:bg-secondary/70 transition-colors">
              Connectez-vous
              </nuxt-link>
            </div>
          </div>
          <div class="hidden md:block flex-shrink-0">
            <PhoneMockup />
          </div>
          <div class="hidden md:block flex-shrink-0 w-48">
            <div class="rounded-2xl overflow-hidden shadow-2xl transform ">
              <img 
                src="/images/images.webp" 
                alt="Student studying" 
                class="w-full h-auto object-cover"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
    <!-- Bottom waves -->
    <div class="relative h-28 overflow-hidden flex-shrink-0">
      <svg viewBox="0 0 1440 110" class="absolute bottom-0 left-0 w-full h-full"
           preserveAspectRatio="none">
        <path d="M0,60 Q360,20 720,55 Q1080,90 1440,40 L1440,110 L0,110 Z" fill="#c8bb9e" opacity="0.35"/>
        <path d="M0,72 Q300,44 660,64 Q1020,84 1440,56 L1440,110 L0,110 Z" fill="#919e19"/>
      </svg>
    </div>

    <!-- Features Section -->
    <section id="fonctionnalites" class="bg-white py-20 scroll-mt-24">
      <div class="max-w-7xl mx-auto px-8 md:px-16">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-body font-bold text-primary mb-4">
            Fonctionnalités
          </h2>
          <p class="text-gray-600 font-body text-lg max-w-2xl mx-auto">
            Une plateforme pensée pour chaque acteur de l'établissement : étudiants, professeurs et direction
          </p>
        </div>

        <!-- Étudiant -->
        <div class="flex flex-col md:flex-row items-center gap-10 md:gap-16 mb-24">
          <div class="flex-1 w-full">
            <span class="inline-block px-3 py-1 bg-secondary/10 text-secondary text-xs font-bold uppercase tracking-wide rounded-full mb-4">
              Espace étudiant
            </span>
            <h3 class="text-2xl md:text-3xl font-body font-bold text-primary mb-6">
              Passez vos examens sereinement
            </h3>
            <ul class="space-y-4">
              <li v-for="item in featuresEtudiant" :key="item" class="flex items-start gap-3">
                <span class="mt-0.5 w-5 h-5 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                  <svg class="w-3.5 h-3.5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
                </span>
                <span class="text-gray-700 font-body">{{ item }}</span>
              </li>
            </ul>
          </div>
          <div class="flex-1 w-full flex justify-center">
            <div class="w-full max-w-md aspect-square rounded-3xl bg-primary/5 flex items-center justify-center">
              <svg viewBox="0 0 400 400" class="w-4/5 h-4/5">
                <rect x="90" y="50" width="220" height="300" rx="24" fill="#054348"/>
                <rect x="112" y="86" width="176" height="188" rx="10" fill="#fffcee"/>
                <rect x="130" y="106" width="140" height="10" rx="5" fill="#054348" opacity="0.15"/>
                <rect x="130" y="128" width="100" height="10" rx="5" fill="#054348" opacity="0.15"/>
                <rect x="130" y="156" width="140" height="26" rx="8" fill="#709134" opacity="0.12"/>
                <circle cx="146" cy="169" r="7" fill="#709134"/>
                <path d="M142 169l3 3 6-6" stroke="#fffcee" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                <rect x="130" y="192" width="140" height="26" rx="8" fill="#054348" opacity="0.06"/>
                <circle cx="146" cy="205" r="7" fill="none" stroke="#054348" stroke-width="2" opacity="0.3"/>
                <rect x="130" y="228" width="140" height="26" rx="8" fill="#054348" opacity="0.06"/>
                <circle cx="146" cy="241" r="7" fill="none" stroke="#054348" stroke-width="2" opacity="0.3"/>
                <rect x="150" y="296" width="100" height="30" rx="15" fill="#709134"/>
                <rect x="176" y="308" width="48" height="6" rx="3" fill="#fffcee"/>
                <circle cx="300" cy="90" r="34" fill="#709134"/>
                <path d="M286 90l10 10 20-20" stroke="#fffcee" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- Professeur (inversé : image à gauche, checklist à droite) -->
        <div class="flex flex-col md:flex-row-reverse items-center gap-10 md:gap-16 mb-24">
          <div class="flex-1 w-full">
            <span class="inline-block px-3 py-1 bg-secondary/10 text-secondary text-xs font-bold uppercase tracking-wide rounded-full mb-4">
              Espace professeur
            </span>
            <h3 class="text-2xl md:text-3xl font-body font-bold text-primary mb-6">
              Créez, animez et corrigez sans effort
            </h3>
            <ul class="space-y-4">
              <li v-for="item in featuresProfesseur" :key="item" class="flex items-start gap-3">
                <span class="mt-0.5 w-5 h-5 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                  <svg class="w-3.5 h-3.5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
                </span>
                <span class="text-gray-700 font-body">{{ item }}</span>
              </li>
            </ul>
          </div>
          <div class="flex-1 w-full flex justify-center">
            <div class="w-full max-w-md aspect-square rounded-3xl bg-secondary/5 flex items-center justify-center">
              <svg viewBox="0 0 400 400" class="w-4/5 h-4/5">
                <rect x="60" y="70" width="280" height="200" rx="16" fill="#054348"/>
                <rect x="80" y="90" width="240" height="160" rx="8" fill="#fffcee"/>
                <rect x="100" y="110" width="130" height="12" rx="6" fill="#054348" opacity="0.2"/>
                <rect x="100" y="136" width="200" height="10" rx="5" fill="#054348" opacity="0.1"/>
                <rect x="100" y="156" width="200" height="10" rx="5" fill="#054348" opacity="0.1"/>
                <rect x="100" y="176" width="150" height="10" rx="5" fill="#054348" opacity="0.1"/>
                <rect x="100" y="205" width="60" height="34" rx="6" fill="#709134" opacity="0.85"/>
                <rect x="170" y="190" width="60" height="49" rx="6" fill="#709134"/>
                <rect x="240" y="215" width="60" height="24" rx="6" fill="#709134" opacity="0.5"/>
                <rect x="150" y="285" width="100" height="34" rx="10" fill="#054348"/>
                <path d="M330 60l-24 60-30-14z" fill="#709134"/>
                <circle cx="90" cy="310" r="26" fill="#709134"/>
                <path d="M78 312l8 8 16-16" stroke="#fffcee" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- Directeur -->
        <div class="flex flex-col md:flex-row items-center gap-10 md:gap-16">
          <div class="flex-1 w-full">
            <span class="inline-block px-3 py-1 bg-secondary/10 text-secondary text-xs font-bold uppercase tracking-wide rounded-full mb-4">
              Espace directeur
            </span>
            <h3 class="text-2xl md:text-3xl font-body font-bold text-primary mb-6">
              Pilotez tout votre établissement
            </h3>
            <ul class="space-y-4">
              <li v-for="item in featuresDirecteur" :key="item" class="flex items-start gap-3">
                <span class="mt-0.5 w-5 h-5 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                  <svg class="w-3.5 h-3.5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>
                </span>
                <span class="text-gray-700 font-body">{{ item }}</span>
              </li>
            </ul>
          </div>
          <div class="flex-1 w-full flex justify-center">
            <div class="w-full max-w-md aspect-square rounded-3xl bg-primary/5 flex items-center justify-center">
              <svg viewBox="0 0 400 400" class="w-4/5 h-4/5">
                <rect x="70" y="60" width="260" height="180" rx="14" fill="#054348"/>
                <rect x="88" y="78" width="224" height="144" rx="8" fill="#fffcee"/>
                <rect x="108" y="170" width="24" height="36" rx="4" fill="#709134" opacity="0.5"/>
                <rect x="140" y="150" width="24" height="56" rx="4" fill="#709134" opacity="0.75"/>
                <rect x="172" y="128" width="24" height="78" rx="4" fill="#709134"/>
                <rect x="204" y="146" width="24" height="60" rx="4" fill="#709134" opacity="0.75"/>
                <rect x="236" y="162" width="24" height="44" rx="4" fill="#709134" opacity="0.5"/>
                <path d="M108 100 l20 -14 20 14 v0 h-40z" fill="#054348" opacity="0.15"/>
                <rect x="112" y="96" width="32" height="6" rx="3" fill="#054348" opacity="0.3"/>
                <circle cx="120" cy="270" r="22" fill="#709134"/>
                <circle cx="165" cy="270" r="22" fill="#054348"/>
                <circle cx="210" cy="270" r="22" fill="#709134" opacity="0.6"/>
                <rect x="150" y="255" width="100" height="10" rx="5" fill="#054348" opacity="0"/>
                <rect x="150" y="310" width="100" height="30" rx="15" fill="#054348"/>
                <rect x="176" y="322" width="48" height="6" rx="3" fill="#fffcee"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>

 <!-- Pricing Section -->
<section class="bg-gray-50 py-20" id="tarifs">
  <div class="max-w-7xl mx-auto px-8 md:px-16">
    <div class="text-center mb-12">
      <h2 class="text-3xl md:text-4xl font-bold text-primary font-body mb-4">
        Tarifs transparents
      </h2>
      <p class="text-gray-600 font-body text-lg max-w-2xl mx-auto">
        Des plans adaptés à chaque établissement. Commencez gratuitement, évoluez selon vos besoins.
      </p>

      <!-- Toggle mensuel / annuel -->
      <div class="flex items-center justify-center gap-3 mt-8">
        <span class="text-sm font-body font-medium" :class="billing === 'monthly' ? 'text-primary' : 'text-gray-400'">Mensuel</span>
        <button
          @click="billing = billing === 'monthly' ? 'yearly' : 'monthly'"
          class="relative inline-flex h-6 w-12 items-center rounded-full transition-colors duration-200"
          :class="billing === 'yearly' ? 'bg-secondary' : 'bg-gray-300'"
        >
          <span
            class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200"
            :style="billing === 'yearly' ? 'transform: translateX(28px)' : 'transform: translateX(4px)'"
          />
        </button>
        <span class="text-sm font-body font-medium" :class="billing === 'yearly' ? 'text-primary' : 'text-gray-400'">
          Annuel
          <span class="ml-1.5 px-2 py-0.5 bg-secondary/20 text-secondary text-xs rounded-full font-semibold">-17%</span>
        </span>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">

      <!-- Gratuit -->
      <div class="bg-white rounded-2xl font-body p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
        <div class="mb-6">
          <span class="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">Gratuit</span>
          <h3 class="text-2xl font-extrabold text-primary mt-3 mb-1">Free</h3>
          <p class="text-gray-500 text-sm">Pour découvrir Mentora</p>
        </div>
        <div class="mb-6">
          <span class="text-4xl font-extrabold text-primary">0€</span>
          <span class="text-gray-400 text-sm ml-1">pour toujours</span>
        </div>
        <ul class="space-y-3 mb-8">
          <li class="flex items-center gap-2 text-sm text-gray-600 font-body">
            <svg class="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
            Jusqu'à <strong>25 étudiants</strong>
          </li>
          <li class="flex items-center gap-2 text-sm text-gray-600 font-body">
            <svg class="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
            Jusqu'à <strong>5 professeurs</strong>
          </li>
          <li class="flex items-center gap-2 text-sm text-gray-600 font-body">
            <svg class="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
            <strong>100 sessions</strong>/mois
          </li>
          <li class="flex items-center gap-2 text-sm text-gray-600 font-body">
            <svg class="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
            QCM illimités
          </li>
          <li class="flex items-center gap-2 text-sm text-gray-300 font-body">
            <svg class="w-4 h-4 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            Export CSV
          </li>
          <li class="flex items-center gap-2 text-sm text-gray-300 font-body">
            <svg class="w-4 h-4 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            Génération IA
          </li>
        </ul>
        <nuxt-link to="/auth"
          class="block w-full text-center bg-gray-100 text-gray-700 font-body font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors"
        >
          Commencer gratuitement
        </nuxt-link>
      </div>

      <!-- Starter -->
      <div class="bg-white rounded-2xl font-body p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
        <div class="mb-6">
          <span class="px-3 py-1 bg-blue-100 text-blue-600 text-xs font-semibold rounded-full">Starter</span>
          <h3 class="text-2xl font-extrabold text-primary mt-3 mb-1">Starter</h3>
          <p class="text-gray-500 text-sm">Pour les petits établissements</p>
        </div>
        <div class="mb-6">
          <span class="text-4xl font-extrabold text-primary">
            {{ billing === 'monthly' ? '39€' : '32€' }}
          </span>
          <span class="text-gray-400 text-sm ml-1">/mois</span>
          <p v-if="billing === 'yearly'" class="text-xs text-secondary font-semibold mt-1">390€/an — économisez 78€</p>
        </div>
        <ul class="space-y-3 mb-8">
          <li class="flex items-center gap-2 text-sm text-gray-600 font-body">
            <svg class="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
            Jusqu'à <strong>100 étudiants</strong>
          </li>
          <li class="flex items-center gap-2 text-sm text-gray-600 font-body">
            <svg class="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
            Jusqu'à <strong>15 professeurs</strong>
          </li>
          <li class="flex items-center gap-2 text-sm text-gray-600 font-body">
            <svg class="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
            Sessions <strong>illimitées</strong>
          </li>
          <li class="flex items-center gap-2 text-sm text-gray-600 font-body">
            <svg class="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
            Export <strong>CSV</strong>
          </li>
          <li class="flex items-center gap-2 text-sm text-gray-600 font-body">
            <svg class="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
            Support email
          </li>
          <li class="flex items-center gap-2 text-sm text-gray-300 font-body">
            <svg class="w-4 h-4 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            Génération IA
          </li>
        </ul>
        <nuxt-link to="/auth"
          class="block w-full text-center bg-primary text-white font-body font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors"
        >
          Essayer 30 jours gratuits
        </nuxt-link>
      </div>

      <!-- Pro — mis en avant -->
      <div class="bg-primary rounded-2xl font-body p-8 shadow-xl border-2 border-secondary relative transform md:scale-105">
        <div class="absolute -top-3 left-1/2 -translate-x-1/2">
          <span class="px-4 py-1 bg-secondary text-white text-xs font-extrabold rounded-full shadow-md">
            LE PLUS POPULAIRE
          </span>
        </div>
        <div class="mb-6">
          <span class="px-3 py-1 bg-secondary/20 text-secondary text-xs font-semibold rounded-full">Pro</span>
          <h3 class="text-2xl font-extrabold text-white mt-3 mb-1">Pro</h3>
          <p class="text-white/60 text-sm">Pour les établissements ambitieux</p>
        </div>
        <div class="mb-6">
          <span class="text-4xl font-extrabold text-white">
            {{ billing === 'monthly' ? '89€' : '74€' }}
          </span>
          <span class="text-white/50 text-sm ml-1">/mois</span>
          <p v-if="billing === 'yearly'" class="text-xs text-secondary font-semibold mt-1">890€/an — économisez 178€</p>
        </div>
        <ul class="space-y-3 mb-8">
          <li class="flex items-center gap-2 text-sm text-white font-body">
            <svg class="w-4 h-4 text-secondary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
            Étudiants <strong>illimités</strong>
          </li>
          <li class="flex items-center gap-2 text-sm text-white font-body">
            <svg class="w-4 h-4 text-secondary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
            Professeurs <strong>illimités</strong>
          </li>
          <li class="flex items-center gap-2 text-sm text-white font-body">
            <svg class="w-4 h-4 text-secondary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
            Sessions <strong>illimitées</strong>
          </li>
          <li class="flex items-center gap-2 text-sm text-white font-body">
            <svg class="w-4 h-4 text-secondary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
            <strong>Génération IA</strong> de QCM
          </li>
          <li class="flex items-center gap-2 text-sm text-white font-body">
            <svg class="w-4 h-4 text-secondary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
            Stats <strong>avancées</strong>
          </li>
          <li class="flex items-center gap-2 text-sm text-white font-body">
            <svg class="w-4 h-4 text-secondary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
            Export CSV
          </li>
          <li class="flex items-center gap-2 text-sm text-white font-body">
            <svg class="w-4 h-4 text-secondary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
            Support <strong>prioritaire</strong>
          </li>
        </ul>
        <nuxt-link to="/auth"
          class="block w-full text-center bg-secondary text-white font-body font-bold py-3 rounded-xl hover:bg-secondary/90 transition-colors"
        >
          Essayer 30 jours gratuits
        </nuxt-link>
      </div>

    </div>

    <!-- FAQ courte -->
    <div class="mt-12 text-center">
      <p class="text-gray-500 text-sm font-body">
        Pas de CB requise pour l'essai · Annulation à tout moment · Facture mensuelle
      </p>
    </div>

  </div>
</section>

    <!-- À propos -->
    <section id="apropos" class="bg-white py-20 scroll-mt-24">
      <div class="max-w-7xl mx-auto px-8 md:px-16">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-body font-bold text-primary mb-4">
            À propos de Mentora
          </h2>
          <p class="text-gray-600 font-body text-lg max-w-2xl mx-auto">
            Mentora est né d'un constat simple : créer, faire passer et corriger des évaluations prend trop de
            temps aux équipes pédagogiques. Nous construisons l'outil qui leur rend ce temps.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h3 class="text-2xl font-body font-bold text-primary mb-4">Notre mission</h3>
            <p class="text-gray-600 font-body leading-relaxed mb-4">
              Donner à chaque établissement scolaire — de la petite structure à l'école multi-filières — une
              plateforme unique pour créer des QCM, faire passer des examens en toute sécurité et suivre la
              progression des étudiants, sans complexité technique.
            </p>
            <p class="text-gray-600 font-body leading-relaxed">
              De l'étudiant qui passe son examen au directeur qui pilote son établissement, chaque rôle dispose
              des outils adaptés à ses besoins, sur une seule et même plateforme.
            </p>
          </div>
          <div class="flex justify-center">
            <div class="w-full max-w-md aspect-[4/3] rounded-3xl bg-primary/5 flex items-center justify-center">
              <svg viewBox="0 0 400 300" class="w-4/5 h-4/5">
                <circle cx="200" cy="150" r="110" fill="#054348" opacity="0.06"/>
                <rect x="110" y="90" width="180" height="130" rx="14" fill="#054348"/>
                <rect x="128" y="108" width="144" height="94" rx="8" fill="#fffcee"/>
                <circle cx="160" cy="140" r="16" fill="#709134"/>
                <rect x="184" y="132" width="70" height="8" rx="4" fill="#054348" opacity="0.2"/>
                <rect x="184" y="148" width="50" height="8" rx="4" fill="#054348" opacity="0.15"/>
                <circle cx="160" cy="182" r="16" fill="#054348" opacity="0.15"/>
                <rect x="184" y="174" width="70" height="8" rx="4" fill="#054348" opacity="0.2"/>
                <rect x="184" y="190" width="50" height="8" rx="4" fill="#054348" opacity="0.15"/>
                <circle cx="90" cy="70" r="22" fill="#709134"/>
                <path d="M78 71l8 8 16-16" stroke="#fffcee" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                <circle cx="316" cy="230" r="18" fill="#709134" opacity="0.7"/>
              </svg>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div v-for="valeur in valeurs" :key="valeur.titre" class="bg-layout rounded-2xl p-6 text-center">
            <div class="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" v-html="valeur.icone"></svg>
            </div>
            <h4 class="font-body font-bold text-primary mb-2">{{ valeur.titre }}</h4>
            <p class="text-gray-600 font-body text-sm">{{ valeur.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact -->
    <section id="contact" class="bg-gray-50 py-20 scroll-mt-24">
      <div class="max-w-5xl mx-auto px-8 md:px-16">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-body font-bold text-primary mb-4">
            Contactez-nous
          </h2>
          <p class="text-gray-600 font-body text-lg max-w-2xl mx-auto">
            Une question, une démo, un besoin spécifique pour votre établissement ? Écrivez-nous.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-5 gap-8 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <!-- Infos de contact -->
          <div class="md:col-span-2 bg-primary p-8 flex flex-col justify-between">
            <div>
              <h3 class="text-white font-body font-bold text-xl mb-6">Nos coordonnées</h3>
              <div class="space-y-5">
                <div class="flex items-start gap-3">
                  <svg class="w-5 h-5 text-secondary shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                  <div>
                    <p class="text-white/60 font-body text-xs uppercase tracking-wide">Email</p>
                    <a href="mailto:contact@mentoraapp.online" class="text-white font-body hover:text-secondary transition-colors">contact@mentoraapp.online</a>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <svg class="w-5 h-5 text-secondary shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  <div>
                    <p class="text-white/60 font-body text-xs uppercase tracking-wide">Délai de réponse</p>
                    <p class="text-white font-body">Sous 24 à 48h ouvrées</p>
                  </div>
                </div>
              </div>
            </div>
            <p class="text-white/50 font-body text-xs mt-8">
              Réservé aux établissements scolaires. Pour toute question relative à un compte existant, connectez-vous puis utilisez votre espace dédié.
            </p>
          </div>

          <!-- Formulaire -->
          <form class="md:col-span-3 p-8 space-y-4" @submit.prevent="envoyerContact">
            <div>
              <label class="block text-sm font-body font-medium text-gray-700 mb-1">Nom</label>
              <input
                v-model="contactForm.nom"
                type="text"
                required
                class="w-full px-4 py-2.5 border border-gray-200 rounded-lg font-body text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40"
                placeholder="Votre nom"
              />
            </div>
            <div>
              <label class="block text-sm font-body font-medium text-gray-700 mb-1">Email</label>
              <input
                v-model="contactForm.email"
                type="email"
                required
                class="w-full px-4 py-2.5 border border-gray-200 rounded-lg font-body text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40"
                placeholder="vous@ecole.com"
              />
            </div>
            <div>
              <label class="block text-sm font-body font-medium text-gray-700 mb-1">Message</label>
              <textarea
                v-model="contactForm.message"
                required
                rows="4"
                class="w-full px-4 py-2.5 border border-gray-200 rounded-lg font-body text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40 resize-none"
                placeholder="Décrivez votre besoin..."
              ></textarea>
            </div>
            <button
              type="submit"
              class="w-full bg-secondary text-white font-body font-bold py-3 rounded-lg hover:bg-secondary/90 transition-colors"
            >
              Envoyer le message
            </button>
          </form>
        </div>
      </div>
    </section>

  <!-- Footer -->
  <footer class="bg-white border-t border-gray-200 py-8 mt-4">
    <div class="max-w-5xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-4">
      <p class="text-xs text-gray-500 font-body">© {{ new Date().getFullYear() }} Mentora. Tous droits réservés.</p>
      <div class="flex items-center gap-6">
        <nuxt-link to="/legal/cgu" class="text-xs text-gray-500 hover:text-primary font-body">CGU</nuxt-link>
        <nuxt-link to="/legal/politique-confidentialite" class="text-xs text-gray-500 hover:text-primary font-body">Confidentialité</nuxt-link>
        <nuxt-link to="/legal/mentions-legales" class="text-xs text-gray-500 hover:text-primary font-body">Mentions légales</nuxt-link>
      </div>
    </div>
  </footer>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
const billing = ref('monthly')
// Scroll state
const isScrolled = ref(false)

// Checklists de la section Fonctionnalités (une par rôle)
const featuresEtudiant = [
  'Rejoindre une session en un clic, par code ou QR code',
  'Répondre à des QCM variés : choix multiple, vrai/faux, texte libre, fichier, appariement',
  'Suivre le temps restant en direct pendant l\'examen',
  'Consulter l\'historique de ses résultats et de ses notes',
  'Recevoir des notifications (nouvelle session, notes publiées)',
]

const featuresProfesseur = [
  'Créer des QCM avec plusieurs types de questions en quelques minutes',
  'Réutiliser des questions grâce à la banque de questions',
  'Suivre les participants et les scores en temps réel',
  'Corriger manuellement les réponses ouvertes (texte libre / fichier)',
  'Être alerté des comportements suspects pendant une session',
  'Consulter des statistiques détaillées par session et par étudiant',
]

const featuresDirecteur = [
  'Gérer les utilisateurs et inviter professeurs et étudiants',
  'Configurer l\'établissement : logo, filières, classes',
  'Publier des annonces et sondages à toute l\'école',
  'Consulter les logs d\'audit des actions sensibles',
  'Exporter les résultats et historiques en PDF',
  'Suivre le plan d\'abonnement et les limites de l\'école',
]

// Valeurs de la section À propos
const valeurs = [
  {
    titre: 'Simplicité',
    description: 'Une prise en main immédiate, sans formation, pour tous les rôles de l\'établissement.',
    icone: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>',
  },
  {
    titre: 'Sécurité',
    description: 'Détection de triche, données chiffrées et accès strictement limités par rôle.',
    icone: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>',
  },
  {
    titre: 'Accompagnement',
    description: 'Une équipe réactive pour répondre aux besoins spécifiques de chaque école.',
    icone: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-4.13a4 4 0 11-8 0 4 4 0 018 0zm6 4a4 4 0 11-8 0 4 4 0 018 0z"/>',
  },
  {
    titre: 'Amélioration continue',
    description: 'Une plateforme qui évolue avec les retours réels des étudiants, professeurs et directeurs.',
    icone: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>',
  },
]

// Formulaire de contact (pas de backend dédié : ouverture d'un mail pré-rempli)
const contactForm = ref({ nom: '', email: '', message: '' })

const envoyerContact = () => {
  const sujet = encodeURIComponent(`Contact Mentora - ${contactForm.value.nom}`)
  const corps = encodeURIComponent(
    `${contactForm.value.message}\n\n---\nDe : ${contactForm.value.nom} (${contactForm.value.email})`
  )
  window.location.href = `mailto:contact@mentoraapp.online?subject=${sujet}&body=${corps}`
}

// Handle scroll event
const handleScroll = () => {
  isScrolled.value = window.scrollY > 50
}

// Add scroll listener
onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

// Remove scroll listener
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>