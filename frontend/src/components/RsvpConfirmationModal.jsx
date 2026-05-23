import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

// 4.20 — full-screen RSVP confirmation modal. Opens after a successful RSVP
// (Home.jsx's `handleRsvp`). Shows the designer-supplied confirmation image,
// the event title, and a dismiss button. ESC + backdrop click close it.
//
// Asset: `frontend/public/confirmation_image.jpeg` (square pixel-art).
// If the file is missing or 404s, the modal falls back to a CSS-only
// celebration so local dev isn't blocked.
export default function RsvpConfirmationModal({ event, imageSrc = '/confirmation_image.jpeg', onClose }) {
  const [imageBroken, setImageBroken] = useState(false)

  useEffect(() => {
    if (!event) return
    setImageBroken(false)
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [event, onClose])

  if (!event) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="rsvp-confirmation-title"
      className="fixed inset-0 z-50 grid place-items-center bg-cm-charcoal/70 p-4 animate-[cm-fade-in_180ms_ease-out]"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-card bg-white shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="cursor-pointer absolute right-3 top-3 z-10 rounded-full bg-white/90 p-1.5 text-cm-charcoal shadow-card hover:bg-white"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="aspect-square w-full bg-cm-cream">
          {imageBroken ? (
            <FallbackCelebration />
          ) : (
            <img
              src={imageSrc}
              alt=""
              className="h-full w-full object-contain"
              style={{ imageRendering: 'pixelated' }}
              onError={() => setImageBroken(true)}
            />
          )}
        </div>

        <div className="px-card pb-card pt-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-cm-orange">
            You're going!
          </p>
          <h2
            id="rsvp-confirmation-title"
            className="mt-2 text-xl font-semibold text-cm-charcoal"
          >
            {event.title}
          </h2>
          {event.location?.name && (
            <p className="mt-1 text-sm text-cm-warm-gray">
              {event.location.name}
            </p>
          )}
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer mt-5 inline-flex items-center justify-center rounded-full bg-cm-orange px-5 py-2.5 text-sm font-semibold text-white shadow-card hover:bg-cm-orange/90"
          >
            See you there
          </button>
        </div>
      </div>
    </div>
  )
}

function FallbackCelebration() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-cm-orange/20 via-cm-gold/15 to-cm-green/20">
      <div className="text-center">
        <div className="text-6xl">🎉</div>
        <p className="mt-2 text-xs uppercase tracking-wide text-cm-warm-gray">
          confirmation image goes here
        </p>
      </div>
    </div>
  )
}
