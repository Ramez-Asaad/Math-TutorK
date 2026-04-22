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
interface NegProblem {
    type: 'identify' | 'compare' | 'calculate'
    question: string
    target: number
    options: number[]
    answer: number
}

const PROBLEMS: NegProblem[] = [
    { type: 'identify', question: 'Tap the number on the line:', target: -3, options: [], answer: -3 },
    { type: 'identify', question: 'Tap the number on the line:', target: -7, options: [], answer: -7 },
    { type: 'compare', question: 'Which is greater?', target: 0, options: [-4, 2], answer: 2 },
    { type: 'compare', question: 'Which is greater?', target: 0, options: [-1, -5], answer: -1 },
    { type: 'calculate', question: '3 − 7 = ?', target: 0, options: [-4, -3, 4, -10], answer: -4 },
    { type: 'calculate', question: '-2 + 5 = ?', target: 0, options: [3, -7, 7, -3], answer: 3 },
    { type: 'calculate', question: '-6 + 6 = ?', target: 0, options: [0, -12, 12, 6], answer: 0 },
]

/* ─── Number Line ────────────────────────────────────────────── */
const LINE_MIN = -10
const LINE_MAX = 10
const TICKS = Array.from({ length: LINE_MAX - LINE_MIN + 1 }, (_, i) => LINE_MIN + i)

