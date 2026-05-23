const VARIANTS = {
  lime: {
    bg: 'var(--color-lime)',
    color: 'var(--color-lime-ink)',
    outline: 'var(--color-text-primary)',
  },
  mint: {
    bg: '#d6fff6',
    color: '#0a3329',
    outline: 'var(--color-mint)',
  },
  coral: {
    bg: '#ffe5e0',
    color: '#6b1a0c',
    outline: 'var(--color-coral)',
  },
  electric: {
    bg: '#ece8ff',
    color: '#2e1a5e',
    outline: 'var(--color-electric)',
  },
  neutral: {
    bg: 'var(--color-bg-tertiary)',
    color: 'var(--color-text-secondary)',
    outline: 'var(--color-border-strong)',
  },
  candy: {
    bg: '#ffe8f4',
    color: '#6b0032',
    outline: 'var(--color-candy)',
  },
  amber: {
    bg: '#fff1d6',
    color: '#5e3d00',
    outline: 'var(--color-amber)',
  },
  sky: {
    bg: '#dff0ff',
    color: '#0d3a5e',
    outline: 'var(--color-sky)',
  },
}

export default function Badge({
  variant = 'neutral',
  children,
  className = '',
  style,
  as: As = 'span',
  ...rest
}) {
  const v = VARIANTS[variant] ?? VARIANTS.neutral
  return (
    <As
      className={`font-mono inline-flex items-center gap-1 uppercase ${className}`}
      style={{
        background: v.bg,
        color: v.color,
        outline: `2px solid ${v.outline}`,
        outlineOffset: 0,
        borderRadius: 0,
        padding: '4px 10px',
        fontSize: '10px',
        letterSpacing: '0.06em',
        lineHeight: 1.1,
        ...style,
      }}
      {...rest}
    >
      {children}
    </As>
  )
}
