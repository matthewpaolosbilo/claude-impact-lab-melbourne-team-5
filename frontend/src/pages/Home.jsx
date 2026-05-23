import { Plus } from 'lucide-react'
import MapView from '../components/MapView'
import { useLocations } from '../utils/useLocations'

// 3.7 Home layout. Slots downstream:
//   - SearchBar slot waits on Dev 2's 2.8
//   - Event list slot waits on Dev 3's 3.8 (EventCard) and Dev 1's 1.6 (GET /api/events)
//   - FAB click wires into 3.9 (EventModal create mode)
export default function Home() {
  const { locations, loading, error } = useLocations()
  const status = loading
    ? 'Loading locations…'
    : error
      ? 'Failed to load locations (check VITE_API_URL + backend CORS)'
      : `${locations.length} locations`
  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      {/* slot for 2.8 SearchBar — keyword input + type filter */}
      <div className="border-b border-black/10 bg-white/70 px-6 py-3 backdrop-blur">
        <div className="rounded-card bg-cm-cream/60 px-4 py-2 text-sm text-cm-warm-gray">
          Search bar slot — 2.8 SearchBar drops in here · {status}
        </div>
      </div>

      {/* map: ~60% of viewport height */}
      <div className="min-h-0 basis-[60%]">
        <MapView locations={locations} />
      </div>

      {/* slot for 3.8 EventCard list — empty state until 3.8 + Dev 1's 1.6 land */}
      <div className="min-h-0 flex-1 overflow-y-auto border-t border-black/10 bg-cm-cream px-6 py-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-cm-warm-gray">
          Upcoming events
        </h2>
        <div className="mt-3 rounded-card bg-white/70 p-card text-sm text-cm-warm-gray shadow-card">
          No events yet. Event cards land in task 3.8 once Dev 1 ships the events endpoint.
        </div>
      </div>

      {/* FAB: real create flow ships in 3.9 EventModal */}
      <button
        type="button"
        onClick={() => console.log('Add event — wire into 3.9 EventModal')}
        className="cursor-pointer absolute bottom-6 right-6 flex items-center gap-2 rounded-full bg-cm-orange px-5 py-3 text-sm font-semibold text-white shadow-card hover:bg-cm-orange/90"
        aria-label="Add event"
      >
        <Plus className="h-5 w-5" />
        <span>Add event</span>
      </button>
    </div>
  )
}
