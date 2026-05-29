// Interactive Algorithm store — owns the step-by-step workflow state for
// the Interactive Algorithm view. Intentionally isolated from the All
// Pathways store so the two views do not share state.

import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import {
  BIOMARKER_GROUPS,
  DOCETAXEL_TAKEN_IDS,
  EDGE_RULES,
  PRIOR_ITEMS,
  SPECIAL_ITEMS,
  TREATMENT_ITEMS,
} from '../data/interactiveAlgorithm.js'

// Negative / absent biomarker findings don't recommend any treatment.
const NON_RECOMMENDING_COND_IDS = new Set([
  'n2-hrr-neg',
  'n2-psma-neg',
  'n2-msi-absent',
])

export const BIO_YES_ID = 'bio-yes'
export const BIO_NO_ID  = 'bio-no'

const SAVED_PROFILES_KEY = 'mcrpc_interactive_saved_profiles'
const MAX_SAVED_PROFILES = 10

const PRIOR_LABELS = Object.fromEntries(PRIOR_ITEMS.map(item => [item.id, item.label]))
const TREATMENT_LABELS = Object.fromEntries(TREATMENT_ITEMS.map(item => [item.id, item.label]))

const COND_LABELS = {
  'n2-hrr-pos': 'HRR+',
  'n2-brca': 'BRCA1/2+',
  'n2-non-brca': 'Non-BRCA HRR+',
  'n2-hrr-neg': 'HRR-',
  'n2-psma-pos': 'PSMA+',
  'n2-psma-neg': 'PSMA-',
  'n2-msi-present': 'MSI-H / dMMR present',
  'n2-msi-absent': 'MSI-H / dMMR absent',
  'n2-doc-taken-yes': 'Taken Docetaxel: Yes',
  'n2-doc-taken-no': 'Taken Docetaxel: No',
}

SPECIAL_ITEMS.forEach(item => {
  if (item.items) {
    item.items.forEach(sub => { COND_LABELS[sub.id] = sub.label })
  } else {
    COND_LABELS[item.id] = item.label
  }
})

const BIOMARKER_IDS = new Set()
BIOMARKER_GROUPS.forEach(group => {
  group.subgroup?.items?.forEach(item => BIOMARKER_IDS.add(item.id))
  group.items?.forEach(item => BIOMARKER_IDS.add(item.id))
})

const SPECIAL_IDS = new Set()
SPECIAL_ITEMS.forEach(item => {
  if (item.items) item.items.forEach(sub => SPECIAL_IDS.add(sub.id))
  else SPECIAL_IDS.add(item.id)
})

function orderedConditionLabels(selected, acceptedIds) {
  const labels = []
  BIOMARKER_GROUPS.forEach(group => {
    group.subgroup?.items?.forEach(item => {
      if (acceptedIds.has(item.id) && selected.has(item.id)) labels.push(COND_LABELS[item.id] || item.label)
    })
    group.items?.forEach(item => {
      if (acceptedIds.has(item.id) && selected.has(item.id)) labels.push(COND_LABELS[item.id] || item.label)
    })
  })
  SPECIAL_ITEMS.forEach(item => {
    if (item.items) {
      item.items.forEach(sub => {
        if (acceptedIds.has(sub.id) && selected.has(sub.id)) labels.push(COND_LABELS[sub.id] || sub.label)
      })
    } else if (acceptedIds.has(item.id) && selected.has(item.id)) {
      labels.push(COND_LABELS[item.id] || item.label)
    }
  })
  return labels
}

function normalizeSnapshot(snapshot = {}) {
  const condIds = Array.isArray(snapshot.selectedCondIds)
    ? snapshot.selectedCondIds
    : Array.isArray(snapshot.condIds)
      ? snapshot.condIds
      : []
  return {
    selectedPrior: typeof snapshot.selectedPrior === 'string' ? snapshot.selectedPrior : null,
    bioChoice: snapshot.bioChoice === 'yes' || snapshot.bioChoice === 'no' ? snapshot.bioChoice : null,
    selectedCondIds: condIds.filter(id => typeof id === 'string'),
    selectedTreatmentId: typeof snapshot.selectedTreatmentId === 'string' ? snapshot.selectedTreatmentId : null,
  }
}

function normalizeSavedProfile(entry) {
  const snapshot = normalizeSnapshot(entry?.snapshot)
  const label = typeof entry?.label === 'string' && entry.label.trim()
    ? entry.label.trim()
    : summarizePathway(snapshot)
  return {
    id: entry?.id || Date.now(),
    label,
    snapshot,
  }
}

