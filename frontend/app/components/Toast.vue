<!-- components/Toast.vue -->
<template>
  <Transition name="toast">
    <div 
      v-if="visible" 
      :class="['toast', `toast-${type}`]"
      @click="close"
    >
      <div class="toast-icon">
        <span v-if="type === 'success'">✅</span>
        <span v-else-if="type === 'error'">❌</span>
        <span v-else-if="type === 'warning'">⚠️</span>
        <span v-else-if="type === 'info'">ℹ️</span>
      </div>
      <div class="toast-content">
        <div class="toast-title">{{ title }}</div>
        <div class="toast-message">{{ message }}</div>
      </div>
      <button class="toast-close">✕</button>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const props = defineProps<{
  type?: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  duration?: number
}>()

const visible = ref(true)

const emit = defineEmits<{
  close: []
}>()

const close = () => {
  visible.value = false
  setTimeout(() => {
    emit('close')
  }, 300)
}

// Auto-close après la durée
onMounted(() => {
  if (props.duration !== 0) {
    setTimeout(() => {
      close()
    }, props.duration || 3000)
  }
})
</script>

<style scoped>
.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-radius: 12px;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 300px;
  max-width: 400px;
  cursor: pointer;
  z-index: 9999;
  animation: slideIn 0.3s ease;
}

.toast-success {
  border-left: 4px solid #10b981;
  background: #f0fdf4;
}

.toast-error {
  border-left: 4px solid #ef4444;
  background: #fef2f2;
}

.toast-warning {
  border-left: 4px solid #f59e0b;
  background: #fffbeb;
}

.toast-info {
  border-left: 4px solid #3b82f6;
  background: #eff6ff;
}

.toast-icon {
  font-size: 24px;
}

.toast-content {
  flex: 1;
}

.toast-title {
  font-weight: 600;
  margin-bottom: 4px;
  color: #1f2937;
}

.toast-message {
  font-size: 14px;
  color: #6b7280;
}

.toast-close {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #9ca3af;
  padding: 0;
  margin-left: auto;
}

.toast-close:hover {
  color: #4b5563;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>