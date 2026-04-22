# Product Roadmap — Math-Tutor

## Phase 1: Stability & Polish (Current)
- [ ] **Infrastructure**: Add unit tests for `mathGenerators` and `problemValidator`.
- [ ] **Refactoring**: Split `Home.tsx` into smaller, manageable components.
- [ ] **Integration**: Connect `useScoreStore` points to `useProgressStore` persistent lifetime stats.
- [ ] **Progression**: Activate the category unlock gating (e.g., must finish Addition 1 to unlock Addition 2).

## Phase 2: Feature Expansion (Q2 2026)
- [ ] **Timed Challenges**: Implement "Sprint Mode" using the existing `useTimer` hook for high-score hunters.
- [ ] **Progress Visualization**: Add a "Growth Chart" in the Home screen to show accuracy improvements over time.
- [ ] **Avatar Customization**: Allow kids to spend earned session points on new avatar emojis or profile colors.
- [ ] **Arabic Localization**: Native support for Arabic text and potentially Arabic TTS voices.

## Phase 3: Social & Parental Features (Q3 2026)
- [ ] **Parent Dashboard**: A dedicated view to see category mastery, time spent, and weak spots.
- [ ] **Exportable Reports**: Generate a simple PDF "Report Card" for offline use.
- [ ] **Offline Mode (PWA)**: Full Service Worker support to allow learning without an internet connection (requires pre-caching TTS common phrases).

## Phase 4: AI & advanced learning (future)

- [ ] **Richer LLM pedagogy**: Extend beyond short chat replies — e.g. structured hints keyed to common error patterns, with guardrails.
- [ ] **Advanced curriculum**: Geometry, measurement, data analysis strands.
- [ ] **Multi-child profiles**: Multiple learners on one device / browser profile.

**Note:** The agent server already supports **Ollama**-backed `tutor_reply` and server-side STT when those services are installed; items above are about *depth* of pedagogy and product UX, not “add an LLM from zero.”
