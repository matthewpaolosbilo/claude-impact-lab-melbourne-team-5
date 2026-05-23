import { useEffect, useState } from 'react'
import BadgeShelf from '../components/BadgeShelf'
import ProfilePanel from '../components/ProfilePanel'
import NotificationFeed from '../components/NotificationFeed'
import { fetchUserHistory } from '../api'

/**
 * Profile page — combines ProfilePanel + BadgeShelf + past RSVP history.
 * Dev 3 mounts this at `/profile`. user_id is read from localStorage (set by
 * Dev 3's first-visit auth modal).
 */
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
        <div className="rounded-xl bg-white shadow p-6 text-center">
          <p className="text-cm-charcoal font-semibold">Sign in first</p>
          <p className="text-sm text-cm-warm-gray mt-1">Tell us who you are to start collecting badges.</p>
        </div>
      </div>
    )
  }

  return (
    <main className="max-w-5xl mx-auto p-4 md:p-6 grid gap-6 md:grid-cols-3">
      <div className="md:col-span-2 space-y-6">
        <ProfilePanel userId={userId} />
        <BadgeShelf userId={userId} />
        <section className="rounded-xl bg-white shadow p-4">
          <h3 className="text-lg font-bold text-cm-charcoal mb-3">Your event history</h3>
          {history.length === 0 ? (
            <p className="text-sm text-cm-warm-gray">No events yet — RSVP to one and it'll show up here.</p>
          ) : (
            <ul className="divide-y divide-stone-100">
              {history.map((ev) => (
                <li key={ev.id} className="py-2">
                  <div className="text-sm font-semibold text-cm-charcoal">{ev.title}</div>
                  <div className="text-xs text-cm-warm-gray">
                    {ev.location?.name} • {ev.start_time ? new Date(ev.start_time).toLocaleString('en-AU') : ''}
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
