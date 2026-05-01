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
interface WordProblem {
    emoji: string
    story: string
    highlight: string // the key equation
    answer: number
    hint: string
}

const PROBLEMS: WordProblem[] = [
    {
        emoji: '🍎',
        story: 'Emma has 8 apples. She gives 3 to her friend. How many apples does Emma have now?',
        highlight: '8 − 3 = ?',
        answer: 5,
        hint: 'Start with 8 and take away 3',
    },
    {
        emoji: '🚗',
        story: 'There are 6 cars in the parking lot. 4 more cars arrive. How many cars are there in total?',
        highlight: '6 + 4 = ?',
        answer: 10,
        hint: 'Add the new cars to the ones already there',
    },
    {
        emoji: '🍪',
        story: 'Mom baked 15 cookies. She puts them equally into 3 bags. How many cookies in each bag?',
        highlight: '15 ÷ 3 = ?',
        answer: 5,
        hint: 'Share 15 cookies among 3 groups',
    },
    {
        emoji: '📚',
        story: 'Ben reads 4 pages every day. How many pages will he read in 5 days?',
        highlight: '4 × 5 = ?',
        answer: 20,
        hint: '4 pages for each of the 5 days',
    },
    {
        emoji: '🌺',
        story: 'A garden has 12 flowers. A storm knocks down 7. Then 3 new ones bloom. How many flowers now?',
        highlight: '12 − 7 + 3 = ?',
        answer: 8,
        hint: 'First subtract, then add',
    },
    {
        emoji: '🐤',
        story: 'A hen has 3 nests with 6 eggs each. How many eggs in total?',
        highlight: '3 × 6 = ?',
        answer: 18,
        hint: '3 groups of 6',
    },
]

