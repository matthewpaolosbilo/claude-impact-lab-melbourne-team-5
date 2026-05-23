import { useEffect, useState } from 'react'
import { Mail, Calendar, Users, Award } from 'lucide-react'
import { fetchUser, fetchProfileStats } from '../api'

/**
 * Renders a user's name, email, member-since, and totals (attended / hosted).
 *
 * Props:
 *   userId   numeric user id
 *   user?    optional pre-fetched user object
 *   stats?   optional pre-fetched stats { attended_total, hosted_total }
 */
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
    return <div className="rounded-xl bg-white shadow p-4 text-cm-warm-gray">Loading profile…</div>
  }
  if (!user) {
    return <div className="rounded-xl bg-white shadow p-4 text-cm-warm-gray">Sign in to see your profile.</div>
  }

  const initials = (user.name || '?')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
  const since = user.created_at ? new Date(user.created_at).toLocaleDateString('en-AU', { month: 'short', year: 'numeric' }) : '—'

  return (
    <div className="rounded-xl bg-white shadow p-4">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-cm-orange text-white grid place-items-center text-2xl font-bold">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xl font-bold text-cm-charcoal truncate">{user.name}</div>
          <div className="text-sm text-cm-warm-gray flex items-center gap-1 truncate">
            <Mail size={14} /> <span className="truncate">{user.email}</span>
          </div>
          <div className="text-xs text-cm-warm-gray flex items-center gap-1 mt-1">
            <Calendar size={12} /> Member since {since}
          </div>
        </div>
      </div>
      {user.bio ? <p className="mt-3 text-sm text-cm-charcoal">{user.bio}</p> : null}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Stat icon={<Users size={16} />} label="Attended" value={stats?.attended_total ?? 0} />
        <Stat icon={<Award size={16} />} label="Hosted" value={stats?.hosted_total ?? 0} />
      </div>
    </div>
  )
}

function Stat({ icon, label, value }) {
  return (
    <div className="rounded-lg bg-cm-cream p-3 flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-white grid place-items-center text-cm-orange">{icon}</div>
      <div>
        <div className="text-lg font-bold text-cm-charcoal leading-tight">{value}</div>
        <div className="text-xs text-cm-warm-gray">{label}</div>
      </div>
    </div>
  )
}
