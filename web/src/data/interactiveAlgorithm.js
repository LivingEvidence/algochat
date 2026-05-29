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
  specialItemsForPrior,
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
const COL2_W        = 280   // Question + Biomarker Assessment (stacked)
const SPECIAL_W     = 280
const G3_W          = 240

const G1_X          = 40
const COL2_X        = 290   // Question + Biomarker column
const SPECIAL_X     = 600   // Special Situations column
const G3_X          = 920   // Treatment Options column
const TOP_Y         = 30
const SPECIAL_Y     = -90
const COL_GAP_VERT  = 24
const SPECIAL_DESC_H = 38

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
  let h = HEADER_H_MID + SPECIAL_DESC_H + V_PAD_MID
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
  const questionCardH = 96
  nodes.push({
    id: 'bio-question', type: 'bioQuestionNode',
    position: { x: COL2_X, y: TOP_Y },
    style: { width: `${COL2_W}px` },
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
    let specialY = HEADER_H_MID + SPECIAL_DESC_H + V_PAD_MID
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
  )
  const treatmentsAreaH = leftMaxY - TOP_Y
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
