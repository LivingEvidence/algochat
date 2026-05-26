<template>
  <div class="profile-panel" :class="{ collapsed }">
    <button class="toggle-btn" @click="collapsed = !collapsed">
      <span class="toggle-icon">{{ collapsed ? '▶' : '◀' }}</span>
      <span v-if="!collapsed">Patient Profile</span>
    </button>

    <div class="panel-body" v-show="!collapsed">

      <!-- ── Header ── -->
      <div class="panel-header">
        <span class="panel-title">Patient Profile</span>
        <button class="reset-btn" @click="resetProfile">✕ Reset</button>
      </div>

      <!-- ── Prior Treatment ── -->
      <div class="section">
        <div class="section-header">
          <span class="section-label">Prior Treatment</span>
          <button v-if="profile.prior" class="clear-link" @click="profile.prior = null">clear</button>
        </div>
        <label v-for="opt in PROFILE_OPTIONS.prior" :key="opt.value" class="radio-row">
          <input type="radio" :value="opt.value" v-model="profile.prior" />
          <span>{{ opt.label }}</span>
        </label>
      </div>

      <!-- ── HRR / BRCA ── -->
      <div class="section">
        <div class="section-header">
          <span class="section-label">HRR / BRCA Status</span>
          <button v-if="profile.hrr" class="clear-link" @click="profile.hrr = null">clear</button>
        </div>
        <template v-for="opt in PROFILE_OPTIONS.hrr" :key="opt.value">
          <div v-if="opt.indent && !prevIsIndented(opt)" class="indent-marker">↳ HRR Positive subtypes</div>
          <label class="radio-row" :class="{ indented: opt.indent }">
            <input type="radio" :value="opt.value" v-model="profile.hrr" />
            <span>{{ opt.label }}</span>
          </label>
        </template>
      </div>

      <!-- ── PSMA ── -->
      <div class="section">
        <div class="section-header">
          <span class="section-label">PSMA Testing</span>
          <button v-if="profile.psma" class="clear-link" @click="profile.psma = null">clear</button>
        </div>
        <label v-for="opt in PROFILE_OPTIONS.psma" :key="opt.value" class="radio-row">
          <input type="radio" :value="opt.value" v-model="profile.psma" />
          <span>{{ opt.label }}</span>
        </label>
      </div>

      <!-- ── MSI ── -->
      <div class="section">
        <div class="section-header">
          <span class="section-label">MSI-H / dMMR</span>
          <button v-if="profile.msi" class="clear-link" @click="profile.msi = null">clear</button>
        </div>
        <label v-for="opt in PROFILE_OPTIONS.msi" :key="opt.value" class="radio-row">
          <input type="radio" :value="opt.value" v-model="profile.msi" />
          <span>{{ opt.label }}</span>
        </label>
      </div>

      <!-- ── Special Situations ── -->
      <div class="section">
        <div class="section-header">
          <span class="section-label">Special Situations</span>
          <button v-if="profile.special.length" class="clear-link" @click="profile.special = []">clear</button>
        </div>
        <label v-for="opt in visibleSpecialOptions" :key="opt.value" class="check-row">
          <input type="checkbox" :value="opt.value" v-model="profile.special" />
          <span>{{ opt.label }}</span>
        </label>
      </div>

      <!-- ── Save bar ── -->
      <div class="save-bar">
        <span class="match-badge" v-if="selectedCondIds.size">{{ selectedCondIds.size }} matched</span>
        <button class="save-btn" @click="saveCurrentProfile()">Save</button>
      </div>

      <!-- ── Saved profiles list ── -->
      <div class="saved-list" v-if="savedProfiles.length">
        <div class="saved-list-label">Saved Profiles</div>
        <div
          v-for="sp in savedProfiles"
          :key="sp.id"
          class="saved-item"
          @click="loadSavedProfile(sp.id)"
        >
          <div class="saved-item-summary">{{ summarize(sp.snapshot) }}</div>
          <button class="saved-delete" @click.stop="deleteSavedProfile(sp.id)">✕</button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { usePatientProfile, PROFILE_OPTIONS, PRIOR_WITH_DOCETAXEL } from '../composables/usePatientProfile.js'

const {
  profile, selectedCondIds, resetProfile,
  savedProfiles, saveCurrentProfile, loadSavedProfile, deleteSavedProfile,
} = usePatientProfile()

const collapsed = ref(false)

const visibleSpecialOptions = computed(() =>
  PROFILE_OPTIONS.special.filter(opt =>
    opt.value !== 'doc_eligible' || !PRIOR_WITH_DOCETAXEL.has(profile.value.prior)
  )
)

