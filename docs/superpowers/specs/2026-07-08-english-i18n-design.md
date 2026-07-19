# English language support — design spec

## Goal

Add full English-language support to the Arabic "Who Wants to Be a Millionaire?" Kotlin/Android technical interview game, using a **locale-agnostic reducer** (Approach 1) so the game logic stays pure, testable, and decoupled from presentation. The English experience is a fully playable, first-class mode — all 25 questions + 100 options + UI strings + chapters + money amounts translated, with the layout flipping to LTR.

## Confirmed scope (from brainstorming)

1. **Full translation:** build i18n infra **and** translate all 25 questions + 100 options to English.
2. **Default + detection:** auto-detect from `navigator.language` on first visit (Arabic if starts with `ar`, else English); persist manual choice in `localStorage` across sessions.
3. **Currency in English:** `SAR` (e.g. `1,000 SAR`).
4. **Layout:** flip to LTR for English (`<html dir="ltr" lang="en">`); keep RTL for Arabic.
5. **Architecture:** Approach 1 — locale-agnostic reducer (message keys + indices).
6. **Mid-game toggle:** disabled during `phase === 'playing'`; works on `idle` and `gameover` (gameover re-localizes instantly via indices).

## i18n surface (from exploration)

- ~22 static UI strings across 8 components (StartScreen, GameBoard, Timer, Lifelines, AudiencePoll, MoneyTree, GameOver, ErrorBoundary).
- 6 dynamic game messages built in the reducer (`correct`/`wrong`/`timeout`/`walkAway`/`audience`) + 3 winnings templates in App.tsx.
- 6 money amounts with `ريال` suffix in `moneyLevels`.
- 5 chapter titles + 5 ordinal names.
- 25 questions × (1 text + 4 options) = **125 content strings** (the bulk).
- `index.html` (`lang="ar" dir="rtl"`, Arabic `<title>`); PWA manifest in `vite.config.ts` (Arabic name/lang/dir); Cairo font.
- 2 test assertions in `useGame.test.ts` reference Arabic strings.

## Design

### 1. Locale system — `src/i18n/LocaleContext.tsx`

- **`LocaleProvider`** wraps `<App>` in `src/main.tsx`.
- State: `locale: 'ar' | 'en'`.
- **Initial detection** (on mount, before first render of children via `useState` initializer):
  1. Read `localStorage.getItem('lang')` → if `'ar'|'en'`, use it.
  2. Else read `navigator.language` (or first of `navigator.languages`); if it starts with `ar` → `'ar'`, else `'en'`.
  3. Fallback: `'ar'`.
- **Side effect on mount and on every locale change** (a single `useEffect`):
  - `document.documentElement.lang = locale === 'ar' ? 'ar' : 'en'`
  - `document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr'`
  - `document.title = ui[locale].pageTitle`
  - `localStorage.setItem('lang', locale)`
- Exposed via `useI18n()` hook returning:
  ```ts
  {
    locale: 'ar' | 'en'
    dir: 'rtl' | 'ltr'
    t: (key: UiKey) => string
    tf: <K extends InterpolatedKey>(key: K, ...args: UiStrings[K] extends (...a: infer A) => string ? A : never) => string
    formatMessage: (msg: GameMessage, ctx: { chapterId: number; currentQuestionIndex: number }) => string
    questionsData: { chapterQuestions, moneyLevels, chapterList, chapterNames }
    setLocale: (l: 'ar' | 'en') => void
    toggleLocale: () => void
  }
  ```
- A thin `useLocale()` alias returning just `{ locale, dir, setLocale, toggleLocale }` is exported for components that don't need the full i18n API (e.g. LanguageToggle).

### 2. Data layer — per-locale files

```
src/data/
  questions.ar.ts   — chapterQuestionsAr, moneyLevelsAr, chapterListAr, chapterNamesAr
  questions.en.ts   — chapterQuestionsEn, moneyLevelsEn, chapterListEn, chapterNamesEn
  questions.ts      — re-exports getQuestionsData(locale) selector
```

