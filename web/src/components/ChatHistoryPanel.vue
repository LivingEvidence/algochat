<template>
  <div class="chat-history-panel">
    <p v-if="!sessions.length" class="history-empty">
      No chat sessions yet.
    </p>

    <div v-else class="history-list">
      <article
        v-for="session in sessions"
        :key="session.id"
        class="history-item"
      >
        <div class="history-main">
          <h3>{{ summarizeChatSession(session) }}</h3>
          <p>{{ getLastChatPreview(session) }}</p>
          <time :datetime="session.updatedAt || session.createdAt">
            {{ formatSessionTime(session.updatedAt || session.createdAt) }}
          </time>
        </div>
        <button
          type="button"
          class="history-open"
          @click="$emit('open-session', session.id)"
        >
          Open
        </button>
      </article>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import {
  getLastChatPreview,
  getOrderedChatSessions,
  summarizeChatSession,
} from '../utils/chatSessions.js'

defineEmits(['open-session'])

const sessions = ref([])

onMounted(refresh)

function refresh() {
  sessions.value = getOrderedChatSessions()
}

function formatSessionTime(value) {
  if (!value) return 'Unknown time'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Unknown time'
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

defineExpose({ refresh })
</script>

<style scoped>
.history-empty {
  margin: 0;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #ffffff;
  color: #64748b;
  font-size: 13px;
  line-height: 1.45;
  padding: 12px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: start;
  gap: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #ffffff;
  padding: 10px;
}

.history-main {
  min-width: 0;
}

.history-main h3 {
  margin: 0 0 5px;
  overflow: hidden;
  color: #1e3a5f;
  font-size: 13px;
  font-weight: 800;
  line-height: 1.3;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-main p {
  margin: 0 0 7px;
  border: 0;
  background: transparent;
  color: #64748b;
  font-size: 12px;
  line-height: 1.4;
  padding: 0;
}

.history-main time {
  color: #94a3b8;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.history-open {
  height: 28px;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  background: #eff6ff;
  color: #1d4ed8;
  cursor: pointer;
  font-size: 11px;
  font-weight: 800;
  padding: 0 10px;
}

.history-open:hover {
  border-color: #60a5fa;
  background: #dbeafe;
  color: #1e40af;
}
</style>
