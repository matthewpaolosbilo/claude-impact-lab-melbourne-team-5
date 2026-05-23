import { LOCATION_TYPES } from '../utils/constants'

// PXL-DS-v3 location pin: hard-edged square sprite with pixel outline + offset
// shadow. Selected/highlighted swaps shadow colour to lime.
export default function LocationPin({ type, size = 32, highlighted = false, selected = false }) {
  const cfg = LOCATION_TYPES[type]
  if (!cfg) return null
  const { Icon, color } = cfg
  const active = highlighted || selected
  const pinSize = active ? size + 8 : size

  return (
    <div
      className="flex items-center justify-center cursor-pointer transition-transform"
      style={{
        width: pinSize,
        height: pinSize,
        background: color,
        color: '#ffffff',
        outline: '2px solid var(--color-text-primary)',
        boxShadow: active ? 'var(--shadow-pixel-lime)' : 'var(--shadow-pixel-sm)',
        borderRadius: 0,
        animation: active ? 'cm-pulse 1.2s ease-in-out infinite' : 'none',
      }}
    >
      <Icon size={pinSize * 0.55} strokeWidth={2.5} />
    </div>
  )
}
