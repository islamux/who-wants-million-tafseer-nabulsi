import { useState, useEffect, useCallback } from 'react'
import { Download, X } from 'lucide-react'
import { useI18n } from '../i18n/LocaleContext'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  prompt: () => Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export default function InstallPrompt() {
  const { t, dir } = useI18n()
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setVisible(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setDeferredPrompt(null)
    }
    setVisible(false)
  }, [deferredPrompt])

  const handleDismiss = useCallback(() => {
    setVisible(false)
  }, [])

  if (!visible) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 flex items-center justify-between gap-3 rounded-xl bg-gradient-to-r from-[#0f0c29] via-[#302b63] to-[#24243e] px-4 py-3 shadow-2xl border border-white/10 md:left-auto md:right-4 md:w-96"
      dir={dir}>
      <div className="flex items-center gap-3">
        <Download className="h-5 w-5 text-[#ffd700] shrink-0" />
        <span className="text-sm text-white/90">{t('installPromptTitle')}</span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleInstall}
          className="rounded-full bg-gradient-to-r from-[#ffd700] to-[#ffaa00] px-4 py-1.5 text-xs font-bold text-[#0f0c29] hover:scale-105 transition-transform"
        >
          {t('installPromptButton')}
        </button>
        <button
          onClick={handleDismiss}
          className="rounded-full p-1.5 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          aria-label={t('installPromptDismiss')}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
