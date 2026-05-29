// Interactive Algorithm — step-by-step node builder.
//
// This module is dedicated to the Interactive Algorithm view. It reuses the
// raw clinical data (prior treatments, biomarkers, special situations,
// treatment options, edge rules) from triColumn.js but builds a different
// set of VueFlow nodes depending on the current workflow step.
//
// State shape:
//   {
//     prior:      string | null    // prior treatment node id (n1-*)
//     bioChoice:  'yes' | 'no' | null
//     condIds:    Set<string>      // user-confirmed condition ids
//   }

import {
  PRIOR_ITEMS,
  BIOMARKER_GROUPS,
  SPECIAL_ITEMS,
  TREATMENT_ITEMS,
  EDGE_RULES as BASE_EDGE_RULES,
  specialItemsForPrior,
} from './triColumn.js'

export { TREATMENT_ITEMS, PRIOR_ITEMS, BIOMARKER_GROUPS, SPECIAL_ITEMS }

export const DOCETAXEL_QUESTION_ID = 'docetaxel-question'
export const DOCETAXEL_TAKEN_YES_ID = 'n2-doc-taken-yes'
export const DOCETAXEL_TAKEN_NO_ID = 'n2-doc-taken-no'
export const DOCETAXEL_TAKEN_IDS = [DOCETAXEL_TAKEN_YES_ID, DOCETAXEL_TAKEN_NO_ID]

export const EDGE_RULES = Object.fromEntries(
  Object.entries(BASE_EDGE_RULES).map(([prior, rules]) => [
    prior,
    rules.flatMap(rule => {
      if (rule.from !== 'n2-doc-yes' || rule.to !== 'n3-docetaxel') return [rule]
      return [
        { from: 'n2-doc-yes', to: DOCETAXEL_QUESTION_ID },
        { from: DOCETAXEL_TAKEN_YES_ID, to: 'n3-cabazi' },
        { from: DOCETAXEL_TAKEN_NO_ID, to: 'n3-docetaxel' },
      ]
    }),
  ]),
)

// Yes / No nodes used for the Biomarker question
export const BIO_YES_ID = 'bio-yes'
export const BIO_NO_ID  = 'bio-no'

// ── Layout constants ─────────────────────────────────────────────
const ITEM_H        = 40
const ITEM_GAP      = 6
const GROUP_GAP     = 14
const H_PAD_TOP     = 10
const H_PAD_MID     = 12
const V_PAD_TOP     = 10
const V_PAD_MID     = 10
const HEADER_H_TOP  = 30
const HEADER_H_MID  = 34
const GRP_HEADER_H  = 48
const V_PAD         = 12
const H_PAD_SUB     = 10
const HEADER_H_SUB  = 26
const V_PAD_SUB     = 8
const PROMPT_H      = 44

const G1_W          = 200
const COL2_W        = 280   // Question + Biomarker Assessment (stacked)
const BIO_QUESTION_W = 196
const SPECIAL_W     = 280
const G3_W          = 260

const G1_X          = 40
const COL2_X        = 290   // Question + Biomarker column
const SPECIAL_X     = 580   // Special Situations column
const G3_X          = 910   // Treatment Options column
const TOP_Y         = 30
const SPECIAL_Y     = -90
const COL_GAP_VERT  = 24
const SPECIAL_DESC_H = 28
const DOC_Q_W = 112
const DOC_Q_H = 92
const DOC_Q_X = SPECIAL_X + SPECIAL_W + 10
const DOC_Q_TREATMENT_SHIFT = 140

// All biomarker condition ids (flattened) — used to detect when the user
// has made a selection inside the biomarker assessment.
const BIOMARKER_IDS = new Set()
BIOMARKER_GROUPS.forEach(g => {
  if (g.subgroup) g.subgroup.items.forEach(i => BIOMARKER_IDS.add(i.id))
  ;(g.items || []).forEach(i => BIOMARKER_IDS.add(i.id))
})

