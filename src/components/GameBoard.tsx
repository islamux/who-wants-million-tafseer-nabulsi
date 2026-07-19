import { useEffect, useRef } from 'react'
import { CheckCircle, ChevronLeft } from 'lucide-react'
import type { GameState, Question, MoneyLevel } from '../types/game'
import type { SoundName } from '../hooks/useSound'
import { QuestionCard } from './QuestionCard'
import { Timer } from './Timer'
import { Lifelines } from './Lifelines'
import { AudiencePoll } from './AudiencePoll'
import { useI18n } from '../i18n/LocaleContext'

const TICK_INTERVAL_MS = 1000
const REVEAL_SOUND_DELAY_MS = 1500
const AUTO_NEXT_DELAY_MS = 2500
const TICK_SOUND_THRESHOLD = 5

interface Props {
  state: GameState
  currentQuestion: Question | null
  moneyLevels: MoneyLevel[]
  soundPlay: (name: SoundName) => void
  soundInit: () => Promise<void>
  onSelect: (index: number) => void
  onConfirm: () => void
  onNext: () => void
  on5050: () => void
  onAudience: () => void
  onWalkAway: () => void
  onTimeout: () => void
  onTick: () => void
}

export function GameBoard({
  state,
  currentQuestion,
  moneyLevels,
  soundPlay,
  soundInit,
  onSelect,
  onConfirm,
  onNext,
  on5050,
  onAudience,
  onWalkAway,
  onTimeout,
  onTick,
}: Props) {
  const { t, formatMessage } = useI18n()
  const timeoutHandled = useRef(false)

  useEffect(() => {
    soundInit()
  }, [soundInit])

  useEffect(() => {
    timeoutHandled.current = false
  }, [state.currentQuestionIndex])

  useEffect(() => {
    if (state.phase !== 'playing' || state.revealAnswers) return
    const id = setInterval(onTick, TICK_INTERVAL_MS)
    return () => clearInterval(id)
  }, [state.currentQuestionIndex, state.phase, state.revealAnswers, onTick])

  useEffect(() => {
    if (state.phase !== 'playing' || state.revealAnswers) return
    if (state.timerValue <= 0 && !timeoutHandled.current) {
      timeoutHandled.current = true
      onTimeout()
      return
    }
    if (state.timerValue <= TICK_SOUND_THRESHOLD && state.timerValue > 0) {
      soundPlay('timerTick')
    }
  }, [state.timerValue, state.revealAnswers, state.phase, soundPlay, onTimeout])

  useEffect(() => {
    if (!state.revealAnswers) return

    const correct = currentQuestion?.options[state.answerSelected ?? -1]?.correct ?? false
    const timer = setTimeout(() => {
      soundPlay(correct ? 'correct' : 'incorrect')
    }, REVEAL_SOUND_DELAY_MS)
    return () => clearTimeout(timer)
  }, [state.revealAnswers, state.answerSelected, currentQuestion, soundPlay])

  useEffect(() => {
    if (!state.revealAnswers) return

    const correct = currentQuestion?.options[state.answerSelected ?? -1]?.correct ?? false
    if (correct && state.currentQuestionIndex < state.activeQuestions.length - 1) {
      const timer = setTimeout(onNext, AUTO_NEXT_DELAY_MS)
      return () => clearTimeout(timer)
    }
  }, [state.revealAnswers, state.answerSelected, state.currentQuestionIndex, state.activeQuestions.length, currentQuestion, onNext])

  const handleConfirm = () => {
    soundPlay('finalAnswer')
    onConfirm()
  }

  if (!currentQuestion) return null

  const isCorrectReveal =
    state.revealAnswers &&
    state.answerSelected !== null &&
    currentQuestion.options[state.answerSelected]?.correct === true
  const isLastQuestion =
    state.currentQuestionIndex >= state.activeQuestions.length - 1
  const showNextButton = isCorrectReveal && !isLastQuestion

  const messageText = state.gameMessage && state.chapterId !== null
    ? formatMessage(state.gameMessage, { chapterId: state.chapterId, currentQuestionIndex: state.currentQuestionIndex }, moneyLevels)
    : ''

  return (
    <div className="animate-fade-in">
      <QuestionCard
        question={currentQuestion}
        answerSelected={state.answerSelected}
        revealAnswers={state.revealAnswers}
        onSelect={onSelect}
      />

      <Timer value={state.timerValue} active={!state.revealAnswers} />

      <div className="text-center mt-5">
        <button
          onClick={handleConfirm}
          disabled={state.answerSelected === null || state.revealAnswers}
          className="bg-gradient-to-l from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-gray-900 font-bold py-3 px-8 rounded-2xl text-base transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-yellow-400/20 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none cursor-pointer"
        >
          <CheckCircle className="inline-block ms-1" size={20} />
          {t('confirmAnswer')}
        </button>
      </div>

      <Lifelines
        lifelines={state.lifelines}
        revealAnswers={state.revealAnswers}
        on5050={on5050}
        onAudience={onAudience}
        onWalkAway={onWalkAway}
      />

      <AudiencePoll poll={state.audiencePoll} />

      {state.gameMessage && (
        <div
          role="alert"
          className={`
            backdrop-blur-xl rounded-xl p-4 mt-4 text-center animate-slide-up border
            ${state.gameMessage.type === 'success'
              ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
              : state.gameMessage.type === 'error'
                ? 'bg-rose-500/20 border-rose-500/30 text-rose-300'
                : 'bg-blue-500/20 border-blue-500/30 text-blue-300'
            }
          `}
        >
          {messageText}
        </div>
      )}

      {showNextButton && (
        <div className="text-center mt-4">
          <button
            onClick={onNext}
            className="bg-gradient-to-l from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold py-3 px-8 rounded-2xl text-base transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-emerald-400/20 hover:-translate-y-0.5 cursor-pointer inline-flex items-center gap-2"
          >
            <ChevronLeft size={22} />
            {t('nextQuestion')}
          </button>
        </div>
      )}
    </div>
  )
}
