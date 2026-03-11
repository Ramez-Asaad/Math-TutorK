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

## Phase 4: AI & Advanced Learning (Future)
- [ ] **LLM Hinting**: Instead of static hints, use an LLM to generate dynamic, contextual hints based on the *exact* mistake made.
- [ ] **Advanced Curriculum**: Expand into Geometry, Measurement, and Data Analysis.
- [ ] **Multi-Child Profiles**: Support multiple profiles on a single device.
