/** Clamp a number between min and max */
export const clamp = (val: number, min: number, max: number) =>
    Math.max(min, Math.min(max, val))

/** Random integer in [min, max] inclusive */
export const randInt = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min

/** Shuffle an array (Fisher-Yates) */
export function shuffle<T>(arr: T[]): T[] {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]]
    }
    return a
}

/* ── Addition problems ── */
export function genAddition(level: 1 | 2 | 3 | 4 | 5) {
    const ranges: [number, number][] = [
        [1, 5], [1, 10], [1, 20], [10, 50], [10, 99]
    ]
    const [lo, hi] = ranges[level - 1]
    const a = randInt(lo, hi)
    const b = randInt(lo, hi)
    return { a, b, op: '+' as const, answer: a + b }
}

/* ── Subtraction problems ── */
export function genSubtraction(level: 1 | 2 | 3 | 4 | 5) {
    const ranges: [number, number][] = [
        [1, 5], [1, 10], [1, 20], [10, 50], [10, 99]
    ]
    const [lo, hi] = ranges[level - 1]
    const a = randInt(lo, hi)
    const b = randInt(lo, a)
    return { a, b, op: '-' as const, answer: a - b }
}

/* ── Multiplication problems ── */
export function genMultiplication(level: 1 | 2 | 3 | 4 | 5) {
    const maxFactor = [2, 5, 10, 12, 12][level - 1]
    const a = randInt(2, maxFactor)
    const b = randInt(2, maxFactor)
    return { a, b, op: '×' as const, answer: a * b }
}

/* ── Division problems ── */
export function genDivision(level: 1 | 2 | 3 | 4 | 5) {
    const maxFactor = [2, 5, 10, 12, 12][level - 1]
    const b = randInt(2, maxFactor)
    const answer = randInt(1, maxFactor)
    const a = b * answer
    return { a, b, op: '÷' as const, answer }
}

/* ── Counting target ── */
export function genCountTarget(level: 1 | 2 | 3 | 4 | 5) {
    const maxes = [5, 10, 20, 50, 100]
    return randInt(1, maxes[level - 1])
}

/* ── Skip count sequence ── */
export function genSkipCount(by: number, length = 6) {
    const start = randInt(0, 3) * by
    return Array.from({ length }, (_, i) => start + i * by)
}

/* ── Missing number in sequence ── */
export function genMissingNumber(by: number, length = 6) {
    const seq = genSkipCount(by, length)
    const blankIdx = randInt(1, length - 2)
    return { seq, blankIdx, answer: seq[blankIdx] }
}
