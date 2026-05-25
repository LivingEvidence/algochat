<template>
  <div class="cond-node" :class="{ active: data.active, dimmed: data.dimmed }">
    <Handle type="target" :position="Position.Left" />
    <Handle type="source" :position="Position.Right" />
    <span class="label">{{ data.label }}</span>
  </div>
</template>

<script setup>
import { Handle, Position } from '@vue-flow/core'
defineProps(['data'])
</script>

<style scoped>
.cond-node {
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  border-radius: 6px;
  border: 1.5px solid #c8ddd4;
  background: #edf7f3;
  font-size: 12px;
  color: #1a3d2b;
  font-weight: 500;
  transition: all 0.2s ease;
  position: relative;
}
.cond-node.active {
  border-color: #2d6a4f;
  background: #d1fae5;
  color: #065f46;
  font-weight: 600;
  box-shadow: 0 0 0 2px rgba(45,106,79,0.2);
}
.cond-node.dimmed {
  opacity: 0.25;
  border-color: #e2e8f0;
  background: #f8fafc;
}
</style>
