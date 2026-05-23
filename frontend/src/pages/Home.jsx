import { useState } from 'react'
import { Plus } from 'lucide-react'
import MapView from '../components/MapView'
import EventCard from '../components/EventCard'
import EventModal from '../components/EventModal'
import ChatPanelSlot from '../components/ChatPanelSlot'
import { SEED_EVENTS } from '../utils/seedEvents'
import { useLocations } from '../utils/useLocations'
import { useUser } from '../hooks/useUser'
import { useToast } from '../hooks/useToast'
import { useBadgeWatcher } from '../hooks/useBadgeWatcher'
import { rsvpToEvent } from '../api'

// 3.7 Home layout. Slots downstream:
//   - SearchBar slot waits on Dev 2's 2.8
//   - Event list uses 3.8 EventCard against SEED_EVENTS; swap to live GET /api/events as a follow-up
//   - FAB opens 3.9 EventModal in create mode
//   - 3.10 RSVP now POSTs to /api/events/{id}/rsvp with X-User-Id header (optimistic + rollback)
export default function Home() {
  const [events, setEvents] = useState(SEED_EVENTS)
  const [modal, setModal] = useState({ open: false, mode: 'view', event: null })
  // 3.7.2 shared state: Maxxer (Dev 4's 4.13/4.16) sets these, MapView (Dev 2's 2.5 follow-up) highlights them.
  const [suggestedEventIds, setSuggestedEventIds] = useState([])
  const { locations, loading, error } = useLocations()
  const { user } = useUser()
  const toast = useToast()
  const { triggerBadgeCheck } = useBadgeWatcher(user?.id)
  const openView = (event) => setModal({ open: true, mode: 'view', event })
  const openCreate = () => setModal({ open: true, mode: 'create', event: null })
  const closeModal = () => setModal((m) => ({ ...m, open: false }))

  const applyRsvpState = (eventId, patch) =>
    setEvents((list) => list.map((e) => (e.id === eventId ? { ...e, ...patch } : e)))

  const handleRsvp = async (event) => {
    if (!user) {
      window.dispatchEvent(new Event('community-maxxing-open-auth'))
      toast.info('Sign in to RSVP')
      return
    }

    // 3.10 optimistic update; close modal if this event is open.
    const prev = {
      user_rsvp: event.user_rsvp,
      attendee_count: event.attendee_count,
    }
    applyRsvpState(event.id, {
      user_rsvp: 'going',
      attendee_count: event.attendee_count + 1,
    })
    setModal((m) => (m.event?.id === event.id ? { ...m, open: false } : m))

    try {
      await rsvpToEvent(event.id, user.id)
      toast.success("You're going!")
      triggerBadgeCheck()
    } catch (err) {
      // 409 = already RSVP'd. Treat as success: keep optimistic state, no error noise.
      if (err?.response?.status === 409) {
        triggerBadgeCheck()
        return
      }
      applyRsvpState(event.id, prev)
      toast.error("Couldn't RSVP. Try again in a moment.")
    }
  }

  const handleCreate = (draft) => {
    // 3.9 stub: insert locally so the new card appears. Real POST lands with Dev 1's 1.6.
    const location = locations.find((l) => l.id === draft.location_id)
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

  const status = loading
    ? 'Loading locations…'
    : error
      ? 'Failed to load locations (check VITE_API_URL + backend CORS)'
      : `${locations.length} locations`
  return (
    <div className="relative flex min-h-0 flex-1 flex-col lg:flex-row">
      {/* LEFT column: existing search + map + list + FAB + mobile drawer slot */}
      <div className="relative flex min-h-0 flex-1 flex-col">
        <div className="border-b border-black/10 bg-white/70 px-6 py-3 backdrop-blur">
          <div className="rounded-card bg-cm-cream/60 px-4 py-2 text-sm text-cm-warm-gray">
            Search bar slot — 2.8 SearchBar drops in here · {status}
          </div>
        </div>

        {/* map: ~60% of viewport height */}
        <div className="min-h-0 basis-[60%]">
          <MapView
            locations={locations}
            highlightedEventIds={suggestedEventIds}
          />
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

        {/* 3.7.2 mobile drawer slot — visible <lg, hidden when sidebar is shown */}
        <ChatPanelSlot
          variant="drawer"
          suggestedEventIds={suggestedEventIds}
          onSuggestedEventIds={setSuggestedEventIds}
          className="lg:hidden"
        />

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
      </div>

      {/* 3.7.2 desktop sidebar slot — hidden <lg */}
      <aside className="hidden border-l border-black/10 bg-white/70 lg:flex lg:w-80 xl:w-96">
        <ChatPanelSlot
          variant="sidebar"
          suggestedEventIds={suggestedEventIds}
          onSuggestedEventIds={setSuggestedEventIds}
        />
      </aside>

      <EventModal
        open={modal.open}
        mode={modal.mode}
        event={modal.event}
        locations={locations}
        onClose={closeModal}
        onSubmit={handleCreate}
        onRsvp={handleRsvp}
      />
    </div>
  )
}
