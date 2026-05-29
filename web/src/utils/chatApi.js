const DEFAULT_API_BASE_URL = 'http://localhost:8392'

export function getApiBaseUrl() {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL
  return baseUrl.replace(/\/api\/?$/, '').replace(/\/$/, '')
}

export async function sendChatMessage({
  sessionId,
  providerSessionId = null,
  message,
  context = {},
  onEvent,
  onError,
  onDone,
}) {
  const controller = new AbortController()

  try {
    const response = await fetch(`${getApiBaseUrl()}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session_id: sessionId,
        provider_session_id: providerSessionId,
        message,
        context,
      }),
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    if (!response.body) {
      throw new Error('Streaming response is not available')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        onDone?.()
        break
      }

      buffer += decoder.decode(value, { stream: true })
      const chunks = buffer.split('\n\n')
      buffer = chunks.pop() || ''

      chunks.forEach(chunk => {
        const parsed = parseSseChunk(chunk)
        if (parsed) onEvent?.(parsed)
      })
    }
  } catch (error) {
    if (error.name !== 'AbortError') {
      onError?.({ error: error.message || 'Chat request failed' })
    }
  }

  return controller
}

function parseSseChunk(chunk) {
  if (!chunk.trim()) return null
  const eventMatch = chunk.match(/^event:\s*(.+)$/m)
  const dataMatch = chunk.match(/^data:\s*(.+)$/m)
  if (!eventMatch || !dataMatch) return null

  try {
    return {
      type: eventMatch[1],
      data: JSON.parse(dataMatch[1]),
    }
  } catch {
    return null
  }
}
