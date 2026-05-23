import { InitialsAvatar } from './ui/Avatar'

export default function AttendeeChips({ attendees, attendeeCount, max = 4 }) {
  const list = Array.isArray(attendees) ? attendees : []
  const visible = list.slice(0, max)
  const overflow = (attendeeCount ?? list.length) - visible.length

  if (visible.length === 0) {
    const count = attendeeCount ?? 0
    return (
      <div
        className="inline-flex items-center gap-1 font-mono uppercase"
        style={{ fontSize: 10, color: 'var(--color-text-secondary)', letterSpacing: '0.06em' }}
      >
        <span aria-hidden>👥</span>
        <span>{count} going</span>
      </div>
    )
  }

  return (
    <div className="flex items-center">
      <div className="flex" style={{ marginRight: 8 }}>
        {visible.map((a, i) => (
          <span
            key={a.id}
            title={a.name}
            style={{ marginLeft: i === 0 ? 0 : -6 }}
          >
            <InitialsAvatar
              initials={initials(a.name)}
              size={28}
              onSurface
            />
          </span>
        ))}
        {overflow > 0 && (
          <span
            className="font-mono inline-flex items-center justify-center"
            style={{
              marginLeft: -6,
              width: 28,
              height: 28,
              background: 'var(--color-bg-tertiary)',
              color: 'var(--color-text-primary)',
              outline: '2px solid var(--color-surface)',
              fontSize: 10,
              fontWeight: 600,
            }}
          >
            +{overflow}
          </span>
        )}
      </div>
      <span
        className="font-mono uppercase"
        style={{ fontSize: 10, color: 'var(--color-text-secondary)', letterSpacing: '0.06em' }}
      >
        {attendeeCount ?? list.length} going
      </span>
    </div>
  )
}

function initials(name) {
  if (!name) return '?'
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
}
