import { useUser } from '../hooks/useUser'
import { needsOnboarding } from '../utils/preferences'
import OnboardingChat from './OnboardingChat'

// 3.7.1 app-shell gate. Signed-in users without preferences get the Maxxer
// onboarding fullscreen instead of Home. Signed-out visitors pass through
// (AuthModal still gates RSVP). When onboarding completes, we write
// preferences onto the user via the same useUser hook AuthModal uses, which
// re-fires the same-tab sync event and flips this gate.
export default function OnboardingGate({ children }) {
  const { user, setUser } = useUser()

  if (!needsOnboarding(user)) return children

  const handleComplete = (preferences) => {
    setUser({ ...user, preferences: preferences ?? { _stub: true } })
  }

  return <OnboardingChat userId={user.id} onComplete={handleComplete} />
}
