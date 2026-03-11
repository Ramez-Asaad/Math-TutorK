import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { LessonShell } from '../../components/layout/LessonShell'
import { VOICE_CONFIGS } from '../../utils/lessonVoiceConfigs'
import { LessonComplete } from '../../components/shared/LessonComplete'
import { Confetti } from '../../components/shared/Confetti'
import { Numpad } from '../../components/shared/Numpad'
import { useScoreStore } from '../../store/useScoreStore'
import { useProgressStore } from '../../store/useProgressStore'

interface Round { whole: number; num: number; den: number }
type Field = 'whole' | 'num' | 'den'
interface RoundConfig { problem: Round; missing: Field }

const ROUNDS: RoundConfig[] = [
    { problem: { whole: 1, num: 1, den: 2 }, missing: 'num' },
    { problem: { whole: 2, num: 3, den: 4 }, missing: 'whole' },
    { problem: { whole: 1, num: 2, den: 3 }, missing: 'den' },
    { problem: { whole: 3, num: 1, den: 4 }, missing: 'num' },
    { problem: { whole: 2, num: 1, den: 2 }, missing: 'whole' },
    { problem: { whole: 1, num: 3, den: 5 }, missing: 'den' },
    { problem: { whole: 4, num: 2, den: 3 }, missing: 'num' },
    { problem: { whole: 2, num: 3, den: 5 }, missing: 'whole' },
    { problem: { whole: 1, num: 5, den: 6 }, missing: 'den' },
    { problem: { whole: 3, num: 3, den: 4 }, missing: 'num' },
]

