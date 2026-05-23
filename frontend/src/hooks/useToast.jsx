import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'

const ToastCtx = createContext(null)

let _id = 0
const nextId = () => ++_id

export function ToastProvider({ children, maxStack = 3, defaultTtlMs = 3500 }) {
  const [toasts, setToasts] = useState([])
  const timeouts = useRef(new Map())

  const dismiss = useCallback((id) => {
    setToasts((cur) => cur.filter((t) => t.id !== id))
    const handle = timeouts.current.get(id)
    if (handle) {
      clearTimeout(handle)
      timeouts.current.delete(id)
    }
  }, [])

  const push = useCallback(
    (toast) => {
      const id = nextId()
      const entry = { id, kind: 'info', ttl: defaultTtlMs, ...toast }
      setToasts((cur) => {
        const next = [...cur, entry]
        return next.slice(Math.max(0, next.length - maxStack))
      })
      if (entry.ttl > 0) {
        const handle = setTimeout(() => dismiss(id), entry.ttl)
        timeouts.current.set(id, handle)
      }
      return id
    },
    [defaultTtlMs, maxStack, dismiss]
  )

  const api = useMemo(
    () => ({
      success: (message, opts = {}) => push({ kind: 'success', message, ...opts }),
      info: (message, opts = {}) => push({ kind: 'info', message, ...opts }),
      error: (message, opts = {}) => push({ kind: 'error', message, ...opts }),
      badge: (badge, opts = {}) =>
        push({
          kind: 'badge',
          message: `New badge earned: ${badge.icon} ${badge.name}!`,
          badge,
          ttl: 5000,
          ...opts,
        }),
      dismiss,
    }),
    [push, dismiss]
  )

  return (
    <ToastCtx.Provider value={{ toasts, api }}>
      {children}
    </ToastCtx.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastCtx)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx.api
}

export function useToastState() {
  const ctx = useContext(ToastCtx)
  if (!ctx) throw new Error('useToastState must be used inside <ToastProvider>')
  return ctx
}
