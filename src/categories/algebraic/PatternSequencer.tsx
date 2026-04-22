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

/* ─── Pattern types ──────────────────────────────────────────── */
interface PatternProblem {
    sequence: string[]
    blankIdx: number
    options: string[]
    answer: string
}

const PROBLEMS: PatternProblem[] = [
    { sequence: ['🔴', '🔵', '🔴', '🔵', '?', '🔵'], blankIdx: 4, options: ['🔴', '🟢', '🔵', '🟡'], answer: '🔴' },
    { sequence: ['▲', '●', '■', '▲', '●', '?'], blankIdx: 5, options: ['▲', '●', '■', '◆'], answer: '■' },
    { sequence: ['2', '4', '6', '?', '10'], blankIdx: 3, options: ['7', '8', '9', '5'], answer: '8' },
    { sequence: ['🌟', '🌙', '🌟', '🌟', '🌙', '🌟', '🌟', '🌟', '🌙', '?'], blankIdx: 9, options: ['🌟', '🌙', '☀️', '⭐'], answer: '🌟' },
    { sequence: ['A', 'B', 'C', 'A', 'B', '?'], blankIdx: 5, options: ['A', 'B', 'C', 'D'], answer: 'C' },
    { sequence: ['1', '3', '5', '7', '?'], blankIdx: 4, options: ['8', '9', '10', '6'], answer: '9' },
    { sequence: ['🟢', '🟢', '🔴', '🟢', '🟢', '🔴', '?', '🟢', '🔴'], blankIdx: 6, options: ['🔴', '🟢', '🔵', '🟡'], answer: '🟢' },
]

