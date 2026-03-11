import { useState, useRef, useCallback, useEffect } from 'react'

export function useTimer(initialSeconds: number) {
    const [secondsLeft, setSecondsLeft] = useState(initialSeconds)
    const [running, setRunning] = useState(false)
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

    const start = useCallback(() => {
        setRunning(true)
    }, [])

    const stop = useCallback(() => {
        setRunning(false)
        if (intervalRef.current) clearInterval(intervalRef.current)
    }, [])

    const reset = useCallback((newSeconds?: number) => {
        stop()
        setSecondsLeft(newSeconds ?? initialSeconds)
    }, [stop, initialSeconds])

    useEffect(() => {
        if (!running) return
        intervalRef.current = setInterval(() => {
            setSecondsLeft((s) => {
                if (s <= 1) {
                    setRunning(false)
                    return 0
                }
                return s - 1
            })
        }, 1000)
        return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
    }, [running])

    const pct = (secondsLeft / initialSeconds) * 100

    return { secondsLeft, pct, running, start, stop, reset }
}
