import axios from 'axios'
import { mockChatReply, mockOnboardingReply } from './utils/maxxerMock'
import {
  USER_STORAGE_KEY,
  LEGACY_USER_STORAGE_KEY,
  USER_UPDATED_EVENT,
  OPEN_AUTH_EVENT,
} from './hooks/useUser'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000'
})

// A 401 means the X-User-Id we sent no longer matches a row in the backend
// (stale localStorage after a dev DB reset or the spacd brand rename). Clear
// the stored identity and re-open the auth modal so the user can sign in fresh.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 && typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(USER_STORAGE_KEY)
        window.localStorage.removeItem(LEGACY_USER_STORAGE_KEY)
        window.dispatchEvent(new Event(USER_UPDATED_EVENT))
        window.dispatchEvent(new Event(OPEN_AUTH_EVENT))
      } catch {
        // ignore storage errors
      }
    }
    return Promise.reject(error)
  },
)

// ---- Dev 4 (badges + social) endpoints ----

export async function fetchUser(userId) {
  const { data } = await api.get(`/api/users/${userId}`)
  return data
}

export async function fetchUserBadges(userId) {
  const { data } = await api.get(`/api/users/${userId}/badges`)
  return data
}

export async function fetchProfileStats(userId) {
  const { data } = await api.get(`/api/users/${userId}/profile-stats`)
  return data
}

/**
 * Past RSVPs for a user. STATE.md doesn't formally specify this endpoint shape yet —
 * Dev 1 will need to expose history. Falls back to empty array on 404.
 */
export async function fetchUserHistory(userId) {
  try {
    const { data } = await api.get(`/api/events`, { params: { user_id: userId, attended: true } })
    return Array.isArray(data) ? data : []
  } catch (err) {
    if (err?.response?.status === 404) return []
    throw err
  }
}

// ---- 3.10 RSVP wiring ----

// POST /api/events/{event_id}/rsvp with X-User-Id header.
// Returns RSVPRead. 409 means user already RSVP'd; callers should treat that as success.
export async function rsvpToEvent(eventId, userId) {
  const { data } = await api.post(
    `/api/events/${eventId}/rsvp`,
    null,
    { headers: { 'X-User-Id': userId } },
  )
  return data
}

// ---- Dev 4 (Maxxer AI agent) endpoints ----
// Real endpoints are Dev 1's 1.10.3 / 1.10.4 (PR #29). Until that lands on main,
// the helpers below fall through to a local mock. Drop the mock import + try/catch
// once the backend is on main.

function isMissingEndpoint(err) {
  const s = err?.response?.status
  return s === 404 || s === 405 || err?.code === 'ERR_NETWORK'
}

/**
 * Splits the hook's flat messages array into the backend's `{ message, history }`
 * contract. The trailing user turn becomes `message`; everything before it is
 * `history`. If the trailing item isn't a user message (e.g. bootstrap call with an
 * empty array, or the array ends on an assistant turn), `message` is "".
 */
function splitMessages(messages) {
  if (!Array.isArray(messages) || messages.length === 0) {
    return { message: '', history: [] }
  }
  const last = messages[messages.length - 1]
  const normalize = (m) => ({ role: m.role, content: m.content })
  if (last?.role === 'user') {
    return {
      message: last.content ?? '',
      history: messages.slice(0, -1).map(normalize),
    }
  }
  return { message: '', history: messages.map(normalize) }
}

/**
 * Ongoing Maxxer chat. POSTs { user_id, message, history } per ChatRequest
 * (backend/routers/chat.py). Returns { response, suggested_event_ids,
 * onboarding_complete } passthrough.
 */
export async function sendChatMessage({ userId, messages }) {
  const { message, history } = splitMessages(messages)
  try {
    const { data } = await api.post('/api/chat', {
      user_id: userId,
      message,
      history,
    })
    return data
  } catch (err) {
    if (isMissingEndpoint(err)) return mockChatReply({ messages, api })
    throw err
  }
}

/**
 * Conversational onboarding. Same request shape as sendChatMessage. Returns
 * { response, suggested_event_ids, onboarding_complete, preferences? } passthrough.
 * When complete the backend has already saved preferences to the user — refetch.
 */
export async function sendOnboardingMessage({ userId, messages }) {
  const { message, history } = splitMessages(messages)
  try {
    const { data } = await api.post('/api/chat/onboarding', {
      user_id: userId,
      message,
      history,
    })
    return data
  } catch (err) {
    if (isMissingEndpoint(err)) return mockOnboardingReply({ messages })
    throw err
  }
}