// Mutually-exclusive selection groups inside the Biomarker Assessment.
// Choosing any id in a group deselects the others in the same group.
// Special Situations are intentionally excluded — multiple may apply.
export const BIOMARKER_MUTEX_GROUPS = {
  hrr:  ['n2-hrr-pos', 'n2-brca', 'n2-non-brca', 'n2-hrr-neg'],
  psma: ['n2-psma-pos', 'n2-psma-neg'],
  msi:  ['n2-msi-present', 'n2-msi-absent'],
}

// Special-situation sub-groups (e.g., Docetaxel eligibility) that are
// also single-select within their group.
const SPECIAL_MUTEX_GROUPS = {
  'sg-doc-elig': ['n2-doc-yes', 'n2-doc-no', 'n2-caba-yes'],
  'docetaxel-taken': DOCETAXEL_TAKEN_IDS,
}

export const BIOMARKER_MUTEX_BY_ID = {}
Object.values(BIOMARKER_MUTEX_GROUPS).forEach(group => {
  group.forEach(id => { BIOMARKER_MUTEX_BY_ID[id] = group })
})
Object.values(SPECIAL_MUTEX_GROUPS).forEach(group => {
  group.forEach(id => { BIOMARKER_MUTEX_BY_ID[id] = group })
})

// Biomarker ids that should never drive a treatment recommendation
// (negative / absent findings are informational only).
export const NON_RECOMMENDING_COND_IDS = new Set([
  'n2-hrr-neg',
  'n2-psma-neg',
  'n2-msi-absent',
])

// Reference content surfaced in the right-hand panel when a Biomarker
// Assessment node is clicked. Every node inside a testing group opens the
// same testing-level summary — e.g. "HRR positive" and "HRR negative" both
// open the HRR Testing panel; likewise for PSMA and MSI-H / dMMR.
export const BIOMARKER_INFO = {
  hrr: {
    title: 'HRR Testing',
    summary: 'Homologous recombination repair gene testing',
    paragraphs: [
      'Germline and somatic testing for alterations in homologous recombination repair (HRR) genes, including BRCA1 and BRCA2. A positive result identifies candidates for PARP inhibitor–based therapy.',
    ],
    points: [
      'BRCA1/2 alterations carry the strongest PARP inhibitor benefit.',
      'Non-BRCA HRR alterations may also confer sensitivity.',
      'HRR-negative disease is directed toward AR pathway inhibitors, chemotherapy, or radiopharmaceuticals.',
    ],
  },
  psma: {
    title: 'PSMA Testing',
    summary: 'Prostate-specific membrane antigen PET imaging',
    paragraphs: [
      'PSMA PET imaging establishes the PSMA avidity of metastatic lesions. Sufficient uptake identifies candidates for ¹⁷⁷Lu-PSMA-617 radioligand therapy.',
    ],
    points: [
      'PSMA-positive disease supports ¹⁷⁷Lu-PSMA-617 radioligand therapy.',
      'PSMA-negative disease does not support PSMA-targeted radioligand therapy.',
    ],
  },
  msi: {
    title: 'MSI-H / dMMR Testing',
    summary: 'Microsatellite instability / mismatch repair status',
    paragraphs: [
      'Testing for microsatellite instability–high (MSI-H) or mismatch repair deficiency (dMMR). A positive result identifies candidates for immune checkpoint inhibition.',
    ],
    points: [
      'MSI-H / dMMR present supports pembrolizumab.',
      'MSI-H / dMMR absent does not support checkpoint inhibitor therapy on this basis.',
    ],
  },
}

// Reverse map: every biomarker condition node id → its testing-group key,
// so a click on any node opens the shared testing-level panel.
export const BIOMARKER_INFO_BY_ID = {}
Object.entries(BIOMARKER_MUTEX_GROUPS).forEach(([key, ids]) => {
  ids.forEach(id => { BIOMARKER_INFO_BY_ID[id] = key })
})

