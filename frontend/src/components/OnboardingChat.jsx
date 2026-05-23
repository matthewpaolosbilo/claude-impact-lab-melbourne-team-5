import { useEffect, useRef, useState } from 'react'
import { Send, Sparkles } from 'lucide-react'
import { useMaxxer } from '../hooks/useMaxxer'

// 4.15 — fullscreen conversational onboarding. Replaces Home until the user has
// `preferences` set. Calls /api/chat/onboarding. On completion, invokes
// `onComplete(preferences)` so the host can persist + flip the app gate.
export default function OnboardingChat({ userId, onComplete }) {
  const [draft, setDraft] = useState('')
  const threadRef = useRef(null)
  const inputRef = useRef(null)
  const {
    messages,
    isLoading,
    error,
    send,
    bootstrap,
    onboardingComplete,
    onboardingPreferences,
  } = useMaxxer({ userId, mode: 'onboarding' })

  useEffect(() => {
    bootstrap()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const el = threadRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, isLoading])

  useEffect(() => {
    if (!isLoading) inputRef.current?.focus()
  }, [isLoading])

  // Once the mock/real flow reports complete, surface preferences to the host.
  useEffect(() => {
    if (onboardingComplete) {
      const t = setTimeout(() => onComplete?.(onboardingPreferences), 1200)
      return () => clearTimeout(t)
    }
  }, [onboardingComplete, onboardingPreferences, onComplete])

  const submit = (e) => {
    e?.preventDefault()
    const text = draft
    setDraft('')
    send(text)
  }

  return (
    <div className="flex min-h-0 flex-1 items-center justify-center bg-gradient-to-br from-cm-cream via-white to-cm-cream px-4 py-6">
      <div className="flex h-full w-full max-w-xl flex-col">
        <header className="flex items-center gap-2 px-2 pb-3">
          <Sparkles className="h-5 w-5 text-cm-gold" />
          <h1 className="text-lg font-semibold text-cm-charcoal">Meet the Maxxer</h1>
        </header>

        <div
          ref={threadRef}
          className="flex-1 space-y-3 overflow-y-auto rounded-card bg-white/70 p-card shadow-card ring-1 ring-black/5"
        >
          {messages.map((m, i) => (
            <OnboardingBubble key={i} message={m} />
          ))}
          {isLoading && <OnboardingTyping />}
          {error && (
            <div className="rounded-card bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </div>
          )}
          {onboardingComplete && (
            <div className="rounded-card bg-cm-gold/15 px-3 py-2 text-xs font-semibold text-cm-charcoal">
              all set ✨ taking you to the map…
            </div>
          )}
        </div>

        <form onSubmit={submit} className="mt-3">
          <div className="flex items-center gap-2 rounded-full bg-white px-4 py-3 shadow-card ring-1 ring-black/5 focus-within:ring-cm-orange">
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="type your answer…"
              disabled={isLoading || onboardingComplete}
              className="flex-1 bg-transparent text-sm text-cm-charcoal outline-none placeholder:text-cm-warm-gray disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || onboardingComplete || !draft.trim()}
              aria-label="Send"
              className="cursor-pointer rounded-full bg-cm-orange p-2 text-white shadow-card disabled:cursor-default disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function OnboardingBubble({ message }) {
  const isUser = message.role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[88%] rounded-2xl px-3 py-2 text-sm ${
          isUser
            ? 'bg-cm-charcoal text-white'
            : 'bg-cm-cream text-cm-charcoal ring-1 ring-black/5'
        }`}
      >
        <span className="whitespace-pre-wrap">{message.content}</span>
      </div>
    </div>
  )
}

function OnboardingTyping() {
  return (
    <div className="flex justify-start">
      <div className="rounded-2xl bg-cm-cream px-3 py-2 ring-1 ring-black/5">
        <span className="inline-flex items-center gap-1">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cm-warm-gray" />
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cm-warm-gray" style={{ animationDelay: '120ms' }} />
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cm-warm-gray" style={{ animationDelay: '240ms' }} />
        </span>
      </div>
    </div>
  )
}
