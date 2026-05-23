import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import Button from './ui/Button'

// 4.20 — full-screen RSVP confirmation modal. Opens after a successful RSVP.
// PXL-DS-v3: pixel surface with lime offset shadow, Bungee title,
// pixel-rendered confirmation image with hard-edge framing.
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
      className="fixed inset-0 z-50 grid place-items-center p-4"
      style={{
        background: 'rgba(20, 20, 19, 0.7)',
        animation: 'cm-fade-in 180ms var(--ease-out)',
      }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg overflow-hidden"
        style={{
          background: 'var(--color-surface)',
          color: 'var(--color-text-primary)',
          outline: '2px solid var(--color-text-primary)',
          boxShadow: '6px 6px 0 var(--color-lime)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="cursor-pointer absolute z-10"
          style={{
            right: 12,
            top: 12,
            background: 'var(--color-surface)',
            color: 'var(--color-text-primary)',
            outline: '2px solid var(--color-text-primary)',
            border: 'none',
            padding: 6,
            boxShadow: 'var(--shadow-pixel-sm)',
          }}
        >
          <X className="h-4 w-4" />
        </button>

        <div
          className="aspect-square w-full pixel-art"
          style={{
            background: 'var(--color-bg-secondary)',
            borderBottom: '2px solid var(--color-text-primary)',
          }}
        >
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

        <div style={{ padding: '20px 20px 24px' }} className="text-center">
          <p
            className="font-mono uppercase"
            style={{ fontSize: 11, color: 'var(--color-lime-ink)', letterSpacing: '0.1em' }}
          >
            <span
              style={{
                background: 'var(--color-lime)',
                outline: '2px solid var(--color-text-primary)',
                padding: '2px 8px',
              }}
            >
              You're going ✨
            </span>
          </p>
          <h2
            id="rsvp-confirmation-title"
            className="font-brand uppercase mt-3"
            style={{ fontSize: 22, letterSpacing: '0.02em' }}
          >
            {event.title}
          </h2>
          {event.location?.name && (
            <p
              className="font-mono uppercase mt-1"
              style={{ fontSize: 10, color: 'var(--color-text-tertiary)', letterSpacing: '0.06em' }}
            >
              {event.location.name}
            </p>
          )}
          <div className="mt-5 flex justify-center">
            <Button variant="primary" onClick={onClose}>See you there 🚩</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function FallbackCelebration() {
  return (
    <div
      className="flex h-full w-full items-center justify-center"
      style={{
        background:
          'repeating-linear-gradient(135deg, var(--color-lime) 0 16px, var(--color-electric) 16px 32px, var(--color-coral) 32px 48px)',
      }}
    >
      <div className="text-center" style={{ background: 'var(--color-surface)', padding: '16px 20px', outline: '2px solid var(--color-text-primary)' }}>
        <div style={{ fontSize: 56, lineHeight: 1 }}>🎉</div>
        <p
          className="font-mono uppercase mt-2"
          style={{ fontSize: 10, color: 'var(--color-text-secondary)', letterSpacing: '0.06em' }}
        >
          Confirmation image goes here
        </p>
      </div>
    </div>
  )
}
