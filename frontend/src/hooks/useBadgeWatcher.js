import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchUserBadges } from '../api'
import { BADGES_BY_ID } from '../utils/badges'
import { useToast } from './useToast'

const STORAGE_KEY = 'cm.badges.lastEarned'

function loadKnown() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch {
    return new Set()
  }
}

function saveKnown(set) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]))
  } catch {
    /* swallow */
  }
}

/**
 * Watches the user's badge set and surfaces newly-earned badges via toast +
 * a celebration modal.
 *
 * Returns:
 *   triggerBadgeCheck()   call after RSVP / host actions to re-poll
 *   celebrating           the badge currently being celebrated (or null)
 *   dismissCelebration()  close the modal
 */
export function useBadgeWatcher(userId) {
  const known = useRef(loadKnown())
  const [celebrating, setCelebrating] = useState(null)
  const queueRef = useRef([])
  const toast = useToast()

  const showNext = useCallback(() => {
    const next = queueRef.current.shift()
    setCelebrating(next || null)
  }, [])

  const triggerBadgeCheck = useCallback(async () => {
    if (!userId) return
    let payload
    try {
      payload = await fetchUserBadges(userId)
    } catch {
      return
    }
    const earned = new Set((payload.earned || []).map((b) => b.id))
    const newlyEarned = [...earned].filter((id) => !known.current.has(id))
    if (newlyEarned.length === 0) {
      known.current = earned
      saveKnown(known.current)
      return
    }
    known.current = earned
    saveKnown(known.current)
    newlyEarned.forEach((id) => {
      const meta = BADGES_BY_ID[id] || (payload.earned || []).find((b) => b.id === id)
      if (meta) {
        toast.badge(meta)
        queueRef.current.push(meta)
      }
    })
    if (!celebrating) showNext()
  }, [userId, toast, celebrating, showNext])

  // Seed known set on mount so we don't fire celebrations for pre-existing badges.
  useEffect(() => {
    if (!userId) return
    let cancelled = false
    fetchUserBadges(userId)
      .then((p) => {
        if (cancelled) return
        const ids = (p.earned || []).map((b) => b.id)
        const set = new Set(ids)
        known.current = set
        saveKnown(set)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [userId])

  const dismissCelebration = useCallback(() => {
    showNext()
  }, [showNext])

  return { triggerBadgeCheck, celebrating, dismissCelebration }
}
