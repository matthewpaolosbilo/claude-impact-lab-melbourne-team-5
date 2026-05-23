import { Bell, MapPin, Users, Sparkles } from 'lucide-react'
import Card from './ui/Card'
import Badge from './ui/Badge'

const KIND_META = {
  nearby: { Icon: MapPin, accent: 'sky', emoji: '📍' },
  friend: { Icon: Users, accent: 'electric', emoji: '👋' },
  badge: { Icon: Sparkles, accent: 'lime', emoji: '✨' },
}

const STUB_FEED = [
  {
    id: 1,
    kind: 'nearby',
    title: 'New BBQ near you',
    body: 'Flagstaff Gardens BBQ has a new Saturday afternoon event',
    when: '2h ago',
  },
  {
    id: 2,
    kind: 'friend',
    title: 'Priya RSVPed',
    body: "She's going to the Carlton Community Cooking night",
    when: 'yesterday',
  },
  {
    id: 3,
    kind: 'badge',
    title: 'Almost there',
    body: "One more garden session and you'll earn Green Thumb 🌱",
    when: '3d ago',
  },
]

export default function NotificationFeed({ items = STUB_FEED }) {
  return (
    <Card as="section" className="!p-0">
      <div style={{ padding: 16 }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-brand text-lg" style={{ color: 'var(--color-text-primary)' }}>
            <Bell size={16} className="inline mr-2" style={{ color: 'var(--color-coral)' }} />
            What's happening
          </h3>
          <Badge variant="amber">Preview</Badge>
        </div>
        <ul className="space-y-2">
          {items.map((n) => {
            const meta = KIND_META[n.kind] || { Icon: Bell, accent: 'neutral', emoji: '🔔' }
            const Icon = meta.Icon
            return (
              <li
                key={n.id}
                className="flex items-start gap-3 p-2 transition"
                style={{ background: 'var(--color-bg-secondary)' }}
              >
                <div
                  className="grid place-items-center shrink-0"
                  style={{
                    width: 32,
                    height: 32,
                    background: 'var(--color-surface)',
                    outline: '2px solid var(--color-text-primary)',
                  }}
                >
                  <Icon size={16} style={{ color: 'var(--color-text-primary)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-body text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    {n.title} <span aria-hidden>{meta.emoji}</span>
                  </div>
                  <div className="font-body text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    {n.body}
                  </div>
                  <div
                    className="font-mono mt-1"
                    style={{ fontSize: 10, color: 'var(--color-text-tertiary)', letterSpacing: '0.04em' }}
                  >
                    {n.when.toUpperCase()}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </Card>
  )
}
