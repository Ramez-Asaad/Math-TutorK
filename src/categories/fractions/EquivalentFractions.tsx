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

interface Round { fractions: [number, number][]; equivalentIdx: number }
// Each round: given first fraction, pick the equivalent one from choices
const ROUNDS: Round[] = [
    { fractions: [[1, 2], [2, 4], [1, 3], [3, 6]], equivalentIdx: 1 }, // 1/2 = 2/4
    { fractions: [[1, 3], [2, 6], [2, 4], [3, 9]], equivalentIdx: 1 }, // 1/3 = 2/6
    { fractions: [[2, 3], [4, 6], [3, 6], [4, 8]], equivalentIdx: 1 }, // 2/3 = 4/6
    { fractions: [[1, 4], [2, 8], [3, 8], [2, 6]], equivalentIdx: 1 }, // 1/4 = 2/8
    { fractions: [[3, 4], [6, 8], [4, 8], [9, 12]], equivalentIdx: 1 }, // 3/4 = 6/8
    { fractions: [[2, 5], [4, 10], [3, 10], [6, 15]], equivalentIdx: 1 }, // 2/5 = 4/10
    { fractions: [[1, 2], [3, 6], [4, 6], [5, 8]], equivalentIdx: 1 }, // 1/2 = 3/6
    { fractions: [[3, 5], [6, 10], [4, 10], [9, 15]], equivalentIdx: 1 }, // 3/5 = 6/10
    { fractions: [[5, 6], [10, 12], [8, 12], [15, 18]], equivalentIdx: 1 }, // 5/6 = 10/12
    { fractions: [[4, 5], [8, 10], [6, 10], [12, 15]], equivalentIdx: 1 }, // 4/5 = 8/10
]

function FractionPie({ num, den, color }: { num: number; den: number; color: string }) {
    const size = 80
    const cx = size / 2, cy = size / 2, r = 34
    const slices = Array.from({ length: den }, (_, i) => {
        const startAngle = (i / den) * 2 * Math.PI - Math.PI / 2
        const endAngle = ((i + 1) / den) * 2 * Math.PI - Math.PI / 2
        const x1 = cx + r * Math.cos(startAngle)
        const y1 = cy + r * Math.sin(startAngle)
        const x2 = cx + r * Math.cos(endAngle)
        const y2 = cy + r * Math.sin(endAngle)
        const large = 1 / den > 0.5 ? 1 : 0
        return { x1, y1, x2, y2, large, filled: i < num }
    })
    return (
        <div className="flex flex-col items-center gap-1">
            <svg width={size} height={size}>
                <circle cx={cx} cy={cy} r={r} fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                {slices.map((s, i) => (
                    <path key={i}
                        d={`M ${cx} ${cy} L ${s.x1} ${s.y1} A ${r} ${r} 0 ${s.large} 1 ${s.x2} ${s.y2} Z`}
                        fill={s.filled ? color : 'transparent'}
                        stroke="rgba(255,255,255,0.2)" strokeWidth="1"
                    />
                ))}
            </svg>
            <span className="font-bold font-display text-sm" style={{ color }}>{num}/{den}</span>
        </div>
    )
}

