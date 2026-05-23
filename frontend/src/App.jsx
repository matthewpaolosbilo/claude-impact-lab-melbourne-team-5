import MapView from './components/MapView'
import { SEED_LOCATIONS } from './utils/seedLocations'

export default function App() {
  return (
    <div className="flex h-screen flex-col bg-cm-cream text-cm-charcoal">
      <header className="border-b border-black/10 bg-white/70 px-6 py-4 backdrop-blur">
        <h1 className="text-2xl font-bold">Community Maxxing</h1>
        <p className="text-xs text-cm-warm-gray">Map smoke test — {SEED_LOCATIONS.length} seed locations</p>
      </header>
      <main className="min-h-0 flex-1">
        <MapView locations={SEED_LOCATIONS} />
      </main>
    </div>
  )
}