- **Each per-locale file** exports 4 constants with the same shapes as today's `chapterQuestions` / `moneyLevels` / `chapterList` (plus `chapterNames`, currently module-local in StartScreen).
- **`questions.ts`** becomes a thin selector:
  ```ts
  import { chapterQuestionsAr, moneyLevelsAr, chapterListAr, chapterNamesAr } from './questions.ar'
  import { chapterQuestionsEn, moneyLevelsEn, chapterListEn, chapterNamesEn } from './questions.en'
  import type { Locale } from '../i18n/LocaleContext'
  export function getQuestionsData(locale: Locale) {
    return locale === 'ar'
      ? { chapterQuestions: chapterQuestionsAr, moneyLevels: moneyLevelsAr, chapterList: chapterListAr, chapterNames: chapterNamesAr }
      : { chapterQuestions: chapterQuestionsEn, moneyLevels: moneyLevelsEn, chapterList: chapterListEn, chapterNames: chapterNamesEn }
  }
  ```

**Translation content** (en):

| | ar | en |
|---|---|---|
| Chapter titles | أساسيات Kotlin & Android / قرارات معمارية / تتبع التدفق / اكتشف المشاكل / نظرية عامة | Kotlin & Android Basics / Architecture Decisions / Flow Tracing / Spot the Bugs / General Theory |
| Ordinals | الأول…الخامس | First…Fifth |
| Money | `1,000 ريال` … `1,000,000 ريال` | `1,000 SAR` … `1,000,000 SAR` |
| Questions (25) + options (100) | Current Arabic | Full English translation preserving correct option and distractor semantics |

**Safe haven pattern preserved:** `[false, false, true, false, true, false]` for both locales (levels 3 and 5).

### 3. UI strings — `src/i18n/ui.ts`

```ts
import type { Locale } from './LocaleContext'

export type InterpolatedKey = 'youWonAmount' | 'wentHomeWithAmount' | 'roundLabel' | 'progressLabel'

export interface UiStrings {
  // static
  pageTitle: string
  logoAlt: string
  readyPrompt: string
  interviewTitle: string
  interviewDesc: string
  confirmAnswer: string
  nextQuestion: string
  seconds: string
  audiencePoll: string       // lifeline button
  walkAway: string
  audienceResultsHeading: string
  moneyTreeTitle: string
  moneyTreeOpenAria: string
  moneyTreeCloseAria: string
  complete: string           // for "{pct}% {complete}"
  playAgain: string
  errorOccurred: string
  reload: string
  youAreAMillionaire: string
  langToggleAria: string
  // interpolated
  youWonAmount: (amount: string) => string
  wentHomeWithAmount: (amount: string) => string
  roundLabel: (ordinal: string) => string  // "Round {ordinal}"
  progressLabel: (pct: number) => string     // "{pct}% {complete}"
}

export const ui: Record<Locale, UiStrings> = { ar: { ... }, en: { ... } }

export type UiKey = keyof Omit<UiStrings, InterpolatedKey[number]>
```

Static strings are accessed via `t(key)`. Interpolated ones via `tf(key, ...args)`. The full key list is the single source of truth (both `t`/`tf` and the language-toggle label read from it).

### 4. Game message formatter — `src/i18n/messages.ts`

