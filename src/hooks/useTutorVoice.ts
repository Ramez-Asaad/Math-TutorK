import { useState, useCallback, useRef, useMemo } from 'react'
import { speakText, stopAudio, preCacheAudio, playPreRecordedSpeech } from '../utils/ttsClient'

const MESSAGES = {
    onCorrect: [
        'Well done!', "You're on fire!", "That's so nice!",
        'Brilliant!', 'Keep it up!', 'Amazing!', 'Correct!',
    ],
    onWrong: [
        "Almost! Try again.", "Good try, let's think.", "So close! One more go.",
        "You've got this!", "Nearly there!",
    ],
    onHint: [
        "Here's a clue...", 'Let me show you...', 'Watch carefully...',
        'Think about it...', 'Almost, try again!',
    ],
    onComplete: [
        'Amazing work today!', 'Lesson complete! You crushed it!',
        "You're a math star!", 'Incredible job!',
    ],
}

type EventType = keyof typeof MESSAGES

export function useTutorVoice() {
    const [message, setMessage] = useState("Let's learn some math! 🎉")
    const [isTyping, setIsTyping] = useState(false)
    const [isSpeaking, setIsSpeaking] = useState(false)
    const [hintText, setHintText] = useState<string | null>(null)
    const [showHintButton, setShowHintButton] = useState(false)
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    /** Tracks TTS playback (not typewriter) for sequencing teach after tutor_reply */
    const speakingRef = useRef(false)
    const idleWaitersRef = useRef<(() => void)[]>([])
    const [ttsMuted, setTtsMutedState] = useState(false)
    const ttsMutedRef = useRef(false)

    const flushSpeechIdleWaiters = useCallback(() => {
        const w = idleWaitersRef.current
        idleWaitersRef.current = []
        w.forEach((fn) => fn())
    }, [])

    /* ── Internal: typewriter + audio ── */
    const speakInternal = useCallback(async (text: string) => {
        // Cancel any ongoing typewriter
        if (timerRef.current) clearTimeout(timerRef.current)
        stopAudio()

        // Start typewriter — faster at 25ms per char
        setMessage('')
        setIsTyping(true)
        let i = 0
        const type = () => {
            if (i < text.length) {
                setMessage(text.slice(0, i + 1))
                i++
                timerRef.current = setTimeout(type, 25)
            } else {
                setIsTyping(false)
            }
        }
        type()

        // Play audio in parallel (non-blocking — gracefully fails)
        if (!ttsMutedRef.current) {
            setIsSpeaking(true)
            speakingRef.current = true
            try {
                await speakText(text)
            } catch { /* TTS unavailable — text-only fallback */ }
            setIsSpeaking(false)
            speakingRef.current = false
        }
        flushSpeechIdleWaiters()
    }, [flushSpeechIdleWaiters])

    /* ── Public API ── */

    /** Speak a message — either a predefined event or custom text */
    const speak = useCallback((event: EventType | string, custom?: string) => {
        setShowHintButton(false)
        setHintText(null)

        const text =
            custom ??
            (() => {
                const pool = MESSAGES[event as EventType]
                return pool ? pool[Math.floor(Math.random() * pool.length)] : event
            })()

        speakInternal(text)
    }, [speakInternal])

    /** Speak lesson instructions on mount — returns Promise so callers can await TTS end */
    const speakInstruction = useCallback((text: string): Promise<void> => {
        return speakInternal(text)
    }, [speakInternal])

    /** Speak a pre-recorded audio file while typing the text */
    const speakPreRecorded = useCallback(async (url: string, text: string): Promise<void> => {
        if (timerRef.current) clearTimeout(timerRef.current)
        stopAudio()

        setMessage('')
        setIsTyping(true)
        let i = 0
        const type = () => {
            if (i < text.length) {
                setMessage(text.slice(0, i + 1))
                i++
                timerRef.current = setTimeout(type, 25)
            } else {
                setIsTyping(false)
            }
        }
        type()

        if (!ttsMutedRef.current) {
            setIsSpeaking(true)
            speakingRef.current = true
            try {
                await playPreRecordedSpeech(url)
            } catch {
                // Fall back to live TTS if the file is missing
                try {
                    await speakText(text)
                } catch { }
            }
            setIsSpeaking(false)
            speakingRef.current = false
        }
        flushSpeechIdleWaiters()
    }, [flushSpeechIdleWaiters])

    /** Resolve when no TTS audio is playing (typewriter may still run) */
    const waitUntilSpeechIdle = useCallback((): Promise<void> => {
        if (!speakingRef.current) return Promise.resolve()
        return new Promise<void>((resolve) => {
            idleWaitersRef.current.push(resolve)
        })
    }, [])

    /** Show hint offer after wrong answer */
    const offerHint = useCallback((hint: string) => {
        setHintText(hint)
        setShowHintButton(true)
        speakInternal("Need a hint?")
    }, [speakInternal])

    /** Accept the hint — speak it */
    const acceptHint = useCallback(() => {
        if (hintText) {
            setShowHintButton(false)
            speakInternal(hintText)
            setHintText(null)
        }
    }, [hintText, speakInternal])

    /** Dismiss the hint offer */
    const dismissHint = useCallback(() => {
        setShowHintButton(false)
        setHintText(null)
    }, [])

    /** Pre-cache audio for a list of texts (fire-and-forget) */
    const preCacheTexts = useCallback((texts: string[]) => {
        preCacheAudio(texts)
    }, [])

    /** Immediately stop speaking and cancel typewriter — used for barge-in */
    const cancelSpeaking = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current)
            timerRef.current = null
        }
        stopAudio()
        setIsTyping(false)
        setIsSpeaking(false)
        speakingRef.current = false
        flushSpeechIdleWaiters()
    }, [flushSpeechIdleWaiters])

    /** Mute / unmute tutor voice audio (typewriter still runs). */
    const setTtsMuted = useCallback((muted: boolean) => {
        ttsMutedRef.current = muted
        setTtsMutedState(muted)
        if (muted) {
            stopAudio()
            setIsSpeaking(false)
            speakingRef.current = false
            flushSpeechIdleWaiters()
        }
    }, [flushSpeechIdleWaiters])

    return useMemo(() => ({
        message,
        isTyping,
        isSpeaking,
        ttsMuted,
        showHintButton,
        speak,
        speakInstruction,
        waitUntilSpeechIdle,
        offerHint,
        acceptHint,
        dismissHint,
        preCacheTexts,
        cancelSpeaking,
        setTtsMuted,
        speakPreRecorded,
    }), [message, isTyping, isSpeaking, ttsMuted, showHintButton, speak, speakInstruction, waitUntilSpeechIdle, offerHint, acceptHint, dismissHint, preCacheTexts, cancelSpeaking, setTtsMuted, speakPreRecorded])
}
