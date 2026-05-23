import { useEffect, useRef, useState } from 'react'
import { ChevronRight, MessageCircle, Send, Sparkles } from 'lucide-react'
import { useMaxxer } from '../hooks/useMaxxer'
import { parseMaxxerText } from '../utils/maxxerParse'
import MaxxerEventSuggestion from './MaxxerEventSuggestion'

// 4.13 — Maxxer chat panel. Collapsible sidebar on desktop (right edge),
// bottom drawer on mobile. Session-only history.
// 4.16 — emits suggested event IDs up via `onSuggestionsChange` so Home.jsx can
// highlight them on the map.
// 4.17 — proactive open-app: when `proactiveOnMount` is true we bootstrap one
// assistant reply with 3 picks before the user types.
export default function ChatPanel({
  userId,
  eventsById,
  onOpenEvent,
  onRsvp,
  onSuggestionsChange,
  proactiveOnMount = false,
}) {
  const [isOpen, setIsOpen] = useState(false)
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
  } = useMaxxer({ userId, mode: 'chat' })

  // Forward suggestion IDs to Home for map highlighting (task 4.16).
  useEffect(() => {
    onSuggestionsChange?.(suggestedEventIds)
  }, [suggestedEventIds, onSuggestionsChange])

  // Proactive open-app pick (task 4.17). Fires once when panel mounts.
  useEffect(() => {
    if (proactiveOnMount) bootstrap()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proactiveOnMount])

  // Auto-scroll thread to bottom on new messages / loading state.
  useEffect(() => {
    const el = threadRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, isLoading])

  // Focus input when panel opens.
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
      {/* Floating opener — visible when panel is closed. */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open Maxxer chat"
          className="cursor-pointer fixed bottom-24 right-6 z-30 flex items-center gap-2 rounded-full bg-cm-charcoal px-4 py-3 text-sm font-semibold text-white shadow-card hover:bg-cm-charcoal/90 md:right-8"
        >
          <Sparkles className="h-4 w-4 text-cm-gold" />
          <span>Ask Maxxer</span>
        </button>
      )}

      {/* Backdrop (mobile drawer behavior). */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden
        />
      )}

      {/* Panel: bottom drawer on mobile, right sidebar on desktop. */}
      <aside
        className={`fixed z-40 flex flex-col bg-white shadow-card ring-1 ring-black/5 transition-transform duration-200 ${
          isOpen ? 'translate-y-0 md:translate-x-0' : 'translate-y-full md:translate-y-0 md:translate-x-full'
        } inset-x-0 bottom-0 h-[70vh] rounded-t-2xl md:inset-y-0 md:right-0 md:left-auto md:h-auto md:w-[380px] md:rounded-none md:rounded-l-2xl`}
        aria-hidden={!isOpen}
      >
        <header className="flex items-center justify-between border-b border-black/5 px-4 py-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-cm-gold" />
            <h2 className="text-sm font-semibold text-cm-charcoal">Maxxer</h2>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Close Maxxer chat"
            className="cursor-pointer rounded-full p-1 text-cm-warm-gray hover:bg-cm-cream"
          >
            <ChevronRight className="h-4 w-4 md:rotate-0 rotate-90" />
          </button>
        </header>

        <div
          ref={threadRef}
          className="flex-1 space-y-3 overflow-y-auto bg-cm-cream/40 px-4 py-3"
        >
          {messages.length === 0 && !isLoading && (
            <EmptyState />
          )}
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
            <div className="rounded-card bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </div>
          )}
        </div>

        <form onSubmit={submit} className="border-t border-black/5 px-3 py-3">
          <div className="flex items-center gap-2 rounded-full bg-cm-cream px-3 py-2 ring-1 ring-black/5 focus-within:ring-cm-orange">
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="ask Maxxer anything…"
              disabled={isLoading}
              className="flex-1 bg-transparent text-sm text-cm-charcoal outline-none placeholder:text-cm-warm-gray disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !draft.trim()}
              aria-label="Send message"
              className="cursor-pointer rounded-full bg-cm-orange p-2 text-white shadow-card disabled:cursor-default disabled:opacity-40"
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
    <div className="rounded-card bg-white p-card text-sm text-cm-warm-gray shadow-card">
      <div className="flex items-center gap-2 text-cm-charcoal">
        <MessageCircle className="h-4 w-4" />
        <span className="font-semibold">heyyy 👋</span>
      </div>
      <p className="mt-2">
        I'm the Maxxer. Ask me what's on this week, what fits your vibe, or where to
        meet people fr.
      </p>
    </div>
  )
}

function TypingBubble() {
  return (
    <div className="flex items-center gap-1">
      <div className="rounded-2xl bg-white px-3 py-2 shadow-card ring-1 ring-black/5">
        <span className="inline-flex items-center gap-1">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cm-warm-gray" />
          <span
            className="h-1.5 w-1.5 animate-pulse rounded-full bg-cm-warm-gray"
            style={{ animationDelay: '120ms' }}
          />
          <span
            className="h-1.5 w-1.5 animate-pulse rounded-full bg-cm-warm-gray"
            style={{ animationDelay: '240ms' }}
          />
        </span>
      </div>
    </div>
  )
}

function MessageBubble({ message, eventsById, onOpenEvent, onRsvp }) {
  const isUser = message.role === 'user'
  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl bg-cm-charcoal px-3 py-2 text-sm text-white">
          {message.content}
        </div>
      </div>
    )
  }
  const { segments } = parseMaxxerText(message.content)
  return (
    <div className="flex justify-start">
      <div className="max-w-[92%] rounded-2xl bg-white px-3 py-2 text-sm text-cm-charcoal shadow-card ring-1 ring-black/5">
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
