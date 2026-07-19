# AGENTS.md — من سيربح المليون

## Project Overview

Arabic "Who Wants to Be a Millionaire?" technical interview game with 5 chapters (105 questions total) covering React, TypeScript, and Vite. Content is derived from a technical interview for the Tafsir Nabulsi React/TypeScript project. Bilingual (Arabic / English) — runtime language toggle with auto-detect and localStorage persistence; English flips the layout to LTR. Converted from Vue 2 CDN to React + TypeScript + Vite + PWA.

## Tech Stack

- **React 19** — hooks (useReducer for game state, useCallback, useEffect, useRef)
- **TypeScript 6** — strict mode, bundler module resolution
- **Vite 8** — Rolldown bundler, Tailwind CSS 4
- **Tone.js 14** — audio synthesis (no sample files)
- **lucide-react** — icons (tree-shakeable)
- **vite-plugin-pwa 1.3** — Workbox-based PWA
- **Vitest 4** — test runner
- **pnpm** — package manager

## Commands

| Command | Description |
|---|---|
| `pnpm dev` | Start Vite dev server |
| `pnpm build` | `tsc -b && vite build` (typecheck + bundle) |
| `pnpm preview` | Preview production build |
| `pnpm test` | Run Vitest test suite |

## Architecture

- **No router** — single page, `GamePhase` enum drives rendering: `idle` → `playing` → `gameover`
- **State**: `useReducer` in `src/hooks/useGame.ts` — single `GameState` object + discriminated `GameAction` union
- **Audio**: `src/hooks/useSound.ts` — Tone.js synths initialized lazily on first user interaction
- **Chapters**: user picks from 5 chapters on StartScreen → game loads that chapter's questions (105 total across 5 chapters)
- **Money levels**: dynamic, generated per chapter via `generateMoneyLevels()`; 25 tiers for main chapters (500→10M), 5 tiers for bonus chapter (500K→10M); safe havens at designated levels
- **50/50 lifeline**: mutates `activeQuestions` array in-place (safe — cloned per game)
- **i18n**: `LocaleProvider` + `useI18n()` from `src/i18n/LocaleContext.tsx`. Per-locale data in `src/data/questions.{ar,en}.ts`. UI strings in `src/i18n/ui.ts`; game-message formatter in `src/i18n/messages.ts`. Reducer is locale-agnostic (message keys + indices). Language toggle disabled during play; works on idle/gameover.
- **Questions**: hardcoded per-locale in `src/data/questions.ar.ts` and `src/data/questions.en.ts`; selected by `getQuestionsData(locale)` from `src/data/questions.ts`

## Key Files

| File | Role |
|---|---|
| `src/App.tsx` | Root — phase-based rendering |
| `src/hooks/useGame.ts` | Game reducer + derived state + memoized actions |
| `src/hooks/useSound.ts` | Tone.js synth setup and playback |
| `src/data/questions.ts` | `getQuestionsData(locale)` selector + `getSafeHavenIndex` |
| `src/data/questions.ar.ts` | Arabic question bank + chapter list |
| `src/data/questions.en.ts` | English question bank + chapter list |
| `src/i18n/LocaleContext.tsx` | Provider, useLocale(), useI18n(), detection + persistence |
| `src/i18n/ui.ts` | UI string dictionary |
| `src/i18n/messages.ts` | formatMessage() for the 5 game messages |
| `src/components/LanguageToggle.tsx` | Fixed-corner language switch (disabled mid-game) |
| `src/types/game.ts` | All TypeScript types |
| `src/components/StartScreen.tsx` | Chapter selection grid with logo |
| `src/components/GameBoard.tsx` | Timer, answer confirm, lifeline orchestration |
| `src/components/QuestionCard.tsx` | Question text + 2×2 option grid |
| `src/components/OptionButton.tsx` | Individual answer (A/B/C/D) with state styling |
| `src/components/Timer.tsx` | SVG circular countdown |
| `src/components/Lifelines.tsx` | 50:50, audience poll, walk away buttons |
| `src/components/AudiencePoll.tsx` | Horizontal bar chart |
| `src/components/MoneyTree.tsx` | Sidebar prize ladder (mobile bottom sheet) |
| `src/components/GameOver.tsx` | Win/lose/walk-away result screen |
| `src/utils/helpers.ts` | `shuffleArray`, `optionLabel` |
| `vite.config.ts` | Vite + PWA + Tailwind config |
| `public/million-192.png`, `public/million-512.png` | PWA icons |

## PWA Notes

- Auto-updating service worker via `vite-plugin-pwa` with Workbox
- Manifest: Arabic name, RTL, gold theme (#ffd700), standalone display
- Pre-caches all build assets for full offline play
- Icons generated via ImageMagick from original logo

## Gotchas & Patterns

- **Audio context**: Tone.js requires user interaction — `useSound.initialize()` called on chapter select click
- **50/50 mutation**: Options are disabled in-place on `activeQuestions` array; works because questions are cloned per game via `START_GAME` action
- **Timer cleanup**: `setInterval` via `useEffect` — cleanup on question change / gameover is critical; uses `timeoutHandled` ref to prevent double-fire
- **Audio errors**: silently caught (some browsers block autoplay)
- **Bundle size**: ~575 KB (Tone.js is the bulk)
- **RTL**: All Arabic text, `dir="rtl"` in manifest and HTML
- **State reset**: `RESTART` action calls `createInitialState()` and re-clones questions for fresh game
- **useCallback**: Every dispatch call in `useGame()` is wrapped in `useCallback` for stable references
- **MoneyTree persistence**: Visible on all phases (idle/playing/gameover) as sidebar with current prize highlighted
- **Chapter titles** displayed above chapter numbers on StartScreen buttons
- **Locale-agnostic reducer**: `GameMessage` is `{ key, type, prizeIndex?, correctIndex? }`; `GameState.scoreIndex: number` (was `score: string`); `WALK_AWAY` and `TIMEOUT` carry no payload (reducer computes `correctIndex` from `activeQuestions`). Localization happens at the render boundary.
- **Language toggle**: rendered as a fixed-corner button (`src/components/LanguageToggle.tsx`); disabled when `phase === 'playing'`. Gameover re-localizes instantly via indices.
- **PWA manifest stays Arabic** (build-time); index.html lang/dir/title are overridden at runtime by `LocaleProvider`.
- **Cairo font for both locales** (Latin coverage); no separate Latin face.
