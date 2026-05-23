// Local stand-in for Dev 1's /api/chat and /api/chat/onboarding endpoints.
// Returns shape-compatible payloads with [EVENT:id] tags so ChatPanel / OnboardingChat
// can be developed against real seeded events while the backend is still TODO.
//
// Delete this file once Dev 1's 1.10.3 + 1.10.4 land and the try/catch in api.js
// stops needing a fallback.

import { api } from '../api'

async function pickThreeUpcomingEvents() {
  try {
    const { data } = await api.get('/api/events')
    const events = Array.isArray(data) ? data : []
    const now = Date.now()
    const upcoming = events
      .filter((e) => new Date(e.start_time).getTime() >= now)
      .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
    const pool = upcoming.length >= 3 ? upcoming : events
    return pool.slice(0, 3)
  } catch {
    return []
  }
}

function eventLine(e) {
  const where = e.location?.name ?? 'somewhere good'
  return `${e.title} at ${where} [EVENT:${e.id}]`
}

export async function mockChatReply({ messages }) {
  const picks = await pickThreeUpcomingEvents()
  if (picks.length < 3) {
    return {
      message:
        "ngl the events list is a bit dry rn — once Dev 1 ships /api/chat I'll have proper picks for you. bet.",
      suggested_event_ids: picks.map((e) => e.id),
    }
  }
  const lastUser = [...messages].reverse().find((m) => m.role === 'user')?.content ?? ''
  const intro = lastUser
    ? `ok so you said "${lastUser.slice(0, 60)}" — heard. lowkey think these three could be your vibe:`
    : 'lowkey think these three could be your vibe rn:'
  const body = picks.map((e) => `- ${eventLine(e)}`).join('\n')
  return {
    message: `${intro}\n\n${body}\n\nlmk which one's giving and I'll lock it in fr.`,
    suggested_event_ids: picks.map((e) => e.id),
  }
}

// Scripted 5-turn onboarding. Each user turn advances state by one. After the 5th
// user message we mark complete and return a synthesized preferences object.
const ONBOARDING_TURNS = [
  "hey hey, welcome to community maxxing. ngl Melbourne can be a lot when you're new — what brought you here? studying, working, something else?",
  "ok bet. what's something you actually miss from home — like a food, a routine, a vibe? doesn't have to be deep.",
  'fair fr. what kind of social energy are you giving rn — big group cooking sesh, chill garden potter, or low-key tag-along to a bbq?',
  'any dietary stuff or cultural things i should know? halal, veg, dairy-free, anything that makes a spot feel like home?',
  "last one — which part of Melbourne are you usually around? CBD, north side, west, somewhere else?",
]

function extractPreferences(userMessages) {
  // Lightweight extraction — the real backend will use Claude. Just store raw answers
  // so the UI can demonstrate the round-trip.
  const [reason, miss, vibe, dietary, area] = userMessages.map((m) => m.content?.trim() ?? '')
  return {
    reason_in_melbourne: reason || null,
    home_misses: miss || null,
    social_vibe: vibe || null,
    dietary_cultural: dietary || null,
    usual_area: area || null,
  }
}

export async function mockOnboardingReply({ messages }) {
  const userMessages = messages.filter((m) => m.role === 'user')
  const turnIndex = userMessages.length // 0 = no answers yet, just opening

  if (turnIndex >= ONBOARDING_TURNS.length) {
    return {
      message:
        "ok love that, I've got enough to work with. dropping you into the map now — three picks tailored to you ✨",
      onboarding_complete: true,
      preferences: extractPreferences(userMessages),
    }
  }

  return {
    message: ONBOARDING_TURNS[turnIndex],
    onboarding_complete: false,
  }
}
