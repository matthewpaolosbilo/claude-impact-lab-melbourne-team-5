import { useEffect, useState } from 'react'
import { api } from '../api'
import { useUser } from '../hooks/useUser'

// 3.6 first-visit auth modal. No passwords; just name + email.
// POSTs to /api/users (Dev 1 contract: returns existing user if email matches,
// otherwise creates one). Stores the returned user in localStorage.
export default function AuthModal() {
  const { user, setUser } = useUser()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  // Open on first visit (no stored user). Also listen for an app-wide
  // "open sign-in" event so NavHeader can pop the modal on click.
  useEffect(() => {
    if (!user) setOpen(true)
    function openHandler() {
      setOpen(true)
    }
    window.addEventListener('community-maxxing-open-auth', openHandler)
    return () => {
      window.removeEventListener('community-maxxing-open-auth', openHandler)
    }
  }, [user])

  if (!open) return null

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    if (!name.trim() || !email.trim()) {
      setError('Please enter both your name and email.')
      return
    }
    setSubmitting(true)
    try {
      const { data } = await api.post('/api/users', {
        name: name.trim(),
        email: email.trim(),
      })
      if (!data || !data.id) {
        throw new Error('Unexpected response from server.')
      }
      setUser({ id: data.id, name: data.name, email: data.email })
      setOpen(false)
      setName('')
      setEmail('')
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="w-full max-w-md rounded-card bg-cm-cream p-card shadow-card">
        <h2
          id="auth-modal-title"
          className="text-2xl font-bold text-cm-charcoal"
        >
          Welcome to Community Maxxing
        </h2>
        <p className="mt-2 text-sm text-cm-warm-gray">
          Tell us who you are so we can credit your RSVPs and check-ins. No
          passwords, just identification.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm font-medium text-cm-charcoal">
            Name
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
              autoComplete="name"
              className="rounded-card border border-black/10 bg-white px-3 py-2 text-base text-cm-charcoal outline-none focus:border-cm-orange"
              placeholder="Jane Resident"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-cm-charcoal">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="rounded-card border border-black/10 bg-white px-3 py-2 text-base text-cm-charcoal outline-none focus:border-cm-orange"
              placeholder="jane@example.com"
            />
          </label>

          {error && (
            <p
              className="rounded-card bg-cm-orange/10 px-3 py-2 text-sm text-cm-orange"
              role="alert"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="cursor-pointer rounded-card bg-cm-orange px-4 py-2 text-base font-semibold text-white shadow-card transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Signing in...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  )
}
