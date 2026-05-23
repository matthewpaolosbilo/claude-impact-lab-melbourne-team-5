import { useCallback, useState } from 'react'
import { sendChatMessage, sendOnboardingMessage } from '../api'

// Session-only Maxxer chat. Per STATE.md task 4.13: "session-only React chat history" —
// nothing persisted to localStorage.
//
// mode: 'chat' (uses /api/chat) | 'onboarding' (uses /api/chat/onboarding)
//
// Each message: { role: 'user' | 'assistant', content: string }
// The assistant reply may include [EVENT:id] tags — that parsing happens at render time.
//
// Returned shape:
//   { messages, isLoading, error, suggestedEventIds, onboardingComplete, send, reset }
export function useMaxxer({ userId, mode = 'chat', initialMessages = [] } = {}) {
  const [messages, setMessages] = useState(initialMessages)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [suggestedEventIds, setSuggestedEventIds] = useState([])
  const [onboardingComplete, setOnboardingComplete] = useState(false)
  const [onboardingPreferences, setOnboardingPreferences] = useState(null)

  const send = useCallback(
    async (text) => {
      const trimmed = text?.trim()
      if (!trimmed || isLoading) return
      const nextHistory = [...messages, { role: 'user', content: trimmed }]
      setMessages(nextHistory)
      setIsLoading(true)
      setError(null)
      try {
        const fn = mode === 'onboarding' ? sendOnboardingMessage : sendChatMessage
        const data = await fn({ userId, messages: nextHistory })
        setMessages((m) => [...m, { role: 'assistant', content: data.response ?? '' }])
        if (Array.isArray(data.suggested_event_ids)) {
          setSuggestedEventIds(data.suggested_event_ids)
        }
        if (mode === 'onboarding') {
          if (data.onboarding_complete) {
            setOnboardingComplete(true)
            setOnboardingPreferences(data.preferences ?? null)
          }
        }
      } catch (err) {
        setError(err?.message || 'Maxxer is taking a sec — try again')
      } finally {
        setIsLoading(false)
      }
    },
    [messages, isLoading, mode, userId],
  )

  // Bootstrap: trigger an assistant reply with no prior user input. Useful for
  // (a) onboarding opener and (b) proactive open-app suggestions (task 4.17).
  const bootstrap = useCallback(async () => {
    if (messages.length > 0 || isLoading) return
    setIsLoading(true)
    setError(null)
    try {
      const fn = mode === 'onboarding' ? sendOnboardingMessage : sendChatMessage
      const data = await fn({ userId, messages: [] })
      setMessages([{ role: 'assistant', content: data.response ?? '' }])
      if (Array.isArray(data.suggested_event_ids)) {
        setSuggestedEventIds(data.suggested_event_ids)
      }
    } catch (err) {
      setError(err?.message || 'Maxxer is taking a sec — try again')
    } finally {
      setIsLoading(false)
    }
  }, [messages.length, isLoading, mode, userId])

  const reset = useCallback(() => {
    setMessages([])
    setError(null)
    setSuggestedEventIds([])
    setOnboardingComplete(false)
    setOnboardingPreferences(null)
  }, [])

  return {
    messages,
    isLoading,
    error,
    suggestedEventIds,
    onboardingComplete,
    onboardingPreferences,
    send,
    bootstrap,
    reset,
  }
}
