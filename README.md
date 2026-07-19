# من سيربح المليون

> Arabic "Who Wants to Be a Millionaire?" technical interview game — 5 chapters, 105 React/TypeScript/Vite questions total, built with React 19 + TypeScript 6 + Vite 8 + PWA.

**لعبة مقابلة فنية تفاعلية من 5 فصول و105 أسئلة عن React و TypeScript و Vite. المحتوى مستوحى من مقابلة فنية لمشروع تفسير النابلسي (tafsir-nabulsi).**

[![Stack](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)](https://vite.dev)
[![License](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)
[![PWA](https://img.shields.io/badge/PWA-ready-5A0FC8)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)

---

## Features

- **5 chapters** — React/TypeScript technical interview: architecture, React & SPA, JavaScript & data, problem-solving, bonus
- **105 questions total** — classic Millionaire format (4 options, 1 correct)
- **Bilingual (Arabic / English)** — runtime language toggle (auto-detect from browser, persisted in localStorage); layout flips to LTR in English
- **Prize ladder** — dynamic money levels (25 tiers for main chapters, 5 for bonus); max 10,000,000 SAR with safe havens
- **Lifelines** — 50:50 (eliminate 2 wrong answers), audience poll, walk away
- **30-second timer** — countdown with audio tick at 5 seconds
- **Sound synthesis** — Tone.js generates all audio (no sample files)
- **PWA** — installable, works offline, auto-updating service worker
- **RTL** — full Arabic right-to-left layout (auto-flips with locale)

## Getting Started

```bash
pnpm install
pnpm dev        # http://localhost:5173
pnpm build      # tsc -b && vite build (typecheck + production bundle)
pnpm preview    # serve production build locally
pnpm test       # run Vitest suite
```

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 19 with hooks (`useReducer`, `useCallback`, `useEffect`, `useRef`) |
| Language | TypeScript 6 (strict, bundler module resolution) |
| Bundler | Vite 8 (Rolldown) |
| Styling | Tailwind CSS 4 |
| Audio | Tone.js 14 (synths, no sample files) |
| Icons | lucide-react |
| PWA | vite-plugin-pwa 1.3 (Workbox, auto-update) |
| Test | Vitest 4 |
| i18n | Custom lightweight locale context (no library) |
| Package manager | pnpm |

## Architecture

- **No router** — single page, `GamePhase` enum (`idle` → `playing` → `gameover`) drives rendering
- **State** — `useReducer` in `src/hooks/useGame.ts` with a single `GameState` object and discriminated `GameAction` union
- **Audio** — `src/hooks/useSound.ts`; Tone.js synths initialized lazily on first user interaction (browser policy)
- **i18n** — `src/i18n/LocaleContext.tsx` provides `useLocale()` and `useI18n()`. Per-locale data files (`data/questions.ar.ts` / `data/questions.en.ts`) hold chapter questions and chapter list (money levels are generated dynamically). The reducer is locale-agnostic: `GameMessage` carries a `key` and indices (`prizeIndex`/`correctIndex`); `GameState.scoreIndex` replaces the old `score: string`. Localization happens at the render boundary via `formatMessage()` and the `ui` dictionary.
- **Questions** — hardcoded in `src/data/questions.ts` (selector); 5 chapters (105 total)
- **Chapters** — user picks a round on `StartScreen` → game loads that round's questions
- **50/50** — mutates the active questions array in-place (safe because questions are cloned per game)

### Data Flow

```
useGame() hook (single source of truth)
    │
    ▼
App.tsx — distributes state as props
    │
    ├──► StartScreen  (when phase === 'idle')
    ├──► GameBoard     (when phase === 'playing')
    │       ├── QuestionCard → OptionButton
    │       ├── Timer
    │       ├── Lifelines → AudiencePoll
    │       └── MoneyTree (persistent sidebar)
    └──► GameOver      (when phase === 'gameover')
```

## Key Files

| File | Purpose |
|---|---|
| `src/App.tsx` | Root component, phase-based rendering, language toggle wiring |
| `src/hooks/useGame.ts` | All game logic in a reducer (locale-agnostic) |
| `src/hooks/useSound.ts` | Tone.js audio setup |
| `src/i18n/LocaleContext.tsx` | `LocaleProvider`, `useLocale()`, `useI18n()`, detection + persistence |
| `src/i18n/ui.ts` | UI string dictionary (~22 static + 4 interpolated) |
| `src/i18n/messages.ts` | `formatMessage()` for the 5 game messages |
| `src/data/questions.ts` | `getQuestionsData(locale)` selector + `getSafeHavenIndex` |
| `src/data/questions.ar.ts` | Arabic content (105 Qs, 5 chapters) |
| `src/data/questions.en.ts` | English content (105 Qs translated, SAR) |
| `src/types/game.ts` | TypeScript types (GameState, GameAction, etc.) |
| `src/components/LanguageToggle.tsx` | Fixed-corner language switch (disabled mid-game) |
| `src/components/StartScreen.tsx` | Round selection grid |
| `src/components/GameBoard.tsx` | Main game loop (timer, confirm, lifelines, Next button) |
| `vite.config.ts` | Vite + PWA plugin configuration |

## Project Structure

```
src/
├── main.tsx                 # Bootstrap (wraps <App> in <LocaleProvider>)
├── App.tsx                  # Root component
├── App.css                  # Tailwind + custom animations
├── types/game.ts            # All TypeScript types (locale-agnostic)
├── data/
│   ├── questions.ts         # getQuestionsData(locale) selector + getSafeHavenIndex
│   ├── questions.ar.ts      # Arabic content (105 Qs, 5 chapters)
│   └── questions.en.ts      # English content (105 Qs translated, SAR)
├── i18n/
│   ├── LocaleContext.tsx    # Provider, useLocale(), useI18n()
│   ├── ui.ts                # UI string dictionary
│   └── messages.ts          # formatMessage() for game messages
├── utils/helpers.ts         # shuffleArray, optionLabel
├── hooks/
│   ├── useGame.ts           # Game reducer + actions (locale-agnostic; takes questionsForChapter)
│   └── useSound.ts          # Tone.js audio
└── components/
    ├── StartScreen.tsx      # Round selector
    ├── GameBoard.tsx        # Main game loop
    ├── QuestionCard.tsx     # Question + options
    ├── OptionButton.tsx     # Single answer button
    ├── Timer.tsx            # SVG countdown
    ├── Lifelines.tsx        # 50:50, audience, walk away
    ├── AudiencePoll.tsx     # Bar chart poll
    ├── MoneyTree.tsx        # Prize ladder (receives moneyLevels as prop)
    ├── GameOver.tsx         # Result screen (receives pre-formatted strings)
    ├── LanguageToggle.tsx   # Fixed-corner language switch (disabled mid-game)
    └── ErrorBoundary.tsx    # Error fallback
```

## PWA

- Installable on mobile/desktop home screen
- Full offline play (all assets pre-cached via Workbox)
- Auto-updating service worker (`registerType: 'autoUpdate'`)
- Manifest: Arabic name, RTL, gold theme, standalone display

## License

Copyright © 2026 Islamux

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
