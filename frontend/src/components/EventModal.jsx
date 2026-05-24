import { useEffect, useState } from 'react'
import { X, Calendar, MapPin, Users } from 'lucide-react'
import { EVENT_TYPES, EVENT_TYPE_ORDER } from '../utils/eventTypes'
import Input, { Textarea, Select, Label, HelpText } from './ui/Input'
import Button from './ui/Button'
import Badge from './ui/Badge'

const EMPTY_FORM = {
  title: '',
  description: '',
  event_type: 'social',
  location_id: '',
  start_time: '',
  end_time: '',
  max_attendees: '',
}

function formatRange(startIso, endIso) {
  const start = new Date(startIso)
  const end = new Date(endIso)
  const date = start.toLocaleDateString('en-AU', {
    weekday: 'long', day: 'numeric', month: 'long',
  })
  const time = (d) =>
    d.toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit' })
  return `${date}, ${time(start)} to ${time(end)}`
}

export default function EventModal({ open, mode = 'view', event, locations = [], onClose, onSubmit, onRsvp }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState(null)
  const [prevOpen, setPrevOpen] = useState(open)

  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      setError(null)
      if (mode === 'create') setForm(EMPTY_FORM)
    }
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onClose?.() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) return setError('Title is required.')
    if (!form.event_type) return setError('Pick an event type.')
    if (!form.location_id) return setError('Pick a location.')
    if (!form.start_time) return setError('Set a start time.')
    if (form.end_time && form.end_time < form.start_time) {
      return setError('End time must be after start time.')
    }
    onSubmit?.({
      ...form,
      location_id: Number(form.location_id),
      max_attendees: form.max_attendees ? Number(form.max_attendees) : null,
    })
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto px-4 pb-8 pt-6 sm:items-center sm:p-4"
      style={{ background: 'rgba(20, 20, 19, 0.6)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg overflow-y-auto"
        style={{
          maxHeight: 'calc(100dvh - 56px)',
          background: 'var(--color-surface)',
          color: 'var(--color-text-primary)',
          outline: '2px solid var(--color-text-primary)',
          boxShadow: 'var(--shadow-pixel)',
          borderRadius: 'var(--radius-md)',
          padding: 20,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-brand uppercase" style={{ fontSize: 18, letterSpacing: '0.02em' }}>
            {mode === 'create' ? 'Add an event' : event?.title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="cursor-pointer p-1"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-text-secondary)',
            }}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {mode === 'view' && event ? (
          <ViewBody event={event} onRsvp={onRsvp} onClose={onClose} />
        ) : (
          <CreateForm
            form={form}
            error={error}
            locations={locations}
            onChange={update}
            onSubmit={handleSubmit}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  )
}

function ViewBody({ event, onRsvp, onClose }) {
  const type = EVENT_TYPES[event.event_type] ?? { label: event.event_type, badgeVariant: 'neutral' }
  const isGoing = event.user_rsvp === 'going' || event.user_rsvp === 'attended'
  const isFull =
    event.max_attendees != null && event.attendee_count >= event.max_attendees

  return (
    <>
      <div className="mt-3">
        <Badge variant={type.badgeVariant}>{type.label}</Badge>
      </div>

      <p className="font-body mt-3" style={{ fontSize: 14, lineHeight: 1.6 }}>
        {event.description}
      </p>

      <dl
        className="font-mono mt-4 space-y-2"
        style={{ fontSize: 12, color: 'var(--color-text-secondary)', letterSpacing: '0.04em' }}
      >
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" aria-hidden />
          <dd>{formatRange(event.start_time, event.end_time)}</dd>
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
          </dd>
        </div>
      </dl>

      <p
        className="font-mono mt-3"
        style={{ fontSize: 10, color: 'var(--color-text-tertiary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}
      >
        Hosted by {event.host?.name}
      </p>

      <div className="mt-5 flex items-center justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>Close</Button>
        <Button
          variant={isGoing || isFull ? 'ghost' : 'lime'}
          onClick={() => !isFull && !isGoing && onRsvp?.(event)}
          disabled={isFull || isGoing}
        >
          {isGoing ? "You're going" : isFull ? 'Full' : "I'm going"}
        </Button>
      </div>
    </>
  )
}

function CreateForm({ form, error, locations, onChange, onSubmit, onClose }) {
  return (
    <form onSubmit={onSubmit} className="mt-4 space-y-3">
      <div>
        <Label htmlFor="ev-title" required>Title</Label>
        <Input id="ev-title" type="text" value={form.title} onChange={onChange('title')} required />
      </div>

      <div>
        <Label htmlFor="ev-desc">Description</Label>
        <Textarea id="ev-desc" value={form.description} onChange={onChange('description')} rows={3} />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="ev-type" required>Type</Label>
          <Select id="ev-type" value={form.event_type} onChange={onChange('event_type')}>
            {EVENT_TYPE_ORDER.map((k) => (
              <option key={k} value={k}>{EVENT_TYPES[k].label}</option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="ev-loc" required>Location</Label>
          <Select id="ev-loc" value={form.location_id} onChange={onChange('location_id')} required>
            <option value="">Choose…</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="ev-start" required>Start</Label>
          <Input id="ev-start" type="datetime-local" value={form.start_time} onChange={onChange('start_time')} required />
        </div>
        <div>
          <Label htmlFor="ev-end">End</Label>
          <Input id="ev-end" type="datetime-local" value={form.end_time} onChange={onChange('end_time')} />
        </div>
      </div>

      <div>
        <Label htmlFor="ev-max">Max attendees (optional)</Label>
        <Input id="ev-max" type="number" min="1" value={form.max_attendees} onChange={onChange('max_attendees')} />
      </div>

      {error && <HelpText error>{error}</HelpText>}

      <div className="flex items-center justify-end gap-2 pt-2">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button type="submit" variant="primary">Create event</Button>
      </div>
    </form>
  )
}
