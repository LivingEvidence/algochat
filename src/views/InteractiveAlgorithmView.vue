<template>
  <div class="tri-view">
    <nav class="flow-toolbar" aria-label="Flowchart tools">
      <button
        type="button"
        class="tool-btn"
        :class="{ active: activeTool === 'profile' }"
        aria-label="Patient profile"
        @click="activateTool('profile')"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20 21a8 8 0 0 0-16 0" />
          <circle cx="12" cy="8" r="4" />
        </svg>
        <span class="tool-tooltip" role="tooltip">
          <strong>Patient profile</strong>
          <span>Set treatment history and biomarkers.</span>
        </span>
      </button>
      <div class="tool-divider" aria-hidden="true"></div>
      <button
        type="button"
        class="tool-btn"
        :class="{ active: activeTool === 'chat' }"
        aria-label="Chat"
        @click="activateTool('chat')"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M21 12a8 8 0 0 1-8 8H7l-4 3v-7a8 8 0 1 1 18-4Z" />
        </svg>
        <span class="tool-tooltip" role="tooltip">
          <strong>Chat</strong>
          <span>Ask guideline questions.</span>
        </span>
      </button>
      <button
        type="button"
        class="tool-btn"
        :class="{ active: activeTool === 'history' }"
        aria-label="History"
        @click="activateTool('history')"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3 12a9 9 0 1 0 3-6.7" />
          <path d="M3 4v5h5" />
          <path d="M12 7v6l4 2" />
        </svg>
        <span class="tool-tooltip" role="tooltip">
          <strong>History</strong>
          <span>Review prior chat sessions.</span>
        </span>
      </button>
      <div class="tool-divider" aria-hidden="true"></div>
      <button
        type="button"
        class="tool-btn"
        :class="{ active: activeTool === 'evidence' }"
        aria-label="Evidence"
        @click="activateTool('evidence')"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 3h9l3 3v15H6Z" />
          <path d="M14 3v4h4" />
          <path d="M9 12h6" />
          <path d="M9 16h6" />
        </svg>
        <span class="tool-tooltip" role="tooltip">
          <strong>Evidence</strong>
          <span>Open evidence and citations.</span>
        </span>
      </button>
      <button
        type="button"
        class="tool-btn"
        :class="{ active: activeTool === 'sources' }"
        aria-label="Guideline sources"
        @click="activateTool('sources')"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
        </svg>
        <span class="tool-tooltip" role="tooltip">
          <strong>Guideline sources</strong>
          <span>Manage source documents.</span>
        </span>
      </button>
      <div class="tool-spacer"></div>
      <button
        type="button"
        class="tool-btn"
        :class="{ active: activeTool === 'settings' }"
        aria-label="System settings"
        @click="activateTool('settings')"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Z" />
          <path d="m19.4 15 .3 2.3-2.1 1.2-1.9-1.4a7.7 7.7 0 0 1-1.8.8L13.5 20h-3l-.4-2.1a7.7 7.7 0 0 1-1.8-.8l-1.9 1.4-2.1-1.2.3-2.3a7.2 7.2 0 0 1-.9-1.6L1.7 12l2-1.4c.2-.6.5-1.1.9-1.6l-.3-2.3 2.1-1.2 1.9 1.4c.6-.3 1.2-.6 1.8-.8L10.5 4h3l.4 2.1c.6.2 1.2.5 1.8.8l1.9-1.4 2.1 1.2-.3 2.3c.4.5.7 1 .9 1.6l2 1.4-2 1.4c-.2.6-.5 1.1-.9 1.6Z" />
        </svg>
        <span class="tool-tooltip" role="tooltip">
          <strong>Settings</strong>
          <span>Adjust system preferences.</span>
        </span>
      </button>
    </nav>

    <ChatPanel v-if="activeTool === 'chat'" ref="chatPanel" @close="closeToolPanel" />
    <aside v-else-if="activeToolMeta" class="tool-panel" :aria-label="activeToolMeta.label">
      <header class="tool-panel-header">
        <h2>{{ activeToolMeta.label }}</h2>
        <div class="tool-panel-actions">
          <template v-if="activeTool === 'profile'">
            <button type="button" class="tool-panel-action secondary" @click="resetProfile">Reset</button>
            <button type="button" class="tool-panel-action primary" @click="saveCurrentProfile()">Save</button>
          </template>
          <button type="button" class="tool-panel-close" :title="`Close ${activeToolMeta.label}`" :aria-label="`Close ${activeToolMeta.label}`" @click="closeToolPanel">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>
      </header>
      <div class="tool-panel-body">
        <p>{{ activeToolMeta.description }}</p>
      </div>
    </aside>

    <section class="flowchart-panel" aria-label="Interactive algorithm flowchart">

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
        <template #node-promptNode="nodeProps">
          <div class="prompt-node">
            <svg viewBox="0 0 24 24" aria-hidden="true" class="prompt-icon">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .8-1 1.7" />
              <circle cx="12" cy="17" r="0.6" fill="currentColor" />
            </svg>
            <span>{{ nodeProps.data.label }}</span>
          </div>
        </template>
      </VueFlow>
    </section>

    <aside v-if="selectedTreatment" class="evidence-panel" aria-label="Treatment evidence">
      <div class="evidence-header">
        <div>
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
import ChatPanel from '../components/ChatPanel.vue'

