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
              <nuxt-link to="/auth" class="w-full md:w-auto bg-secondary font-body text-white font-bold px-7 py-3.5 rounded-md hover:bg-secondary/70 transition-colors">
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
                src="/images/image.png" 
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
          <h2 class="text-3xl md:text-4xl font-bold text-primary mb-4">
            Fonctionnalités
          </h2>
          <p class="text-gray-600 text-lg max-w-2xl mx-auto">
            Découvrez tous les outils pour réussir vos études
          </p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="bg-gray-200 rounded-xl p-8 text-center hover:shadow-xl transition-shadow">
            <div class="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-primary mb-3">QCM Interactifs</h3>
            <p class="text-gray-600">Entraînez-vous avec des centaines de questions et suivez votre progression</p>
          </div>
          <div class="bg-gray-200 rounded-xl p-8 text-center hover:shadow-xl transition-shadow">
            <div class="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-primary mb-3">Suivi Personnalisé</h3>
            <p class="text-gray-600">Analysez vos résultats et identifiez vos points faibles</p>
          </div>
          <div class="bg-gray-200 rounded-xl p-8 text-center hover:shadow-xl transition-shadow">
            <div class="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-primary mb-3">Communauté Active</h3>
            <p class="text-gray-600">Échangez avec d'autres étudiants et professeurs</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Pricing Section -->
    <section class="bg-gray-50 py-20">
      <div class="max-w-7xl mx-auto px-8 md:px-16">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold text-primary mb-4">
            Tarifs
          </h2>
          <p class="text-gray-600 text-lg max-w-2xl mx-auto">
            Choisissez la formule qui vous correspond
          </p>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="bg-white rounded-2xl font-body p-8 shadow-lg hover:shadow-xl transition-shadow">
            <h3 class="text-2xl font-bold text-primary mb-2">Étudiant</h3>
            <p class="text-gray-500 mb-4">Parfait pour commencer</p>
            <div class="text-4xl font-bold text-secondary mb-6">Gratuit</div>
            <ul class="space-y-3 mb-8">
              <li class="flex items-center gap-2 text-gray-600">✓ Accès aux QCM basiques</li>
              <li class="flex items-center gap-2 text-gray-600">✓ Suivi des progrès</li>
              <li class="flex items-center gap-2 text-gray-600">✓ Communauté limitée</li>
            </ul>
            <button class="w-full bg-secondary text-white font-bold py-3 rounded-lg hover:bg-secondary/90 transition-colors">
              Commencer gratuitement
            </button>
          </div>
          <div class="bg-secondary font-body  rounded-2xl p-8  text-white transform scale-105">
            <h3 class="text-2xl font-extrabold text-primary mb-2">Premium</h3>
            <p class="text-primary mb-4">Pour les ambitieux</p>
            <div class="text-4xl font-bold text-primary mb-6">9.99€<span class="text-base text-gray-800">/mois</span></div>
            <ul class="space-y-3 mb-8">
              <li class="flex items-center gap-2 text-primary font-medium">✓ Accès illimité aux QCM</li>
              <li class="flex items-center gap-2 text-primary font-medium">✓ Analyses approfondies</li>
              <li class="flex items-center gap-2 text-primary font-medium">✓ Coaching personnalisé</li>
              <li class="flex items-center gap-2 text-primary font-medium">✓ Communauté premium</li>
            </ul>
            <button class="w-full bg-cream text-primary font-bold py-3 rounded-lg hover:bg-cream/90 transition-colors">
              Essayer Premium
            </button>
          </div>
          <div class="bg-white rounded-2xl font-body p-8 shadow-lg hover:shadow-xl transition-shadow">
            <h3 class="text-2xl font-bold  text-primary mb-2">Professeur</h3>
            <p class="text-gray-500 mb-4">Pour les enseignants</p>
            <div class="text-4xl font-bold text-secondary mb-6">29.99€<span class="text-base text-gray-500">/mois</span></div>
            <ul class="space-y-3 mb-8">
              <li class="flex items-center gap-2 text-gray-600">✓ Création de QCM illimités</li>
              <li class="flex items-center gap-2 text-gray-600">✓ Suivi des élèves</li>
              <li class="flex items-center gap-2 text-gray-600">✓ Statistiques avancées</li>
              <li class="flex items-center gap-2 text-gray-600">✓ Support prioritaire</li>
            </ul>
            <button class="w-full bg-secondary text-white font-bold py-3 rounded-lg hover:bg-secondary/90 transition-colors">
              Devenir professeur
            </button>
          </div>
        </div>
      </div>
    </section>


  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

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