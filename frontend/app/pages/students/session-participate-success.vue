<template>
  <StudentLayout>
    <div class="flex items-center justify-center h-full min-h-[calc(100vh-60px)]  p-8">
      <div class="bg-white rounded-xl   p-12 max-w-md w-full text-center">

        <!-- Icône animée -->
        <div class="flex justify-center mb-6">
          <svg class="pulse" viewBox="0 0 110 110" width="110" height="110">
            <circle cx="55" cy="55" r="50" fill="none" stroke="#dcfce7" stroke-width="6"/>
            <circle
              class="circle-progress"
              cx="55" cy="55" r="50"
              fill="none" stroke="#16a34a" stroke-width="6"
              stroke-linecap="round"
              stroke-dasharray="314" stroke-dashoffset="314"
            />
            <path
              class="check-path"
              d="M34 55l14 14 28-28"
              fill="none" stroke="#16a34a" stroke-width="4.5"
              stroke-linecap="round" stroke-linejoin="round"
              stroke-dasharray="60" stroke-dashoffset="60"
            />
          </svg>
        </div>

        <!-- Texte -->
        <div class="">
          <h2 class="text-2xl font-bold font-body text-[#1e3a2f] mb-1">Réponses envoyées</h2>
          <p class="text-sm text-gray-700 font-body leading-relaxed">
            Vos réponses ont été enregistrées avec succès.
          </p>
        </div>

      </div>
    </div>
  </StudentLayout>
</template>

<script setup>
</script>

<style scoped>
.circle-progress {
  transform-origin: 50% 50%;
  transform: rotate(-90deg);
  animation: fill-circle 0.7s cubic-bezier(0.4, 0, 0.2, 1) 0.1s forwards;
}
@keyframes fill-circle { to { stroke-dashoffset: 0; } }

.check-path {
  animation: draw-check 0.35s ease 0.75s forwards;
}
@keyframes draw-check { to { stroke-dashoffset: 0; } }

.pulse {
  animation: pulse 0.4s ease 1.1s both;
}
@keyframes pulse {
  0%   { transform: scale(1); }
  50%  { transform: scale(1.08); }
  100% { transform: scale(1); }
}

.fade-in {
  animation: fade-in 0.4s ease 0.9s both;
}
@keyframes fade-in {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>