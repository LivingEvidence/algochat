<template>
  <div class="profile-panel">
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

    <div class="section">
      <div class="section-header">
        <span class="section-label">HRR / BRCA Status</span>
        <button v-if="profile.hrr" class="clear-link" @click="profile.hrr = null">clear</button>
      </div>
      <template v-for="opt in PROFILE_OPTIONS.hrr" :key="opt.value">
        <div v-if="opt.indent && !prevIsIndented(opt)" class="indent-marker">HRR positive subtypes</div>
        <label class="radio-row" :class="{ indented: opt.indent }">
          <input type="radio" :value="opt.value" v-model="profile.hrr" />
          <span>{{ opt.label }}</span>
        </label>
      </template>
    </div>

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

    <div class="save-bar">
      <span class="match-badge" v-if="selectedCondIds.size">{{ selectedCondIds.size }} matched</span>
      <span v-else class="match-placeholder">No matches yet</span>
    </div>

  </div>
</template>

<script setup>
import { computed } from 'vue'
import { usePatientProfile, PROFILE_OPTIONS, PRIOR_WITH_DOCETAXEL } from '../composables/usePatientProfile.js'

const {
  profile, selectedCondIds,
} = usePatientProfile()

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

</script>

<style scoped>
.profile-panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.section {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #ffffff;
  padding: 10px;
}

.section-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 6px;
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
  font-size: 12px; color: #334155; padding: 5px 6px; cursor: pointer; line-height: 1.35;
  border-radius: 5px;
  transition: background 0.12s, color 0.12s;
}
.radio-row:hover, .check-row:hover {
  background: #eff6ff;
  color: #1e3a5f;
}
.radio-row input, .check-row input { accent-color: #2d6a4f; flex-shrink: 0; }

.indent-marker { font-size: 10px; color: #94a3b8; margin: 4px 0 2px 6px; font-style: italic; }
.radio-row.indented { padding-left: 19px; color: #52796f; }
.radio-row.indented input { accent-color: #52796f; }

/* Save bar */
.save-bar {
  display: flex;
  align-items: center;
  padding-top: 2px;
}
.match-badge {
  font-size: 11px; color: #166534; font-weight: 600;
  background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 2px 8px;
}
.match-placeholder {
  color: #94a3b8;
  font-size: 11px;
}
</style>