/* ─── Main Component ─────────────────────────────────────────── */
export const PatternSequencer = () => {
    const navigate = useNavigate()
    const { addCorrect, addWrong, sessionPoints, correctCount, wrongCount, reset } = useScoreStore()
    const { completeLesson, addPoints } = useProgressStore()

    const [probIdx, setProbIdx] = useState(0)
    const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none')
    const [showComplete, setShowComplete] = useState(false)
    const [selected, setSelected] = useState<string | null>(null)

    const problem = PROBLEMS[probIdx]

    const handleChoice = useCallback((choice: string) => {
        setSelected(choice)
        if (choice === problem.answer) {
            addCorrect(15)
            setFeedback('correct')
            setTimeout(() => {
                setFeedback('none')
                setSelected(null)
                const next = probIdx + 1
                if (next >= PROBLEMS.length) {
                    const stars = wrongCount === 0 ? 3 : wrongCount <= 2 ? 2 : 1
                    completeLesson('algebraic', 'patterns', stars, sessionPoints + 15)
                    addPoints(sessionPoints)
                    setShowComplete(true)
                } else {
                    setProbIdx(next)
                }
            }, 900)
        } else {
            addWrong()
            setFeedback('wrong')
            setTimeout(() => { setFeedback('none'); setSelected(null) }, 700)
        }
    }, [problem.answer, probIdx, wrongCount, sessionPoints, addCorrect, addWrong, completeLesson, addPoints])

    const handleRetry = () => {
        reset(); setProbIdx(0); setShowComplete(false); setFeedback('none'); setSelected(null)
    }

    const playbooks = useMemo<TeachingPlaybook[]>(() => [
        {
            id: 'ps_spot_repeat',
            description: 'Look for a repeating unit or step across the conveyor',
            generate: () => [
                {
                    delay: 0,
                    annotations: [
                        { action: 'pulse', element: '[data-hint-region="ps-conveyor"]', color: '#fbbf24' },
                        { action: 'label', element: '[data-hint-region="ps-conveyor"]', label: 'Pattern', color: '#fbbf24' },
                    ],
                    speech: 'Read left to right and notice what chunk keeps coming back.',
                },
                {
                    delay: 1200,
                    annotations: [
                        { action: 'pulse', element: '[data-hint-region="ps-conveyor"]', color: '#60a5fa' },
                    ],
                    speech: 'Predict what should sit in the dashed slot using the same rule as earlier terms.',
                },
            ],
        },
        {
            id: 'ps_choose_tile',
            description: 'Pick the option that continues the rule',
            generate: () => [
                {
                    delay: 0,
                    annotations: [
                        { action: 'circle', element: '[data-hint-region="ps-options"]', color: '#34d399' },
                    ],
                    speech: 'Compare each choice to the repeating piece before you tap.',
                },
            ],
        },
    ], [])

    const lessonContext = useMemo(() => ({
        type: 'pattern_sequencer' as const,
        itemCount: problem.sequence.length,
    }), [problem.sequence.length])

    return (
        <LessonShell
            lessonId="patterns"
            voiceConfig={VOICE_CONFIGS["patterns"]}
            feedback={feedback}
            problemIndex={probIdx}
            total={PROBLEMS.length} attempted={correctCount + wrongCount}
            correct={correctCount} accentClass="bg-teal-600"
            subtitle="Find the missing piece in the pattern!"
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
                {/* Conveyor belt */}
                <div className="w-full max-w-2xl">
                    <div className="text-white/40 font-display text-sm text-center mb-2">Pattern Conveyor</div>

                    <motion.div
                        data-hint-region="ps-conveyor"
                        animate={feedback === 'wrong' ? { x: [0, -8, 8, -6, 6, -4, 4, 0] } : { x: 0 }}
                        transition={SPRING}
                        className="relative bg-white/5 rounded-3xl border border-white/10 px-6 py-8 overflow-hidden"
                    >
                        {/* Belt lines */}
                        <motion.div
                            animate={{ backgroundPositionX: ['0px', '-40px'] }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                            className="absolute inset-x-0 bottom-0 h-3 opacity-20"
                            style={{ backgroundImage: 'repeating-linear-gradient(90deg, #fff 0px, #fff 10px, transparent 10px, transparent 20px)', backgroundSize: '40px 3px' }}
                        />

                        {/* Sequence items */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={probIdx}
                                initial={{ opacity: 0, x: 40 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -40 }}
                                transition={SPRING}
                                className="flex items-center justify-center gap-4"
                            >
                                {problem.sequence.map((item, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ scale: 0 }}
                                        animate={{
                                            scale: 1,
                                            y: i === problem.blankIdx ? [0, -6, 0] : [0, -4, 0],
                                        }}
                                        transition={{
                                            scale: { ...SPRING, delay: i * 0.06 },
                                            y: { duration: 2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.1 },
                                        }}
                                        className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-black font-display ${i === problem.blankIdx
                                            ? feedback === 'correct'
                                                ? 'bg-emerald-500/30 border-2 border-emerald-400'
                                                : 'bg-amber-500/20 border-2 border-amber-400 border-dashed'
                                            : 'bg-white/10 border border-white/20'
                                            }`}
                                    >
                                        {i === problem.blankIdx
                                            ? (feedback === 'correct' ? problem.answer : selected || '?')
                                            : item}
                                    </motion.div>
                                ))}
                            </motion.div>
                        </AnimatePresence>
                    </motion.div>
                </div>

                {/* Options tray */}
                <div data-hint-region="ps-options" className="flex gap-4">
                    <span className="text-white/40 font-display text-sm self-center mr-2">Choose:</span>
                    {problem.options.map((opt, i) => (
                        <motion.button
                            key={`${probIdx}-${opt}-${i}`}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ ...SPRING, delay: i * 0.06 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleChoice(opt)}
                            disabled={feedback !== 'none'}
                            className={`w-16 h-16 rounded-xl border-2 flex items-center justify-center text-2xl font-black font-display transition-colors ${selected === opt && feedback === 'correct'
                                ? 'bg-emerald-500/30 border-emerald-400'
                                : selected === opt && feedback === 'wrong'
                                    ? 'bg-red-500/30 border-red-400'
                                    : 'bg-white/5 border-white/20 hover:bg-white/10 text-white'
                                }`}
                        >
                            {opt}
                        </motion.button>
                    ))}
                </div>

                {/* Feedback */}
                <AnimatePresence>
                    {feedback === 'correct' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={SPRING}
                            className="text-emerald-400 font-black font-display text-xl">✓ Pattern continues!</motion.div>
                    )}
                </AnimatePresence>
            </div>
        </LessonShell>
    )
}
