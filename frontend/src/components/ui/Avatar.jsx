// Deterministic colour pick from a seed string (name, id, handle).
const ACCENT_PALETTE = [
  ['#C8F135', '#7B5EA7'], // lime head, electric body
  ['#FF6147', '#1A1917'], // coral / charcoal
  ['#4DAEEC', '#1A1917'], // sky / charcoal
  ['#3ECFAC', '#1A1917'], // mint / charcoal
  ['#FF8DC7', '#7B5EA7'], // candy / electric
  ['#FFB830', '#1A1917'], // amber / charcoal
  ['#7B5EA7', '#C8F135'], // electric / lime
  ['#1A1917', '#C8F135'], // charcoal / lime
]

function hashSeed(seed) {
  if (!seed) return 0
  let h = 0
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) & 0xffffffff
  }
  return Math.abs(h)
}

export function pickPalette(seed) {
  return ACCENT_PALETTE[hashSeed(seed) % ACCENT_PALETTE.length]
}

// Pixel-art SVG sprite (10x13 grid). Head + body colours come from the palette.
export default function Avatar({
  seed,
  initials,
  size = 40,
  outlineColor,
  onSurface = false,
  className = '',
  style,
  alt,
}) {
  const [headColor, bodyColor] = pickPalette(seed || initials || 'spacd')
  const outline = outlineColor || (onSurface ? 'var(--color-surface)' : 'var(--color-text-primary)')

  return (
    <span
      className={`inline-flex items-center justify-center pixel-art ${className}`}
      style={{
        width: size,
        height: size,
        outline: `2px solid ${outline}`,
        outlineOffset: 0,
        borderRadius: 0,
        background: 'var(--color-bg-secondary)',
        overflow: 'hidden',
        flexShrink: 0,
        ...style,
      }}
      aria-label={alt}
      role={alt ? 'img' : undefined}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 10 13"
        style={{ imageRendering: 'pixelated', display: 'block' }}
        aria-hidden={alt ? undefined : true}
      >
        {/* Head */}
        <rect x="3" y="0" width="4" height="4" fill={headColor} />
        {/* Body */}
        <rect x="2" y="4" width="6" height="9" fill={bodyColor} />
        {/* Eyes */}
        <rect x="4" y="2" width="1" height="1" fill="#1A1917" />
        <rect x="6" y="2" width="1" height="1" fill="#1A1917" />
        {/* Mouth */}
        <rect x="4" y="3" width="3" height="1" fill="#1A1917" />
      </svg>
    </span>
  )
}

// Initials fallback variant — same shape, no sprite, just text.
export function InitialsAvatar({ initials, size = 40, outlineColor, onSurface = false, className = '', style }) {
  const [headColor] = pickPalette(initials || 'spacd')
  const outline = outlineColor || (onSurface ? 'var(--color-surface)' : 'var(--color-text-primary)')
  return (
    <span
      className={`inline-flex items-center justify-center font-brand ${className}`}
      style={{
        width: size,
        height: size,
        outline: `2px solid ${outline}`,
        outlineOffset: 0,
        borderRadius: 0,
        background: headColor,
        color: '#1A1917',
        fontSize: Math.round(size * 0.4),
        flexShrink: 0,
        ...style,
      }}
    >
      {(initials || '?').toUpperCase()}
    </span>
  )
}