```ts
import { ui } from './ui'
import type { GameMessage } from '../types/game'
import type { Locale } from './LocaleContext'
import { getQuestionsData } from '../data/questions'

export function formatMessage(
  msg: GameMessage,
  locale: Locale,
  ctx: { chapterId: number; currentQuestionIndex: number }
): string {
  const strings = ui[locale]
  const { chapterQuestions, moneyLevels } = getQuestionsData(locale)
  switch (msg.key) {
    case 'correct': {
      const prize = moneyLevels[msg.prizeIndex!].amount
      return locale === 'ar'
        ? `إجابة صحيحة! الجائزة الحالية: ${prize}`
        : `Correct! Current prize: ${prize}`
    }
    case 'wrong': {
      const correctText = chapterQuestions[ctx.chapterId][ctx.currentQuestionIndex].options[msg.correctIndex!].text
      return locale === 'ar'
        ? `إجابة خاطئة! الإجابة الصحيحة كانت: ${correctText}`
        : `Wrong! The correct answer was: ${correctText}`
    }
    case 'timeout': {
      const correctText = chapterQuestions[ctx.chapterId][ctx.currentQuestionIndex].options[msg.correctIndex!].text
      return locale === 'ar'
        ? `انتهى الوقت! الإجابة الصحيحة كانت: ${correctText}`
        : `Time's up! The correct answer was: ${correctText}`
    }
    case 'walkAway': {
      const prize = moneyLevels[msg.prizeIndex!].amount
      return locale === 'ar'
        ? `لقد اخترت الانسحاب بالجائزة الحالية: ${prize}`
        : `You chose to walk away with: ${prize}`
    }
    case 'audience':
      return locale === 'ar'
        ? 'تم استطلاع رأي الجمهور. انظر النتائج أدناه.'
        : 'Audience poll complete. See results below.'
  }
}
```

**Why the `if/else` (not `ui[locale].correct(...)`):** the message body mixes a fixed prefix with the interpolated `prize`/`correctText`. Keeping templates next to the formatter avoids exploding the `UiStrings` type. The 3-4 fixed parts (`correct`/`wrong`/`timeout` prefix word) can alternatively move into `ui` as a `'correctPrefix'`/etc. — implementation choice during writing-plans; the spec fixes the *behavior*, not the exact string function split. Final split: keep `formatMessage` self-contained; add only the 4 interpolated UI strings to `ui` (used in App/StartScreen/MoneyTree).

The correct-answer text is read from the **active locale's** `chapterQuestions` (not from the cloned `activeQuestions` in state) — fully decoupled from the in-play clone.

### 5. Type & state refactor — `src/types/game.ts`, `src/hooks/useGame.ts`

```ts
// game.ts
export type GameMessageKey = 'correct' | 'wrong' | 'timeout' | 'walkAway' | 'audience'

export interface GameMessage {
  key: GameMessageKey
  type: 'success' | 'error' | 'info'
  prizeIndex?: number     // correct, walkAway
  correctIndex?: number   // wrong, timeout
}

export interface GameState {
  phase: GamePhase
  activeQuestions: Question[]
  chapterId: number | null
  gameWon: boolean
  walkedAway: boolean
  currentQuestionIndex: number
  scoreIndex: number               // was: score: string  → -1 initial; 0..5 on win
  answerSelected: number | null
  revealAnswers: boolean
  gameMessage: GameMessage | null
  lifelines: Lifelines
  audiencePoll: number[] | null
  timerValue: number
}

export type GameAction =
  | { type: 'START_GAME'; chapterId: number; questions: Question[] }  // was: chapterId only
  | { type: 'SELECT_ANSWER'; index: number }
  | { type: 'CONFIRM_ANSWER' }
  | { type: 'NEXT_QUESTION' }
  | { type: 'USE_5050'; keepIndices: number[] }
  | { type: 'USE_AUDIENCE'; poll: number[] }
  | { type: 'WALK_AWAY' }                          // was: { prize: string }
  | { type: 'TIMEOUT' }                            // was: { correctAnswer: string }
  | { type: 'TICK' }
  | { type: 'RESTART' }
