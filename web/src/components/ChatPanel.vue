<template>
  <aside class="chat-panel" aria-label="Guideline chat">
    <header class="chat-header">
      <div>
        <h2>Ask anything</h2>
      </div>
      <div class="chat-header-actions">
        <button type="button" class="chat-new" @click="startNewChat">New Chat</button>
        <span class="chat-status" :class="`is-${statusTone}`">{{ statusLabel }}</span>
        <button type="button" class="chat-close" title="Close chat panel" aria-label="Close chat panel" @click="$emit('close')">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </div>
    </header>

    <div class="chat-body" ref="messageList">
      <div
        v-for="message in messages"
        :key="message.id"
        class="chat-message"
        :class="`from-${message.role}`"
      >
        <span class="message-label">{{ message.role === 'assistant' ? 'Assistant' : 'You' }}</span>
        <div
          v-if="message.role === 'assistant'"
          class="message-bubble markdown-body"
          v-html="renderMarkdown(message.text)"
        ></div>
        <p v-else class="message-bubble">{{ message.text }}</p>
        <span v-if="message.actionLabel" class="message-action">{{ message.actionLabel }}</span>
      </div>

      <div v-if="showSuggestedPrompts" class="chat-prompts" aria-label="Suggested prompts">
        <button
          v-for="prompt in suggestedPrompts"
          :key="prompt"
          type="button"
          @click="usePrompt(prompt)"
        >
          {{ prompt }}
        </button>
      </div>
    </div>

    <form class="chat-composer" @submit.prevent="sendMessage">
      <label class="sr-only" for="guideline-chat-input">Ask the guideline chatbot</label>
      <textarea
        id="guideline-chat-input"
        ref="composerInput"
        v-model="draft"
        rows="3"
        :disabled="isLoading"
        placeholder="Ask about options, biomarkers, or the selected profile..."
        @keydown.enter.exact.prevent="sendMessage"
      ></textarea>
      <button type="submit" :disabled="!draft.trim() || isLoading" title="Send message" aria-label="Send message">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m4 12 15-7-4 14-3-6-8-1Z" />
          <path d="m12 13 7-8" />
        </svg>
      </button>
    </form>
  </aside>
</template>

<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import markdownit from 'markdown-it'
import { sendChatMessage } from '../utils/chatApi.js'
import { readChatSessionState, writeChatSessionState } from '../utils/chatSessions.js'
import { useInteractiveAlgorithmStore } from '../stores/interactiveAlgorithm.js'

const emit = defineEmits(['close', 'viz-profile'])

const draft = ref('')
const composerInput = ref(null)
const messageList = ref(null)
const isLoading = ref(false)
const streamController = ref(null)
const sessionId = ref(null)
const providerSessionId = ref(null)

const interactiveStore = useInteractiveAlgorithmStore()
const { currentSnapshot } = storeToRefs(interactiveStore)

const md = markdownit()

const initialMessage = {
  id: 'initial',
  role: 'assistant',
  text: 'Ask a question about the current profile, a biomarker branch, or a treatment option. I can use the flowchart state as context.',
}
const messages = ref([])

const statusLabel = computed(() => {
  if (isLoading.value) return 'Thinking'
  return 'Ready'
})

const statusTone = computed(() => isLoading.value ? 'loading' : 'ready')
const showSuggestedPrompts = computed(() =>
  !messages.value.some(message => message.role === 'user')
)

onMounted(() => {
  loadActiveSession()
  if (!messages.value.length) {
    messages.value = [{ ...initialMessage, id: createId() }]
    persistActiveSession()
  }
})

watch(messages, persistActiveSession, { deep: true })
watch(providerSessionId, persistActiveSession)

function startNewChat() {
  streamController.value?.abort()
  streamController.value = null
  isLoading.value = false
  draft.value = ''
  sessionId.value = createId()
  providerSessionId.value = null
  messages.value = [
    {
      ...initialMessage,
      id: createId(),
    },
  ]
  persistActiveSession()
  focusComposer()
}

const suggestedPrompts = [
  'Which options match this profile?',
  'What does PSMA positive change?',
  'Explain the highlighted treatment',
]

function focusComposer() {
  composerInput.value?.focus()
}

function usePrompt(prompt) {
  draft.value = prompt
  focusComposer()
}

function renderMarkdown(text) {
  return md.render(text || '')
}

