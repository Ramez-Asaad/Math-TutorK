import { useEffect, useRef, useCallback, useMemo } from 'react'
import { useScoreStore } from '../store/useScoreStore'
import { useDifficultyStore } from '../store/useDifficultyStore'
import type { TelemetrySnapshot, LessonContext } from '../types/visualCommand'

interface UseTelemetryOptions {
  lessonId: string
  problemIndex: number
  /** How often (ms) to emit a snapshot — default 3 000 */
  intervalMs?: number
  onSnapshot?: (snapshot: TelemetrySnapshot) => void
  /** Rich lesson context forwarded to the agent for smarter decisions */
  lessonContext?: LessonContext
  /** Whether a hint is currently being offered */
  hintPending?: boolean
}

/**
 * Collects browser-level engagement signals and emits periodic snapshots.
 * Tracks: mouse movement, keystrokes, idle time, tab focus, answer deletions.
 */
export function useTelemetry({
  lessonId,
  problemIndex,
  intervalMs = 3_000,
  onSnapshot,
  lessonContext,
  hintPending,
}: UseTelemetryOptions) {
  const mouseMoveCount = useRef(0)
  const keystrokeCount = useRef(0)
  const lastActivity = useRef(Date.now())
  const tabFocused = useRef(true)
  const answerDeletions = useRef(0)

  const { streak, correctCount, wrongCount } = useScoreStore()
  const { level } = useDifficultyStore()

  // Derive accuracy from actual session data (score store) instead of the
  // disconnected difficulty store, so the agent sees real numbers immediately.
  const total = correctCount + wrongCount
  const accuracy = total > 0 ? correctCount / total : 0.75

  // Reset per-problem counters when problem changes
  useEffect(() => {
    answerDeletions.current = 0
  }, [problemIndex])

  // Attach global listeners
  useEffect(() => {
    const onMouseMove = () => {
      mouseMoveCount.current++
      lastActivity.current = Date.now()
    }
    const onKeyDown = () => {
      keystrokeCount.current++
      lastActivity.current = Date.now()
    }
    const onClick = () => {
      lastActivity.current = Date.now()
    }
    const onVisChange = () => {
      tabFocused.current = document.visibilityState === 'visible'
      lastActivity.current = Date.now()
    }
    const onFocus = () => { tabFocused.current = true; lastActivity.current = Date.now() }
    const onBlur = () => { tabFocused.current = false }

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    window.addEventListener('keydown', onKeyDown, { passive: true })
    window.addEventListener('click', onClick, { passive: true })
    document.addEventListener('visibilitychange', onVisChange)
    window.addEventListener('focus', onFocus)
    window.addEventListener('blur', onBlur)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('click', onClick)
      document.removeEventListener('visibilitychange', onVisChange)
      window.removeEventListener('focus', onFocus)
      window.removeEventListener('blur', onBlur)
    }
  }, [])

  // Periodic snapshot emitter
  useEffect(() => {
    if (!onSnapshot) return

    const id = setInterval(() => {
      const snapshot: TelemetrySnapshot = {
        timestamp: Date.now(),
        lessonId,
        problemIndex,
        idleMs: Date.now() - lastActivity.current,
        tabFocused: tabFocused.current,
        mouseMoveCount: mouseMoveCount.current,
        keystrokeCount: keystrokeCount.current,
        answerDeletions: answerDeletions.current,
        accuracy,
        streak,
        difficultyLevel: level,
        correctCount,
        wrongCount,
        hintPending: hintPending,
        ...(lessonContext ? { lessonContext } : {}),
      }
      onSnapshot(snapshot)

      // Reset windowed counters
      mouseMoveCount.current = 0
      keystrokeCount.current = 0
    }, intervalMs)

    return () => clearInterval(id)
  }, [onSnapshot, lessonId, problemIndex, intervalMs, accuracy, streak, level, correctCount, wrongCount, lessonContext])

  /** Call this from the lesson when the student deletes / clears their answer */
  const recordDeletion = useCallback(() => {
    answerDeletions.current++
    lastActivity.current = Date.now()
  }, [])

  /** Call on any answer interaction to keep idle timer fresh */
  const recordInteraction = useCallback(() => {
    lastActivity.current = Date.now()
  }, [])

  return useMemo(() => ({ recordDeletion, recordInteraction }), [recordDeletion, recordInteraction])
}
