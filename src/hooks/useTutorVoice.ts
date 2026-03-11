import { useState, useCallback, useRef } from 'react'
import { speakText, stopAudio, preCacheAudio } from '../utils/ttsClient'

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
        setIsSpeaking(true)
        try {
            await speakText(text)
        } catch { /* TTS unavailable — text-only fallback */ }
        setIsSpeaking(false)
    }, [])

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

    /** Speak lesson instructions on mount */
    const speakInstruction = useCallback((text: string) => {
        speakInternal(text)
    }, [speakInternal])

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

    return {
        message,
        isTyping,
        isSpeaking,
        showHintButton,
        speak,
        speakInstruction,
        offerHint,
        acceptHint,
        dismissHint,
        preCacheTexts,
    }
}
