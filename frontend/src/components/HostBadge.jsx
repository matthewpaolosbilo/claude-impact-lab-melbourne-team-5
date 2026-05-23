import { useEffect, useState } from 'react'
import { fetchUserBadges } from '../api'

/**
 * Shows a host's name + their top earned badges.
 *
 * Props:
 *   host        { id, name } from event payload
 *   maxBadges   how many earned-badge icons to display (default 3)
 *   showLabel   prepend "Hosted by" (default true)
 */
export default function HostBadge({ host, maxBadges = 3, showLabel = true }) {
  const [topBadges, setTopBadges] = useState([])

  useEffect(() => {
    if (!host?.id) return
    let cancelled = false
    fetchUserBadges(host.id)
      .then((p) => {
        if (cancelled) return
        setTopBadges((p.earned || []).slice(0, maxBadges))
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [host?.id, maxBadges])

  if (!host) return null

  return (
    <div className="inline-flex items-center gap-2 text-sm text-cm-charcoal">
      {showLabel && <span className="text-cm-warm-gray">Hosted by</span>}
      <span className="font-semibold">{host.name}</span>
      {topBadges.length > 0 && (
        <span className="inline-flex items-center gap-0.5" aria-label="Host badges">
          {topBadges.map((b) => (
            <span key={b.id} title={`${b.name} — ${b.description}`} className="text-base leading-none">
              {b.icon}
            </span>
          ))}
        </span>
      )}
    </div>
  )
}
