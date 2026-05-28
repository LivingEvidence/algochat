<template>
  <div class="overview-view">
    <div class="overview-header">
      <span class="overview-badge">Overview</span>
      <span class="overview-desc">All four prior treatment pathways — mCRPC Second-line Treatment</span>
    </div>
    <VueFlow
      :nodes="nodes"
      :edges="edges"
      :default-zoom="0.6"
      :min-zoom="0.2"
      :max-zoom="1.5"
      fit-view-on-init
      :nodes-draggable="false"
      :nodes-connectable="false"
      :elements-selectable="false"
      class="overview-canvas"
    >
      <Background pattern-color="#e2e8f0" :gap="24" />
      <Controls />
      <MiniMap node-color="#b8cce4" />

      <template #node-priorTreatment="{ data }">
        <PriorTreatmentNode :data="data" />
      </template>
      <template #node-testNode="{ data }">
        <TestNode :data="data" />
      </template>
      <template #node-branchNode="{ data }">
        <BranchNode :data="data" />
      </template>
      <template #node-treatmentNode="{ data }">
        <TreatmentNode :data="data" />
      </template>
    </VueFlow>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { VueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'

import PriorTreatmentNode from '../components/nodes/PriorTreatmentNode.vue'
import TestNode from '../components/nodes/TestNode.vue'
import BranchNode from '../components/nodes/BranchNode.vue'
import TreatmentNode from '../components/nodes/TreatmentNode.vue'

import { buildOverviewGraph } from '../composables/useFlowGraph.js'

const { nodes, edges } = buildOverviewGraph()
</script>

<style scoped>
.overview-view {
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
}
.overview-header {
  padding: 12px 24px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 12px;
}
.overview-badge {
  background: #2563eb;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 20px;
  letter-spacing: 0.05em;
}
.overview-desc {
  font-size: 13px;
  color: #475569;
}
.overview-canvas {
  flex: 1;
}
</style>