// Reference content surfaced in the right-hand panel when a Special
// Situation node is clicked. Standalone scenarios each have their own entry;
// the chemotherapy-eligibility options share one panel, as do the prior
// Docetaxel-exposure answers.
export const SPECIAL_INFO = {
  oligo: {
    title: 'Oligometastatic Disease',
    summary: 'Limited-volume metastatic disease',
    paragraphs: [
      'A small number of metastatic lesions where metastasis-directed therapy may be considered alongside systemic treatment.',
    ],
    points: [
      'Radiation or surgery may target individual lesions.',
      'Typically combined with continued systemic therapy.',
    ],
  },
  indolent: {
    title: 'Indolent Disease',
    summary: 'Slowly progressing, low-symptom disease',
    paragraphs: [
      'Asymptomatic or minimally symptomatic disease with a slow pace of progression, where less intensive options may be appropriate.',
    ],
    points: [
      'Sipuleucel-T may be considered for asymptomatic or minimally symptomatic disease.',
    ],
  },
  bone: {
    title: 'Bone-Predominant, Symptomatic Disease',
    summary: 'Symptomatic bone metastases without visceral disease',
    paragraphs: [
      'Symptomatic disease predominantly involving bone, without visceral metastases, where bone-targeted radiopharmaceuticals are an option.',
    ],
    points: [
      'Radium-223 is indicated for symptomatic bone metastases.',
      'Not appropriate when visceral metastases are present.',
    ],
  },
  chemo: {
    title: 'Chemotherapy Eligibility',
    summary: 'Fitness for taxane chemotherapy',
    paragraphs: [
      'Assessment of whether the patient can tolerate taxane chemotherapy. Eligibility guides the choice between docetaxel, cabazitaxel, or non-chemotherapy options.',
    ],
    points: [
      'Docetaxel-eligible patients may receive docetaxel.',
      'Docetaxel-ineligible patients (e.g., neuropathy) may be directed to cabazitaxel.',
    ],
  },
  docetaxelTaken: {
    title: 'Prior Docetaxel Exposure',
    summary: 'Whether the patient has already received docetaxel',
    paragraphs: [
      'Prior docetaxel exposure narrows the subsequent taxane choice — patients who have already received docetaxel are typically directed to cabazitaxel.',
    ],
    points: [
      'No prior docetaxel: docetaxel remains an option.',
      'Prior docetaxel: cabazitaxel is the preferred taxane.',
    ],
  },
}

// Reverse map: every special-situation node id → its info key.
export const SPECIAL_INFO_BY_ID = {
  'n2-oligo': 'oligo',
  'n2-indolent': 'indolent',
  'n2-bone': 'bone',
  'n2-doc-yes': 'chemo',
  'n2-doc-no': 'chemo',
  'n2-caba-yes': 'chemo',
  [DOCETAXEL_TAKEN_YES_ID]: 'docetaxelTaken',
  [DOCETAXEL_TAKEN_NO_ID]: 'docetaxelTaken',
}

// Living-guideline page opened from a treatment's pathway note.
export const GUIDELINE_URL =
  'https://staging.lisr.org/living-guidelines/52?projectId=52&guidelineId=2&title=mCRPC%20Guideline&projectName=52&versionId=20'

