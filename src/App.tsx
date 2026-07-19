import { useCallback, useMemo } from 'react'
import { useGame } from './hooks/useGame'
import { useSound } from './hooks/useSound'
import { StartScreen } from './components/StartScreen'
import { GameBoard } from './components/GameBoard'
import { GameOver } from './components/GameOver'
import { MoneyTree } from './components/MoneyTree'
import { ErrorBoundary } from './components/ErrorBoundary'
import { LanguageToggle } from './components/LanguageToggle'
import InstallPrompt from './components/InstallPrompt'
import PWAUpdatePrompt from './components/PWAUpdatePrompt'
import { useI18n } from './i18n/LocaleContext'
import { getSafeHavenIndex, generateMoneyLevels } from './data/questions'
import './App.css'

export default function App() {
  const { t, tf, questionsData, formatMessage, locale } = useI18n()

  const questionsForChapter = useCallback(
    (chapterId: number) => questionsData.chapterQuestions[chapterId] ?? [],
    [questionsData.chapterQuestions],
  )

  const {
    state,
    currentQuestion,
    startGame,
    selectAnswer,
    confirmAnswer,
    nextQuestion,
    useFiftyFifty,
    useAudience,
    walkAway,
    handleTimeout,
    tick,
    restart,
  } = useGame(questionsForChapter)

  const { initialize, play } = useSound()

  const currency = locale === 'ar' ? 'ريال' : 'SAR'

  const moneyLevels = useMemo(() => {
    if (state.chapterId === null) return generateMoneyLevels(25, currency)
    const qCount = questionsData.chapterQuestions[state.chapterId]?.length ?? 25
    return generateMoneyLevels(qCount, currency)
  }, [state.chapterId, questionsData.chapterQuestions, currency])

  const safeHavenIndex = useMemo(
    () => (state.currentQuestionIndex >= 0 ? getSafeHavenIndex(state.currentQuestionIndex, moneyLevels) : -1),
    [state.currentQuestionIndex, moneyLevels],
  )

  const formattedMessage = state.gameMessage && state.chapterId !== null
    ? formatMessage(state.gameMessage, { chapterId: state.chapterId, currentQuestionIndex: state.currentQuestionIndex }, moneyLevels)
    : ''

  const winnings = state.gameWon
    ? t('youAreAMillionaire')
    : state.walkedAway
      ? tf('youWonAmount', moneyLevels[state.scoreIndex]?.amount ?? t('zeroPrize'))
      : tf('wentHomeWithAmount', moneyLevels[safeHavenIndex]?.amount ?? t('zeroPrize'))

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 flex flex-col md:flex-row gap-6">
      <LanguageToggle disabled={state.phase === 'playing'} />
      <InstallPrompt />
      <PWAUpdatePrompt />

      <div className="flex-1">
        {state.phase === 'idle' && (
          <StartScreen onStart={startGame} />
        )}

        {state.phase === 'playing' && (
          <ErrorBoundary>
            <GameBoard
              state={state}
              currentQuestion={currentQuestion}
              moneyLevels={moneyLevels}
              soundPlay={play}
              soundInit={initialize}
              onSelect={selectAnswer}
              onConfirm={confirmAnswer}
              onNext={nextQuestion}
              on5050={useFiftyFifty}
              onAudience={useAudience}
              onWalkAway={walkAway}
              onTimeout={handleTimeout}
              onTick={tick}
            />
          </ErrorBoundary>
        )}

        {state.phase === 'gameover' && (
          <ErrorBoundary>
            <GameOver
              gameWon={state.gameWon}
              walkedAway={state.walkedAway}
              message={formattedMessage}
              winnings={winnings}
              onRestart={restart}
            />
          </ErrorBoundary>
        )}
      </div>

      <MoneyTree
        currentQuestionIndex={state.currentQuestionIndex}
        gameStarted={state.phase === 'playing'}
        gameOver={state.phase === 'gameover'}
        moneyLevels={moneyLevels}
      />
    </div>
  )
}
