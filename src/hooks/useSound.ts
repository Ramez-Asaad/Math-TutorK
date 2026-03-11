import { useRef, useCallback, useState } from 'react'
import { Howl } from 'howler'

const sounds: Record<string, Howl | null> = {
    correct: null,
    wrong: null,
    complete: null,
    tick: null,
    whoosh: null,
    streak5: null,
}

function getOrCreate(name: string): Howl {
    if (!sounds[name]) {
        sounds[name] = new Howl({
            src: [`/sounds/${name}.mp3`],
            volume: 0.6,
            onloaderror: () => { /* silently skip if not found */ },
        })
    }
    return sounds[name]!
}

export function useSound() {
    const [muted, setMuted] = useState(false)
    const mutedRef = useRef(false)

    const play = useCallback((name: string) => {
        if (mutedRef.current) return
        try { getOrCreate(name).play() } catch { /* ignore */ }
    }, [])

    const toggleMute = useCallback(() => {
        mutedRef.current = !mutedRef.current
        setMuted(mutedRef.current)
    }, [])

    return {
        muted,
        toggleMute,
        playCorrect: () => play('correct'),
        playWrong: () => play('wrong'),
        playComplete: () => play('complete'),
        playTick: () => play('tick'),
        playWhoosh: () => play('whoosh'),
        playStreak5: () => play('streak5'),
    }
}
