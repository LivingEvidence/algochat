// Interactive Algorithm store — owns the step-by-step workflow state for
// the Interactive Algorithm view. Intentionally isolated from the All
// Pathways store so the two views do not share state.

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { EDGE_RULES } from '../data/triColumn.js'

// Negative / absent biomarker findings don't recommend any treatment.
const NON_RECOMMENDING_COND_IDS = new Set([
  'n2-hrr-neg',
  'n2-psma-neg',
  'n2-msi-absent',
])

export const BIO_YES_ID = 'bio-yes'
export const BIO_NO_ID  = 'bio-no'

export const useInteractiveAlgorithmStore = defineStore('interactiveAlgorithm', () => {
  // ── State ──
  const selectedPrior   = ref(null)        // priorNode id ('n1-...')
  const bioChoice       = ref(null)        // 'yes' | 'no' | null
  const selectedCondIds = ref(new Set())   // confirmed condition / special situation ids
  const selectedTreatmentId = ref(null)    // currently inspected treatment node id

  // ── Getters ──
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
      EDGE_RULES[selectedPrior.value]?.forEach(r => {
        if (!NON_RECOMMENDING_COND_IDS.has(r.from)) s.add(r.to)
      })
    }
    return s
  })

  // All condition / special-situation node ids that exist in EDGE_RULES
  const knownCondIds = computed(() => {
    const s = new Set()
    Object.values(EDGE_RULES).forEach(rules => rules.forEach(r => s.add(r.from)))
    return s
  })

  const matchedTreatIds = computed(() => {
    const s = new Set()
    if (!selectedPrior.value || selectedCondIds.value.size === 0) return s
    EDGE_RULES[selectedPrior.value]?.forEach(r => {
      if (NON_RECOMMENDING_COND_IDS.has(r.from)) return
      if (selectedCondIds.value.has(r.from)) s.add(r.to)
    })
    return s
  })

  // ── Actions ──
  function selectPrior(id) {
    if (selectedPrior.value === id) {
      selectedPrior.value = null
    } else {
      selectedPrior.value = id
    }
    // Changing or clearing prior always resets downstream choices
    bioChoice.value = null
    selectedCondIds.value = new Set()
    selectedTreatmentId.value = null
  }

  function setBioChoice(choice) {
    if (bioChoice.value === choice) return
    bioChoice.value = choice
    selectedCondIds.value = new Set()
    selectedTreatmentId.value = null
  }

  function toggleCondById(id) {
    const next = new Set(selectedCondIds.value)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    selectedCondIds.value = next
  }

  // Toggle `id`, ensuring at most one id from `siblingIds` is selected.
  // Used for mutually-exclusive biomarker groups (HRR / PSMA / MSI).
  function toggleCondExclusive(id, siblingIds) {
    const alreadyOn = selectedCondIds.value.has(id)
    const next = new Set(selectedCondIds.value)
    siblingIds.forEach(s => next.delete(s))
    if (!alreadyOn) next.add(id)
    selectedCondIds.value = next
  }

  function selectTreatment(id) {
    selectedTreatmentId.value = id
  }

  function clearTreatment() {
    selectedTreatmentId.value = null
  }

  function reset() {
    selectedPrior.value = null
    bioChoice.value = null
    selectedCondIds.value = new Set()
    selectedTreatmentId.value = null
  }

  return {
    // state
    selectedPrior,
    bioChoice,
    selectedCondIds,
    selectedTreatmentId,
    // getters
    activeCondIds,
    activeTreatIds,
    knownCondIds,
    matchedTreatIds,
    // actions
    selectPrior,
    setBioChoice,
    toggleCondById,
    toggleCondExclusive,
    selectTreatment,
    clearTreatment,
    reset,
  }
})
