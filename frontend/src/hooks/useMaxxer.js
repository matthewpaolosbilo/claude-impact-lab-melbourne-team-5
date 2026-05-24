import { useCallback, useState } from 'react'
import { sendChatMessage, sendOnboardingMessage } from '../api'

// Session-only Maxxer chat. Per STATE.md task 4.13: "session-only React chat history" —
// nothing persisted to localStorage.
//
// mode: 'chat' (uses /api/chat) | 'onboarding' (uses /api/chat/onboarding)
//
// Each message: { role: 'user' | 'assistant', content: string }
// The assistant reply may include [EVENT:id] tags — that parsing happens at render time.
// Assistant messages also carry eventIds from the backend payload so cards can
// render even if a model response omits or rewrites tags.
//
// Returned shape:
//   { messages, isLoading, error, suggestedEventIds, onboardingComplete, send, reset }
export function useMaxxer({
  userId,
  mode = 'chat',
  initialMessages = [],
  initialSuggestedEventIds = [],
} = {}) {
  const [messages, setMessages] = useState(initialMessages)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [suggestedEventIds, setSuggestedEventIds] = useState(initialSuggestedEventIds)
  const [onboardingComplete, setOnboardingComplete] = useState(false)
  const [onboardingPreferences, setOnboardingPreferences] = useState(null)
  const [onboardingResult, setOnboardingResult] = useState(null)

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
        const eventIds = Array.isArray(data.suggested_event_ids)
          ? data.suggested_event_ids
          : []
        const assistantMessage = {
          role: 'assistant',
          content: data.response ?? '',
          eventIds,
        }
        setMessages((m) => [...m, assistantMessage])
        if (eventIds.length || Array.isArray(data.suggested_event_ids)) {
          setSuggestedEventIds(eventIds)
        }
        if (mode === 'onboarding') {
          if (data.onboarding_complete) {
            setOnboardingComplete(true)
            setOnboardingPreferences(data.preferences ?? null)
            setOnboardingResult({
              response: assistantMessage.content,
              suggestedEventIds: eventIds,
            })
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
      const eventIds = Array.isArray(data.suggested_event_ids)
        ? data.suggested_event_ids
        : []
      setMessages([{ role: 'assistant', content: data.response ?? '', eventIds }])
      if (eventIds.length || Array.isArray(data.suggested_event_ids)) {
        setSuggestedEventIds(eventIds)
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
    setOnboardingResult(null)
  }, [])

  return {
    messages,
    isLoading,
    error,
    suggestedEventIds,
    onboardingComplete,
    onboardingPreferences,
    onboardingResult,
    send,
    bootstrap,
    reset,
  }
}
