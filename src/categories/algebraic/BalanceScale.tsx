import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { LessonShell } from '../../components/layout/LessonShell'
import { VOICE_CONFIGS } from '../../utils/lessonVoiceConfigs'
import { LessonComplete } from '../../components/shared/LessonComplete'
import { Numpad } from '../../components/shared/Numpad'
import { useScoreStore } from '../../store/useScoreStore'
import { useProgressStore } from '../../store/useProgressStore'
import { SPRING } from '../../utils/animationPresets'
import type { TeachingPlaybook } from '../../types/visualCommand'

/* ─── Problems ───────────────────────────────────────────────── */
interface BalanceProblem {
    leftBlocks: number[]
    rightBlocks: number[]
    unknownSide: 'left' | 'right'
    unknownIdx: number
    answer: number
}

const PROBLEMS: BalanceProblem[] = [
    { leftBlocks: [5, 3], rightBlocks: [0], unknownSide: 'right', unknownIdx: 0, answer: 8 },
    { leftBlocks: [0], rightBlocks: [4, 6], unknownSide: 'left', unknownIdx: 0, answer: 10 },
    { leftBlocks: [7, 0], rightBlocks: [12], unknownSide: 'left', unknownIdx: 1, answer: 5 },
    { leftBlocks: [9], rightBlocks: [4, 0], unknownSide: 'right', unknownIdx: 1, answer: 5 },
    { leftBlocks: [6, 3, 0], rightBlocks: [15], unknownSide: 'left', unknownIdx: 2, answer: 6 },
    { leftBlocks: [20], rightBlocks: [0, 8], unknownSide: 'right', unknownIdx: 0, answer: 12 },
]

/* ─── Helper ─────────────────────────────────────────────────── */
function sumBlocks(blocks: number[], unknownIdx: number, answer: number, side: 'left' | 'right', unknownSide: 'left' | 'right'): number {
    return blocks.reduce((s, b, i) => s + (side === unknownSide && i === unknownIdx ? answer : b), 0)
}

/* ─── Block Component ────────────────────────────────────────── */
const Block = ({ value, isUnknown, idx }: { value: number; isUnknown: boolean; idx: number }) => (
    <motion.div
        initial={{ scale: 0, y: -20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ ...SPRING, delay: idx * 0.08 }}
        className={`w-14 h-14 rounded-xl flex items-center justify-center text-xl font-black font-display shadow-lg ${isUnknown
            ? 'bg-amber-500/30 border-2 border-amber-400 border-dashed text-amber-300'
            : 'bg-indigo-500/60 border-2 border-indigo-400 text-white'
            }`}
    >
        {isUnknown ? '?' : value}
    </motion.div>
)

