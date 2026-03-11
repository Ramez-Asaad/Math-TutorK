import { create } from 'zustand'

interface ScoreStore {
    sessionPoints: number
    streak: number
    correctCount: number
    wrongCount: number
    addCorrect: (pts?: number) => void
    addWrong: () => void
    reset: () => void
}

export const useScoreStore = create<ScoreStore>()((set) => ({
    sessionPoints: 0,
    streak: 0,
    correctCount: 0,
    wrongCount: 0,

    addCorrect: (pts = 10) =>
        set((s) => ({
            sessionPoints: s.sessionPoints + pts * (s.streak >= 5 ? 2 : 1),
            streak: s.streak + 1,
            correctCount: s.correctCount + 1,
        })),

    addWrong: () =>
        set((s) => ({
            streak: 0,
            wrongCount: s.wrongCount + 1,
        })),

    reset: () => set({ sessionPoints: 0, streak: 0, correctCount: 0, wrongCount: 0 }),
}))
