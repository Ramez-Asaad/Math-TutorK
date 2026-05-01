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

interface Round { given: number } // already in frame; need (10-given) more
const ROUNDS: Round[] = [
    { given: 7 }, { given: 3 }, { given: 6 }, { given: 8 }, { given: 4 },
    { given: 1 }, { given: 9 }, { given: 5 }, { given: 2 }, { given: 0 },
]

export const MakingTen = () => {
    const navigate = useNavigate()
    const { addCorrect, sessionPoints, correctCount, wrongCount, reset } = useScoreStore()
    const { completeLesson, addPoints } = useProgressStore()
    const [roundIdx, setRoundIdx] = useState(0)
    const [isSimplified, setIsSimplified] = useState(false)
    const [added, setAdded] = useState(0)
    const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none')
    const [showComplete, setShowComplete] = useState(false)
    const [confetti, setConfetti] = useState(false)

    const handleSwapView = useCallback((target: string) => {
        if (target === 'simplified_view') setIsSimplified(true)
    }, [])

    const round = ROUNDS[roundIdx]
    const needed = 10 - round.given
    const total = round.given + added
    const attempted = correctCount + wrongCount

    const handleDotClick = useCallback(() => {
        if (added >= needed || feedback !== 'none') return
        const next = added + 1
        setAdded(next)

        if (next === needed) {
            addCorrect(10)
            setFeedback('correct')
            setConfetti(true)
            setTimeout(() => {
                setConfetti(false)
                setFeedback('none')
                setAdded(0)
                const nextR = roundIdx + 1
                if (nextR >= ROUNDS.length) {
                    const stars = wrongCount === 0 ? 3 : wrongCount <= 2 ? 2 : 1
                    completeLesson('addition', 'making-ten', stars, sessionPoints + 10)
                    addPoints(sessionPoints)
                    setShowComplete(true)
                } else {
                    setRoundIdx(nextR)
                }
            }, 900)
        }
    }, [added, needed, feedback, roundIdx, wrongCount, sessionPoints, addCorrect, completeLesson, addPoints])

    const handleRetry = () => {
        reset(); setRoundIdx(0); setAdded(0); setFeedback('none'); setShowComplete(false); setIsSimplified(false)
    }

    const playbooks = useMemo<TeachingPlaybook[]>(() => [
        {
            id: 'making_ten_fill_empty',
            description: 'Point to the equation goal then empty cells in the ten-frame to tap',
            generate: () => {
                const firstClickable = round.given + added
                return [
                    {
                        delay: 0,
                        annotations: [
                            { action: 'pulse', element: '[data-hint-region="equation"]', color: '#fbbf24' },
                            { action: 'label', element: '[data-hint-region="equation"]', label: `${round.given} + ? = 10`, color: '#fbbf24' },
                        ],
                        speech: `We need ten in the frame. You already have ${round.given}.`,
                    },
                    {
                        delay: 1200,
                        annotations: firstClickable < 10
                            ? [
                                { action: 'circle', element: `[data-tf-slot="${firstClickable}"]`, color: '#34d399' },
                                { action: 'label', element: '[data-hint-region="frame"]', label: 'Tap empty cells', color: '#34d399' },
                            ]
                            : [{ action: 'pulse', element: '[data-hint-region="frame"]', color: '#34d399' }],
                        speech: needed - added > 0
                            ? `Click ${needed - added} more empty spot${needed - added === 1 ? '' : 's'} — each adds one.`
                            : 'Nice — the frame is full!',
                    },
                ]
            },
        },
        {
            id: 'making_ten_read_colors',
            description: 'Relate blue “given” dots to amber “added” using the legend',
            generate: () => [
                {
                    delay: 0,
                    annotations: [
                        { action: 'pulse', element: '[data-hint-region="legend-given"]', color: '#3b82f6' },
                        { action: 'label', element: '[data-hint-region="legend-given"]', label: `Given ${round.given}`, color: '#3b82f6' },
                    ],
                    speech: `The blue cells show the ${round.given} you start with.`,
                },
                {
                    delay: 1200,
                    annotations: [
                        { action: 'pulse', element: '[data-hint-region="legend-added"]', color: '#f59e0b' },
                        { action: 'label', element: '[data-hint-region="legend-added"]', label: `Added ${added}`, color: '#f59e0b' },
                    ],
                    speech: `Amber is what you add. Together they should fill all ten cells.`,
                },
            ],
        },
    ], [round.given, added, needed])

    const lessonContext = useMemo(() => ({
        type: 'making_ten' as const,
        operands: [round.given, needed],
        answer: 10,
        itemCount: 10,
    }), [round.given, needed])

    return (
        <LessonShell
            lessonId="making-ten"
            voiceConfig={VOICE_CONFIGS["making-ten"]}
            feedback={feedback}
            problemIndex={roundIdx} total={ROUNDS.length} attempted={attempted} correct={correctCount}
            accentClass="bg-emerald-600" subtitle={`${round.given} + ? = 10 — fill the frame!`}
            playbooks={playbooks}
            lessonContext={lessonContext}
            onSwapView={handleSwapView}>
            <LessonComplete show={showComplete} stars={wrongCount === 0 ? 3 : wrongCount <= 2 ? 2 : 1}
                points={sessionPoints} onRetry={handleRetry} onNext={() => navigate('/')} />
            <Confetti active={confetti} />

            <div className="h-full flex flex-col items-center justify-center gap-8 p-6">
                {/* Equation */}
                <motion.div
                    data-hint-region="equation"
                    animate={feedback === 'correct' ? { color: '#10b981' } : { color: '#ffffff' }}
                    className="font-black font-display text-5xl"
                >
                    {round.given} + <span className="text-amber-400">{added}</span> = <span className={total === 10 ? 'text-emerald-400' : 'text-white/80'}>{total}</span>
                </motion.div>

                {/* Ten frame */}
                <motion.div
                    data-hint-region="frame"
                    animate={feedback === 'correct' ? { borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)' }
                        : { borderColor: 'rgba(255,255,255,0.2)' }}
                    className="grid grid-cols-5 gap-2 border-2 rounded-2xl p-4"
                >
                    {Array.from({ length: 10 }, (_, i) => {
                        const isGiven = i < round.given
                        const isAdded = i >= round.given && i < round.given + added
                        const isNeeded = i >= round.given + added && i < 10
                        return (
                            <motion.div
                                key={i}
                                data-tf-slot={i}
                                onClick={!isGiven && !isAdded ? handleDotClick : undefined}
                                whileHover={!isGiven && !isAdded ? { scale: 1.05 } : {}}
                                className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center cursor-pointer transition-all
                  ${isGiven ? 'bg-blue-500 border-blue-400' :
                                        isAdded ? 'bg-amber-500 border-amber-400' :
                                            isSimplified ? 'bg-white/5 border-dashed border-amber-400/30 hover:border-amber-400/50' :
                                            'bg-white/5 border-white/20 hover:border-white/50'}`}
                            >
                                {(isGiven || isAdded) && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1, y: isSimplified ? 0 : [0, -4, 0] }}
                                        transition={{
                                            scale: { type: 'spring', stiffness: 300, damping: 20 },
                                            y: isSimplified ? {} : { duration: 2, repeat: Infinity, ease: 'easeInOut' },
                                        }}
                                        className="w-7 h-7 rounded-full bg-white/80"
                                    />
                                )}
                                {isSimplified && isNeeded && (
                                    <div className="w-5 h-5 rounded-full border-2 border-dashed border-amber-400/20" />
                                )}
                            </motion.div>
                        )
                    })}
                </motion.div>

                <div className="text-white/50 font-display text-sm">
                    {needed - added > 0
                        ? `Click ${needed - added} more empty cell${needed - added === 1 ? '' : 's'}`
                        : '🎉 You made 10!'}
                </div>

                {/* Legend */}
                <div className="flex gap-6 text-sm font-display">
                    <span data-hint-region="legend-given" className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-blue-500" /> Given ({round.given})</span>
                    <span data-hint-region="legend-added" className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-amber-500" /> Added ({added})</span>
                </div>
            </div>
        </LessonShell>
    )
}