export const MixedNumbers = () => {
    const navigate = useNavigate()
    const { addCorrect, addWrong, sessionPoints, correctCount, wrongCount, reset } = useScoreStore()
    const { completeLesson, addPoints } = useProgressStore()

    const [roundIdx, setRoundIdx] = useState(0)
    const [activeField, setActiveField] = useState<Field | null>(null)
    const [filled, setFilled] = useState<Partial<Record<Field, number>>>({})
    const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none')
    const [showComplete, setShowComplete] = useState(false)
    const [confetti, setConfetti] = useState(false)

    const { problem, missing } = ROUNDS[roundIdx]
    const attempted = correctCount + wrongCount
    const totalValue = problem.whole + problem.num / problem.den

    const getDisplayValue = (field: Field): number | null => {
        if (field !== missing) return problem[field]
        return filled[field] ?? null
    }

    const handleAnswer = useCallback((val: string) => {
        if (!activeField || activeField !== missing || feedback !== 'none') return
        const ans = parseInt(val)
        const correct = problem[missing]
        if (ans === correct) {
            const newFilled = { ...filled, [activeField]: ans }
            setFilled(newFilled)
            setActiveField(null)
            addCorrect(15)
            setFeedback('correct')
            setConfetti(true)
            setTimeout(() => {
                setConfetti(false)
                setFeedback('none')
                setFilled({})
                const next = roundIdx + 1
                if (next >= ROUNDS.length) {
                    const stars = wrongCount === 0 ? 3 : wrongCount <= 3 ? 2 : 1
                    completeLesson('fractions', 'mixed-numbers', stars, sessionPoints + 15)
                    addPoints(sessionPoints)
                    setShowComplete(true)
                } else {
                    setRoundIdx(next)
                }
            }, 1000)
        } else {
            addWrong()
            setFeedback('wrong')
            setTimeout(() => setFeedback('none'), 600)
        }
    }, [activeField, missing, feedback, problem, filled, roundIdx, wrongCount, sessionPoints, addCorrect, addWrong, completeLesson, addPoints])

    const handleRetry = () => {
        reset(); setRoundIdx(0); setFilled({}); setActiveField(null); setFeedback('none'); setShowComplete(false)
    }

    const renderField = (field: Field) => {
        const val = getDisplayValue(field)
        const isBlank = field === missing
        const isFilled = isBlank && filled[field] !== undefined
        const isActive = activeField === field

        return (
            <motion.div
                onClick={() => isBlank && !isFilled && setActiveField(field)}
                animate={isBlank && !isFilled
                    ? isActive
                        ? { borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.15)' }
                        : { borderColor: 'rgba(255,255,255,0.35)' }
                    : isFilled
                        ? { borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)' }
                        : { borderColor: 'rgba(255,255,255,0.1)' }}
                className={`min-w-[56px] h-14 rounded-xl border-2 flex items-center justify-center font-black font-display text-2xl
          ${isBlank && !isFilled ? 'cursor-pointer' : ''}`}
            >
                {isFilled ? (
                    <span className="text-emerald-400">{filled[field]}</span>
                ) : isBlank ? (
                    isActive
                        ? <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 0.8, repeat: Infinity }} className="text-amber-400">?</motion.span>
                        : <span className="text-white/25">?</span>
                ) : (
                    <span className="text-white">{val}</span>
                )}
            </motion.div>
        )
    }

    // How many whole pies to draw
    const totalWhole = problem.whole
    const extraNum = problem.num
    const extraDen = problem.den

    return (
        <LessonShell
            voiceConfig={VOICE_CONFIGS["mixed-numbers"]}
            feedback={feedback}
            problemIndex={roundIdx} total={ROUNDS.length} attempted={attempted} correct={correctCount}
            accentClass="bg-pink-600" subtitle="Fill in the missing piece of the mixed number!">
            <LessonComplete show={showComplete} stars={wrongCount === 0 ? 3 : wrongCount <= 3 ? 2 : 1}
                points={sessionPoints} onRetry={handleRetry} onNext={() => navigate('/')} />
            <Confetti active={confetti} />

            <div className="h-full flex gap-6 p-4">
                <div className="flex-1 flex flex-col items-center justify-center gap-8">
                    {/* Visual pies */}
                    <div className="flex gap-3 items-center flex-wrap justify-center">
                        {Array.from({ length: totalWhole }, (_, i) => (
                            <motion.div key={i}
                                initial={{ scale: 0 }} animate={{ scale: 1 }}
                                transition={{ delay: i * 0.1, type: 'spring' }}
                                className="w-16 h-16 rounded-full bg-pink-500 border-2 border-pink-400 flex items-center justify-center text-white font-bold font-display text-xs">
                                1
                            </motion.div>
                        ))}
                        {/* Partial pie */}
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                            transition={{ delay: totalWhole * 0.1, type: 'spring' }}
                            className="flex flex-col items-center">
                            <svg width="64" height="64">
                                <circle cx="32" cy="32" r="28" fill="rgba(244,114,182,0.15)" stroke="rgba(244,114,182,0.4)" strokeWidth="2" />
                                <path
                                    d={`M 32 32 L 32 4 A 28 28 0 ${extraNum / extraDen > 0.5 ? 1 : 0} 1 ${32 + 28 * Math.sin(2 * Math.PI * extraNum / extraDen)} ${32 - 28 * Math.cos(2 * Math.PI * extraNum / extraDen)} Z`}
                                    fill="rgba(244,114,182,0.7)"
                                />
                            </svg>
                            <span className="text-pink-300 font-display text-xs">{extraNum}/{extraDen}</span>
                        </motion.div>
                    </div>

                    {/* Mixed number display */}
                    <motion.div
                        animate={feedback === 'correct' ? { scale: 1.05 } : feedback === 'wrong' ? { x: [0, -8, 8, 0] } : {}}
                        className="flex items-center gap-3 border-2 border-white/10 rounded-3xl px-10 py-6"
                    >
                        {renderField('whole')}
                        <span className="text-white/40 font-display text-3xl"> and </span>
                        <div className="flex flex-col items-center">
                            {renderField('num')}
                            <div className="w-full h-0.5 bg-white/30 my-1" />
                            {renderField('den')}
                        </div>
                    </motion.div>

                    <div className="text-white/40 font-display text-sm">
                        Total value: {totalValue.toFixed(2)} &nbsp;|&nbsp; {problem.whole} + {problem.num}/{problem.den}
                    </div>
                </div>

                <div className={`w-48 flex flex-col items-center justify-center gap-4 shrink-0 transition-opacity ${activeField ? 'opacity-100' : 'opacity-40'}`}>
                    <div className="text-white/50 font-display text-sm text-center">
                        {activeField ? 'Type the missing number' : 'Tap the ?'}
                    </div>
                    <Numpad onAnswer={handleAnswer} maxDigits={2} />
                </div>
            </div>
        </LessonShell>
    )
}
