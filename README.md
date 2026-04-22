# Math Tutor (Math-TutorK)

Interactive math lessons for elementary learners, built with **React**, **TypeScript**, and **Vite**. The app includes **40 routed lessons** across nine categories, voice guidance via **Pocket TTS**, and an optional **adaptive agent** (Python) that reacts to telemetry and can drive overlays, view swaps, and spoken tutor chat.

## Documentation

| Doc | Purpose |
|-----|---------|
| [docs/architecture.md](docs/architecture.md) | System diagram, WebSocket protocol, data flow |
| [docs/prd.md](docs/prd.md) | Product goals, user stories, requirements |
| [docs/design_guidelines.md](docs/design_guidelines.md) | Visual style, motion, UI tokens |
| [docs/dev_rules.md](docs/dev_rules.md) | Conventions for components and lessons |
| [docs/roadmap.md](docs/roadmap.md) | Planned improvements |
| [docs/report.md](docs/report.md) | High-level project analysis (periodically refreshed) |

## Features

- **40 lessons** — counting, place value, addition, subtraction, multiplication, division, fractions, algebraic thinking, number sense (see `src/App.tsx` for routes).
- **Voice guidance** — Pocket TTS (“azelma” voice) via the dev proxy path `/pocket-tts` → `http://localhost:8000`. Falls back to **text-only** if TTS is offline.
- **Tutor panel** — typewriter-style captions, optional **text chat** with the agent, **mic/STT mute** (server ignores microphone phrases), and **speaker mute** (TTS audio off, captions still run).
- **Progress** — stars, session points, streaks, persisted child profile (Zustand + `localStorage` where configured).
- **Adaptive agent** (optional) — browser **telemetry** every 3s, rule-based **visual commands** (`annotate` / `swap` / `teach`), **LLM** replies for chat and speech-driven input when the agent stack is running.

## Tech stack

- React 18, TypeScript, Vite 5, Tailwind CSS 3  
- Framer Motion, Zustand, @dnd-kit, Howler (SFX)  
- **Frontend TTS** — HTTP to Pocket TTS (see `src/utils/ttsClient.ts`)  
- **Agent server** — FastAPI + Uvicorn, WebSocket `ws://localhost:8001/ws/agent`, Moonshine STT on the **machine running the server** (see `server/main.py`)

## Prerequisites

- **Node.js 18+**
- **Pocket TTS** (or compatible serve API on port **8000**) if you want voice audio  
- **Python 3.10+** and **pip** if you want the adaptive agent / chat / server STT  
- **Ollama** (local) if you want **LLM**-generated tutor replies — the agent defaults to a configured model (see `server/main.py`)

## Install

```bash
npm install
```

## Running locally

### 1. Frontend (required)

```bash
npm run dev
```

Open **http://localhost:5173** (Vite default).

### 2. Pocket TTS (optional — for voice audio)

**Linux / macOS**

```bash
./start-tts.sh
```

**Windows (PowerShell)**

```powershell
.\start-tts.ps1
```

### 3. Adaptive agent (optional — telemetry, annotations, chat, server STT)

**Linux / macOS**

```bash
./start-agent.sh
```

**Windows (PowerShell)**

```powershell
.\start-agent.ps1
```

This creates `server/.agent-venv`, installs `server/requirements.txt`, and starts Uvicorn on **port 8001**. The virtualenv is **gitignored** — do not commit it.

The React app expects the agent at **`ws://localhost:8001/ws/agent`** (see `src/hooks/useAgentSocket.ts`).

## Build

```bash
npm run build
```

Output in `dist/`. Run `npm run preview` to smoke-test the production bundle.

## Project layout (abbreviated)

```
src/
  App.tsx                 # Router — 40 lesson routes + home
  screens/                # Home hub
  categories/             # One folder per curriculum strand (lesson components)
  components/
    layout/               # LessonShell, LessonCanvas, TutorPanel, overlays
    shared/               # Numpad, confetti, tutor voice UI, etc.
  hooks/                  # useTutorVoice, useTelemetry, useAgentSocket, …
  store/                  # Zustand stores (progress, difficulty, child, score)
  types/visualCommand.ts  # Agent ↔ client types (commands, telemetry, chat)
  utils/                  # ttsClient, math helpers, voice configs, …
server/
  main.py                 # FastAPI app: WebSocket agent, STT loop, Ollama
  requirements.txt
public/
  dashboard.html          # Optional standalone dashboard (separate from Vite app)
```

## License

MIT
