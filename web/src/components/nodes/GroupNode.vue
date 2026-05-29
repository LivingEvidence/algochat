<template>
  <div
    class="grp-container"
    :class="[`tier-${tier}`, { 'compact-question': data.compactQuestion }]"
    :style="containerStyle"
  >
    <Handle v-if="data.acceptsTarget" type="target" :position="targetPosition" class="grp-handle" />
    <div class="grp-header" :style="headerStyle">
      <span v-if="data.num" class="grp-num">{{ data.num }}</span>
      {{ data.label }}
    </div>
    <div v-if="data.description" class="grp-description">{{ data.description }}</div>
    <slot />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Handle, Position } from '@vue-flow/core'
const props = defineProps(['data'])
const tier = computed(() => props.data?.tier || 'col')
const compactQuestion = computed(() => !!props.data?.compactQuestion)
const targetPosition = computed(() => {
  const pos = props.data?.targetPosition
  return pos === 'top' ? Position.Top : Position.Left
})
const containerStyle = computed(() => {
  if (compactQuestion.value) return {}
  if (tier.value === 'subtle') return {}
  return { borderColor: props.data.color }
})
const headerStyle = computed(() => {
  if (compactQuestion.value) return {}
  if (tier.value === 'subtle') return {}
  if (tier.value === 'sub') return { color: props.data.color }
  return { background: props.data.color }
})
</script>

<style scoped>
.grp-container {
  width: 100%; height: 100%;
  border: 2px solid;
  border-radius: 10px;
  overflow: hidden;
  background: #f8fafc;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}
.grp-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.02em;
}
.grp-num {
  font-size: 16px;
  line-height: 1;
}
.grp-description {
  padding: 8px 12px 4px;
  color: #475569;
  font-size: 11px;
  font-weight: 500;
  line-height: 1.4;
  font-style: italic;
}

/* Subtle tier — understated outer wrapper (e.g., BioMarker Assessment) */
.tier-subtle {
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
  background: transparent;
  box-shadow: none;
}
.tier-subtle .grp-header {
  padding: 5px 12px;
  color: #94a3b8;
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  background: transparent;
}

/* Mid tier — nested groups inside a top group */
.tier-mid {
  border-width: 1.5px;
  border-radius: 8px;
  background: #fcfdfc;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
}
.tier-mid .grp-header {
  padding: 7px 12px;
  font-size: 12px;
  font-weight: 600;
}

/* Sub tier — deepest nested groups, deliberately understated.
   Border + header color come from data.color via inline style. */
.tier-sub {
  border-width: 1px;
  border-style: solid;
  border-radius: 6px;
  background: transparent;
  box-shadow: none;
}
.tier-sub .grp-header {
  padding: 4px 10px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  background: transparent;
}

.compact-question {
  border: 1px solid #dbe4ee;
  border-radius: 6px;
  background: #ffffff;
  box-shadow: 0 1px 4px rgba(15, 23, 42, 0.08);
}
.compact-question .grp-header {
  align-items: flex-start;
  padding: 6px 7px 3px;
  color: #334155;
  background: #ffffff;
  font-size: 9.5px;
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: 0;
  text-transform: none;
}
</style>
