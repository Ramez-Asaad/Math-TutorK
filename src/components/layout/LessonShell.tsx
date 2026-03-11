import React, { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TutorPanel } from './TutorPanel'
import { LessonCanvas } from './LessonCanvas'
import { useTutorVoice } from '../../hooks/useTutorVoice'
import { useScoreStore } from '../../store/useScoreStore'

export interface LessonVoiceConfig {
    /** Spoken instruction when lesson starts */
    instruction: string
    /** Hints keyed by problem index (or a default '*' key) */
    hints?: Record<string | number, string>
}

interface LessonShellProps {
    children: React.ReactNode
    total?: number
    attempted?: number
    correct?: number
    /** Bottom bar subtitle — optional override */
    subtitle?: string
    /** Accent color class (e.g. 'bg-amber-500') used for the side strip */
    accentClass?: string
    /** Voice config — instruction + per-problem hints */
    voiceConfig?: LessonVoiceConfig
    /** Current problem index (used for hint lookup) */
    problemIndex?: number
    /** Feedback state — triggers hint offer on 'wrong' */
    feedback?: 'none' | 'correct' | 'wrong'
}

/* ── Feedback messages to pre-cache ───────────────────────────── */
const PRECACHE_MESSAGES = [
    'Well done!', "You're on fire!", "That's so nice!",
    'Brilliant!', 'Keep it up!', 'Amazing!', 'Correct!',
    "Almost! Try again.", "Good try, let's think.", "So close! One more go.",
    "You've got this!", "Nearly there!",
    "Need a hint?",
]

export const LessonShell: React.FC<LessonShellProps> & {
    useVoice: typeof useTutorVoice
} = ({
    children,
    total = 10,
    attempted = 0,
    correct = 0,
    subtitle,
    accentClass = 'bg-violet-600',
    voiceConfig,
    problemIndex = 0,
    feedback = 'none',
}) => {
        const voice = useTutorVoice()
        const { sessionPoints, streak } = useScoreStore()
        const hasSpokenInstruction = useRef(false)
        const lastFeedback = useRef<string>('none')

        // Speak instruction on mount — fast 200ms delay
        useEffect(() => {
            if (voiceConfig?.instruction && !hasSpokenInstruction.current) {
                hasSpokenInstruction.current = true
                // Minimal delay so the component is visible before speaking
                const t = setTimeout(() => voice.speakInstruction(voiceConfig.instruction), 200)
                return () => clearTimeout(t)
            }
        }, [voiceConfig?.instruction, voice.speakInstruction])

        // Pre-cache feedback audio on mount for instant responses
        useEffect(() => {
            const textsToCache = [...PRECACHE_MESSAGES]
            // Also pre-cache hints if provided
            if (voiceConfig?.hints) {
                Object.values(voiceConfig.hints).forEach(h => textsToCache.push(h))
            }
            voice.preCacheTexts(textsToCache)
        }, [voiceConfig?.hints, voice.preCacheTexts])

        // React to feedback changes
        useEffect(() => {
            if (feedback === lastFeedback.current) return
            lastFeedback.current = feedback

            if (feedback === 'correct') {
                voice.speak('onCorrect')
            } else if (feedback === 'wrong') {
                voice.speak('onWrong')
                // Offer hint after the "wrong" message plays
                if (voiceConfig?.hints) {
                    const hint = voiceConfig.hints[problemIndex] ?? voiceConfig.hints['*']
                    if (hint) {
                        setTimeout(() => voice.offerHint(hint), 1500)
                    }
                }
            }
        }, [feedback, problemIndex, voiceConfig?.hints, voice])

        return (
            <div className="relative w-full h-full flex bg-[#0f0f1a] overflow-hidden">
                {/* Accent strip left edge */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${accentClass} opacity-80`} />

                {/* Left panel — 25% */}
                <div className="w-[25%] h-full border-r border-white/8 relative">
                    <TutorPanel voice={voice} />
                </div>

                {/* Right panel — 75% */}
                <div className="flex-1 h-full">
                    <LessonCanvas
                        total={total}
                        attempted={attempted}
                        correct={correct}
                        points={sessionPoints}
                        streak={streak}
                    >
                        {children}
                    </LessonCanvas>
                </div>

                {/* Bottom subtitle bar */}
                <AnimatePresence>
                    {subtitle && (
                        <motion.div
                            key={subtitle}
                            initial={{ y: 60, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 60, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-md py-3 px-8 text-center"
                        >
                            <span className="text-white/80 font-display font-medium text-sm">{subtitle}</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        )
    }

// Re-export voice hook so lesson components can consume it via LessonShell.useVoice
LessonShell.useVoice = useTutorVoice
