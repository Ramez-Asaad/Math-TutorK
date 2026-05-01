import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { LessonShell } from '../../components/layout/LessonShell'
import { VOICE_CONFIGS } from '../../utils/lessonVoiceConfigs'
import { LessonComplete } from '../../components/shared/LessonComplete'
import { AnimatedCounter } from '../../components/shared/AnimatedCounter'
import { useScoreStore } from '../../store/useScoreStore'
import { useProgressStore } from '../../store/useProgressStore'
import type { TeachingPlaybook } from '../../types/visualCommand'
import { SPRING } from '../../utils/animationPresets'

/* ─── Place value columns ────────────────────────────────────── */
const PLACES = [
    { label: 'Thousands', mult: 1000, color: 'from-pink-600 to-pink-500', blob: '#ec4899', border: 'border-pink-500/40' },
    { label: 'Hundreds', mult: 100, color: 'from-orange-600 to-orange-500', blob: '#f97316', border: 'border-orange-500/40' },
    { label: 'Tens', mult: 10, color: 'from-teal-600 to-teal-500', blob: '#14b8a6', border: 'border-teal-500/40' },
    { label: 'Ones', mult: 1, color: 'from-blue-600 to-blue-500', blob: '#3b82f6', border: 'border-blue-500/40' },
] as const

/* ─── Problems ───────────────────────────────────────────────── */
const PROBLEMS = [
    { target: 462, hint: 'four hundred and sixty-two' },
    { target: 1305, hint: 'one thousand, three hundred and five' },
    { target: 2070, hint: 'two thousand and seventy' },
    { target: 999, hint: 'nine hundred and ninety-nine' },
    { target: 3814, hint: 'three thousand, eight hundred and fourteen' },
]

