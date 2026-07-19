import { Languages } from 'lucide-react'
import { useI18n } from '../i18n/LocaleContext'

interface Props {
  disabled?: boolean
}

export function LanguageToggle({ disabled = false }: Props) {
  const { t, otherLangShort, toggleLocale } = useI18n()
  const aria = t('langToggleAria')
  const hint = t('toggleDisabledHint')
  return (
    <button
      type="button"
      onClick={toggleLocale}
      disabled={disabled}
      aria-label={aria}
      title={disabled ? hint : aria}
      className={`fixed top-4 start-4 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold backdrop-blur-xl border transition-all duration-300 ${
        disabled
          ? 'bg-white/5 border-white/10 opacity-40 cursor-not-allowed'
          : 'bg-white/10 border-white/20 hover:bg-white/20 cursor-pointer'
      }`}
    >
      <Languages size={16} className="text-yellow-400" />
      <span>{otherLangShort}</span>
    </button>
  )
}
