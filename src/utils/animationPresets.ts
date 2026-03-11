import { type Variants } from 'framer-motion'

/** Spring config used across app */
export const SPRING = { type: 'spring', stiffness: 300, damping: 20 } as const

/** Stiff spring for snappy interactions */
export const SPRING_STIFF = { type: 'spring', stiffness: 500, damping: 25 } as const

/** Idle float for on-screen objects */
export const idleFloat = {
    animate: {
        y: [0, -4, 0],
        transition: { duration: 2, ease: 'easeInOut', repeat: Infinity },
    },
}

/** Hover + press scale */
export const tapScale: Variants = {
    rest: { scale: 1 },
    hover: { scale: 1.05, transition: { duration: 0.1, ease: 'easeOut' } },
    pressed: { scale: 0.95, transition: SPRING },
}

/** Correct answer: green flash */
export const correctFlash: Variants = {
    initial: { scale: 1, backgroundColor: 'transparent' },
    correct: {
        scale: [1, 1.15, 1],
        backgroundColor: ['transparent', '#22c55e', 'transparent'],
        transition: { duration: 0.5, ease: 'easeInOut' },
    },
}

/** Wrong answer: red shake */
export const wrongShake: Variants = {
    initial: { x: 0 },
    wrong: {
        x: [0, -8, 8, -6, 6, -4, 4, 0],
        transition: { duration: 0.4, ease: 'easeInOut' },
    },
}

/** Stagger children entrance */
export const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.05 },
    },
}

export const staggerItem: Variants = {
    hidden: { opacity: 0, y: 20, scale: 0.9 },
    show: { opacity: 1, y: 0, scale: 1, transition: SPRING },
}

/** Slide up from bottom */
export const slideUp: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: SPRING },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
}

/** Pop in */
export const popIn: Variants = {
    hidden: { scale: 0, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: SPRING },
    exit: { scale: 0, opacity: 0, transition: { duration: 0.15 } },
}

/** Card flip for flashcards */
export const flipAway: Variants = {
    initial: { rotateY: 0, scale: 1 },
    flip: { rotateY: 90, scale: 0.9, transition: { duration: 0.25 } },
    enter: { rotateY: 0, scale: 1, transition: { duration: 0.25, delay: 0.25 } },
}

/** Progress bar fill */
export const barFill = (pct: number) => ({
    initial: { width: '0%' },
    animate: { width: `${pct}%`, transition: { duration: 0.6, ease: 'easeOut' } },
})

/** Reusable idle float (y-axis bob) — use as animate prop directly */
export const IDLE_FLOAT_Y = {
    y: [0, -4, 0],
    transition: { duration: 2, ease: 'easeInOut' as const, repeat: Infinity },
}

/** Container glow on correct answer */
export const correctGlow = {
    borderColor: '#10b981',
    backgroundColor: 'rgba(16,185,129,0.08)',
}

/** Container shake on wrong answer */
export const wrongShakeX = {
    x: [0, -8, 8, -6, 6, -4, 4, 0],
    transition: SPRING,
}
