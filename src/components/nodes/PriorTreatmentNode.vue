<template>
  <div class="node node-prior">
    <Handle type="source" :position="Position.Bottom" />
    <div class="node-label">{{ data.label }}</div>
  </div>
</template>

<script setup>
import { Handle, Position } from '@vue-flow/core'
defineProps(['data'])
</script>

<style scoped>
.node-prior {
  background: #c8956c;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 12px 18px;
  width: 220px;
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  line-height: 1.4;
}
</style>
