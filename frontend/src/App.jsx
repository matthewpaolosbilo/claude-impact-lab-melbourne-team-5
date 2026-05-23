import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import NavHeader from './components/NavHeader'
import Home from './pages/Home'

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
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<ProfilePlaceholder />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
