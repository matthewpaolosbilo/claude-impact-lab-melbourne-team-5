import { useCallback, useEffect, useState } from 'react'

// 3.6 minimal user identity. Stored in localStorage; no passwords, no context.
// Multiple components can call this hook; they stay in sync via a window event.
export const USER_STORAGE_KEY = 'community-maxxing-user'
const USER_UPDATED_EVENT = 'community-maxxing-user-updated'

function readUser() {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(USER_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object' && parsed.id) {
      return parsed
    }
    return null
  } catch {
    return null
  }
}

export function useUser() {
  const [user, setUserState] = useState(readUser)

  useEffect(() => {
    function sync() {
      setUserState(readUser())
    }
    // cross-tab sync
    window.addEventListener('storage', sync)
    // same-tab sync (storage event does not fire in the tab that wrote it)
    window.addEventListener(USER_UPDATED_EVENT, sync)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener(USER_UPDATED_EVENT, sync)
    }
  }, [])

  const setUser = useCallback((next) => {
    if (next) {
      window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(next))
    } else {
      window.localStorage.removeItem(USER_STORAGE_KEY)
    }
    window.dispatchEvent(new Event(USER_UPDATED_EVENT))
    setUserState(next)
  }, [])

  const clearUser = useCallback(() => {
    window.localStorage.removeItem(USER_STORAGE_KEY)
    window.dispatchEvent(new Event(USER_UPDATED_EVENT))
    setUserState(null)
  }, [])

  return { user, setUser, clearUser }
}

export function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/).slice(0, 2)
  return parts.map((p) => p[0]?.toUpperCase() ?? '').join('') || '?'
}
