<template>
  <div class="prior-node" :class="{ selected: data.selected }" @click.stop="emit('select')">
    <Handle type="source" :position="Position.Right" />
    <span class="label">{{ data.label }}</span>
    <span class="arrow" v-if="data.selected">→</span>
  </div>
</template>

<script setup>
import { Handle, Position } from '@vue-flow/core'
const props = defineProps(['data'])
const emit = defineEmits(['select'])
</script>

<style scoped>
.prior-node {
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  border-radius: 6px;
  border: 2px solid #e2e8f0;
  background: #fff;
  cursor: pointer;
  font-size: 12.5px;
  color: #334155;
  font-weight: 500;
  transition: all 0.18s ease;
  user-select: none;
}
.prior-node:hover {
  border-color: #c8956c;
  background: #fdf6f0;
}
.prior-node.selected {
  border-color: #c8956c;
  background: #fdf6f0;
  color: #92400e;
  font-weight: 700;
  box-shadow: 0 0 0 3px rgba(200,149,108,0.25);
}
.arrow {
  font-size: 14px;
  color: #c8956c;
  font-weight: 700;
}
</style>
