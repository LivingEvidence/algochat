<template>
  <aside class="chat-panel" aria-label="Guideline chat">
    <header class="chat-header">
      <div>
        <h2>Ask anything</h2>
      </div>
      <div class="chat-header-actions">
        <button type="button" class="chat-new" @click="startNewChat">New Chat</button>
        <span class="chat-status">Ready</span>
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
        <p>{{ message.text }}</p>
      </div>

      <div class="chat-prompts" aria-label="Suggested prompts">
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
        rows="1"
        placeholder="Ask about options, biomarkers, or the selected profile..."
        @keydown.enter.exact.prevent="sendMessage"
      ></textarea>
      <button type="submit" :disabled="!draft.trim()" title="Send message" aria-label="Send message">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m4 12 15-7-4 14-3-6-8-1Z" />
          <path d="m12 13 7-8" />
        </svg>
      </button>
    </form>
  </aside>
</template>

<script setup>
import { nextTick, ref } from 'vue'

defineEmits(['close'])

const draft = ref('')
const composerInput = ref(null)
const messageList = ref(null)
const initialMessage = {
  id: 1,
  role: 'assistant',
  text: 'Ask a question about the current profile, a biomarker branch, or a treatment option. I can use the flowchart state as context.',
}
const messages = ref([
  initialMessage,
])

function startNewChat() {
  draft.value = ''
  messages.value = [
    {
      ...initialMessage,
      id: Date.now(),
    },
  ]
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

async function sendMessage() {
  const text = draft.value.trim()
  if (!text) return

  messages.value.push({ id: Date.now(), role: 'user', text })
  draft.value = ''

  messages.value.push({
    id: Date.now() + 1,
    role: 'assistant',
    text: 'Chat orchestration is ready for connection: this message can be replaced by the guideline action response once the model endpoint is wired.',
  })

  await nextTick()
  messageList.value?.scrollTo({ top: messageList.value.scrollHeight, behavior: 'smooth' })
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

.chat-message p {
  margin: 0;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #ffffff;
  color: #334155;
  font-size: 13px;
  line-height: 1.55;
  padding: 10px 12px;
}

.chat-message.from-user p {
  border-color: #bfdbfe;
  background: #eff6ff;
  color: #1e3a5f;
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
  min-height: 40px;
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
