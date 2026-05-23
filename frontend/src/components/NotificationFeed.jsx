import { Bell, MapPin, Users, Sparkles } from 'lucide-react'

const ICONS = { nearby: MapPin, friend: Users, badge: Sparkles }

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
    title: "Priya RSVPed",
    body: "She's going to the Carlton Community Cooking night",
    when: 'yesterday',
  },
  {
    id: 3,
    kind: 'badge',
    title: 'Almost there!',
    body: "One more garden session and you'll earn Green Thumb 🌱",
    when: '3d ago',
  },
]

/**
 * Sidebar/sheet feed of social pings. Currently stubbed — backend wiring is a
 * follow-up; the UI is wired up and ready.
 *
 * Props:
 *   items?   optional array of feed entries; defaults to STUB_FEED for the demo.
 */
export default function NotificationFeed({ items = STUB_FEED }) {
  return (
    <section className="rounded-xl bg-white shadow p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-cm-charcoal flex items-center gap-2">
          <Bell size={18} className="text-cm-orange" /> What's happening
        </h3>
        <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-cm-cream text-cm-warm-gray">Preview</span>
      </div>
      <ul className="space-y-2">
        {items.map((n) => {
          const Icon = ICONS[n.kind] || Bell
          return (
            <li key={n.id} className="flex items-start gap-3 rounded-lg hover:bg-cm-cream p-2 transition">
              <div className="w-8 h-8 rounded-full bg-cm-cream grid place-items-center shrink-0">
                <Icon size={16} className="text-cm-orange" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-cm-charcoal">{n.title}</div>
                <div className="text-sm text-cm-warm-gray">{n.body}</div>
                <div className="text-[11px] text-cm-warm-gray mt-1">{n.when}</div>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
