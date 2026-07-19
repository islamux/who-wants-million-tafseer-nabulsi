import { useReducer, useCallback } from 'react'
import type { GameState, GameAction, Question } from '../types/game'
import { shuffleArray } from '../utils/helpers'

const TIMER_DURATION = 30

function cloneQuestions(questions: Question[]): Question[] {
  return questions.map(q => ({ ...q, options: q.options.map(o => ({ ...o })) }))
}

export function generateAudiencePoll(activeQuestions: Question[], questionIndex: number): number[] {
  const opts = activeQuestions[questionIndex].options
  const correctIndex = opts.findIndex(o => o.correct)
  const percentages = new Array(opts.length).fill(0)
  const correctPercentage = Math.floor(Math.random() * 40) + 40
  percentages[correctIndex] = correctPercentage
  let remaining = 100 - correctPercentage

  for (let i = 0; i < opts.length; i++) {
    if (i === correctIndex) continue
    const part = Math.floor(Math.random() * remaining * 0.8)
    percentages[i] = part
    remaining -= part
  }
  percentages[correctIndex] += remaining
  return percentages
}

export function createInitialState(): GameState {
  return {
    phase: 'idle',
    activeQuestions: [],
    chapterId: null,
    gameWon: false,
    walkedAway: false,
    currentQuestionIndex: -1,
    scoreIndex: -1,
    answerSelected: null,
    revealAnswers: false,
    gameMessage: null,
    lifelines: { fiftyFiftyUsed: false, audienceUsed: false },
    audiencePoll: null,
    timerValue: TIMER_DURATION,
  }
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME':
      return {
        ...createInitialState(),
        activeQuestions: cloneQuestions(action.questions),
        chapterId: action.chapterId,
        phase: 'playing',
        currentQuestionIndex: 0,
        timerValue: TIMER_DURATION,
      }

    case 'SELECT_ANSWER':
      if (state.revealAnswers) return state
      return {
        ...state,
        answerSelected: action.index,
        gameMessage: null,
        audiencePoll: null,
      }

    case 'CONFIRM_ANSWER': {
      if (state.answerSelected === null || state.revealAnswers) return state
      const q = state.activeQuestions[state.currentQuestionIndex]
      const selected = q.options[state.answerSelected]
      const correctIndex = q.options.findIndex(o => o.correct)
      const prizeIndex = state.currentQuestionIndex

      if (selected.correct) {
        if (state.currentQuestionIndex === state.activeQuestions.length - 1) {
          return {
            ...state,
            revealAnswers: true,
            scoreIndex: prizeIndex,
            phase: 'gameover',
            gameWon: true,
            gameMessage: { key: 'correct', type: 'success', prizeIndex },
          }
        }
        return {
          ...state,
          revealAnswers: true,
          scoreIndex: prizeIndex,
          gameMessage: { key: 'correct', type: 'success', prizeIndex },
        }
      }
      return {
        ...state,
        revealAnswers: true,
        phase: 'gameover',
        gameMessage: { key: 'wrong', type: 'error', correctIndex },
      }
    }

    case 'NEXT_QUESTION':
      return {
        ...state,
        currentQuestionIndex: state.currentQuestionIndex + 1,
        answerSelected: null,
        revealAnswers: false,
        gameMessage: null,
        audiencePoll: null,
        timerValue: TIMER_DURATION,
      }

    case 'USE_5050': {
      const activeQuestions = state.activeQuestions.map((q, qi) => {
        if (qi !== state.currentQuestionIndex) return q
        const options = q.options.map((o, i) => ({
          ...o,
          disabled: o.correct ? false : !action.keepIndices.includes(i),
        }))
        return { ...q, options }
      })
      return {
        ...state,
        activeQuestions,
        lifelines: { ...state.lifelines, fiftyFiftyUsed: true },
      }
    }

    case 'USE_AUDIENCE':
      return {
        ...state,
        lifelines: { ...state.lifelines, audienceUsed: true },
        audiencePoll: action.poll,
        gameMessage: { key: 'audience', type: 'info' },
      }

    case 'WALK_AWAY':
      // Preserves original semantics: walk-away prize = current level's money-tier index.
      return {
        ...state,
        phase: 'gameover',
        walkedAway: true,
        scoreIndex: state.currentQuestionIndex,
        gameMessage: { key: 'walkAway', type: 'info', prizeIndex: state.currentQuestionIndex },
      }

    case 'TIMEOUT': {
      const correctIndex = state.activeQuestions[state.currentQuestionIndex].options.findIndex(o => o.correct)
      return {
        ...state,
        revealAnswers: true,
        phase: 'gameover',
        gameMessage: { key: 'timeout', type: 'error', correctIndex },
      }
    }

    case 'TICK':
      return { ...state, timerValue: state.timerValue - 1 }

    case 'RESTART':
      return createInitialState()

    default:
      return state
  }
}

export function useGame(questionsForChapter: (chapterId: number) => Question[]) {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState)

  const startGame = useCallback((chapterId: number) => {
    dispatch({ type: 'START_GAME', chapterId, questions: questionsForChapter(chapterId) })
  }, [questionsForChapter])
  const selectAnswer = useCallback((index: number) => dispatch({ type: 'SELECT_ANSWER', index }), [])
  const confirmAnswer = useCallback(() => dispatch({ type: 'CONFIRM_ANSWER' }), [])

  const nextQuestion = useCallback(() => dispatch({ type: 'NEXT_QUESTION' }), [])

  const useFiftyFifty = useCallback(() => {
    const q = state.activeQuestions[state.currentQuestionIndex]
    const correctIndex = q.options.findIndex(o => o.correct)
    const incorrectIndices = q.options
      .map((o, i) => ({ i, correct: o.correct }))
      .filter(x => !x.correct)
      .map(x => x.i)
    const kept = shuffleArray(incorrectIndices).slice(0, 1)
    dispatch({ type: 'USE_5050', keepIndices: [correctIndex, ...kept] })
  }, [state.currentQuestionIndex, state.activeQuestions])

  const useAudience = useCallback(() => {
    const poll = generateAudiencePoll(state.activeQuestions, state.currentQuestionIndex)
    dispatch({ type: 'USE_AUDIENCE', poll })
  }, [state.activeQuestions, state.currentQuestionIndex])

  const walkAway = useCallback(() => dispatch({ type: 'WALK_AWAY' }), [])

  const handleTimeout = useCallback(() => dispatch({ type: 'TIMEOUT' }), [])

  const tick = useCallback(() => dispatch({ type: 'TICK' }), [])
  const restart = useCallback(() => dispatch({ type: 'RESTART' }), [])

  const currentQuestion = state.currentQuestionIndex >= 0
    ? state.activeQuestions[state.currentQuestionIndex]
    : null

  return {
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
  }
}
