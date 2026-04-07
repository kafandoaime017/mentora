<!-- pages/auth/google-callback.vue -->
<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      <p class="mt-4 text-gray-600">Connexion avec Google en cours...</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuth } from '../../../composables/useAuth';

const route = useRoute();
const router = useRouter();
const { setSession, getDashboard } = useAuth();

onMounted(async () => {
  // Récupérer les paramètres de l'URL
  const token = route.query.token ;
  const userParam = route.query.user;
  const profilIncomplet = route.query.profilIncomplet === 'true';
  
  if (token && userParam) {
    try {
      const user = JSON.parse(decodeURIComponent(userParam));
      
      // Stocker la session
      setSession(token, user);
      
      // Rediriger selon le profil
      if (profilIncomplet) {
        router.push('/complete-profile');
      } else {
        const dashboard = getDashboard(user.role);
        router.push(dashboard);
      }
    } catch (error) {
      console.error('Erreur parsing user:', error);
      router.push('/auth?error=google_auth_failed');
    }
  } else if (route.query.error) {
    router.push('/auth?error=google_auth_failed');
  } else {
    // Attendre un peu pour voir si les paramètres arrivent
    setTimeout(() => {
      if (!token && !userParam) {
        router.push('/auth?error=no_data_received');
      }
    }, 3000);
  }
});
</script>