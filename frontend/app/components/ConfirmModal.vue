<template>
  <Teleport to="body">
    <Transition name="confirm-backdrop">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/50"
        @click.self="handleCancel"
      >
        <Transition name="confirm-pop" appear>
          <div
            v-if="isOpen"
            class="bg-white rounded-sm border border-gray-200 shadow-xl w-full max-w-sm overflow-hidden"
          >
            <div class="p-5">
              <div class="flex items-start gap-3">
                <div
                  class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  :class="options.danger ? 'bg-red-100' : 'bg-blacky/10'"
                >
                  <svg
                    v-if="options.danger"
                    class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/>
                  </svg>
                  <svg v-else class="w-5 h-5 text-blacky" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <div class="min-w-0">
                  <h3 class="font-body font-extrabold text-black text-base">{{ options.title }}</h3>
                  <p class="font-body text-sm text-black/70 mt-1">{{ options.message }}</p>
                </div>
              </div>
            </div>
            <div class="flex items-center justify-end gap-2 px-5 py-3 bg-gray-50 border-t border-gray-200">
              <button
                @click="handleCancel"
                class="px-4 py-2 text-sm font-body font-semibold rounded-lg bg-white border border-gray-200 text-black hover:bg-gray-100 transition-colors"
              >
                {{ options.cancelLabel }}
              </button>
              <button
                @click="handleConfirm"
                class="px-4 py-2 text-sm font-body font-semibold rounded-lg text-white transition-colors"
                :class="options.danger ? 'bg-red-500 hover:bg-red-600' : 'bg-blacky hover:bg-blacky/90'"
              >
                {{ options.confirmLabel }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { useConfirm } from '~~/composables/useConfirm'

const { isOpen, options, handleConfirm, handleCancel } = useConfirm()
</script>

<style scoped>
.confirm-backdrop-enter-active,
.confirm-backdrop-leave-active {
  transition: opacity 0.2s ease;
}
.confirm-backdrop-enter-from,
.confirm-backdrop-leave-to {
  opacity: 0;
}

.confirm-pop-enter-active {
  transition: opacity 0.22s ease, transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.confirm-pop-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.confirm-pop-enter-from {
  opacity: 0;
  transform: scale(0.92) translateY(12px);
}
.confirm-pop-leave-to {
  opacity: 0;
  transform: scale(0.96) translateY(4px);
}
</style>
