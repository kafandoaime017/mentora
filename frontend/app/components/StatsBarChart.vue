<template>
  <div class="w-full">
    <div v-if="title || subtitle" class="mb-3">
      <p v-if="title" class="font-body text-sm font-bold text-[#1e3a2f]">{{ title }}</p>
      <p v-if="subtitle" class="font-body text-xs text-black/50 mt-0.5">{{ subtitle }}</p>
    </div>

    <div v-if="!items || items.length === 0" class="py-8 text-center">
      <p class="font-body text-xs text-black/40">Pas encore de données</p>
    </div>

    <svg
      v-else
      :viewBox="`0 0 ${width} ${height}`"
      class="w-full"
      :style="{ height: displayHeight + 'px' }"
      preserveAspectRatio="xMidYMid meet"
    >
      <!-- lignes de repère horizontales -->
      <line
        v-for="(g, i) in gridLines" :key="'grid-' + i"
        :x1="padding" :x2="width - padding"
        :y1="chartTop + chartHeight * (1 - g)" :y2="chartTop + chartHeight * (1 - g)"
        stroke="#e5e7eb" stroke-width="1" stroke-dasharray="3,3"
      />

      <!-- axe de base -->
      <line :x1="padding" :y1="chartTop + chartHeight" :x2="width - padding" :y2="chartTop + chartHeight" stroke="#d1cfc7" stroke-width="1.5" />

      <g v-for="(item, i) in items" :key="i">
        <rect
          :x="barX(i)"
          :y="barY(item)"
          :width="barWidth"
          :height="Math.max(barHeight(item), 2)"
          :fill="item.color || defaultColor(i)"
          rx="5"
        />
        <text
          :x="barX(i) + barWidth / 2" :y="barY(item) - 8"
          text-anchor="middle" font-size="11" font-weight="700"
          class="font-body" fill="#1e3a2f"
        >
          {{ formatValue(item) }}
        </text>
        <text
          :x="barX(i) + barWidth / 2" :y="chartTop + chartHeight + 18"
          text-anchor="middle" font-size="9.5"
          class="font-body" fill="#6b6459"
        >
          {{ truncateLabel(item.label) }}
        </text>
      </g>
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  items:       { type: Array, default: () => [] }, // [{ label, value, color, displayValue }]
  title:       { type: String, default: '' },
  subtitle:    { type: String, default: '' },
  maxValue:    { type: Number, default: null }, // si absent, calculé depuis les données
  unit:        { type: String, default: '' },
  minHeight:   { type: Number, default: 200 },
  // Palette Mentora par défaut (du plus foncé/vert profond au plus clair)
  colors:      { type: Array, default: () => ['#054348', '#1e3a2f', '#4a7c5e', '#7fae8a', '#c9a95c', '#d97757'] }
})

const padding      = 24
const barWidth      = 34
const gap           = 22
const chartHeight   = 130
const chartTop      = 26
const bottomLabels  = 34

const width  = computed(() => Math.max(props.items.length * (barWidth + gap) + padding * 2 - gap, 220))
const height = computed(() => chartTop + chartHeight + bottomLabels)
const displayHeight = computed(() => Math.max(props.minHeight, 160))

const computedMax = computed(() => {
  if (props.maxValue != null) return props.maxValue
  const vals = props.items.map(it => it.value || 0)
  return Math.max(...vals, 1)
})

const gridLines = [0.25, 0.5, 0.75, 1]

function barX(i) { return padding + i * (barWidth + gap) }
function barHeight(item) {
  const ratio = computedMax.value > 0 ? Math.min((item.value || 0) / computedMax.value, 1) : 0
  return ratio * chartHeight
}
function barY(item) { return chartTop + (chartHeight - barHeight(item)) }
function defaultColor(i) { return props.colors[i % props.colors.length] }
function formatValue(item) {
  if (item.displayValue !== undefined && item.displayValue !== null) return item.displayValue
  const v = item.value
  const rounded = Number.isInteger(v) ? v : Math.round(v * 10) / 10
  return `${rounded}${props.unit}`
}
function truncateLabel(label) {
  if (!label) return ''
  return label.length > 11 ? label.slice(0, 10) + '…' : label
}
</script>
