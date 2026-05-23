// 3.7.2 layout slot for Dev 4's 4.13 ChatPanel.
// Replace this component with the real ChatPanel when 4.13 lands.
// Contract: receive `suggestedEventIds` (number[]) + `onSuggestedEventIds` setter
// from Home.jsx, and call the setter when the Maxxer returns new picks so
// MapView can highlight matching pins.
export default function ChatPanelSlot({
  variant = 'sidebar',
  suggestedEventIds = [],
  onSuggestedEventIds,
  className = '',
}) {
  const isSidebar = variant === 'sidebar'
  const wrapper = isSidebar
    ? 'flex h-full w-full flex-col p-card'
    : 'border-t border-black/10 bg-white/70 px-6 py-3'
  const card = isSidebar
    ? 'flex flex-1 flex-col rounded-card bg-cm-cream/60 p-card text-sm text-cm-warm-gray shadow-card'
    : 'rounded-card bg-cm-cream/60 px-4 py-2 text-sm text-cm-warm-gray'

  return (
    <div className={`${wrapper} ${className}`.trim()} data-slot={`chat-${variant}`}>
      <div className={card}>
        <div className="font-semibold text-cm-charcoal">
          Maxxer chat slot
        </div>
        <div className="mt-1">
          4.13 ChatPanel mounts here ({variant})
        </div>
        <div className="mt-1 text-xs">
          suggestedEventIds: [{suggestedEventIds.join(', ')}]
          {typeof onSuggestedEventIds === 'function' ? '' : ' · setter missing'}
        </div>
      </div>
    </div>
  )
}