function loadInitialSavedProfiles() {
  try {
    const raw = localStorage.getItem(SAVED_PROFILES_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.map(normalizeSavedProfile) : []
  } catch {
    return []
  }
}

export function summarizePathway(snapshot) {
  const s = normalizeSnapshot(snapshot)
  const parts = []
  if (s.selectedPrior) parts.push(PRIOR_LABELS[s.selectedPrior] || s.selectedPrior)
  if (s.bioChoice === 'no') {
    parts.push('No Biomarker Assessment')
  } else if (s.bioChoice === 'yes') {
    const selected = new Set(s.selectedCondIds)
    const orderedIds = []
    BIOMARKER_GROUPS.forEach(group => {
      group.subgroup?.items?.forEach(item => orderedIds.push(item.id))
      group.items?.forEach(item => orderedIds.push(item.id))
    })
    SPECIAL_ITEMS.forEach(item => {
      if (item.items) item.items.forEach(sub => orderedIds.push(sub.id))
      else orderedIds.push(item.id)
    })
    orderedIds.forEach(id => {
      if (selected.has(id)) parts.push(COND_LABELS[id] || id)
    })
  }
  return parts.join('; ') || 'Untitled Profile'
}

export function describePathway(snapshot) {
  const s = normalizeSnapshot(snapshot)
  const selected = new Set(s.selectedCondIds)
  const treatmentIds = []
  if (s.selectedPrior) {
    EDGE_RULES[s.selectedPrior]?.forEach(rule => {
      if (NON_RECOMMENDING_COND_IDS.has(rule.from)) return
      if (selected.has(rule.from) && !treatmentIds.includes(rule.to)) treatmentIds.push(rule.to)
    })
  }

  return {
    prior: s.selectedPrior ? PRIOR_LABELS[s.selectedPrior] || s.selectedPrior : 'Not selected',
    biomarkers: s.bioChoice === 'no'
      ? ['No Biomarker Assessment']
      : orderedConditionLabels(selected, BIOMARKER_IDS),
    specialSituations: orderedConditionLabels(selected, SPECIAL_IDS),
    treatmentOptions: treatmentIds.map(id => TREATMENT_LABELS[id] || id),
  }
}

export const useInteractiveAlgorithmStore = defineStore('interactiveAlgorithm', () => {
  // ── State ──
  const selectedPrior   = ref(null)        // priorNode id ('n1-...')
  const bioChoice       = ref(null)        // 'yes' | 'no' | null
  const selectedCondIds = ref(new Set())   // confirmed condition / special situation ids
  const selectedTreatmentId = ref(null)    // currently inspected treatment node id
  const savedProfiles = ref(loadInitialSavedProfiles())

  watch(savedProfiles, value => {
    try { localStorage.setItem(SAVED_PROFILES_KEY, JSON.stringify(value)) } catch {}
  }, { deep: true })

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

  const currentSnapshot = computed(() => ({
    selectedPrior: selectedPrior.value,
    bioChoice: bioChoice.value,
    selectedCondIds: [...selectedCondIds.value],
    selectedTreatmentId: selectedTreatmentId.value,
  }))

  const currentPathwayName = computed(() => summarizePathway(currentSnapshot.value))

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
    if (next.has(id)) {
      next.delete(id)
      if (id === 'n2-doc-yes') DOCETAXEL_TAKEN_IDS.forEach(answerId => next.delete(answerId))
    } else {
      next.add(id)
    }
    selectedCondIds.value = next
  }

  // Toggle `id`, ensuring at most one id from `siblingIds` is selected.
  // Used for mutually-exclusive biomarker groups (HRR / PSMA / MSI).
  function toggleCondExclusive(id, siblingIds) {
    const alreadyOn = selectedCondIds.value.has(id)
    const next = new Set(selectedCondIds.value)
    siblingIds.forEach(s => next.delete(s))
    if (siblingIds.includes('n2-doc-yes')) {
      DOCETAXEL_TAKEN_IDS.forEach(answerId => next.delete(answerId))
    }
    if (!alreadyOn) next.add(id)
    selectedCondIds.value = next
  }

  function selectTreatment(id) {
    selectedTreatmentId.value = id
  }

  function clearTreatment() {
    selectedTreatmentId.value = null
  }

  function saveCurrentProfile() {
    const snapshot = currentSnapshot.value
    const entry = {
      id: Date.now(),
      label: summarizePathway(snapshot),
      snapshot,
    }
    savedProfiles.value = [entry, ...savedProfiles.value].slice(0, MAX_SAVED_PROFILES)
    return entry
  }

  function loadSavedProfile(id) {
    const entry = savedProfiles.value.find(profile => profile.id === id)
    if (!entry) return
    const snapshot = normalizeSnapshot(entry.snapshot)
    applySnapshot(snapshot)
  }

  function applySnapshot(snapshot) {
    const normalized = normalizeSnapshot(snapshot)
    selectedPrior.value = normalized.selectedPrior
    bioChoice.value = normalized.bioChoice
    selectedCondIds.value = new Set(normalized.selectedCondIds)
    selectedTreatmentId.value = normalized.selectedTreatmentId
  }

  function applyVizProfile(payload = {}) {
    applySnapshot({
      selectedPrior: payload.selectedPrior,
      bioChoice: payload.bioChoice,
      selectedCondIds: payload.selectedCondIds,
      selectedTreatmentId: payload.selectedTreatmentId,
    })
  }

  function renameSavedProfile(id, label) {
    const nextLabel = label.trim()
    if (!nextLabel) return
    savedProfiles.value = savedProfiles.value.map(profile =>
      profile.id === id ? { ...profile, label: nextLabel } : profile
    )
  }

  function deleteSavedProfile(id) {
    savedProfiles.value = savedProfiles.value.filter(profile => profile.id !== id)
  }

  function clearSavedProfiles() {
    savedProfiles.value = []
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
    savedProfiles,
    // getters
    activeCondIds,
    activeTreatIds,
    knownCondIds,
    matchedTreatIds,
    currentSnapshot,
    currentPathwayName,
    // actions
    selectPrior,
    setBioChoice,
    toggleCondById,
    toggleCondExclusive,
    selectTreatment,
    clearTreatment,
    saveCurrentProfile,
    loadSavedProfile,
    applySnapshot,
    applyVizProfile,
    renameSavedProfile,
    deleteSavedProfile,
    clearSavedProfiles,
    reset,
  }
})
