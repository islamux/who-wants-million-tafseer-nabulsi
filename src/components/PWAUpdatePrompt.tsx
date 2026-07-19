import { useCallback } from 'react'
import { RefreshCw } from 'lucide-react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { useI18n } from '../i18n/LocaleContext'

export default function PWAUpdatePrompt() {
  const { t, dir } = useI18n()
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, r) {
      if (!r) return
      setInterval(async () => {
        if (r.installing || !navigator.onLine || !('connection' in navigator)) return
        await r.update()
      }, 60 * 60 * 1000)
    },
  })

  const handleUpdate = useCallback(() => {
    updateServiceWorker(true)
  }, [updateServiceWorker])

  if (!needRefresh) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 flex items-center justify-between gap-3 rounded-xl bg-gradient-to-r from-[#0f0c29] via-[#302b63] to-[#24243e] px-4 py-3 shadow-2xl border border-white/10 md:left-auto md:right-4 md:w-96"
      dir={dir}>
      <div className="flex items-center gap-3">
        <RefreshCw className="h-5 w-5 text-[#ffd700] shrink-0" />
        <span className="text-sm text-white/90">{t('updatePromptTitle')}</span>
      </div>
      <button
        onClick={handleUpdate}
        className="rounded-full bg-gradient-to-r from-[#ffd700] to-[#ffaa00] px-4 py-1.5 text-xs font-bold text-[#0f0c29] hover:scale-105 transition-transform shrink-0"
      >
        {t('updatePromptButton')}
      </button>
    </div>
  )
}
