<template>
  <div class="tri-view">
    <nav class="flow-toolbar" aria-label="Flowchart tools">
      <button
        type="button"
        class="tool-btn"
        :class="{ active: activeTool === 'chat' }"
        title="Chat"
        aria-label="Chat"
        @click="activateTool('chat')"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M21 12a8 8 0 0 1-8 8H7l-4 3v-7a8 8 0 1 1 18-4Z" />
        </svg>
      </button>
      <button
        type="button"
        class="tool-btn"
        :class="{ active: activeTool === 'history' }"
        title="History"
        aria-label="History"
        @click="activateTool('history')"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 12a9 9 0 1 0 3-6.7" />
          <path d="M3 4v5h5" />
          <path d="M12 7v6l4 2" />
        </svg>
      </button>
      <button
        type="button"
        class="tool-btn"
        :class="{ active: activeTool === 'profile' }"
        title="Patient profile"
        aria-label="Patient profile"
        @click="activateTool('profile')"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20 21a8 8 0 0 0-16 0" />
          <circle cx="12" cy="8" r="4" />
        </svg>
      </button>
      <button
        type="button"
        class="tool-btn"
        :class="{ active: activeTool === 'evidence' }"
        title="Evidence"
        aria-label="Evidence"
        @click="activateTool('evidence')"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 3h9l3 3v15H6Z" />
          <path d="M14 3v4h4" />
          <path d="M9 12h6" />
          <path d="M9 16h6" />
        </svg>
      </button>
      <button
        type="button"
        class="tool-btn"
        :class="{ active: activeTool === 'sources' }"
        title="Guideline sources"
        aria-label="Guideline sources"
        @click="activateTool('sources')"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
        </svg>
      </button>
      <div class="tool-spacer"></div>
      <button
        type="button"
        class="tool-btn"
        :class="{ active: activeTool === 'settings' }"
        title="System settings"
        aria-label="System settings"
        @click="activateTool('settings')"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Z" />
          <path d="m19.4 15 .3 2.3-2.1 1.2-1.9-1.4a7.7 7.7 0 0 1-1.8.8L13.5 20h-3l-.4-2.1a7.7 7.7 0 0 1-1.8-.8l-1.9 1.4-2.1-1.2.3-2.3a7.2 7.2 0 0 1-.9-1.6L1.7 12l2-1.4c.2-.6.5-1.1.9-1.6l-.3-2.3 2.1-1.2 1.9 1.4c.6-.3 1.2-.6 1.8-.8L10.5 4h3l.4 2.1c.6.2 1.2.5 1.8.8l1.9-1.4 2.1 1.2-.3 2.3c.4.5.7 1 .9 1.6l2 1.4-2 1.4c-.2.6-.5 1.1-.9 1.6Z" />
        </svg>
      </button>
    </nav>

    <ChatPanel v-if="activeTool === 'chat'" ref="chatPanel" @close="closeToolPanel" />
    <aside v-else-if="activeToolMeta" class="tool-panel" :aria-label="activeToolMeta.label">
      <header class="tool-panel-header">
        <span class="tool-panel-kicker">{{ activeToolMeta.kicker }}</span>
        <h2>{{ activeToolMeta.label }}</h2>
        <button type="button" class="tool-panel-close" :title="`Close ${activeToolMeta.label}`" :aria-label="`Close ${activeToolMeta.label}`" @click="closeToolPanel">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </header>
      <div class="tool-panel-body">
        <p>{{ activeToolMeta.description }}</p>
      </div>
    </aside>

    <section class="flowchart-panel" aria-label="All pathways flowchart">
      <!-- Hint when nothing selected -->
      <transition name="fade">
        <div class="hint-banner" v-if="!selectedPrior">
          Select a prior treatment in the right panel to see applicable options →
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
        @pane-ready="onPaneReady"
        @node-click="onNodeClick"
        @node-mouse-enter="onNodeHover"
        @node-mouse-leave="onNodeHoverEnd"
      >
        <Background pattern-color="#e2e8f0" :gap="24" />
        <Controls position="bottom-right">
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
          position="bottom-right"
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
    </section>

    <aside v-if="selectedTreatment" class="evidence-panel" aria-label="Treatment evidence">
      <div class="evidence-header">
        <div>
          <span class="evidence-kicker">Evidence</span>
          <h2>{{ selectedTreatment.label }}</h2>
        </div>
        <button class="evidence-close" title="Close evidence panel" @click="closeEvidencePanel">
          ×
        </button>
      </div>

      <div class="evidence-body">
        <div class="evidence-summary">
          <span class="evidence-dot" :class="`cat-${selectedTreatment.cat}`"></span>
          <span>{{ treatmentCategoryLabel }}</span>
        </div>
        <p>
          Evidence content for this treatment option will be shown here after the
          supporting data model is finalized.
        </p>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'

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
import ChatPanel from '../components/ChatPanel.vue'

