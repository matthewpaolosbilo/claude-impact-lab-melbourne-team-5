import { useCallback, useEffect, useState } from 'react'

// 3.6 minimal user identity. Stored in localStorage; no passwords, no context.
// Multiple components can call this hook; they stay in sync via a window event.
export const USER_STORAGE_KEY = 'spacd-user'
export const LEGACY_USER_STORAGE_KEY = 'community-maxxing-user'
export const USER_UPDATED_EVENT = 'spacd-user-updated'
export const LEGACY_USER_UPDATED_EVENT = 'community-maxxing-user-updated'
export const OPEN_AUTH_EVENT = 'spacd-open-auth'

function parseStoredUser(raw) {
  const parsed = JSON.parse(raw)
  if (parsed && typeof parsed === 'object' && parsed.id) {
    return parsed
  }
  return null
}

function readUser() {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(USER_STORAGE_KEY)
    if (raw) return parseStoredUser(raw)

    const legacyRaw = window.localStorage.getItem(LEGACY_USER_STORAGE_KEY)
    if (legacyRaw) {
      const parsed = parseStoredUser(legacyRaw)
      if (parsed) {
        window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(parsed))
        window.localStorage.removeItem(LEGACY_USER_STORAGE_KEY)
      }
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
    window.addEventListener(LEGACY_USER_UPDATED_EVENT, sync)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener(USER_UPDATED_EVENT, sync)
      window.removeEventListener(LEGACY_USER_UPDATED_EVENT, sync)
    }
  }, [])

  const setUser = useCallback((next) => {
    if (next) {
      window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(next))
      window.localStorage.removeItem(LEGACY_USER_STORAGE_KEY)
    } else {
      window.localStorage.removeItem(USER_STORAGE_KEY)
      window.localStorage.removeItem(LEGACY_USER_STORAGE_KEY)
    }
    window.dispatchEvent(new Event(USER_UPDATED_EVENT))
    setUserState(next)
  }, [])

  const clearUser = useCallback(() => {
    window.localStorage.removeItem(USER_STORAGE_KEY)
    window.localStorage.removeItem(LEGACY_USER_STORAGE_KEY)
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
