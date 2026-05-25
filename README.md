# mCRPC Treatment Decision Guide

An interactive clinical decision support tool for second-line treatment selection in **metastatic castration-resistant prostate cancer (mCRPC)**, based on the ASCO Living Guideline (Version 2026.1).

## Background

All patients in this guideline have already received ADT (androgen deprivation therapy) and developed castration resistance — that is the prerequisite for entering the mCRPC state. The tool helps oncologists navigate second-line treatment options based on:

1. **Prior treatment history** — what was given in addition to ADT
2. **Biomarker test results** — HRR mutation status, PSMA PET status, MSI-H/dMMR status
3. **Special clinical situations** — oligometastatic disease, bone-only disease, indolent disease, etc.

## Key Clinical Logic

The guideline covers four prior treatment pathways:

| Prior Treatment | Key Decision Factor |
|---|---|
| ADT only | HRR testing with BRCA1/2 sub-distinction |
| ADT + Docetaxel | Same as above; Cabazitaxel replaces Docetaxel |
| ADT + ARPI | BRCA sub-distinction not needed (ARPI already used); HRR+/− only |
| ADT + ARPI + Docetaxel | PSMA and HRR tested independently |

Two important rules encoded in the data:
- **ARPI exposure** collapses the BRCA1/2 vs. Non-BRCA HRR distinction, because PARP+ARPI combination regimens are no longer viable after ARPI progression
- **Docetaxel exposure** replaces Docetaxel with Cabazitaxel in the taxane slot (Cabazitaxel is indicated specifically in post-docetaxel patients)

## Features

### All Pathways View (Primary)
An interactive three-column layout:
- **Column 1 — Prior Treatment**: click to select one of four prior treatment pathways
- **Column 2 — Conditions & Biomarkers**: HRR testing results, PSMA status, MSI-H/dMMR status, and special situations — each as an independent node
- **Column 3 — Treatment Options**: all possible second-line treatments, color-coded by drug class

On selection, dynamic Bezier edges appear connecting the relevant conditions to applicable treatments. Unrelated nodes are dimmed. Each biomarker condition is independent — no artificial combined conditions like "PSMA neg + HRR neg".

### Detail View
Per-pathway decision flowchart (VueFlow) with a right-side patient profile panel. Selecting HRR / PSMA / MSI-H status highlights the corresponding branches interactively.

### Classic View
All four pathways displayed side-by-side for reference comparison.

## Tech Stack

- **Vue 3** + **Vite**
- **VueFlow** — interactive flowchart and graph rendering
- **Bun** — package manager and dev server

## Getting Started

```bash
bun install
bun run dev
```

App runs at `http://localhost:5173` by default.

## Data

All guideline content lives in:
- `src/data/triColumn.js` — node definitions and edge rules for the All Pathways view
- `src/data/guidelines.js` — per-pathway data for the Detail and Classic views

To update treatment recommendations, edit the `EDGE_RULES` object in `triColumn.js` and the `GUIDELINES` object in `guidelines.js`.
