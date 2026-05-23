import { useEffect, useState } from 'react'
import { api } from '../api'
import { SEED_EVENTS } from './seedEvents'

// Live events from Dev 1's GET /api/events. Falls back to SEED_EVENTS if the API
// errors or returns empty so the UI is never blank during local dev.
export function useEvents() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    api
      .get('/api/events')
      .then((res) => {
        if (cancelled) return
        const list = Array.isArray(res.data) ? res.data : []
        setEvents(list.length ? list : SEED_EVENTS)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err)
        setEvents(SEED_EVENTS)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { events, setEvents, loading, error }
}
