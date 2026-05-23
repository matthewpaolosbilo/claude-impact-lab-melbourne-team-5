import axios from 'axios'
import { mockChatReply, mockOnboardingReply } from './utils/maxxerMock'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000'
})

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

// ---- Dev 4 (Maxxer AI agent) endpoints ----
// Real endpoints are Dev 1's 1.10.3 / 1.10.4. Until they ship, the helpers below
// fall through to a local mock that picks 3 events from /api/events and emits
// [EVENT:id] tags. Drop the mock import + try/catch once the backend lands.

function isMissingEndpoint(err) {
  const s = err?.response?.status
  return s === 404 || s === 405 || err?.code === 'ERR_NETWORK'
}

/**
 * Ongoing Maxxer chat. Returns { message, suggested_event_ids }.
 * Contract per STATE.md "The Maxxer — AI Agent" section.
 */
export async function sendChatMessage({ userId, messages }) {
  try {
    const { data } = await api.post('/api/chat', { user_id: userId, messages })
    return data
  } catch (err) {
    if (isMissingEndpoint(err)) return mockChatReply({ messages, api })
    throw err
  }
}

/**
 * Conversational onboarding. Returns { message, onboarding_complete, preferences? }.
 * When complete the backend will have saved preferences to the user; refetch the user.
 */
export async function sendOnboardingMessage({ userId, messages }) {
  try {
    const { data } = await api.post('/api/chat/onboarding', { user_id: userId, messages })
    return data
  } catch (err) {
    if (isMissingEndpoint(err)) return mockOnboardingReply({ messages })
    throw err
  }
}
