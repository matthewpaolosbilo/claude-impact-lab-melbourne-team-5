import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import MapView from '../components/MapView'
import EventCard from '../components/EventCard'
import EventModal from '../components/EventModal'
import ChatPanel from '../components/ChatPanel'
import { useLocations } from '../utils/useLocations'
import { useEvents } from '../utils/useEvents'
import { useUser } from '../hooks/useUser'
import { useToast } from '../hooks/useToast'
import { useBadgeWatcher } from '../hooks/useBadgeWatcher'
import { rsvpToEvent } from '../api'

// 3.7 Home layout + Dev 4 Maxxer wiring (4.13/4.14/4.16/4.17).
// 3.10 RSVP wiring is real (POST /api/events/{id}/rsvp with X-User-Id, optimistic
// + rollback, toast on success/failure, triggers badge re-check).
// Onboarding gating happens upstream in Dev 3's 3.7.1 OnboardingGate (App.jsx).
// Maxxer surfaces as a floating panel rather than the inline sidebar/drawer
// slots from 3.7.2 — see PR notes for follow-up if we want to inline it.
export default function Home() {
  const { user } = useUser()
  const { events, setEvents } = useEvents()
  const { locations } = useLocations()
  const toast = useToast()
  const { triggerBadgeCheck } = useBadgeWatcher(user?.id)

  const [modal, setModal] = useState({ open: false, mode: 'view', event: null })
  const [suggestedEventIds, setSuggestedEventIds] = useState([])

  const eventsById = useMemo(() => new Map(events.map((e) => [e.id, e])), [events])

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
      <div className="border-b border-black/10 bg-white/70 px-4 py-3 backdrop-blur sm:px-6">
        <div className="rounded-card bg-cm-cream/60 px-4 py-2 text-sm text-cm-warm-gray">
          {suggestedEventIds.length > 0
            ? `Maxxer is highlighting ${suggestedEventIds.length} pick${suggestedEventIds.length === 1 ? '' : 's'} below`
            : 'Search bar slot — 2.8 SearchBar drops in here'}
        </div>
      </div>

      <div className="h-[45vh] min-h-0 sm:h-[50vh] lg:h-auto lg:basis-[60%]">
        {/* 3.7.2 contract: pass event IDs; Dev 2's MapView highlight resolves them. */}
        <MapView locations={locations} highlightedEventIds={suggestedEventIds} />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto border-t border-black/10 bg-cm-cream px-4 py-4 sm:px-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-cm-warm-gray">
          Upcoming events
        </h2>
        {sortedEvents.length === 0 ? (
          <div className="mt-3 rounded-card bg-white/70 p-card text-sm text-cm-warm-gray shadow-card">
            No events yet. Tap "Add event" to host one.
          </div>
        ) : (
          <ul className="mt-3 space-y-3 pb-24">
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
        className="cursor-pointer absolute bottom-6 right-4 flex items-center gap-2 rounded-full bg-cm-orange px-4 py-3 text-sm font-semibold text-white shadow-card hover:bg-cm-orange/90 sm:right-6 sm:px-5"
        aria-label="Add event"
      >
        <Plus className="h-5 w-5" />
        <span className="hidden sm:inline">Add event</span>
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
