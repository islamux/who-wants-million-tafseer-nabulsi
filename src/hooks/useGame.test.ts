import { describe, it, expect } from 'vitest'
import { gameReducer, createInitialState, generateAudiencePoll } from './useGame'
import { chapterQuestionsAr } from '../data/questions.ar'
import { getQuestionsData } from '../data/questions'

const TEST_CHAPTER = 5
const testQuestions = chapterQuestionsAr[TEST_CHAPTER]

function startTestGame() {
  return gameReducer(createInitialState(), {
    type: 'START_GAME',
    chapterId: TEST_CHAPTER,
    questions: testQuestions,
  })
}

describe('createInitialState', () => {
  it('returns a state with phase "idle" and scoreIndex -1', () => {
    const state = createInitialState()
    expect(state.phase).toBe('idle')
    expect(state.currentQuestionIndex).toBe(-1)
    expect(state.scoreIndex).toBe(-1)
    expect(state.answerSelected).toBeNull()
    expect(state.revealAnswers).toBe(false)
    expect(state.gameWon).toBe(false)
    expect(state.walkedAway).toBe(false)
    expect(state.timerValue).toBe(30)
    expect(state.lifelines.fiftyFiftyUsed).toBe(false)
    expect(state.lifelines.audienceUsed).toBe(false)
    expect(state.audiencePoll).toBeNull()
    expect(state.gameMessage).toBeNull()
    expect(state.activeQuestions).toEqual([])
  })
})

