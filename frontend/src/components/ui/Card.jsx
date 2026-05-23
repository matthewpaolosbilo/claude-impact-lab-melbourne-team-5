const ACCENT_COLORS = {
  lime: 'var(--color-lime)',
  electric: 'var(--color-electric)',
  coral: 'var(--color-coral)',
  mint: 'var(--color-mint)',
  candy: 'var(--color-candy)',
  amber: 'var(--color-amber)',
  sky: 'var(--color-sky)',
}

export default function Card({
  children,
  accent,
  dark = false,
  interactive = false,
  className = '',
  style,
  as: As = 'div',
  ...rest
}) {
  const bg = dark ? 'var(--color-text-primary)' : 'var(--color-surface)'
  const fg = dark ? 'var(--color-bg-primary)' : 'var(--color-text-primary)'
  const outlineColor = dark ? 'var(--color-text-primary)' : 'var(--color-text-primary)'
  const accentColor = ACCENT_COLORS[accent] ?? null

  return (
    <As
      className={`pxl-card relative flex flex-col ${interactive ? 'cursor-pointer transition-transform duration-150 ease-out hover:-translate-y-px' : ''} ${className}`}
      style={{
        background: bg,
        color: fg,
        outline: `2px solid ${outlineColor}`,
        outlineOffset: 0,
        borderRadius: 0,
        boxShadow: 'var(--shadow-pixel)',
        ...style,
      }}
      {...rest}
    >
      {accentColor && (
        <div
          aria-hidden
          style={{
            height: '4px',
            background: accentColor,
            marginLeft: '-2px',
            marginRight: '-2px',
            marginTop: '-2px',
          }}
        />
      )}
      <div style={{ padding: '16px' }}>{children}</div>
    </As>
  )
}

Card.Body = function CardBody({ children, padded = true, className = '', style }) {
  return (
    <div className={className} style={{ padding: padded ? '16px' : 0, ...style }}>
      {children}
    </div>
  )
}
