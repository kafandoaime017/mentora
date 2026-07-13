<template>
  <div class="bg-layout font-body min-h-screen">
    <SuperadminLayout>
      <div v-if="loading" class="bg-white shadow rounded-lg p-12 text-center">
        <div class="inline-block animate-spin rounded-full h-6 w-6 border-2 border-blacky border-t-transparent"/>
      </div>

      <div v-else-if="ecole">
        <!-- Fil d'ariane + retour -->
        <div class="flex items-center gap-2 mb-5">
          <nuxt-link to="/superadmin/ecoles" class="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition">
            <svg class="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
          </nuxt-link>
          <span class="text-xs font-body text-black">Écoles</span>
          <span class="text-xs text-black">/</span>
          <span class="text-xs font-body text-black font-semibold">{{ ecole.nom }}</span>
        </div>

        <!-- En-tête école -->
        <div class="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="flex items-center gap-4">
              <div class="w-14 h-14 bg-blacky/10 rounded-lg flex items-center justify-center shrink-0">
                <svg class="w-7 h-7 text-blacky" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
              </div>
              <div>
                <h1 class="text-xl font-body font-extrabold text-black">{{ ecole.nom }}</h1>
                <p class="text-sm font-body text-black">{{ ecole.ville || 'Ville non renseignée' }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span class="px-3 py-1.5 rounded-full text-xs font-body font-semibold" :class="planStyle(ecole.plan)">Plan {{ ecole.plan }}</span>
              <span class="px-3 py-1.5 rounded-full text-xs font-body font-semibold" :class="ecole.isActive ? 'bg-green-600 text-white' : 'bg-red-600 text-white'">
                {{ ecole.isActive ? 'Active' : 'Inactive' }}
              </span>
            </div>
          </div>

          <!-- Directeur -->
          <div class="mt-5 pt-5 border-t border-gray-100 flex items-center justify-between flex-wrap gap-3">
            <div v-if="ecole.directeur" class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-full bg-secondary/10 flex items-center justify-center text-xs font-bold text-secondary">
                {{ ecole.directeur.prenom?.[0] }}{{ ecole.directeur.nom?.[0] }}
              </div>
              <div>
                <p class="text-sm font-body font-semibold text-black">{{ ecole.directeur.prenom }} {{ ecole.directeur.nom }}</p>
                <p class="text-xs font-body text-black">{{ ecole.directeur.email }} · {{ ecole.directeur.isVerified ? 'Vérifié' : 'En attente de vérification' }}</p>
              </div>
            </div>
            <p v-else class="text-sm font-body text-black">Aucun directeur rattaché à cette école</p>

            <div class="flex gap-2">
              <button @click="ouvrirModalPlan" class="px-4 py-2 bg-blacky/5 text-blacky rounded-lg text-xs font-body font-semibold hover:bg-blacky/10 transition">
                Changer le plan
              </button>
              <button @click="toggleActive" class="px-4 py-2 rounded-lg text-xs font-body font-semibold transition"
                :class="ecole.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'">
                {{ ecole.isActive ? 'Désactiver' : 'Activer' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Usage vs limites -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div class="bg-white rounded-lg border border-gray-200 p-5">
            <div class="flex items-center justify-between mb-2">
              <p class="text-xs font-body font-semibold text-black uppercase">Étudiants</p>
              <p class="text-xs font-body font-bold text-black">{{ ecole.stats.nbEtudiants }} / {{ ecole.limites.maxEtudiants === -1 ? '∞' : ecole.limites.maxEtudiants }}</p>
            </div>
            <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div class="h-full bg-primary rounded-full transition-all" :style="{ width: usagePct(ecole.stats.nbEtudiants, ecole.limites.maxEtudiants) + '%' }"/>
            </div>
          </div>
          <div class="bg-white rounded-lg border border-gray-200 p-5">
            <div class="flex items-center justify-between mb-2">
              <p class="text-xs font-body font-semibold text-black uppercase">Professeurs</p>
              <p class="text-xs font-body font-bold text-black">{{ ecole.stats.nbProfs }} / {{ ecole.limites.maxProfs === -1 ? '∞' : ecole.limites.maxProfs }}</p>
            </div>
            <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div class="h-full bg-secondary rounded-full transition-all" :style="{ width: usagePct(ecole.stats.nbProfs, ecole.limites.maxProfs) + '%' }"/>
            </div>
          </div>
          <div class="bg-white rounded-lg border border-gray-200 p-5">
            <p class="text-xs font-body font-semibold text-black uppercase mb-2">Sessions</p>
            <p class="text-2xl font-body font-extrabold text-black">{{ ecole.stats.nbSessions }}</p>
            <p class="text-xs font-body text-black mt-0.5">{{ ecole.limites.maxSessions === -1 ? 'Illimitées' : `Limite : ${ecole.limites.maxSessions}/mois` }}</p>
          </div>
        </div>

        <!-- Onglets -->
        <div class="flex gap-2 mb-4 border-b border-gray-200">
          <button v-for="t in tabs" :key="t.key" @click="tabActif = t.key"
            class="px-4 py-2.5 text-sm font-body font-semibold border-b-2 -mb-px transition"
            :class="tabActif === t.key ? 'border-blacky text-blacky' : 'border-transparent text-black hover:text-black'">
            {{ t.label }} <span class="opacity-60">({{ t.count }})</span>
          </button>
        </div>

        <!-- Filières & classes -->
        <div v-if="tabActif === 'filieres'" class="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
          <div v-if="!ecole.filieres || ecole.filieres.length === 0" class="p-10 text-center text-black font-body text-sm">Aucune filière</div>
          <div v-for="f in ecole.filieres" :key="f.id" class="p-5">
            <p class="font-body font-semibold text-black text-sm mb-2">{{ f.nom }}</p>
            <div class="flex flex-wrap gap-2">
              <span v-for="c in f.classes" :key="c.id" class="px-2.5 py-1 bg-[#f5f0e8] text-black text-xs font-body rounded-full">{{ c.nom }}</span>
              <span v-if="!f.classes || f.classes.length === 0" class="text-xs font-body text-black">Aucune classe</span>
            </div>
          </div>
        </div>

        <!-- Professeurs -->
        <div v-else-if="tabActif === 'profs'" class="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
          <div v-if="ecole.profs.length === 0" class="p-10 text-center text-black font-body text-sm">Aucun professeur</div>
          <div v-for="p in ecole.profs" :key="p.id" class="p-4 flex items-center justify-between">
            <div>
              <p class="text-sm font-body font-semibold text-black">{{ p.prenom }} {{ p.nom }}</p>
              <p class="text-xs font-body text-black">{{ p.email }} · {{ p.filiere || 'Sans filière' }}</p>
            </div>
            <span class="px-2.5 py-1 rounded-full text-xs font-body font-semibold" :class="p.isActive ? 'bg-green-600 text-white' : 'bg-red-600 text-white'">
              {{ p.isActive ? 'Actif' : 'Inactif' }}
            </span>
          </div>
        </div>

        <!-- Étudiants -->
        <div v-else class="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
          <div v-if="ecole.etudiants.length === 0" class="p-10 text-center text-black font-body text-sm">Aucun étudiant</div>
          <div v-for="e in ecole.etudiants.slice(0, 100)" :key="e.id" class="p-4 flex items-center justify-between">
            <div>
              <p class="text-sm font-body font-semibold text-black">{{ e.prenom }} {{ e.nom }}</p>
              <p class="text-xs font-body text-black">{{ e.email }} · {{ e.filiere || '—' }} {{ e.classe ? '· ' + e.classe : '' }}</p>
            </div>
            <span class="px-2.5 py-1 rounded-full text-xs font-body font-semibold" :class="e.isActive ? 'bg-green-600 text-white' : 'bg-red-600 text-white'">
              {{ e.isActive ? 'Actif' : 'Inactif' }}
            </span>
          </div>
          <p v-if="ecole.etudiants.length > 100" class="p-4 text-center text-xs font-body text-black">+{{ ecole.etudiants.length - 100 }} autres étudiants non affichés</p>
        </div>
      </div>

      <!-- Modal changement de plan -->
      <div v-if="modalPlanVisible" class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" @click.self="modalPlanVisible = false">
        <div class="bg-white rounded-lg w-full max-w-sm p-6">
          <h3 class="font-extrabold text-black text-center text-xl font-body mb-4">Changer le plan de {{ ecole?.nom }}</h3>
          <div class="space-y-2 mb-4">
            <button v-for="p in ['gratuit', 'starter', 'pro']" :key="p" @click="planChoisi = p"
              class="w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-body font-semibold transition"
              :class="planChoisi === p ? 'bg-blacky/10 text-blacky' : 'bg-input text-black hover:bg-gray-200'">
              {{ p.charAt(0).toUpperCase() + p.slice(1) }}
              <svg v-if="planChoisi === p" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
            </button>
          </div>
          <div class="flex gap-3">
            <button @click="modalPlanVisible = false" class="flex-1 font-body py-2.5 bg-gray-200 text-black rounded-lg text-sm font-semibold">Annuler</button>
            <button @click="confirmerChangementPlan" :disabled="enregistrement"
              class="flex-1 font-body py-2.5 bg-[#024864] hover:bg-blacky/80 text-white rounded-lg text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
              <div v-if="enregistrement" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"/>
              <span v-else>Confirmer</span>
            </button>
          </div>
        </div>
      </div>
    </SuperadminLayout>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useSuperadmin } from '~~/composables/useSuperadmin'
import { useToast } from '~~/composables/useToast'
definePageMeta({ layout: false })

const route = useRoute()
const toast = useToast()
const { getEcoleById, updateEcolePlan, updateEcole } = useSuperadmin()

const loading           = ref(true)
const ecole             = ref(null)
const tabActif          = ref('filieres')
const modalPlanVisible  = ref(false)
const planChoisi        = ref('gratuit')
const enregistrement    = ref(false)

const tabs = computed(() => ecole.value ? [
  { key: 'filieres', label: 'Filières & classes', count: ecole.value.filieres?.length || 0 },
  { key: 'profs',     label: 'Professeurs',       count: ecole.value.profs?.length || 0 },
  { key: 'etudiants', label: 'Étudiants',         count: ecole.value.etudiants?.length || 0 }
] : [])

const planStyle = (plan) => ({
  gratuit: 'bg-gray-200 text-black',
  starter: 'bg-blacky/10 text-blacky',
  pro:     'bg-secondary/10 text-secondary'
}[plan] || 'bg-gray-200 text-black')

const usagePct = (val, max) => {
  if (max === -1) return 8
  if (max === 0) return 0
  return Math.min(100, Math.round((val / max) * 100))
}

const ouvrirModalPlan = () => { planChoisi.value = ecole.value.plan; modalPlanVisible.value = true }

const confirmerChangementPlan = async () => {
  enregistrement.value = true
  const result = await updateEcolePlan(ecole.value.id, { plan: planChoisi.value })
  if (result.success) { toast.success(result.message); ecole.value.plan = planChoisi.value; modalPlanVisible.value = false }
  else toast.error(result.message || 'Erreur')
  enregistrement.value = false
}

const toggleActive = async () => {
  const result = await updateEcole(ecole.value.id, { isActive: !ecole.value.isActive })
  if (result.success) { ecole.value.isActive = !ecole.value.isActive; toast.success('École mise à jour') }
  else toast.error(result.message || 'Erreur')
}

onMounted(async () => {
  loading.value = true
  const result = await getEcoleById(route.params.id)
  if (result.success) ecole.value = result.data
  else toast.error(result.message || 'École introuvable')
  loading.value = false
})
</script>
