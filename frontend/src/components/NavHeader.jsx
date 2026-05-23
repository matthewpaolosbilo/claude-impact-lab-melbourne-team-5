import { Link } from 'react-router-dom'
import { UserCircle2 } from 'lucide-react'
import { getInitials, useUser } from '../hooks/useUser'

// 3.5 nav header, made auth-aware in 3.6.
export default function NavHeader() {
  const { user } = useUser()

  function openAuth() {
    window.dispatchEvent(new Event('community-maxxing-open-auth'))
  }

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-black/10 bg-white/80 px-6 py-3 backdrop-blur shadow-card">
      <Link
        to="/"
        className="cursor-pointer text-lg font-bold text-cm-charcoal hover:text-cm-orange"
      >
        Community Maxxing
      </Link>

      {user ? (
        <Link
          to="/profile"
          className="cursor-pointer flex items-center gap-2 rounded-full px-3 py-1.5 text-sm text-cm-charcoal hover:bg-cm-cream"
        >
          <span
            aria-hidden="true"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-cm-orange text-xs font-semibold text-white"
          >
            {getInitials(user.name)}
          </span>
          <span className="font-medium">{user.name}</span>
        </Link>
      ) : (
        <button
          type="button"
          onClick={openAuth}
          className="cursor-pointer flex items-center gap-2 rounded-full px-3 py-1.5 text-sm text-cm-charcoal hover:bg-cm-cream"
        >
          <UserCircle2 className="h-5 w-5 text-cm-warm-gray" />
          <span>Sign in</span>
        </button>
      )}
    </header>
  )
}
