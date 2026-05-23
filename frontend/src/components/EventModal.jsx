import { useEffect, useState } from 'react'
import { X, Calendar, MapPin, Users } from 'lucide-react'
import { EVENT_TYPES, EVENT_TYPE_ORDER } from '../utils/eventTypes'
import { SEED_LOCATIONS } from '../utils/seedLocations'

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

// 3.9 EventModal. Dual mode: "view" shows an event; "create" shows the form.
// Backdrop click and Escape both close. Parent owns open state.
// Real POST /api/events wiring lands when Dev 1's 1.6 ships.
export default function EventModal({ open, mode = 'view', event, onClose, onSubmit, onRsvp }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState(null)
  const [prevOpen, setPrevOpen] = useState(open)

  // Reset form + error when the modal transitions to open.
  // Storing prevOpen avoids the setState-in-effect lint rule (React 19 idiom).
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-card bg-white p-card shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold text-cm-charcoal">
            {mode === 'create' ? 'Add an event' : event?.title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="cursor-pointer rounded-full p-1 text-cm-warm-gray hover:bg-cm-cream"
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
  const type = EVENT_TYPES[event.event_type] ?? { label: event.event_type, color: '#78716C' }
  const isGoing = event.user_rsvp === 'going' || event.user_rsvp === 'attended'
  const isFull =
    event.max_attendees != null && event.attendee_count >= event.max_attendees

  return (
    <>
      <span
        className="mt-2 inline-block rounded-full px-2.5 py-1 text-xs font-medium text-white"
        style={{ backgroundColor: type.color }}
      >
        {type.label}
      </span>

      <p className="mt-3 text-sm text-cm-charcoal">{event.description}</p>

      <dl className="mt-4 space-y-2 text-sm text-cm-warm-gray">
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
            {/* 4.9 attendee avatars slot */}
          </dd>
        </div>
      </dl>

      <p className="mt-3 text-xs text-cm-warm-gray">
        Hosted by {event.host?.name}
        {/* 4.10 host badge chips slot */}
      </p>

      <div className="mt-5 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="cursor-pointer rounded-full px-4 py-2 text-sm text-cm-charcoal hover:bg-cm-cream"
        >
          Close
        </button>
        <button
          type="button"
          onClick={() => !isFull && !isGoing && onRsvp?.(event)}
          disabled={isFull || isGoing}
          className={`cursor-pointer rounded-full px-4 py-2 text-sm font-semibold ${
            isGoing
              ? 'bg-cm-green/15 text-cm-green'
              : isFull
              ? 'bg-cm-cream text-cm-warm-gray cursor-not-allowed'
              : 'bg-cm-orange text-white hover:bg-cm-orange/90'
          }`}
        >
          {isGoing ? "You're going" : isFull ? 'Full' : "I'm going"}
        </button>
      </div>
    </>
  )
}

function CreateForm({ form, error, onChange, onSubmit, onClose }) {
  return (
    <form onSubmit={onSubmit} className="mt-3 space-y-3">
      <Field label="Title">
        <input
          type="text"
          value={form.title}
          onChange={onChange('title')}
          required
          className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm focus:border-cm-orange focus:outline-none"
        />
      </Field>

      <Field label="Description">
        <textarea
          value={form.description}
          onChange={onChange('description')}
          rows={3}
          className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm focus:border-cm-orange focus:outline-none"
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Type">
          <select
            value={form.event_type}
            onChange={onChange('event_type')}
            className="w-full cursor-pointer rounded-lg border border-black/10 px-3 py-2 text-sm focus:border-cm-orange focus:outline-none"
          >
            {EVENT_TYPE_ORDER.map((k) => (
              <option key={k} value={k}>{EVENT_TYPES[k].label}</option>
            ))}
          </select>
        </Field>

        <Field label="Location">
          <select
            value={form.location_id}
            onChange={onChange('location_id')}
            required
            className="w-full cursor-pointer rounded-lg border border-black/10 px-3 py-2 text-sm focus:border-cm-orange focus:outline-none"
          >
            <option value="">Choose...</option>
            {SEED_LOCATIONS.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Start">
          <input
            type="datetime-local"
            value={form.start_time}
            onChange={onChange('start_time')}
            required
            className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm focus:border-cm-orange focus:outline-none"
          />
        </Field>
        <Field label="End">
          <input
            type="datetime-local"
            value={form.end_time}
            onChange={onChange('end_time')}
            className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm focus:border-cm-orange focus:outline-none"
          />
        </Field>
      </div>

      <Field label="Max attendees (optional)">
        <input
          type="number"
          min="1"
          value={form.max_attendees}
          onChange={onChange('max_attendees')}
          className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm focus:border-cm-orange focus:outline-none"
        />
      </Field>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onClose}
          className="cursor-pointer rounded-full px-4 py-2 text-sm text-cm-charcoal hover:bg-cm-cream"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="cursor-pointer rounded-full bg-cm-orange px-4 py-2 text-sm font-semibold text-white hover:bg-cm-orange/90"
        >
          Create event
        </button>
      </div>
    </form>
  )
}

function Field({ label, children }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-cm-charcoal">{label}</span>
      {children}
    </label>
  )
}
