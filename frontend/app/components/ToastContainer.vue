<!-- components/ToastContainer.vue -->
<template>
  <div class="toast-container">
    <Toast
      v-for="toast in toasts"
      :key="toast.id"
      :type="toast.type"
      :title="toast.title"
      :message="toast.message"
      :duration="toast.duration"
      @close="removeToast(toast.id)"
    />
  </div>
</template>

<script setup lang="ts">
interface ToastItem {
  id: number
  type: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  duration?: number
}

const toasts = ref<ToastItem[]>([])

const addToast = (toast: Omit<ToastItem, 'id'>) => {
  const id = Date.now()
  toasts.value.push({ ...toast, id })
  
  // Auto-suppression après animation
  setTimeout(() => {
    removeToast(id)
  }, (toast.duration || 3000) + 300)
}

const removeToast = (id: number) => {
  toasts.value = toasts.value.filter(t => t.id !== id)
}

// Fournir les méthodes globalement
provide('toast', {
  success: (message: string, title?: string) => {
    addToast({ type: 'success', message, title, duration: 3000 })
  },
  error: (message: string, title?: string) => {
    addToast({ type: 'error', message, title, duration: 4000 })
  },
  warning: (message: string, title?: string) => {
    addToast({ type: 'warning', message, title, duration: 3000 })
  },
  info: (message: string, title?: string) => {
    addToast({ type: 'info', message, title, duration: 3000 })
  }
})

const { $toast } = useNuxtApp()

// Enregistrer l'instance
onMounted(() => {
  if ($toast && $toast.setInstance) {
    $toast.setInstance({
      success: (message: string, title?: string) => {
        addToast({ type: 'success', message, title, duration: 3000 })
      },
      error: (message: string, title?: string) => {
        addToast({ type: 'error', message, title, duration: 4000 })
      },
      warning: (message: string, title?: string) => {
        addToast({ type: 'warning', message, title, duration: 3000 })
      },
      info: (message: string, title?: string) => {
        addToast({ type: 'info', message, title, duration: 3000 })
      }
    })
  }
})
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>