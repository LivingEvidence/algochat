// ── Layout constants ────────────────────────────────────────────
const ITEM_H       = 40
const ITEM_GAP     = 6
const SEC_LABEL_H  = 22
const GRP_HEADER_H = 48
const H_PAD        = 10
const V_PAD        = 12

// ── Source data ─────────────────────────────────────────────────

export const PRIOR_ITEMS = [
  { id: 'n1-adt',          label: 'ADT only' },
  { id: 'n1-adt-doc',      label: 'ADT + Docetaxel' },
  { id: 'n1-adt-arpi',     label: 'ADT + ARPI' },
  { id: 'n1-adt-arpi-doc', label: 'ADT + ARPI + Docetaxel' },
]

export const CONDITION_SECTIONS = [
  {
    id: 'hrr',
    label: 'HRR Testing',
    items: [
      { id: 'n2-brca',        label: 'BRCA1 or BRCA2 positive' },
      { id: 'n2-non-brca',    label: 'Non-BRCA HRR positive' },
      { id: 'n2-hrr-pos',     label: 'HRR positive' },
      { id: 'n2-hrr-neg',     label: 'HRR negative' },
    ],
  },
  {
    id: 'psma',
    label: 'PSMA Status',
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
  {
    id: 'special',
    label: 'Special Situations',
    items: [
      { id: 'n2-oligo',    label: 'Oligometastatic disease' },
      { id: 'n2-indolent', label: 'Indolent disease' },
      { id: 'n2-bone',     label: 'Bone only, symptomatic' },
      { id: 'n2-no-doc',   label: 'Ineligible for docetaxel' },
    ],
  },
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
  { id: 'n3-ra223',       label: 'Radium 223',                 cat: 'radio' },
  { id: 'n3-ra223-enza',  label: 'Radium 223 + enzalutamide',  cat: 'radio' },
  { id: 'n3-lu-psma',     label: '¹⁷⁷Lu-PSMA-617',            cat: 'targeted' },
  { id: 'n3-pembro',      label: 'Pembrolizumab',              cat: 'immuno' },
  { id: 'n3-sipuleucel',  label: 'Sipuleucel-T',               cat: 'immuno' },
  { id: 'n3-rt-surgery',  label: 'Radiation / Surgery',        cat: 'local' },
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
    { from: 'n2-msi-present',         to: 'n3-pembro' },
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
    { from: 'n2-hrr-neg',     to: 'n3-cabazi' },     // Cabazitaxel replaces Docetaxel
    { from: 'n2-hrr-neg',     to: 'n3-ra223-enza' },
    { from: 'n2-psma-pos',    to: 'n3-lu-psma' },
    { from: 'n2-msi-present',         to: 'n3-pembro' },
    { from: 'n2-oligo',       to: 'n3-rt-surgery' },
    { from: 'n2-indolent',    to: 'n3-sipuleucel' },
    { from: 'n2-bone',        to: 'n3-ra223' },
  ],
  'n1-adt-arpi': [
    { from: 'n2-hrr-pos',     to: 'n3-olaparib' },   // No BRCA split — ARPI already used
    { from: 'n2-hrr-neg',     to: 'n3-docetaxel' },
    { from: 'n2-hrr-neg',     to: 'n3-ra223' },
    { from: 'n2-psma-pos',    to: 'n3-lu-psma' },
    { from: 'n2-msi-present',         to: 'n3-pembro' },
    { from: 'n2-oligo',       to: 'n3-rt-surgery' },
    { from: 'n2-indolent',    to: 'n3-sipuleucel' },
    { from: 'n2-bone',        to: 'n3-ra223' },
    { from: 'n2-no-doc',      to: 'n3-cabazi' },
  ],
  'n1-adt-arpi-doc': [
    { from: 'n2-psma-pos',    to: 'n3-lu-psma' },
    { from: 'n2-hrr-pos',     to: 'n3-olaparib' },
    { from: 'n2-hrr-neg',     to: 'n3-cabazi' },   // HRR neg alone → Cabazitaxel
    { from: 'n2-hrr-neg',     to: 'n3-ra223' },    // HRR neg alone → Radium 223
    { from: 'n2-msi-present', to: 'n3-pembro' },
    { from: 'n2-bone',        to: 'n3-ra223' },
  ],
}

// ── Build VueFlow nodes ─────────────────────────────────────────

export function buildTriColumnNodes() {
  const nodes = []

  // ── Group 2 height (dynamic based on sections) ──
  let g2H = GRP_HEADER_H + V_PAD
  CONDITION_SECTIONS.forEach(sec => {
    g2H += SEC_LABEL_H + 6
    g2H += sec.items.length * (ITEM_H + ITEM_GAP)
    g2H += 10 // inter-section gap
  })
  g2H += V_PAD

  // ── Group 3 height ──
  const g3H = GRP_HEADER_H + V_PAD
    + TREATMENT_ITEMS.length * (ITEM_H + ITEM_GAP)
    + V_PAD

  // ── Group 1 height ──
  const g1H = GRP_HEADER_H + V_PAD
    + PRIOR_ITEMS.length * (ITEM_H + ITEM_GAP)
    + V_PAD

  const maxH = Math.max(g2H, g3H)

  // Canvas x positions
  const G1_X = 40,  G1_Y = 30 + (maxH - g1H) / 2
  const G2_X = 340, G2_Y = 30
  const G3_X = 680, G3_Y = 30

  const G1_W = 200, G2_W = 220, G3_W = 240

  // ──────────── Group 1 ────────────
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
      position: { x: H_PAD, y: GRP_HEADER_H + V_PAD + i * (ITEM_H + ITEM_GAP) },
      style: { width: `${G1_W - 2 * H_PAD}px` },
      data: { label: item.label, selected: false },
      draggable: false, selectable: false,
    })
  })

  // ──────────── Group 2 ────────────
  nodes.push({
    id: 'g2', type: 'customGroup',
    position: { x: G2_X, y: G2_Y },
    style: { width: `${G2_W}px`, height: `${g2H}px` },
    data: { label: 'Conditions & Biomarkers', num: '②', color: '#2d6a4f' },
    draggable: false, selectable: false, focusable: false,
  })
  let curY = GRP_HEADER_H + V_PAD
  CONDITION_SECTIONS.forEach(sec => {
    nodes.push({
      id: `sec-${sec.id}`, type: 'sectionLabel',
      parentNode: 'g2',
      position: { x: H_PAD, y: curY },
      style: { width: `${G2_W - 2 * H_PAD}px` },
      data: { label: sec.label },
      draggable: false, selectable: false, focusable: false,
    })
    curY += SEC_LABEL_H + 6
    sec.items.forEach(item => {
      nodes.push({
        id: item.id, type: 'condNode',
        parentNode: 'g2',
        position: { x: H_PAD, y: curY },
        style: { width: `${G2_W - 2 * H_PAD}px` },
        data: { label: item.label, active: false, dimmed: false },
        draggable: false, selectable: false,
      })
      curY += ITEM_H + ITEM_GAP
    })
    curY += 10
  })

  // ──────────── Group 3 ────────────
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
      position: { x: H_PAD, y: GRP_HEADER_H + V_PAD + i * (ITEM_H + ITEM_GAP) },
      style: { width: `${G3_W - 2 * H_PAD}px` },
      data: { label: item.label, cat: item.cat, active: false, dimmed: false },
      draggable: false, selectable: false,
    })
  })

  return nodes
}
