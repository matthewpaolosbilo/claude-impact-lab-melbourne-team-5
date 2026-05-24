import { Link } from 'react-router-dom'
import { ExternalLink, UserCircle2, Moon, Sun } from 'lucide-react'
import { getInitials, OPEN_AUTH_EVENT, useUser } from '../hooks/useUser'
import spacdLogo from '../assets/spacd-hero-dark.svg'
import { useTheme } from '../hooks/useTheme'
import { InitialsAvatar } from './ui/Avatar'

const deckLinkStyles = {
  color: 'var(--color-lime-ink)',
  background: 'var(--color-lime)',
  outline: '2px solid var(--color-text-primary)',
  border: 'none',
  boxShadow: 'var(--shadow-pixel)',
  textDecoration: 'none',
}

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
      className="sticky top-0 z-20"
      style={{
        background: 'var(--color-surface)',
        borderBottom: '2px solid var(--color-text-primary)',
      }}
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link
          to="/"
          className="cursor-pointer flex min-w-0 items-center gap-3"
          aria-label="spacd home"
        >
          <img
            src={spacdLogo}
            alt="spacd"
            className="h-9 w-auto max-w-[150px] rounded-sm object-contain sm:max-w-[190px]"
          />
          <span
            className="hidden max-w-[240px] border-l-2 pl-3 font-body text-xs font-medium leading-tight sm:block lg:max-w-none"
            style={{
              borderColor: 'var(--color-text-primary)',
              color: 'var(--color-text-secondary)',
            }}
          >
            Community connection for international students
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <a
            href="/assets/spaced-deck.html"
            target="_blank"
            rel="noreferrer"
            className="hidden cursor-pointer items-center gap-2 px-3 py-2 font-brand text-xs uppercase leading-none md:inline-flex"
            style={deckLinkStyles}
          >
            <span>See pitch deck</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>

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
      </div>

      <div
        className="px-4 py-2 md:hidden"
        style={{ borderTop: '2px solid var(--color-border-strong)' }}
      >
        <a
          href="/assets/spaced-deck.html"
          target="_blank"
          rel="noreferrer"
          className="flex w-full cursor-pointer items-center justify-center gap-2 px-3 py-2 font-brand text-xs uppercase leading-none"
          style={deckLinkStyles}
        >
          <span>See pitch deck</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </header>
  )
}
