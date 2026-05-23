import { useEffect, useState } from 'react'
import { Lock } from 'lucide-react'
import { fetchUserBadges } from '../api'
import { mergeBadgePayload } from '../utils/badges'

/**
 * Grid of all 8 badges. Earned tiles use brand color + gold glow; locked tiles are greyed
 * with a lock icon and the server-provided progress string.
 *
 * Props:
 *   userId     numeric user id (from localStorage)
 *   payload?   optional pre-fetched { earned, available } payload (for previews / SSR)
 *   onLoad?    callback(payload) — useful for BadgeWatcher integration
 */
export default function BadgeShelf({ userId, payload, onLoad }) {
  const [data, setData] = useState(payload || null)
  const [loading, setLoading] = useState(!payload)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (payload) {
      setData(payload)
      return
    }
    if (!userId) return
    let cancelled = false
    setLoading(true)
    fetchUserBadges(userId)
      .then((p) => {
        if (cancelled) return
        setData(p)
        onLoad?.(p)
      })
      .catch((e) => !cancelled && setError(e))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [userId, payload, onLoad])

  if (loading) {
    return <div className="text-cm-warm-gray text-sm">Loading badges…</div>
  }
  if (error) {
    return <div className="text-cm-warm-gray text-sm">Couldn't load badges right now.</div>
  }

  const badges = mergeBadgePayload(data)
  const earnedCount = badges.filter((b) => b.earned).length

  return (
    <section>
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="text-lg font-bold text-cm-charcoal">Badges</h3>
        <span className="text-sm text-cm-warm-gray">
          {earnedCount} / {badges.length} earned
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {badges.map((b) => (
          <BadgeTile key={b.id} badge={b} />
        ))}
      </div>
    </section>
  )
}

function BadgeTile({ badge }) {
  const earned = badge.earned
  const colorClass = earned ? colorFor(badge.color) : 'bg-stone-100'
  const ringClass = earned ? 'ring-2 ring-cm-gold shadow-[0_0_24px_-4px_rgba(234,179,8,0.55)]' : 'ring-1 ring-stone-200'
  const iconOpacity = earned ? 'opacity-100' : 'opacity-40 grayscale'
  return (
    <div
      className={`relative rounded-xl p-3 text-center transition ${colorClass} ${ringClass}`}
      title={badge.description}
    >
      {!earned && (
        <Lock
          size={14}
          className="absolute top-2 right-2 text-cm-warm-gray"
          aria-label="Locked"
        />
      )}
      <div className={`text-3xl mb-1 ${iconOpacity}`}>{badge.icon}</div>
      <div className={`text-sm font-semibold ${earned ? 'text-cm-charcoal' : 'text-cm-warm-gray'}`}>
        {badge.name}
      </div>
      <div className="text-xs text-cm-warm-gray mt-1 min-h-[2rem]">
        {earned ? badge.description : badge.progress || badge.criteria}
      </div>
    </div>
  )
}

function colorFor(token) {
  switch (token) {
    case 'cm-orange':
      return 'bg-cm-orange/15'
    case 'cm-green':
      return 'bg-cm-green/15'
    case 'cm-purple':
      return 'bg-cm-purple/15'
    case 'cm-gold':
    default:
      return 'bg-cm-gold/15'
  }
}
