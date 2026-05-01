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
interface MachineProblem {
    ruleLabel: string
    examples: { input: number; output: number }[]
    options: string[]
    answerLabel: string
}

const PROBLEMS: MachineProblem[] = [
    {
        ruleLabel: '+ 3',
        examples: [{ input: 2, output: 5 }, { input: 7, output: 10 }, { input: 4, output: 7 }],
        options: ['+ 2', '+ 3', '× 2', '+ 5'], answerLabel: '+ 3',
    },
    {
        ruleLabel: '× 2',
        examples: [{ input: 3, output: 6 }, { input: 5, output: 10 }, { input: 1, output: 2 }],
        options: ['+ 3', '× 3', '× 2', '− 1'], answerLabel: '× 2',
    },
    {
        ruleLabel: '− 4',
        examples: [{ input: 10, output: 6 }, { input: 7, output: 3 }, { input: 12, output: 8 }],
        options: ['× 4', '− 5', '− 4', '+ 4'], answerLabel: '− 4',
    },
    {
        ruleLabel: '+ 7',
        examples: [{ input: 1, output: 8 }, { input: 3, output: 10 }, { input: 5, output: 12 }],
        options: ['+ 6', '+ 7', '× 7', '+ 8'], answerLabel: '+ 7',
    },
    {
        ruleLabel: '× 3',
        examples: [{ input: 2, output: 6 }, { input: 4, output: 12 }, { input: 3, output: 9 }],
        options: ['+ 4', '× 2', '+ 3', '× 3'], answerLabel: '× 3',
    },
]