```

**Reducer changes (locale-agnostic, pure):**
- `createInitialState()`: `scoreIndex: -1`. `currentQuestionIndex` remains `-1` on idle.
- `START_GAME`: stores `action.questions` directly (no longer clones — cloning now happens in the `useGame` hook from the active locale's `chapterQuestions`). `scoreIndex: 0` is wrong; reset to `-1`; currentQuestionIndex: 0.
- `CONFIRM_ANSWER` (correct):
  - if `state.currentQuestionIndex === state.activeQuestions.length - 1` → `gameover`, `gameWon`, `scoreIndex = currentQuestionIndex`, `gameMessage = { key: 'correct', type: 'success', prizeIndex: scoreIndex }`.
  - else → `revealAnswers: true`, `scoreIndex = currentQuestionIndex`, `gameMessage = { key: 'correct', type: 'success', prizeIndex: scoreIndex }`. (Same semantics as today: the success message reports the prize for the just-answered question.)
- `CONFIRM_ANSWER` (wrong): `correctIndex = state.activeQuestions[state.currentQuestionIndex].options.findIndex(o => o.correct)`. `phase: 'gameover'`, `gameMessage: { key: 'wrong', type: 'error', correctIndex }`.
- `WALK_AWAY`: `scoreIndex = state.currentQuestionIndex` (preserves today's "walk-away = current level's prize" semantics; if this is a quirk we want changed it's out of scope for i18n and noted in a code comment). `gameMessage: { key: 'walkAway', type: 'info', prizeIndex: scoreIndex }`. `phase: 'gameover'`, `walkedAway: true`.
- `TIMEOUT`: computes `correctIndex` from `activeQuestions`. `gameMessage: { key: 'timeout', type: 'error', correctIndex }`. `phase: 'gameover'`.
- `USE_AUDIENCE`: `gameMessage: { key: 'audience', type: 'info' }`.
- `NEXT_QUESTION` / `USE_5050` / `TICK` / `RESTART`: unchanged structure (RESTART returns `createInitialState()` with `scoreIndex: -1`).
- `getSafeHavenIndex(index)`: pure — scans `moneyLevels` for safe havens. **But** `moneyLevels` is locale-specific, so this function moves out of the reducer and into a selector. The reducer does not call it; the gameover winnings computation in `App.tsx` calls a `getSafeHavenIndex(currentQuestionIndex, moneyLevels)` helper from the locale data. This keeps the reducer 100% pure & locale-agnostic.

**`useGame` hook changes:**
- Imports `useI18n()` to get `questionsData`.
- `startGame(chapterId)`: clones `questionsData.chapterQuestions[chapterId]` and dispatches `START_GAME { chapterId, questions }`. The `cloneQuestions` helper moves from the reducer file to the hook (or to `data/questions.ts`).
- `walkAway()`: dispatches `{ type: 'WALK_AWAY' }` (no payload).
- `handleTimeout()`: dispatches `{ type: 'TIMEOUT' }` (no payload; reducer computes `correctIndex`).
- `safeHavenPrize` (string) → `safeHavenIndex` (number): `getSafeHavenIndex(state.currentQuestionIndex, moneyLevels)` — returns a money-level index or `-1`.
- `currentQuestion` derivation unchanged.
- All `useCallback` deps unchanged (no new dependencies on locale for the dispatch wrappers; locale is read at the moment of action construction).

### 6. Component updates (consume `useI18n`)

Each component switches from hardcoded Arabic/literal `moneyLevels` import to `useI18n()`:

- **StartScreen.tsx** — uses `t` for ready/interview heading/desc; `tf('roundLabel', questionsData.chapterNames[id])` for button label; `t('logoAlt')` for `alt`; logo image path unchanged.
- **Timer.tsx** — `t('seconds')` for unit.
- **Lifelines.tsx** — `t('audiencePoll')`, `t('walkAway')`. The `50:50` text is locale-neutral (kept as-is).
- **AudiencePoll.tsx** — `t('audienceResultsHeading')`; A/B/C/D `labels` array stays Latin.
- **MoneyTree.tsx** — `t('moneyTreeTitle')`; `t('moneyTreeOpenAria' | 'moneyTreeCloseAria')`; `tf('progressLabel', progress)`; renders `questionsData.moneyLevels` instead of importing the static array.
- **GameBoard.tsx** — `t('confirmAnswer')`, `t('nextQuestion')`. Message rendering: `formatMessage(state.gameMessage, locale, { chapterId: state.chapterId!, currentQuestionIndex: state.currentQuestionIndex })` via `useI18n()`. (GameBoard only formats during 'playing' — the 3 'correct'/'audience' keys are sufficient for that phase; the function still handles all 5 keys safely for the type.)
- **GameOver.tsx** — receives pre-formatted `message` and `winnings` strings from App.tsx (App formats them). `t('playAgain')`.
- **ErrorBoundary.tsx** — `t('errorOccurred')`, `t('reload')`.
- **QuestionCard.tsx / OptionButton.tsx** — unchanged (render `question.text` / `option.text` from the locale-specific cloned `activeQuestions`).

### 7. App.tsx — locale + toggle + gameover formatting

```tsx
const { locale, t, tf, formatMessage, questionsData, ... } = useI18n()
const { state, currentQuestion, safeHavenIndex, ...actions } = useGame()
const { phase, scoreIndex } = state

