import { useState } from 'react'
import { Plus } from 'lucide-react'
import MapView from '../components/MapView'
import EventCard from '../components/EventCard'
import EventModal from '../components/EventModal'
import { SEED_LOCATIONS } from '../utils/seedLocations'
import { SEED_EVENTS } from '../utils/seedEvents'
import { useLocations } from '../utils/useLocations'

// 3.7 Home layout. Slots downstream:
//   - SearchBar slot waits on Dev 2's 2.8
//   - Event list now uses 3.8 EventCard against SEED_EVENTS; swap to Dev 1's 1.6 (GET /api/events) when live
//   - FAB opens 3.9 EventModal in create mode
//   - RSVP wiring is stubbed; real POST lands in 3.10
export default function Home() {
  const [events, setEvents] = useState(SEED_EVENTS)
  const [modal, setModal] = useState({ open: false, mode: 'view', event: null })
  const openView = (event) => setModal({ open: true, mode: 'view', event })
  const openCreate = () => setModal({ open: true, mode: 'create', event: null })
  const closeModal = () => setModal((m) => ({ ...m, open: false }))

  const handleRsvp = (event) => {
    // 3.10 will POST /api/events/{id}/rsvp. For now, optimistic local update.
    setEvents((list) =>
      list.map((e) =>
        e.id === event.id
          ? { ...e, user_rsvp: 'going', attendee_count: e.attendee_count + 1 }
          : e,
      ),
    )
    setModal((m) => (m.event?.id === event.id ? { ...m, open: false } : m))
  }

  const handleCreate = (draft) => {
    // 3.9 stub: insert locally so the new card appears. Real POST lands with Dev 1's 1.6.
    const location = SEED_LOCATIONS.find((l) => l.id === draft.location_id)
    const next = {
      id: Math.max(0, ...events.map((e) => e.id)) + 1,
      title: draft.title,
      description: draft.description,
      event_type: draft.event_type,
      start_time: draft.start_time,
      end_time: draft.end_time || draft.start_time,
      host: { id: 0, name: 'You' },
      location: location
        ? { id: location.id, name: location.name, type: location.type }
        : { id: draft.location_id, name: 'Unknown', type: 'bbq' },
      attendee_count: 1,
      max_attendees: draft.max_attendees,
      user_rsvp: 'going',
    }
    setEvents((list) => [next, ...list])
    closeModal()
  }

  const { locations, loading, error } = useLocations()
  const status = loading
    : error
      ? 'Failed to load locations (check VITE_API_URL + backend CORS)'
      : `${locations.length} locations`
  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div className="border-b border-black/10 bg-white/70 px-6 py-3 backdrop-blur">
        <div className="rounded-card bg-cm-cream/60 px-4 py-2 text-sm text-cm-warm-gray">
          Search bar slot — 2.8 SearchBar drops in here · {status}
        </div>
      </div>

      {/* map: ~60% of viewport height */}
      <div className="min-h-0 basis-[60%]">
        <MapView locations={locations} />
      </div>

      {/* event list — 3.8 EventCard against seed data */}
      <div className="min-h-0 flex-1 overflow-y-auto border-t border-black/10 bg-cm-cream px-6 py-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-cm-warm-gray">
          Upcoming events
        </h2>
        {events.length === 0 ? (
          <div className="mt-3 rounded-card bg-white/70 p-card text-sm text-cm-warm-gray shadow-card">
            No events yet. Tap "Add event" to host one.
          </div>
        ) : (
          <ul className="mt-3 space-y-3">
            {events.map((event) => (
              <li key={event.id}>
                <EventCard event={event} onOpen={openView} onRsvp={handleRsvp} />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* FAB: opens 3.9 EventModal in create mode */}
      <button
        type="button"
        onClick={openCreate}
        className="cursor-pointer absolute bottom-6 right-6 flex items-center gap-2 rounded-full bg-cm-orange px-5 py-3 text-sm font-semibold text-white shadow-card hover:bg-cm-orange/90"
        aria-label="Add event"
      >
        <Plus className="h-5 w-5" />
        <span>Add event</span>
      </button>

      <EventModal
        open={modal.open}
        mode={modal.mode}
        event={modal.event}
        onClose={closeModal}
        onSubmit={handleCreate}
        onRsvp={handleRsvp}
      />
    </div>
  )
}
