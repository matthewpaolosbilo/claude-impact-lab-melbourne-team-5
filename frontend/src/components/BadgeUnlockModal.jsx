import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import Button from './ui/Button'

const CONFETTI_GLYPHS = ['🎉', '✨', '🥳', '🌟', '🎊']

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
      className="fixed inset-0 z-50 grid place-items-center p-4"
      style={{
        background: 'rgba(20, 20, 19, 0.7)',
        animation: 'cm-fade-in 180ms var(--ease-out)',
      }}
      onClick={onClose}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {pieces.map((p, i) => (
          <span
            key={i}
            className="absolute"
            style={{
              left: `${p.x}%`,
              top: '-10%',
              fontSize: 24,
              animation: `cm-fall ${p.duration}s linear ${p.delay}s forwards`,
            }}
          >
            {p.glyph}
          </span>
        ))}
      </div>
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm text-center"
        style={{
          background: 'var(--color-surface)',
          color: 'var(--color-text-primary)',
          outline: '2px solid var(--color-text-primary)',
          boxShadow: '6px 6px 0 var(--color-lime)',
          padding: 28,
          animation: 'cm-pop-in 320ms var(--ease-bounce)',
        }}
      >
        <button
          aria-label="Close"
          onClick={onClose}
          className="cursor-pointer absolute"
          style={{
            top: 8,
            right: 8,
            background: 'transparent',
            border: 'none',
            color: 'var(--color-text-secondary)',
          }}
        >
          <X size={18} />
        </button>
        <div
          className="font-mono uppercase"
          style={{ fontSize: 11, color: 'var(--color-text-secondary)', letterSpacing: '0.1em' }}
        >
          Badge unlocked ✨
        </div>
        <div
          style={{
            fontSize: 64,
            margin: '16px 0',
            animation: 'cm-pulse 1.6s ease-in-out infinite',
            lineHeight: 1,
          }}
        >
          {badge.icon}
        </div>
        <div className="font-brand uppercase" style={{ fontSize: 22, letterSpacing: '0.03em' }}>
          {badge.name}
        </div>
        <div
          className="font-body mt-2"
          style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}
        >
          {badge.description}
        </div>
        <div className="mt-5 flex justify-center">
          <Button variant="lime" onClick={onClose}>Nice</Button>
        </div>
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