export const EquivalentFractions = () => {
    const navigate = useNavigate()
    const { addCorrect, addWrong, sessionPoints, correctCount, wrongCount, reset } = useScoreStore()
    const { completeLesson, addPoints } = useProgressStore()

    const [roundIdx, setRoundIdx] = useState(0)
    const [isSimplified, setIsSimplified] = useState(false)
    const [chosen, setChosen] = useState<number | null>(null)
    const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none')
    const [showComplete, setShowComplete] = useState(false)
    const [confetti, setConfetti] = useState(false)

    const handleSwapView = useCallback((target: string) => {
        if (target === 'simplified_view') setIsSimplified(true)
    }, [])

    const round = ROUNDS[roundIdx]
    const given = round.fractions[0]
    const choices = round.fractions.slice(1)
    const attempted = correctCount + wrongCount

    const handleChoice = useCallback((idx: number) => {
        if (feedback !== 'none') return
        setChosen(idx)
        if (idx === round.equivalentIdx - 1) {
            addCorrect(15)
            setFeedback('correct')
            setConfetti(true)
            setTimeout(() => {
                setConfetti(false)
                setFeedback('none')
                setChosen(null)
                const next = roundIdx + 1
                if (next >= ROUNDS.length) {
                    const stars = wrongCount === 0 ? 3 : wrongCount <= 3 ? 2 : 1
                    completeLesson('fractions', 'equivalent', stars, sessionPoints + 15)
                    addPoints(sessionPoints)
                    setShowComplete(true)
                } else {
                    setRoundIdx(next)
                }
            }, 900)
        } else {
            addWrong()
            setFeedback('wrong')
            setTimeout(() => { setChosen(null); setFeedback('none') }, 700)
        }
    }, [feedback, round, roundIdx, wrongCount, sessionPoints, addCorrect, addWrong, completeLesson, addPoints])

    const handleRetry = () => {
        reset(); setRoundIdx(0); setChosen(null); setFeedback('none'); setShowComplete(false); setIsSimplified(false)
    }

    const COLORS = ['#60a5fa', '#f472b6', '#4ade80', '#fb923c']

    const playbooks = useMemo<TeachingPlaybook[]>(() => [
        {
            id: 'equiv_compare_pies',
            description: 'Compare the shaded slices of the given circle to the answer choices',
            generate: () => [
                {
                    delay: 0,
                    annotations: [
                        { action: 'pulse', element: '[data-hint-region="equiv-given"]', color: '#60a5fa' },
                        { action: 'label', element: '[data-hint-region="equiv-given"]', label: `${given[0]}/${given[1]}`, color: '#60a5fa' },
                    ],
                    speech: `This is ${given[0]} out of ${given[1]} equal parts shaded.`,
                },
                {
                    delay: 1200,
                    annotations: [
                        { action: 'pulse', element: '[data-hint-region="equiv-choices"]', color: '#f472b6' },
                    ],
                    speech: 'Pick the picture that covers the same amount — an equivalent fraction.',
                },
            ],
        },
        {
            id: 'equiv_same_amount',
            description: 'Think “same size, different slice count” — numerator and denominator scale together',
            generate: () => [
                {
                    delay: 0,
                    annotations: [
                        { action: 'circle', element: '[data-hint-region="equiv-choices"]', color: '#34d399' },
                    ],
                    speech: 'If you double both top and bottom, the value stays the same. Find that match.',
                },
            ],
        },
    ], [given])

    const lessonContext = useMemo(() => {
        const eq = round.fractions[round.equivalentIdx]
        return {
            type: 'equivalent_fractions' as const,
            operands: [given[0], given[1]],
            answer: eq ? eq[0] / eq[1] : 0,
            itemCount: given[1],
        }
    }, [round, given])

    return (
        <LessonShell
            lessonId="equivalent-fractions"
            voiceConfig={VOICE_CONFIGS["equivalent"]}
            feedback={feedback}
            problemIndex={roundIdx} total={ROUNDS.length} attempted={attempted} correct={correctCount}
            accentClass="bg-pink-600" subtitle={`Which fraction equals ${given[0]}/${given[1]}?`}
            playbooks={playbooks}
            lessonContext={lessonContext}
            onSwapView={handleSwapView}>
            <LessonComplete show={showComplete} stars={wrongCount === 0 ? 3 : wrongCount <= 3 ? 2 : 1}
                points={sessionPoints} onRetry={handleRetry} onNext={() => navigate('/')} />
            <Confetti active={confetti} />

            <div className="h-full flex flex-col items-center justify-center gap-10 p-6">
                {/* Given fraction */}
                <div className="flex flex-col items-center gap-2">
                    <div className="text-white/50 font-display text-sm">Find the equivalent of:</div>
                    <div data-hint-region="equiv-given" className="flex items-center gap-4 bg-blue-900/30 border border-blue-400/30 rounded-2xl px-8 py-4">
                        <FractionPie num={given[0]} den={given[1]} color={COLORS[0]} />
                        <div className="text-blue-300 font-black font-display text-4xl">{given[0]}/{given[1]}</div>
                    </div>
                </div>

                {/* Choices */}
                <div className="text-white/50 font-display text-sm">Which of these is the same?</div>
                <div data-hint-region="equiv-choices" className="flex gap-6 flex-wrap justify-center">
                    {choices.map(([n, d], i) => {
                        const isChosen = chosen === i
                        return (
                            <motion.button
                                key={i}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleChoice(i)}
                                animate={isSimplified ? { y: 0 } : { y: [0, -8, 0] }}
                                transition={isSimplified ? {} : { duration: 4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.2 }}
                                className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-colors ${isChosen
                                    ? feedback === 'correct'
                                        ? 'bg-emerald-500/20 border-emerald-400'
                                        : 'bg-rose-500/20 border-rose-400'
                                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                                    }`}
                            >
                                <FractionPie num={n} den={d} color={COLORS[i + 1]} />
                                <span className="font-black font-display text-2xl text-white">{n}/{d}</span>
                            </motion.button>
                        )
                    })}
                </div>

                <div className="flex gap-6 text-sm font-display">
                    <span className="text-emerald-400">✓ {correctCount}</span>
                    <span className="text-rose-400">✗ {wrongCount}</span>
                </div>
            </div>
        </LessonShell>
    )
}
