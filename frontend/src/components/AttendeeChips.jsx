/**
 * Tiny initials-avatar stack used on EventCard / EventModal.
 *
 * Props:
 *   attendees      optional [{ id, name }] from the event payload (if backend exposes it)
 *   attendeeCount  total going (used when attendee list isn't expanded)
 *   max            max avatars to show before overflow chip (default 4)
 *
 * Degrades gracefully: if `attendees` is missing, renders just the count chip.
 */
export default function AttendeeChips({ attendees, attendeeCount, max = 4 }) {
  const list = Array.isArray(attendees) ? attendees : []
  const visible = list.slice(0, max)
  const overflow = (attendeeCount ?? list.length) - visible.length

  if (visible.length === 0) {
    const count = attendeeCount ?? 0
    return (
      <div className="inline-flex items-center gap-1 text-xs text-cm-warm-gray">
        <span aria-hidden="true">👥</span>
        <span>{count} going</span>
      </div>
    )
  }

  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {visible.map((a) => (
          <div
            key={a.id}
            title={a.name}
            className="w-7 h-7 rounded-full grid place-items-center text-[10px] font-bold text-white ring-2 ring-white"
            style={{ background: colorFor(a.id) }}
          >
            {initials(a.name)}
          </div>
        ))}
        {overflow > 0 && (
          <div className="w-7 h-7 rounded-full grid place-items-center text-[10px] font-semibold bg-stone-200 text-cm-charcoal ring-2 ring-white">
            +{overflow}
          </div>
        )}
      </div>
      <span className="ml-2 text-xs text-cm-warm-gray">
        {attendeeCount ?? list.length} going
      </span>
    </div>
  )
}

function initials(name) {
  if (!name) return '?'
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
}

const PALETTE = ['#F97316', '#22C55E', '#A855F7', '#EAB308', '#0EA5E9', '#EC4899']
function colorFor(id) {
  const idx = (typeof id === 'number' ? id : String(id).length) % PALETTE.length
  return PALETTE[idx]
}
