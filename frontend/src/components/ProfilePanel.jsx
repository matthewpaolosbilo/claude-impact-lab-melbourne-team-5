import { useEffect, useState } from 'react'
import { Mail, Calendar, Users, Award } from 'lucide-react'
import { fetchUser, fetchProfileStats } from '../api'
import Avatar from './ui/Avatar'

export default function ProfilePanel({ userId, user: userProp, stats: statsProp }) {
  const [user, setUser] = useState(userProp || null)
  const [stats, setStats] = useState(statsProp || null)
  const [loading, setLoading] = useState(!userProp || !statsProp)

  useEffect(() => {
    if (!userId || (userProp && statsProp)) return
    let cancelled = false
    setLoading(true)
    Promise.all([
      userProp ? Promise.resolve(userProp) : fetchUser(userId),
      statsProp ? Promise.resolve(statsProp) : fetchProfileStats(userId),
    ])
      .then(([u, s]) => {
        if (cancelled) return
        setUser(u)
        setStats(s)
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [userId, userProp, statsProp])

  if (loading) {
    return (
      <div
        className="font-mono"
        style={{
          background: 'var(--color-surface)',
          color: 'var(--color-text-tertiary)',
          outline: '2px solid var(--color-text-primary)',
          boxShadow: 'var(--shadow-pixel)',
          padding: 16,
          fontSize: 11,
        }}
      >
        LOADING PROFILE…
      </div>
    )
  }
  if (!user) {
    return (
      <div
        className="font-body"
        style={{
          background: 'var(--color-surface)',
          color: 'var(--color-text-secondary)',
          outline: '2px solid var(--color-text-primary)',
          boxShadow: 'var(--shadow-pixel)',
          padding: 16,
          fontSize: 13,
        }}
      >
        Sign in to see your profile.
      </div>
    )
  }

  const since = user.created_at
    ? new Date(user.created_at).toLocaleDateString('en-AU', { month: 'short', year: 'numeric' })
    : '—'

  return (
    <div
      style={{
        background: 'var(--color-surface)',
        color: 'var(--color-text-primary)',
        outline: '2px solid var(--color-text-primary)',
        boxShadow: 'var(--shadow-pixel)',
        position: 'relative',
        padding: 0,
      }}
    >
      {/* Banner — lime stripe pattern */}
      <div
        aria-hidden
        style={{
          height: 56,
          background:
            'repeating-linear-gradient(135deg, var(--color-lime) 0 8px, var(--color-lime-ink) 8px 12px)',
        }}
      />

      <div style={{ padding: '0 16px 16px' }}>
        <div style={{ marginTop: -24, marginBottom: 12 }}>
          <Avatar seed={user.email || user.name} size={56} outlineColor="var(--color-surface)" alt={user.name} />
        </div>

        <div className="font-brand uppercase" style={{ fontSize: 20, letterSpacing: '0.02em' }}>
          {user.name}
        </div>
        <div
          className="font-mono mt-1 flex items-center gap-1 truncate"
          style={{ fontSize: 11, color: 'var(--color-text-secondary)', letterSpacing: '0.04em' }}
        >
          <Mail size={12} /> <span className="truncate">{user.email}</span>
        </div>
        <div
          className="font-mono mt-1 flex items-center gap-1 uppercase"
          style={{ fontSize: 10, color: 'var(--color-text-tertiary)', letterSpacing: '0.06em' }}
        >
          <Calendar size={11} /> Member since {since}
        </div>

        {user.bio ? (
          <p className="font-body mt-3" style={{ fontSize: 14, lineHeight: 1.5 }}>
            {user.bio}
          </p>
        ) : null}

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Stat icon={<Users size={14} />} label="Attended" value={stats?.attended_total ?? 0} accent="mint" />
          <Stat icon={<Award size={14} />} label="Hosted" value={stats?.hosted_total ?? 0} accent="electric" />
        </div>
      </div>
    </div>
  )
}

const ACCENTS = {
  mint: 'var(--color-mint)',
  electric: 'var(--color-electric)',
  lime: 'var(--color-lime)',
  coral: 'var(--color-coral)',
}

function Stat({ icon, label, value, accent = 'lime' }) {
  return (
    <div
      style={{
        background: 'var(--color-bg-secondary)',
        outline: '2px solid var(--color-text-primary)',
        boxShadow: `3px 3px 0 ${ACCENTS[accent] || ACCENTS.lime}`,
        padding: '10px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}
    >
      <div
        className="grid place-items-center"
        style={{
          width: 28,
          height: 28,
          background: ACCENTS[accent] || ACCENTS.lime,
          outline: '2px solid var(--color-text-primary)',
          color: 'var(--color-text-primary)',
        }}
      >
        {icon}
      </div>
      <div>
        <div className="font-brand" style={{ fontSize: 18, lineHeight: 1 }}>
          {value}
        </div>
        <div
          className="font-mono uppercase"
          style={{ fontSize: 9, color: 'var(--color-text-secondary)', letterSpacing: '0.06em', marginTop: 2 }}
        >
          {label}
        </div>
      </div>
    </div>
  )
}
