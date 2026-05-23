import { CheckCircle2, Info, AlertTriangle, Sparkles, X } from 'lucide-react'
import { useToastState } from '../hooks/useToast'

const KIND_STYLES = {
  success: 'border-cm-green/40 bg-white',
  info: 'border-stone-200 bg-white',
  error: 'border-red-300 bg-white',
  badge: 'border-cm-gold/60 bg-gradient-to-br from-cm-cream to-white',
}

function IconFor({ kind, badge }) {
  if (kind === 'badge') return <span className="text-2xl">{badge?.icon || '✨'}</span>
  if (kind === 'success') return <CheckCircle2 className="text-cm-green" size={20} />
  if (kind === 'error') return <AlertTriangle className="text-red-500" size={20} />
  return <Info className="text-cm-warm-gray" size={20} />
}

export default function Toaster() {
  const { toasts, api } = useToastState()
  return (
    <div className="fixed right-4 bottom-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={`pointer-events-auto min-w-[260px] max-w-sm rounded-xl border shadow-md p-3 flex items-start gap-3 ${KIND_STYLES[t.kind] || KIND_STYLES.info} animate-[cm-slide-in_220ms_ease-out]`}
        >
          <div className="shrink-0 mt-0.5"><IconFor kind={t.kind} badge={t.badge} /></div>
          <div className="flex-1 text-sm text-cm-charcoal">
            {t.kind === 'badge' ? (
              <>
                <div className="flex items-center gap-1 font-semibold text-cm-charcoal">
                  <Sparkles size={14} className="text-cm-gold" /> New badge!
                </div>
                <div>{t.badge?.name} — {t.badge?.description}</div>
              </>
            ) : (
              <span>{t.message}</span>
            )}
          </div>
          <button
            aria-label="Dismiss"
            onClick={() => api.dismiss(t.id)}
            className="shrink-0 text-cm-warm-gray hover:text-cm-charcoal"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
