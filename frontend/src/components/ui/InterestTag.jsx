const ACCENT_COLORS = {
  lime: 'var(--color-lime)',
  electric: 'var(--color-electric)',
  coral: 'var(--color-coral)',
  mint: 'var(--color-mint)',
  candy: 'var(--color-candy)',
  amber: 'var(--color-amber)',
  sky: 'var(--color-sky)',
}

// .itag — inactive or active pixel tag.
// Active uses an accent background + offset pixel shadow. Inactive uses subdued bg.
export default function InterestTag({
  active = false,
  accent = 'lime',
  children,
  onClick,
  as: As = onClick ? 'button' : 'span',
  className = '',
  style,
  ...rest
}) {
  const accentColor = ACCENT_COLORS[accent] ?? ACCENT_COLORS.lime

  const base = {
    fontFamily: 'var(--font-brand)',
    fontSize: '14px',
    letterSpacing: '0.02em',
    padding: '6px 14px',
    borderRadius: 0,
    border: 'none',
    cursor: onClick ? 'pointer' : 'default',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    transition: 'transform 150ms var(--ease-spring)',
  }

  const activeStyle = {
    ...base,
    background: accentColor,
    color: 'var(--color-text-primary)',
    outline: '2px solid var(--color-text-primary)',
    outlineOffset: 0,
    boxShadow: 'var(--shadow-pixel)',
  }

  const inactiveStyle = {
    ...base,
    background: 'var(--color-bg-secondary)',
    color: 'var(--color-text-secondary)',
    outline: '2px solid var(--color-border-strong)',
    outlineOffset: 0,
  }

  return (
    <As
      type={As === 'button' ? 'button' : undefined}
      onClick={onClick}
      className={className}
      style={{ ...(active ? activeStyle : inactiveStyle), ...style }}
      {...rest}
    >
      {children}
    </As>
  )
}
