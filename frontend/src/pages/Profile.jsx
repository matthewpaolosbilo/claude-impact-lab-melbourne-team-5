import { useEffect, useState } from 'react'
import BadgeShelf from '../components/BadgeShelf'
import ProfilePanel from '../components/ProfilePanel'
import NotificationFeed from '../components/NotificationFeed'
import PixelDivider from '../components/ui/PixelDivider'
import { fetchUserHistory } from '../api'

export default function Profile({ userId: userIdProp }) {
  const storedId = typeof localStorage !== 'undefined' ? Number(localStorage.getItem('cm.user_id')) : NaN
  const userId = userIdProp ?? (Number.isFinite(storedId) && storedId > 0 ? storedId : null)
  const [history, setHistory] = useState([])

  useEffect(() => {
    if (!userId) return
    let cancelled = false
    fetchUserHistory(userId).then((h) => !cancelled && setHistory(h)).catch(() => {})
    return () => {
      cancelled = true
    }
  }, [userId])

  if (!userId) {
    return (
      <div className="max-w-md mx-auto p-6">
        <div
          className="text-center"
          style={{
            background: 'var(--color-surface)',
            outline: '2px solid var(--color-text-primary)',
            boxShadow: 'var(--shadow-pixel)',
            padding: 24,
          }}
        >
          <p className="font-brand uppercase" style={{ fontSize: 16, letterSpacing: '0.02em' }}>
            Sign in first
          </p>
          <p
            className="font-body mt-2"
            style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}
          >
            Tell us who you are to start collecting badges 🏅
          </p>
        </div>
      </div>
    )
  }

  return (
    <main className="max-w-5xl mx-auto p-4 md:p-6 grid gap-6 md:grid-cols-3">
      <div className="md:col-span-2 space-y-6">
        <ProfilePanel userId={userId} />
        <PixelDivider />
        <div
          style={{
            background: 'var(--color-surface)',
            outline: '2px solid var(--color-text-primary)',
            boxShadow: 'var(--shadow-pixel)',
            padding: 16,
          }}
        >
          <BadgeShelf userId={userId} />
        </div>
        <section
          style={{
            background: 'var(--color-surface)',
            outline: '2px solid var(--color-text-primary)',
            boxShadow: 'var(--shadow-pixel)',
            padding: 16,
          }}
        >
          <h3 className="font-brand uppercase mb-3" style={{ fontSize: 18, color: 'var(--color-text-primary)' }}>
            Your event history
          </h3>
          {history.length === 0 ? (
            <p className="font-body" style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
              No events yet, RSVP to one and it'll show up here.
            </p>
          ) : (
            <ul style={{ borderTop: '1px solid var(--color-border)' }}>
              {history.map((ev) => (
                <li key={ev.id} className="py-2" style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <div className="font-brand" style={{ fontSize: 14, color: 'var(--color-text-primary)' }}>
                    {ev.title}
                  </div>
                  <div
                    className="font-mono mt-1 uppercase"
                    style={{ fontSize: 10, color: 'var(--color-text-tertiary)', letterSpacing: '0.06em' }}
                  >
                    {ev.location?.name} · {ev.start_time ? new Date(ev.start_time).toLocaleString('en-AU') : ''}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
      <aside>
        <NotificationFeed />
      </aside>
    </main>
  )
}
