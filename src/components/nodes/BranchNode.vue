<template>
  <div class="node node-branch" :class="{ highlighted: data.highlighted, dimmed: data.dimmed }">
    <Handle type="target" :position="Position.Top" />
    <Handle type="source" :position="Position.Bottom" />
    <div class="node-label">{{ data.label }}</div>
  </div>
</template>

<script setup>
import { Handle, Position } from '@vue-flow/core'
defineProps(['data'])
</script>

<style scoped>
.node-branch {
  background: #c8ddd4;
  color: #1a3d2b;
  border: 2px solid transparent;
  border-radius: 6px;
  padding: 10px 16px;
  width: 220px;
  text-align: center;
  font-size: 12.5px;
  font-weight: 600;
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
  transition: all 0.25s ease;
  font-style: italic;
}
.node-branch.highlighted {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37,99,235,0.2);
  background: #d1fae5;
}
.node-branch.dimmed {
  opacity: 0.35;
}
</style>
