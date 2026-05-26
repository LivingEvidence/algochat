<template>
  <div class="tri-view">

    <!-- Hint when nothing selected -->
    <transition name="fade">
      <div class="hint-banner" v-if="!selectedPrior">
        ← Select a prior treatment in the left panel to see applicable options
      </div>
    </transition>

    <PatientProfilePanel />

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
      @node-mouse-enter="onNodeHover"
      @node-mouse-leave="onNodeHoverEnd"
    >
      <Background pattern-color="#e2e8f0" :gap="24" />
      <Controls>
        <ControlButton
          class="minimap-control"
          :class="{ active: showMiniMap }"
          :title="showMiniMap ? 'Hide minimap' : 'Show minimap'"
          @click="showMiniMap = !showMiniMap"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M9 18.7 3.7 21A1 1 0 0 1 2.3 20V5.6a1 1 0 0 1 .6-.9L9 2.3l6 3 5.3-2.3A1 1 0 0 1 21.7 4v14.4a1 1 0 0 1-.6.9L15 21.7l-6-3Zm0-14.2v12M15 7.5v12"
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
            />
          </svg>
        </ControlButton>
      </Controls>
      <MiniMap
        v-if="showMiniMap"
        class="tri-minimap"
        node-color="#b8cce4"
        position="bottom-left"
      />

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
import { ControlButton, Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'

import GroupNode          from '../components/nodes/GroupNode.vue'
import PriorNode          from '../components/nodes/PriorNode.vue'
import CondNode           from '../components/nodes/CondNode.vue'
import TreatNode          from '../components/nodes/TreatNode.vue'
import SectionLabelNode   from '../components/nodes/SectionLabelNode.vue'
import PatientProfilePanel from '../components/PatientProfilePanel.vue'

import { buildTriColumnNodes, EDGE_RULES } from '../data/triColumn.js'
import { PRIOR_WITH_DOCETAXEL, usePatientProfile } from '../composables/usePatientProfile.js'

// ── State ────────────────────────────────────────────────────────
const hoveredNodeId = ref(null)
const BASE_NODES    = buildTriColumnNodes()

const { profile, selectedPriorId, selectedCondIds, toggleCondById } = usePatientProfile()
const showMiniMap = ref(false)

// selectedPrior is now driven by the profile panel
const selectedPrior = selectedPriorId

const PRIOR_NODE_TO_KEY = {
  'n1-adt': 'adt', 'n1-adt-doc': 'adt_doc',
  'n1-adt-arpi': 'adt_arpi', 'n1-adt-arpi-doc': 'adt_arpi_doc',
}

const selectedPriorHasDocetaxel = computed(() => {
  return PRIOR_WITH_DOCETAXEL.has(profile.value.prior)
})

// ── Selection handlers ───────────────────────────────────────────
function selectPrior(id) {
  const key = PRIOR_NODE_TO_KEY[id]
  if (key) profile.value = { ...profile.value, prior: profile.value.prior === key ? null : key }
}

function onNodeClick({ node }) {
  if (node.type === 'priorNode') selectPrior(node.id)
  if (node.type === 'condNode' && selectedPrior.value && activeCondIds.value.has(node.id)) {
    toggleCondById(node.id)
  }
}

function onNodeHover({ node }) {
  if (node.type === 'condNode' || node.type === 'treatNode') {
    hoveredNodeId.value = node.id
  }
}
function onNodeHoverEnd() {
  hoveredNodeId.value = null
}

// ── Derived node sets ────────────────────────────────────────────
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

// Treatments that have at least one matched (patient-confirmed) condition
const matchedTreatIds = computed(() => {
  const s = new Set()
  if (!selectedPrior.value || selectedCondIds.value.size === 0) return s
  EDGE_RULES[selectedPrior.value]?.forEach(r => {
    if (selectedCondIds.value.has(r.from)) s.add(r.to)
  })
  return s
})

// ── Hover-linked nodes (only highlight nodes that are potential or matched) ─
const hoverLinkedIds = computed(() => {
  const s = new Set()
  const hid = hoveredNodeId.value
  if (!hid || !selectedPrior.value) return s
  const rules = EDGE_RULES[selectedPrior.value] || []
  rules.forEach(r => {
    if (r.from === hid && activeTreatIds.value.has(r.to))   s.add(r.to)
    if (r.to   === hid && activeCondIds.value.has(r.from))  s.add(r.from)
  })
  return s
})

// ── Computed nodes (with active/dimmed state) ────────────────────
const computedNodes = computed(() =>
  BASE_NODES
    .filter(node => !(selectedPriorHasDocetaxel.value && node.id === 'n2-doc-eligible'))
    .map(node => {
      if (node.type === 'priorNode') {
        return { ...node, data: { ...node.data, selected: node.id === selectedPrior.value } }
      }
      if (node.type === 'condNode') {
        const hasSel = !!selectedPrior.value
        const inPath = activeCondIds.value.has(node.id)
        return { ...node, data: {
          ...node.data,
          state:          !hasSel ? 'default'
                        : !inPath ? 'disabled'
                        : selectedCondIds.value.has(node.id) ? 'matched'
                        : 'potential',
          hoverHighlight: hoverLinkedIds.value.has(node.id),
        }}
      }
      if (node.type === 'treatNode') {
        const hasSel = !!selectedPrior.value
        const inPath = activeTreatIds.value.has(node.id)
        return { ...node, data: {
          ...node.data,
          state:          !hasSel ? 'default'
                        : !inPath ? 'disabled'
                        : matchedTreatIds.value.has(node.id) ? 'matched'
                        : 'potential',
          hoverHighlight: hoverLinkedIds.value.has(node.id),
        }}
      }
      return node
    })
)

// ── Computed edges (appear only after selection) ─────────────────
const computedEdges = computed(() => {
  if (!selectedPrior.value) return []

  const rules        = EDGE_RULES[selectedPrior.value] || []
  const matchedConds = selectedCondIds.value
  const matchedTreat = matchedTreatIds.value

  // ── Styles ──
  const edgePotential = (id, src, tgt) => ({
    id, source: src, target: tgt, type: 'default',
    animated: false,
    style: { stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '5,4' },
    markerEnd: { type: 'arrowclosed', color: '#cbd5e1', width: 12, height: 12 },
  })
  const edgeMatched = (id, src, tgt) => ({
    id, source: src, target: tgt, type: 'default',
    animated: true,
    style: { stroke: '#2563eb', strokeWidth: 2 },
    markerEnd: { type: 'arrowclosed', color: '#2563eb', width: 16, height: 16 },
  })
  const edgeMatchedGreen = (id, src, tgt) => ({
    id, source: src, target: tgt, type: 'default',
    animated: true,
    style: { stroke: '#2d6a4f', strokeWidth: 2 },
    markerEnd: { type: 'arrowclosed', color: '#2d6a4f', width: 16, height: 16 },
  })

  // ── Cond → Treatment edges ──
  const n2n3 = rules.map((rule, i) => {
    const id = `e23-${selectedPrior.value}-${i}`
    const isMatched = matchedConds.has(rule.from) && matchedTreat.has(rule.to)
    return isMatched
      ? edgeMatched(id, rule.from, rule.to)
      : edgePotential(id, rule.from, rule.to)
  })

  // ── Prior → Cond edges ──
  const activeFromIds = [...new Set(rules.map(r => r.from))]
  const n1n2 = activeFromIds.map((condId, i) => {
    const id = `e12-${selectedPrior.value}-${i}`
    return matchedConds.has(condId)
      ? edgeMatchedGreen(id, selectedPrior.value, condId)
      : edgePotential(id, selectedPrior.value, condId)
  })

  return [...n1n2, ...n2n3]
})

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

.minimap-control {
  color: #475569;
}
.minimap-control.active {
  color: #2563eb;
  background: #eff6ff;
}
:deep(.tri-minimap) {
  margin-left: 252px;
}
</style>
