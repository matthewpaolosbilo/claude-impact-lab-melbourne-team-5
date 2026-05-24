import { cloneElement, isValidElement, useState } from 'react'
import { useUser } from '../hooks/useUser'
import OnboardingChat from './OnboardingChat'

// Demo mode: signed-in users always see Maxxer onboarding on a fresh page load,
// even if preferences were saved previously. After completion, keep showing Home
// for the rest of this in-memory session until the next refresh.
export default function OnboardingGate({ children }) {
  const { user, setUser } = useUser()
  const [completedThisLoad, setCompletedThisLoad] = useState(false)
  const [onboardingResult, setOnboardingResult] = useState(null)

  if (!user) return children
  if (completedThisLoad) {
    if (!isValidElement(children)) return children
    const response = onboardingResult?.response ?? ''
    const suggestedEventIds = onboardingResult?.suggestedEventIds ?? []
    return cloneElement(children, {
      initialMaxxerMessages: response || suggestedEventIds.length
        ? [{
            role: 'assistant',
            content: response,
            eventIds: suggestedEventIds,
          }]
        : [],
      initialSuggestedEventIds: suggestedEventIds,
      chatDefaultOpen: Boolean(response || suggestedEventIds.length),
    })
  }

  const handleComplete = (preferences, result) => {
    setUser({ ...user, preferences: preferences ?? { _stub: true } })
    setOnboardingResult(result ?? null)
    setCompletedThisLoad(true)
  }

  return <OnboardingChat userId={user.id} onComplete={handleComplete} />
}
