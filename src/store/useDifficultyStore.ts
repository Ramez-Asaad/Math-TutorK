import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface DifficultyStore {
    level: 1 | 2 | 3 | 4 | 5
    accuracy: number // rolling 10-attempt window percentage
    recentAttempts: boolean[] // last 10
    adjustEvery: 5
    upThreshold: 0.85
    downThreshold: 0.60
    recordAttempt: (correct: boolean) => void
    setLevel: (level: 1 | 2 | 3 | 4 | 5) => void
}

export const useDifficultyStore = create<DifficultyStore>()(
    persist(
        (set) => ({
            level: 1,
            accuracy: 0.75,
            recentAttempts: [],
            adjustEvery: 5,
            upThreshold: 0.85,
            downThreshold: 0.60,

            recordAttempt: (correct) =>
                set((s) => {
                    const recent = [...s.recentAttempts, correct].slice(-10)
                    const accuracy = recent.filter(Boolean).length / recent.length
                    let level = s.level
                    if (recent.length >= 5) {
                        if (accuracy >= 0.85 && level < 5) level = (level + 1) as 1 | 2 | 3 | 4 | 5
                        else if (accuracy < 0.60 && level > 1) level = (level - 1) as 1 | 2 | 3 | 4 | 5
                    }
                    return { recentAttempts: recent, accuracy, level }
                }),

            setLevel: (level) => set({ level }),
        }),
        { name: 'math-tutor-difficulty' }
    )
)
