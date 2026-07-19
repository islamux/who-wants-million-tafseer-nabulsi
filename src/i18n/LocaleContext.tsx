import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import type { ReactNode } from 'react'
import { ui } from './ui'
import { formatMessage } from './messages'
import { getQuestionsData } from '../data/questions'
import type { Question, MoneyLevel, GameMessage } from '../types/game'

export type Locale = 'ar' | 'en'

export function detectLocale(navigatorLanguage: string | null, stored: string | null): Locale {
  if (stored === 'ar' || stored === 'en') return stored
  if (!navigatorLanguage) return 'ar'
  return navigatorLanguage.toLowerCase().startsWith('ar') ? 'ar' : 'en'
}

type InterpolatedKey = 'youWonAmount' | 'wentHomeWithAmount' | 'roundLabel' | 'progressLabel'

type StaticKey = keyof Omit<typeof ui.ar, InterpolatedKey>

type InterpolatedFns = {
  [K in InterpolatedKey]: (typeof ui.ar)[K]
}

interface LocaleCtx {
  locale: Locale
  setLocale: (l: Locale) => void
  toggleLocale: () => void
  dir: 'rtl' | 'ltr'
  t: (key: StaticKey) => string
  tf: <K extends InterpolatedKey>(key: K, ...args: Parameters<InterpolatedFns[K]>) => string
  formatMessage: (msg: GameMessage, ctx: { chapterId: number; currentQuestionIndex: number }, moneyLevels: MoneyLevel[]) => string
  questionsData: {
    chapterQuestions: Record<number, Question[]>
    chapterList: { id: number; title: string }[]
    chapterNames: Record<number, string>
  }
  otherLangShort: string
}

const LocaleContext = createContext<LocaleCtx | null>(null)

const STORAGE_KEY = 'lang'

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window === 'undefined') return 'ar'
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return detectLocale(window.navigator?.language ?? null, stored)
  })

  useEffect(() => {
    if (typeof document === 'undefined') return
    document.documentElement.lang = locale
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr'
    document.title = ui[locale].pageTitle
    window.localStorage.setItem(STORAGE_KEY, locale)
  }, [locale])

  const setLocale = useCallback((l: Locale) => setLocaleState(l), [])
  const toggleLocale = useCallback(() => setLocaleState(prev => (prev === 'ar' ? 'en' : 'ar')), [])

  const questionsData = useMemo(() => getQuestionsData(locale), [locale])

  const ctx = useMemo<LocaleCtx>(() => {
    const strings = ui[locale]
    return {
      locale,
      setLocale,
      toggleLocale,
      dir: locale === 'ar' ? 'rtl' : 'ltr',
      t: (key) => strings[key] as string,
      tf: ((key: InterpolatedKey, ...args: never[]) =>
        (strings[key] as (...a: never[]) => string)(...args)) as LocaleCtx['tf'],
      formatMessage: (msg, ctx2, moneyLevels) => formatMessage(msg, locale, ctx2, moneyLevels),
      questionsData,
      otherLangShort: locale === 'ar' ? 'EN' : 'ع',
    }
  }, [locale, setLocale, toggleLocale, questionsData])

  return <LocaleContext.Provider value={ctx}>{children}</LocaleContext.Provider>
}

export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale must be used inside <LocaleProvider>')
  return { locale: ctx.locale, dir: ctx.dir, setLocale: ctx.setLocale, toggleLocale: ctx.toggleLocale }
}

export function useI18n() {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useI18n must be used inside <LocaleProvider>')
  return ctx
}
