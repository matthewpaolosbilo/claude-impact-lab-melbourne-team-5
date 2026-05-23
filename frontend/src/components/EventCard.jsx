import { Calendar, MapPin, Users } from 'lucide-react'
import { EVENT_TYPES } from '../utils/eventTypes'

function formatWhen(startIso, endIso) {
  const start = new Date(startIso)
  const end = new Date(endIso)
  const date = start.toLocaleDateString('en-AU', {
    weekday: 'short', day: 'numeric', month: 'short',
  })
  const time = (d) => d.toLocaleTimeString('en-AU', {
    hour: 'numeric', minute: '2-digit',
  })
  return `${date}, ${time(start)} to ${time(end)}`
}

// 3.8 EventCard. Compact summary card.
// Click card → open modal in view mode (parent owns modal state).
// RSVP button stub; real wiring lands in 3.10.
// Slots for Dev 4: 4.9 attendee avatars, 4.10 host badges.
export default function EventCard({ event, onOpen, onRsvp }) {
  const type = EVENT_TYPES[event.event_type] ?? { label: event.event_type, color: '#78716C' }
  const isGoing = event.user_rsvp === 'going' || event.user_rsvp === 'attended'
  const isFull =
    event.max_attendees != null && event.attendee_count >= event.max_attendees

  return (
    <button
      type="button"
      onClick={() => onOpen?.(event)}
      className="cursor-pointer w-full text-left rounded-card bg-white p-card shadow-card transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-cm-orange/40"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold text-cm-charcoal">{event.title}</h3>
        <span
          className="shrink-0 rounded-full px-2.5 py-1 text-xs font-medium text-white"
          style={{ backgroundColor: type.color }}
        >
          {type.label}
        </span>
      </div>

      <dl className="mt-2 space-y-1 text-sm text-cm-warm-gray">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" aria-hidden />
          <dd>{formatWhen(event.start_time, event.end_time)}</dd>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4" aria-hidden />
          <dd>{event.location?.name}</dd>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" aria-hidden />
          <dd>
            {event.attendee_count} going
            {event.max_attendees ? ` / ${event.max_attendees}` : ''}
            {/* 4.9 attendee avatars slot */}
          </dd>
        </div>
      </dl>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-cm-warm-gray">
          Hosted by {event.host?.name}
          {/* 4.10 host badge chips slot */}
        </span>
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation()
            if (!isFull && !isGoing) onRsvp?.(event)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.stopPropagation()
              if (!isFull && !isGoing) onRsvp?.(event)
            }
          }}
          aria-disabled={isFull || isGoing}
          className={`cursor-pointer rounded-full px-4 py-2 text-xs font-semibold transition sm:px-3 sm:py-1.5 ${
            isGoing
              ? 'bg-cm-green/15 text-cm-green'
              : isFull
              ? 'bg-cm-cream text-cm-warm-gray cursor-not-allowed'
              : 'bg-cm-orange text-white hover:bg-cm-orange/90'
          }`}
        >
          {isGoing ? "You're going" : isFull ? 'Full' : "I'm going"}
        </span>
      </div>
    </button>
  )
}
