// ── Layout constants ────────────────────────────────────────────
const ITEM_H        = 40
const ITEM_GAP      = 6
const GROUP_GAP     = 14
const H_PAD_TOP     = 10
const H_PAD_MID     = 12
const V_PAD_TOP     = 10
const V_PAD_MID     = 10
const HEADER_H_TOP  = 30
const HEADER_H_MID  = 34
const GRP_HEADER_H  = 48          // for Prior Treatment / Treatment Options (legacy)
const V_PAD         = 12

// ── Source data ─────────────────────────────────────────────────

export const PRIOR_ITEMS = [
  { id: 'n1-adt',          label: 'ADT only' },
  { id: 'n1-adt-doc',      label: 'ADT + Docetaxel' },
  { id: 'n1-adt-arpi',     label: 'ADT + ARPI' },
  { id: 'n1-adt-arpi-doc', label: 'ADT + ARPI + Docetaxel' },
]

// BioMarker Assessment = HR Testing + PSMA + MSI (nested groups)
export const BIOMARKER_GROUPS = [
  {
    id: 'hrr',
    label: 'HRR Testing',
    subgroup: {
      id: 'hrr-pos',
      label: 'HRR Positive',
      items: [
        { id: 'n2-hrr-pos',  label: 'HRR positive (general)' },
        { id: 'n2-brca',     label: 'BRCA1 or BRCA2 positive' },
        { id: 'n2-non-brca', label: 'Non-BRCA HRR positive' },
      ],
    },
    items: [
      { id: 'n2-hrr-neg', label: 'HRR negative' },
    ],
  },
  {
    id: 'psma',
    label: 'PSMA Testing',
    items: [
      { id: 'n2-psma-pos', label: 'PSMA positive' },
      { id: 'n2-psma-neg', label: 'PSMA negative' },
    ],
  },
  {
    id: 'msi',
    label: 'MSI-H / dMMR',
    items: [
      { id: 'n2-msi-present', label: 'Present' },
      { id: 'n2-msi-absent',  label: 'Absent' },
    ],
  },
]

// Special situations — each becomes its own standalone node
export const SPECIAL_ITEMS = [
  { id: 'n2-oligo',    label: 'Oligometastatic disease' },
  { id: 'n2-indolent', label: 'Indolent disease' },
  { id: 'n2-bone',     label: 'Bone only, symptomatic' },
  { id: 'n2-no-doc',   label: 'Ineligible for docetaxel' },
]

export const TREATMENT_ITEMS = [
  { id: 'n3-talazo-enza', label: 'Talazoparib + enzalutamide', cat: 'parp' },
  { id: 'n3-olapa-abi',   label: 'Olaparib + abiraterone',     cat: 'parp' },
  { id: 'n3-nira-abi',    label: 'Niraparib + abiraterone',    cat: 'parp' },
  { id: 'n3-olaparib',    label: 'Olaparib',                   cat: 'parp' },
  { id: 'n3-abi-pred',    label: 'Abiraterone + prednisone',   cat: 'arpi' },
  { id: 'n3-enza',        label: 'Enzalutamide',               cat: 'arpi' },
  { id: 'n3-docetaxel',   label: 'Docetaxel',                  cat: 'chemo' },
  { id: 'n3-cabazi',      label: 'Cabazitaxel',                cat: 'chemo' },
  { id: 'n3-ra223-enza',  label: 'Radium 223 + enzalutamide',  cat: 'radio' },
  { id: 'n3-lu-psma',     label: '¹⁷⁷Lu-PSMA-617',            cat: 'targeted' },
  { id: 'n3-pembro',      label: 'Pembrolizumab',              cat: 'immuno' },
  { id: 'n3-rt-surgery',  label: 'Radiation / Surgery',        cat: 'local' },
  { id: 'n3-sipuleucel',  label: 'Sipuleucel-T',               cat: 'immuno' },
  { id: 'n3-ra223',       label: 'Radium 223',                 cat: 'radio' },
]

// ── Edge rules per prior treatment ──────────────────────────────

