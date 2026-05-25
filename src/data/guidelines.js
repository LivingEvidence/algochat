/**
 * mCRPC Treatment Guidelines Data
 * Four prior treatment pathways, each with HRR/PSMA/MSI-H decision branches
 */

export const PRIOR_TREATMENTS = [
  { id: 'adt-only',          label: 'ADT only',                shortLabel: 'ADT',                  color: '#d4845a' },
  { id: 'adt-docetaxel',     label: 'ADT + Docetaxel',         shortLabel: 'ADT + Doc',            color: '#d4845a' },
  { id: 'adt-arpi',          label: 'ADT + ARPI',              shortLabel: 'ADT + ARPI',           color: '#d4845a' },
  { id: 'adt-arpi-docetaxel',label: 'ADT + ARPI + Docetaxel',  shortLabel: 'ADT + ARPI + Doc',     color: '#d4845a' },
]

/**
 * Treatment options per pathway.
 * Each pathway defines:
 *   - branches: the HRR/PSMA decision tree branches
 *   - specialSituations: additional options based on other biomarkers
 */
export const GUIDELINES = {
  'adt-only': {
    id: 'adt-only',
    priorTreatment: 'ADT only',
    testType: 'HRR',
    branches: [
      {
        id: 'brca-positive',
        label: 'BRCA1 or BRCA2 positive',
        condition: { hrr: 'brca' },
        type: 'options',
        options: [
          'Talazoparib + enzalutamide',
          'Olaparib + abiraterone',
          'Niraparib + abiraterone',
        ],
      },
      {
        id: 'non-brca-hrr-positive',
        label: 'Non-BRCA HRR positive',
        condition: { hrr: 'non-brca' },
        type: 'single',
        options: ['Talazoparib + enzalutamide'],
      },
      {
        id: 'hrr-negative',
        label: 'HRR negative',
        condition: { hrr: 'negative' },
        type: 'options',
        options: [
          'Abiraterone with prednisone',
          'Enzalutamide',
          'Docetaxel',
          'Radium 223 with enzalutamide',
        ],
      },
    ],
    specialSituations: [
      { condition: 'Oligometastatic disease or progression', treatment: 'Radiation therapy or surgery after multidisciplinary discussion' },
      { condition: 'Indolent disease (slow rising PSA, asymptomatic or low volume disease)', treatment: 'Sipuleucel-T' },
      { condition: 'Bone only, symptomatic', treatment: 'Radium 223' },
      { condition: 'MSI-H / dMMR', treatment: 'Pembrolizumab', biomarker: 'msi' },
      { condition: 'PSMA-positive', treatment: '¹⁷⁷Lu-PSMA-617', biomarker: 'psma' },
    ],
  },

  'adt-docetaxel': {
    id: 'adt-docetaxel',
    priorTreatment: 'ADT + Docetaxel',
    testType: 'HRR',
    branches: [
      {
        id: 'brca-positive',
        label: 'BRCA1 or BRCA2 positive',
        condition: { hrr: 'brca' },
        type: 'options',
        options: [
          'Talazoparib + enzalutamide',
          'Olaparib + abiraterone',
          'Niraparib + abiraterone',
        ],
      },
      {
        id: 'non-brca-hrr-positive',
        label: 'Non-BRCA HRR positive',
        condition: { hrr: 'non-brca' },
        type: 'single',
        options: ['Talazoparib + enzalutamide'],
      },
      {
        id: 'hrr-negative',
        label: 'HRR negative',
        condition: { hrr: 'negative' },
        type: 'options',
        options: [
          'Abiraterone with prednisone',
          'Enzalutamide',
          'Radium 223 with enzalutamide',
          'Cabazitaxel',
        ],
      },
    ],
    specialSituations: [
      { condition: 'Oligometastatic disease or progression', treatment: 'Radiation therapy or surgery after multidisciplinary discussion' },
      { condition: 'Indolent disease (slow rising PSA, asymptomatic or low volume disease)', treatment: 'Sipuleucel-T' },
      { condition: 'Bone only, symptomatic', treatment: 'Radium 223' },
      { condition: 'MSI-H / dMMR', treatment: 'Pembrolizumab', biomarker: 'msi' },
      { condition: 'PSMA-positive', treatment: '¹⁷⁷Lu-PSMA-617', biomarker: 'psma' },
    ],
  },

  'adt-arpi': {
    id: 'adt-arpi',
    priorTreatment: 'ADT + ARPI',
    testType: 'HRR',
    branches: [
      {
        id: 'hrr-positive',
        label: 'HRR positive',
        condition: { hrr: 'positive' },
        type: 'single',
        options: ['Olaparib'],
      },
      {
        id: 'hrr-negative',
        label: 'HRR negative',
        condition: { hrr: 'negative' },
        type: 'options',
        options: [
          'Docetaxel',
          'Radium 223',
          'Pembrolizumab (if MSI-H/dMMR)',
          '¹⁷⁷Lu-PSMA-617 (if PSMA PET-positive)',
        ],
      },
    ],
    specialSituations: [
      { condition: 'Oligometastatic disease or progression', treatment: 'Radiation therapy or surgery after multidisciplinary discussion' },
      { condition: 'Indolent disease (slow rising PSA, asymptomatic or low volume disease)', treatment: 'Sipuleucel-T' },
      { condition: 'Bone only, symptomatic', treatment: 'Radium 223' },
      { condition: 'PSMA-positive', treatment: '¹⁷⁷Lu-PSMA-617', biomarker: 'psma' },
      { condition: 'Ineligible for docetaxel (neuropathy, edema, lung disease, etc.)', treatment: 'Cabazitaxel' },
    ],
  },

  'adt-arpi-docetaxel': {
    id: 'adt-arpi-docetaxel',
    priorTreatment: 'ADT + ARPI + Docetaxel',
    testType: 'PSMA + HRR',
    branches: [
      {
        id: 'psma-positive',
        label: 'PSMA positive',
        condition: { psma: 'positive' },
        type: 'single',
        options: ['¹⁷⁷Lu-PSMA'],
      },
      {
        id: 'hrr-positive',
        label: 'HRR positive',
        condition: { hrr: 'positive' },
        type: 'single',
        options: ['Olaparib'],
      },
      {
        id: 'psma-hrr-negative',
        label: 'PSMA negative, HRR negative',
        condition: { psma: 'negative', hrr: 'negative' },
        type: 'options',
        options: [
          'Cabazitaxel',
          'Radium 223',
          'Pembrolizumab (if MSI-H/dMMR)',
        ],
      },
    ],
    specialSituations: [
      { condition: 'Bone only, symptomatic', treatment: 'Radium 223' },
    ],
  },
}

