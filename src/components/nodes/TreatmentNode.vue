<template>
  <div class="node node-treatment" :class="{ highlighted: data.highlighted, dimmed: data.dimmed }">
    <Handle type="target" :position="Position.Top" />
    <template v-if="data.isSingle">
      <div class="single-treatment">{{ data.label }}</div>
    </template>
    <template v-else>
      <div class="options-header">Options include</div>
      <ul class="options-list">
        <li v-for="opt in data.options" :key="opt">{{ opt }}</li>
      </ul>
    </template>
  </div>
</template>

<script setup>
import { Handle, Position } from '@vue-flow/core'
defineProps(['data'])
</script>

<style scoped>
.node-treatment {
  background: #dde8f4;
  color: #1e3a5f;
  border: 2px solid transparent;
  border-radius: 6px;
  padding: 12px 16px;
  width: 220px;
  font-size: 12px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
  transition: all 0.25s ease;
}
.node-treatment.highlighted {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37,99,235,0.2);
  background: #eff6ff;
}
.node-treatment.dimmed {
  opacity: 0.35;
}
.single-treatment {
  text-align: center;
  font-weight: 600;
  font-size: 13px;
  color: #1e3a5f;
}
.options-header {
  font-style: italic;
  color: #475569;
  margin-bottom: 6px;
  font-size: 11.5px;
}
.options-list {
  margin: 0;
  padding-left: 14px;
  list-style: disc;
}
.options-list li {
  margin-bottom: 3px;
  line-height: 1.4;
  color: #1e3a5f;
}
</style>