export const EDGE_RULES = {
  'n1-adt': [
    { from: 'n2-brca',        to: 'n3-talazo-enza' },
    { from: 'n2-brca',        to: 'n3-olapa-abi' },
    { from: 'n2-brca',        to: 'n3-nira-abi' },
    { from: 'n2-non-brca',    to: 'n3-talazo-enza' },
    { from: 'n2-hrr-neg',     to: 'n3-abi-pred' },
    { from: 'n2-hrr-neg',     to: 'n3-enza' },
    { from: 'n2-hrr-neg',     to: 'n3-docetaxel' },
    { from: 'n2-hrr-neg',     to: 'n3-ra223-enza' },
    { from: 'n2-psma-pos',    to: 'n3-lu-psma' },
    { from: 'n2-msi-present', to: 'n3-pembro' },
    { from: 'n2-oligo',       to: 'n3-rt-surgery' },
    { from: 'n2-indolent',    to: 'n3-sipuleucel' },
    { from: 'n2-bone',        to: 'n3-ra223' },
  ],
  'n1-adt-doc': [
    { from: 'n2-brca',        to: 'n3-talazo-enza' },
    { from: 'n2-brca',        to: 'n3-olapa-abi' },
    { from: 'n2-brca',        to: 'n3-nira-abi' },
    { from: 'n2-non-brca',    to: 'n3-talazo-enza' },
    { from: 'n2-hrr-neg',     to: 'n3-abi-pred' },
    { from: 'n2-hrr-neg',     to: 'n3-enza' },
    { from: 'n2-hrr-neg',     to: 'n3-cabazi' },
    { from: 'n2-hrr-neg',     to: 'n3-ra223-enza' },
    { from: 'n2-psma-pos',    to: 'n3-lu-psma' },
    { from: 'n2-msi-present', to: 'n3-pembro' },
    { from: 'n2-oligo',       to: 'n3-rt-surgery' },
    { from: 'n2-indolent',    to: 'n3-sipuleucel' },
    { from: 'n2-bone',        to: 'n3-ra223' },
  ],
  'n1-adt-arpi': [
    { from: 'n2-hrr-pos',     to: 'n3-olaparib' },
    { from: 'n2-hrr-neg',     to: 'n3-docetaxel' },
    { from: 'n2-hrr-neg',     to: 'n3-ra223' },
    { from: 'n2-psma-pos',    to: 'n3-lu-psma' },
    { from: 'n2-msi-present', to: 'n3-pembro' },
    { from: 'n2-oligo',       to: 'n3-rt-surgery' },
    { from: 'n2-indolent',    to: 'n3-sipuleucel' },
    { from: 'n2-bone',        to: 'n3-ra223' },
    { from: 'n2-no-doc',      to: 'n3-cabazi' },
  ],
  'n1-adt-arpi-doc': [
    { from: 'n2-psma-pos',    to: 'n3-lu-psma' },
    { from: 'n2-hrr-pos',     to: 'n3-olaparib' },
    { from: 'n2-hrr-neg',     to: 'n3-cabazi' },
    { from: 'n2-psma-neg',    to: 'n3-cabazi' },
    { from: 'n2-hrr-neg',     to: 'n3-ra223' },
    { from: 'n2-msi-present', to: 'n3-pembro' },
    { from: 'n2-bone',        to: 'n3-ra223' },
  ],
}

// ── Build VueFlow nodes ─────────────────────────────────────────

