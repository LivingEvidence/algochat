<template>
  <div class="grp-container" :class="`tier-${tier}`" :style="containerStyle">
    <div class="grp-header" :style="headerStyle">
      <span v-if="data.num" class="grp-num">{{ data.num }}</span>
      {{ data.label }}
    </div>
    <slot />
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps(['data'])
const tier = computed(() => props.data?.tier || 'col')
const containerStyle = computed(() => {
  if (tier.value === 'subtle') return {}
  return { borderColor: props.data.color }
})
const headerStyle = computed(() => {
  if (tier.value === 'subtle') return {}
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

/* Sub tier — deepest nested groups, deliberately understated */
.tier-sub {
  border-width: 1px;
  border-style: solid;
  border-color: #d1fae5 !important;
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
  color: #6b9e82 !important;
  background: transparent !important;
}
</style>