/* ─── Main Component ─────────────────────────────────────────── */
export const NegativeNumbers = () => {
    const navigate = useNavigate()
    const { addCorrect, addWrong, sessionPoints, correctCount, wrongCount, reset } = useScoreStore()
    const { completeLesson, addPoints } = useProgressStore()

    const [probIdx, setProbIdx] = useState(0)
    const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none')
    const [showComplete, setShowComplete] = useState(false)
    const [characterPos, setCharacterPos] = useState(0)

    const problem = PROBLEMS[probIdx]

    const advance = useCallback(() => {
        setFeedback('none')
        const next = probIdx + 1
        if (next >= PROBLEMS.length) {
            const stars = wrongCount === 0 ? 3 : wrongCount <= 2 ? 2 : 1
            completeLesson('number-sense', 'negative-numbers', stars, sessionPoints + 15)
            addPoints(sessionPoints)
            setShowComplete(true)
        } else {
            setProbIdx(next)
        }
    }, [probIdx, wrongCount, sessionPoints, completeLesson, addPoints])

    const handleTickClick = useCallback((num: number) => {
        if (problem.type !== 'identify' || feedback !== 'none') return
        setCharacterPos(num)
        if (num === problem.answer) {
            addCorrect(15)
            setFeedback('correct')
            setTimeout(advance, 1000)
        } else {
            addWrong()
            setFeedback('wrong')
            setTimeout(() => setFeedback('none'), 700)
        }
    }, [problem, feedback, addCorrect, addWrong, advance])

    const handleOption = useCallback((val: number) => {
        if (feedback !== 'none') return
        if (val === problem.answer) {
            addCorrect(15)
            setFeedback('correct')
            if (problem.type === 'compare') setCharacterPos(val)
            setTimeout(advance, 1000)
        } else {
            addWrong()
            setFeedback('wrong')
            setTimeout(() => setFeedback('none'), 700)
        }
    }, [problem, feedback, addCorrect, addWrong, advance])

    const handleRetry = () => {
        reset(); setProbIdx(0); setShowComplete(false); setFeedback('none'); setCharacterPos(0)
    }

    // Character position percentage
    const charPct = ((characterPos - LINE_MIN) / (LINE_MAX - LINE_MIN)) * 100

    const playbooks = useMemo<TeachingPlaybook[]>(() => [
        {
            id: 'nn_number_line',
            description: 'Use the line to relate negatives, zero, and positives',
            generate: () => [
                {
                    delay: 0,
                    annotations: [
                        { action: 'pulse', element: '[data-hint-region="nn-question"]', color: '#fbbf24' },
                        { action: 'label', element: '[data-hint-region="nn-question"]', label: 'Prompt', color: '#fbbf24' },
                    ],
                    speech: 'Read whether you are locating, comparing, or computing—each mode uses the line differently.',
                },
                {
                    delay: 1200,
                    annotations: [
                        { action: 'pulse', element: '[data-hint-region="nn-line"]', color: '#60a5fa' },
                    ],
                    speech: 'Numbers to the left are smaller; walk the robot to match the task.',
                },
            ],
        },
        {
            id: 'nn_respond',
            description: 'Answer using the ticks or the chips in this band',
            generate: () => [
                {
                    delay: 0,
                    annotations: [
                        { action: 'circle', element: '[data-hint-region="nn-response"]', color: '#34d399' },
                    ],
                    speech: 'Tap a tick when you are locating a value, or use the chips when the prompt asks for a computed result.',
                },
            ],
        },
    ], [])

    const lessonContext = useMemo(() => ({
        type: 'negative_numbers' as const,
        currentStep: probIdx,
        problemMode: problem.type,
    }), [probIdx, problem.type])

    return (
        <LessonShell
            lessonId="negative-numbers"
            voiceConfig={VOICE_CONFIGS["negative-numbers"]}
            feedback={feedback}
            problemIndex={probIdx}
            total={PROBLEMS.length} attempted={correctCount + wrongCount}
            correct={correctCount} accentClass="bg-indigo-700"
            subtitle={problem.question}
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

            <div className="h-full flex flex-col items-center justify-center gap-8 p-6">
                {/* Question */}
                <motion.div
                    data-hint-region="nn-question"
                    animate={feedback === 'wrong' ? { x: [0, -8, 8, -6, 6, -4, 4, 0] } : { x: 0 }}
                    transition={SPRING}
                    className="text-center"
                >
                    <div className="text-white/60 font-display text-sm mb-1">{problem.question}</div>
                    {problem.type === 'identify' && (
                        <motion.div
                            animate={{ y: [0, -4, 0] }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                            className="text-5xl font-black font-display text-amber-300"
                        >
                            {problem.target}
                        </motion.div>
                    )}
                    {problem.type === 'calculate' && (
                        <div className="text-4xl font-black font-display text-white">{problem.question}</div>
                    )}
                </motion.div>

                {/* Number line + answer chips */}
                <div data-hint-region="nn-response" className="w-full max-w-2xl flex flex-col items-center gap-6">
                <div data-hint-region="nn-line" className="w-full relative px-4">
                    {/* Character */}
                    <motion.div
                        animate={{ left: `${charPct}%`, y: [0, -6, 0] }}
                        transition={{
                            left: SPRING,
                            y: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
                        }}
                        className="absolute -top-10 text-3xl"
                        style={{ transform: 'translateX(-50%)' }}
                    >
                        🤖
                    </motion.div>

                    {/* Track with gradient */}
                    <div className="h-4 rounded-full relative overflow-hidden"
                        style={{
                            background: 'linear-gradient(90deg, #3b82f6 0%, #3b82f6 47%, #fbbf24 50%, #ef4444 53%, #ef4444 100%)',
                            opacity: 0.3,
                        }}
                    />

                    {/* Zero marker */}
                    <div
                        className="absolute top-0 w-1 h-6 bg-amber-400"
                        style={{ left: `${((0 - LINE_MIN) / (LINE_MAX - LINE_MIN)) * 100}%`, transform: 'translateX(-50%)' }}
                    />

                    {/* Tick marks + numbers */}
                    <div className="flex justify-between mt-2">
                        {TICKS.map(n => {
                            const isTarget = problem.type === 'identify' && n === problem.target
                            return (
                                <motion.button
                                    key={n}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleTickClick(n)}
                                    className={`flex flex-col items-center cursor-pointer group ${problem.type !== 'identify' ? 'pointer-events-none' : ''
                                        }`}
                                >
                                    <div className={`w-0.5 h-3 ${n === 0 ? 'bg-amber-400 h-5' : 'bg-white/30'}`} />
                                    <span className={`text-xs font-display font-bold mt-0.5 ${n === 0 ? 'text-amber-400'
                                            : n < 0 ? 'text-blue-400'
                                                : 'text-red-400'
                                        } ${isTarget ? 'ring-2 ring-amber-400 rounded px-1' : ''}`}>
                                        {n}
                                    </span>
                                </motion.button>
                            )
                        })}
                    </div>

                    {/* Legend */}
                    <div className="flex justify-between mt-2 text-xs font-display">
                        <span className="text-blue-400">← Negative (cold)</span>
                        <span className="text-amber-400">Zero ⭐</span>
                        <span className="text-red-400">Positive (warm) →</span>
                    </div>
                </div>

                {/* Options for compare/calculate */}
                {(problem.type === 'compare' || problem.type === 'calculate') && (
                    <div className="flex gap-3">
                        {problem.options.map((opt, i) => (
                            <motion.button
                                key={`${probIdx}-${opt}`}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ ...SPRING, delay: i * 0.06 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleOption(opt)}
                                disabled={feedback !== 'none'}
                                className={`px-6 py-3 rounded-xl border-2 font-black font-display text-xl transition-colors ${feedback === 'correct' && opt === problem.answer
                                    ? 'bg-emerald-500/30 border-emerald-400 text-emerald-300'
                                    : 'bg-white/5 border-white/20 text-white hover:bg-white/10'
                                    }`}
                            >
                                {opt}
                            </motion.button>
                        ))}
                    </div>
                )}
                </div>

                {/* Feedback */}
                <AnimatePresence>
                    {feedback === 'correct' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={SPRING}
                            className="text-emerald-400 font-black font-display text-xl">✓ Correct!</motion.div>
                    )}
                </AnimatePresence>
            </div>
        </LessonShell >
    )
}
