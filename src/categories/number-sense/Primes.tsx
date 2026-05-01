import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { LessonShell } from '../../components/layout/LessonShell'
import { VOICE_CONFIGS } from '../../utils/lessonVoiceConfigs'
import { LessonComplete } from '../../components/shared/LessonComplete'
import { useScoreStore } from '../../store/useScoreStore'
import { useProgressStore } from '../../store/useProgressStore'
import { SPRING } from '../../utils/animationPresets'
import type { TeachingPlaybook } from '../../types/visualCommand'

/* ─── Problems ───────────────────────────────────────────────── */
interface PrimeProblem {
    number: number
    isPrime: boolean
    factors: [number, number][] // valid rectangular arrangements
}

const PROBLEMS: PrimeProblem[] = [
    { number: 7, isPrime: true, factors: [[1, 7]] },
    { number: 12, isPrime: false, factors: [[1, 12], [2, 6], [3, 4]] },
    { number: 11, isPrime: true, factors: [[1, 11]] },
    { number: 9, isPrime: false, factors: [[1, 9], [3, 3]] },
    { number: 5, isPrime: true, factors: [[1, 5]] },
    { number: 16, isPrime: false, factors: [[1, 16], [2, 8], [4, 4]] },
    { number: 13, isPrime: true, factors: [[1, 13]] },
]

