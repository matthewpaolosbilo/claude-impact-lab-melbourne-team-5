import { useEffect, useRef, useState } from 'react'
import { ChevronRight, MessageCircle, Send, Sparkles } from 'lucide-react'
import { useMaxxer } from '../hooks/useMaxxer'
import { parseMaxxerText } from '../utils/maxxerParse'
import MaxxerEventSuggestion from './MaxxerEventSuggestion'

export default function ChatPanel({
  userId,
  eventsById,
  onOpenEvent,
  onRsvp,
  onSuggestionsChange,
  initialMessages = [],
  initialSuggestedEventIds = [],
  defaultOpen = false,
  proactiveOnMount = false,
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
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
  } = useMaxxer({
    userId,
    mode: 'chat',
    initialMessages,
    initialSuggestedEventIds,
  })

  useEffect(() => {
    onSuggestionsChange?.(suggestedEventIds)
  }, [suggestedEventIds, onSuggestionsChange])

  useEffect(() => {
    if (proactiveOnMount && initialMessages.length === 0) bootstrap()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proactiveOnMount, initialMessages.length])

  useEffect(() => {
    const el = threadRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, isLoading])

  useEffect(() => {
    if (isOpen) inputRef.current?.focus()
  }, [isOpen])

  const submit = (e) => {
    e?.preventDefault()
    const text = draft
    setDraft('')
    send(text)
  }

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open Maxxer chat"
          className="cursor-pointer fixed font-brand uppercase flex items-center gap-2 md:right-8"
          style={{
            bottom: 90,
            right: 16,
            zIndex: 30,
            background: 'var(--color-electric)',
            color: 'var(--color-electric-ink)',
            padding: '10px 16px',
            fontSize: 13,
            letterSpacing: '0.04em',
            outline: '2px solid var(--color-text-primary)',
            border: 'none',
            boxShadow: 'var(--shadow-pixel)',
            borderRadius: 0,
          }}
        >
          <Sparkles className="h-4 w-4" />
          <span>Ask Maxxer ⚡</span>
        </button>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-30 md:hidden"
          style={{ background: 'rgba(20, 20, 19, 0.5)' }}
          onClick={() => setIsOpen(false)}
          aria-hidden
        />
      )}

      <aside
        className={`fixed z-40 flex max-w-full min-w-0 flex-col transition-transform duration-200 ${
          isOpen ? 'translate-y-0 md:translate-x-0' : 'translate-y-full md:translate-y-0 md:translate-x-full'
        } inset-x-0 bottom-0 h-[70vh] md:inset-y-0 md:right-0 md:left-auto md:h-auto md:w-[380px]`}
        style={{
          background: 'var(--color-surface)',
          outline: '2px solid var(--color-text-primary)',
          boxShadow: '-6px 0 0 var(--color-electric)',
        }}
        aria-hidden={!isOpen}
      >
        <header
          className="flex items-center justify-between px-4 py-3"
          style={{ borderBottom: '2px solid var(--color-text-primary)' }}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" style={{ color: 'var(--color-electric)' }} />
            <h2 className="font-brand uppercase" style={{ fontSize: 14, letterSpacing: '0.04em' }}>
              Maxxer
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Close Maxxer chat"
            className="cursor-pointer p-1"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-text-secondary)',
            }}
          >
            <ChevronRight className="h-4 w-4 md:rotate-0 rotate-90" />
          </button>
        </header>

        <div
          ref={threadRef}
          className="min-w-0 flex-1 space-y-3 overflow-y-auto px-4 py-3"
          style={{ background: 'var(--color-bg-secondary)' }}
        >
          {messages.length === 0 && !isLoading && <EmptyState />}
          {messages.map((m, i) => (
            <MessageBubble
              key={i}
              message={m}
              eventsById={eventsById}
              onOpenEvent={onOpenEvent}
              onRsvp={onRsvp}
            />
          ))}
          {isLoading && <TypingBubble />}
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
        </div>

        <form
          onSubmit={submit}
          className="px-3 py-3"
          style={{ borderTop: '2px solid var(--color-text-primary)', background: 'var(--color-surface)' }}
        >
          <div
            className="flex min-w-0 items-center gap-2"
            style={{
              background: 'var(--color-bg-secondary)',
              outline: '2px solid var(--color-border-strong)',
              padding: '6px 10px',
            }}
          >
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="ask maxxer anything…"
              disabled={isLoading}
              className="font-body min-w-0 flex-1 bg-transparent outline-none"
              style={{
                fontSize: 16,
                color: 'var(--color-text-primary)',
                border: 'none',
              }}
            />
            <button
              type="submit"
              disabled={isLoading || !draft.trim()}
              aria-label="Send message"
              className="cursor-pointer"
              style={{
                background: 'var(--color-lime)',
                color: 'var(--color-lime-ink)',
                outline: '2px solid var(--color-text-primary)',
                border: 'none',
                padding: 6,
                boxShadow: 'var(--shadow-pixel-sm)',
                opacity: isLoading || !draft.trim() ? 0.4 : 1,
              }}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      </aside>
    </>
  )
}

function EmptyState() {
  return (
    <div
      style={{
        background: 'var(--color-surface)',
        outline: '2px solid var(--color-text-primary)',
        boxShadow: 'var(--shadow-pixel)',
        padding: 14,
      }}
    >
      <div className="flex items-center gap-2 font-brand uppercase" style={{ fontSize: 13, letterSpacing: '0.04em' }}>
        <MessageCircle className="h-4 w-4" />
        <span>Heyyy 👋</span>
      </div>
      <p className="font-body mt-2" style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
        I'm the Maxxer. Ask me what's on this week, what fits your vibe, or where to meet people fr ⚡
      </p>
    </div>
  )
}

function TypingBubble() {
  return (
    <div className="flex justify-start">
      <div
        style={{
          background: 'var(--color-surface)',
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

function MessageBubble({ message, eventsById, onOpenEvent, onRsvp }) {
  const isUser = message.role === 'user'
  if (isUser) {
    return (
      <div className="flex min-w-0 justify-end">
        <div
          className="min-w-0 font-body"
          style={{
            maxWidth: '85%',
            background: 'var(--color-text-primary)',
            color: 'var(--color-bg-primary)',
            outline: '2px solid var(--color-text-primary)',
            padding: '8px 12px',
            fontSize: 13,
            lineHeight: 1.5,
          }}
        >
          {message.content}
        </div>
      </div>
    )
  }
  const { segments } = parseMaxxerText(message.content)
  return (
    <div className="flex min-w-0 justify-start">
      <div
        className="min-w-0 font-body"
        style={{
          maxWidth: '92%',
          background: 'var(--color-surface)',
          color: 'var(--color-text-primary)',
          outline: '2px solid var(--color-text-primary)',
          padding: '8px 12px',
          fontSize: 13,
          lineHeight: 1.5,
        }}
      >
        {segments.map((seg, i) =>
          seg.kind === 'text' ? (
            <span key={i} className="whitespace-pre-wrap">
              {seg.text}
            </span>
          ) : (
            <MaxxerEventSuggestion
              key={i}
              event={eventsById?.get(seg.eventId)}
              onOpen={onOpenEvent}
              onRsvp={onRsvp}
            />
          ),
        )}
      </div>
    </div>
  )
}
