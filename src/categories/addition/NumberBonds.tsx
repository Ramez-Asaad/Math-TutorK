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

interface Round { total: number }
const ROUNDS: Round[] = [
    { total: 5 }, { total: 8 }, { total: 10 }, { total: 7 },
    { total: 12 }, { total: 9 }, { total: 6 }, { total: 15 },
    { total: 11 }, { total: 13 },
]

export const NumberBonds = () => {
    const navigate = useNavigate()
    const { addCorrect, sessionPoints, correctCount, wrongCount, reset } = useScoreStore()
    const { completeLesson, addPoints } = useProgressStore()

    const [roundIdx, setRoundIdx] = useState(0)
    const [split, setSplit] = useState(0) // left part; right = total - split
    const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none')
    const [showComplete, setShowComplete] = useState(false)
    const [confetti, setConfetti] = useState(false)
    const [, setLocked] = useState<{ left: number; right: number } | null>(null)

    const round = ROUNDS[roundIdx]
    const left = split
    const right = round.total - split
    const attempted = correctCount + wrongCount

    const handleCheck = useCallback(() => {
        if (feedback !== 'none' || left <= 0 || right <= 0) return
        // Any valid split where both parts > 0 is correct
        addCorrect(10)
        setFeedback('correct')
        setLocked({ left, right })
        setConfetti(true)
        setTimeout(() => {
            setConfetti(false)
            setFeedback('none')
            setLocked(null)
            setSplit(0)
            const next = roundIdx + 1
            if (next >= ROUNDS.length) {
                const stars = wrongCount === 0 ? 3 : wrongCount <= 3 ? 2 : 1
                completeLesson('addition', 'number-bonds', stars, sessionPoints + 10)
                addPoints(sessionPoints)
                setShowComplete(true)
            } else {
                setRoundIdx(next)
            }
        }, 900)
    }, [feedback, left, right, roundIdx, wrongCount, sessionPoints, addCorrect, completeLesson, addPoints])

    const handleRetry = () => {
        reset(); setRoundIdx(0); setSplit(0); setFeedback('none'); setLocked(null); setShowComplete(false)
    }

    const playbooks = useMemo<TeachingPlaybook[]>(() => [
        {
            id: 'bonds_total_first',
            description: 'Start from the whole at the top, then show the two parts below',
            generate: () => [
                {
                    delay: 0,
                    annotations: [
                        { action: 'pulse', element: '[data-hint-region="bond-total"]', color: '#fbbf24' },
                        { action: 'label', element: '[data-hint-region="bond-total"]', label: `Whole ${round.total}`, color: '#fbbf24' },
                    ],
                    speech: `The number at the top is the whole: ${round.total}.`,
                },
                {
                    delay: 1200,
                    annotations: [
                        { action: 'circle', element: '[data-hint-region="bond-left"]', color: '#34d399' },
                        { action: 'circle', element: '[data-hint-region="bond-right"]', color: '#60a5fa' },
                    ],
                    speech: `Slide the bar to split it into two parts that add up to ${round.total}.`,
                },
            ],
        },
        {
            id: 'bonds_slider_equation',
            description: 'Connect the range slider to the number sentence at the bottom',
            generate: () => [
                {
                    delay: 0,
                    annotations: [
                        { action: 'pulse', element: '[data-hint-region="bond-slider"]', color: '#f59e0b' },
                        { action: 'label', element: '[data-hint-region="bond-slider"]', label: 'Drag', color: '#f59e0b' },
                    ],
                    speech: 'Moving the slider changes both parts at once.',
                },
                {
                    delay: 1200,
                    annotations: [
                        { action: 'pulse', element: '[data-hint-region="bond-sentence"]', color: '#a78bfa' },
                        { action: 'label', element: '[data-hint-region="bond-sentence"]', label: `${left} + ${right} = ${round.total}`, color: '#a78bfa' },
                    ],
                    speech: `Check the sentence: ${left} plus ${right} equals ${round.total}. Press check when both parts are positive.`,
                },
            ],
        },
    ], [round.total, left, right])

    const lessonContext = useMemo(() => ({
        type: 'number_bonds' as const,
        operands: [left, right],
        answer: round.total,
        itemCount: round.total,
    }), [left, right, round.total])

    return (
        <LessonShell
            lessonId="number-bonds"
            voiceConfig={VOICE_CONFIGS["number-bonds"]}
            feedback={feedback}
            problemIndex={roundIdx} total={ROUNDS.length} attempted={attempted} correct={correctCount}
            accentClass="bg-emerald-600" subtitle={`Split ${round.total} into two parts!`}
            playbooks={playbooks}
            lessonContext={lessonContext}>
            <LessonComplete show={showComplete} stars={wrongCount === 0 ? 3 : wrongCount <= 3 ? 2 : 1}
                points={sessionPoints} onRetry={handleRetry} onNext={() => navigate('/')} />
            <Confetti active={confetti} />

            <div className="h-full flex flex-col items-center justify-center gap-8 p-6">
                {/* Bond diagram */}
                <div className="relative flex flex-col items-center gap-4">
                    {/* Total circle */}
                    <motion.div
                        data-hint-region="bond-total"
                        animate={{ scale: [1, 1.04, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-24 h-24 rounded-full bg-amber-500 flex items-center justify-center shadow-2xl border-4 border-amber-300"
                    >
                        <span className="text-white font-black font-display text-4xl">{round.total}</span>
                    </motion.div>

                    {/* Lines */}
                    <svg width="200" height="50" className="overflow-visible">
                        <line x1="100" y1="0" x2="30" y2="50" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                        <line x1="100" y1="0" x2="170" y2="50" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                    </svg>

                    {/* Two parts */}
                    <div className="flex gap-16">
                        <motion.div
                            data-hint-region="bond-left"
                            animate={feedback === 'correct'
                                ? { backgroundColor: '#10b981', borderColor: '#10b981', y: 0 }
                                : { y: [0, -4, 0] }}
                            transition={feedback === 'correct'
                                ? { type: 'spring', stiffness: 300, damping: 20 }
                                : { duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                            className="w-20 h-20 rounded-full bg-emerald-700 border-4 border-emerald-400 flex items-center justify-center shadow-xl"
                        >
                            <span className="text-white font-black font-display text-3xl">{left || '?'}</span>
                        </motion.div>
                        <motion.div
                            data-hint-region="bond-right"
                            animate={feedback === 'correct'
                                ? { backgroundColor: '#10b981', borderColor: '#10b981', y: 0 }
                                : { y: [0, -4, 0] }}
                            transition={feedback === 'correct'
                                ? { type: 'spring', stiffness: 300, damping: 20 }
                                : { duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                            className="w-20 h-20 rounded-full bg-blue-700 border-4 border-blue-400 flex items-center justify-center shadow-xl"
                        >
                            <span className="text-white font-black font-display text-3xl">{right || '?'}</span>
                        </motion.div>
                    </div>
                </div>

                {/* Slider */}
                <div className="w-full max-w-md flex flex-col items-center gap-4">
                    <div className="text-white/60 font-display text-sm">Drag to split</div>
                    <input
                        data-hint-region="bond-slider"
                        type="range"
                        min={1}
                        max={round.total - 1}
                        value={split || 1}
                        onChange={e => setSplit(parseInt(e.target.value))}
                        className="w-full accent-amber-400 h-3 cursor-pointer"
                    />
                    <div className="flex justify-between w-full text-white/40 font-display text-xs">
                        <span>1</span><span>{round.total - 1}</span>
                    </div>
                </div>

                {/* Number sentence */}
                <motion.div
                    data-hint-region="bond-sentence"
                    animate={feedback === 'correct' ? { color: '#10b981', scale: 1.05, x: 0 } : feedback === 'wrong' ? { x: [0, -8, 8, -6, 6, -4, 4, 0] } : { x: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="font-black font-display text-4xl text-white"
                >
                    {left} + {right} = {round.total}
                </motion.div>

                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={handleCheck}
                    disabled={left <= 0 || right <= 0}
                    className="px-10 py-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 rounded-2xl text-white font-bold font-display text-xl">
                    That's it! ✓
                </motion.button>
            </div>
        </LessonShell>
    )
}
