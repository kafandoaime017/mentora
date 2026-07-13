<template>
  <SuperadminLayout>
    <div>
      <div class="mb-6">
        <h1 class="text-2xl font-extrabold text-gray-800">Abonnements</h1>
        <p class="text-sm text-gray-400 mt-1">Répartition des plans et suivi des renouvellements</p>
      </div>

      <div v-if="loading" class="flex justify-center py-16">
        <div class="animate-spin rounded-full h-8 w-8 border-2 border-blacky border-t-transparent"/>
      </div>

      <div v-else>
        <!-- Répartition des plans -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p class="text-xs font-semibold text-gray-400 uppercase">Gratuit</p>
            <p class="text-3xl font-extrabold text-gray-800 mt-1">{{ repartition.gratuit }}</p>
            <p class="text-xs text-gray-400 mt-1">école(s)</p>
          </div>
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p class="text-xs font-semibold text-blacky uppercase">Starter</p>
            <p class="text-3xl font-extrabold text-gray-800 mt-1">{{ repartition.starter }}</p>
            <p class="text-xs text-gray-400 mt-1">école(s) · ~{{ repartition.starter * 39 }}€/mois</p>
          </div>
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p class="text-xs font-semibold text-secondary uppercase">Pro</p>
            <p class="text-3xl font-extrabold text-gray-800 mt-1">{{ repartition.pro }}</p>
            <p class="text-xs text-gray-400 mt-1">école(s) · ~{{ repartition.pro * 89 }}€/mois</p>
          </div>
        </div>

        <!-- Estimation revenu récurrent -->
        <div class="bg-blacky rounded-2xl p-5 mb-6 flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold text-white/60 uppercase">Revenu récurrent mensuel estimé</p>
            <p class="text-2xl font-extrabold text-white mt-1">{{ mrrEstime }}€ / mois</p>
            <p class="text-[11px] text-white/40 mt-1">Basé sur les tarifs affichés en mensuel — hors remises annuelles et taxes</p>
          </div>
          <svg class="w-10 h-10 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V6m0 10v2m0-2c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>

        <!-- Expirations proches -->
        <div v-if="expirationsProches.length > 0" class="bg-white rounded-2xl shadow-sm border border-yellow-200 p-5 mb-6">
          <h3 class="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
            <svg class="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            Renouvellements dans les 7 jours
          </h3>
          <div class="space-y-2">
            <div v-for="e in expirationsProches" :key="e.id" class="flex items-center justify-between bg-yellow-50 rounded-xl px-4 py-2.5">
              <div>
                <p class="text-sm font-semibold text-gray-800">{{ e.nom }}</p>
                <p class="text-xs text-gray-500">Plan {{ e.plan }}</p>
              </div>
              <span class="text-xs font-bold text-yellow-700">{{ e.joursRestants }} jour(s)</span>
            </div>
          </div>
        </div>

        <!-- Tableau des écoles -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-100">
              <tr>
                <th class="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase">École</th>
                <th class="px-5 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase">Plan</th>
                <th class="px-5 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase">Statut</th>
                <th class="px-5 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase">Renouvellement</th>
                <th class="px-5 py-3.5 text-center text-xs font-semibold text-gray-500 uppercase">Stripe</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-for="e in ecoles" :key="e.id" class="hover:bg-gray-50 transition">
                <td class="px-5 py-4">
                  <p class="font-semibold text-gray-800 text-sm">{{ e.nom }}</p>
                  <p class="text-xs text-gray-400">{{ e.ville || 'Ville non renseignée' }}</p>
                </td>
                <td class="px-5 py-4 text-center">
                  <span class="px-2.5 py-1 rounded-full text-xs font-semibold" :class="planStyle(e.plan)">{{ e.plan }}</span>
                </td>
                <td class="px-5 py-4 text-center">
                  <span class="px-2.5 py-1 rounded-full text-xs font-semibold"
                    :class="e.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'">
                    {{ e.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="px-5 py-4 text-center text-xs">
                  <span v-if="!e.plan_expire_at" class="text-gray-400">—</span>
                  <span v-else-if="e.expire" class="text-red-500 font-semibold">Expiré</span>
                  <span v-else-if="e.expireBientot" class="text-yellow-600 font-semibold">{{ e.joursRestants }} j restants</span>
                  <span v-else class="text-gray-500">{{ new Date(e.plan_expire_at).toLocaleDateString('fr-FR') }}</span>
                </td>
                <td class="px-5 py-4 text-center">
                  <span v-if="e.aAbonnementStripe" class="text-green-600 text-xs font-semibold">Actif</span>
                  <span v-else class="text-gray-300 text-xs">—</span>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-if="ecoles.length === 0" class="p-16 text-center text-gray-400 text-sm">Aucune école</div>
        </div>
      </div>
    </div>
  </SuperadminLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSuperadmin } from '~~/composables/useSuperadmin'
definePageMeta({ layout: false })

const { getAbonnements } = useSuperadmin()

const loading             = ref(true)
const ecoles              = ref([])
const repartition         = ref({ gratuit: 0, starter: 0, pro: 0 })
const expirationsProches  = ref([])

const mrrEstime = computed(() => repartition.value.starter * 39 + repartition.value.pro * 89)

const planStyle = (plan) => ({
  gratuit: 'bg-gray-100 text-gray-500',
  starter: 'bg-blacky/10 text-blacky',
  pro:     'bg-secondary/10 text-secondary'
}[plan] || 'bg-gray-100 text-gray-500')

onMounted(async () => {
  loading.value = true
  const result = await getAbonnements()
  if (result.success) {
    ecoles.value = result.data.ecoles
    repartition.value = result.data.repartition
    expirationsProches.value = result.data.expirationsProches
  }
  loading.value = false
})
</script>