import { storeToRefs } from 'pinia'
import {
  buildInteractiveNodes,
  EDGE_RULES,
  TREATMENT_ITEMS,
} from '../data/interactiveAlgorithm.js'
import {
  useInteractiveAlgorithmStore,
  BIO_YES_ID,
  BIO_NO_ID,
} from '../stores/interactiveAlgorithm.js'

// ── View-local UI state (not shared) ─────────────────────────────
const hoveredNodeId = ref(null)
const flowInstance  = ref(null)
const chatPanel     = ref(null)
const activeTool    = ref(null)
const showMiniMap   = ref(false)

// ── Workflow state from Pinia store (isolated per-view) ──────────
const interactiveStore = useInteractiveAlgorithmStore()
const {
  selectedPrior,
  bioChoice,
  selectedCondIds,
  selectedTreatmentId,
  activeCondIds,
  activeTreatIds,
  knownCondIds,
  matchedTreatIds,
} = storeToRefs(interactiveStore)

function resetProfile() {
  interactiveStore.reset()
  refitFlowchart()
}
function saveCurrentProfile() {
  // The interactive view does not currently persist profiles.
}

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
    label: 'Chat history',
    description: 'Conversation history and prior guideline questions will appear here.',
  },
  profile: {
    label: 'Patient profile',
    description: 'Make selections directly on the canvas. Use Reset to start the guided workflow from the beginning.',
  },
  evidence: {
    label: 'Evidence review',
    description: 'Selected treatment evidence and citations can be surfaced here without covering the flowchart.',
  },
  sources: {
    label: 'Guideline sources',
    description: 'Source documents, version notes, and citation links can be managed from this panel.',
  },
  settings: {
    label: 'System settings',
    description: 'Model behavior, context scope, privacy controls, and UI preferences can be configured here.',
  },
}

const activeToolMeta = computed(() => activeTool.value ? TOOL_META[activeTool.value] : null)

// ── Selection handlers (delegate to store, then refit canvas) ────
function selectPrior(id) {
  interactiveStore.selectPrior(id)
  refitFlowchart()
}

function setBioChoice(choice) {
  interactiveStore.setBioChoice(choice)
  refitFlowchart()
}

function toggleCondById(id) {
  interactiveStore.toggleCondById(id)
  refitFlowchart()
}