import { buildTriColumnNodes, EDGE_RULES, TREATMENT_ITEMS } from '../data/triColumn.js'
import { PRIOR_WITH_DOCETAXEL, usePatientProfile } from '../composables/usePatientProfile.js'

// ── State ────────────────────────────────────────────────────────
const hoveredNodeId = ref(null)
const selectedTreatmentId = ref(null)
const flowInstance = ref(null)
const chatPanel = ref(null)
const activeTool = ref('chat')
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

const selectedTreatment = computed(() =>
  TREATMENT_ITEMS.find(item => item.id === selectedTreatmentId.value) || null
)

const CATEGORY_LABELS = {
  parp: 'PARP inhibitor based option',
  arpi: 'AR pathway inhibitor',
  chemo: 'Chemotherapy',
  radio: 'Radiopharmaceutical',
  targeted: 'Targeted radioligand therapy',
  immuno: 'Immunotherapy',
  local: 'Local therapy',
}

const treatmentCategoryLabel = computed(() =>
  CATEGORY_LABELS[selectedTreatment.value?.cat] || 'Treatment option'
)

const TOOL_META = {
  history: {
    kicker: 'Session History',
    label: 'Chat history',
    description: 'Conversation history and prior guideline questions will appear here.',
  },
  profile: {
    kicker: 'Patient Context',
    label: 'Profile tools',
    description: 'Profile summaries, saved profiles, and comparison tools can live in this panel.',
  },
  evidence: {
    kicker: 'Evidence',
    label: 'Evidence review',
    description: 'Selected treatment evidence and citations can be surfaced here without covering the flowchart.',
  },
  sources: {
    kicker: 'Guidelines',
    label: 'Guideline sources',
    description: 'Source documents, version notes, and citation links can be managed from this panel.',
  },
  settings: {
    kicker: 'System',
    label: 'System settings',
    description: 'Model behavior, context scope, privacy controls, and UI preferences can be configured here.',
  },
}

