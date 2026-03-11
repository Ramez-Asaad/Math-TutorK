# Development Rules — Math-Tutor

## 1. Component Structure
- **Functional Components (FC)** only.
- **One Component per File** (unless it's a tiny sub-component used only once).
- **Prop Typing**: Always use `interface NameProps`.
- **Exporting**: Use named exports for components.

## 2. Lesson Development Patterns
- **Do not hardcode layout**. Wrap everything in `<LessonShell>`.
- **State Separation**:
    - Local UI state (e.g., current drag position) in `useState`.
    - Lesson logic (e.g., total problems) in the component.
    - Global state (e.g., points) in `useScoreStore`.
- **Feedback**: Updating the `feedback` prop on `LessonShell` is the *only* way to trigger tutor voice reactions.

## 3. Naming Conventions
- **Folders**: `kebab-case`.
- **Files**: `PascalCase` for components, `camelCase` for hooks/utils.
- **Styles**: Use Tailwind classes. Avoid custom CSS files.
- **Stores**: Prefix with `use` (e.g., `useScoreStore`).

## 4. Async & TTS
- **Never block on TTS**. Audio should be fire-and-forget.
- **Cache checks**: Always use `ttsClient` functions to ensure caching and health checks are respected.

## 5. Coding Standards
- **ESLint**: Respect the project's `.eslintrc.config.js`. No `any` types.
- **Comments**: Document non-obvious logic in `mathGenerators.ts`.
- **Imports**: Order should be: React → Libraries → Store/Hooks → Components → Utils/Assets.
