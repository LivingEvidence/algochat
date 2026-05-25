<template>
  <div class="tri-view">

    <!-- Hint when nothing selected -->
    <transition name="fade">
      <div class="hint-banner" v-if="!selectedPrior">
        ← Select a prior treatment in the left panel to see applicable options
      </div>
    </transition>

    <!-- Legend -->
    <div class="legend">
      <span v-for="cat in CATEGORIES" :key="cat.id" class="legend-item">
        <span class="legend-dot" :style="{ background: cat.color }"></span>
        {{ cat.label }}
      </span>
    </div>

    <VueFlow
      :nodes="computedNodes"
      :edges="computedEdges"
      :default-zoom="0.95"
      :min-zoom="0.3"
      :max-zoom="2"
      fit-view-on-init
      :nodes-draggable="false"
      :nodes-connectable="false"
      :elements-selectable="false"
      class="tri-canvas"
      @node-click="onNodeClick"
    >
      <Background pattern-color="#e2e8f0" :gap="24" />
      <Controls />
      <MiniMap node-color="#b8cce4" />

      <template #node-customGroup="nodeProps">
        <GroupNode :data="nodeProps.data" />
      </template>
      <template #node-priorNode="nodeProps">
        <PriorNode :data="nodeProps.data" @select="selectPrior(nodeProps.id)" />
      </template>
      <template #node-condNode="nodeProps">
        <CondNode :data="nodeProps.data" />
      </template>
      <template #node-treatNode="nodeProps">
        <TreatNode :data="nodeProps.data" />
      </template>
      <template #node-sectionLabel="nodeProps">
        <SectionLabelNode :data="nodeProps.data" />
      </template>
    </VueFlow>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { VueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'

import GroupNode        from '../components/nodes/GroupNode.vue'
import PriorNode        from '../components/nodes/PriorNode.vue'
import CondNode         from '../components/nodes/CondNode.vue'
import TreatNode        from '../components/nodes/TreatNode.vue'
import SectionLabelNode from '../components/nodes/SectionLabelNode.vue'

import { buildTriColumnNodes, EDGE_RULES } from '../data/triColumn.js'

// ── State ────────────────────────────────────────────────────────
const selectedPrior = ref(null)
const BASE_NODES = buildTriColumnNodes()

// ── Selection handler ────────────────────────────────────────────
function selectPrior(id) {
  selectedPrior.value = selectedPrior.value === id ? null : id
}

function onNodeClick({ node }) {
  if (node.type === 'priorNode') selectPrior(node.id)
}

// ── Derived active node sets ─────────────────────────────────────
const activeCondIds = computed(() => {
  const s = new Set()
  if (selectedPrior.value) {
    EDGE_RULES[selectedPrior.value]?.forEach(r => s.add(r.from))
  }
  return s
})

const activeTreatIds = computed(() => {
  const s = new Set()
  if (selectedPrior.value) {
    EDGE_RULES[selectedPrior.value]?.forEach(r => s.add(r.to))
  }
  return s
})

// ── Computed nodes (with active/dimmed state) ────────────────────
const computedNodes = computed(() =>
  BASE_NODES.map(node => {
    if (node.type === 'priorNode') {
      return { ...node, data: { ...node.data, selected: node.id === selectedPrior.value } }
    }
    if (node.type === 'condNode') {
      const hasSel = !!selectedPrior.value
      return { ...node, data: {
        ...node.data,
        active:  !hasSel || activeCondIds.value.has(node.id),
        dimmed:   hasSel && !activeCondIds.value.has(node.id),
      }}
    }
    if (node.type === 'treatNode') {
      const hasSel = !!selectedPrior.value
      return { ...node, data: {
        ...node.data,
        active:  !hasSel || activeTreatIds.value.has(node.id),
        dimmed:   hasSel && !activeTreatIds.value.has(node.id),
      }}
    }
    return node
  })
)

// ── Computed edges (appear only after selection) ─────────────────
const computedEdges = computed(() => {
  if (!selectedPrior.value) return []

  const rules = EDGE_RULES[selectedPrior.value] || []

  // Node2 → Node3 edges (blue Bezier)
  const n2n3 = rules.map((rule, i) => ({
    id: `e23-${selectedPrior.value}-${i}`,
    source: rule.from,
    target: rule.to,
    type: 'default',
    animated: true,
    style: { stroke: '#2563eb', strokeWidth: 1.8 },
    markerEnd: { type: 'arrowclosed', color: '#2563eb', width: 16, height: 16 },
  }))

  // Node1 → Node2 edges: selected prior → each active condition node
  const activeFromIds = [...new Set(rules.map(r => r.from))]
  const n1n2 = activeFromIds.map((condId, i) => ({
    id: `e12-${selectedPrior.value}-${i}`,
    source: selectedPrior.value,
    target: condId,
    type: 'default',
    animated: false,
    style: { stroke: '#c8956c', strokeWidth: 1.5, strokeDasharray: '5,4' },
    markerEnd: { type: 'arrowclosed', color: '#c8956c', width: 14, height: 14 },
  }))

  return [...n1n2, ...n2n3]
})

// ── Legend ───────────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'parp',     label: 'PARP-based',        color: '#0d9488' },
  { id: 'arpi',     label: 'ARPI',               color: '#7c3aed' },
  { id: 'chemo',    label: 'Chemotherapy',        color: '#9333ea' },
  { id: 'radio',    label: 'Radionuclide',        color: '#d97706' },
  { id: 'targeted', label: 'Targeted (PSMA)',     color: '#0891b2' },
  { id: 'immuno',   label: 'Immunotherapy',       color: '#db2777' },
  { id: 'local',    label: 'Local therapy',       color: '#64748b' },
]
</script>

<style scoped>
.tri-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
}
.tri-canvas {
  flex: 1;
}

/* Hint banner */
.hint-banner {
  position: absolute;
  top: 48px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  background: #1e3a5f;
  color: #93c5fd;
  font-size: 12.5px;
  padding: 7px 18px;
  border-radius: 20px;
  pointer-events: none;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* Legend */
.legend {
  position: absolute;
  bottom: 52px;
  left: 16px;
  z-index: 10;
  display: flex;
  flex-wrap: wrap;
  gap: 8px 14px;
  background: rgba(255,255,255,0.92);
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 8px 12px;
  max-width: 380px;
  backdrop-filter: blur(4px);
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: #475569;
}
.legend-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
</style>