// General evidence summary shown for each treatment option in the right panel.
export const TREATMENT_INFO = {
  'n3-rt-surgery':  'Local therapy — radiation or surgery directed at a limited number of disease sites, generally alongside continued systemic treatment.',
  'n3-sipuleucel':  'Sipuleucel-T is an autologous cellular immunotherapy option for asymptomatic or minimally symptomatic disease.',
  'n3-ra223':       'Radium-223 is a bone-seeking radiopharmaceutical for symptomatic bone metastases without visceral disease.',
  'n3-docetaxel':   'Docetaxel is a taxane chemotherapy and a standard systemic option in mCRPC.',
  'n3-cabazi':      'Cabazitaxel is a taxane chemotherapy, typically used after prior docetaxel.',
  'n3-talazo-enza': 'Talazoparib (a PARP inhibitor) combined with enzalutamide (an AR pathway inhibitor) for HRR-altered disease.',
  'n3-olapa-abi':   'Olaparib (a PARP inhibitor) combined with abiraterone plus prednisone (an AR pathway inhibitor regimen).',
  'n3-nira-abi':    'Niraparib (a PARP inhibitor) combined with abiraterone plus prednisone (an AR pathway inhibitor regimen).',
  'n3-olaparib':    'Olaparib is a PARP inhibitor used as monotherapy in HRR-altered disease.',
  'n3-abi-pred':    'Abiraterone acetate plus prednisone is an AR pathway inhibitor regimen.',
  'n3-enza':        'Enzalutamide is an AR pathway inhibitor.',
  'n3-ra223-enza':  'Radium-223 combined with enzalutamide, pairing a bone-targeted radiopharmaceutical with an AR pathway inhibitor.',
  'n3-lu-psma':     '¹⁷⁷Lu-PSMA-617 is a PSMA-targeted radioligand therapy for PSMA-positive disease.',
  'n3-pembro':      'Pembrolizumab is an immune checkpoint inhibitor for MSI-H / dMMR disease.',
}

// Population label per biomarker / special situation (prior-independent).
// Used to phrase a treatment's pathway note.
const PATHWAY_POPULATION = {
  'n2-brca':          'Patients with BRCA1/2 alterations',
  'n2-non-brca':      'Patients with non-BRCA HRR alterations',
  'n2-hrr-pos':       'Patients with HRR alterations',
  'n2-psma-pos':      'Patients with PSMA-positive disease',
  'n2-msi-present':   'Patients with MSI-H / dMMR disease',
  'n2-oligo':         'Patients with oligometastatic disease',
  'n2-indolent':      'Patients with indolent disease',
  'n2-bone':          'Patients with symptomatic bone-predominant disease',
  'n2-doc-no':        'Patients ineligible for docetaxel',
  'n2-caba-yes':      'Patients eligible for cabazitaxel',
  [DOCETAXEL_TAKEN_YES_ID]: 'Patients with prior docetaxel exposure',
  [DOCETAXEL_TAKEN_NO_ID]:  'Patients without prior docetaxel exposure',
}

// Guideline question number per (prior treatment → condition). The number
// changes with the prior even for the same biomarker — e.g. BRCA1/2 maps to
// 1.1 after ADT only but 3.1 after ADT + Docetaxel. Only those two are
// confirmed; fill in the remaining cells as the guideline numbering is
// finalized. A condition with no number here renders a population-only note.
const PATHWAY_QUESTION = {
  'n1-adt':          { 
    'n2-brca': '1.1', 
    'n2-non-brca': '1.2',
    'n2-bone': '1.4',
    'n2-msi-present': '1.5',
    'n2-indolent': '1.6',
    'n2-oligo': '1.7',
  },
  'n1-adt-doc':      { 'n2-brca': '3.1', 'n2-non-brca': '3.2' },
  'n1-adt-arpi':     { 'n2-hrr-pos': '2.1 and 2.2' },
  'n1-adt-arpi-doc': {},
}

// Resolve the pathway note for a (prior, condition) pair. Returns the phrase
// that follows "...suggested in the guideline " plus the outbound link, or
// null when the condition has no associated population.
export function pathwayNoteFor(prior, condId) {
  const population = PATHWAY_POPULATION[condId]
  if (!population) return null
  const question = PATHWAY_QUESTION[prior]?.[condId]
  const text = question
    ? `question ${question} — ${population}`
    : `for ${population[0].toLowerCase()}${population.slice(1)}`
  return { text, link: GUIDELINE_URL }
}

// ── Geometry helpers ─────────────────────────────────────────────

function subGroupHeight(sg) {
  const n = sg.items.length
  return HEADER_H_SUB + V_PAD_SUB
    + sg.items.reduce((sum, item) => sum + condItemHeight(item), 0)
    + (n - 1) * ITEM_GAP
    + V_PAD_SUB
}

function condItemHeight(item) {
  return item.helperText ? 58 : ITEM_H
}