async function sendMessage() {
  const text = draft.value.trim()
  if (!text || isLoading.value) return

  ensureSession()
  messages.value.push({ id: createId(), role: 'user', text })
  draft.value = ''

  const assistantMessage = {
    id: createId(),
    role: 'assistant',
    text: '',
    actionLabel: '',
  }
  messages.value.push(assistantMessage)
  isLoading.value = true

  scrollToBottom()

  streamController.value = await sendChatMessage({
    sessionId: sessionId.value,
    providerSessionId: providerSessionId.value,
    message: text,
    context: {
      currentProfile: currentSnapshot.value,
    },
    onEvent: event => handleSseEvent(event, assistantMessage.id),
    onError: error => handleStreamError(error, assistantMessage.id),
    onDone: () => handleStreamDone(assistantMessage.id),
  })
}

function handleSseEvent({ type, data }, assistantMessageId) {
  const message = messages.value.find(item => item.id === assistantMessageId)
  if (type === 'message_start' && data.provider_session_id) {
    providerSessionId.value = data.provider_session_id
    return
  }
  if (type === 'text_delta' && message) {
    message.text = data.text || ''
    scrollToBottom()
    return
  }
  if (type === 'frontend_action' && data.action === 'viz_profile') {
    emit('viz-profile', data.payload)
    if (message && !message.text.trim()) {
      message.text = 'I updated the flowchart for that profile.'
    }
    if (message) message.actionLabel = 'Flowchart updated'
    scrollToBottom()
    return
  }
  if (type === 'message_end') {
    if (data.provider_session_id) providerSessionId.value = data.provider_session_id
    if (message && !message.text.trim()) {
      message.text = 'Done.'
    }
    isLoading.value = false
    streamController.value = null
    persistActiveSession()
    return
  }
  if (type === 'error') {
    handleStreamError({ error: data.error }, assistantMessageId)
  }
}

function handleStreamError(error, assistantMessageId) {
  const message = messages.value.find(item => item.id === assistantMessageId)
  if (message) {
    message.text = `Error: ${error.error || 'Chat request failed'}`
  }
  isLoading.value = false
  streamController.value = null
  persistActiveSession()
}

function handleStreamDone(assistantMessageId) {
  const message = messages.value.find(item => item.id === assistantMessageId)
  if (message && !message.text.trim()) {
    message.text = 'Done.'
  }
  isLoading.value = false
  streamController.value = null
  persistActiveSession()
}

async function scrollToBottom() {
  await nextTick()
  messageList.value?.scrollTo({ top: messageList.value.scrollHeight, behavior: 'smooth' })
}

function ensureSession() {
  if (!sessionId.value) sessionId.value = createId()
}

function createId() {
  return crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function loadActiveSession() {
  const saved = readSavedSessions()
  sessionId.value = saved.activeSessionId || createId()
  const session = saved.sessions?.[sessionId.value]
  if (session) {
    providerSessionId.value = session.providerSessionId || null
    messages.value = Array.isArray(session.messages) ? session.messages : []
  }
}

function persistActiveSession() {
  if (!sessionId.value) return
  const saved = readSavedSessions()
  const nextSessions = {
    ...(saved.sessions || {}),
    [sessionId.value]: {
      id: sessionId.value,
      providerSessionId: providerSessionId.value,
      createdAt: saved.sessions?.[sessionId.value]?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: messages.value,
    },
  }
  writeChatSessionState({
    activeSessionId: sessionId.value,
    sessions: nextSessions,
  })
}

function readSavedSessions() {
  return readChatSessionState()
}

defineExpose({ focusComposer })
</script>

<style scoped>
.chat-panel {
  width: clamp(300px, 28vw, 390px);
  flex: 0 0 clamp(300px, 28vw, 390px);
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: #fbfcfe;
  border-right: 1px solid #dbe4ee;
  box-shadow: 8px 0 24px rgba(15, 23, 42, 0.06);
  z-index: 12;
}

.chat-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 18px 14px;
  border-bottom: 1px solid #e2e8f0;
  background: #ffffff;
}

.chat-header-actions {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.chat-header h2 {
  margin: 0;
  color: #1e3a5f;
  font-size: 17px;
  line-height: 1.25;
}

.chat-status {
  flex-shrink: 0;
  border: 1px solid #bbf7d0;
  border-radius: 999px;
  background: #f0fdf4;
  color: #166534;
  font-size: 10px;
  font-weight: 800;
  padding: 3px 8px;
}

.chat-status.is-loading {
  border-color: #fed7aa;
  background: #fff7ed;
  color: #9a3412;
}

.chat-status.is-ready {
  border-color: #bbf7d0;
  background: #f0fdf4;
  color: #166534;
}

.chat-new {
  flex-shrink: 0;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  background: #eff6ff;
  color: #1d4ed8;
  cursor: pointer;
  font-size: 11px;
  font-weight: 800;
  line-height: 1;
  padding: 8px 10px;
  transition: border-color 0.15s, background 0.15s, color 0.15s;
}

.chat-new:hover {
  border-color: #60a5fa;
  background: #dbeafe;
  color: #1e40af;
}

.chat-close {
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #dbe4ee;
  border-radius: 8px;
  background: #ffffff;
  color: #64748b;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s, color 0.15s;
}

.chat-close:hover {
  border-color: #93c5fd;
  background: #eff6ff;
  color: #1d4ed8;
}

.chat-close svg {
  width: 15px;
  height: 15px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2;
}

.chat-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 16px;
}

