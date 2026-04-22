# PRD — Math-TutorK

## 1. Vision

An engaging, interactive math learning web app for **elementary students (roughly K–5)** that combines visual manipulatives, **spoken feedback**, optional **AI-driven canvas adaptations**, and light **gamification**.

## 2. Users

- **Primary**: Children about **5–11** using the app directly.
- **Secondary**: Parents or teachers supervising progress.

## 3. Curriculum surface

- **40 interactive lessons** across **nine** strands: counting, place value, addition, subtraction, multiplication, division, fractions, algebraic thinking, number sense.
- Each lesson is a **routed screen** (`src/App.tsx`) wrapped in **`LessonShell`** for a consistent layout (tutor panel + canvas).

## 4. Core product features

### 4.1 Voice and tutor panel

- **Pocket TTS** in the browser for instructions and short reactions (typewriter bubble + optional audio).
- **Tutor panel** lists **chat** lines (student + tutor) when the agent is used.
- **Controls** (current behaviour):
  - **Mic / STT** — Tells the agent server to **ignore** microphone phrases (no transcription, no voice-driven LLM). Typed chat still works.
  - **Speaker** — **Mutes TTS audio** in the browser; captions/typewriter can continue.

### 4.2 Adaptive difficulty

- Many lessons use a **persisted level (1–5)** driven by a **rolling accuracy window** (see `useDifficultyStore` and product copy in UI). Exact thresholds may evolve in code.

### 4.3 Gamification

- Stars per lesson, session **points** and **streak**, encouraging copy and light effects (e.g. confetti) on success paths.

### 4.4 AI-driven adaptive canvas (differentiator)

When the **agent server** is running, the product can:

1. Receive **telemetry snapshots** on an interval (idle time, tab focus, input churn, session accuracy, optional **lessonContext** from the active lesson).
2. Emit structured **`VisualCommand`** messages over **WebSocket**.

**Modes**

| `type` | Purpose |
|--------|---------|
| **`annotate`** | Overlay hints (highlight, circle, pulse, label, arrow) on the existing lesson DOM. |
| **`swap`** | Ask the lesson to switch an alternate visualization (e.g. different concrete representation). |
| **`teach`** | Run a lesson-registered **playbook**: timed annotation steps + optional spoken lines. |

Commands may carry **`speech`** for synchronous TTS in the shell.

### 4.5 Conversational layer (agent)

With the full agent stack:

- **Typed `user_chat`** → server may invoke **Ollama** (or future backends) and return **`tutor_reply`** text (shown + spoken).
- **Server-side microphone** → STT → same pipeline (subject to **`set_stt_muted`**).

The **browser does not** use `getUserMedia` for this STT path; microphone access is on the **machine running Python**. Product copy and privacy notices should reflect deployment context (local dev vs hosted).

## 5. User stories (selected)

| User | Want | Why |
|------|------|-----|
| Student | Hear short, clear instructions | Reduce reading load. |
| Student | See hints when stuck | Reduce frustration. |
| Student | Turn off voice or mic when needed | Control sensory load and privacy. |
| Student | Chat in text with the tutor | Ask questions when voice is off or impractical. |
| Student | See the lesson change when confused | Match representation to thinking style. |
| Parent | See progress and engagement proxies | Support learning outside the app (future dashboards). |

## 6. Non-functional requirements

- **Interaction**: UI responses should feel immediate (targets depend on device; aim well under perceptible lag for taps/clicks).
- **Voice**: TTS should degrade gracefully to **text-only** if Pocket TTS is down.
- **Persistence**: Progress and profile data that are implemented as “persisted” must survive refresh (see Zustand `persist` usage in stores).
- **Accessibility**: Large touch targets where possible; tutor text visible even without audio.
- **Telemetry**: No camera; mic is **not** read in-browser for STT. Optional **mouse/keyboard/focus** signals only, plus lesson metrics, unless future features expand scope.

## 7. Success metrics (product)

Examples for evaluation (instrumentation may vary by build):

- Lessons completed per session.
- Accuracy and difficulty movement over time.
- Hint usage and streak behaviour.
- When the agent is enabled: frequency of **`annotate` / `swap` / `teach`** followed by improved attempts.

## 8. Protocol reference

Authoritative TypeScript types: **`src/types/visualCommand.ts`**.  
Authoritative server behaviour: **`server/main.py`**.
