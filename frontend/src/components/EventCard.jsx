import { Calendar, MapPin, Users } from 'lucide-react'
import { EVENT_TYPES } from '../utils/eventTypes'
import Card from './ui/Card'
import Badge from './ui/Badge'
import Button from './ui/Button'

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

export default function EventCard({ event, onOpen, onRsvp }) {
  const type = EVENT_TYPES[event.event_type] ?? { label: event.event_type, badgeVariant: 'neutral', accent: 'amber' }
  const isGoing = event.user_rsvp === 'going' || event.user_rsvp === 'attended'
  const isFull =
    event.max_attendees != null && event.attendee_count >= event.max_attendees

  return (
    <Card accent={type.accent} interactive className="!p-0">
      <button
        type="button"
        onClick={() => onOpen?.(event)}
        className="cursor-pointer w-full text-left"
        style={{ background: 'transparent', border: 'none', padding: 0 }}
      >
        <div style={{ padding: 16 }}>
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-brand" style={{ fontSize: 16, color: 'var(--color-text-primary)' }}>
              {event.title}
            </h3>
            <Badge variant={type.badgeVariant}>{type.label}</Badge>
          </div>

          <dl
            className="font-mono mt-3 space-y-1"
            style={{ fontSize: 11, color: 'var(--color-text-secondary)', letterSpacing: '0.04em' }}
          >
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3" aria-hidden />
              <dd>{formatWhen(event.start_time, event.end_time)}</dd>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-3 w-3" aria-hidden />
              <dd>{event.location?.name}</dd>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-3 w-3" aria-hidden />
              <dd>
                {event.attendee_count} going
                {event.max_attendees ? ` / ${event.max_attendees}` : ''}
              </dd>
            </div>
          </dl>

          <div className="mt-3 flex items-center justify-between">
            <span
              className="font-mono"
              style={{ fontSize: 10, color: 'var(--color-text-tertiary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}
            >
              Hosted by {event.host?.name}
            </span>
            <span
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
            >
              <Button
                as="span"
                variant={isGoing ? 'ghost' : isFull ? 'ghost' : 'lime'}
                size="sm"
                disabled={isGoing || isFull}
                tabIndex={isGoing || isFull ? -1 : 0}
              >
                {isGoing ? "You're going" : isFull ? 'Full' : "I'm going"}
              </Button>
            </span>
          </div>
        </div>
      </button>
    </Card>
  )
}
