// Stub for Dev 4's 4.15 OnboardingChat. Real version is a conversational
// flow against POST /api/chat/onboarding that returns onboarding_complete + a
// preferences payload. For now this single screen lets the 3.7.1 gate be
// exercised end-to-end. Replace wholesale when 4.15 lands; keep the
// onComplete(preferences?) contract.
export default function OnboardingChat({ onComplete }) {
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center bg-cm-cream px-6">
      <div className="w-full max-w-md rounded-card bg-white p-card text-center shadow-card">
        <h1 className="text-xl font-semibold text-cm-charcoal">
          Let&apos;s get you set up
        </h1>
        <p className="mt-3 text-sm text-cm-warm-gray">
          The Maxxer will ask you a few quick things so your map feels like
          yours. This is a placeholder until the real chat is wired in.
        </p>
        <button
          type="button"
          onClick={() => onComplete?.({ _stub: true })}
          className="cursor-pointer mt-6 inline-flex items-center justify-center rounded-full bg-cm-orange px-5 py-2.5 text-sm font-semibold text-white shadow-card hover:bg-cm-orange/90"
        >
          Finish (stub)
        </button>
      </div>
    </div>
  )
}
