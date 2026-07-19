<template>
  <div class="bg-[#f5f0e8] font-body min-h-screen">
    <TeacherLayout>
      <div class="max-w-6xl mx-auto py-3">
        <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h2 class="font-body text-2xl font-extrabold text-[#1e3a2f]">Calendrier de mes sessions</h2>
          <div class="flex items-center gap-3 text-xs font-body text-[#1e3a2f]">
            <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-yellow-500"/> Programmée</span>
            <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-green-500"/> En cours</span>
            <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-black"/> Terminée</span>
          </div>
        </div>

        <SessionsCalendar :sessions="sessions" :loading="loading" detail-prefix="/teachers/qcm/" />
      </div>
    </TeacherLayout>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useTeacher } from '../../../composables/useTeacher'

const { getQCMList } = useTeacher()
const loading  = ref(true)
const sessions = ref([])

onMounted(async () => {
  const res = await getQCMList()
  if (res.success) sessions.value = res.data
  loading.value = false
})
</script>
