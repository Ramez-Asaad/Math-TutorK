# Development rules — Math-TutorK

## 1. Component structure

- **Functional components only** (no class components).
- **One main component per file** (tiny local helpers are fine).
- **Props**: Prefer `interface LessonProps`-style names and explicit typing.
- **Exports**: Prefer **named exports** for components and hooks.

## 2. Lesson patterns

- **Layout**: New lessons should use **`LessonShell`** (and usually **`LessonCanvas`**) so the tutor panel, telemetry, and agent wiring stay consistent.
- **State**:
  - Ephemeral UI (drag positions, local step index) → `useState` / refs in the lesson.
  - Session scoring / streaks → **`useScoreStore`** where appropriate.
  - Long-lived profile / progress → the relevant persisted stores.
- **Tutor reactions**: Drive short correct/wrong flows via the **`feedback`** prop on **`LessonShell`** (`'none' | 'correct' | 'wrong'`).
- **Agent hooks**: When a lesson should expose rich context to the server, pass **`lessonContext`** / **`playbooks`** / **`onSwapView`** through **`LessonShell`** props (see existing lessons as templates).

## 3. Naming

- **Folders**: `kebab-case` (e.g. `number-sense/`).
- **Files**: `PascalCase.tsx` for components; `camelCase.ts` for hooks and utilities.
- **Styles**: Prefer **Tailwind** utility classes; avoid new global CSS unless necessary.
- **Stores**: Prefix with `use` (`useScoreStore`, …).

## 4. Voice and audio

- Route spoken lines through **`useTutorVoice`** / **`ttsClient`** so caching and health checks stay centralised.
- Do not bypass **`setTtsMuted`** semantics: if you add new audio paths, respect the user’s speaker mute choice.

## 5. Tooling

- **ESLint**: Flat config in **`eslint.config.js`** (ESLint 9). Run `npm run lint`.
- **Types**: Avoid `any`; narrow `unknown` from external JSON where needed.
- **Imports** (soft convention): React → third-party → `@/` or aliased paths if added → `store` / `hooks` → `components` → `utils` / assets.

## 6. Agent types

- When changing WebSocket payloads, update **`src/types/visualCommand.ts`** and **`docs/architecture.md`** together so TS and docs stay aligned.