describe('gameReducer', () => {
  it('START_GAME sets phase to "playing" and clones questions', () => {
    const state = startTestGame()
    expect(state.phase).toBe('playing')
    expect(state.currentQuestionIndex).toBe(0)
    expect(state.timerValue).toBe(30)
    expect(state.activeQuestions.length).toBe(testQuestions.length)
    expect(state.activeQuestions[0].text).toBe(testQuestions[0].text)
    expect(state.activeQuestions[0].options[0].correct).toBe(testQuestions[0].options[0].correct)
  })

  describe('SELECT_ANSWER', () => {
    it('sets answerSelected to the given index', () => {
      const playing = startTestGame()
      const state = gameReducer(playing, { type: 'SELECT_ANSWER', index: 2 })
      expect(state.answerSelected).toBe(2)
    })

    it('does nothing when answers are already revealed', () => {
      const playing = startTestGame()
      const correctIndex = playing.activeQuestions[0].options.findIndex(o => o.correct)
      const selected = gameReducer(playing, { type: 'SELECT_ANSWER', index: correctIndex })
      const revealed = gameReducer(selected, { type: 'CONFIRM_ANSWER' })
      expect(revealed.revealAnswers).toBe(true)
      const state = gameReducer(revealed, { type: 'SELECT_ANSWER', index: 1 })
      expect(state.answerSelected).toBe(correctIndex)
    })
  })

  describe('CONFIRM_ANSWER', () => {
    it('does nothing when no answer is selected', () => {
      const playing = startTestGame()
      const state = gameReducer(playing, { type: 'CONFIRM_ANSWER' })
      expect(state).toEqual(playing)
    })

    it('returns gameover for a wrong answer with a "wrong" message key', () => {
      const playing = startTestGame()
      const wrongIndex = playing.activeQuestions[0].options.findIndex(o => !o.correct)
      const correctIndex = playing.activeQuestions[0].options.findIndex(o => o.correct)
      const selected = gameReducer(playing, { type: 'SELECT_ANSWER', index: wrongIndex })
      const state = gameReducer(selected, { type: 'CONFIRM_ANSWER' })
      expect(state.phase).toBe('gameover')
      expect(state.gameWon).toBe(false)
      expect(state.revealAnswers).toBe(true)
      expect(state.gameMessage?.key).toBe('wrong')
      expect(state.gameMessage?.type).toBe('error')
      expect(state.gameMessage?.correctIndex).toBe(correctIndex)
    })

    it('reveals correct answer without ending game (not last question)', () => {
      const playing = startTestGame()
      const correctIndex = playing.activeQuestions[0].options.findIndex(o => o.correct)
      const selected = gameReducer(playing, { type: 'SELECT_ANSWER', index: correctIndex })
      const state = gameReducer(selected, { type: 'CONFIRM_ANSWER' })
      expect(state.phase).toBe('playing')
      expect(state.revealAnswers).toBe(true)
      expect(state.scoreIndex).toBe(0)
      expect(state.gameMessage?.key).toBe('correct')
      expect(state.gameMessage?.type).toBe('success')
      expect(state.gameMessage?.prizeIndex).toBe(0)
    })

    it('wins the game on the last question', () => {
      const almostDone = {
        ...createInitialState(),
        phase: 'playing' as const,
        activeQuestions: [...testQuestions],
        currentQuestionIndex: testQuestions.length - 1,
      }
      const correctIndex = almostDone.activeQuestions[testQuestions.length - 1].options.findIndex(o => o.correct)
      const selected = gameReducer(almostDone, { type: 'SELECT_ANSWER', index: correctIndex })
      const state = gameReducer(selected, { type: 'CONFIRM_ANSWER' })
      expect(state.phase).toBe('gameover')
      expect(state.gameWon).toBe(true)
      expect(state.revealAnswers).toBe(true)
      expect(state.gameMessage?.key).toBe('correct')
    })

    it('ignores CONFIRM_ANSWER after answers are already revealed', () => {
      const playing = startTestGame()
      const correctIndex = playing.activeQuestions[0].options.findIndex(o => o.correct)
      const selected = gameReducer(playing, { type: 'SELECT_ANSWER', index: correctIndex })
      const revealed = gameReducer(selected, { type: 'CONFIRM_ANSWER' })
      const again = gameReducer(revealed, { type: 'CONFIRM_ANSWER' })
      expect(again).toEqual(revealed)
    })
  })

  describe('NEXT_QUESTION', () => {
    it('increments index and resets answer state', () => {
      const playing = startTestGame()
      const correctIndex = playing.activeQuestions[0].options.findIndex(o => o.correct)
      const selected = gameReducer(playing, { type: 'SELECT_ANSWER', index: correctIndex })
      const confirmed = gameReducer(selected, { type: 'CONFIRM_ANSWER' })
      const state = gameReducer(confirmed, { type: 'NEXT_QUESTION' })
      expect(state.currentQuestionIndex).toBe(1)
      expect(state.answerSelected).toBeNull()
      expect(state.revealAnswers).toBe(false)
      expect(state.gameMessage).toBeNull()
      expect(state.timerValue).toBe(30)
    })
  })

  it('TICK decrements the timer', () => {
    const playing = startTestGame()
    const state = gameReducer(playing, { type: 'TICK' })
    expect(state.timerValue).toBe(29)
  })

  describe('TIMEOUT', () => {
    it('ends the game with a "timeout" message key and correctIndex', () => {
      const playing = startTestGame()
      const correctIndex = playing.activeQuestions[0].options.findIndex(o => o.correct)
      const state = gameReducer(playing, { type: 'TIMEOUT' })
      expect(state.phase).toBe('gameover')
      expect(state.revealAnswers).toBe(true)
      expect(state.gameMessage?.key).toBe('timeout')
      expect(state.gameMessage?.type).toBe('error')
      expect(state.gameMessage?.correctIndex).toBe(correctIndex)
    })
  })

  describe('WALK_AWAY', () => {
    it('ends the game with walkedAway and prizeIndex = currentQuestionIndex', () => {
      const playing = startTestGame()
      const state = gameReducer(playing, { type: 'WALK_AWAY' })
      expect(state.phase).toBe('gameover')
      expect(state.walkedAway).toBe(true)
      expect(state.scoreIndex).toBe(0)
      expect(state.gameMessage?.key).toBe('walkAway')
      expect(state.gameMessage?.prizeIndex).toBe(0)
    })
  })

  describe('USE_5050', () => {
    it('disables exactly 2 wrong options on the current question', () => {
      const playing = startTestGame()
      const q = playing.activeQuestions[0]
      const correctIndex = q.options.findIndex(o => o.correct)
      const incorrectIndices = q.options.map((_, i) => i).filter(i => i !== correctIndex)
      const keep = incorrectIndices.slice(0, 1)
      const state = gameReducer(playing, { type: 'USE_5050', keepIndices: [correctIndex, ...keep] })
      const updatedQ = state.activeQuestions[0]
      const disabledCount = updatedQ.options.filter(o => o.disabled).length
      expect(disabledCount).toBe(2)
      expect(updatedQ.options[correctIndex].disabled).toBe(false)
    })
  })

  describe('USE_5050 then RESTART (bugfix regression)', () => {
    it('resets active questions so 50/50 does not persist', () => {
      const playing = startTestGame()
      const q = playing.activeQuestions[0]
      const correctIndex = q.options.findIndex(o => o.correct)
      const incorrectIndices = q.options.map((_, i) => i).filter(i => i !== correctIndex).slice(0, 1)
      const after5050 = gameReducer(playing, { type: 'USE_5050', keepIndices: [correctIndex, ...incorrectIndices] })
      const restarted = gameReducer(after5050, { type: 'RESTART' })
      expect(restarted.phase).toBe('idle')
      expect(restarted.activeQuestions).toEqual([])
    })
  })

  it('RESTART returns to the initial state', () => {
    const playing = startTestGame()
    const dead = gameReducer(playing, { type: 'TIMEOUT' })
    const state = gameReducer(dead, { type: 'RESTART' })
    expect(state).toEqual(createInitialState())
  })

  it('returns state unchanged for unknown action', () => {
    const state = createInitialState()
    const result = gameReducer(state, { type: 'UNKNOWN_ACTION' as never })
    expect(result).toBe(state)
  })
})