function prevIsIndented(opt) {
  const opts = PROFILE_OPTIONS.hrr
  const idx = opts.indexOf(opt)
  return idx > 0 && opts[idx - 1].indent
}

function summarize(snap) {
  const parts = []
  const priorMap = { adt: 'ADT', adt_doc: 'ADT+Doc', adt_arpi: 'ADT+ARPI', adt_arpi_doc: 'ADT+ARPI+Doc' }
  if (snap.prior)   parts.push(priorMap[snap.prior] || snap.prior)
  if (snap.hrr)     parts.push(snap.hrr.replace(/_/g, ' '))
  if (snap.psma)    parts.push('PSMA ' + snap.psma)
  if (snap.msi)     parts.push('MSI ' + snap.msi)
  const specialMap = { doc_eligible: 'Doc eligible' }
  snap.special?.forEach(s => parts.push(specialMap[s] || s))
  return parts.join(' · ') || 'Empty profile'
}
</script>

<style scoped>
.profile-panel {
  position: absolute;
  top: 12px; left: 12px;
  z-index: 20;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  width: 220px;
  transition: width 0.2s;
  overflow: hidden;
}
.profile-panel.collapsed { width: 38px; }

.toggle-btn {
  display: flex; align-items: center; gap: 6px;
  width: 100%; background: #1e3a5f; color: #fff;
  border: none; padding: 9px 12px; font-size: 12px; font-weight: 600;
  cursor: pointer; border-radius: 9px 9px 0 0; white-space: nowrap;
}
.profile-panel.collapsed .toggle-btn { border-radius: 9px; }
.toggle-icon { font-size: 10px; flex-shrink: 0; }

.panel-body {
  padding: 10px 12px 12px;
  max-height: calc(100vh - 100px);
  overflow-y: auto;
}

.panel-header {
  display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;
}
.panel-title { font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.06em; }
.reset-btn { font-size: 10px; color: #94a3b8; background: none; border: none; cursor: pointer; padding: 2px 4px; }
.reset-btn:hover { color: #ef4444; }

.section { margin-bottom: 11px; }

.section-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 4px;
}
.section-label {
  font-size: 10px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.07em; color: #94a3b8;
}
.clear-link {
  font-size: 10px; color: #94a3b8; background: none; border: none;
  cursor: pointer; padding: 0; text-decoration: underline; flex-shrink: 0;
}
.clear-link:hover { color: #ef4444; }

.radio-row, .check-row {
  display: flex; align-items: center; gap: 6px;
  font-size: 11.5px; color: #334155; padding: 2px 0; cursor: pointer; line-height: 1.3;
}
.radio-row input, .check-row input { accent-color: #2d6a4f; flex-shrink: 0; }

.indent-marker { font-size: 10px; color: #94a3b8; margin: 2px 0 1px 4px; font-style: italic; }
.radio-row.indented { padding-left: 14px; color: #52796f; }
.radio-row.indented input { accent-color: #52796f; }

/* Save bar */
.save-bar {
  display: flex; align-items: center; justify-content: space-between;
  margin-top: 10px; padding-top: 8px; border-top: 1px solid #f1f5f9;
}
.match-badge {
  font-size: 11px; color: #166534; font-weight: 600;
  background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 2px 8px;
}
.save-btn {
  font-size: 11px; font-weight: 600; color: #fff;
  background: #2563eb; border: none; border-radius: 6px;
  padding: 4px 12px; cursor: pointer;
}
.save-btn:hover { background: #1d4ed8; }

/* Saved list */
.saved-list { margin-top: 10px; }
.saved-list-label {
  font-size: 10px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.07em; color: #94a3b8; margin-bottom: 5px;
}
.saved-item {
  display: flex; align-items: flex-start; gap: 6px;
  padding: 6px 8px; border-radius: 6px;
  border: 1px solid #e2e8f0; background: #f8fafc;
  margin-bottom: 5px; cursor: pointer; position: relative;
}
.saved-item:hover { background: #eff6ff; border-color: #bfdbfe; }
.saved-item-summary { font-size: 10px; color: #64748b; line-height: 1.4; flex: 1; padding-right: 14px; }
.saved-delete {
  font-size: 10px; color: #cbd5e1; background: none; border: none;
  cursor: pointer; padding: 0 2px; flex-shrink: 0; margin-top: 1px;
}
.saved-delete:hover { color: #ef4444; }
.saved-item { flex-direction: column; }
.saved-item > .saved-delete {
  position: absolute; top: 5px; right: 6px;
}
</style>
