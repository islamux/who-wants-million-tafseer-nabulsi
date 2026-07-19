import type { Question, MoneyLevel } from '../types/game'
import type { Locale } from '../i18n/LocaleContext'
import {
  chapterQuestionsAr, chapterListAr, chapterNamesAr,
} from './questions.ar'
import {
  chapterQuestionsEn, chapterListEn, chapterNamesEn,
} from './questions.en'

export interface QuestionsData {
  chapterQuestions: Record<number, Question[]>
  chapterList: { id: number; title: string }[]
  chapterNames: Record<number, string>
}

export function getQuestionsData(locale: Locale): QuestionsData {
  if (locale === 'ar') {
    return {
      chapterQuestions: chapterQuestionsAr,
      chapterList: chapterListAr,
      chapterNames: chapterNamesAr,
    }
  }
  return {
    chapterQuestions: chapterQuestionsEn,
    chapterList: chapterListEn,
    chapterNames: chapterNamesEn,
  }
}

const MONEY_TIERS_25 = [
  { amount: '500', safe: false },
  { amount: '1,000', safe: false },
  { amount: '2,000', safe: false },
  { amount: '5,000', safe: false },
  { amount: '10,000', safe: true },
  { amount: '25,000', safe: false },
  { amount: '50,000', safe: false },
  { amount: '100,000', safe: false },
  { amount: '250,000', safe: false },
  { amount: '500,000', safe: true },
  { amount: '750,000', safe: false },
  { amount: '1,000,000', safe: false },
  { amount: '1,250,000', safe: false },
  { amount: '1,500,000', safe: false },
  { amount: '1,750,000', safe: false },
  { amount: '2,000,000', safe: false },
  { amount: '2,500,000', safe: false },
  { amount: '3,000,000', safe: false },
  { amount: '3,500,000', safe: false },
  { amount: '4,000,000', safe: false },
  { amount: '5,000,000', safe: false },
  { amount: '6,000,000', safe: false },
  { amount: '7,000,000', safe: false },
  { amount: '8,500,000', safe: false },
  { amount: '10,000,000', safe: true },
]

const MONEY_TIERS_5 = [
  { amount: '500,000', safe: false },
  { amount: '1,000,000', safe: false },
  { amount: '2,500,000', safe: false },
  { amount: '5,000,000', safe: false },
  { amount: '10,000,000', safe: true },
]

export function generateMoneyLevels(questionCount: number, currency: string): MoneyLevel[] {
  const tiers = questionCount <= 5 ? MONEY_TIERS_5 : MONEY_TIERS_25
  return tiers.map(t => ({
    amount: `${t.amount} ${currency}`,
    isSafeHaven: t.safe,
  }))
}

export function getSafeHavenIndex(currentIndex: number, moneyLevels: MoneyLevel[]): number {
  for (let i = currentIndex - 1; i >= 0; i--) {
    if (moneyLevels[i]?.isSafeHaven) return i
  }
  return -1
}
