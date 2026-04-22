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
interface EqProblem {
    equation: string // e.g. "4 × ? = 20"
    display: string[] // ["4", "×", "?", "=", "20"]
    blankIdx: number
    answer: number
    options: number[]
}

const PROBLEMS: EqProblem[] = [
    { equation: '4 × ? = 20', display: ['4', '×', '?', '=', '20'], blankIdx: 2, answer: 5, options: [3, 5, 4, 6, 8, 2] },
    { equation: '? + 6 = 14', display: ['?', '+', '6', '=', '14'], blankIdx: 0, answer: 8, options: [7, 9, 8, 6, 5, 10] },
    { equation: '15 − ? = 9', display: ['15', '−', '?', '=', '9'], blankIdx: 2, answer: 6, options: [4, 7, 6, 5, 8, 3] },
    { equation: '? × 3 = 21', display: ['?', '×', '3', '=', '21'], blankIdx: 0, answer: 7, options: [6, 8, 9, 7, 5, 4] },
    { equation: '24 ÷ ? = 6', display: ['24', '÷', '?', '=', '6'], blankIdx: 2, answer: 4, options: [3, 6, 4, 8, 2, 5] },
    { equation: '? − 5 = 11', display: ['?', '−', '5', '=', '11'], blankIdx: 0, answer: 16, options: [14, 15, 16, 17, 6, 12] },
]

/* ─── Floating tile position ──────────────────────────────────── */
function randomPos() {
    return {
        x: Math.random() * 300 - 150,
        y: Math.random() * 100 - 50,
        rotation: Math.random() * 20 - 10,
    }
}

