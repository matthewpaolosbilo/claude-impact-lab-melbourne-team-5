import { LOCATION_TYPES } from '../utils/constants'

export default function LocationPin({ type, size = 32, highlighted = false, selected = false }) {
  const cfg = LOCATION_TYPES[type]
  if (!cfg) return null
  const { Icon, color } = cfg
  const pinSize = highlighted || selected ? size + 8 : size
  return (
    <div
      className={`flex items-center justify-center rounded-full text-white shadow-md ring-2 cursor-pointer transition-transform hover:scale-110 ${
        highlighted || selected
          ? 'animate-[cm-pulse_1.2s_ease-in-out_infinite] ring-cm-gold'
          : 'ring-white'
      }`}
      style={{ backgroundColor: color, width: pinSize, height: pinSize }}
    >
      <Icon size={pinSize * 0.55} strokeWidth={2.5} />
    </div>
  )
}
