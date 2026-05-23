import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import MapView from './components/MapView'
import NavHeader from './components/NavHeader'
import { SEED_LOCATIONS } from './utils/seedLocations'

// placeholder for 3.7 (Home.jsx layout: search + map + event list + FAB)
// currently renders MapView fullscreen with the seed mock — Dev 3 to fold
// into a proper search + map + event-list layout in 3.7
function HomePlaceholder() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b border-black/10 bg-white/70 px-6 py-3 backdrop-blur">
        <p className="text-xs text-cm-warm-gray">
          Map smoke test — {SEED_LOCATIONS.length} seed locations.{' '}
          <Link to="/profile" className="underline">/profile</Link>
        </p>
      </div>
      <main className="min-h-0 flex-1">
        <MapView locations={SEED_LOCATIONS} />
      </main>
    </div>
  )
}

// placeholder for Dev 4's 4.6 (Profile.jsx: ProfilePanel + BadgeShelf + RSVP history)
function ProfilePlaceholder() {
  return (
    <div className="bg-cm-cream text-cm-charcoal p-8">
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
      <div className="flex h-screen flex-col bg-cm-cream text-cm-charcoal">
        <NavHeader />
        <Routes>
          <Route path="/" element={<HomePlaceholder />} />
          <Route path="/profile" element={<ProfilePlaceholder />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
