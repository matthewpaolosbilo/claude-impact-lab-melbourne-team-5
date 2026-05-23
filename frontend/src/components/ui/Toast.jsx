const VARIANTS = {
  success: { accent: 'var(--color-mint)', emoji: '✅' },
  warning: { accent: 'var(--color-amber)', emoji: '⚡' },
  error: { accent: 'var(--color-coral)', emoji: '❌' },
  info: { accent: 'var(--color-sky)', emoji: '✦' },
}

export default function Toast({
  variant = 'info',
  children,
  onClose,
  className = '',
  style,
  showEmoji = true,
  ...rest
}) {
  const v = VARIANTS[variant] ?? VARIANTS.info
  return (
    <div
      role="status"
      className={`font-body ${className}`}
      style={{
        background: 'var(--color-surface)',
        color: 'var(--color-text-primary)',
        outline: '2px solid var(--color-text-primary)',
        outlineOffset: 0,
        borderLeft: `4px solid ${v.accent}`,
        borderRadius: 0,
        boxShadow: 'var(--shadow-pixel)',
        padding: '12px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        minWidth: 220,
        maxWidth: 380,
        ...style,
      }}
      {...rest}
    >
      {showEmoji && (
        <span aria-hidden style={{ fontSize: 18, lineHeight: 1 }}>
          {v.emoji}
        </span>
      )}
      <div style={{ flex: 1, fontSize: 14, lineHeight: 1.4 }}>{children}</div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss"
          className="cursor-pointer font-mono"
          style={{
            background: 'transparent',
            color: 'var(--color-text-secondary)',
            border: 'none',
            fontSize: 14,
            padding: '0 4px',
            lineHeight: 1,
          }}
        >
          ✕
        </button>
      )}
    </div>
  )
}
