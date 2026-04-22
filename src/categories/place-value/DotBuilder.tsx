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

/* ─── Column config ──────────────────────────────────────────── */
const COLUMNS = [
    { id: 'thousands', label: 'Thousands', color: 'from-pink-700 to-pink-600', dot: 'bg-pink-400', border: 'border-pink-500/50', value: 1000 },
    { id: 'hundreds', label: 'Hundreds', color: 'from-orange-700 to-orange-600', dot: 'bg-orange-400', border: 'border-orange-500/50', value: 100 },
    { id: 'tens', label: 'Tens', color: 'from-teal-700 to-teal-600', dot: 'bg-teal-400', border: 'border-teal-500/50', value: 10 },
    { id: 'ones', label: 'Ones', color: 'from-blue-700 to-blue-600', dot: 'bg-blue-400', border: 'border-blue-500/50', value: 1 },
] as const

type ColId = typeof COLUMNS[number]['id']

/* ─── Problem generator ──────────────────────────────────────── */
const PROBLEMS = [
    { target: 321, label: 'Three hundred and twenty-one' },
    { target: 1450, label: 'One thousand, four hundred and fifty' },
    { target: 203, label: 'Two hundred and three' },
    { target: 1111, label: 'One thousand, one hundred and eleven' },
    { target: 3072, label: 'Three thousand and seventy-two' },
]



/* ─── Dot component ──────────────────────────────────────────── */
const Dot = ({ color, idx, onRemove }: { color: string; idx: number; onRemove: () => void }) => (
    <motion.button
        initial={{ scale: 0, y: -30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 18, delay: idx * 0.04 }}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.85 }}
        onClick={onRemove}
        className={`w-8 h-8 rounded-full ${color} shadow-lg cursor-pointer`}
    />
)