/**
 * Determine which branches match a given patient biomarker profile
 * Returns array of matching branch ids
 */
export function getMatchingBranches(guidelineId, profile) {
  const guideline = GUIDELINES[guidelineId]
  if (!guideline) return []

  const matched = []

  for (const branch of guideline.branches) {
    const cond = branch.condition
    let matches = true

    if (cond.hrr) {
      if (cond.hrr === 'positive') {
        if (!['brca', 'non-brca', 'positive'].includes(profile.hrr)) matches = false
      } else if (cond.hrr === 'brca') {
        if (profile.hrr !== 'brca') matches = false
      } else if (cond.hrr === 'non-brca') {
        if (profile.hrr !== 'non-brca') matches = false
      } else if (cond.hrr === 'negative') {
        if (profile.hrr !== 'negative') matches = false
      }
    }

    if (cond.psma) {
      if (profile.psma !== cond.psma) matches = false
    }

    if (matches) matched.push(branch.id)
  }

  // Special situations based on biomarkers
  const matchedSpecial = []
  for (const s of guideline.specialSituations) {
    if (s.biomarker === 'psma' && profile.psma === 'positive') matchedSpecial.push(s)
    if (s.biomarker === 'msi' && profile.msi === 'present') matchedSpecial.push(s)
  }

  return { branches: matched, specialSituations: matchedSpecial }
}
