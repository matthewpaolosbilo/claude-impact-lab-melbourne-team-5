import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import MapView from './components/MapView'
import { useLocations } from './utils/useLocations'

// placeholder for 3.7 (Home.jsx layout: search + map + event list + FAB)
// currently renders MapView fullscreen against /api/locations — Dev 3 to fold
// into a proper search + map + event-list layout in 3.7
function HomePlaceholder() {
  const { locations, loading, error } = useLocations()
  const status = loading
    ? 'Loading locations…'
    : error
      ? 'Failed to load locations (check VITE_API_URL + backend CORS)'
      : `${locations.length} locations`
  return (
    <div className="flex h-screen flex-col bg-cm-cream text-cm-charcoal">
      <header className="border-b border-black/10 bg-white/70 px-6 py-4 backdrop-blur">
        <h1 className="text-2xl font-bold">Community Maxxing</h1>
        <p className="text-xs text-cm-warm-gray">
          {status}.{' '}
          <Link to="/profile" className="underline">/profile</Link>
        </p>
      </header>
      <main className="min-h-0 flex-1">
        <MapView locations={locations} />
      </main>
    </div>
  )
}

// placeholder for Dev 4's 4.6 (Profile.jsx: ProfilePanel + BadgeShelf + RSVP history)
function ProfilePlaceholder() {
  return (
    <div className="min-h-screen bg-cm-cream text-cm-charcoal p-8">
      <h1 className="text-3xl font-bold">Profile</h1>
      <p className="mt-6 text-cm-warm-gray">
        Profile placeholder. Real page lands in Dev 4 task 4.6.
      </p>
      <Link
        to="/"
        className="mt-4 inline-block underline cursor-pointer text-cm-charcoal"
      >
        Back to /
      </Link>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePlaceholder />} />
        <Route path="/profile" element={<ProfilePlaceholder />} />
      </Routes>
    </BrowserRouter>
  )
}
