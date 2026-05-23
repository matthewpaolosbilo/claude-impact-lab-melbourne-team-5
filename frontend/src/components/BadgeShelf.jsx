import { useEffect, useState } from 'react'
import { Lock } from 'lucide-react'
import { fetchUserBadges } from '../api'
import { mergeBadgePayload } from '../utils/badges'

const ACCENT_FOR_TOKEN = {
  'cm-orange': 'var(--color-coral)',
  'cm-green': 'var(--color-mint)',
  'cm-purple': 'var(--color-electric)',
  'cm-gold': 'var(--color-amber)',
}

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
    return (
      <div className="font-mono" style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>
        LOADING BADGES…
      </div>
    )
  }
  if (error) {
    return (
      <div className="font-mono" style={{ fontSize: 11, color: 'var(--color-coral)' }}>
        COULDN'T LOAD BADGES
      </div>
    )
  }

  const badges = mergeBadgePayload(data)
  const earnedCount = badges.filter((b) => b.earned).length

  return (
    <section>
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="font-brand uppercase" style={{ fontSize: 18, color: 'var(--color-text-primary)' }}>
          Badges
        </h3>
        <span
          className="font-mono"
          style={{ fontSize: 11, color: 'var(--color-text-secondary)', letterSpacing: '0.06em' }}
        >
          {earnedCount} / {badges.length} EARNED
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
  const accent = ACCENT_FOR_TOKEN[badge.color] || 'var(--color-amber)'

  return (
    <div
      className="relative text-center"
      title={badge.description}
      style={{
        background: earned ? 'var(--color-surface)' : 'var(--color-bg-tertiary)',
        outline: `2px solid ${earned ? 'var(--color-text-primary)' : 'var(--color-border-strong)'}`,
        boxShadow: earned ? `3px 3px 0 ${accent}` : 'none',
        padding: 12,
        borderRadius: 0,
      }}
    >
      {!earned && (
        <Lock
          size={14}
          className="absolute top-2 right-2"
          style={{ color: 'var(--color-text-tertiary)' }}
          aria-label="Locked"
        />
      )}
      {earned && (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: accent,
          }}
        />
      )}
      <div
        style={{
          fontSize: 36,
          marginBottom: 4,
          marginTop: 6,
          opacity: earned ? 1 : 0.35,
          filter: earned ? 'none' : 'grayscale(1)',
          lineHeight: 1,
        }}
      >
        {badge.icon}
      </div>
      <div
        className="font-brand uppercase"
        style={{
          fontSize: 12,
          color: earned ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
          letterSpacing: '0.02em',
        }}
      >
        {badge.name}
      </div>
      <div
        className="font-mono mt-1"
        style={{
          fontSize: 9,
          color: 'var(--color-text-tertiary)',
          letterSpacing: '0.04em',
          minHeight: '2rem',
          lineHeight: 1.3,
          textTransform: 'uppercase',
        }}
      >
        {earned ? badge.description : badge.progress || badge.criteria}
      </div>
    </div>
  )
}
