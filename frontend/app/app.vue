<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
import { useErrorTracking } from '../composables/useErrorTracking'

const { setUser } = useErrorTracking()

// Associer l'utilisateur à Sentry si connecté
onMounted(() => {
  try {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      const user = JSON.parse(userStr)
      setUser({
        id: String(user.id),
        email: user.email,
        username: `${user.prenom} ${user.nom}`,
      })
      console.log('✅ Utilisateur associé à Sentry')
    }
  } catch (error) {
    console.error('❌ Erreur association Sentry:', error)
  }
})

// Capture des erreurs non gérées (optionnel)
const error = useError()
if (error.value) {
  const { captureException } = useErrorTracking()
  captureException(error.value, {
    page: 'app',
    url: window?.location?.href || 'unknown',
  })
}
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>