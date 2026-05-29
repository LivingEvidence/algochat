export const CHAT_STORAGE_KEY = 'mcrpc_chat_sessions'

export function readChatSessionState() {
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : {}
    return {
      activeSessionId: parsed.activeSessionId || null,
      sessions: parsed.sessions || {},
    }
  } catch {
    return { activeSessionId: null, sessions: {} }
  }
}

export function writeChatSessionState(state) {
  try {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify({
      activeSessionId: state.activeSessionId || null,
      sessions: state.sessions || {},
    }))
  } catch {}
}

export function setActiveChatSession(sessionId) {
  const state = readChatSessionState()
  if (!state.sessions?.[sessionId]) return false
  writeChatSessionState({
    ...state,
    activeSessionId: sessionId,
  })
  return true
}

export function getOrderedChatSessions() {
  const state = readChatSessionState()
  return Object.values(state.sessions || {})
    .map(normalizeSession)
    .filter(Boolean)
    .sort((a, b) => {
      const bTime = Date.parse(b.updatedAt || b.createdAt || '') || 0
      const aTime = Date.parse(a.updatedAt || a.createdAt || '') || 0
      return bTime - aTime
    })
}

export function summarizeChatSession(session) {
  const firstUserMessage = session.messages.find(message => message.role === 'user')
  const firstAssistantMessage = session.messages.find(message => message.role === 'assistant')
  const text = firstUserMessage?.text || firstAssistantMessage?.text || 'New chat'
  return truncateText(text.replace(/\s+/g, ' ').trim(), 72)
}

export function getLastChatPreview(session) {
  const lastMessage = [...session.messages].reverse().find(message => message.text?.trim())
  if (!lastMessage) return 'No messages yet'
  return truncateText(lastMessage.text.replace(/\s+/g, ' ').trim(), 92)
}

function normalizeSession(session) {
  if (!session?.id) return null
  return {
    id: session.id,
    providerSessionId: session.providerSessionId || null,
    createdAt: session.createdAt || null,
    updatedAt: session.updatedAt || session.createdAt || null,
    messages: Array.isArray(session.messages) ? session.messages : [],
  }
}

function truncateText(text, maxLength) {
  if (!text) return ''
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}...` : text
}
