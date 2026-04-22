import { useState, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { LessonShell } from '../../components/layout/LessonShell'
import { VOICE_CONFIGS } from '../../utils/lessonVoiceConfigs'
import { LessonComplete } from '../../components/shared/LessonComplete'
import { Confetti } from '../../components/shared/Confetti'
import { useScoreStore } from '../../store/useScoreStore'
import { useProgressStore } from '../../store/useProgressStore'
import type { TeachingPlaybook } from '../../types/visualCommand'

interface Round { filled: number; remove: number }
const ROUNDS: Round[] = [
    { filled: 8, remove: 3 }, { filled: 10, remove: 6 }, { filled: 7, remove: 4 },
    { filled: 9, remove: 5 }, { filled: 10, remove: 7 }, { filled: 8, remove: 8 },
    { filled: 10, remove: 2 }, { filled: 9, remove: 9 }, { filled: 10, remove: 1 },
    { filled: 10, remove: 10 },
]

export const TenFrame = () => {
    const navigate = useNavigate()
    const { addCorrect, sessionPoints, correctCount, wrongCount, reset } = useScoreStore()
    const { completeLesson, addPoints } = useProgressStore()

    const [roundIdx, setRoundIdx] = useState(0)
    const [removed, setRemoved] = useState<Set<number>>(new Set())
    const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none')
    const [showComplete, setShowComplete] = useState(false)
    const [confetti, setConfetti] = useState(false)

    const round = ROUNDS[roundIdx]
    const attempted = correctCount + wrongCount

    const handleDotClick = useCallback((i: number) => {
        if (removed.has(i) || i >= round.filled || feedback !== 'none') return
        if (removed.size >= round.remove) return

        const newRemoved = new Set(removed)
        newRemoved.add(i)
        setRemoved(newRemoved)

        if (newRemoved.size === round.remove) {
            addCorrect(10)
            setFeedback('correct')
            setConfetti(true)
            setTimeout(() => {
                setConfetti(false)
                setFeedback('none')
                setRemoved(new Set())
                const next = roundIdx + 1
                if (next >= ROUNDS.length) {
                    const stars = wrongCount === 0 ? 3 : wrongCount <= 3 ? 2 : 1
                    completeLesson('subtraction', 'ten-frame', stars, sessionPoints + 10)
                    addPoints(sessionPoints)
                    setShowComplete(true)
                } else {
                    setRoundIdx(next)
                }
            }, 900)
        }
    }, [removed, round, feedback, roundIdx, wrongCount, sessionPoints, addCorrect, completeLesson, addPoints])

    const handleRetry = () => {
        reset(); setRoundIdx(0); setRemoved(new Set()); setFeedback('none'); setShowComplete(false)
    }

    const remaining = round.filled - removed.size

    const playbooks = useMemo<TeachingPlaybook[]>(() => [
        {
            id: 'ten_frame_sub_meaning',
            description: 'Relate “take away” to tapping filled cells in the frame',
            generate: () => [
                {
                    delay: 0,
                    annotations: [
                        { action: 'pulse', element: '[data-hint-region="sub-equation"]', color: '#fbbf24' },
                        { action: 'label', element: '[data-hint-region="sub-equation"]', label: `${round.filled} − ${round.remove}`, color: '#fbbf24' },
                    ],
                    speech: `Start with ${round.filled} in the frame. You will remove ${round.remove}.`,
                },
                {
                    delay: 1200,
                    annotations: [
                        { action: 'pulse', element: '[data-hint-region="ten-frame-grid"]', color: '#fb923c' },
                        { action: 'label', element: '[data-hint-region="ten-frame-grid"]', label: 'Tap orange dots', color: '#fb923c' },
                    ],
                    speech: `Tap ${round.remove} filled cells — each click takes one away.`,
                },
            ],
        },
        {
            id: 'ten_frame_sub_remaining',
            description: 'Connect taps left to the running total in the equation',
            generate: () => [
                {
                    delay: 0,
                    annotations: [
                        { action: 'circle', element: '[data-hint-region="sub-equation"]', color: '#34d399' },
                    ],
                    speech: `After removing, you should see ${remaining} left in the frame and in the answer.`,
                },
            ],
        },
    ], [round.filled, round.remove, remaining])

    const lessonContext = useMemo(() => ({
        type: 'ten_frame_sub' as const,
        operands: [round.filled, round.remove],
        answer: round.filled - round.remove,
        itemCount: round.filled,
    }), [round.filled, round.remove])

    return (
        <LessonShell
            lessonId="ten-frame"
            voiceConfig={VOICE_CONFIGS["ten-frame"]}
            feedback={feedback}
            problemIndex={roundIdx} total={ROUNDS.length} attempted={attempted} correct={correctCount}
            accentClass="bg-orange-600" subtitle={`${round.filled} − ${round.remove} — click to remove!`}
            playbooks={playbooks}
            lessonContext={lessonContext}>
            <LessonComplete show={showComplete} stars={wrongCount === 0 ? 3 : wrongCount <= 3 ? 2 : 1}
                points={sessionPoints} onRetry={handleRetry} onNext={() => navigate('/')} />
            <Confetti active={confetti} />

            <div className="h-full flex flex-col items-center justify-center gap-8 p-6">
                <motion.div data-hint-region="sub-equation" animate={feedback === 'correct' ? { color: '#10b981' } : {}}
                    className="font-black font-display text-5xl text-white">
                    {round.filled} − {round.remove} = <span className="text-orange-400">{remaining}</span>
                </motion.div>

                {/* Ten frame */}
                <motion.div
                    data-hint-region="ten-frame-grid"
                    animate={feedback === 'correct' ? { borderColor: '#10b981' } : feedback === 'wrong' ? { x: [0, -8, 8, 0] } : {}}
                    className="grid grid-cols-5 gap-2 border-2 border-white/20 rounded-2xl p-4"
                >
                    {Array.from({ length: 10 }, (_, i) => {
                        const isFilled = i < round.filled
                        const isRemoved = removed.has(i)
                        const canRemove = isFilled && !isRemoved && removed.size < round.remove
                        return (
                            <motion.div
                                key={i}
                                onClick={() => handleDotClick(i)}
                                whileHover={canRemove ? { scale: 1.2, rotate: 10 } : {}}
                                whileTap={canRemove ? { scale: 0.8 } : {}}
                                animate={isRemoved ? { scale: 0.3, opacity: 0.2 } : { scale: 1, opacity: 1 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                                className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all
                  ${!isFilled ? 'bg-white/5 border-white/15 cursor-default' :
                                        isRemoved ? 'bg-red-900/20 border-red-500/20 cursor-default' :
                                            'bg-orange-500 border-orange-400 cursor-pointer hover:bg-orange-400'}`}
                            >
                                {isFilled && !isRemoved && (
                                    <div className="w-7 h-7 rounded-full bg-white/80" />
                                )}
                                {isRemoved && (
                                    <span className="text-red-500 text-xl">✕</span>
                                )}
                            </motion.div>
                        )
                    })}
                </motion.div>

                <div className="flex gap-4 text-sm font-display">
                    <span className="text-orange-400">Remove {round.remove - removed.size} more</span>
                    <span className="text-white/40">|</span>
                    <span className="text-white/60">Remaining: {remaining}</span>
                </div>
            </div>
        </LessonShell>
    )
}