describe('generateAudiencePoll', () => {
  it('returns an array with the same length as the question options', () => {
    for (let i = 0; i < testQuestions.length; i++) {
      const poll = generateAudiencePoll(testQuestions, i)
      expect(poll).toHaveLength(testQuestions[i].options.length)
    }
  })

  it('returns percentages that sum to 100', () => {
    for (let i = 0; i < testQuestions.length; i++) {
      const poll = generateAudiencePoll(testQuestions, i)
      const sum = poll.reduce((a, b) => a + b, 0)
      expect(sum).toBe(100)
    }
  })

  it('gives the correct answer the highest percentage', () => {
    for (let i = 0; i < testQuestions.length; i++) {
      const poll = generateAudiencePoll(testQuestions, i)
      const correctIndex = testQuestions[i].options.findIndex(o => o.correct)
      const correctPercentage = poll[correctIndex]
      for (let j = 0; j < poll.length; j++) {
        if (j !== correctIndex) {
          expect(correctPercentage).toBeGreaterThanOrEqual(poll[j])
        }
      }
    }
  })

  it('all percentages are between 0 and 100', () => {
    for (let i = 0; i < testQuestions.length; i++) {
      const poll = generateAudiencePoll(testQuestions, i)
      for (const pct of poll) {
        expect(pct).toBeGreaterThanOrEqual(0)
        expect(pct).toBeLessThanOrEqual(100)
      }
    }
  })
})

describe('getQuestionsData', () => {
  it('returns Arabic content for "ar"', () => {
    const d = getQuestionsData('ar')
    expect(d.chapterList[0].title).toContain('React')
    expect(d.chapterNames[1]).toBe('الأول')
  })
  it('returns English content for "en"', () => {
    const d = getQuestionsData('en')
    expect(d.chapterList[0].title).toBe('Architecture & System Design')
    expect(d.chapterNames[1]).toBe('First')
  })
})
