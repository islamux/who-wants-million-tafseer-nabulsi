export interface Option {
  text: string
  correct: boolean
  disabled?: boolean
}

export interface Question {
  text: string
  options: Option[]
}

export interface MoneyLevel {
  amount: string
  isSafeHaven: boolean
}

export interface Lifelines {
  fiftyFiftyUsed: boolean
  audienceUsed: boolean
}

export type GameMessageKey = 'correct' | 'wrong' | 'timeout' | 'walkAway' | 'audience'

export interface GameMessage {
  key: GameMessageKey
  type: 'success' | 'error' | 'info'
  prizeIndex?: number
  correctIndex?: number
}

export type GamePhase = 'idle' | 'playing' | 'gameover'

export interface GameState {
  phase: GamePhase
  activeQuestions: Question[]
  chapterId: number | null
  gameWon: boolean
  walkedAway: boolean
  currentQuestionIndex: number
  scoreIndex: number
  answerSelected: number | null
  revealAnswers: boolean
  gameMessage: GameMessage | null
  lifelines: Lifelines
  audiencePoll: number[] | null
  timerValue: number
}

export type GameAction =
  | { type: 'START_GAME'; chapterId: number; questions: Question[] }
  | { type: 'SELECT_ANSWER'; index: number }
  | { type: 'CONFIRM_ANSWER' }
  | { type: 'NEXT_QUESTION' }
  | { type: 'USE_5050'; keepIndices: number[] }
  | { type: 'USE_AUDIENCE'; poll: number[] }
  | { type: 'WALK_AWAY' }
  | { type: 'TIMEOUT' }
  | { type: 'TICK' }
  | { type: 'RESTART' }