/* ─── Main Component ─────────────────────────────────────────── */
export const BalanceScale = () => {
    const navigate = useNavigate()
    const { addCorrect, addWrong, sessionPoints, correctCount, wrongCount, reset } = useScoreStore()
    const { completeLesson, addPoints } = useProgressStore()

    const [probIdx, setProbIdx] = useState(0)
    const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none')
    const [showComplete, setShowComplete] = useState(false)
    const [userAnswer, setUserAnswer] = useState<number | null>(null)

    const problem = PROBLEMS[probIdx]

    // Compute current weights
    const leftSum = sumBlocks(problem.leftBlocks, problem.unknownIdx, userAnswer ?? 0, 'left', problem.unknownSide)
    const rightSum = sumBlocks(problem.rightBlocks, problem.unknownIdx, userAnswer ?? 0, 'right', problem.unknownSide)
    const diff = leftSum - rightSum
    const rotationDeg = Math.max(-15, Math.min(15, diff * 2))

    const handleAnswer = useCallback((value: string) => {
        const ans = parseInt(value, 10)
        if (isNaN(ans)) return
        setUserAnswer(ans)
        if (ans === problem.answer) {
            addCorrect(20)
            setFeedback('correct')
            setTimeout(() => {
                setFeedback('none')
                setUserAnswer(null)
                const next = probIdx + 1
                if (next >= PROBLEMS.length) {
                    const stars = wrongCount === 0 ? 3 : wrongCount <= 2 ? 2 : 1
                    completeLesson('algebraic', 'balance-scale', stars, sessionPoints + 20)
                    addPoints(sessionPoints)
                    setShowComplete(true)
                } else {
                    setProbIdx(next)
                }
            }, 1200)
        } else {
            addWrong()
            setFeedback('wrong')
            setTimeout(() => { setFeedback('none'); setUserAnswer(null) }, 700)
        }
    }, [problem.answer, probIdx, wrongCount, sessionPoints, addCorrect, addWrong, completeLesson, addPoints])

    const handleRetry = () => {
        reset(); setProbIdx(0); setShowComplete(false); setFeedback('none'); setUserAnswer(null)
    }

    const balanced = feedback === 'correct'

    const playbooks = useMemo<TeachingPlaybook[]>(() => [
        {
            id: 'bs_equal_pans',
            description: 'Total the known blocks on each side to infer the unknown weight',
            generate: () => {
                const knownSide = problem.unknownSide === 'left' ? 'right' : 'left'
                const knownBlocks = problem.unknownSide === 'left' ? problem.rightBlocks : problem.leftBlocks
                const knownTotal = knownBlocks.reduce((s, b) => s + b, 0)
                return [
                    {
                        delay: 0,
                        annotations: [
                            { action: 'pulse', element: '[data-hint-region="bs-scale"]', color: '#fbbf24' },
                            { action: 'label', element: '[data-hint-region="bs-scale"]', label: 'Balance!', color: '#fbbf24' },
                        ],
                        speech: `The ${knownSide} side totals ${knownTotal}. What goes in the dashed block to balance?`,
                    },
                    {
                        delay: 1200,
                        annotations: [
                            { action: 'pulse', element: '[data-hint-region="bs-scale"]', color: '#60a5fa' },
                        ],
                        speech: 'Add the known weights, then figure out the missing piece.',
                    },
                ]
            },
        },
        {
            id: 'bs_enter_mass',
            description: 'Type the missing value on the keypad',
            generate: () => [
                {
                    delay: 0,
                    annotations: [
                        { action: 'circle', element: '[data-hint-region="bs-numpad"]', color: '#34d399' },
                    ],
                    speech: `Enter ${problem.answer} to make both sides equal.`,
                },
            ],
        },
    ], [problem])

    const lessonContext = useMemo(() => ({
        type: 'balance_scale' as const,
        unknownSide: problem.unknownSide,
        answer: problem.answer,
    }), [problem.unknownSide, problem.answer])

    return (
        <LessonShell
            lessonId="balance-scale"
            voiceConfig={VOICE_CONFIGS["balance-scale"]}
            feedback={feedback}
            problemIndex={probIdx}
            total={PROBLEMS.length} attempted={correctCount + wrongCount}
            correct={correctCount} accentClass="bg-teal-600"
            subtitle="Find the missing weight to balance the scale!"
            playbooks={playbooks}
            lessonContext={lessonContext}
        >
            <LessonComplete
                show={showComplete}
                stars={wrongCount === 0 ? 3 : wrongCount <= 2 ? 2 : 1}
                points={sessionPoints}
                onRetry={handleRetry}
                onNext={() => navigate('/')}
            />

            <div className="h-full flex flex-col items-center justify-center gap-6 p-4">
                {/* Scale visual */}
                <AnimatePresence mode="wait">
                    <motion.div
                        data-hint-region="bs-scale"
                        key={probIdx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={SPRING}
                        className="relative w-full max-w-lg"
                    >
                        {/* Fulcrum base */}
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-24 bg-gradient-to-t from-gray-600 to-gray-500 rounded-t-lg" />
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-gray-600 rounded-full" />

                        {/* Beam */}
                        <motion.div
                            animate={{ rotate: balanced ? 0 : rotationDeg }}
                            transition={SPRING}
                            className="relative mx-auto"
                            style={{ width: '100%', height: 160, transformOrigin: 'center bottom' }}
                        >
                            {/* Beam bar */}
                            <div className="absolute bottom-20 left-0 right-0 h-3 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 rounded-full shadow-lg" />

                            {/* Left pan */}
                            <div className="absolute bottom-4 left-0 w-[45%]">
                                <div className="flex flex-wrap gap-2 justify-center mb-2 min-h-[60px]">
                                    {problem.leftBlocks.map((b, i) => (
                                        <Block key={i} value={b} idx={i}
                                            isUnknown={problem.unknownSide === 'left' && i === problem.unknownIdx} />
                                    ))}
                                </div>
                                <div className="h-2 bg-amber-700 rounded-full mx-4" />
                                <div className="flex justify-center">
                                    <div className="w-1 h-4 bg-amber-600" />
                                </div>
                            </div>

                            {/* Right pan */}
                            <div className="absolute bottom-4 right-0 w-[45%]">
                                <div className="flex flex-wrap gap-2 justify-center mb-2 min-h-[60px]">
                                    {problem.rightBlocks.map((b, i) => (
                                        <Block key={i} value={b} idx={i}
                                            isUnknown={problem.unknownSide === 'right' && i === problem.unknownIdx} />
                                    ))}
                                </div>
                                <div className="h-2 bg-amber-700 rounded-full mx-4" />
                                <div className="flex justify-center">
                                    <div className="w-1 h-4 bg-amber-600" />
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </AnimatePresence>

                {/* Balanced indicator */}
                <AnimatePresence>
                    {balanced && (
                        <motion.div
                            initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                            transition={SPRING}
                            className="text-emerald-400 font-black font-display text-xl"
                        >
                            ⚖️ Perfectly Balanced!
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Numpad */}
                <motion.div
                    data-hint-region="bs-numpad"
                    animate={feedback === 'wrong' ? { x: [0, -8, 8, -6, 6, -4, 4, 0] } : { x: 0 }}
                    transition={SPRING}
                    className="w-full max-w-xs"
                >
                    <Numpad onAnswer={handleAnswer} maxDigits={2} />
                </motion.div>
            </div>
        </LessonShell>
    )
}