function midGroupHeight(group) {
  let h = HEADER_H_MID + V_PAD_MID
  const blocks = []
  if (group.subgroup) blocks.push(subGroupHeight(group.subgroup))
  ;(group.items || []).forEach(item => blocks.push(condItemHeight(item)))
  h += blocks.reduce((a, b) => a + b, 0) + (blocks.length - 1) * ITEM_GAP
  return h + V_PAD_MID
}

function priorGroupHeight() {
  return GRP_HEADER_H + V_PAD + PRIOR_ITEMS.length * (ITEM_H + ITEM_GAP) + V_PAD
}

function treatmentGroupHeight(items) {
  return GRP_HEADER_H + V_PAD + items.length * (ITEM_H + ITEM_GAP) + V_PAD
}

// Per-item height inside the Special Situations group. Sub-grouped items
// (e.g., Docetaxel eligibility with Eligible / Ineligible) need extra
// vertical space for their internal header + child rows.
const DOC_ELIG_TOP_GAP = -10
const DOC_ELIG_GROUP_TOP_GAP = 12
const DOC_ELIG_H = 34
const DOC_INELIG_H = 58
const SPECIAL_WRAPPED_ITEM_H = 52

function specialItemHeight(item) {
  if (item.items) {
    const childHeights = item.items.map(sub =>
      sub.id === 'n2-doc-no' ? DOC_INELIG_H : DOC_ELIG_H
    )
    const childrenH = childHeights.reduce((sum, height) => sum + height, 0)
    const gapsH = Math.max(0, item.items.length - 1) * ITEM_GAP
    return HEADER_H_SUB + V_PAD_SUB
      + DOC_ELIG_TOP_GAP + childrenH + gapsH
      + V_PAD_SUB
  }
  if (item.id === 'n2-bone') return SPECIAL_WRAPPED_ITEM_H
  return ITEM_H
}

function specialGroupHeight(items) {
  let h = HEADER_H_MID + SPECIAL_DESC_H
  items.forEach((it, i) => {
    if (it.items) h += DOC_ELIG_GROUP_TOP_GAP
    h += specialItemHeight(it)
    if (i < items.length - 1) h += ITEM_GAP
  })
  return h + V_PAD_MID
}

// ── Builder ──────────────────────────────────────────────────────

