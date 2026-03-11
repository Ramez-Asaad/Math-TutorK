import { useCallback } from 'react'
import { useDifficultyStore } from '../store/useDifficultyStore'

export function useAdaptiveDifficulty() {
    const { level, accuracy, recordAttempt } = useDifficultyStore()

    const onCorrect = useCallback(() => recordAttempt(true), [recordAttempt])
    const onWrong = useCallback(() => recordAttempt(false), [recordAttempt])

    return { level, accuracy, onCorrect, onWrong }
}