/* ─── Main Component ─────────────────────────────────────────── */
export const ExpandedForm = () => {
    const navigate = useNavigate()
    const { addCorrect, addWrong, sessionPoints, correctCount, wrongCount, reset } = useScoreStore()
    const { completeLesson, addPoints } = useProgressStore()
    const [probIdx, setProbIdx] = useState(0)
    const [isSimplified, setIsSimplified] = useState(false)
    const [values, setValues] = useState([0, 0, 0, 0]) // thousands, hundreds, tens, ones
    const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none')
    const [showComplete, setShowComplete] = useState(false)

    const handleSwapView = useCallback((target: string) => {
        if (target === 'simplified_view') setIsSimplified(true)
    }, [])

    const problem = PROBLEMS[probIdx]
    const total = values[0] * 1000 + values[1] * 100 + values[2] * 10 + values[3]

    const step = useCallback((idx: number, delta: number) => {
        setValues(prev => {
            const next = [...prev]
            next[idx] = Math.max(0, Math.min(9, next[idx] + delta))
            return next
        })
    }, [])

    const handleCheck = useCallback(() => {
        if (total === problem.target) {
            addCorrect(20)
            setFeedback('correct')
            setTimeout(() => {
                setFeedback('none')
                const next = probIdx + 1
                if (next >= PROBLEMS.length) {
                    const stars = wrongCount === 0 ? 3 : wrongCount <= 2 ? 2 : 1
                    completeLesson('place-value', 'expanded-form', stars, sessionPoints + 20)
                    addPoints(sessionPoints)
                    setShowComplete(true)
                } else {
                    setProbIdx(next)
                    setValues([0, 0, 0, 0])
                }
            }, 900)
        } else {
            addWrong()
            setFeedback('wrong')
            setTimeout(() => setFeedback('none'), 700)
        }
    }, [total, problem.target, probIdx, wrongCount, sessionPoints, addCorrect, addWrong, completeLesson, addPoints])

    const handleRetry = () => {
        reset(); setProbIdx(0); setValues([0, 0, 0, 0]); setShowComplete(false); setFeedback('none'); setIsSimplified(false)
    }

    // Expanded form string
    const parts = PLACES.map((p, i) => values[i] * p.mult).filter(v => v > 0)
    const expandedStr = parts.length > 0 ? parts.join(' + ') : '0'

    const playbooks = useMemo<TeachingPlaybook[]>(() => [
        {
            id: 'ef_place_steppers',
            description: 'Adjust each place value so the expanded parts add to the target',
            generate: () => [
                {
                    delay: 0,
                    annotations: [
                        { action: 'pulse', element: '[data-hint-region="ef-equation"]', color: '#fbbf24' },
                        { action: 'label', element: '[data-hint-region="ef-equation"]', label: 'Expanded', color: '#fbbf24' },
                    ],
                    speech: `Break ${problem.target} into thousands, hundreds, tens, and ones.`,
                },
                {
                    delay: 1200,
                    annotations: [
                        { action: 'pulse', element: '[data-hint-region="ef-steppers"]', color: '#60a5fa' },
                        { action: 'label', element: '[data-hint-region="ef-steppers"]', label: 'Step ± to match', color: '#60a5fa' },
                    ],
                    speech: 'Use plus and minus to set each place until the sum equals the target.',
                },
            ],
        },
        {
            id: 'ef_match_target',
            description: 'Confirm the total equals the target before checking',
            generate: () => [
                {
                    delay: 0,
                    annotations: [
                        { action: 'circle', element: '[data-hint-region="ef-target"]', color: '#34d399' },
                        { action: 'label', element: '[data-hint-region="ef-target"]', label: `Target: ${problem.target}`, color: '#34d399' },
                    ],
                    speech: `When your sum matches ${problem.target}, press Check.`,
                },
            ],
        },
    ], [problem])

    const lessonContext = useMemo(() => ({
        type: 'expanded_form' as const,
        operands: [problem.target],
        answer: problem.target,
    }), [problem.target])

    return (
        <LessonShell
            lessonId="expanded-form"
            voiceConfig={VOICE_CONFIGS["expanded-form"]}
            feedback={feedback}
            problemIndex={probIdx}
            total={PROBLEMS.length} attempted={correctCount + wrongCount}
            correct={correctCount} accentClass="bg-violet-700"
            subtitle={`Build: ${problem.hint}`}
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

            <div className="h-full flex flex-col gap-4 p-4">
                {/* Equation display */}
                <motion.div
                    data-hint-region="ef-equation"
                    animate={
                        feedback === 'correct'
                            ? { borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.15)', x: 0 }
                            : feedback === 'wrong'
                                ? { x: [0, -8, 8, -6, 6, -4, 4, 0], borderColor: '#ef4444' }
                                : { borderColor: 'rgba(255,255,255,0.15)', x: 0 }
                    }
                    transition={SPRING}
                    className="text-center rounded-2xl border py-4 px-6"
                >
                    <div className="text-white/50 font-display text-sm mb-1">Expanded Form</div>
                    <motion.div
                        key={expandedStr}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={SPRING}
                        className="text-3xl font-black font-display flex flex-wrap justify-center items-center gap-2"
                    >
                        {isSimplified ? (
                            PLACES.map((p, i) => {
                                const val = values[i] * p.mult;
                                if (val === 0) return null;
                                return (
                                    <span key={i} className={p.color.replace('from-', 'text-').split(' ')[0] + ' brightness-150'}>
                                        {val}
                                        {i < PLACES.length - 1 && parts.some((v, idx) => idx > i && v > 0) && <span className="text-white/30 ml-2">+</span>}
                                    </span>
                                )
                            })
                        ) : (
                            <span className="text-amber-300">{expandedStr}</span>
                        )}
                    </motion.div>
                    <div className="flex items-center justify-center gap-3 mt-2">
                        <span className="text-white/40 font-display">=</span>
                        <AnimatedCounter value={total} color="text-white" fontSize="text-3xl" />
                    </div>
                </motion.div>

                {/* Blob display + Steppers */}
                <div data-hint-region="ef-steppers" className="flex-1 grid grid-cols-4 gap-4">
                    {PLACES.map((place, i) => (
                        <motion.div
                            key={place.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ ...SPRING, delay: i * 0.08 }}
                            className={`flex flex-col items-center justify-between rounded-2xl border ${place.border} p-3 transition-colors ${isSimplified ? place.color.replace('from-', 'bg-').split(' ')[0] + '/20' : 'bg-white/5'}`}
                        >
                            {/* Label */}
                            <div className={`w-full text-center py-1 rounded-xl bg-gradient-to-r ${place.color} shadow-lg`}>
                                <span className="text-white font-bold font-display text-sm">{place.label}</span>
                            </div>

                            {/* Blob */}
                            <motion.div
                                animate={{ y: [0, -4, 0] }}
                                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.2 }}
                                className="flex-1 flex items-center justify-center"
                            >
                                <AnimatePresence mode="wait">
                                    {values[i] > 0 && (
                                        <motion.div
                                            key={values[i]}
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            exit={{ scale: 0, opacity: 0 }}
                                            transition={SPRING}
                                            className="relative"
                                        >
                                            <div
                                                className="w-20 h-20 rounded-full shadow-xl flex items-center justify-center"
                                                style={{
                                                    background: `radial-gradient(circle at 40% 40%, ${place.blob}cc, ${place.blob}66)`,
                                                    transform: `scale(${0.6 + values[i] * 0.08})`,
                                                }}
                                            >
                                                <span className="text-white font-black font-display text-2xl">
                                                    {values[i] * place.mult}
                                                </span>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                {values[i] === 0 && (
                                    <span className="text-white/20 font-display text-sm">0</span>
                                )}
                            </motion.div>

                            {/* Stepper */}
                            <div className="flex items-center gap-2 mt-2">
                                <motion.button
                                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                    onClick={() => step(i, -1)}
                                    className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white font-black text-xl"
                                >−</motion.button>
                                <motion.span
                                    key={values[i]}
                                    initial={{ scale: 1.4 }}
                                    animate={{ scale: 1 }}
                                    transition={SPRING}
                                    className="text-white font-black font-display text-2xl w-8 text-center"
                                >
                                    {values[i]}
                                </motion.span>
                                <motion.button
                                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                    onClick={() => step(i, 1)}
                                    className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 text-white font-black text-xl"
                                >+</motion.button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Target row */}
                <div data-hint-region="ef-target" className="flex items-center justify-between bg-white/5 rounded-2xl px-6 py-3 border border-white/10">
                    <span className="text-white/60 font-display font-bold">Target: <span className="text-white text-2xl font-black ml-2">{problem.target}</span></span>
                    <motion.button
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={handleCheck}
                        className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 rounded-xl text-white font-bold font-display"
                    >Check ✓</motion.button>
                </div>
            </div>
        </LessonShell>
    )
}
