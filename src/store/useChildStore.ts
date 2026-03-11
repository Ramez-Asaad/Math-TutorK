import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type AgeGroup = 'k1' | 'k2' | 'k3' | 'k4' | 'k5'

interface ChildStore {
    name: string
    avatar: string
    ageGroup: AgeGroup
    setName: (name: string) => void
    setAvatar: (avatar: string) => void
    setAgeGroup: (ag: AgeGroup) => void
}

export const useChildStore = create<ChildStore>()(
    persist(
        (set) => ({
            name: 'Explorer',
            avatar: '🧒',
            ageGroup: 'k2',
            setName: (name) => set({ name }),
            setAvatar: (avatar) => set({ avatar }),
            setAgeGroup: (ageGroup) => set({ ageGroup }),
        }),
        { name: 'math-tutor-child' }
    )
)
