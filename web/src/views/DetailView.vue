<template>
  <div class="detail-view">
    <!-- Left: flowchart -->
    <div class="flow-area">
      <VueFlow
        :nodes="nodes"
        :edges="edges"
        :default-zoom="0.85"
        :min-zoom="0.3"
        :max-zoom="2"
        fit-view-on-init
        :nodes-draggable="false"
        :nodes-connectable="false"
        :elements-selectable="false"
        class="flow-canvas"
      >
        <Background pattern-color="#e2e8f0" :gap="20" />
        <Controls />

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

    <!-- Right: biomarker panel -->
    <BiomarkerPanel
      :special-situations="currentGuideline.specialSituations"
      :highlighted-special="highlightedSpecial"
      @update:profile="onProfileUpdate"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { VueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'

import PriorTreatmentNode from '../components/nodes/PriorTreatmentNode.vue'
import TestNode from '../components/nodes/TestNode.vue'
import BranchNode from '../components/nodes/BranchNode.vue'
import TreatmentNode from '../components/nodes/TreatmentNode.vue'
import BiomarkerPanel from '../components/BiomarkerPanel.vue'

import { GUIDELINES, getMatchingBranches } from '../data/guidelines.js'
import { buildFlowGraph } from '../composables/useFlowGraph.js'

const props = defineProps({
  guidelineId: { type: String, required: true },
})

const profile = ref({ hrr: null, psma: null, msi: null })
const highlightBranches = ref([])
const highlightedSpecial = ref([])

const currentGuideline = computed(() => GUIDELINES[props.guidelineId] || { specialSituations: [] })

function onProfileUpdate(newProfile) {
  profile.value = newProfile
  if (!newProfile.hrr && !newProfile.psma && !newProfile.msi) {
    highlightBranches.value = []
    highlightedSpecial.value = []
    return
  }
  const result = getMatchingBranches(props.guidelineId, newProfile)
  highlightBranches.value = result.branches
  highlightedSpecial.value = result.specialSituations
}

const graphData = computed(() => buildFlowGraph(props.guidelineId, {
  highlightBranches: highlightBranches.value,
}))

const nodes = computed(() => graphData.value.nodes)
const edges = computed(() => graphData.value.edges)
</script>

<style scoped>
.detail-view {
  display: flex;
  flex: 1;
  height: 100%;
  overflow: hidden;
}
.flow-area {
  flex: 1;
  position: relative;
}
.flow-canvas {
  width: 100%;
  height: 100%;
}
</style>
