<template>
  <div class="cond-node"
    :class="[
      `state-${data.state || 'default'}`,
      data.accent ? `accent-${data.accent}` : null,
      { 'hover-highlight': data.hoverHighlight },
      { compact: data.compact },
      { tight: data.tight },
    ]"
    @click.stop="emit('select')"
  >
    <Handle v-if="data.accent !== 'special' && !data.noTargetHandle" type="target" :position="Position.Left" />
    <Handle v-if="!data.noSourceHandle" type="source" :position="Position.Right" />
    <span class="copy">
      <span class="label">{{ data.label }}</span>
      <span v-if="data.helperText" class="helper">{{ data.helperText }}</span>
    </span>
  </div>
</template>

<script setup>
import { Handle, Position } from '@vue-flow/core'
defineProps(['data'])
const emit = defineEmits(['select'])
</script>

<style scoped>
/* ── Base ── */
.cond-node {
  width: 100%;
  min-height: 40px;
  display: flex;
  align-items: center;
  padding: 8px 12px;
  line-height: 1.3;
  border-radius: 6px;
  border: 1.5px solid #c8ddd4;
  background: #edf7f3;
  font-size: 12px;
  color: #1a3d2b;
  font-weight: 500;
  transition: border-color 0.2s, background 0.2s, box-shadow 0.2s, opacity 0.2s;
  position: relative;
}
.copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 2px;
}
.label,
.helper {
  overflow-wrap: anywhere;
}
.helper {
  font-size: 10.5px;
  font-weight: 500;
  line-height: 1.2;
  color: #52796f;
}
.state-matched .helper {
  color: #047857;
}
.cond-node.compact {
  min-height: 34px;
  padding: 5px 10px;
  line-height: 1.2;
}
.cond-node.compact.tight {
  min-height: 0;
  padding: 2px 8px;
  line-height: 1;
}

/* ── default: no prior selected ── */
.state-default {
  border-color: #c8ddd4;
  background: #edf7f3;
  color: #1a3d2b;
}

/* ── potential: in path, not yet confirmed ── */
.state-potential {
  border: 1px dotted #6bab8a;
  background: #f0faf5;
  color: #3d7a5e;
  font-weight: 400;
  cursor: pointer;
}
.state-potential:hover { background: #e0f5ec; }

/* ── matched: patient-confirmed ── */
.state-matched {
  border: 1.5px solid #2d6a4f;
  background: #d1fae5;
  color: #065f46;
  font-weight: 600;
  box-shadow: 0 0 0 2px rgba(45,106,79,0.2);
  cursor: pointer;
}

/* ── disabled: not in path ── */
.state-disabled {
  opacity: 0.22;
  border-color: #e2e8f0;
  background: #f8fafc;
  color: #94a3b8;
}

/* ── accent: special situations (purple) ── */
.accent-special.state-default {
  border-color: #ddd6fe;
  background: #f5f3ff;
  color: #5b21b6;
}
.accent-special.state-potential {
  border: 1px dotted #a78bfa;
  background: #f5f3ff;
  color: #6d28d9;
}
.accent-special.state-potential:hover { background: #ede9fe; }
.accent-special.state-matched {
  border: 1.5px solid #7c3aed;
  background: #ede9fe;
  color: #4c1d95;
  box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.2);
}

/* ── hover highlight (from treatment hover) ── */
.hover-highlight {
  animation: cond-pulse 0.9s ease-in-out infinite;
}
@keyframes cond-pulse {
  0%, 100% {
    border-color: #2d6a4f;
    background: #d1fae5;
    box-shadow: 0 0 0 2px rgba(45,106,79,0.2);
  }
  50% {
    border-color: #52b788;
    background: #a7f3d0;
    box-shadow: 0 0 0 5px rgba(82,183,136,0.25);
  }
}
</style>
