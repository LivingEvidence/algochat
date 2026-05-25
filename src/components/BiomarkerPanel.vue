<template>
  <div class="biomarker-panel">
    <div class="panel-title">Patient Profile</div>

    <!-- HRR -->
    <div class="section">
      <div class="section-label">HRR Testing</div>
      <div class="options">
        <label v-for="opt in hrrOptions" :key="opt.value" class="radio-option"
          :class="{ active: profile.hrr === opt.value }">
          <input type="radio" name="hrr" :value="opt.value" v-model="profile.hrr" />
          {{ opt.label }}
        </label>
      </div>
    </div>

    <!-- PSMA -->
    <div class="section">
      <div class="section-label">PSMA Status</div>
      <div class="options">
        <label v-for="opt in psmaOptions" :key="opt.value" class="radio-option"
          :class="{ active: profile.psma === opt.value }">
          <input type="radio" name="psma" :value="opt.value" v-model="profile.psma" />
          {{ opt.label }}
        </label>
      </div>
    </div>

    <!-- MSI-H / dMMR -->
    <div class="section">
      <div class="section-label">MSI-H / dMMR</div>
      <div class="options">
        <label v-for="opt in msiOptions" :key="opt.value" class="radio-option"
          :class="{ active: profile.msi === opt.value }">
          <input type="radio" name="msi" :value="opt.value" v-model="profile.msi" />
          {{ opt.label }}
        </label>
      </div>
    </div>

    <!-- Reset -->
    <button class="reset-btn" @click="resetProfile">Clear Profile</button>

    <!-- Special Situations -->
    <div class="special-section" v-if="specialSituations.length > 0">
      <div class="special-title">Special Situations</div>
      <div v-for="(s, i) in specialSituations" :key="i" class="special-item"
        :class="{ 'special-highlighted': isSpecialHighlighted(s) }">
        <div class="special-condition">{{ s.condition }}</div>
        <div class="special-treatment">→ {{ s.treatment }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue'

const props = defineProps({
  specialSituations: { type: Array, default: () => [] },
  highlightedSpecial: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:profile'])

const profile = reactive({ hrr: null, psma: null, msi: null })

const hrrOptions = [
  { value: 'brca',     label: 'BRCA1/2 positive' },
  { value: 'non-brca', label: 'Non-BRCA HRR positive' },
  { value: 'positive', label: 'HRR positive (unspecified)' },
  { value: 'negative', label: 'HRR negative' },
]
const psmaOptions = [
  { value: 'positive', label: 'PSMA positive' },
  { value: 'negative', label: 'PSMA negative' },
]
const msiOptions = [
  { value: 'present', label: 'Present' },
  { value: 'absent',  label: 'Absent' },
]

function resetProfile() {
  profile.hrr = null
  profile.psma = null
  profile.msi = null
  emit('update:profile', { ...profile })
}

function isSpecialHighlighted(s) {
  return props.highlightedSpecial.some(h => h.condition === s.condition)
}

// Emit whenever profile changes
import { watch } from 'vue'
watch(profile, (val) => emit('update:profile', { ...val }), { deep: true })
</script>

<style scoped>
.biomarker-panel {
  width: 240px;
  min-width: 240px;
  background: #f8fafc;
  border-left: 1px solid #e2e8f0;
  padding: 20px 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0;
}
.panel-title {
  font-size: 14px;
  font-weight: 700;
  color: #1e3a5f;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 2px solid #2563eb;
  letter-spacing: 0.03em;
}
.section {
  margin-bottom: 18px;
}
.section-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #64748b;
  margin-bottom: 8px;
}
.options {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.radio-option {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  color: #334155;
  cursor: pointer;
  padding: 5px 8px;
  border-radius: 5px;
  border: 1.5px solid transparent;
  transition: all 0.15s;
}
.radio-option:hover { background: #e8f0fe; }
.radio-option.active {
  background: #eff6ff;
  border-color: #2563eb;
  color: #1d4ed8;
  font-weight: 600;
}
.radio-option input { display: none; }
.reset-btn {
  margin-top: 4px;
  margin-bottom: 20px;
  padding: 7px 12px;
  font-size: 12px;
  color: #64748b;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.15s;
}
.reset-btn:hover { background: #e2e8f0; }

.special-section {
  border-top: 1px solid #e2e8f0;
  padding-top: 16px;
}
.special-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #64748b;
  margin-bottom: 10px;
}
.special-item {
  padding: 8px 10px;
  border-radius: 5px;
  background: #f1f5f9;
  margin-bottom: 8px;
  border-left: 3px solid #94a3b8;
  transition: all 0.2s;
}
.special-item.special-highlighted {
  background: #fef3c7;
  border-left-color: #f59e0b;
}
.special-condition {
  font-size: 11.5px;
  color: #475569;
  margin-bottom: 3px;
}
.special-treatment {
  font-size: 12px;
  font-weight: 600;
  color: #1e3a5f;
}
</style>
