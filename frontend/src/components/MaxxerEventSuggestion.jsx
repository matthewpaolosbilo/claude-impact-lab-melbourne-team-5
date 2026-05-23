import { MapPin, Calendar } from 'lucide-react'
import { LOCATION_TYPES } from '../utils/constants'

// Compact event card rendered inline inside a Maxxer chat bubble. One per [EVENT:id].
// Falls back to a "unknown event" pill if the id isn't in the events map (e.g. the
// agent hallucinated an id — backend's 1.10.5 is supposed to reject this, but be safe).
export default function MaxxerEventSuggestion({ event, onOpen, onRsvp }) {
  if (!event) {
    return (
      <div className="my-2 rounded-card border border-dashed border-cm-warm-gray/40 bg-white/50 px-3 py-2 text-xs text-cm-warm-gray">
        Event reference not found in current list.
      </div>
    )
  }
  const typeMeta = LOCATION_TYPES[event.location?.type] ?? null
  const start = event.start_time ? new Date(event.start_time) : null
  const when = start
    ? start.toLocaleString('en-AU', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : ''
  const going = event.user_rsvp === 'going' || event.user_rsvp === 'attended'

  return (
    <div className="my-2 rounded-card bg-white p-3 shadow-card ring-1 ring-black/5">
      <button
        type="button"
        onClick={() => onOpen?.(event)}
        className="block w-full cursor-pointer text-left"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-cm-charcoal">
              {event.title}
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs text-cm-warm-gray">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{event.location?.name ?? 'TBA'}</span>
            </div>
            {when && (
              <div className="mt-0.5 flex items-center gap-2 text-xs text-cm-warm-gray">
                <Calendar className="h-3.5 w-3.5 shrink-0" />
                <span>{when}</span>
              </div>
            )}
          </div>
          {typeMeta && (
            <span
              className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white"
              style={{ background: typeMeta.color }}
            >
              {typeMeta.label}
            </span>
          )}
        </div>
      </button>
      <div className="mt-2 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => onOpen?.(event)}
          className="cursor-pointer rounded-full px-3 py-1 text-xs font-medium text-cm-charcoal hover:bg-cm-cream"
        >
          View
        </button>
        <button
          type="button"
          onClick={() => onRsvp?.(event)}
          disabled={going}
          className={`cursor-pointer rounded-full px-3 py-1 text-xs font-semibold text-white ${
            going ? 'bg-cm-green/80' : 'bg-cm-orange hover:bg-cm-orange/90'
          } disabled:cursor-default`}
        >
          {going ? "You're going" : "I'm going"}
        </button>
      </div>
    </div>
  )
}
