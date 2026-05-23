import { forwardRef } from 'react'

const VARIANTS = {
  primary: {
    bg: 'var(--color-text-primary)',
    color: 'var(--color-bg-primary)',
    outline: 'var(--color-text-primary)',
    shadow: 'var(--shadow-pixel-lime)',
    shadowActive: '1px 1px 0 var(--color-lime)',
  },
  lime: {
    bg: 'var(--color-lime)',
    color: 'var(--color-lime-ink)',
    outline: 'var(--color-text-primary)',
    shadow: 'var(--shadow-pixel)',
    shadowActive: 'var(--shadow-pixel-sm)',
  },
  electric: {
    bg: 'var(--color-electric)',
    color: 'var(--color-electric-ink)',
    outline: 'var(--color-text-primary)',
    shadow: 'var(--shadow-pixel)',
    shadowActive: 'var(--shadow-pixel-sm)',
  },
  coral: {
    bg: 'var(--color-coral)',
    color: '#ffffff',
    outline: 'var(--color-text-primary)',
    shadow: 'var(--shadow-pixel)',
    shadowActive: 'var(--shadow-pixel-sm)',
  },
  outline: {
    bg: 'transparent',
    color: 'var(--color-text-primary)',
    outline: 'var(--color-text-primary)',
    shadow: 'var(--shadow-pixel)',
    shadowActive: 'var(--shadow-pixel-sm)',
  },
  ghost: {
    bg: 'var(--color-bg-secondary)',
    color: 'var(--color-text-secondary)',
    outline: 'transparent',
    shadow: 'none',
    shadowActive: 'none',
  },
}

const SIZES = {
  sm: { padding: '6px 14px', fontSize: '13px' },
  md: { padding: '10px 22px', fontSize: '15px' },
  lg: { padding: '14px 28px', fontSize: '17px' },
}

const Button = forwardRef(function Button(
  {
    variant = 'primary',
    size = 'md',
    type = 'button',
    className = '',
    style,
    children,
    disabled,
    ...rest
  },
  ref
) {
  const v = VARIANTS[variant] ?? VARIANTS.primary
  const s = SIZES[size] ?? SIZES.md

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      data-variant={variant}
      className={`pxl-btn cursor-pointer inline-flex items-center justify-center gap-2 font-brand uppercase leading-none transition-transform duration-150 ease-out disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      style={{
        background: v.bg,
        color: v.color,
        outline: v.outline === 'transparent' ? 'none' : `2px solid ${v.outline}`,
        outlineOffset: 0,
        borderRadius: 0,
        border: 'none',
        boxShadow: v.shadow,
        padding: s.padding,
        fontSize: s.fontSize,
        letterSpacing: '0.02em',
        ...style,
      }}
      onMouseDown={(e) => {
        if (disabled) return
        e.currentTarget.style.transform = 'translate(2px, 2px)'
        e.currentTarget.style.boxShadow = v.shadowActive
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = ''
        e.currentTarget.style.boxShadow = v.shadow
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = ''
        e.currentTarget.style.boxShadow = v.shadow
      }}
      {...rest}
    >
      {children}
    </button>
  )
})

export default Button
