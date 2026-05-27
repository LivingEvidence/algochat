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
  EDGE_RULES,
} from './triColumn.js'

export { EDGE_RULES, TREATMENT_ITEMS, PRIOR_ITEMS, BIOMARKER_GROUPS, SPECIAL_ITEMS }

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
const COL2_W        = 280
const G3_W          = 240

const G1_X          = 40
const COL2_X        = 290
const G3_X          = 620
const TOP_Y         = 30
const COL_GAP_VERT  = 24

// ── Geometry helpers ─────────────────────────────────────────────

function subGroupHeight(sg) {
  const n = sg.items.length
  return HEADER_H_SUB + V_PAD_SUB + n * ITEM_H + (n - 1) * ITEM_GAP + V_PAD_SUB
}

function midGroupHeight(group) {
  let h = HEADER_H_MID + V_PAD_MID
  const blocks = []
  if (group.subgroup) blocks.push(subGroupHeight(group.subgroup))
  ;(group.items || []).forEach(() => blocks.push(ITEM_H))
  h += blocks.reduce((a, b) => a + b, 0) + (blocks.length - 1) * ITEM_GAP
  return h + V_PAD_MID
}

function priorGroupHeight() {
  return GRP_HEADER_H + V_PAD + PRIOR_ITEMS.length * (ITEM_H + ITEM_GAP) + V_PAD
}

function treatmentGroupHeight(items) {
  return GRP_HEADER_H + V_PAD + items.length * (ITEM_H + ITEM_GAP) + V_PAD
}

