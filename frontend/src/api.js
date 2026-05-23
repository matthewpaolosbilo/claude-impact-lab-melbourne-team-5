import axios from 'axios'

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
