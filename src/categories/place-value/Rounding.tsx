import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { LessonShell } from '../../components/layout/LessonShell'
import { VOICE_CONFIGS } from '../../utils/lessonVoiceConfigs'
import { LessonComplete } from '../../components/shared/LessonComplete'
import { useScoreStore } from '../../store/useScoreStore'
import { useProgressStore } from '../../store/useProgressStore'
import { SPRING } from '../../utils/animationPresets'

/* ─── Problems ───────────────────────────────────────────────── */
interface RoundProblem {
    number: number
    low: number
    high: number
    answer: number
}

const PROBLEMS: RoundProblem[] = [
    { number: 23, low: 20, high: 30, answer: 20 },
    { number: 47, low: 40, high: 50, answer: 50 },
    { number: 65, low: 60, high: 70, answer: 70 },
    { number: 82, low: 80, high: 90, answer: 80 },
    { number: 35, low: 30, high: 40, answer: 40 }, // exact mid rounds up
    { number: 154, low: 150, high: 160, answer: 150 },
    { number: 278, low: 270, high: 280, answer: 280 },
]

/* ─── Main Component ─────────────────────────────────────────── */
export const Rounding = () => {
    const navigate = useNavigate()
    const { addCorrect, addWrong, sessionPoints, correctCount, wrongCount, reset } = useScoreStore()
    const { completeLesson, addPoints } = useProgressStore()

    const [probIdx, setProbIdx] = useState(0)
    const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none')
    const [showComplete, setShowComplete] = useState(false)
    const [answered, setAnswered] = useState(false)

    const problem = PROBLEMS[probIdx]
    const range = problem.high - problem.low
    const position = ((problem.number - problem.low) / range) * 100 // percentage
    const midpoint = 50 // always at 50% of the line

    const handleChoice = useCallback((choice: number) => {
        if (answered) return
        if (choice === problem.answer) {
            addCorrect(15)
            setFeedback('correct')
            setAnswered(true)
            setTimeout(() => {
                setFeedback('none')
                setAnswered(false)
                const next = probIdx + 1
                if (next >= PROBLEMS.length) {
                    const stars = wrongCount === 0 ? 3 : wrongCount <= 2 ? 2 : 1
                    completeLesson('place-value', 'rounding', stars, sessionPoints + 15)
                    addPoints(sessionPoints)
                    setShowComplete(true)
                } else {
                    setProbIdx(next)
                }
            }, 1200)
        } else {
            addWrong()
            setFeedback('wrong')
            setTimeout(() => setFeedback('none'), 700)
        }
    }, [answered, problem.answer, probIdx, wrongCount, sessionPoints, addCorrect, addWrong, completeLesson, addPoints])

    const handleRetry = () => {
        reset(); setProbIdx(0); setShowComplete(false); setFeedback('none'); setAnswered(false)
    }

    return (
        <LessonShell
            voiceConfig={VOICE_CONFIGS["rounding"]}
            feedback={feedback}
            problemIndex={0}
            total={PROBLEMS.length} attempted={correctCount + wrongCount}
            correct={correctCount} accentClass="bg-violet-700"
            subtitle={`Round ${problem.number} to the nearest ten`}
        >
            <LessonComplete
                show={showComplete}
                stars={wrongCount === 0 ? 3 : wrongCount <= 2 ? 2 : 1}
                points={sessionPoints}
                onRetry={handleRetry}
                onNext={() => navigate('/')}
            />

            <div className="h-full flex flex-col items-center justify-center gap-8 p-6">
                {/* Current number */}
                <motion.div
                    animate={
                        feedback === 'wrong'
                            ? { x: [0, -8, 8, -6, 6, -4, 4, 0] }
                            : { x: 0 }
                    }
                    transition={SPRING}
                    className="text-center"
                >
                    <div className="text-white/50 font-display text-sm mb-1">Round this number:</div>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={probIdx}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1, y: [0, -4, 0] }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{
                                scale: SPRING,
                                y: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
                            }}
                            className="text-7xl font-black font-display text-amber-300"
                        >
                            {problem.number}
                        </motion.div>
                    </AnimatePresence>
                </motion.div>

                {/* Number line */}
                <div className="w-full max-w-xl relative px-8">
                    {/* Track */}
                    <div className="h-3 bg-white/10 rounded-full relative overflow-visible">
                        {/* Midpoint glow */}
                        <motion.div
                            animate={{
                                opacity: Math.abs(position - midpoint) < 3 ? [0.5, 1, 0.5] : 0.3,
                                boxShadow: Math.abs(position - midpoint) < 3
                                    ? '0 0 20px rgba(245,158,11,0.6)' : 'none',
                            }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-amber-400"
                            style={{ left: '50%', transform: 'translate(-50%, -50%)' }}
                        />

                        {/* Ticks */}
                        {Array.from({ length: 11 }, (_, i) => (
                            <div
                                key={i}
                                className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 bg-white/20"
                                style={{ left: `${i * 10}%` }}
                            />
                        ))}

                        {/* Arrow pointer */}
                        <motion.div
                            initial={{ left: '0%' }}
                            animate={{
                                left: answered && feedback === 'correct'
                                    ? `${((problem.answer - problem.low) / range) * 100}%`
                                    : `${position}%`,
                            }}
                            transition={SPRING}
                            className="absolute -top-8"
                            style={{ transform: 'translateX(-50%)' }}
                        >
                            <motion.div
                                animate={{ y: [0, -4, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                            >
                                <div className="text-3xl">📍</div>
                            </motion.div>
                        </motion.div>
                    </div>

                    {/* End labels */}
                    <div className="flex justify-between mt-6">
                        <motion.button
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => handleChoice(problem.low)}
                            className={`px-8 py-4 rounded-2xl border-2 font-black font-display text-3xl transition-colors ${feedback === 'correct' && problem.answer === problem.low
                                    ? 'bg-emerald-500/30 border-emerald-400 text-emerald-300'
                                    : 'bg-white/5 border-white/20 text-white hover:bg-white/10'
                                }`}
                        >
                            {problem.low}
                        </motion.button>

                        <div className="flex flex-col items-center">
                            <span className="text-amber-400/60 font-display text-xs mt-1">midpoint</span>
                            <span className="text-white/30 font-display text-sm">
                                {problem.low + range / 2}
                            </span>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => handleChoice(problem.high)}
                            className={`px-8 py-4 rounded-2xl border-2 font-black font-display text-3xl transition-colors ${feedback === 'correct' && problem.answer === problem.high
                                    ? 'bg-emerald-500/30 border-emerald-400 text-emerald-300'
                                    : 'bg-white/5 border-white/20 text-white hover:bg-white/10'
                                }`}
                        >
                            {problem.high}
                        </motion.button>
                    </div>
                </div>

                {/* Feedback text */}
                <AnimatePresence>
                    {feedback === 'correct' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={SPRING}
                            className="text-emerald-400 font-black font-display text-xl"
                        >
                            ✓ {problem.number} rounds to {problem.answer}!
                        </motion.div>
                    )}
                    {feedback === 'wrong' && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="text-red-400 font-display text-lg"
                        >
                            Think again — which end is closer?
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </LessonShell>
    )
}