/* ─── Main Component ─────────────────────────────────────────── */
export const WordProblems = () => {
    const navigate = useNavigate()
    const { addCorrect, addWrong, sessionPoints, correctCount, wrongCount, reset } = useScoreStore()
    const { completeLesson, addPoints } = useProgressStore()

    const [probIdx, setProbIdx] = useState(0)
    const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none')
    const [showComplete, setShowComplete] = useState(false)
    const [showHint, setShowHint] = useState(false)

    const problem = PROBLEMS[probIdx]

    const handleAnswer = useCallback((value: string) => {
        const ans = parseInt(value, 10)
        if (isNaN(ans)) return
        if (ans === problem.answer) {
            addCorrect(20)
            setFeedback('correct')
            setTimeout(() => {
                setFeedback('none')
                setShowHint(false)
                const next = probIdx + 1
                if (next >= PROBLEMS.length) {
                    const stars = wrongCount === 0 ? 3 : wrongCount <= 2 ? 2 : 1
                    completeLesson('number-sense', 'word-problems', stars, sessionPoints + 20)
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
    }, [problem.answer, probIdx, wrongCount, sessionPoints, addCorrect, addWrong, completeLesson, addPoints])

    const handleRetry = () => {
        reset(); setProbIdx(0); setShowComplete(false); setFeedback('none'); setShowHint(false)
    }

    const playbooks = useMemo<TeachingPlaybook[]>(() => [
        {
            id: 'wp_read_model',
            description: 'Turn the story into an equation before calculating',
            generate: () => [
                {
                    delay: 0,
                    annotations: [
                        { action: 'pulse', element: '[data-hint-region="wp-story"]', color: '#fbbf24' },
                        { action: 'label', element: '[data-hint-region="wp-story"]', label: 'Read carefully', color: '#fbbf24' },
                    ],
                    speech: 'Read the story and find the key numbers and operation.',
                },
                {
                    delay: 1200,
                    annotations: [
                        { action: 'pulse', element: '[data-hint-region="wp-equation"]', color: '#60a5fa' },
                        { action: 'label', element: '[data-hint-region="wp-equation"]', label: problem.highlight, color: '#60a5fa' },
                    ],
                    speech: `The equation is ${problem.highlight}. Solve for the question mark.`,
                },
            ],
        },
        {
            id: 'wp_submit_answer',
            description: 'Enter the numeric result on the keypad',
            generate: () => [
                {
                    delay: 0,
                    annotations: [
                        { action: 'circle', element: '[data-hint-region="wp-numpad"]', color: '#34d399' },
                    ],
                    speech: 'Type your answer on the keypad and submit.',
                },
            ],
        },
    ], [problem])

    const lessonContext = useMemo(() => ({
        type: 'word_problems' as const,
        currentStep: probIdx,
        answer: problem.answer,
    }), [probIdx, problem.answer])

    return (
        <LessonShell
            lessonId="word-problems"
            voiceConfig={VOICE_CONFIGS["word-problems-ns"]}
            feedback={feedback}
            problemIndex={probIdx}
            total={PROBLEMS.length} attempted={correctCount + wrongCount}
            correct={correctCount} accentClass="bg-indigo-700"
            subtitle="Read the story and solve!"
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

            <div className="h-full flex gap-4 p-4">
                {/* Story card */}
                <div className="flex-1 flex flex-col gap-4">
                    <AnimatePresence mode="wait">
                        <motion.div
                            data-hint-region="wp-story"
                            key={probIdx}
                            initial={{ x: 40, opacity: 0 }}
                            animate={
                                feedback === 'correct'
                                    ? { x: 0, opacity: 1, borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)' }
                                    : feedback === 'wrong'
                                        ? { x: [0, -8, 8, -6, 6, -4, 4, 0], opacity: 1 }
                                        : { x: 0, opacity: 1, borderColor: 'rgba(255,255,255,0.1)' }
                            }
                            exit={{ x: -40, opacity: 0 }}
                            transition={SPRING}
                            className="flex-1 bg-white/5 rounded-3xl border-2 p-8 flex flex-col justify-center"
                        >
                            {/* Emoji */}
                            <motion.div
                                animate={{ y: [0, -6, 0] }}
                                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                                className="text-6xl mb-4 text-center"
                            >
                                {problem.emoji}
                            </motion.div>

                            {/* Story text */}
                            <p className="text-white text-lg font-display leading-relaxed text-center mb-4">
                                {problem.story}
                            </p>

                            {/* Equation highlight */}
                            <motion.div
                                data-hint-region="wp-equation"
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ ...SPRING, delay: 0.2 }}
                                className="bg-amber-500/20 rounded-2xl px-6 py-3 text-center border border-amber-500/30"
                            >
                                <span className="text-amber-300 font-black font-display text-2xl">
                                    {problem.highlight}
                                </span>
                            </motion.div>

                            {/* Hint */}
                            <div className="mt-4 text-center">
                                <motion.button
                                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                    onClick={() => setShowHint(!showHint)}
                                    className="text-white/40 font-display text-sm hover:text-white/60"
                                >
                                    💡 {showHint ? 'Hide hint' : 'Need a hint?'}
                                </motion.button>
                                <AnimatePresence>
                                    {showHint && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={SPRING}
                                            className="text-teal-300 font-display text-sm mt-2 overflow-hidden"
                                        >
                                            {problem.hint}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Answer area */}
                <div className="w-64 flex flex-col gap-4 justify-center">
                    <div className="text-white/40 font-display text-sm text-center">Your answer:</div>
                    <motion.div
                        data-hint-region="wp-numpad"
                        animate={feedback === 'wrong' ? { x: [0, -8, 8, -6, 6, -4, 4, 0] } : { x: 0 }}
                        transition={SPRING}
                    >
                        <Numpad onAnswer={handleAnswer} maxDigits={3} />
                    </motion.div>

                    {/* Feedback */}
                    <AnimatePresence>
                        {feedback === 'correct' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                transition={SPRING}
                                className="text-emerald-400 font-black font-display text-lg text-center"
                            >
                                ✓ {problem.answer} is correct!
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </LessonShell>
    )
}