/* ─── Main Component ─────────────────────────────────────────── */
export const Primes = () => {
    const navigate = useNavigate()
    const { addCorrect, addWrong, sessionPoints, correctCount, wrongCount, reset } = useScoreStore()
    const { completeLesson, addPoints } = useProgressStore()

    const [probIdx, setProbIdx] = useState(0)
    const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none')
    const [showComplete, setShowComplete] = useState(false)
    const [selectedFactor, setSelectedFactor] = useState(0) // which factor pair to show

    const problem = PROBLEMS[probIdx]
    const currentPair = problem.factors[selectedFactor]
    const rows = currentPair[0]
    const cols = currentPair[1]

    const handleChoice = useCallback((choice: 'prime' | 'composite') => {
        const isCorrect = (choice === 'prime') === problem.isPrime
        if (isCorrect) {
            addCorrect(15)
            setFeedback('correct')
            setTimeout(() => {
                setFeedback('none')
                setSelectedFactor(0)
                const next = probIdx + 1
                if (next >= PROBLEMS.length) {
                    const stars = wrongCount === 0 ? 3 : wrongCount <= 2 ? 2 : 1
                    completeLesson('number-sense', 'primes', stars, sessionPoints + 15)
                    addPoints(sessionPoints)
                    setShowComplete(true)
                } else {
                    setProbIdx(next)
                }
            }, 1000)
        } else {
            addWrong()
            setFeedback('wrong')
            setTimeout(() => setFeedback('none'), 700)
        }
    }, [problem.isPrime, probIdx, wrongCount, sessionPoints, addCorrect, addWrong, completeLesson, addPoints])

    const handleRetry = () => {
        reset(); setProbIdx(0); setShowComplete(false); setFeedback('none'); setSelectedFactor(0)
    }

    const playbooks = useMemo<TeachingPlaybook[]>(() => [
        {
            id: 'pr_rectangles',
            description: 'Use the dot rectangle to see factor pairs of the number',
            generate: () => [
                {
                    delay: 0,
                    annotations: [
                        { action: 'pulse', element: '[data-hint-region="pr-number"]', color: '#fbbf24' },
                        { action: 'label', element: '[data-hint-region="pr-number"]', label: `${problem.number}`, color: '#fbbf24' },
                    ],
                    speech: `Can ${problem.number} dots make more than one rectangle shape?`,
                },
                {
                    delay: 1200,
                    annotations: [
                        { action: 'pulse', element: '[data-hint-region="pr-array"]', color: '#60a5fa' },
                        { action: 'label', element: '[data-hint-region="pr-array"]', label: `${problem.factors.length} layout${problem.factors.length > 1 ? 's' : ''}`, color: '#60a5fa' },
                    ],
                    speech: problem.factors.length > 1
                        ? `There are ${problem.factors.length} rectangle layouts — that means it has extra factors.`
                        : 'Only a single row works — that points toward prime.',
                },
            ],
        },
        {
            id: 'pr_classify',
            description: 'Choose prime or composite after inspecting arrangements',
            generate: () => [
                {
                    delay: 0,
                    annotations: [
                        { action: 'circle', element: '[data-hint-region="pr-decision"]', color: '#34d399' },
                    ],
                    speech: `Is ${problem.number} prime or composite? Tap your answer.`,
                },
            ],
        },
    ], [problem])

    const lessonContext = useMemo(() => ({
        type: 'primes' as const,
        operands: [problem.number],
        itemCount: problem.factors.length,
    }), [problem.number, problem.factors.length])

    return (
        <LessonShell
            lessonId="primes"
            voiceConfig={VOICE_CONFIGS["primes"]}
            feedback={feedback}
            problemIndex={probIdx}
            total={PROBLEMS.length} attempted={correctCount + wrongCount}
            correct={correctCount} accentClass="bg-indigo-700"
            subtitle={`Is ${problem.number} prime or composite?`}
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
                {/* Number display */}
                <motion.div
                    data-hint-region="pr-number"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    className="text-7xl font-black font-display text-amber-300"
                >
                    {problem.number}
                </motion.div>

                {/* Dot array */}
                <motion.div
                    data-hint-region="pr-array"
                    animate={feedback === 'wrong' ? { x: [0, -8, 8, -6, 6, -4, 4, 0] } : { x: 0 }}
                    transition={SPRING}
                    className="bg-white/5 rounded-3xl border border-white/10 p-6"
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`${probIdx}-${selectedFactor}`}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={SPRING}
                            className="flex flex-col gap-2"
                        >
                            {Array.from({ length: rows }, (_, r) => (
                                <div key={r} className="flex gap-2 justify-center">
                                    {Array.from({ length: cols }, (_, c) => (
                                        <motion.div
                                            key={c}
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1, y: [0, -4, 0] }}
                                            transition={{
                                                scale: { ...SPRING, delay: (r * cols + c) * 0.03 },
                                                y: { duration: 2, repeat: Infinity, ease: 'easeInOut', delay: (r * cols + c) * 0.05 },
                                            }}
                                            className="w-8 h-8 rounded-full bg-indigo-400 shadow-lg"
                                        />
                                    ))}
                                </div>
                            ))}
                        </motion.div>
                    </AnimatePresence>

                    {/* Factor label */}
                    <div className="text-center mt-3 text-white/60 font-display text-sm">
                        {rows} × {cols} = {problem.number}
                    </div>
                </motion.div>

                {/* Factor pair selector */}
                {problem.factors.length > 1 && (
                    <div className="flex gap-2">
                        {problem.factors.map(([r, c], i) => (
                            <motion.button
                                key={i}
                                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                onClick={() => setSelectedFactor(i)}
                                className={`px-3 py-1 rounded-lg font-display text-sm ${selectedFactor === i
                                    ? 'bg-indigo-500 text-white'
                                    : 'bg-white/10 text-white/60'
                                    }`}
                            >
                                {r}×{c}
                            </motion.button>
                        ))}
                    </div>
                )}

                {/* Decision buttons */}
                <div data-hint-region="pr-decision" className="flex gap-4">
                    <motion.button
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => handleChoice('prime')}
                        disabled={feedback !== 'none'}
                        className={`px-8 py-4 rounded-2xl border-2 font-black font-display text-xl transition-colors ${feedback === 'correct' && problem.isPrime
                            ? 'bg-emerald-500/30 border-emerald-400 text-emerald-300'
                            : 'bg-violet-500/20 border-violet-400 text-violet-300 hover:bg-violet-500/30'
                            }`}
                    >
                        🔷 Prime
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => handleChoice('composite')}
                        disabled={feedback !== 'none'}
                        className={`px-8 py-4 rounded-2xl border-2 font-black font-display text-xl transition-colors ${feedback === 'correct' && !problem.isPrime
                            ? 'bg-emerald-500/30 border-emerald-400 text-emerald-300'
                            : 'bg-orange-500/20 border-orange-400 text-orange-300 hover:bg-orange-500/30'
                            }`}
                    >
                        🔶 Composite
                    </motion.button>
                </div>

                {/* Feedback */}
                <AnimatePresence>
                    {feedback === 'correct' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={SPRING}
                            className="text-emerald-400 font-display text-lg">
                            ✓ {problem.number} is {problem.isPrime ? 'prime' : 'composite'}!
                            {!problem.isPrime && ` (${problem.factors.map(([r, c]) => `${r}×${c}`).join(', ')})`}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </LessonShell>
    )
}
