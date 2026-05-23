import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'spacd-theme'
const THEME_EVENT = 'spacd-theme-changed'

function readStoredTheme() {
  if (typeof window === 'undefined') return 'light'
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw === 'light' || raw === 'dark') return raw
  } catch {
    /* ignore */
  }
  if (typeof window.matchMedia === 'function') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return 'light'
}

function applyTheme(theme) {
  if (typeof document === 'undefined') return
  document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : '')
}

// Set the initial attribute synchronously on module load so the first paint
// matches the persisted/system preference and avoids a light-to-dark flash.
if (typeof window !== 'undefined') {
  applyTheme(readStoredTheme())
}

export function useTheme() {
  const [theme, setThemeState] = useState(readStoredTheme)

  useEffect(() => {
    function sync() {
      setThemeState(readStoredTheme())
    }
    window.addEventListener('storage', sync)
    window.addEventListener(THEME_EVENT, sync)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener(THEME_EVENT, sync)
    }
  }, [])

  const setTheme = useCallback((next) => {
    const value = next === 'dark' ? 'dark' : 'light'
    try {
      window.localStorage.setItem(STORAGE_KEY, value)
    } catch {
      /* ignore */
    }
    applyTheme(value)
    setThemeState(value)
    window.dispatchEvent(new Event(THEME_EVENT))
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }, [setTheme, theme])

  return { theme, setTheme, toggleTheme, isDark: theme === 'dark' }
}
