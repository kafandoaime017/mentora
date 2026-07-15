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
            href="#" 
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
            href="#" 
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
            href="#" 
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
            href="#" 
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
    <section class="bg-white py-20">
      <div class="max-w-7xl mx-auto px-8 md:px-16">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-body font-bold text-primary mb-4">
            Fonctionnalités
          </h2>
          <p class="text-gray-600 font-body text-lg max-w-2xl mx-auto">
            Découvrez tous les outils pour réussir vos évaluations et accompagner vos étudiants
          </p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="bg-gray-200 rounded-xl p-8 text-center hover:shadow-xl transition-shadow">
            <div class="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-primary font-body mb-3">QCM Interactifs</h3>
            <p class="text-gray-600 font-body">Entraînez-vous avec des centaines de questions et suivez votre progression</p>
          </div>
          <div class="bg-gray-200 rounded-xl p-8 text-center hover:shadow-xl transition-shadow">
            <div class="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-body font-bold text-primary mb-3">Suivi Personnalisé</h3>
            <p class="text-gray-600 font-body">Analysez vos résultats et identifiez vos points faibles</p>
          </div>
          <div class="bg-gray-200 rounded-xl p-8 text-center hover:shadow-xl transition-shadow">
            <div class="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-body font-bold text-primary mb-3">Communauté Active</h3>
            <p class="text-gray-600 font-body">Échangez avec d'autres étudiants et professeurs</p>
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