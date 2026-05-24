import { useEffect, useRef, useState } from 'react'
import { Send, Sparkles } from 'lucide-react'
import { useMaxxer } from '../hooks/useMaxxer'

export default function OnboardingChat({ userId, onComplete }) {
  const [draft, setDraft] = useState('')
  const threadRef = useRef(null)
  const inputRef = useRef(null)
  const {
    messages,
    isLoading,
    error,
    suggestedEventIds,
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

  useEffect(() => {
    if (onboardingComplete) {
      const finalAssistantMessage = [...messages]
        .reverse()
        .find((message) => message.role === 'assistant')
      const t = setTimeout(() => onComplete?.(onboardingPreferences, {
        response: finalAssistantMessage?.content ?? '',
        suggestedEventIds,
      }), 500)
      return () => clearTimeout(t)
    }
  }, [messages, onboardingComplete, onboardingPreferences, onComplete, suggestedEventIds])

  const submit = (e) => {
    e?.preventDefault()
    const text = draft
    setDraft('')
    send(text)
  }

  return (
    <div
      className="flex min-h-0 flex-1 items-center justify-center px-4 py-6"
      style={{ background: 'var(--color-bg-primary)' }}
    >
      <div className="flex h-full w-full max-w-xl min-w-0 flex-col">
        <header className="flex items-center gap-2 px-2 pb-3">
          <Sparkles className="h-5 w-5" style={{ color: 'var(--color-electric)' }} />
          <h1 className="font-brand uppercase" style={{ fontSize: 20, letterSpacing: '0.04em' }}>
            Meet the Maxxer ✨
          </h1>
        </header>

        <div
          ref={threadRef}
          className="min-w-0 flex-1 space-y-3 overflow-y-auto"
          style={{
            background: 'var(--color-surface)',
            outline: '2px solid var(--color-text-primary)',
            boxShadow: 'var(--shadow-pixel)',
            padding: 16,
          }}
        >
          {messages.map((m, i) => {
            const isFinalRecommendation =
              onboardingComplete && i === messages.length - 1 && m.role === 'assistant'
            if (isFinalRecommendation) return null
            return <OnboardingBubble key={i} message={m} />
          })}
          {isLoading && <OnboardingTyping />}
          {error && (
            <div
              className="font-mono"
              style={{
                background: '#ffe5e0',
                color: '#6b1a0c',
                outline: '2px solid var(--color-coral)',
                padding: '8px 12px',
                fontSize: 11,
                letterSpacing: '0.04em',
              }}
            >
              {error}
            </div>
          )}
          {onboardingComplete && (
            <div
              className="font-brand uppercase"
              style={{
                background: 'var(--color-lime)',
                color: 'var(--color-lime-ink)',
                outline: '2px solid var(--color-text-primary)',
                padding: '8px 12px',
                fontSize: 12,
                letterSpacing: '0.04em',
              }}
            >
              All set ✨ taking you to the map…
            </div>
          )}
        </div>

        <form onSubmit={submit} className="mt-3">
          <div
            className="flex min-w-0 items-center gap-2"
            style={{
              background: 'var(--color-surface)',
              outline: '2px solid var(--color-text-primary)',
              padding: '8px 12px',
              boxShadow: 'var(--shadow-pixel)',
            }}
          >
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="type your answer…"
              disabled={isLoading || onboardingComplete}
              className="font-body min-w-0 flex-1 bg-transparent outline-none"
              style={{
                fontSize: 16,
                color: 'var(--color-text-primary)',
                border: 'none',
              }}
            />
            <button
              type="submit"
              disabled={isLoading || onboardingComplete || !draft.trim()}
              aria-label="Send"
              className="cursor-pointer"
              style={{
                background: 'var(--color-lime)',
                color: 'var(--color-lime-ink)',
                outline: '2px solid var(--color-text-primary)',
                border: 'none',
                padding: 6,
                boxShadow: 'var(--shadow-pixel-sm)',
                opacity: isLoading || onboardingComplete || !draft.trim() ? 0.4 : 1,
              }}
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
        className="font-body"
        style={{
          maxWidth: '88%',
          background: isUser ? 'var(--color-text-primary)' : 'var(--color-bg-secondary)',
          color: isUser ? 'var(--color-bg-primary)' : 'var(--color-text-primary)',
          outline: '2px solid var(--color-text-primary)',
          padding: '8px 12px',
          fontSize: 13,
          lineHeight: 1.5,
        }}
      >
        <span className="whitespace-pre-wrap">{message.content}</span>
      </div>
    </div>
  )
}

function OnboardingTyping() {
  return (
    <div className="flex justify-start">
      <div
        style={{
          background: 'var(--color-bg-secondary)',
          outline: '2px solid var(--color-text-primary)',
          padding: '8px 12px',
        }}
      >
        <span className="inline-flex items-center gap-1">
          {[0, 120, 240].map((delay) => (
            <span
              key={delay}
              className="animate-pulse"
              style={{
                width: 6,
                height: 6,
                background: 'var(--color-text-secondary)',
                animationDelay: `${delay}ms`,
              }}
            />
          ))}
        </span>
      </div>
    </div>
  )
}
