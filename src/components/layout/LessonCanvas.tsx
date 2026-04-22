import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ProgressBar } from '../shared/ProgressBar'
import { ScoreDisplay } from '../shared/ScoreDisplay'
import { AnnotationOverlay } from './AnnotationOverlay'
import type { Annotation } from '../../types/visualCommand'

/* ── Swap overlay content per target ──────────────────────── */
const SWAP_CARDS: Record<string, { icon: string; title: string; body: string }> = {
    worked_example: {
        icon: '📝',
        title: 'Let me show you!',
        body: 'Watch how a similar problem is solved step by step, then try again.',
    },
    simplified_view: {
        icon: '🧩',
        title: "Let's simplify!",
        body: "That was tricky — here's an easier way to think about it.",
    },
    challenge_view: {
        icon: '🚀',
        title: "You're on fire!",
        body: "You're breezing through — keep up the amazing work!",
    },
}
const DEFAULT_CARD = { icon: '💡', title: 'Quick tip!', body: 'Take a moment and think about what the question is really asking.' }

interface LessonCanvasProps {
    children: React.ReactNode
    total: number
    attempted: number
    correct: number
    points: number
    streak: number
    annotations?: Annotation[]
    onAnnotationsClear?: () => void
    agentConnected?: boolean
    /** Universal swap overlay (shown when the lesson has no custom onSwapView) */
    swapOverlay?: { target: string; speech?: string } | null
    onDismissSwapOverlay?: () => void
}

export const LessonCanvas: React.FC<LessonCanvasProps> = ({
    children, total, attempted, correct, points, streak,
    annotations = [], onAnnotationsClear, agentConnected,
    swapOverlay, onDismissSwapOverlay,
}) => {
    const card = swapOverlay ? (SWAP_CARDS[swapOverlay.target] ?? DEFAULT_CARD) : null

    return (
        <div className="flex flex-col h-full gap-3 p-4">
            {/* Top bar: progress + score + agent indicator */}
            <div className="flex items-center gap-4">
                <div className="flex-1">
                    <ProgressBar total={total} attempted={attempted} correct={correct} />
                </div>
                <ScoreDisplay points={points} streak={streak} />
                {agentConnected !== undefined && (
                    <div className="flex items-center gap-1.5" title={agentConnected ? 'Agent connected' : 'Agent offline'}>
                        <div className={`w-2 h-2 rounded-full ${agentConnected ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]' : 'bg-white/20'}`} />
                        <span className="text-[10px] font-display text-white/40">AI</span>
                    </div>
                )}
            </div>
            {/* Lesson content + overlays */}
            <div className="flex-1 relative overflow-hidden rounded-2xl" data-lesson-canvas data-lesson-focus data-hint-region>
                {children}
                <AnnotationOverlay annotations={annotations} onClear={onAnnotationsClear} />

                {/* Universal swap overlay card */}
                <AnimatePresence>
                    {card && (
                        <motion.div
                            key={swapOverlay!.target}
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                        >
                            <div className="flex flex-col items-center gap-4 bg-white/10 border border-white/15 rounded-3xl p-8 max-w-sm text-center shadow-2xl">
                                <span className="text-5xl">{card.icon}</span>
                                <h3 className="text-white font-display font-black text-xl">{card.title}</h3>
                                <p className="text-white/70 font-display text-sm leading-relaxed">{card.body}</p>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={onDismissSwapOverlay}
                                    className="mt-2 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-display font-bold text-sm transition-colors"
                                >
                                    Got it — let me try!
                                </motion.button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
