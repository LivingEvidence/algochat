<template>
  <div class="interactive-profile-panel">
    <p v-if="!savedProfiles.length" class="empty-state">
      Saved profiles will appear here after Treatment Options are available.
    </p>

    <div v-else class="saved-profile-list">
      <div v-for="profile in savedProfiles" :key="profile.id" class="saved-profile-item">
        <div class="saved-profile-row">
          <button
            type="button"
            class="detail-toggle"
            :title="expandedId === profile.id ? 'Hide pathway details' : 'Show pathway details'"
            :aria-label="expandedId === profile.id ? 'Hide pathway details' : 'Show pathway details'"
            :aria-expanded="expandedId === profile.id"
            @click="toggleDetails(profile.id)"
          >
            <svg class="chevron-icon" :class="{ expanded: expandedId === profile.id }" viewBox="0 0 24 24" aria-hidden="true">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
          <input
            v-if="editingId === profile.id"
            ref="editInput"
            class="saved-profile-name"
            v-model="editingName"
            aria-label="Saved profile name"
            @blur="commitRename(profile.id)"
            @keydown.enter="commitRename(profile.id)"
            @keydown.esc="cancelRename"
          />
          <button
            v-else
            type="button"
            class="saved-profile-title"
            :title="profile.label"
            @click="loadProfile(profile.id)"
          >
            {{ profile.label }}
          </button>
          <div class="saved-profile-actions">
            <button
              v-if="editingId === profile.id"
              type="button"
              title="Save profile name"
              aria-label="Save profile name"
              @mousedown.prevent
              @click="commitRename(profile.id)"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
                <path d="M17 21v-8H7v8" />
                <path d="M7 3v5h8" />
              </svg>
            </button>
            <button v-else type="button" title="Edit profile name" aria-label="Edit profile name" @click="startRename(profile)">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
              </svg>
            </button>
            <button
              type="button"
              class="danger"
              aria-label="Delete saved profile"
              title="Delete saved profile"
              @click="deleteSavedProfile(profile.id)"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3 6h18" />
                <path d="M8 6V4h8v2" />
                <path d="M19 6 18 20H6L5 6" />
                <path d="M10 11v5" />
                <path d="M14 11v5" />
              </svg>
            </button>
          </div>
        </div>

        <dl v-if="expandedId === profile.id" class="pathway-detail-list">
          <div v-for="row in pathwayDetailRows(profile)" :key="row.label" class="pathway-detail-row">
            <dt>{{ row.label }}</dt>
            <dd :title="row.value">{{ row.value }}</dd>
          </div>
        </dl>
      </div>
    </div>
  </div>
</template>

<script setup>
import { nextTick, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { describePathway, useInteractiveAlgorithmStore } from '../stores/interactiveAlgorithm.js'

const emit = defineEmits(['profile-loaded'])

const interactiveStore = useInteractiveAlgorithmStore()
const {
  savedProfiles,
} = storeToRefs(interactiveStore)
const {
  deleteSavedProfile,
  loadSavedProfile,
  renameSavedProfile,
} = interactiveStore

const editInput = ref(null)
const editingId = ref(null)
const editingName = ref('')
const expandedId = ref(null)

function loadProfile(id) {
  loadSavedProfile(id)
  emit('profile-loaded')
}

function toggleDetails(id) {
  expandedId.value = expandedId.value === id ? null : id
}

function formatList(values) {
  return values.length ? values.join(', ') : 'None'
}

function pathwayDetailRows(profile) {
  const detail = describePathway(profile.snapshot)
  return [
    { label: 'Prior Treatment', value: detail.prior },
    { label: 'Bio-marker', value: formatList(detail.biomarkers) },
    { label: 'Special Situation', value: formatList(detail.specialSituations) },
    { label: 'Treatment Option', value: formatList(detail.treatmentOptions) },
  ]
}

async function startRename(profile) {
  editingId.value = profile.id
  editingName.value = profile.label
  await nextTick()
  const input = Array.isArray(editInput.value) ? editInput.value[0] : editInput.value
  input?.focus()
  input?.select()
}

function commitRename(id) {
  if (editingId.value !== id) return
  renameSavedProfile(id, editingName.value)
  editingId.value = null
  editingName.value = ''
}

function cancelRename() {
  editingId.value = null
  editingName.value = ''
}
</script>

<style scoped>
.interactive-profile-panel {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.empty-state {
  margin: 0;
  color: #94a3b8;
  font-size: 12px;
  line-height: 1.45;
}

.saved-profile-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.saved-profile-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  border: 1px solid #e2e8f0;
  border-radius: 7px;
  background: #fbfcfe;
  padding: 5px 6px 5px 8px;
}

.saved-profile-row {
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-width: 0;
}

.saved-profile-name {
  width: 100%;
  min-width: 0;
  border: 1px solid #cbd5e1;
  border-radius: 5px;
  background: #ffffff;
  color: #334155;
  font: inherit;
  font-size: 12px;
  line-height: 1.35;
  padding: 4px 6px;
}

.saved-profile-name:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.12);
  outline: none;
}

.saved-profile-title {
  width: 100%;
  min-width: 0;
  overflow: hidden;
  border: 0;
  background: transparent;
  color: #334155;
  cursor: pointer;
  font: inherit;
  font-size: 12px;
  line-height: 1.35;
  padding: 3px 0;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.saved-profile-title:hover {
  color: #1d4ed8;
}

.saved-profile-actions {
  display: flex;
  justify-self: end;
  justify-content: flex-end;
  gap: 3px;
}

.detail-toggle,
.saved-profile-actions button {
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  border-radius: 6px;
  background: transparent;
  color: #475569;
  cursor: pointer;
  padding: 0;
}

.detail-toggle svg,
.saved-profile-actions svg {
  width: 14px;
  height: 14px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2;
}

.detail-toggle .chevron-icon {
  transition: transform 0.15s;
}

.detail-toggle .chevron-icon.expanded {
  transform: rotate(90deg);
}

.detail-toggle:hover,
.saved-profile-actions button:hover {
  border-color: #93c5fd;
  background: #eff6ff;
  color: #1d4ed8;
}

.saved-profile-actions button.danger:hover {
  border-color: #fecaca;
  background: #fef2f2;
  color: #dc2626;
}

.pathway-detail-list {
  width: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
  margin: 2px 0 1px;
  padding: 6px 0 1px;
  border-top: 1px solid #e2e8f0;
}

.pathway-detail-row {
  display: grid;
  grid-template-columns: 96px minmax(0, 1fr);
  gap: 8px;
  align-items: baseline;
  color: #475569;
  font-size: 11px;
  line-height: 1.35;
}

.pathway-detail-row dt {
  color: #94a3b8;
  font-weight: 700;
}

.pathway-detail-row dd {
  min-width: 0;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
