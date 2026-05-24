import { useEffect, useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { api } from '../api'
import { OPEN_AUTH_EVENT, useUser } from '../hooks/useUser'
import Input, { Label, HelpText } from './ui/Input'
import Button from './ui/Button'

export default function AuthModal() {
  const { user, setUser } = useUser()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) setOpen(true)
    function openHandler() {
      setOpen(true)
    }
    window.addEventListener(OPEN_AUTH_EVENT, openHandler)
    return () => {
      window.removeEventListener(OPEN_AUTH_EVENT, openHandler)
    }
  }, [user])

  if (!open) return null

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    if (!name.trim() || !password.trim()) {
      setError('Please enter your name and the shared password.')
      return
    }
    setSubmitting(true)
    try {
      const { data } = await api.post('/api/users', {
        name: name.trim(),
        password: password.trim(),
      })
      if (!data || !data.id || !data.token) {
        throw new Error('Unexpected response from server.')
      }
      setUser({ id: data.id, name: data.name, email: data.email, token: data.token })
      setOpen(false)
      setName('')
      setPassword('')
    } catch (err) {
      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        'Could not sign you in. Please try again.'
      setError(String(message))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(20, 20, 19, 0.6)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div
        className="w-full max-w-md"
        style={{
          background: 'var(--color-surface)',
          color: 'var(--color-text-primary)',
          outline: '2px solid var(--color-text-primary)',
          boxShadow: 'var(--shadow-pixel)',
          borderRadius: 'var(--radius-md)',
          padding: 24,
        }}
      >
        {/* Accent stripe */}
        <div
          aria-hidden
          style={{
            height: 4,
            background: 'var(--color-lime)',
            margin: '-24px -24px 20px',
          }}
        />
        <h2 id="auth-modal-title" className="font-brand uppercase" style={{ fontSize: 22, letterSpacing: '0.03em' }}>
          Welcome to spacd
        </h2>
        <p className="font-body mt-2" style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
          This app was produced in a single day at{' '}
          <a
            href="https://claudecommunity.com.au/events/claude-impact-lab-melbourne"
            target="_blank"
            rel="noreferrer"
            style={{
              color: 'var(--color-text-primary)',
              textDecoration: 'underline',
              textDecorationThickness: 2,
              textUnderlineOffset: 3,
            }}
          >
            Claude Impact Lab Melbourne
          </a>
          .
        </p>

        <a
          href="/assets/spaced-deck.html"
          target="_blank"
          rel="noreferrer"
          className="mt-4 flex cursor-pointer items-center justify-between gap-3 px-3 py-3 font-body"
          style={{
            color: '#1A1917',
            background: 'var(--color-lime)',
            outline: '2px solid var(--color-text-primary)',
            boxShadow: 'var(--shadow-pixel)',
            textDecoration: 'none',
          }}
        >
          <span className="flex min-w-0 flex-col gap-1">
            <span className="font-brand text-xs uppercase leading-none">See pitch deck</span>
            <span className="text-xs leading-snug" style={{ color: '#1A1917' }}>
              New here? Peek at the idea before jumping in.
            </span>
          </span>
          <ExternalLink className="h-4 w-4 shrink-0" />
        </a>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div>
            <Label htmlFor="auth-name" required>Name</Label>
            <Input
              id="auth-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
              autoComplete="name"
              placeholder="Jane Resident"
            />
          </div>

          <div>
            <Label htmlFor="auth-password" required>Shared password</Label>
            <Input
              id="auth-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="Ask the hackathon team"
            />
          </div>

          {error && <HelpText error>{error}</HelpText>}

          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Continue'}
          </Button>
        </form>
      </div>
    </div>
  )
}
