# PRD (Product Requirements Document) — Math-Tutor

## 1. Vision
To provide a highly engaging, interactive, and adaptive math learning platform for elementary students (K-5) that combines visual learning with an AI-powered auditory tutor.

## 2. Target Audience
- **Primary Users**: Children aged 5–11 (Grades K-5).
- **Secondary Users**: Parents and educators monitoring progress.

## 3. Core Features
- **Curriculum Coverage**: 36 lessons across 9 categories (Counting, Addition, Subtraction, Multiplication, Division, Fractions, Place Value, Algebraic Thinking, Number Sense).
- **AI Tutor (Pocket TTS)**: Real-time voice instructions, feedback, and context-aware hints.
- **Adaptive Difficulty**: Automatic adjustment of problem complexity based on a rolling accuracy window (85% to level up, <60% to level down).
- **Gamification**:
    - Star-based rating system (1-3 stars per lesson).
    - Session points and streaks (multipliers for high streaks).
    - Persistent progress tracking.
- **Interactive UI**: Drag-and-drop mechanics, interactive number lines, and dynamic inputs.

## 4. User Stories
| User | Want | Why |
|---|---|---|
| Student | To hear the tutor explain things | To understand the task without reading complex text. |
| Student | To get a hint when I'm stuck | To keep moving forward without frustration. |
| Student | To see my stars and points | To feel a sense of achievement and progress. |
| Parent | To know which areas my child is good at | To support their learning journey. |

## 5. Technical Requirements
- **Performance**: Instant interaction feedback (<100ms lag).
- **Voice Latency**: TTS generation and playback should feel natural.
- **Persistence**: All progress must survive browser refreshes (Local Storage).
- **Accessibility**: Simple navigation, large touch targets, and clear audio.

## 6. Success Metrics
- **Retention**: Number of lessons completed per session.
- **Mastery**: Improvement in accuracy and difficulty level over time.
- **Engagement**: Use of the hint system and streak maintenance.
