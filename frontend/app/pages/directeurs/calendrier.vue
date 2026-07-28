<template>
  <div class="bg-layout font-body min-h-screen">
    <AdminLayout>
      <div class="max-w-6xl mx-auto">
        <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h1 class="text-2xl font-extrabold text-black font-body">Calendrier des sessions</h1>
          <div class="flex items-center gap-3 text-xs font-body text-black">
            <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-yellow-500"/> Programmée</span>
            <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-green-500"/> En cours</span>
            <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-black"/> Terminée</span>
          </div>
        </div>

        <SessionsCalendar :sessions="sessions" :loading="loading" detail-prefix="/directeurs/sessions/" />
      </div>
    </AdminLayout>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAdmin } from '../../../composables/useAdmin'

const { getSessions } = useAdmin()
const loading  = ref(true)
const sessions = ref([])

onMounted(async () => {
  const res = await getSessions()
  if (res.success) sessions.value = res.data
  loading.value = false
})
</script>
