// Client-side badge metadata. Mirrors backend BADGE_DEFINITIONS in backend/badge_logic.py.
// Server returns earned[] and available[] with full data; this file is the canonical client
// fallback (icons, criteria text) and the source of truth for display order.

export const BADGES = [
  {
    id: 'first_flame',
    name: 'First Flame',
    icon: '🔥',
    description: 'Attended your first BBQ event',
    criteria: 'Show up to any BBQ event in Melbourne',
    color: 'cm-orange',
  },
  {
    id: 'green_thumb',
    name: 'Green Thumb',
    icon: '🌱',
    description: 'Attended 3 garden bed sessions',
    criteria: 'Attend 3 community garden sessions',
    color: 'cm-green',
  },
  {
    id: 'community_chef',
    name: 'Community Chef',
    icon: '🍳',
    description: 'Attended 3 community kitchen events',
    criteria: 'Attend 3 community kitchen events',
    color: 'cm-purple',
  },
  {
    id: 'host_hero',
    name: 'Host Hero',
    icon: '⭐',
    description: 'Hosted your first event',
    criteria: 'Create and host any event',
    color: 'cm-gold',
  },
  {
    id: 'week_streak',
    name: 'Weekly Regular',
    icon: '📅',
    description: 'Attended events 3 weeks in a row',
    criteria: 'Show up 3 calendar weeks in a row',
    color: 'cm-gold',
  },
  {
    id: 'cross_pollinator',
    name: 'Cross-Pollinator',
    icon: '🐝',
    description: 'Attended all 3 space types',
    criteria: 'Visit a BBQ, a garden bed, and a kitchen',
    color: 'cm-gold',
  },
  {
    id: 'ten_acts',
    name: 'spacd Regular',
    icon: '💪',
    description: '10 total acts of civic participation',
    criteria: 'Attend 10 events',
    color: 'cm-gold',
  },
  {
    id: 'welcomer',
    name: 'Welcomer',
    icon: '🤗',
    description: 'Hosted an event with 5+ attendees',
    criteria: 'Host an event that draws 5 or more people',
    color: 'cm-gold',
  },
]

export const BADGES_BY_ID = Object.fromEntries(BADGES.map(b => [b.id, b]))

/** Merge server payload (earned + available) into BADGES display order. */
export function mergeBadgePayload(payload) {
  if (!payload) return BADGES.map(b => ({ ...b, earned: false, progress: null, earned_at: null }))
  const earnedById = Object.fromEntries((payload.earned || []).map(b => [b.id, b]))
  const availableById = Object.fromEntries((payload.available || []).map(b => [b.id, b]))
  return BADGES.map(b => {
    const e = earnedById[b.id]
    const a = availableById[b.id]
    return {
      ...b,
      earned: Boolean(e),
      earned_at: e?.earned_at ?? null,
      progress: a?.progress ?? null,
    }
  })
}