function onNodeClick({ node }) {
  if (node.type === 'priorNode') {
    selectPrior(node.id)
    return
  }
  // Biomarker question Yes / No
  if (node.id === BIO_YES_ID) { setBioChoice('yes'); return }
  if (node.id === BIO_NO_ID)  { setBioChoice('no');  return }

  if (node.type === 'condNode' && selectedPrior.value && bioChoice.value !== null) {
    // Only toggle real condition / special-situation nodes (tied to EDGE_RULES)
    if (knownCondIds.value.has(node.id)) {
      toggleCondById(node.id)
    }
  }
  if (node.type === 'treatNode') {
    interactiveStore.selectTreatment(node.id)
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
  interactiveStore.clearTreatment()
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

// ── Step-by-step base nodes (depend on workflow state) ───────────
const baseNodes = computed(() => buildInteractiveNodes({
  prior:     selectedPrior.value,
  bioChoice: bioChoice.value,
  condIds:   selectedCondIds.value,
}))

// ── Computed nodes (with active/dimmed state overlay) ─────────────
const computedNodes = computed(() =>
  baseNodes.value.map(node => {
    if (node.type === 'priorNode') {
      return { ...node, data: { ...node.data, selected: node.id === selectedPrior.value } }
    }
    if (node.type === 'condNode') {
      // Biomarker Yes / No prompt choices are styled separately
      if (node.data?.interactiveChoice) {
        return { ...node, data: {
          ...node.data,
          state: 'potential',
          hoverHighlight: false,
        } }
      }
      const inPath = activeCondIds.value.has(node.id)
      return { ...node, data: {
        ...node.data,
        state:          !inPath ? 'default'
                      : selectedCondIds.value.has(node.id) ? 'matched'
                      : 'potential',
        hoverHighlight: hoverLinkedIds.value.has(node.id),
      }}
    }
    if (node.type === 'treatNode') {
      const inPath = activeTreatIds.value.has(node.id)
      return { ...node, data: {
        ...node.data,
        state:          !inPath ? 'default'
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

  // Set of node ids that are actually rendered right now
  const presentIds = new Set(baseNodes.value.map(n => n.id))
  const treatmentsVisible = presentIds.has('g3')
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

  // Filter EDGE_RULES to those whose endpoints are currently rendered
  const visibleRules = rules.filter(r => presentIds.has(r.from) && presentIds.has(r.to))

  // ── Cond → Treatment edges (only after treatments are revealed) ──
  const n2n3 = treatmentsVisible ? visibleRules.map((rule, i) => {
    const id = `e23-${selectedPrior.value}-${i}`
    const isMatched = matchedConds.has(rule.from) && matchedTreat.has(rule.to)
    return isMatched
      ? edgeMatched(id, rule.from, rule.to)
      : edgePotential(id, rule.from, rule.to)
  }) : []

  // ── Prior → Cond edges ──
  const activeFromIds = [...new Set(visibleRules.map(r => r.from))]
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
  z-index: 30;
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
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 18px 14px;
  border-bottom: 1px solid #e2e8f0;
  background: #ffffff;
}
.tool-panel-header h2 {
  margin: 0;
  color: #1e3a5f;
  font-size: 17px;
  line-height: 1.25;
}
.tool-panel-actions {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  flex-shrink: 0;
}
.tool-panel-action {
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s, color 0.15s;
}
.tool-panel-action.secondary {
  padding: 0 9px;
  border: 1px solid #dbe4ee;
  background: #ffffff;
  color: #64748b;
}
.tool-panel-action.secondary:hover {
  border-color: #fecaca;
  background: #fef2f2;
  color: #dc2626;
}
.tool-panel-action.primary {
  padding: 0 11px;
  border: 1px solid #2563eb;
  background: #2563eb;
  color: #ffffff;
}
.tool-panel-action.primary:hover {
  border-color: #1d4ed8;
  background: #1d4ed8;
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
  position: relative;
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
.tool-tooltip {
  position: absolute;
  top: 50%;
  left: calc(100% + 10px);
  z-index: 40;
  width: 180px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 10px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 8px 22px rgba(15, 23, 42, 0.12);
  color: #475569;
  font-size: 11px;
  font-weight: 500;
  line-height: 1.35;
  opacity: 0;
  pointer-events: none;
  text-align: left;
  transform: translate(4px, -50%);
  transition: opacity 0.12s, transform 0.12s;
}
.tool-tooltip::before {
  content: "";
  position: absolute;
  top: 50%;
  left: -5px;
  width: 8px;
  height: 8px;
  border-left: 1px solid #cbd5e1;
  border-bottom: 1px solid #cbd5e1;
  background: #ffffff;
  transform: translateY(-50%) rotate(45deg);
}
.tool-tooltip strong {
  color: #1e3a5f;
  font-size: 1.2em;
  font-weight: 800;
  line-height: 1.25;
}
.tool-tooltip span {
  display: block;
}
.tool-btn:hover .tool-tooltip,
.tool-btn:focus-visible .tool-tooltip {
  opacity: 1;
  transform: translate(0, -50%);
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
.tool-divider {
  width: 24px;
  height: 1px;
  flex: 0 0 auto;
  margin: 2px 0;
  background: #dbe4ee;
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

.prompt-node {
  width: 100%;
  min-height: 44px;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 10px 12px;
  border: 1px dashed #94a3b8;
  border-radius: 8px;
  background: #f8fafc;
  color: #334155;
  font-size: 12.5px;
  font-weight: 600;
  line-height: 1.35;
}
.prompt-node .prompt-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  fill: none;
  stroke: #64748b;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2;
}

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

}
</style>
