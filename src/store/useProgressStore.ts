import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface LessonProgress {
    completed: boolean
    stars: 1 | 2 | 3
    bestScore: number
    attempts: number
    lastPlayed: string // ISO string
}

export interface CategoryProgress {
    unlocked: boolean
    lessons: Record<string, LessonProgress>
}

export interface ProgressStore {
    categories: Record<string, CategoryProgress>
    totalPoints: number
    currentStreak: number
    bestStreak: number
    addPoints: (pts: number) => void
    incrementStreak: () => void
    resetStreak: () => void
    completeLesson: (categoryId: string, lessonId: string, stars: 1 | 2 | 3, score: number) => void
    unlockCategory: (categoryId: string) => void
    unlockAll: () => void
}

const defaultCategories: Record<string, CategoryProgress> = {
    counting: { unlocked: true, lessons: {} },
    'place-value': { unlocked: true, lessons: {} },
    addition: { unlocked: true, lessons: {} },
    subtraction: { unlocked: true, lessons: {} },
    multiplication: { unlocked: true, lessons: {} },
    division: { unlocked: true, lessons: {} },
    fractions: { unlocked: true, lessons: {} },
    algebraic: { unlocked: true, lessons: {} },
    'number-sense': { unlocked: true, lessons: {} },
}

export const useProgressStore = create<ProgressStore>()(
    persist(
        (set) => ({
            categories: defaultCategories,
            totalPoints: 0,
            currentStreak: 0,
            bestStreak: 0,

            addPoints: (pts) =>
                set((s) => ({ totalPoints: s.totalPoints + pts })),

            incrementStreak: () =>
                set((s) => {
                    const next = s.currentStreak + 1
                    return { currentStreak: next, bestStreak: Math.max(s.bestStreak, next) }
                }),

            resetStreak: () => set({ currentStreak: 0 }),

            completeLesson: (categoryId, lessonId, stars, score) =>
                set((s) => {
                    const existing = s.categories[categoryId]?.lessons[lessonId]
                    return {
                        categories: {
                            ...s.categories,
                            [categoryId]: {
                                ...s.categories[categoryId],
                                lessons: {
                                    ...s.categories[categoryId]?.lessons,
                                    [lessonId]: {
                                        completed: true,
                                        stars: existing ? Math.max(existing.stars, stars) as 1 | 2 | 3 : stars,
                                        bestScore: existing ? Math.max(existing.bestScore, score) : score,
                                        attempts: (existing?.attempts ?? 0) + 1,
                                        lastPlayed: new Date().toISOString(),
                                    },
                                },
                            },
                        },
                    }
                }),

            unlockCategory: (categoryId) =>
                set((s) => ({
                    categories: {
                        ...s.categories,
                        [categoryId]: { ...s.categories[categoryId], unlocked: true },
                    },
                })),

            unlockAll: () =>
                set((s) => ({
                    categories: Object.keys(s.categories).reduce((acc, catId) => ({
                        ...acc,
                        [catId]: { ...s.categories[catId], unlocked: true },
                    }), {} as Record<string, CategoryProgress>),
                })),
        }),
        { name: 'math-tutor-progress' }
    )
)
