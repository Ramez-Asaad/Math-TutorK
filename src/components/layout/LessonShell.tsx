import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { TutorPanel } from './TutorPanel'
import { LessonCanvas } from './LessonCanvas'
import { useTutorVoice } from '../../hooks/useTutorVoice'
import { useScoreStore } from '../../store/useScoreStore'
import { useTelemetry } from '../../hooks/useTelemetry'
import { useAgentSocket } from '../../hooks/useAgentSocket'
import type { VisualCommand, Annotation, ChatMessage, TeachingPlaybook, LessonContext, AnnotationStep } from '../../types/visualCommand'

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
    /** Lesson identifier used for telemetry (e.g. 'fraction-comparator') */
    lessonId?: string
    /** Callback when the agent issues a swap command — lesson handles view switching */
    onSwapView?: (target: string) => void
    /** Teaching playbooks the lesson supports — agent can trigger these by strategy ID */
    playbooks?: TeachingPlaybook[]
    /** Rich lesson context (current problem data) sent to agent for smarter decisions */
    lessonContext?: Omit<LessonContext, 'availableStrategies'>
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
    lessonId = 'unknown',
    onSwapView,
    playbooks,
    lessonContext: lessonContextProp,
}) => {
        const voice = useTutorVoice()
        const { sessionPoints, streak } = useScoreStore()
        const hasSpokenInstruction = useRef(false)
        const lastFeedback = useRef<string>('none')

        // Auto-derive lessonId from the URL path if not explicitly provided
        const location = useLocation()
        const resolvedLessonId = lessonId !== 'unknown'
            ? lessonId
            : location.pathname.replace(/^\//, '').replace(/\//g, '-') || 'unknown'

        /* ── Chat state ───────────────────────────────────────── */
        const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
        const chatIdCounter = useRef(0)

        const addChatMessage = useCallback((role: 'tutor' | 'student', text: string) => {
            chatIdCounter.current += 1
            setChatMessages(prev => [...prev, {
                id: String(chatIdCounter.current),
                role,
                text,
                timestamp: Date.now(),
            }])
        }, [])

        /* ── Adaptive agent: annotations + swap overlay state ── */
        const [annotations, setAnnotations] = useState<Annotation[]>([])
        const [swapOverlay, setSwapOverlay] = useState<{ target: string; speech?: string } | null>(null)
        const clearAnnotations = useCallback(() => setAnnotations([]), [])
        const dismissSwapOverlay = useCallback(() => setSwapOverlay(null), [])

        /* ── Playbook registry + sequence player ─────────────── */
        const playbookMap = useMemo(() => {
            const map = new Map<string, TeachingPlaybook>()
            playbooks?.forEach(pb => map.set(pb.id, pb))
            return map
        }, [playbooks])

        const sequenceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
        /** Bumped in stopSequence so in-flight async playbook runs exit cleanly */
        const sequenceRunId = useRef(0)
        /** Pause after each step (before the next) when the next step has delay 0 */
        const DEFAULT_STEP_GAP_MS = 400

        const stopSequence = useCallback(() => {
            sequenceRunId.current += 1
            if (sequenceTimer.current) {
                clearTimeout(sequenceTimer.current)
                sequenceTimer.current = null
            }
        }, [])

        const playSequence = useCallback((steps: AnnotationStep[]) => {
            stopSequence()
            const runId = sequenceRunId.current
            const run = async () => {
                for (let i = 0; i < steps.length; i++) {
                    if (sequenceRunId.current !== runId) return
                    const step = steps[i]
                    setAnnotations(step.annotations)
                    if (step.speech) {
                        await voice.speakInstruction(step.speech)
                    }
                    if (sequenceRunId.current !== runId) return
                    if (i < steps.length - 1) {
                        const nextStep = steps[i + 1]
                        const gapMs = nextStep.delay > 0 ? nextStep.delay : DEFAULT_STEP_GAP_MS
                        await new Promise<void>((resolve) => {
                            sequenceTimer.current = window.setTimeout(() => {
                                sequenceTimer.current = null
                                resolve()
                            }, gapMs)
                        })
                    }
                }
                if (sequenceRunId.current !== runId) return
                sequenceTimer.current = window.setTimeout(() => {
                    setAnnotations([])
                    sequenceTimer.current = null
                }, 2500)
            }
            void run()
        }, [stopSequence, voice])

        useEffect(() => stopSequence, [stopSequence])

        const fullLessonContext = useMemo((): LessonContext | undefined => {
            if (!lessonContextProp) return undefined
            return {
                ...lessonContextProp,
                availableStrategies: playbooks?.map(p => p.id) ?? [],
            } as LessonContext
        }, [lessonContextProp, playbooks])

        /* ── Visual command handler ──────────────────────────── */
        const handleVisualCommand = useCallback((cmd: VisualCommand) => {
            if (cmd.type === 'teach' && cmd.strategy) {
                const pb = playbookMap.get(cmd.strategy)
                if (pb) {
                    const steps = pb.generate()
                    if (steps.length) {
                        void (async () => {
                            await voice.waitUntilSpeechIdle()
                            if (cmd.speech) {
                                await voice.speakInstruction(cmd.speech)
                            }
                            playSequence(steps)
                        })()
                        return
                    }
                }
            }

            if (cmd.type === 'annotate' && cmd.actions?.length) {
                setAnnotations(cmd.actions)
            } else if (cmd.type === 'swap' && cmd.target) {
                if (onSwapView) {
                    onSwapView(cmd.target)
                } else {
                    setSwapOverlay({ target: cmd.target, speech: cmd.speech })
                }
            }
            if (cmd.speech) {
                voice.speakInstruction(cmd.speech)
            }
        }, [onSwapView, voice, playbookMap, playSequence])

        const handleSttResult = useCallback((text: string) => {
            addChatMessage('student', text)
        }, [addChatMessage])

        const handleTutorReply = useCallback((text: string) => {
            addChatMessage('tutor', text)
            voice.speakInstruction(text)
        }, [addChatMessage, voice])

        const handleBargeIn = useCallback(() => {
            voice.cancelSpeaking()
        }, [voice])

        const handleSendChat = useCallback((text: string) => {
            addChatMessage('student', text)
            sendChatRef.current(text)
        }, [addChatMessage])

        const sendChatRef = useRef<(text: string) => void>(() => {})

        /* ── Agent WebSocket ─────────────────────────────────── */
        const { sendSnapshot, sendChat, sendSttMuted, connected: agentConnected } = useAgentSocket({
            onCommand: handleVisualCommand,
            onSttResult: handleSttResult,
            onTutorReply: handleTutorReply,
            onBargeIn: handleBargeIn,
        })

        sendChatRef.current = sendChat

        /* ── Telemetry collector ─────────────────────────────── */
        useTelemetry({
            lessonId: resolvedLessonId,
            problemIndex,
            intervalMs: 3_000,
            onSnapshot: sendSnapshot,
            lessonContext: fullLessonContext,
        })

        // Speak instruction on mount — fast 200ms delay
        useEffect(() => {
            if (voiceConfig?.instruction && !hasSpokenInstruction.current) {
                hasSpokenInstruction.current = true
                const t = setTimeout(() => voice.speakInstruction(voiceConfig.instruction), 200)
                return () => clearTimeout(t)
            }
        }, [voiceConfig?.instruction, voice.speakInstruction])

        // Pre-cache feedback audio on mount for instant responses
        useEffect(() => {
            const textsToCache = [...PRECACHE_MESSAGES]
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
                    <TutorPanel
                        voice={voice}
                        chatMessages={chatMessages}
                        onSendChat={handleSendChat}
                        agentConnected={agentConnected}
                        sendSttMuted={sendSttMuted}
                    />
                </div>

                {/* Right panel — 75% */}
                <div className="flex-1 h-full">
                    <LessonCanvas
                        total={total}
                        attempted={attempted}
                        correct={correct}
                        points={sessionPoints}
                        streak={streak}
                        annotations={annotations}
                        onAnnotationsClear={clearAnnotations}
                        agentConnected={agentConnected}
                        swapOverlay={swapOverlay}
                        onDismissSwapOverlay={dismissSwapOverlay}
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
                            className="absolute bottom-0 left-[25%] right-0 bg-black/60 backdrop-blur-md py-3 px-8 text-center"
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
