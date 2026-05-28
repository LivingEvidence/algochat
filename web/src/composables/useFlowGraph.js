import { GUIDELINES } from '../data/guidelines.js'

const NODE_WIDTH = 220
const NODE_GAP_X = 60
const NODE_GAP_Y = 80

/**
 * Build VueFlow nodes + edges for a single guideline pathway
 */
export function buildFlowGraph(guidelineId, { offsetX = 0, offsetY = 0, highlightBranches = [] } = {}) {
  const g = GUIDELINES[guidelineId]
  if (!g) return { nodes: [], edges: [] }

  const nodes = []
  const edges = []
  const totalBranches = g.branches.length
  const totalWidth = totalBranches * NODE_WIDTH + (totalBranches - 1) * NODE_GAP_X
  const centerX = offsetX + totalWidth / 2

  // --- Root node (prior treatment) ---
  const rootId = `${guidelineId}-root`
  nodes.push({
    id: rootId,
    type: 'priorTreatment',
    position: { x: centerX - NODE_WIDTH / 2, y: offsetY },
    data: { label: g.priorTreatment, guidelineId },
  })

  // --- HRR Testing node ---
  const testId = `${guidelineId}-test`
  nodes.push({
    id: testId,
    type: 'testNode',
    position: { x: centerX - NODE_WIDTH / 2, y: offsetY + NODE_GAP_Y + 60 },
    data: { label: `${g.testType} testing`, guidelineId },
  })
  edges.push({ id: `${rootId}->${testId}`, source: rootId, target: testId, type: 'smoothstep' })

  // --- Branch nodes ---
  g.branches.forEach((branch, i) => {
    const branchX = offsetX + i * (NODE_WIDTH + NODE_GAP_X)
    const branchY = offsetY + (NODE_GAP_Y + 60) * 2

    const isHighlighted = highlightBranches.length === 0 || highlightBranches.includes(branch.id)
    const isDimmed = highlightBranches.length > 0 && !highlightBranches.includes(branch.id)

    // Branch label node
    const branchId = `${guidelineId}-branch-${branch.id}`
    nodes.push({
      id: branchId,
      type: 'branchNode',
      position: { x: branchX, y: branchY },
      data: { label: branch.label, guidelineId, branchId: branch.id, highlighted: isHighlighted, dimmed: isDimmed },
    })
    edges.push({
      id: `${testId}->${branchId}`,
      source: testId,
      target: branchId,
      type: 'smoothstep',
      style: isDimmed ? { stroke: '#ddd', strokeWidth: 1.5 } : { stroke: '#334155', strokeWidth: 2 },
    })

    // Treatment options node
    const optionsId = `${guidelineId}-options-${branch.id}`
    nodes.push({
      id: optionsId,
      type: 'treatmentNode',
      position: { x: branchX, y: branchY + NODE_GAP_Y + 80 },
      data: {
        label: branch.type === 'single' ? branch.options[0] : 'Options include',
        options: branch.options,
        isSingle: branch.type === 'single',
        guidelineId,
        branchId: branch.id,
        highlighted: isHighlighted,
        dimmed: isDimmed,
      },
    })
    edges.push({
      id: `${branchId}->${optionsId}`,
      source: branchId,
      target: optionsId,
      type: 'smoothstep',
      style: isDimmed ? { stroke: '#ddd', strokeWidth: 1.5 } : { stroke: '#334155', strokeWidth: 2 },
    })
  })

  return { nodes, edges }
}

/**
 * Build the full Overview graph with all 4 pathways side by side
 */
export function buildOverviewGraph() {
  const guidelineIds = Object.keys(GUIDELINES)
  const allNodes = []
  const allEdges = []

  const PATHWAY_WIDTH = 3 * NODE_WIDTH + 2 * NODE_GAP_X  // worst case 3 branches
  const PATHWAY_GAP = 100

  guidelineIds.forEach((id, idx) => {
    const offsetX = idx * (PATHWAY_WIDTH + PATHWAY_GAP)
    const { nodes, edges } = buildFlowGraph(id, { offsetX, offsetY: 0 })
    allNodes.push(...nodes)
    allEdges.push(...edges)
  })

  return { nodes: allNodes, edges: allEdges }
}
