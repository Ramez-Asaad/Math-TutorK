# Math-TutorK — Project analysis

> Last refreshed to match repository layout: **2026-04**

This is a concise snapshot for onboarding and planning. For protocols and wiring details, prefer **`docs/architecture.md`** and the source files it names.

## 1. Executive summary

Math-TutorK is a **React + TypeScript** educational web app with **40 routed lessons**, a shared **`LessonShell`** layout, **Pocket TTS** integration, and an optional **Python agent** (FastAPI + WebSocket) that combines **telemetry**, **rule-based visual commands**, **server-side STT**, and **Ollama**-backed chat when configured.

## 2. Tech stack

| Layer | Technology |
|-------|------------|
| UI | React 18, TypeScript, Vite 5 |
| Routing | React Router 6 |
| Styling | Tailwind CSS 3 |
| Motion | Framer Motion 11 |
| State | Zustand 5 (progress, difficulty, child profile, session score) |
| DnD | @dnd-kit |
| SFX | Howler |
| TTS | Pocket TTS HTTP API (dev proxy `/pocket-tts` → port 8000) |
| Agent | Python 3.10+, FastAPI, Uvicorn, Moonshine STT, optional Ollama (port 8001 WS) |

## 3. Repository layout (high level)

```
src/
  App.tsx                 # 40 lesson routes + home + catch-all → Home
  screens/Home.tsx        # Category / lesson hub (large file — refactor candidate)
  categories/*/           # Lesson implementations by strand
  components/layout/      # LessonShell, TutorPanel, LessonCanvas, overlays
  components/shared/      # Reusable lesson + UI pieces
  hooks/                    # useTutorVoice, useTelemetry, useAgentSocket, useSound, …
  store/                    # Four Zustand stores
  types/visualCommand.ts   # Agent + telemetry + chat types
  utils/                    # ttsClient, generators, validators, voice configs
server/
  main.py                   # WebSocket agent, audio loop, LLM integration
  requirements.txt
```

## 4. Lesson inventory (40)

Counts by folder match **`App.tsx`** routes:

| Strand | Count | Slug examples |
|--------|------:|----------------|
| Counting | 4 | dot-counter, number-line, comparison, skip-counting |
| Place value | 4 | dot-builder, expanded-form, hieroglyphs, rounding |
| Addition | 5 | combining, number-bonds, making-ten, column-addition, word-problems |
| Subtraction | 5 | takeaway, number-line, ten-frame, column-subtraction, missing-number |
| Multiplication | 6 | equal-groups, arrays, square-numbers, times-table-map, flashcards, magic-square |
| Division | 4 | dot-grouper, fair-share, repeated-subtraction, fact-family |
| Fractions | 5 | grid-painter, comparator, number-line, equivalent, mixed-numbers |
| Algebraic | 4 | patterns, balance-scale, function-machine, missing-number |
| Number sense | 3 | primes, negative-numbers, word-problems |

## 5. Strengths

- Consistent **shell + canvas** pattern keeps lesson code focused on pedagogy.
- **Typed** agent contract (`visualCommand.ts`) shared between UI and documentation.
- **Graceful TTS fallback** when Pocket TTS is unavailable.
- **Clear separation** between browser TTS and server-side STT / LLM.

## 6. Known gaps (engineering)

- **Automated tests** are still minimal or absent for critical pure logic (`mathGenerators`, validators).
- **`Home.tsx`** remains a large single file — splitting by category/section would help maintenance.
- **Progression / unlock** hooks exist in places but are not always wired into UX — verify product intent before marketing “gated” paths.
- **Operational docs** for deploying Ollama + Pocket TTS + agent together could live in README or a `docs/runbook.md` if you ship beyond local dev.

## 7. Scorecard (opinionated)

| Area | Note |
|------|------|
| Code clarity | Strong TypeScript usage and consistent layout abstractions |
| Architecture | Agent + lesson playbook model is documented and extensible |
| Testing | Main improvement opportunity |
| UX polish | Motion, dark theme, and tutor panel are cohesive |

For dated file-size tables, run tooling locally — sizes drift quickly and stale tables confuse readers.
