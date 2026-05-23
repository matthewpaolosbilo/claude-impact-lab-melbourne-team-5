import { Link } from 'react-router-dom'
import { UserCircle2, Moon, Sun } from 'lucide-react'
import { getInitials, OPEN_AUTH_EVENT, useUser } from '../hooks/useUser'
import { useTheme } from '../hooks/useTheme'
import { InitialsAvatar } from './ui/Avatar'

// NavHeader: pixel-style top bar with Bungee wordmark, theme toggle, and
// auth-aware profile link. Sticky.
export default function NavHeader() {
  const { user } = useUser()
  const { isDark, toggleTheme } = useTheme()

  function openAuth() {
    window.dispatchEvent(new Event(OPEN_AUTH_EVENT))
  }

  return (
    <header
      className="sticky top-0 z-20 flex items-center justify-between gap-3 px-4 py-3 sm:px-6"
      style={{
        background: 'var(--color-surface)',
        borderBottom: '2px solid var(--color-text-primary)',
      }}
    >
      <Link
        to="/"
        className="cursor-pointer truncate font-brand uppercase"
        style={{
          fontSize: 22,
          letterSpacing: '0.04em',
          color: 'var(--color-text-primary)',
          textDecoration: 'none',
        }}
      >
        spacd
      </Link>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          title={isDark ? 'Light mode' : 'Dark mode'}
          className="cursor-pointer inline-flex items-center justify-center"
          style={{
            width: 36,
            height: 36,
            background: 'var(--color-bg-secondary)',
            outline: '2px solid var(--color-text-primary)',
            borderRadius: 0,
            border: 'none',
            color: 'var(--color-text-primary)',
          }}
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {user ? (
          <Link
            to="/profile"
            className="cursor-pointer flex items-center gap-2 px-3 py-1.5 font-body"
            style={{
              fontSize: 13,
              color: 'var(--color-text-primary)',
              background: 'var(--color-bg-secondary)',
              outline: '2px solid var(--color-text-primary)',
              textDecoration: 'none',
            }}
          >
            <InitialsAvatar initials={getInitials(user.name)} size={24} />
            <span className="font-brand uppercase" style={{ letterSpacing: '0.02em' }}>{user.name}</span>
          </Link>
        ) : (
          <button
            type="button"
            onClick={openAuth}
            className="cursor-pointer flex items-center gap-2 px-3 py-1.5 font-brand uppercase"
            style={{
              fontSize: 13,
              letterSpacing: '0.04em',
              color: 'var(--color-text-primary)',
              background: 'var(--color-lime)',
              outline: '2px solid var(--color-text-primary)',
              border: 'none',
              boxShadow: 'var(--shadow-pixel)',
            }}
          >
            <UserCircle2 className="h-4 w-4" />
            <span>Sign in</span>
          </button>
        )}
      </div>
    </header>
  )
}
