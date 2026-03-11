# Math Tutor

An interactive math learning platform for kids, built with React, TypeScript, and Vite. Features 40 animated lessons across 9 categories with AI-powered text-to-speech voice guidance.

## Features

- 40 interactive lessons covering counting, addition, subtraction, multiplication, division, fractions, place value, algebraic thinking, and number sense
- Voice-guided instructions using Pocket TTS with the Azelma voice
- Animated feedback with confetti, sound effects, and encouraging messages
- Progress tracking with stars and points
- Responsive design with dark theme

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Framer Motion (animations)
- Zustand (state management)
- Pocket TTS (text-to-speech)

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.12 (for TTS server)
- uv (Python package manager) - https://docs.astral.sh/uv/

### Installation

```bash
npm install
```

### Running

Start the TTS server (Terminal 1):

```bash
./start-tts.sh
```

Start the development server (Terminal 2):

```bash
npm run dev
```

The app will be available at http://localhost:5173

### Building for Production

```bash
npm run build
```

## Project Structure

```
src/
  categories/         # 40 lesson components organized by math topic
    addition/         # Object combining, number bonds, making ten, column addition, word problems
    subtraction/      # Takeaway, number line jumps, ten frame, column subtraction, missing number
    multiplication/   # Equal groups, arrays, square numbers, times table, flashcards, magic square
    division/         # Dot grouper, fair share, repeated subtraction, fact family
    counting/         # Dot counter, number line, comparison, skip counting
    fractions/        # Grid painter, comparator, fraction number line, equivalent, mixed numbers
    place-value/      # Dot builder, expanded form, hieroglyphs, rounding
    algebraic/        # Patterns, balance scale, function machine, missing number
    number-sense/     # Primes, negative numbers, word problems
  components/
    layout/           # LessonShell, TutorPanel, LessonCanvas
    shared/           # Numpad, Confetti, LessonComplete
  hooks/              # useTutorVoice
  store/              # Zustand stores for scores and progress
  utils/              # TTS client, lesson voice configs
```

## TTS Server

The app uses Pocket TTS for voice instructions. The TTS server runs locally on port 8000 and uses the Azelma female voice for a warm, encouraging tone. If the TTS server is not running, the app falls back to text-only mode.

## License

MIT
