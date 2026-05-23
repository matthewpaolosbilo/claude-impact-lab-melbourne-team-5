import { useToastState } from '../hooks/useToast'
import Toast from './ui/Toast'

// Map our internal toast 'kind' onto Toast variants.
const KIND_TO_VARIANT = {
  success: 'success',
  error: 'error',
  info: 'info',
  badge: 'success', // badge celebrations slot into the success rail
}

export default function Toaster() {
  const { toasts, api } = useToastState()
  return (
    <div className="fixed right-4 bottom-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto"
          style={{ animation: 'cm-slide-in 220ms var(--ease-spring)' }}
        >
          <Toast
            variant={KIND_TO_VARIANT[t.kind] || 'info'}
            onClose={() => api.dismiss(t.id)}
            showEmoji={t.kind !== 'badge'}
          >
            {t.kind === 'badge' ? (
              <div>
                <div className="font-brand uppercase" style={{ fontSize: 11, letterSpacing: '0.06em' }}>
                  <span aria-hidden style={{ marginRight: 6 }}>{t.badge?.icon || '✨'}</span>
                  New badge
                </div>
                <div style={{ fontSize: 13, marginTop: 2 }}>
                  {t.badge?.name} — {t.badge?.description}
                </div>
              </div>
            ) : (
              <span>{t.message}</span>
            )}
          </Toast>
        </div>
      ))}
    </div>
  )
}
