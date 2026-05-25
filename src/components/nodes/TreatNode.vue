<template>
  <div class="treat-node"
    :class="[`cat-${data.cat}`, `state-${data.state || 'default'}`, { 'hover-highlight': data.hoverHighlight }]"
  >
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
/* ── Base ── */
.treat-node {
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  border-radius: 6px;
  border: 1.5px solid #e2e8f0;
  background: #f8fafc;
  font-size: 12px;
  color: #94a3b8;
  font-weight: 500;
  transition: border-color 0.2s, background 0.2s, box-shadow 0.2s, opacity 0.2s;
  position: relative;
}

/* ── default: no prior selected, all gray ── */
.state-default {
  border-color: #e2e8f0;
  background: #f8fafc;
  color: #94a3b8;
}

/* ── potential: in path, no confirmed condition yet ── */
.state-potential {
  border: 1px dotted #93c5fd;
  background: #f5f9ff;
  color: #60a5fa;
  font-weight: 400;
}

/* ── matched: at least one patient-confirmed condition ── */
.state-matched {
  border: 1.5px solid #2563eb;
  background: #eff6ff;
  color: #1d4ed8;
  font-weight: 600;
  box-shadow: 0 0 0 2px rgba(37,99,235,0.2);
}

/* ── disabled: not in path ── */
.state-disabled {
  opacity: 0.2;
  border-color: #e2e8f0;
  background: #f8fafc;
  color: #94a3b8;
}

/* ── hover highlight (from condition hover) ── */
.hover-highlight {
  animation: treat-pulse 0.9s ease-in-out infinite;
}
@keyframes treat-pulse {
  0%, 100% {
    border-color: #2563eb;
    background: #dbeafe;
    color: #1d4ed8;
    box-shadow: 0 0 0 2px rgba(37,99,235,0.2);
  }
  50% {
    border-color: #60a5fa;
    background: #bfdbfe;
    color: #1d4ed8;
    box-shadow: 0 0 0 5px rgba(96,165,250,0.25);
  }
}

/* ── Category color dots ── */
.cat-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
  background: #cbd5e1;
}
/* dot colors when matched */
.state-matched.cat-parp .cat-dot     { background: #0d9488; }
.state-matched.cat-arpi .cat-dot     { background: #7c3aed; }
.state-matched.cat-chemo .cat-dot    { background: #9333ea; }
.state-matched.cat-radio .cat-dot    { background: #d97706; }
.state-matched.cat-targeted .cat-dot { background: #0891b2; }
.state-matched.cat-immuno .cat-dot   { background: #db2777; }
.state-matched.cat-local .cat-dot    { background: #64748b; }
/* dot colors when potential (lighter) */
.state-potential.cat-parp .cat-dot     { background: #5eead4; }
.state-potential.cat-arpi .cat-dot     { background: #a78bfa; }
.state-potential.cat-chemo .cat-dot    { background: #c084fc; }
.state-potential.cat-radio .cat-dot    { background: #fbbf24; }
.state-potential.cat-targeted .cat-dot { background: #38bdf8; }
.state-potential.cat-immuno .cat-dot   { background: #f472b6; }
.state-potential.cat-local .cat-dot    { background: #94a3b8; }
</style>
