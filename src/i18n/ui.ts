import type { Locale } from './LocaleContext'

export type InterpolatedKey = 'youWonAmount' | 'wentHomeWithAmount' | 'roundLabel' | 'progressLabel' | 'zeroPrize'

export interface UiStrings {
  pageTitle: string
  logoAlt: string
  readyPrompt: string
  interviewTitle: string
  interviewDesc: string
  confirmAnswer: string
  nextQuestion: string
  seconds: string
  audiencePoll: string
  walkAway: string
  audienceResultsHeading: string
  moneyTreeTitle: string
  moneyTreeOpenAria: string
  moneyTreeCloseAria: string
  complete: string
  playAgain: string
  errorOccurred: string
  reload: string
  youAreAMillionaire: string
  langToggleAria: string
  toggleDisabledHint: string
  installPromptTitle: string
  installPromptButton: string
  installPromptDismiss: string
  updatePromptTitle: string
  updatePromptButton: string
  youWonAmount: (amount: string) => string
  wentHomeWithAmount: (amount: string) => string
  roundLabel: (ordinal: string) => string
  progressLabel: (pct: number) => string
  zeroPrize: string
}

export const ui: Record<Locale, UiStrings> = {
  ar: {
    pageTitle: 'من سيربح المليون — تفسير النابلسي',
    logoAlt: 'شعار اللعبة',
    readyPrompt: 'هل أنت مستعد لتحدي المليون؟',
    interviewTitle: 'مقابلة تقنية — تفسير النابلسي',
    interviewDesc: 'مقابلة فنية لاختبار الفهم الحقيقي لكود React و TypeScript و Vite، 105 أسئلة موزعة على 5 فصول. المشروع: قارئ تفسير رقمي — تفسير النابلسي.',
    confirmAnswer: 'تأكيد الإجابة النهائية',
    nextQuestion: 'السؤال التالي',
    seconds: 'ثواني',
    audiencePoll: 'سؤال الجمهور',
    walkAway: 'انسحاب',
    audienceResultsHeading: 'نتائج تصويت الجمهور:',
    moneyTreeTitle: 'شجرة المال',
    moneyTreeOpenAria: 'فتح شجرة المال',
    moneyTreeCloseAria: 'إغلاق شجرة المال',
    complete: 'مكتمل',
    playAgain: 'العب مرة أخرى',
    errorOccurred: 'حدث خطأ غير متوقع',
    reload: 'إعادة تحميل',
    youAreAMillionaire: 'أنت الآن مليونير!',
    langToggleAria: 'تغيير اللغة',
    toggleDisabledHint: 'أكمل الجولة لتغيير اللغة',
    youWonAmount: (amount) => `لقد فزت بمبلغ ${amount}.`,
    wentHomeWithAmount: (amount) => `لقد عدت إلى المنزل بمبلغ ${amount}.`,
    roundLabel: (ordinal) => `الجولة ${ordinal}`,
    progressLabel: (pct) => `${pct}% مكتمل`,
    zeroPrize: '0 ريال',
    installPromptTitle: 'ثبّت التطبيق للاستخدام بدون إنترنت',
    installPromptButton: 'تثبيت',
    installPromptDismiss: 'إغلاق',
    updatePromptTitle: 'يتوفر تحديث جديد',
    updatePromptButton: 'تحديث',
  },
  en: {
    pageTitle: 'Who Wants to Be a Millionaire — Tafsir Nabulsi',
    logoAlt: 'Game logo',
    readyPrompt: 'Are you ready for the million challenge?',
    interviewTitle: 'Technical interview — Tafsir Nabulsi',
    interviewDesc: 'A technical interview testing real understanding of React, TypeScript, and Vite code. 105 questions across 5 chapters. Project: a digital tafsir reader — Tafsir Nabulsi.',
    confirmAnswer: 'Lock in final answer',
    nextQuestion: 'Next question',
    seconds: 'seconds',
    audiencePoll: 'Ask the audience',
    walkAway: 'Walk away',
    audienceResultsHeading: 'Audience poll results:',
    moneyTreeTitle: 'Money tree',
    moneyTreeOpenAria: 'Open money tree',
    moneyTreeCloseAria: 'Close money tree',
    complete: 'complete',
    playAgain: 'Play again',
    errorOccurred: 'An unexpected error occurred',
    reload: 'Reload',
    youAreAMillionaire: 'You are now a millionaire!',
    langToggleAria: 'Switch language',
    toggleDisabledHint: 'Finish the round to change language',
    youWonAmount: (amount) => `You won ${amount}.`,
    wentHomeWithAmount: (amount) => `You went home with ${amount}.`,
    roundLabel: (ordinal) => `Round ${ordinal}`,
    progressLabel: (pct) => `${pct}% complete`,
    zeroPrize: '0 SAR',
    installPromptTitle: 'Install app for offline play',
    installPromptButton: 'Install',
    installPromptDismiss: 'Dismiss',
    updatePromptTitle: 'A new update is available',
    updatePromptButton: 'Update',
  },
}
