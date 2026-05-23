import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import MapView from '../components/MapView'
import EventCard from '../components/EventCard'
import EventModal from '../components/EventModal'
import ChatPanel from '../components/ChatPanel'
import OnboardingChat from '../components/OnboardingChat'
import { useLocations } from '../utils/useLocations'
import { useEvents } from '../utils/useEvents'
import { useUser } from '../hooks/useUser'

// 3.7 Home layout + Dev 4 Maxxer wiring (4.13/4.14/4.15/4.16/4.17).
// Temporary onboarding gate built here (Dev 3's 3.7.1) — handed off whenever Dev 3
// formalises the app-shell version.
export default function Home() {
  const { user, setUser } = useUser()
  const { events, setEvents } = useEvents()
  const { locations } = useLocations()
  const [modal, setModal] = useState({ open: false, mode: 'view', event: null })
  const [suggestedEventIds, setSuggestedEventIds] = useState([])

  const eventsById = useMemo(() => new Map(events.map((e) => [e.id, e])), [events])
  const suggestedLocationIds = useMemo(
    () =>
      suggestedEventIds
        .map((id) => eventsById.get(id)?.location?.id)
        .filter((x) => x != null),
    [suggestedEventIds, eventsById],
  )

  // Gate: signed-in user without preferences → fullscreen onboarding (4.15).
  // When Dev 1's 1.10.2 lands, `user.preferences` will arrive on GET /api/users/{id}.
  if (user && !user.preferences) {
    return (
      <OnboardingChat
        userId={user.id}
        onComplete={(prefs) => {
          // Stash on the local user so the gate flips. Real backend persists
          // server-side; the next GET /api/users/{id} will hydrate the same shape.
          setUser({ ...user, preferences: prefs ?? { onboarded: true } })
        }}
      />
    )
  }

  const openView = (event) => setModal({ open: true, mode: 'view', event })
  const openCreate = () => setModal({ open: true, mode: 'create', event: null })
  const closeModal = () => setModal((m) => ({ ...m, open: false }))

  const handleRsvp = (event) => {
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

  // Sort: suggested events first, then chronological.
  const sortedEvents = useMemo(() => {
    const suggested = new Set(suggestedEventIds)
    return [...events].sort((a, b) => {
      const aS = suggested.has(a.id) ? 0 : 1
      const bS = suggested.has(b.id) ? 0 : 1
      if (aS !== bS) return aS - bS
      return new Date(a.start_time) - new Date(b.start_time)
    })
  }, [events, suggestedEventIds])

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div className="border-b border-black/10 bg-white/70 px-6 py-3 backdrop-blur">
        <div className="rounded-card bg-cm-cream/60 px-4 py-2 text-sm text-cm-warm-gray">
          {suggestedEventIds.length > 0
            ? `Maxxer is highlighting ${suggestedEventIds.length} pick${suggestedEventIds.length === 1 ? '' : 's'} below`
            : 'Search bar slot — 2.8 SearchBar drops in here'}
        </div>
      </div>

      <div className="min-h-0 basis-[60%]">
        {/* 4.16: passing suggestedLocationIds for future Dev 2 map-highlight prop. */}
        <MapView locations={locations} highlightedLocationIds={suggestedLocationIds} />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto border-t border-black/10 bg-cm-cream px-6 py-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-cm-warm-gray">
          Upcoming events
        </h2>
        {sortedEvents.length === 0 ? (
          <div className="mt-3 rounded-card bg-white/70 p-card text-sm text-cm-warm-gray shadow-card">
            No events yet. Tap "Add event" to host one.
          </div>
        ) : (
          <ul className="mt-3 space-y-3">
            {sortedEvents.map((event) => {
              const suggested = suggestedEventIds.includes(event.id)
              return (
                <li
                  key={event.id}
                  className={suggested ? 'rounded-card ring-2 ring-cm-gold' : ''}
                >
                  <EventCard event={event} onOpen={openView} onRsvp={handleRsvp} />
                </li>
              )
            })}
          </ul>
        )}
      </div>

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
        locations={locations}
        onClose={closeModal}
        onSubmit={handleCreate}
        onRsvp={handleRsvp}
      />

      {user && (
        <ChatPanel
          userId={user.id}
          eventsById={eventsById}
          onOpenEvent={openView}
          onRsvp={handleRsvp}
          onSuggestionsChange={setSuggestedEventIds}
          proactiveOnMount
        />
      )}
    </div>
  )
}