.chat-message {
  max-width: 92%;
  margin-bottom: 12px;
}

.chat-message.from-user {
  margin-left: auto;
}

.message-label {
  display: block;
  margin: 0 2px 4px;
  color: #94a3b8;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.message-bubble {
  margin: 0;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #ffffff;
  color: #334155;
  font-size: 13px;
  line-height: 1.55;
  padding: 10px 12px;
}

.chat-message.from-user .message-bubble {
  border-color: #bfdbfe;
  background: #eff6ff;
  color: #1e3a5f;
  white-space: pre-wrap;
}

.markdown-body {
  overflow-wrap: anywhere;
}

.markdown-body :deep(:first-child) {
  margin-top: 0;
}

.markdown-body :deep(:last-child) {
  margin-bottom: 0;
}

.markdown-body :deep(p),
.markdown-body :deep(ul),
.markdown-body :deep(ol),
.markdown-body :deep(table),
.markdown-body :deep(blockquote),
.markdown-body :deep(pre) {
  margin: 0 0 10px;
}

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  padding-left: 18px;
}

.markdown-body :deep(li + li) {
  margin-top: 4px;
}

.markdown-body :deep(strong) {
  color: #1e3a5f;
  font-weight: 800;
}

.markdown-body :deep(code) {
  border-radius: 5px;
  background: #f1f5f9;
  color: #0f172a;
  font-size: 12px;
  padding: 1px 4px;
}

.markdown-body :deep(pre) {
  overflow-x: auto;
  border: 1px solid #e2e8f0;
  border-radius: 7px;
  background: #f8fafc;
  padding: 9px 10px;
}

.markdown-body :deep(pre code) {
  background: transparent;
  padding: 0;
}

.markdown-body :deep(a) {
  color: #1d4ed8;
  font-weight: 700;
  text-decoration: underline;
}

.markdown-body :deep(table) {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.markdown-body :deep(th),
.markdown-body :deep(td) {
  border: 1px solid #e2e8f0;
  padding: 6px 7px;
  text-align: left;
  vertical-align: top;
}

.markdown-body :deep(th) {
  background: #f8fafc;
  color: #1e3a5f;
}

.message-action {
  display: inline-flex;
  margin: 5px 2px 0;
  border: 1px solid #bfdbfe;
  border-radius: 999px;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 10px;
  font-weight: 800;
  padding: 2px 7px;
}

.chat-prompts {
  display: grid;
  gap: 8px;
  margin-top: 18px;
}

.chat-prompts button {
  width: 100%;
  border: 1px solid #dbe4ee;
  border-radius: 8px;
  background: #ffffff;
  color: #475569;
  cursor: pointer;
  font-size: 12px;
  font-weight: 650;
  line-height: 1.25;
  padding: 9px 10px;
  text-align: left;
  transition: border-color 0.15s, background 0.15s, color 0.15s;
}

.chat-prompts button:hover {
  border-color: #93c5fd;
  background: #f8fbff;
  color: #1e3a5f;
}

.chat-composer {
  display: flex;
  align-items: flex-end;
  gap: 9px;
  padding: 12px;
  border-top: 1px solid #e2e8f0;
  background: #ffffff;
}

.chat-composer textarea {
  width: 100%;
  min-height: 72px;
  max-height: 118px;
  resize: vertical;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  color: #1e293b;
  font: inherit;
  font-size: 13px;
  line-height: 1.4;
  padding: 10px 11px;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.chat-composer textarea:disabled {
  background: #f8fafc;
  color: #64748b;
}

.chat-composer textarea:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.14);
}

.chat-composer button {
  width: 40px;
  height: 40px;
  flex: 0 0 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 8px;
  background: #2563eb;
  color: #ffffff;
  cursor: pointer;
  transition: background 0.15s, opacity 0.15s;
}

.chat-composer button:hover:not(:disabled) {
  background: #1d4ed8;
}

.chat-composer button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.chat-composer svg {
  width: 18px;
  height: 18px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 980px) {
  .chat-panel {
    width: 300px;
    flex-basis: 300px;
  }
}

@media (max-width: 760px) {
  .chat-panel {
    width: 280px;
    flex-basis: 280px;
  }

  .chat-header {
    padding: 13px 14px 12px;
  }

  .chat-body {
    padding: 12px;
  }
}
</style>
