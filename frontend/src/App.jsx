import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'

// placeholder for 3.7 (Home.jsx layout: search + map + event list + FAB)
function HomePlaceholder() {
  return (
    <div className="min-h-screen bg-cm-cream text-cm-charcoal p-8">
      <h1 className="text-3xl font-bold">Community Maxxing</h1>
      <div className="mt-4 inline-block px-4 py-2 rounded-xl bg-cm-orange text-white">
        Tailwind v4 + brand tokens working
      </div>
      <p className="mt-6 text-cm-warm-gray">
        Home placeholder. Real layout lands in task 3.7.
      </p>
      <Link
        to="/profile"
        className="mt-4 inline-block underline cursor-pointer text-cm-charcoal"
      >
        Go to /profile
      </Link>
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
