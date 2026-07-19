import type { GameMessage, GameMessageKey, MoneyLevel } from '../types/game'
import type { Locale } from './LocaleContext'
import { getQuestionsData } from '../data/questions'

interface MessageArgs {
  prize: string
  text: string
}

type MessageFormatter = (args: MessageArgs) => string

const messages: Record<Locale, Record<GameMessageKey, MessageFormatter>> = {
  ar: {
    correct: ({ prize }) => `إجابة صحيحة! الجائزة الحالية: ${prize}`,
    wrong: ({ text }) => `إجابة خاطئة! الإجابة الصحيحة كانت: ${text}`,
    timeout: ({ text }) => `انتهى الوقت! الإجابة الصحيحة كانت: ${text}`,
    walkAway: ({ prize }) => `لقد اخترت الانسحاب بالجائزة الحالية: ${prize}`,
    audience: () => 'تم استطلاع رأي الجمهور. انظر النتائج أدناه.',
  },
  en: {
    correct: ({ prize }) => `Correct! Current prize: ${prize}`,
    wrong: ({ text }) => `Wrong! The correct answer was: ${text}`,
    timeout: ({ text }) => `Time's up! The correct answer was: ${text}`,
    walkAway: ({ prize }) => `You chose to walk away with: ${prize}`,
    audience: () => 'Audience poll complete. See results below.',
  },
}

export function formatMessage(
  msg: GameMessage,
  locale: Locale,
  ctx: { chapterId: number; currentQuestionIndex: number },
  moneyLevels: MoneyLevel[],
): string {
  const { chapterQuestions } = getQuestionsData(locale)
  const prize = moneyLevels[msg.prizeIndex ?? -1]?.amount ?? ''
  const text = chapterQuestions[ctx.chapterId]?.[ctx.currentQuestionIndex]?.options[msg.correctIndex ?? -1]?.text ?? ''
  return messages[locale][msg.key]({ prize, text })
}
