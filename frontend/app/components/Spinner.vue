<template>
  <div class="pulse-loader py-[5px]">
    <span v-for="n in 3" :key="n" class="dot"></span>
  </div>
</template>

<script setup>
</script>

<style scoped>
.pulse-loader {
  display: flex;
  gap: 5px;
  align-items: center;
  justify-content: center;
}

.dot {
  width: 14px;
  height: 14px;
  background-color: #ffffff;
  border-radius: 50%;
  animation: pulse 1s infinite ease-in-out;
}

/* décalage pour chaque dot */
.dot:nth-child(1) { animation-delay: 0s; }
.dot:nth-child(2) { animation-delay: 0.2s; }
.dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes pulse {
  0%, 80%, 100% { transform: scale(0); opacity: 0.3; }
  40% { transform: scale(1); opacity: 1; }
}
</style>