import { LOCATION_TYPES } from '../utils/constants'

export default function LocationPin({ type, size = 32 }) {
  const cfg = LOCATION_TYPES[type]
  if (!cfg) return null
  const { Icon, color } = cfg
  return (
    <div
      className="flex items-center justify-center rounded-full text-white shadow-md ring-2 ring-white cursor-pointer transition-transform hover:scale-110"
      style={{ backgroundColor: color, width: size, height: size }}
    >
      <Icon size={size * 0.55} strokeWidth={2.5} />
    </div>
  )
}
