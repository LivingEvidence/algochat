<template>
  <div class="node node-test">
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
.node-test {
  background: #b8cce4;
  color: #1e3a5f;
  border: none;
  border-radius: 6px;
  padding: 12px 18px;
  width: 220px;
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}
</style>
