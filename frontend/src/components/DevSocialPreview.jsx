import { useState } from 'react'
import BadgeShelf from './BadgeShelf'
import ProfilePanel from './ProfilePanel'
import AttendeeChips from './AttendeeChips'
import HostBadge from './HostBadge'
import NotificationFeed from './NotificationFeed'
import BadgeUnlockModal from './BadgeUnlockModal'
import EventCard from './EventCard'
import Button from './ui/Button'
import Badge from './ui/Badge'
import Card from './ui/Card'
import Input, { Label, HelpText, Textarea, Select } from './ui/Input'
import InterestTag from './ui/InterestTag'
import Toast from './ui/Toast'
import PixelDivider from './ui/PixelDivider'
import Avatar, { InitialsAvatar } from './ui/Avatar'
import { useToast } from '../hooks/useToast'
import { BADGES } from '../utils/badges'

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
const MOCK_EVENT = {
  id: 9001,
  title: 'Saturday Arvo BBQ',
  description: 'BYO everything. Vibes, beats, and snags.',
  event_type: 'social',
  start_time: '2026-06-13T12:00:00',
  end_time: '2026-06-13T15:00:00',
  host: { id: 1, name: 'Priya P' },
  location: { id: 1, name: 'Flagstaff Gardens BBQ', type: 'bbq' },
  attendee_count: 12,
  max_attendees: 24,
  user_rsvp: null,
}

const INTERESTS = ['🎧 hyperpop', '🎮 lan night', '✏️ sketch', '📸 film cams', '🌿 plants', '🍜 ramen run']

function PreviewBody() {
  const toast = useToast()
  const [celebrating, setCelebrating] = useState(null)
  const [activeInterests, setActiveInterests] = useState(new Set(['🎧 hyperpop', '🌿 plants']))

  const toggleInterest = (i) => {
    setActiveInterests((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  return (
    <div
      className="min-h-screen p-6 space-y-6"
      style={{ background: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }}
    >
      <header className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-brand uppercase" style={{ fontSize: 28, letterSpacing: '0.03em' }}>
            PXL // DS v3 — Preview
          </h1>
          <p className="font-body mt-1" style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
            Mocked data, no live backend needed.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="lime" size="sm" onClick={() => toast.success('RSVP confirmed!')}>
            Fire success toast
          </Button>
          <Button variant="electric" size="sm" onClick={() => toast.badge(BADGES[0])}>
            Fire badge toast
          </Button>
          <Button variant="primary" size="sm" onClick={() => setCelebrating(BADGES[5])}>
            Open unlock modal
          </Button>
        </div>
      </header>

      <PixelDivider />

      {/* Button gallery */}
      <section>
        <SectionLabel>Buttons</SectionLabel>
        <div className="flex flex-wrap gap-3 mt-3">
          <Button variant="primary">Primary</Button>
          <Button variant="lime">Lime</Button>
          <Button variant="electric">Electric</Button>
          <Button variant="coral">Coral</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="lime" size="sm">Small</Button>
          <Button variant="lime" size="lg">Large</Button>
          <Button variant="lime" disabled>Disabled</Button>
        </div>
      </section>

      <section>
        <SectionLabel>Badges</SectionLabel>
        <div className="flex flex-wrap gap-2 mt-3">
          <Badge variant="lime">Lime</Badge>
          <Badge variant="mint">Mint</Badge>
          <Badge variant="coral">Coral</Badge>
          <Badge variant="electric">Electric</Badge>
          <Badge variant="candy">Candy</Badge>
          <Badge variant="amber">Amber</Badge>
          <Badge variant="sky">Sky</Badge>
          <Badge variant="neutral">Neutral</Badge>
        </div>
      </section>

      <section>
        <SectionLabel>Interest Tags</SectionLabel>
        <div className="flex flex-wrap gap-2 mt-3">
          {INTERESTS.map((i, idx) => (
            <InterestTag
              key={i}
              active={activeInterests.has(i)}
              accent={['lime', 'electric', 'coral', 'mint', 'candy', 'amber'][idx % 6]}
              onClick={() => toggleInterest(i)}
            >
              {i}
            </InterestTag>
          ))}
        </div>
      </section>

      <section>
        <SectionLabel>Form fields</SectionLabel>
        <div className="grid gap-4 mt-3 max-w-md">
          <div>
            <Label htmlFor="dev-name" required>Name</Label>
            <Input id="dev-name" placeholder="Type your name…" />
            <HelpText>Used to credit your RSVPs.</HelpText>
          </div>
          <div>
            <Label htmlFor="dev-bio">Bio</Label>
            <Textarea id="dev-bio" placeholder="Tell people what you're into…" />
          </div>
          <div>
            <Label htmlFor="dev-spc">Favourite space</Label>
            <Select id="dev-spc">
              <option>BBQ</option>
              <option>Garden bed</option>
              <option>Community kitchen</option>
            </Select>
          </div>
        </div>
      </section>

      <section>
        <SectionLabel>Toasts (static)</SectionLabel>
        <div className="grid gap-3 mt-3 max-w-md">
          <Toast variant="success">RSVP confirmed, see you Saturday 🎉</Toast>
          <Toast variant="warning">3 spots left for this one ⚡</Toast>
          <Toast variant="error">Something broke, not the vibe. We're on it ⚡</Toast>
          <Toast variant="info">Maxxer found 3 events near you ✨</Toast>
        </div>
      </section>

      <section>
        <SectionLabel>Avatars</SectionLabel>
        <div className="flex flex-wrap items-end gap-3 mt-3">
          <Avatar seed="priya" size={32} />
          <Avatar seed="sam" size={40} />
          <Avatar seed="aisha" size={48} />
          <Avatar seed="wei" size={64} />
          <InitialsAvatar initials="PB" size={40} />
          <InitialsAvatar initials="MS" size={40} />
        </div>
      </section>

      <PixelDivider />

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <ProfilePanel userId={MOCK_USER.id} user={MOCK_USER} stats={MOCK_STATS} />

          <Card accent="coral" className="!p-0">
            <div style={{ padding: 16 }}>
              <SectionLabel>Event card preview</SectionLabel>
              <div className="mt-3">
                <EventCard event={MOCK_EVENT} onOpen={() => {}} onRsvp={() => toast.success('RSVP!')} />
              </div>
              <div className="mt-3 flex items-center justify-between">
                <HostBadge host={{ id: 1, name: 'Priya P' }} />
                <AttendeeChips attendees={MOCK_ATTENDEES} attendeeCount={12} />
              </div>
            </div>
          </Card>

          <div
            style={{
              background: 'var(--color-surface)',
              outline: '2px solid var(--color-text-primary)',
              boxShadow: 'var(--shadow-pixel)',
              padding: 16,
            }}
          >
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

function SectionLabel({ children }) {
  return (
    <h2
      className="font-mono uppercase"
      style={{ fontSize: 10, color: 'var(--color-text-secondary)', letterSpacing: '0.1em' }}
    >
      {children}
    </h2>
  )
}
