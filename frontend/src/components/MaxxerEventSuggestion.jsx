import { MapPin, Calendar } from 'lucide-react'
import { LOCATION_TYPES } from '../utils/constants'
import Button from './ui/Button'
import Badge from './ui/Badge'

// Map LOCATION_TYPES (which carry CSS hex colours) onto PXL Badge variants.
const TYPE_TO_VARIANT = {
  bbq: 'coral',
  garden_bed: 'mint',
  community_kitchen: 'electric',
}

export default function MaxxerEventSuggestion({ event, onOpen, onRsvp }) {
  if (!event) {
    return (
      <div
        className="my-2 font-mono"
        style={{
          padding: '8px 12px',
          fontSize: 11,
          color: 'var(--color-text-tertiary)',
          background: 'var(--color-bg-secondary)',
          outline: '2px dashed var(--color-border-strong)',
          letterSpacing: '0.04em',
        }}
      >
        EVENT NOT FOUND
      </div>
    )
  }
  const typeMeta = LOCATION_TYPES[event.location?.type] ?? null
  const typeVariant = TYPE_TO_VARIANT[event.location?.type] || 'neutral'
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
    <div
      className="my-2"
      style={{
        background: 'var(--color-surface)',
        outline: '2px solid var(--color-text-primary)',
        boxShadow: 'var(--shadow-pixel)',
        padding: 12,
      }}
    >
      <button
        type="button"
        onClick={() => onOpen?.(event)}
        className="block w-full cursor-pointer text-left"
        style={{ background: 'transparent', border: 'none', padding: 0 }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="font-brand truncate" style={{ fontSize: 14, color: 'var(--color-text-primary)' }}>
              {event.title}
            </div>
            <div
              className="font-mono mt-1 flex items-center gap-2"
              style={{ fontSize: 10, color: 'var(--color-text-secondary)', letterSpacing: '0.04em' }}
            >
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{event.location?.name ?? 'TBA'}</span>
            </div>
            {when && (
              <div
                className="font-mono mt-0.5 flex items-center gap-2"
                style={{ fontSize: 10, color: 'var(--color-text-secondary)', letterSpacing: '0.04em' }}
              >
                <Calendar className="h-3 w-3 shrink-0" />
                <span>{when}</span>
              </div>
            )}
          </div>
          {typeMeta && <Badge variant={typeVariant}>{typeMeta.label}</Badge>}
        </div>
      </button>
      <div className="mt-3 flex items-center justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={() => onOpen?.(event)}>
          View
        </Button>
        <Button
          variant={going ? 'ghost' : 'lime'}
          size="sm"
          disabled={going}
          onClick={() => onRsvp?.(event)}
        >
          {going ? "You're going" : "I'm going"}
        </Button>
      </div>
    </div>
  )
}
