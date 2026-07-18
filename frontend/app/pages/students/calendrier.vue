<template>
  <div class="bg-[#f5f0e8] font-body min-h-screen">
    <StudentLayout>
      <div class="max-w-6xl mx-auto py-3">
        <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h2 class="font-body text-2xl font-extrabold text-[#1e3a2f]">Calendrier de mes sessions</h2>
          <div class="flex items-center gap-3 text-xs font-body text-[#1e3a2f]">
            <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-gray-300"/> À venir</span>
            <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-green-400"/> En cours</span>
          </div>
        </div>
        <p class="text-xs text-[#9b9589] mb-4">
          Retrouvez ici les sessions programmées pour votre classe. Rendez-vous sur "Mes sessions" pour rejoindre une session active.
        </p>

        <SessionsCalendar :sessions="sessions" :loading="loading" />
      </div>
    </StudentLayout>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useStudent } from '../../../composables/useStudent'

const { getAvailableSessions } = useStudent()
const loading  = ref(true)
const sessions = ref([])

onMounted(async () => {
  const res = await getAvailableSessions()
  if (res.success) sessions.value = res.data
  loading.value = false
})
</script>
