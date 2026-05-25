import { ref, computed, watch } from 'vue'

const STORAGE_KEY        = 'mcrpc_patient_profile'
const SAVED_PROFILES_KEY = 'mcrpc_saved_profiles'

// ── Profile schema ───────────────────────────────────────────────
const PROFILE_DEFAULTS = {
  prior: null,        // 'adt' | 'adt_doc' | 'adt_arpi' | 'adt_arpi_doc'
  hrr: null,          // 'hrr_pos_general' | 'brca_pos' | 'non_brca_hrr_pos' | 'hrr_neg'
  psma: null,         // 'pos' | 'neg'
  msi: null,          // 'present' | 'absent'
  special: [],        // array: 'oligo' | 'indolent' | 'bone' | 'no_doc'
}

// ── Prior value → priorNode ID ───────────────────────────────────
export const PRIOR_MAP = {
  adt:          'n1-adt',
  adt_doc:      'n1-adt-doc',
  adt_arpi:     'n1-adt-arpi',
  adt_arpi_doc: 'n1-adt-arpi-doc',
}

// ── Profile value → condNode ID mapping ──────────────────────────
const PROFILE_TO_COND = {
  hrr: {
    hrr_pos_general:  'n2-hrr-pos',
    brca_pos:         'n2-brca',
    non_brca_hrr_pos: 'n2-non-brca',
    hrr_neg:          'n2-hrr-neg',
  },
  psma: {
    pos: 'n2-psma-pos',
    neg: 'n2-psma-neg',
  },
  msi: {
    present: 'n2-msi-present',
    absent:  'n2-msi-absent',
  },
  special: {
    oligo:    'n2-oligo',
    indolent: 'n2-indolent',
    bone:     'n2-bone',
    no_doc:   'n2-no-doc',
  },
}

// ── UI labels ────────────────────────────────────────────────────
export const PROFILE_OPTIONS = {
  prior: [
    { value: 'adt',          label: 'ADT only' },
    { value: 'adt_doc',      label: 'ADT + Docetaxel' },
    { value: 'adt_arpi',     label: 'ADT + ARPI' },
    { value: 'adt_arpi_doc', label: 'ADT + ARPI + Docetaxel' },
  ],
  hrr: [
    { value: 'hrr_pos_general',  label: 'HRR positive (general)',  indent: false },
    { value: 'brca_pos',         label: 'BRCA1/2 positive',        indent: true  },
    { value: 'non_brca_hrr_pos', label: 'Non-BRCA HRR positive',   indent: true  },
    { value: 'hrr_neg',          label: 'HRR negative',            indent: false },
  ],
  psma: [
    { value: 'pos', label: 'PSMA positive' },
    { value: 'neg', label: 'PSMA negative' },
  ],
  msi: [
    { value: 'present', label: 'MSI-H / dMMR present' },
    { value: 'absent',  label: 'MSI-H / dMMR absent' },
  ],
  special: [
    { value: 'oligo',    label: 'Oligometastatic disease' },
    { value: 'indolent', label: 'Indolent disease' },
    { value: 'bone',     label: 'Bone only, symptomatic' },
    { value: 'no_doc',   label: 'Ineligible for docetaxel' },
  ],
}

// ── Singleton state ──────────────────────────────────────────────
function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...PROFILE_DEFAULTS, ...JSON.parse(raw) }
  } catch {}
  return { ...PROFILE_DEFAULTS, special: [] }
}

const profile = ref(loadSaved())

watch(profile, val => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
}, { deep: true })

// ── Derived: prior node ID ───────────────────────────────────────
const selectedPriorId = computed(() =>
  profile.value.prior ? PRIOR_MAP[profile.value.prior] ?? null : null
)

// ── Derived: Set of selected condNode IDs ────────────────────────
const selectedCondIds = computed(() => {
  const ids = new Set()
  const p = profile.value
  if (p.hrr  && PROFILE_TO_COND.hrr[p.hrr])   ids.add(PROFILE_TO_COND.hrr[p.hrr])
  if (p.psma && PROFILE_TO_COND.psma[p.psma])  ids.add(PROFILE_TO_COND.psma[p.psma])
  if (p.msi  && PROFILE_TO_COND.msi[p.msi])    ids.add(PROFILE_TO_COND.msi[p.msi])
  p.special.forEach(s => {
    if (PROFILE_TO_COND.special[s]) ids.add(PROFILE_TO_COND.special[s])
  })
  return ids
})

// ── Saved profiles ───────────────────────────────────────────────
function loadSavedProfiles() {
  try {
    const raw = localStorage.getItem(SAVED_PROFILES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

const savedProfiles = ref(loadSavedProfiles())

function saveCurrentProfile(name) {
  const label = name || new Date().toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  })
  const entry = { id: Date.now(), label, snapshot: { ...profile.value, special: [...profile.value.special] } }
  savedProfiles.value = [entry, ...savedProfiles.value].slice(0, 10)
  localStorage.setItem(SAVED_PROFILES_KEY, JSON.stringify(savedProfiles.value))
}

function loadSavedProfile(id) {
  const entry = savedProfiles.value.find(p => p.id === id)
  if (entry) profile.value = { ...entry.snapshot, special: [...(entry.snapshot.special || [])] }
}

function deleteSavedProfile(id) {
  savedProfiles.value = savedProfiles.value.filter(p => p.id !== id)
  localStorage.setItem(SAVED_PROFILES_KEY, JSON.stringify(savedProfiles.value))
}

// ── Programmatic API ─────────────────────────────────────────────
function setProfile(patch) {
  profile.value = { ...profile.value, ...patch }
}

function resetProfile() {
  profile.value = { ...PROFILE_DEFAULTS, special: [] }
}

function toggleSpecial(val) {
  const arr = [...profile.value.special]
  const idx = arr.indexOf(val)
  idx === -1 ? arr.push(val) : arr.splice(idx, 1)
  profile.value = { ...profile.value, special: arr }
}

function toggleCondById(condId) {
  for (const [field, map] of Object.entries(PROFILE_TO_COND)) {
    if (field === 'special') {
      const key = Object.entries(map).find(([, v]) => v === condId)?.[0]
      if (key) { toggleSpecial(key); return }
    } else {
      const key = Object.entries(map).find(([, v]) => v === condId)?.[0]
      if (key) {
        profile.value = {
          ...profile.value,
          [field]: profile.value[field] === key ? null : key,
        }
        return
      }
    }
  }
}

export function usePatientProfile() {
  return {
    profile,
    selectedPriorId,
    selectedCondIds,
    setProfile,
    resetProfile,
    toggleCondById,
    toggleSpecial,
    savedProfiles,
    saveCurrentProfile,
    loadSavedProfile,
    deleteSavedProfile,
  }
}