/* ─── Main Component ─────────────────────────────────────────── */
export const DotBuilder = () => {
    const navigate = useNavigate()
    const { addCorrect, addWrong, sessionPoints, correctCount, wrongCount, reset } = useScoreStore()
    const { completeLesson, addPoints } = useProgressStore()

    const [problemIdx, setProblemIdx] = useState(0)
    const [counts, setCounts] = useState<Record<ColId, number>>({ thousands: 0, hundreds: 0, tens: 0, ones: 0 })
    const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none')
    const [showComplete, setShowComplete] = useState(false)

    const problem = PROBLEMS[problemIdx]
    const total = COLUMNS.reduce((s, c) => s + counts[c.id] * c.value, 0)
    const target = problem.target

    const addDot = useCallback((colId: ColId, maxAllowed: number) => {
        if (counts[colId] >= maxAllowed) return
        setCounts(prev => ({ ...prev, [colId]: prev[colId] + 1 }))
    }, [counts])

    const removeDot = useCallback((colId: ColId) => {
        setCounts(prev => ({ ...prev, [colId]: Math.max(0, prev[colId] - 1) }))
    }, [])

    const clearColumn = useCallback((colId: ColId) => {
        setCounts(prev => ({ ...prev, [colId]: 0 }))
    }, [])

    const clearAll = useCallback(() => {
        setCounts({ thousands: 0, hundreds: 0, tens: 0, ones: 0 })
    }, [])

    const handleCheck = useCallback(() => {
        if (total === target) {
            addCorrect(20)
            setFeedback('correct')
            setTimeout(() => {
                setFeedback('none')
                const next = problemIdx + 1
                if (next >= PROBLEMS.length) {
                    const stars = wrongCount === 0 ? 3 : wrongCount <= 2 ? 2 : 1
                    completeLesson('place-value', 'dot-builder', stars, sessionPoints + 20)
                    addPoints(sessionPoints)
                    setShowComplete(true)
                } else {
                    setProblemIdx(next)
                    setCounts({ thousands: 0, hundreds: 0, tens: 0, ones: 0 })
                }
            }, 900)
        } else {
            addWrong()
            setFeedback('wrong')
            setTimeout(() => setFeedback('none'), 700)
        }
    }, [total, target, problemIdx, wrongCount, sessionPoints, addCorrect, addWrong, completeLesson, addPoints])

    const handleRetry = () => {
        reset()
        setProblemIdx(0)
        setCounts({ thousands: 0, hundreds: 0, tens: 0, ones: 0 })
        setShowComplete(false)
        setFeedback('none')
    }

    // Expanded form string
    const expandedParts = COLUMNS
        .filter(c => counts[c.id] > 0)
        .map(c => `${counts[c.id] * c.value}`)
    const expandedStr = expandedParts.length > 0 ? expandedParts.join(' + ') : '0'

    const playbooks = useMemo<TeachingPlaybook[]>(() => [
        {
            id: 'db_place_columns',
            description: 'Use thousands, hundreds, tens, and ones columns to match the target',
            generate: () => [
                {
                    delay: 0,
                    annotations: [
                        { action: 'pulse', element: '[data-hint-region="db-target"]', color: '#fbbf24' },
                        { action: 'label', element: '[data-hint-region="db-target"]', label: 'Target', color: '#fbbf24' },
                    ],
                    speech: 'Read the target, then tap each column to add the right number of dots.',
                },
                {
                    delay: 1200,
                    annotations: [
                        { action: 'pulse', element: '[data-hint-region="db-columns"]', color: '#60a5fa' },
                    ],
                    speech: 'Each column is a different place value—build them one at a time.',
                },
            ],
        },
        {
            id: 'db_check_total',
            description: 'Compare the expanded form and running total before checking',
            generate: () => [
                {
                    delay: 0,
                    annotations: [
                        { action: 'circle', element: '[data-hint-region="db-summary"]', color: '#34d399' },
                    ],
                    speech: 'Watch the sum at the bottom—it should match the target when you are ready.',
                },
            ],
        },
    ], [])

    const lessonContext = useMemo(() => ({
        type: 'dot_builder' as const,
        operands: [target],
    }), [target])

    return (
        <LessonShell
            lessonId="dot-builder"
            voiceConfig={VOICE_CONFIGS["dot-builder"]}
            feedback={feedback}
            problemIndex={problemIdx}
            total={PROBLEMS.length}
            attempted={correctCount + wrongCount}
            correct={correctCount}
            accentClass="bg-violet-700"
            subtitle={`Build the number: ${problem.label}`}
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

            <div className="h-full flex flex-col gap-4 p-4">
                {/* Target number display */}
                <motion.div
                    data-hint-region="db-target"
                    animate={
                        feedback === 'correct'
                            ? { backgroundColor: 'rgba(16,185,129,0.2)', borderColor: '#10b981' }
                            : feedback === 'wrong'
                                ? { x: [0, -10, 10, -8, 8, 0], borderColor: '#ef4444' }
                                : { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.15)' }
                    }
                    transition={{ duration: 0.4 }}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border py-3 px-6"
                >
                    <div className="flex items-center gap-6 min-w-0">
                        <span className="text-white/60 font-display font-bold">Target:</span>
                        <span className="text-5xl font-black font-display text-white">{target}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-auto">
                        <motion.button
                            type="button"
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={clearAll}
                            className="px-4 py-2 rounded-xl border border-white/25 text-white/85 font-display text-sm font-semibold hover:bg-white/10"
                        >
                            Clear all dots
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleCheck}
                            className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 rounded-xl text-white font-bold font-display"
                        >
                            Check ✓
                        </motion.button>
                    </div>
                </motion.div>

                {/* Columns */}
                <div data-hint-region="db-columns" className="flex-1 grid grid-cols-4 gap-3">
                    {COLUMNS.map((col) => {
                        const count = counts[col.id]

                        return (
                            <div key={col.id} className={`flex flex-col rounded-2xl border ${col.border} overflow-hidden`}>
                                {/* Header */}
                                <div className={`bg-gradient-to-b ${col.color} px-3 py-2 text-center`}>
                                    <div className="text-white font-bold font-display text-sm">{col.label}</div>
                                    <div className="text-white/60 font-display text-xs">×{col.value}</div>
                                </div>

                                {/* Dot grid */}
                                <div
                                    className="flex-1 bg-white/5 p-3 cursor-pointer"
                                    onClick={() => addDot(col.id, 9)}
                                >
                                    <div className="grid grid-cols-2 gap-2 content-start min-h-full">
                                        <AnimatePresence>
                                            {Array.from({ length: count }, (_, i) => (
                                                <Dot
                                                    key={i}
                                                    idx={i}
                                                    color={col.dot}
                                                    onRemove={() => removeDot(col.id)}
                                                />
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                    {count === 0 && (
                                        <div className="flex items-center justify-center h-full text-white/20 font-display text-sm">
                                            Tap to add
                                        </div>
                                    )}
                                </div>

                                {/* Count badge + clear column */}
                                <div className="bg-white/5 border-t border-white/10 py-2 px-2 text-center flex flex-col gap-2">
                                    <div>
                                        <span className="text-white font-black font-display text-xl">{count}</span>
                                        <span className="text-white/40 font-display text-xs ml-1">dot{count !== 1 ? 's' : ''}</span>
                                    </div>
                                    <motion.button
                                        type="button"
                                        whileHover={{ scale: count > 0 ? 1.02 : 1 }}
                                        whileTap={{ scale: count > 0 ? 0.98 : 1 }}
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            clearColumn(col.id)
                                        }}
                                        disabled={count === 0}
                                        className="w-full py-1.5 rounded-lg text-xs font-display font-semibold text-rose-300/90 bg-rose-950/40 border border-rose-500/30 hover:bg-rose-900/50 disabled:opacity-35 disabled:cursor-not-allowed"
                                    >
                                        Empty column
                                    </motion.button>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Expanded form + total */}
                <div data-hint-region="db-summary" className="flex items-center gap-4 bg-white/5 rounded-2xl px-6 py-3 border border-white/10">
                    <span className="text-white/60 font-display text-sm">{expandedStr}</span>
                    <span className="text-white/40 font-display text-sm mx-2">=</span>
                    <AnimatedCounter value={total} color="text-amber-300" fontSize="text-2xl" />
                    {total === target && (
                        <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="ml-auto text-emerald-400 text-xl"
                        >
                            ✓ Correct!
                        </motion.span>
                    )}
                </div>
            </div>
        </LessonShell>
    )
}
