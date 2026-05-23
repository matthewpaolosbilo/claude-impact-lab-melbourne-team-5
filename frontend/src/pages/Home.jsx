import { useMemo, useRef, useState } from 'react'
import { Plus } from 'lucide-react'
import MapView from '../components/MapView'
import EventCard from '../components/EventCard'
import EventModal from '../components/EventModal'
import SearchBar from '../components/SearchBar'
import ChatPanel from '../components/ChatPanel'
import { useLocations } from '../utils/useLocations'
import { useEvents } from '../utils/useEvents'
import { useUser } from '../hooks/useUser'
import { useToast } from '../hooks/useToast'
import { useBadgeWatcher } from '../hooks/useBadgeWatcher'
import { rsvpToEvent } from '../api'

// 3.7 Home layout + Dev 4 Maxxer wiring (4.13/4.14/4.16/4.17).
// Dev 2 SearchBar filters locations and events, and MapView highlights selected
// locations plus Maxxer suggested events mapped through their location IDs.
export default function Home() {
  const { user } = useUser()
  const { events, setEvents } = useEvents()
  const { locations, loading: locationsLoading, error: locationsError } = useLocations()
  const toast = useToast()
  const { triggerBadgeCheck } = useBadgeWatcher(user?.id)

  const [modal, setModal] = useState({ open: false, mode: 'view', event: null })
  const [suggestedEventIds, setSuggestedEventIds] = useState([])
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [selectedLocationId, setSelectedLocationId] = useState(null)
  const eventRefs = useRef(new Map())

  const eventsById = useMemo(() => new Map(events.map((e) => [e.id, e])), [events])

  const openView = (event) => setModal({ open: true, mode: 'view', event })
  const openCreate = () => setModal({ open: true, mode: 'create', event: null })
  const closeModal = () => setModal((m) => ({ ...m, open: false }))

  const normalizedQuery = query.trim().toLowerCase()
  const filteredLocations = useMemo(() => {
    return locations.filter((loc) => {
      const matchesType = typeFilter === 'all' || loc.type === typeFilter
      const matchesQuery =
        !normalizedQuery ||
        [loc.name, loc.address, loc.description, loc.type]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(normalizedQuery))
      return matchesType && matchesQuery
    })
  }, [locations, normalizedQuery, typeFilter])

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesType =
        typeFilter === 'all' || event.location?.type === typeFilter
      const matchesQuery =
        !normalizedQuery ||
        [
          event.title,
          event.description,
          event.event_type,
          event.host?.name,
          event.location?.name,
          event.location?.type,
        ]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(normalizedQuery))
      return matchesType && matchesQuery
    })
  }, [events, normalizedQuery, typeFilter])

  const sortedEvents = useMemo(() => {
    const suggested = new Set(suggestedEventIds)
    return [...filteredEvents].sort((a, b) => {
      const aS = suggested.has(a.id) ? 0 : 1
      const bS = suggested.has(b.id) ? 0 : 1
      if (aS !== bS) return aS - bS
      return new Date(a.start_time) - new Date(b.start_time)
    })
  }, [filteredEvents, suggestedEventIds])

  const highlightedLocationIds = useMemo(() => {
    const ids = new Set()
    if (selectedLocationId) ids.add(selectedLocationId)
    suggestedEventIds.forEach((eventId) => {
      const event = eventsById.get(eventId)
      if (event?.location?.id) ids.add(event.location.id)
    })
    return Array.from(ids)
  }, [eventsById, selectedLocationId, suggestedEventIds])

  const handleClearSearch = () => {
    setQuery('')
    setTypeFilter('all')
    setSelectedLocationId(null)
  }

  const handleLocationSelect = (location) => {
    setSelectedLocationId(location.id)
    const matchingEvent = sortedEvents.find((event) => event.location?.id === location.id)
    if (!matchingEvent) return

    window.requestAnimationFrame(() => {
      eventRefs.current.get(matchingEvent.id)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    })
  }

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

  const status = locationsLoading
    ? 'Loading locations...'
    : locationsError
      ? 'Failed to load locations (check VITE_API_URL + backend CORS)'
      : `${filteredLocations.length} places · ${sortedEvents.length} events`

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div className="sticky top-[65px] z-20 border-b border-black/10 bg-white/85 px-4 py-3 backdrop-blur sm:px-6">
        <SearchBar
          query={query}
          type={typeFilter}
          onQueryChange={setQuery}
          onTypeChange={(nextType) => {
            setTypeFilter(nextType)
            setSelectedLocationId(null)
          }}
          onClear={handleClearSearch}
          resultLabel={status}
          disabled={locationsLoading}
        />
      </div>

      <div className="min-h-[320px] basis-[48vh] sm:basis-[60%]">
        <MapView
          locations={filteredLocations}
          onSelect={handleLocationSelect}
          selectedLocationId={selectedLocationId}
          highlightedLocationIds={highlightedLocationIds}
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto border-t border-black/10 bg-cm-cream px-4 py-4 sm:px-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-cm-warm-gray">
          Upcoming events
        </h2>
        {sortedEvents.length === 0 ? (
          <div className="mt-3 rounded-card bg-white/70 p-card text-sm text-cm-warm-gray shadow-card">
            No matches yet. Try a different search, or tap "Add event" to host one.
          </div>
        ) : (
          <ul className="mt-3 space-y-3">
            {sortedEvents.map((event) => {
              const suggested = suggestedEventIds.includes(event.id)
              const selected = selectedLocationId === event.location?.id
              return (
                <li
                  key={event.id}
                  ref={(node) => {
                    if (node) eventRefs.current.set(event.id, node)
                    else eventRefs.current.delete(event.id)
                  }}
                  className={
                    suggested || selected
                      ? 'rounded-card ring-2 ring-cm-gold ring-offset-2 ring-offset-cm-cream'
                      : ''
                  }
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
        className="cursor-pointer absolute bottom-4 right-4 flex items-center gap-2 rounded-full bg-cm-orange px-4 py-3 text-sm font-semibold text-white shadow-card hover:bg-cm-orange/90 sm:bottom-6 sm:right-6 sm:px-5"
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