function specialGroupHeight() {
  return HEADER_H_TOP + V_PAD_TOP
    + SPECIAL_ITEMS.length * ITEM_H
    + (SPECIAL_ITEMS.length - 1) * ITEM_GAP
    + V_PAD_TOP
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

  // ─── Biomarker Assessment ───────────────────────────────────────
  // Filter docetaxel-related condition: special-situation 'Eligible for docetaxel'
  // is irrelevant when the patient already received docetaxel. We mirror the
  // All Pathways view's behavior here by hiding that node for those priors.
  const docPriors = new Set(['n1-adt-doc', 'n1-adt-arpi-doc'])
  const visibleSpecialItems = SPECIAL_ITEMS.filter(
    item => !(docPriors.has(prior) && item.id === 'n2-doc-eligible'),
  )

  // Compute biomarker group height for either layout
  const midHeights = BIOMARKER_GROUPS.map(midGroupHeight)
  const bioExpandedH = HEADER_H_TOP + V_PAD_TOP
    + midHeights.reduce((a, b) => a + b, 0)
    + (BIOMARKER_GROUPS.length - 1) * GROUP_GAP
    + V_PAD_TOP

  // Compact (Yes/No) biomarker prompt height
  const bioCompactH = HEADER_H_TOP + V_PAD_TOP
    + PROMPT_H + ITEM_GAP
    + 2 * ITEM_H + ITEM_GAP
    + V_PAD_TOP

  if (bioChoice === null) {
    // Step 1: show only the Yes/No prompt card
    nodes.push({
      id: 'g-bio', type: 'customGroup',
      position: { x: COL2_X, y: TOP_Y },
      style: { width: `${COL2_W}px`, height: `${bioCompactH}px` },
      data: { label: 'Biomarker Assessment', color: '#94a3b8', tier: 'subtle' },
      draggable: false, selectable: false, focusable: false,
    })

    nodes.push({
      id: 'bio-prompt', type: 'promptNode',
      parentNode: 'g-bio',
      position: { x: H_PAD_TOP, y: HEADER_H_TOP + V_PAD_TOP },
      style: { width: `${COL2_W - 2 * H_PAD_TOP}px` },
      data: { label: 'Has the patient taken any biomarker assessment?' },
      draggable: false, selectable: false,
    })

    const yesY = HEADER_H_TOP + V_PAD_TOP + PROMPT_H + ITEM_GAP
    nodes.push({
      id: BIO_YES_ID, type: 'condNode',
      parentNode: 'g-bio',
      position: { x: H_PAD_TOP, y: yesY },
      style: { width: `${COL2_W - 2 * H_PAD_TOP}px` },
      data: { label: 'Yes', state: 'potential', interactiveChoice: true },
      draggable: false, selectable: false,
    })
    nodes.push({
      id: BIO_NO_ID, type: 'condNode',
      parentNode: 'g-bio',
      position: { x: H_PAD_TOP, y: yesY + ITEM_H + ITEM_GAP },
      style: { width: `${COL2_W - 2 * H_PAD_TOP}px` },
      data: { label: 'No', state: 'potential', interactiveChoice: true },
      draggable: false, selectable: false,
    })

    return nodes
  }

  // bioChoice === 'yes' or 'no' → expanded layout
  let specialY = TOP_Y

  if (bioChoice === 'yes') {
    // Expanded biomarker block
    const BIO_W = COL2_W
    const MID_W = BIO_W - 2 * H_PAD_TOP
    const MID_ITEM_W = MID_W - 2 * H_PAD_MID

    nodes.push({
      id: 'g-bio', type: 'customGroup',
      position: { x: COL2_X, y: TOP_Y },
      style: { width: `${BIO_W}px`, height: `${bioExpandedH}px` },
      data: {
        label: 'Biomarker Assessment',
        color: '#94a3b8',
        tier: 'subtle',
      },
      draggable: false, selectable: false, focusable: false,
    })

    let midY = HEADER_H_TOP + V_PAD_TOP
    BIOMARKER_GROUPS.forEach((group, gi) => {
      const midH = midHeights[gi]
      const midId = `g-${group.id}`
      nodes.push({
        id: midId, type: 'customGroup',
        parentNode: 'g-bio',
        position: { x: H_PAD_TOP, y: midY },
        style: { width: `${MID_W}px`, height: `${midH}px` },
        data: { label: group.label, color: '#52796f', tier: 'mid' },
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
          nodes.push({
            id: item.id, type: 'condNode',
            parentNode: sgId,
            position: { x: H_PAD_SUB, y: HEADER_H_SUB + V_PAD_SUB + i * (ITEM_H + ITEM_GAP) },
            style: { width: `${sgItemW}px` },
            data: { label: item.label },
            draggable: false, selectable: false,
          })
        })
        innerY += sgH + ITEM_GAP
      }

      ;(group.items || []).forEach(item => {
        nodes.push({
          id: item.id, type: 'condNode',
          parentNode: midId,
          position: { x: H_PAD_MID, y: innerY },
          style: { width: `${MID_ITEM_W}px` },
          data: { label: item.label },
          draggable: false, selectable: false,
        })
        innerY += ITEM_H + ITEM_GAP
      })

      midY += midH + GROUP_GAP
    })

    specialY = TOP_Y + bioExpandedH + COL_GAP_VERT
  }

  // ─── Special Situations ────────────────────────────────────────
  const specialItemsCount = visibleSpecialItems.length
  const specialGroupH = HEADER_H_TOP + V_PAD_TOP
    + specialItemsCount * ITEM_H
    + (specialItemsCount - 1) * ITEM_GAP
    + V_PAD_TOP
  const SPECIAL_ITEM_W = COL2_W - 2 * H_PAD_TOP

  // When choice is 'no', the "Special Situations" group sits at the top
  // (where biomarker would be), preceded by a small question prompt.
  if (bioChoice === 'no') {
    // small prompt above the special situations card
    const promptHeader = PROMPT_H
    nodes.push({
      id: 'special-prompt', type: 'promptNode',
      position: { x: COL2_X, y: TOP_Y },
      style: { width: `${COL2_W}px`, height: `${promptHeader}px` },
      data: { label: 'Does the patient have any of the following situations?' },
      draggable: false, selectable: false,
    })
    specialY = TOP_Y + promptHeader + COL_GAP_VERT / 2
  }

  nodes.push({
    id: 'g-special', type: 'customGroup',
    position: { x: COL2_X, y: specialY },
    style: { width: `${COL2_W}px`, height: `${specialGroupH}px` },
    data: { label: 'Special Situations', color: '#94a3b8', tier: 'subtle' },
    draggable: false, selectable: false, focusable: false,
  })
  visibleSpecialItems.forEach((item, i) => {
    nodes.push({
      id: item.id, type: 'condNode',
      parentNode: 'g-special',
      position: { x: H_PAD_TOP, y: HEADER_H_TOP + V_PAD_TOP + i * (ITEM_H + ITEM_GAP) },
      style: { width: `${SPECIAL_ITEM_W}px` },
      data: { label: item.label },
      draggable: false, selectable: false,
    })
  })

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

  // Vertically align treatments roughly with the biomarker section's center
  const treatmentsAreaH =
    (bioChoice === 'yes'
      ? bioExpandedH + COL_GAP_VERT + specialGroupH
      : specialGroupH + PROMPT_H + COL_GAP_VERT / 2)
  const g3Y = TOP_Y + Math.max(0, (treatmentsAreaH - g3H) / 2)

  nodes.push({
    id: 'g3', type: 'customGroup',
    position: { x: G3_X, y: g3Y },
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