export function buildInteractiveNodes(state) {
  const { prior, bioChoice, condIds } = state
  const nodes = []

  // ─── Prior Treatment (always visible) ───────────────────────────
  const g1H = priorGroupHeight()
  nodes.push({
    id: 'g1', type: 'customGroup',
    position: { x: G1_X, y: TOP_Y },
    style: { width: `${G1_W}px`, height: `${g1H}px` },
    data: { label: 'Prior Treatment', num: '', color: '#c8956c' },
    draggable: false, selectable: false, focusable: false,
  })
  PRIOR_ITEMS.forEach((item, i) => {
    nodes.push({
      id: item.id, type: 'priorNode',
      parentNode: 'g1',
      position: { x: 10, y: GRP_HEADER_H + V_PAD + i * (ITEM_H + ITEM_GAP) },
      style: { width: `${G1_W - 20}px` },
      data: { label: item.label, selected: item.id === prior },
      draggable: false, selectable: false,
    })
  })

  // No prior selected → stop here.
  if (!prior) return nodes

  // ─── Biomarker Question — minimal standalone card ───────────────
  // Always visible once a prior treatment has been chosen.
  const questionCardH = 132
  nodes.push({
    id: 'bio-question', type: 'bioQuestionNode',
    position: { x: COL2_X + (COL2_W - BIO_QUESTION_W) / 2, y: TOP_Y },
    style: { width: `${BIO_QUESTION_W}px` },
    data: {
      label: 'Has the patient taken any biomarker assessment?',
      choice: bioChoice,
    },
    draggable: false, selectable: false,
  })

  if (bioChoice === null) return nodes

  // ─── Biomarker Assessment (only when 'yes') ─────────────────────
  const visibleSpecialItems = specialItemsForPrior(prior)

  // Customize HRR Testing items based on prior treatment. The nested
  // "HRR Positive" subgroup is flattened — we either expose the
  // BRCA / non-BRCA split (post-ADT) or just a single HRR positive row
  // (post-ARPI), since the upstream therapy already narrows the
  // clinically relevant distinctions.
  const arpiPriors = new Set(['n1-adt-arpi', 'n1-adt-arpi-doc'])
  const hrrItems = arpiPriors.has(prior)
    ? [
        {
          id: 'n2-hrr-pos',
          label: 'HRR positive',
          helperText: 'Including BRCA1 or BRCA2 positive and Non-BRCA HRR positive',
        },
        { id: 'n2-hrr-neg', label: 'HRR negative' },
      ]
    : [
        { id: 'n2-brca',     label: 'BRCA1 or BRCA2 positive' },
        { id: 'n2-non-brca', label: 'Non-BRCA HRR positive' },
        { id: 'n2-hrr-neg',  label: 'HRR negative' },
      ]
  const biomarkerGroups = BIOMARKER_GROUPS.map(group =>
    group.id === 'hrr'
      ? { id: 'hrr', label: 'HRR Testing', items: hrrItems }
      : group,
  )

  const midHeights = biomarkerGroups.map(midGroupHeight)
  const bioExpandedH = HEADER_H_TOP + V_PAD_TOP
    + midHeights.reduce((a, b) => a + b, 0)
    + (biomarkerGroups.length - 1) * GROUP_GAP
    + V_PAD_TOP

  const QUESTION_TO_BIO_GAP = 72
  const bioBlockTopY = TOP_Y + questionCardH + QUESTION_TO_BIO_GAP
  let bioBottomY = TOP_Y + questionCardH

  if (bioChoice === 'yes') {
    const BIO_W = COL2_W
    const MID_W = BIO_W - 2 * H_PAD_TOP
    const MID_ITEM_W = MID_W - 2 * H_PAD_MID

    nodes.push({
      id: 'g-bio', type: 'customGroup',
      position: { x: COL2_X, y: bioBlockTopY },
      style: { width: `${BIO_W}px`, height: `${bioExpandedH}px` },
      data: {
        label: 'Biomarker Assessment',
        color: '#94a3b8',
        tier: 'subtle',
        acceptsTarget: true,
        targetPosition: 'top',
      },
      draggable: false, selectable: false, focusable: false,
    })

    let midY = HEADER_H_TOP + V_PAD_TOP
    biomarkerGroups.forEach((group, gi) => {
      const midH = midHeights[gi]
      const midId = `g-${group.id}`
      nodes.push({
        id: midId, type: 'customGroup',
        parentNode: 'g-bio',
        position: { x: H_PAD_TOP, y: midY },
        style: { width: `${MID_W}px`, height: `${midH}px` },
        data: {
          label: group.label,
          color: '#52796f',
          tier: 'mid',
        },
        draggable: false, selectable: false, focusable: false,
      })

      let innerY = HEADER_H_MID + V_PAD_MID

      if (group.subgroup) {
        const sg = group.subgroup
        const sgH = subGroupHeight(sg)
        const sgId = `g-${sg.id}`
        const sgItemW = MID_W - 2 * H_PAD_MID - 2 * H_PAD_SUB
        nodes.push({
          id: sgId, type: 'customGroup',
          parentNode: midId,
          position: { x: H_PAD_MID, y: innerY },
          style: { width: `${MID_W - 2 * H_PAD_MID}px`, height: `${sgH}px` },
          data: { label: sg.label, color: '#84a98c', tier: 'sub' },
          draggable: false, selectable: false, focusable: false,
        })
        sg.items.forEach((item, i) => {
          const itemY = HEADER_H_SUB + V_PAD_SUB
            + sg.items.slice(0, i).reduce((sum, previous) => sum + condItemHeight(previous) + ITEM_GAP, 0)
          const itemH = condItemHeight(item)
          nodes.push({
            id: item.id, type: 'condNode',
            parentNode: sgId,
            position: { x: H_PAD_SUB, y: itemY },
            style: { width: `${sgItemW}px`, height: `${itemH}px` },
            data: {
              label: item.label,
              helperText: item.helperText,
              selectable: true,
              noTargetHandle: true,
              noSourceHandle: NON_RECOMMENDING_COND_IDS.has(item.id),
            },
            draggable: false, selectable: false,
          })
        })
        innerY += sgH + ITEM_GAP
      }

      ;(group.items || []).forEach(item => {
        const itemH = condItemHeight(item)
        nodes.push({
          id: item.id, type: 'condNode',
          parentNode: midId,
          position: { x: H_PAD_MID, y: innerY },
          style: { width: `${MID_ITEM_W}px`, height: `${itemH}px` },
          data: {
            label: item.label,
            helperText: item.helperText,
            selectable: true,
            noTargetHandle: true,
            noSourceHandle: NON_RECOMMENDING_COND_IDS.has(item.id),
          },
          draggable: false, selectable: false,
        })
        innerY += itemH + ITEM_GAP
      })

      midY += midH + GROUP_GAP
    })

    bioBottomY = bioBlockTopY + bioExpandedH
  }

  // ─── Special Situations ────────────────────────────────────────
  // Shown when:
  //   • bioChoice === 'no', OR
  //   • bioChoice === 'yes' AND user has selected at least one item
  //     inside the biomarker assessment.
  const hasBiomarkerSelection = condIds
    && [...condIds].some(id => BIOMARKER_IDS.has(id))
  const showSpecial = bioChoice === 'no'
    || (bioChoice === 'yes' && hasBiomarkerSelection)

  const specialGroupH = specialGroupHeight(visibleSpecialItems)
  const SPECIAL_ITEM_W = SPECIAL_W - 2 * H_PAD_MID
  const SPECIAL_COLOR  = '#8b5cf6'
  let docEligibleY = null

  if (showSpecial) {
    nodes.push({
      id: 'g-special', type: 'customGroup',
      position: { x: SPECIAL_X, y: SPECIAL_Y },
      style: { width: `${SPECIAL_W}px`, height: `${specialGroupH}px` },
      data: {
        label: 'Special Situations',
        color: SPECIAL_COLOR,
        tier: 'mid',
        acceptsTarget: true,
        targetPosition: 'left',
        description: 'Select any scenarios that apply to this case.',
      },
      draggable: false, selectable: false, focusable: false,
    })
    let specialY = HEADER_H_MID + SPECIAL_DESC_H
    visibleSpecialItems.forEach(item => {
      if (item.items) {
        // ── Sub-grouped special situation (Docetaxel eligibility) ──
        specialY += DOC_ELIG_GROUP_TOP_GAP
        const sgH = specialItemHeight(item)
        const sgItemW = SPECIAL_ITEM_W - 2 * H_PAD_SUB
        nodes.push({
          id: `g-${item.id}`, type: 'customGroup',
          parentNode: 'g-special',
          position: { x: H_PAD_MID, y: specialY },
          style: { width: `${SPECIAL_ITEM_W}px`, height: `${sgH}px` },
          data: { label: item.label, color: SPECIAL_COLOR, tier: 'sub' },
          draggable: false, selectable: false, focusable: false,
        })
        let innerY = HEADER_H_SUB + V_PAD_SUB + DOC_ELIG_TOP_GAP
        item.items.forEach(sub => {
          const subH = sub.id === 'n2-doc-no' ? DOC_INELIG_H : DOC_ELIG_H
          if (sub.id === 'n2-doc-yes') {
            docEligibleY = SPECIAL_Y + specialY + innerY
          }
          nodes.push({
            id: sub.id, type: 'condNode',
            parentNode: `g-${item.id}`,
            position: { x: H_PAD_SUB, y: innerY },
            style: {
              width: `${sgItemW}px`,
              height: `${subH}px`,
            },
            data: { label: sub.label, accent: 'special', compact: true },
            draggable: false, selectable: false,
          })
          innerY += subH + ITEM_GAP
        })
        specialY += sgH + ITEM_GAP
      } else {
        const itemH = specialItemHeight(item)
        nodes.push({
          id: item.id, type: 'condNode',
          parentNode: 'g-special',
          position: { x: H_PAD_MID, y: specialY },
          style: { width: `${SPECIAL_ITEM_W}px`, height: `${itemH}px` },
          data: { label: item.label, accent: 'special' },
          draggable: false, selectable: false,
        })
        specialY += itemH + ITEM_GAP
      }
    })
  }

  const hasDocetaxelQuestion = condIds?.has('n2-doc-yes')

  if (hasDocetaxelQuestion) {
    const questionY = docEligibleY ?? SPECIAL_Y
    nodes.push({
      id: DOCETAXEL_QUESTION_ID,
      type: 'customGroup',
      position: { x: DOC_Q_X, y: questionY },
      style: { width: `${DOC_Q_W}px`, height: `${DOC_Q_H}px` },
      data: {
        label: 'Has the patient taken Docetaxel?',
        color: '#2563eb',
        tier: 'mid',
        compactQuestion: true,
        acceptsTarget: true,
        targetPosition: 'left',
      },
      draggable: false,
      selectable: false,
      focusable: false,
      zIndex: 20,
    })
    ;[
      { id: DOCETAXEL_TAKEN_YES_ID, label: 'Yes' },
      { id: DOCETAXEL_TAKEN_NO_ID, label: 'No' },
    ].forEach((item, i) => {
      nodes.push({
        id: item.id,
        type: 'condNode',
        parentNode: DOCETAXEL_QUESTION_ID,
        position: { x: 6, y: 38 + i * 25 },
        style: { width: `${DOC_Q_W - 12}px`, height: '22px' },
        data: { label: item.label, selectable: true, accent: 'special', compact: true, tight: true },
        draggable: false,
        selectable: false,
        zIndex: 21,
      })
    })
  }

  // ─── Treatment Options ─────────────────────────────────────────
  // Show only after the user has selected at least one biomarker / special
  // situation node so the workflow stays guided.
  const hasCondSelection = condIds && condIds.size > 0
  if (!hasCondSelection) return nodes

  // Filter treatments visible — only those reachable from current prior
  const rules = EDGE_RULES[prior] || []
  const reachableTreatIds = new Set(rules.map(r => r.to))
  const visibleTreatments = TREATMENT_ITEMS.filter(t => reachableTreatIds.has(t.id))
  const g3H = treatmentGroupHeight(visibleTreatments)

  // Vertically center treatments against the tallest column to the left
  const leftMaxY = Math.max(
    bioBottomY,
    showSpecial ? SPECIAL_Y + specialGroupH : TOP_Y,
    hasDocetaxelQuestion ? (docEligibleY ?? SPECIAL_Y) + DOC_Q_H : TOP_Y,
  )
  const treatmentsAreaH = leftMaxY - TOP_Y
  const g3Y = TOP_Y + Math.max(0, (treatmentsAreaH - g3H) / 2)
  const g3X = hasDocetaxelQuestion ? G3_X + DOC_Q_TREATMENT_SHIFT : G3_X

  nodes.push({
    id: 'g3', type: 'customGroup',
    position: { x: g3X, y: g3Y },
    style: { width: `${G3_W}px`, height: `${g3H}px` },
    data: { label: 'Treatment Options', num: '', color: '#1e3a5f' },
    draggable: false, selectable: false, focusable: false,
  })
  visibleTreatments.forEach((item, i) => {
    nodes.push({
      id: item.id, type: 'treatNode',
      parentNode: 'g3',
      position: { x: 10, y: GRP_HEADER_H + V_PAD + i * (ITEM_H + ITEM_GAP) },
      style: { width: `${G3_W - 20}px` },
      data: { label: item.label, cat: item.cat },
      draggable: false, selectable: false,
    })
  })

  return nodes
}
