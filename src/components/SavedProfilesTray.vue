<template>
  <div v-if="savedProfiles.length" class="saved-profiles-tray" aria-label="Saved profiles">
    <div class="saved-profiles-header">
      <span>Saved profiles</span>
      <div class="saved-profiles-actions">
        <button v-if="savedProfiles.length > previewLimit" type="button" @click="expanded = !expanded">
          {{ expanded ? 'Less' : `View ${savedProfiles.length}` }}
        </button>
        <button type="button" @click="clearSavedProfiles">Clear all</button>
      </div>
    </div>

    <div class="saved-profiles-list">
      <div
        v-for="sp in visibleProfiles"
        :key="sp.id"
        class="saved-profile-item"
      >
        <button type="button" :title="`Load ${summarize(sp.snapshot)}`" @click="loadSavedProfile(sp.id)">
          {{ summarize(sp.snapshot) }}
        </button>
        <button
          type="button"
          class="saved-profile-delete"
          title="Delete saved profile"
          aria-label="Delete saved profile"
          @click.stop="deleteSavedProfile(sp.id)"
        >
          ×
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { usePatientProfile } from '../composables/usePatientProfile.js'

const {
  savedProfiles,
  loadSavedProfile,
  deleteSavedProfile,
  clearSavedProfiles,
} = usePatientProfile()

const previewLimit = 3
const expanded = ref(false)

const visibleProfiles = computed(() =>
  expanded.value ? savedProfiles.value : savedProfiles.value.slice(0, previewLimit)
)

function summarize(snap) {
  const parts = []
  const priorMap = { adt: 'ADT', adt_doc: 'ADT+Doc', adt_arpi: 'ADT+ARPI', adt_arpi_doc: 'ADT+ARPI+Doc' }
  if (snap.prior) parts.push(priorMap[snap.prior] || snap.prior)
  if (snap.hrr) parts.push(snap.hrr.replace(/_/g, ' '))
  if (snap.psma) parts.push('PSMA ' + snap.psma)
  if (snap.msi) parts.push('MSI ' + snap.msi)
  const specialMap = { doc_eligible: 'Doc eligible' }
  snap.special?.forEach(s => parts.push(specialMap[s] || s))
  return parts.join(' · ') || 'Empty profile'
}
</script>

<style scoped>
.saved-profiles-tray {
  position: absolute;
  top: 14px;
  left: 16px;
  z-index: 10;
  width: min(300px, calc(100% - 32px));
  color: #64748b;
  pointer-events: auto;
}

.saved-profiles-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 5px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.07em;
  text-transform: uppercase;
}

.saved-profiles-actions {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  letter-spacing: 0;
  text-transform: none;
}

.saved-profiles-actions button,
.saved-profile-delete {
  border: 0;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
  font: inherit;
  padding: 0;
}

.saved-profiles-actions button:hover,
.saved-profile-delete:hover {
  color: #475569;
}

.saved-profiles-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.saved-profile-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  border-left: 2px solid #cbd5e1;
  color: #64748b;
  font-size: 11px;
  line-height: 1.35;
  padding: 3px 0 3px 8px;
}

.saved-profile-item:hover {
  border-left-color: #94a3b8;
  color: #334155;
}

.saved-profile-item > button:first-child {
  min-width: 0;
  flex: 1;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font: inherit;
  overflow: hidden;
  padding: 0;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.saved-profile-delete {
  flex: 0 0 auto;
  font-size: 13px;
  line-height: 1;
  padding-top: 1px;
}

@media (max-width: 760px) {
  .saved-profiles-tray {
    top: 12px;
    left: 12px;
    width: min(260px, calc(100% - 24px));
  }
}
</style>
