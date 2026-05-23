import { Link } from 'react-router-dom'
import { UserCircle2 } from 'lucide-react'

// 3.5 nav header. Auth-aware avatar/name lands in 3.6.
export default function NavHeader() {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-black/10 bg-white/80 px-6 py-3 backdrop-blur shadow-card">
      <Link
        to="/"
        className="cursor-pointer text-lg font-bold text-cm-charcoal hover:text-cm-orange"
      >
        Community Maxxing
      </Link>

      {/* slot for 3.6: replace with real user avatar + name once auth flow lands */}
      <Link
        to="/profile"
        className="cursor-pointer flex items-center gap-2 rounded-full px-3 py-1.5 text-sm text-cm-charcoal hover:bg-cm-cream"
      >
        <UserCircle2 className="h-5 w-5 text-cm-warm-gray" />
        <span>Sign in</span>
      </Link>
    </header>
  )
}
