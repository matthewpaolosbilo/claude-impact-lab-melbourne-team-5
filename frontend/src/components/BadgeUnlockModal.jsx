import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

const CONFETTI_GLYPHS = ['🎉', '✨', '🥳', '🌟', '🎊']

/**
 * Celebration modal that pops when a new badge is earned. Pure CSS animation +
 * an emoji "rain" — no external confetti dep.
 *
 * Props:
 *   badge      the badge being celebrated (id/name/icon/description)
 *   onClose    called when the user dismisses
 */
export default function BadgeUnlockModal({ badge, onClose }) {
  const [pieces] = useState(() => generatePieces(24))

  useEffect(() => {
    if (!badge) return
    const handler = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [badge, onClose])

  if (!badge) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-cm-charcoal/60 p-4 animate-[cm-fade-in_180ms_ease-out]"
      onClick={onClose}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {pieces.map((p, i) => (
          <span
            key={i}
            className="absolute text-2xl"
            style={{
              left: `${p.x}%`,
              top: `-10%`,
              animation: `cm-fall ${p.duration}s linear ${p.delay}s forwards`,
            }}
          >
            {p.glyph}
          </span>
        ))}
      </div>
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl animate-[cm-pop-in_320ms_cubic-bezier(0.18,1.25,0.62,1)] ring-4 ring-cm-gold/60"
      >
        <button
          aria-label="Close"
          onClick={onClose}
          className="absolute top-3 right-3 text-cm-warm-gray hover:text-cm-charcoal"
        >
          <X size={18} />
        </button>
        <div className="text-xs uppercase tracking-wider text-cm-gold font-semibold">Badge unlocked</div>
        <div className="my-3 text-6xl animate-[cm-pulse_1.6s_ease-in-out_infinite]">{badge.icon}</div>
        <div className="text-xl font-bold text-cm-charcoal">{badge.name}</div>
        <div className="mt-2 text-sm text-cm-warm-gray">{badge.description}</div>
        <button
          onClick={onClose}
          className="mt-5 inline-flex items-center justify-center rounded-xl bg-cm-gold px-4 py-2 text-cm-charcoal font-semibold shadow hover:bg-cm-gold/90 transition"
        >
          Nice
        </button>
      </div>
    </div>
  )
}

function generatePieces(n) {
  const arr = []
  for (let i = 0; i < n; i++) {
    arr.push({
      x: Math.random() * 100,
      delay: Math.random() * 0.6,
      duration: 1.6 + Math.random() * 1.2,
      glyph: CONFETTI_GLYPHS[Math.floor(Math.random() * CONFETTI_GLYPHS.length)],
    })
  }
  return arr
}
