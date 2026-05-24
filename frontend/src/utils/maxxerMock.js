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
      response:
        "ngl the events list is a bit dry rn — once Dev 1 ships /api/chat I'll have proper picks for you. bet.",
      suggested_event_ids: picks.map((e) => e.id),
      onboarding_complete: true,
    }
  }
  const lastUser = [...messages].reverse().find((m) => m.role === 'user')?.content ?? ''
  const intro = lastUser
    ? `ok so you said "${lastUser.slice(0, 60)}" — heard. lowkey think these three could be your vibe:`
    : 'lowkey think these three could be your vibe rn:'
  const body = picks.map((e) => `- ${eventLine(e)}`).join('\n')
  return {
    response: `${intro}\n\n${body}\n\nlmk which one's giving and I'll lock it in fr.`,
    suggested_event_ids: picks.map((e) => e.id),
    onboarding_complete: true,
  }
}

// Scripted 3-turn onboarding. Each user turn advances state by one. After the 3rd
// user message we mark complete and return a synthesized preferences object.
const ONBOARDING_TURNS = [
  "Hi, I'm Maxxer. I help international students find events and make new friends in Melbourne. What brought you here, and which part of Melbourne are you usually around?",
  "ok bet. what's something you miss from home, plus any dietary or cultural stuff i should respect?",
  'last one — what social vibe are you giving rn: big BBQ energy, chill garden potter, cooking sesh together, or low-key just being around people?',
]

function extractPreferences(userMessages) {
  // Lightweight extraction — the real backend will use Claude. Just store raw answers
  // so the UI can demonstrate the round-trip.
  const [reasonAndArea, missAndNeeds, vibe] = userMessages.map((m) => m.content?.trim() ?? '')
  return {
    reason_in_melbourne: reasonAndArea || null,
    usual_area: reasonAndArea || null,
    home_misses: missAndNeeds || null,
    dietary_cultural: missAndNeeds || null,
    social_vibe: vibe || null,
  }
}

export async function mockOnboardingReply({ messages }) {
  const userMessages = messages.filter((m) => m.role === 'user')
  const turnIndex = userMessages.length // 0 = no answers yet, just opening

  if (turnIndex >= ONBOARDING_TURNS.length) {
    return {
      response:
        "ok love that, I've got enough to work with. dropping you into the map now — three picks tailored to you ✨",
      suggested_event_ids: [],
      onboarding_complete: true,
      preferences: extractPreferences(userMessages),
    }
  }

  return {
    response: ONBOARDING_TURNS[turnIndex],
    suggested_event_ids: [],
    onboarding_complete: false,
  }
}
