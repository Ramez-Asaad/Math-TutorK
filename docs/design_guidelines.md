# Design Guidelines — Math-Tutor

## 1. Visual Style: "Cyber-Learning"
A modern, dark-themed aesthetic with vibrant neon accents. Purposefully designed to look "cool" and premium to engage kids who are used to gaming interfaces.

## 2. Color Palette
| Sentiment | Color | Hex / Tailwind |
|---|---|---|
| **Background** | Deep Space | `#0f0f1a` |
| **Surface** | Glass Tint | `white / 5% - 10%` |
| **Primary** | Electric Violet | `violet-500` / `#8b5cf6` |
| **Success** | Emerald Neon | `emerald-500` / `#10b981` |
| **Warning** | Amber Hint | `amber-500` / `#f59e0b` |
| **Error** | Crimson Pulse | `rose-500` / `#f43f5e` |

## 3. Typography
- **Headings/Display**: `font-display` (bold/black weights). Used for lesson titles and "Lesson Complete" screens.
- **Body/UI**: `font-sans` (Inter or similar). Clean, readable at small sizes.
- **Numbers**: Large, bold, and high-contrast. Use `tabular-nums` for counters.

## 4. Animation Principles
Every interaction must have visual weight and physics.
- **Standard Spring**: `type: 'spring', stiffness: 300, damping: 25` (use `SPRING` preset).
- **Staggering**: Use `delayChilden` and `staggerChildren` for list entries (e.g., Category cards).
- **Feedback**:
    - **Correct**: Confetti + Scaling up.
    - **Wrong**: Subtle shake + Dimming.
    - **Tutor**: Typewriter cursor + Pulse indicator when speaking.

## 5. UI Components
- **Buttons**: Minimum size of `44x44px` for touch-friendliness.
- **Tiles**: Rounded corners (`2xl` or `3xl`). Always have a subtle border (`border-white/10`).
- **Glassmorphism**: Use `backdrop-blur-md` and semi-transparent backgrounds for panels and modals.

## 6. Iconography
- Use high-quality Emojis for avatars and categories.
- Use simple, bold SVG paths for UI controls (next/prev).