// Format for GameOver (only on gameover):
const formattedMessage = state.gameMessage
  ? formatMessage(state.gameMessage, locale, { chapterId: state.chapterId!, currentQuestionIndex: state.currentQuestionIndex })
  : ''
const winnings = state.gameWon
  ? t('youAreAMillionaire')
  : state.walkedAway
    ? tf('youWonAmount', questionsData.moneyLevels[scoreIndex]?.amount ?? '0 SAR')
    : tf('wentHomeWithAmount', questionsData.moneyLevels[safeHavenIndex]?.amount ?? t('zeroPrize') /* new key */)

return (
  <div>
    <LanguageToggle disabled={phase === 'playing'} />
    {phase === 'idle' && <StartScreen onStart={startGame} />}
    {phase === 'playing' && <GameBoard ... />}
    {phase === 'gameover' && <GameOver message={formattedMessage} winnings={winnings} ... />}
    <MoneyTree ... moneyLevels={questionsData.moneyLevels} ... />
  </div>
)
```

### 8. LanguageToggle — `src/components/LanguageToggle.tsx`

- Small fixed-position button: `fixed top-4 start-4 z-50` (logical `start` flips with `dir`).
- Renders `Languages` icon + the **opposite** locale's name (so clicking switches to it): `locale === 'ar' ? 'EN' : 'ع'`.
- `aria-label` from `t('langToggleAria')` ("Switch language" / "تغيير اللغة").
- `disabled` prop passed from App (`phase === 'playing'`): greyed out + `aria-disabled` + `title` tooltip "Finish the round to change language" / "أكمل الجولة لتغيير اللغة" (a new `UiStrings` key `toggleDisabledHint`).
- Click → `toggleLocale()`.

### 9. index.html / vite.config.ts / font

- `index.html`: keep `<html lang="ar" dir="rtl">` and Arabic `<title>` for first paint / PWA / SEO. Runtime side effect in `LocaleProvider` overrides both.
- `vite.config.ts` PWA manifest: **accepted limitation** — stays Arabic (build-time). Documented in README + AGENTS.md.
- Font: Cairo (has Latin coverage). **Accepted limitation** — same font for both locales. No font file changes.

### 10. Tests — `src/hooks/useGame.test.ts`

Updated assertions:
- `state.score` → `state.scoreIndex` (initially `-1`; after correct `CONFIRM_ANSWER` on Q1: `0`; on last question correct: `length - 1`).
- `WALK_AWAY` action: `{ type: 'WALK_AWAY' }` (no `prize`). The test for "walkedAway set" (L140-146) drops the `prize: '100 ريال'` payload.
- `TIMEOUT` action: `{ type: 'TIMEOUT' }` (no `correctAnswer`).
- `gameMessage.text` assertions (L136 `toContain('test answer')`) → assert `gameMessage.key === 'timeout'` and `gameMessage.correctIndex` equals the correct option's index. (The reducer computes `correctIndex` itself, so dispatching bare `TIMEOUT` exercises the new logic.)
- Test data source: `import { chapterQuestionsAr } from '../data/questions.ar'` for `TEST_CHAPTER = 5`. (Tests the locale-agnostic mechanics; `generateAudiencePoll` is locale-agnostic.)
- Add: a new test asserting that `CONFIRM_ANSWER` (correct, not-last) sets `gameMessage = { key: 'correct', type: 'success', prizeIndex: <current> }`.
- Add: a new test asserting that `CONFIRM_ANSWER` (wrong) sets `gameMessage = { key: 'wrong', type: 'error', correctIndex: <correct option index> }`.
- `helpers.test.ts`: no change.

### 11. Docs

- **README.md** — features: add "Bilingual (Arabic / English) with runtime toggle"; tech stack: add "i18n — custom lightweight locale context (no library)"; architecture: add i18n section; key files: add `i18n/LocaleContext`, `i18n/ui`, `i18n/messages`, `data/questions.ar|en`, `LanguageToggle`.
- **AGENTS.md** — add i18n architecture section, per-locale data files, accepted limitations (manifest stays Arabic, toggle disabled mid-game, Cairo for both).
- **FOR_JUNIORS.md** — add an "Internationalization" section explaining the locale context, `useI18n`, per-locale data files, `t`/`tf`/`formatMessage`, and the locale-agnostic reducer pattern (with an updated "Game Flow Walkthrough" referencing `scoreIndex` and message keys).

### 12. Accepted limitations (explicit)

1. **PWA manifest stays Arabic** — it's build-time/static; switching it at runtime client-side is out of scope.
2. **Language toggle disabled mid-game** — avoids `activeQuestions` re-localization. Gameover re-localizes instantly via indices; idle re-localizes the start screen.
3. **Cairo font for both** — no dedicated Latin face; Cairo has Latin coverage. Out of scope to add another font file.
4. **Only 2 locales** — `ar` + `en`. Adding a third would require generalizing the `Record<Locale, X>` to `Record<string, X>` and a locale registry. Out of scope; easy follow-up.

### 13. New + changed files (summary)

```
NEW   src/i18n/LocaleContext.tsx
NEW   src/i18n/ui.ts
NEW   src/i18n/messages.ts
NEW   src/data/questions.ar.ts
NEW   src/data/questions.en.ts            (25 Qs + 100 options translated)
NEW   src/components/LanguageToggle.tsx
EDIT  src/data/questions.ts                (selector aggregator)
EDIT  src/types/game.ts                    (GameMessage/scoreIndex/actions)
EDIT  src/hooks/useGame.ts                 (locale-agnostic reducer; data injected in hook)
EDIT  src/main.tsx                         (wrap LocaleProvider)
EDIT  src/App.tsx                          (useI18n, LanguageToggle, format gameover)
EDIT  src/components/StartScreen.tsx
EDIT  src/components/GameBoard.tsx
EDIT  src/components/Timer.tsx
EDIT  src/components/Lifelines.tsx
EDIT  src/components/AudiencePoll.tsx
EDIT  src/components/MoneyTree.tsx
EDIT  src/components/GameOver.tsx
EDIT  src/components/ErrorBoundary.tsx
EDIT  src/hooks/useGame.test.ts            (scoreIndex, gameMessage.key, payload changes)
EDIT  index.html                           (title — runtime-adjusted by LocaleProvider)
EDIT  README.md, AGENTS.md, docs/FOR_JUNIORS.md
```

### 14. Implementation order (for writing-plans)

1. Locale infra (`LocaleContext`, detection, persistence, side effects, `useI18n`/`useLocale`).
2. Split data files + write `questions.en.ts` translations.
3. `ui` dictionary + `formatMessage`.
4. Type refactor (`game.ts`).
5. Reducer + `useGame` refactor (with `cloneQuestions` moved).
6. Component updates + `App.tsx` + `LanguageToggle`.
7. Tests update + new tests.
8. Docs.
9. Verify: `pnpm test` + `pnpm build`.

## Self-review (post-write)

- **Placeholders:** none — all 14 sections concrete.
- **Internal consistency:** types in §5 match the reducer changes in §5 and the component consumption in §6–§7. `scoreIndex` semantics preserved in CONFIRM_ANSWER and WALK_AWAY. `cloneQuestions` moved (not duplicated). `getSafeHavenIndex` moved out of reducer (§5 last bullet) — noted.
- **Scope check:** single coherent i18n feature; one implementation plan covers it. No decomposition needed.
- **Ambiguity check:**
  - "walk-away = current level's prize" — explicitly preserved (§5) with a code-comment note.
  - `formatMessage` template split (keep in `formatMessage` vs split into `ui`) — §4 flags the choice; writing-plans picks it (keep `formatMessage` self-contained, only 4 interpolated strings in `ui`).
  - "Currency fallback `0 SAR`" vs `0 ريال` — §7 uses `'0 SAR'` literal in the winnings fallback; could be made locale-aware but it's an edge case (no questions answered, walk-away with no questions played). Literal `'0 SAR'` is acceptable; full locale-aware fallback deferred (noted in writing-plans if needed, else accepted as a literal).
  - `safeHavenIndex: -1` fallback when no safe haven found — App.tsx reads `moneyLevels[safeHavenIndex]?.amount ?? '0 SAR'` (optional chaining). Documented in §7.
