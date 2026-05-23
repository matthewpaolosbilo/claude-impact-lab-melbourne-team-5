import { forwardRef } from 'react'

const Input = forwardRef(function Input(
  { className = '', style, type = 'text', invalid = false, ...rest },
  ref
) {
  return (
    <input
      ref={ref}
      type={type}
      className={`font-body w-full ${className}`}
      style={{
        background: 'var(--color-bg-secondary)',
        color: 'var(--color-text-primary)',
        outline: `2px solid ${invalid ? 'var(--color-coral)' : 'var(--color-border-strong)'}`,
        outlineOffset: 0,
        borderRadius: 0,
        border: 'none',
        padding: '10px 13px',
        fontSize: '13px',
        ...style,
      }}
      onFocus={(e) => {
        e.currentTarget.style.outline = `2px solid ${invalid ? 'var(--color-coral)' : 'var(--color-text-primary)'}`
        rest.onFocus?.(e)
      }}
      onBlur={(e) => {
        e.currentTarget.style.outline = `2px solid ${invalid ? 'var(--color-coral)' : 'var(--color-border-strong)'}`
        rest.onBlur?.(e)
      }}
      {...rest}
    />
  )
})

export default Input

export const Textarea = forwardRef(function Textarea(
  { className = '', style, rows = 4, ...rest },
  ref
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={`font-body w-full resize-y ${className}`}
      style={{
        background: 'var(--color-bg-secondary)',
        color: 'var(--color-text-primary)',
        outline: '2px solid var(--color-border-strong)',
        outlineOffset: 0,
        borderRadius: 0,
        border: 'none',
        padding: '10px 13px',
        fontSize: '13px',
        lineHeight: 1.5,
        ...style,
      }}
      onFocus={(e) => {
        e.currentTarget.style.outline = '2px solid var(--color-text-primary)'
        rest.onFocus?.(e)
      }}
      onBlur={(e) => {
        e.currentTarget.style.outline = '2px solid var(--color-border-strong)'
        rest.onBlur?.(e)
      }}
      {...rest}
    />
  )
})

export const Select = forwardRef(function Select(
  { className = '', style, children, ...rest },
  ref
) {
  return (
    <select
      ref={ref}
      className={`font-body cursor-pointer ${className}`}
      style={{
        background: 'var(--color-bg-secondary)',
        color: 'var(--color-text-primary)',
        outline: '2px solid var(--color-border-strong)',
        outlineOffset: 0,
        borderRadius: 0,
        border: 'none',
        padding: '10px 13px',
        fontSize: '13px',
        ...style,
      }}
      onFocus={(e) => {
        e.currentTarget.style.outline = '2px solid var(--color-text-primary)'
        rest.onFocus?.(e)
      }}
      onBlur={(e) => {
        e.currentTarget.style.outline = '2px solid var(--color-border-strong)'
        rest.onBlur?.(e)
      }}
      {...rest}
    >
      {children}
    </select>
  )
})

export function Label({ children, htmlFor, className = '', style, required }) {
  return (
    <label
      htmlFor={htmlFor}
      className={`font-body block ${className}`}
      style={{
        fontSize: '12px',
        fontWeight: 500,
        color: 'var(--color-text-secondary)',
        marginBottom: '6px',
        ...style,
      }}
    >
      {children}
      {required && <span style={{ color: 'var(--color-coral)', marginLeft: 4 }}>*</span>}
    </label>
  )
}

export function HelpText({ children, error = false, className = '', style }) {
  return (
    <p
      className={`font-mono ${className}`}
      style={{
        fontSize: '10px',
        color: error ? 'var(--color-coral)' : 'var(--color-text-tertiary)',
        marginTop: '6px',
        letterSpacing: '0.04em',
        ...style,
      }}
    >
      {children}
    </p>
  )
}
