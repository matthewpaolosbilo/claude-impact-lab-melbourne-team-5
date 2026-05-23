// Source of truth for "does this user need Maxxer onboarding?"
// Today: preferences live nowhere on the user object (Dev 1's 1.10.2 not shipped).
// When the backend field lands, useUser will populate user.preferences from
// the API; this helper does not need to change.
export function needsOnboarding(user) {
  if (!user) return false
  const prefs = user.preferences
  if (prefs == null) return true
  if (typeof prefs !== 'object') return true
  return Object.keys(prefs).length === 0
}