export function buildTriColumnNodes() {
  const nodes = []

  // ────────── Width plan ──────────
  const G1_W = 200
  const G3_W = 240

  const COL2_W = 280            // shared width for col-2 cards
  const BIO_W  = COL2_W         // BioMarker Assessment outer
  const MID_W  = BIO_W - 2 * H_PAD_TOP   // HR Testing / PSMA / MSI
  const MID_ITEM_W  = MID_W - 2 * H_PAD_MID
  const SPECIAL_W   = COL2_W

  // ────────── Height calculations ──────────
  const H_PAD_SUB = 10
  const HEADER_H_SUB = 26
  const V_PAD_SUB = 8

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

  const midHeights = BIOMARKER_GROUPS.map(midGroupHeight)
  const bioH = HEADER_H_TOP + V_PAD_TOP
    + midHeights.reduce((a, b) => a + b, 0)
    + (BIOMARKER_GROUPS.length - 1) * GROUP_GAP
    + V_PAD_TOP

  const specialGroupH = HEADER_H_TOP + V_PAD_TOP
    + SPECIAL_ITEMS.length * ITEM_H
    + (SPECIAL_ITEMS.length - 1) * ITEM_GAP
    + V_PAD_TOP
  const specialsTotalH = specialGroupH

  const g3H = GRP_HEADER_H + V_PAD
    + TREATMENT_ITEMS.length * (ITEM_H + ITEM_GAP)
    + V_PAD

  const g1H = GRP_HEADER_H + V_PAD
    + PRIOR_ITEMS.length * (ITEM_H + ITEM_GAP)
    + V_PAD

  const COL_GAP_VERT = 24
  const col2H = bioH + COL_GAP_VERT + specialsTotalH
  const maxH = Math.max(g1H, col2H, g3H)

  // ────────── Canvas X positions ──────────
  const G1_X      = 40
  const COL2_X    = 290
  const G3_X      = 620

  const G1_Y      = 30 + (maxH - g1H) / 2
  const BIO_Y     = 30
  const SPECIAL_Y = BIO_Y + bioH + COL_GAP_VERT
  const G3_Y      = 30 + (maxH - g3H) / 2

  // ──────────── Group 1: Prior Treatment ────────────
  nodes.push({
    id: 'g1', type: 'customGroup',
    position: { x: G1_X, y: G1_Y },
    style: { width: `${G1_W}px`, height: `${g1H}px` },
    data: { label: 'Prior Treatment', num: '①', color: '#c8956c' },
    draggable: false, selectable: false, focusable: false,
  })
  PRIOR_ITEMS.forEach((item, i) => {
    nodes.push({
      id: item.id, type: 'priorNode',
      parentNode: 'g1',
      position: { x: 10, y: GRP_HEADER_H + V_PAD + i * (ITEM_H + ITEM_GAP) },
      style: { width: `${G1_W - 20}px` },
      data: { label: item.label, selected: false },
      draggable: false, selectable: false,
    })
  })

  // ──────────── BioMarker Assessment (nested) ────────────
  nodes.push({
    id: 'g-bio', type: 'customGroup',
    position: { x: COL2_X, y: BIO_Y },
    style: { width: `${BIO_W}px`, height: `${bioH}px` },
    data: { label: 'BioMarker Assessment', color: '#94a3b8', tier: 'subtle' },
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
          data: { label: item.label, active: false, dimmed: false },
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
        data: { label: item.label, active: false, dimmed: false },
        draggable: false, selectable: false,
      })
      innerY += ITEM_H + ITEM_GAP
    })

    midY += midH + GROUP_GAP
  })

  // ──────────── Special Situations (one subtle group) ────────────
  const SPECIAL_ITEM_W = COL2_W - 2 * H_PAD_TOP
  nodes.push({
    id: 'g-special', type: 'customGroup',
    position: { x: COL2_X, y: SPECIAL_Y },
    style: { width: `${COL2_W}px`, height: `${specialGroupH}px` },
    data: { label: 'Special Situations', color: '#94a3b8', tier: 'subtle' },
    draggable: false, selectable: false, focusable: false,
  })
  SPECIAL_ITEMS.forEach((item, i) => {
    nodes.push({
      id: item.id, type: 'condNode',
      parentNode: 'g-special',
      position: { x: H_PAD_TOP, y: HEADER_H_TOP + V_PAD_TOP + i * (ITEM_H + ITEM_GAP) },
      style: { width: `${SPECIAL_ITEM_W}px` },
      data: { label: item.label, active: false, dimmed: false },
      draggable: false, selectable: false,
    })
  })

  // ──────────── Group 3: Treatment Options ────────────
  nodes.push({
    id: 'g3', type: 'customGroup',
    position: { x: G3_X, y: G3_Y },
    style: { width: `${G3_W}px`, height: `${g3H}px` },
    data: { label: 'Treatment Options', num: '③', color: '#1e3a5f' },
    draggable: false, selectable: false, focusable: false,
  })
  TREATMENT_ITEMS.forEach((item, i) => {
    nodes.push({
      id: item.id, type: 'treatNode',
      parentNode: 'g3',
      position: { x: 10, y: GRP_HEADER_H + V_PAD + i * (ITEM_H + ITEM_GAP) },
      style: { width: `${G3_W - 20}px` },
      data: { label: item.label, cat: item.cat, active: false, dimmed: false },
      draggable: false, selectable: false,
    })
  })

  return nodes
}