/* ─── Main Component ─────────────────────────────────────────── */
export const MissingNumberEq = () => {
    const navigate = useNavigate()
    const { addCorrect, addWrong, sessionPoints, correctCount, wrongCount, reset } = useScoreStore()
    const { completeLesson, addPoints } = useProgressStore()

    const [probIdx, setProbIdx] = useState(0)
    const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none')
    const [showComplete, setShowComplete] = useState(false)
    const [chosenTile, setChosenTile] = useState<number | null>(null)

    const problem = PROBLEMS[probIdx]

    // Generate random positions for option tiles
    const tilePositions = useMemo(() =>
        problem.options.map(() => randomPos()),
        [probIdx] // regenerate on new problem
    )

    const handleChoice = useCallback((value: number) => {
        setChosenTile(value)
        if (value === problem.answer) {
            addCorrect(15)
            setFeedback('correct')
            setTimeout(() => {
                setFeedback('none')
                setChosenTile(null)
                const next = probIdx + 1
                if (next >= PROBLEMS.length) {
                    const stars = wrongCount === 0 ? 3 : wrongCount <= 2 ? 2 : 1
                    completeLesson('algebraic', 'missing-number', stars, sessionPoints + 15)
                    addPoints(sessionPoints)
                    setShowComplete(true)
                } else {
                    setProbIdx(next)
                }
            }, 1000)
        } else {
            addWrong()
            setFeedback('wrong')
            setTimeout(() => { setFeedback('none'); setChosenTile(null) }, 700)
        }
    }, [problem.answer, probIdx, wrongCount, sessionPoints, addCorrect, addWrong, completeLesson, addPoints])

    const handleRetry = () => {
        reset(); setProbIdx(0); setShowComplete(false); setFeedback('none'); setChosenTile(null)
    }

    const playbooks = useMemo<TeachingPlaybook[]>(() => [
        {
            id: 'mne_read_equation',
            description: 'Identify the operation and where the blank sits',
            generate: () => [
                {
                    delay: 0,
                    annotations: [
                        { action: 'pulse', element: '[data-hint-region="mne-equation"]', color: '#fbbf24' },
                        { action: 'label', element: '[data-hint-region="mne-equation"]', label: 'Equation', color: '#fbbf24' },
                    ],
                    speech: 'Say the equation in words—what is missing, a factor, a sum, or something else?',
                },
                {
                    delay: 1200,
                    annotations: [
                        { action: 'pulse', element: '[data-hint-region="mne-equation"]', color: '#60a5fa' },
                    ],
                    speech: 'Use inverse ideas: addition undoes subtraction, division pairs with multiplication.',
                },
            ],
        },
        {
            id: 'mne_grab_tile',
            description: 'Tap a floating tile that makes the statement true',
            generate: () => [
                {
                    delay: 0,
                    annotations: [
                        { action: 'circle', element: '[data-hint-region="mne-tiles"]', color: '#34d399' },
                    ],
                    speech: 'Try a tile mentally, then tap the one that makes the full sentence true.',
                },
            ],
        },
    ], [])

    const lessonContext = useMemo(() => ({
        type: 'missing_number_eq' as const,
        operands: problem.options,
        answer: problem.answer,
    }), [problem.options, problem.answer])

    return (
        <LessonShell
            lessonId="missing-number"
            voiceConfig={VOICE_CONFIGS["missing-number"]}
            feedback={feedback}
            problemIndex={probIdx}
            total={PROBLEMS.length} attempted={correctCount + wrongCount}
            correct={correctCount} accentClass="bg-teal-600"
            subtitle="Catch the right number!"
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

            <div className="h-full flex flex-col items-center justify-center gap-8 p-4">
                {/* Equation display */}
                <motion.div
                    data-hint-region="mne-equation"
                    animate={feedback === 'wrong' ? { x: [0, -8, 8, -6, 6, -4, 4, 0] } : { x: 0 }}
                    transition={SPRING}
                    className="flex items-center gap-3"
                >
                    {problem.display.map((token, i) => (
                        <motion.div
                            key={`${probIdx}-${i}`}
                            initial={{ scale: 0 }}
                            animate={{
                                scale: 1,
                                y: i === problem.blankIdx ? [0, -6, 0] : 0,
                            }}
                            transition={{
                                scale: { ...SPRING, delay: i * 0.06 },
                                y: i === problem.blankIdx
                                    ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
                                    : undefined,
                            }}
                            className={`text-4xl font-black font-display ${i === problem.blankIdx
                                ? feedback === 'correct'
                                    ? 'text-emerald-400 bg-emerald-500/20 px-4 py-2 rounded-xl border-2 border-emerald-400'
                                    : 'text-amber-300 bg-amber-500/20 px-4 py-2 rounded-xl border-2 border-amber-400 border-dashed'
                                : token === '=' || token === '+' || token === '−' || token === '×' || token === '÷'
                                    ? 'text-white/50'
                                    : 'text-white'
                                }`}
                        >
                            {i === problem.blankIdx
                                ? (feedback === 'correct' ? problem.answer : chosenTile ?? '?')
                                : token}
                        </motion.div>
                    ))}
                </motion.div>

                {/* Floating tiles canvas */}
                <div data-hint-region="mne-tiles" className="relative w-full max-w-lg h-48">
                    {problem.options.map((num, i) => {
                        const pos = tilePositions[i]
                        const isChosen = chosenTile === num
                        const isCorrectChoice = isChosen && feedback === 'correct'
                        const isWrongChoice = isChosen && feedback === 'wrong'

                        return (
                            <motion.button
                                key={`${probIdx}-${num}-${i}`}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{
                                    scale: isCorrectChoice ? 0 : 1,
                                    opacity: isCorrectChoice ? 0 : 1,
                                    x: isWrongChoice ? [pos.x, pos.x - 20, pos.x + 20, pos.x] : pos.x,
                                    y: [pos.y, pos.y - 8, pos.y],
                                    rotate: pos.rotation,
                                }}
                                transition={{
                                    scale: SPRING,
                                    x: isWrongChoice ? { duration: 0.4 } : SPRING,
                                    y: { duration: 2 + i * 0.3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.2 },
                                }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleChoice(num)}
                                disabled={feedback !== 'none'}
                                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-2xl bg-indigo-500/60 border-2 border-indigo-400 shadow-xl flex items-center justify-center text-white font-black font-display text-2xl cursor-pointer hover:bg-indigo-400/60"
                                style={{ zIndex: isChosen ? 10 : 1 }}
                            >
                                {num}
                            </motion.button>
                        )
                    })}
                </div>

                {/* Feedback */}
                <AnimatePresence>
                    {feedback === 'correct' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={SPRING}
                            className="text-emerald-400 font-black font-display text-xl">✓ {problem.equation.replace('?', String(problem.answer))}</motion.div>
                    )}
                </AnimatePresence>
            </div>
        </LessonShell>
    )
}