const activeToolMeta = computed(() => activeTool.value ? TOOL_META[activeTool.value] : null)

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
  if (node.type === 'treatNode') {
    selectedTreatmentId.value = node.id
    refitFlowchart()
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

function onPaneReady(instance) {
  flowInstance.value = instance
}

function closeEvidencePanel() {
  selectedTreatmentId.value = null
  refitFlowchart()
}

async function activateTool(tool) {
  if (activeTool.value === tool) {
    activeTool.value = null
    return
  }

  activeTool.value = tool
  if (tool === 'chat') {
    await nextTick()
    chatPanel.value?.focusComposer?.()
  }
}

function closeToolPanel() {
  activeTool.value = null
}

async function refitFlowchart() {
  await nextTick()
  window.setTimeout(() => {
    flowInstance.value?.fitView?.({ padding: 0.12, duration: 220 })
  }, 260)
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
          selected: node.id === selectedTreatmentId.value,
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
  flex-direction: row;
  height: 100%;
  position: relative;
  min-width: 0;
  background: #f0f4f8;
}
.flow-toolbar {
  width: 3rem;
  flex: 0 0 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 7px;
  padding: 10px 6px;
  background: #ffffff;
  border-right: 1px solid #dbe4ee;
  z-index: 11;
}
.tool-panel {
  width: clamp(300px, 28vw, 390px);
  flex: 0 0 clamp(300px, 28vw, 390px);
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: #fbfcfe;
  border-right: 1px solid #dbe4ee;
  box-shadow: 8px 0 24px rgba(15, 23, 42, 0.06);
  z-index: 12;
}
.tool-panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 18px 14px;
  border-bottom: 1px solid #e2e8f0;
  background: #ffffff;
}
.tool-panel-kicker {
  display: block;
  margin-bottom: 5px;
  color: #64748b;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.tool-panel-header h2 {
  margin: 0;
  color: #1e3a5f;
  font-size: 17px;
  line-height: 1.25;
}
.tool-panel-close {
  width: 28px;
  height: 28px;
  flex: 0 0 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #dbe4ee;
  border-radius: 8px;
  background: #ffffff;
  color: #64748b;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s, color 0.15s;
}
.tool-panel-close:hover {
  border-color: #93c5fd;
  background: #eff6ff;
  color: #1d4ed8;
}
.tool-panel-close svg {
  width: 15px;
  height: 15px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2;
}
.tool-panel-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 16px;
}
.tool-panel-body p {
  margin: 0;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #ffffff;
  color: #475569;
  font-size: 13px;
  line-height: 1.55;
  padding: 12px;
}
.tool-btn {
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s, transform 0.15s;
}
.tool-btn:hover,
.tool-btn.active {
  border-color: #bfdbfe;
  background: #eff6ff;
  color: #1d4ed8;
}
.tool-btn:active {
  transform: translateY(1px);
}
.tool-btn svg {
  width: 18px;
  height: 18px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2;
}
.tool-spacer {
  flex: 1;
}
.flowchart-panel {
  position: relative;
  display: flex;
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
}
.tri-canvas {
  flex: 1;
  min-width: 0;
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
  margin-right: 50px;
}

.evidence-panel {
  width: 400px;
  flex: 0 0 400px;
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: #ffffff;
  border-left: 1px solid #dbe4ee;
  box-shadow: -8px 0 24px rgba(15, 23, 42, 0.08);
  z-index: 15;
}

.evidence-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  padding: 18px 20px 16px;
  border-bottom: 1px solid #e2e8f0;
}

.evidence-kicker {
  display: block;
  margin-bottom: 6px;
  color: #64748b;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.evidence-header h2 {
  margin: 0;
  color: #1e3a5f;
  font-size: 17px;
  line-height: 1.3;
}

.evidence-close {
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #fff;
  color: #64748b;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s, color 0.15s;
}

.evidence-close:hover {
  border-color: #2563eb;
  background: #eff6ff;
  color: #2563eb;
}

.evidence-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 18px 20px;
}

.evidence-summary {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 14px;
  color: #334155;
  font-size: 12px;
  font-weight: 700;
}

.evidence-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #94a3b8;
  flex-shrink: 0;
}

.evidence-dot.cat-parp { background: #0d9488; }
.evidence-dot.cat-arpi { background: #7c3aed; }
.evidence-dot.cat-chemo { background: #9333ea; }
.evidence-dot.cat-radio { background: #d97706; }
.evidence-dot.cat-targeted { background: #0891b2; }
.evidence-dot.cat-immuno { background: #db2777; }
.evidence-dot.cat-local { background: #64748b; }

.evidence-body p {
  margin: 0;
  color: #64748b;
  font-size: 13px;
  line-height: 1.6;
}

@media (max-width: 900px) {
  .evidence-panel {
    width: 360px;
    flex-basis: 360px;
  }

  .tool-panel {
    width: 300px;
    flex-basis: 300px;
  }
}

@media (max-width: 760px) {
  .flow-toolbar {
    width: 2.75rem;
    flex-basis: 2.75rem;
    padding-inline: 4px;
  }

  .tool-btn {
    width: 34px;
    height: 34px;
  }

  .tool-panel {
    width: 280px;
    flex-basis: 280px;
  }

  .hint-banner {
    max-width: calc(100% - 32px);
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>
