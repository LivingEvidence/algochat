<template>
  <div class="treat-node" :class="[`cat-${data.cat}`, { active: data.active, dimmed: data.dimmed }]">
    <Handle type="target" :position="Position.Left" />
    <span class="cat-dot"></span>
    <span class="label">{{ data.label }}</span>
  </div>
</template>

<script setup>
import { Handle, Position } from '@vue-flow/core'
defineProps(['data'])
</script>

<style scoped>
.treat-node {
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  border-radius: 6px;
  border: 1.5px solid #dde8f4;
  background: #f0f6ff;
  font-size: 12px;
  color: #1e3a5f;
  font-weight: 500;
  transition: all 0.2s ease;
  position: relative;
}
.treat-node.active {
  border-color: #2563eb;
  background: #eff6ff;
  color: #1d4ed8;
  font-weight: 600;
  box-shadow: 0 0 0 2px rgba(37,99,235,0.2);
}
.treat-node.dimmed {
  opacity: 0.2;
  border-color: #e2e8f0;
  background: #f8fafc;
}

/* Category color dot */
.cat-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}
.cat-parp .cat-dot    { background: #0d9488; }
.cat-arpi .cat-dot    { background: #7c3aed; }
.cat-chemo .cat-dot   { background: #9333ea; }
.cat-radio .cat-dot   { background: #d97706; }
.cat-targeted .cat-dot{ background: #0891b2; }
.cat-immuno .cat-dot  { background: #db2777; }
.cat-local .cat-dot   { background: #64748b; }

/* Active state dot colors */
.cat-parp.active .cat-dot    { background: #0d9488; }
.cat-arpi.active .cat-dot    { background: #7c3aed; }
.cat-chemo.active .cat-dot   { background: #9333ea; }
.cat-radio.active .cat-dot   { background: #d97706; }
.cat-targeted.active .cat-dot{ background: #0891b2; }
.cat-immuno.active .cat-dot  { background: #db2777; }
.cat-local.active .cat-dot   { background: #64748b; }
</style>
