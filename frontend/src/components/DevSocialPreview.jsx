import { useState } from 'react'
import BadgeShelf from './BadgeShelf'
import ProfilePanel from './ProfilePanel'
import AttendeeChips from './AttendeeChips'
import HostBadge from './HostBadge'
import NotificationFeed from './NotificationFeed'
import BadgeUnlockModal from './BadgeUnlockModal'
import { useToast } from '../hooks/useToast'
import { BADGES } from '../utils/badges'

/**
 * Dev-only harness that previews each Dev 4 component with mocked data, so we can
 * verify visuals end-to-end without waiting on Dev 1/3. Mounted at `/_dev/social`
 * when `import.meta.env.DEV`. Assumes the surrounding `<App>` already provides
 * `<ToastProvider>` and `<Toaster>`.
 */
export default function DevSocialPreview() {
  return <PreviewBody />
}

const MOCK_PAYLOAD = {
  earned: [
    { id: 'first_flame', name: 'First Flame', icon: '🔥', description: 'Attended your first BBQ event', earned_at: '2026-05-10' },
    { id: 'host_hero', name: 'Host Hero', icon: '⭐', description: 'Hosted your first event', earned_at: '2026-05-15' },
    { id: 'cross_pollinator', name: 'Cross-Pollinator', icon: '🐝', description: 'Attended all 3 space types', earned_at: '2026-05-20' },
  ],
  available: [
    { id: 'green_thumb', name: 'Green Thumb', icon: '🌱', description: 'Attended 3 garden bed sessions', progress: '1/3 garden sessions' },
    { id: 'community_chef', name: 'Community Chef', icon: '🍳', description: 'Attended 3 community kitchen events', progress: '2/3 kitchen events' },
    { id: 'week_streak', name: 'Weekly Regular', icon: '📅', description: 'Attended events 3 weeks in a row', progress: '2/3 weeks in a row' },
    { id: 'ten_acts', name: 'spacd Regular', icon: '💪', description: '10 total acts of civic participation', progress: '4/10 acts of participation' },
    { id: 'welcomer', name: 'Welcomer', icon: '🤗', description: 'Hosted an event with 5+ attendees', progress: 'Host an event with 5+ attendees (best so far: 3)' },
  ],
}

const MOCK_USER = {
  id: 1,
  name: 'Priya Patel',
  email: 'priya@example.com',
  bio: 'Studying public health, learning to cook every cuisine.',
  created_at: '2026-04-12T10:00:00',
}
const MOCK_STATS = {
  attended_total: 7,
  hosted_total: 2,
  attended_by_type: { bbq: 2, garden_bed: 3, community_kitchen: 2 },
}
const MOCK_ATTENDEES = [
  { id: 1, name: 'Priya P' },
  { id: 2, name: 'Sam K' },
  { id: 3, name: 'Aisha R' },
  { id: 4, name: 'Wei L' },
  { id: 5, name: 'Ben C' },
  { id: 6, name: 'Maya N' },
]

function PreviewBody() {
  const toast = useToast()
  const [celebrating, setCelebrating] = useState(null)

  return (
    <div className="min-h-screen bg-cm-cream text-cm-charcoal p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dev 4 preview — Badges & Social</h1>
          <p className="text-sm text-cm-warm-gray">Mocked data, no live backend needed.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            className="px-3 py-1.5 rounded-lg bg-cm-orange text-white text-sm shadow hover:bg-cm-orange/90"
            onClick={() => toast.success('RSVP confirmed!')}
          >
            Fire success toast
          </button>
          <button
            className="px-3 py-1.5 rounded-lg bg-cm-gold text-cm-charcoal text-sm shadow hover:bg-cm-gold/90"
            onClick={() => toast.badge(BADGES[0])}
          >
            Fire badge toast
          </button>
          <button
            className="px-3 py-1.5 rounded-lg bg-cm-charcoal text-white text-sm shadow hover:bg-cm-charcoal/90"
            onClick={() => setCelebrating(BADGES[5])}
          >
            Open unlock modal
          </button>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <ProfilePanel userId={MOCK_USER.id} user={MOCK_USER} stats={MOCK_STATS} />

          <div className="rounded-xl bg-white shadow p-4 space-y-3">
            <h3 className="text-lg font-bold">Event card preview</h3>
            <div className="rounded-lg border border-stone-200 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-base font-semibold">Saturday Arvo BBQ — BYO everything</div>
                  <div className="text-xs text-cm-warm-gray">Flagstaff Gardens BBQ • Sat 12:00–15:00</div>
                </div>
                <span className="px-2 py-0.5 text-[10px] uppercase tracking-wide rounded-full bg-cm-orange/15 text-cm-orange font-semibold">BBQ</span>
              </div>
              <HostBadge host={{ id: 1, name: 'Priya P' }} />
              <div className="flex items-center justify-between">
                <AttendeeChips attendees={MOCK_ATTENDEES} attendeeCount={12} />
                <button className="px-3 py-1.5 rounded-lg bg-cm-green text-white text-sm shadow hover:bg-cm-green/90">I'm Going</button>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-white shadow p-4">
            <BadgeShelf userId={MOCK_USER.id} payload={MOCK_PAYLOAD} />
          </div>
        </div>

        <aside>
          <NotificationFeed />
        </aside>
      </div>

      <BadgeUnlockModal badge={celebrating} onClose={() => setCelebrating(null)} />
    </div>
  )
}
