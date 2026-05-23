import { useEffect, useState } from 'react'
import { fetchUserBadges } from '../api'

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
    <div className="inline-flex items-center gap-2">
      {showLabel && (
        <span
          className="font-mono uppercase"
          style={{ fontSize: 10, color: 'var(--color-text-tertiary)', letterSpacing: '0.06em' }}
        >
          Hosted by
        </span>
      )}
      <span className="font-brand uppercase" style={{ fontSize: 13, color: 'var(--color-text-primary)', letterSpacing: '0.02em' }}>
        {host.name}
      </span>
      {topBadges.length > 0 && (
        <span className="inline-flex items-center gap-0.5" aria-label="Host badges">
          {topBadges.map((b) => (
            <span
              key={b.id}
              title={`${b.name} — ${b.description}`}
              style={{ fontSize: 14, lineHeight: 1 }}
            >
              {b.icon}
            </span>
          ))}
        </span>
      )}
    </div>
  )
}