/* ─── Main Component ─────────────────────────────────────────── */
export const FunctionMachine = () => {
    const navigate = useNavigate()
    const { addCorrect, addWrong, sessionPoints, correctCount, wrongCount, reset } = useScoreStore()
    const { completeLesson, addPoints } = useProgressStore()

    const [probIdx, setProbIdx] = useState(0)
    const [isSimplified, setIsSimplified] = useState(false)
    const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none')
    const [showComplete, setShowComplete] = useState(false)

    const handleSwapView = useCallback((target: string) => {
        if (target === 'simplified_view') setIsSimplified(true)
    }, [])

    const problem = PROBLEMS[probIdx]

    const handleChoice = useCallback((choice: string) => {
        if (feedback !== 'none') return
        if (choice === problem.answerLabel) {
            addCorrect(20)
            setFeedback('correct')
            setTimeout(() => {
                setFeedback('none')
                const next = probIdx + 1
                if (next >= PROBLEMS.length) {
                    const stars = wrongCount === 0 ? 3 : wrongCount <= 2 ? 2 : 1
                    completeLesson('algebraic', 'function-machine', stars, sessionPoints + 20)
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
    }, [feedback, problem.answerLabel, probIdx, wrongCount, sessionPoints, addCorrect, addWrong, completeLesson, addPoints])

    const handleRetry = () => {
        reset(); setProbIdx(0); setShowComplete(false); setFeedback('none'); setIsSimplified(false)
    }

    const playbooks = useMemo<TeachingPlaybook[]>(() => [
        {
            id: 'fm_in_out_pairs',
            description: 'Compare inputs and outputs to infer the repeated operation',
            generate: () => {
                const ex = problem.examples[0]
                return [
                    {
                        delay: 0,
                        annotations: [
                            { action: 'pulse', element: '[data-hint-region="fm-examples"]', color: '#fbbf24' },
                            { action: 'label', element: '[data-hint-region="fm-examples"]', label: `${ex.input} → ${ex.output}`, color: '#fbbf24' },
                        ],
                        speech: `${ex.input} goes in, ${ex.output} comes out. What operation does that every time?`,
                    },
                    {
                        delay: 1200,
                        annotations: [
                            { action: 'pulse', element: '[data-hint-region="fm-machine"]', color: '#60a5fa' },
                            { action: 'label', element: '[data-hint-region="fm-machine"]', label: '???', color: '#60a5fa' },
                        ],
                        speech: 'The machine hides the rule. Check all three pairs to be sure.',
                    },
                ]
            },
        },
        {
            id: 'fm_pick_rule',
            description: 'Select the rule that fits every example',
            generate: () => [
                {
                    delay: 0,
                    annotations: [
                        { action: 'circle', element: '[data-hint-region="fm-rules"]', color: '#34d399' },
                    ],
                    speech: 'Test each rule mentally against all three pairs, then tap the match.',
                },
            ],
        },
    ], [problem])

    const lessonContext = useMemo(() => ({
        type: 'function_machine' as const,
        itemCount: problem.examples.length,
    }), [problem.examples.length])

    return (
        <LessonShell
            lessonId="function-machine"
            voiceConfig={VOICE_CONFIGS["function-machine"]}
            feedback={feedback}
            problemIndex={probIdx}
            total={PROBLEMS.length} attempted={correctCount + wrongCount}
            correct={correctCount} accentClass="bg-teal-600"
            subtitle="What's the secret rule of the machine?"
            playbooks={playbooks}
            lessonContext={lessonContext}
            onSwapView={handleSwapView}
        >
            <LessonComplete
                show={showComplete}
                stars={wrongCount === 0 ? 3 : wrongCount <= 2 ? 2 : 1}
                points={sessionPoints}
                onRetry={handleRetry}
                onNext={() => navigate('/')}
            />

            <div className="h-full flex flex-col items-center justify-center gap-6 p-4">
                {/* Examples table */}
                <div data-hint-region="fm-examples" className="flex gap-4">
                    {problem.examples.map((ex, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ ...SPRING, delay: i * 0.1 }}
                            className="bg-white/5 rounded-2xl border border-white/10 p-4 text-center min-w-[80px]"
                        >
                            <div className="text-teal-300 font-display text-sm mb-1">In</div>
                            <motion.div
                                animate={{ y: [0, -4, 0] }}
                                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.2 }}
                                className="text-3xl font-black font-display text-white"
                            >
                                {ex.input}
                            </motion.div>
                            <div className="text-white/30 my-1">↓</div>
                            <div className="text-amber-300 font-display text-sm mb-1">Out</div>
                            <div className="text-3xl font-black font-display text-amber-300">{ex.output}</div>
                        </motion.div>
                    ))}
                </div>

                {/* Machine visual */}
                <motion.div
                    data-hint-region="fm-machine"
                    animate={
                        feedback === 'wrong'
                            ? { x: [0, -8, 8, -6, 6, -4, 4, 0] }
                            : { x: 0 }
                    }
                    transition={SPRING}
                    className="relative w-72 h-40"
                >
                    {/* Machine body */}
                    <div className="absolute inset-0 bg-gradient-to-b from-gray-700 to-gray-800 rounded-3xl border-2 border-gray-600 shadow-2xl overflow-hidden">
                        {/* Gears */}
                        <motion.div
                            animate={{ rotate: isSimplified ? 0 : 360 }}
                            transition={isSimplified ? {} : { duration: 4, repeat: Infinity, ease: 'linear' }}
                            className="absolute top-3 left-6 text-4xl opacity-30"
                        >⚙️</motion.div>
                        <motion.div
                            animate={{ rotate: isSimplified ? 0 : -360 }}
                            transition={isSimplified ? {} : { duration: 3, repeat: Infinity, ease: 'linear' }}
                            className="absolute top-6 right-8 text-3xl opacity-20"
                        >⚙️</motion.div>
                        <motion.div
                            animate={{ rotate: isSimplified ? 0 : 360 }}
                            transition={isSimplified ? {} : { duration: 5, repeat: Infinity, ease: 'linear' }}
                            className="absolute bottom-3 left-1/2 text-2xl opacity-25"
                        >⚙️</motion.div>

                        {/* Label */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-black/40 rounded-xl px-4 py-2 border border-gray-500">
                                <span className="text-amber-400 font-black font-display text-xl">
                                    {feedback === 'correct' ? problem.ruleLabel : '? ? ?'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Input slot */}
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-16 h-8 bg-teal-600 rounded-t-xl flex items-center justify-center">
                        <span className="text-white font-bold font-display text-sm">IN</span>
                    </div>

                    {/* Output slot */}
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-16 h-8 bg-amber-600 rounded-b-xl flex items-center justify-center">
                        <span className="text-white font-bold font-display text-sm">OUT</span>
                    </div>
                </motion.div>

                {/* Rule options */}
                <div data-hint-region="fm-rules">
                    <div className="text-white/40 font-display text-sm text-center mb-2">What's the rule?</div>
                    <div className="flex gap-3">
                        {problem.options.map((opt, i) => (
                            <motion.button
                                key={`${probIdx}-${opt}`}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ ...SPRING, delay: i * 0.06 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleChoice(opt)}
                                disabled={feedback !== 'none'}
                                className={`px-6 py-3 rounded-xl border-2 font-black font-display text-lg transition-colors ${feedback === 'correct' && opt === problem.answerLabel
                                    ? 'bg-emerald-500/30 border-emerald-400 text-emerald-300'
                                    : 'bg-white/5 border-white/20 text-white hover:bg-white/10'
                                    }`}
                            >
                                {opt}
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Feedback */}
                <AnimatePresence>
                    {feedback === 'correct' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={SPRING}
                            className="text-emerald-400 font-black font-display text-xl">✓ The rule is {problem.ruleLabel}!</motion.div>
                    )}
                </AnimatePresence>
            </div>
        </LessonShell>
    )
}
