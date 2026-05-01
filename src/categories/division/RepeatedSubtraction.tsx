import { useState, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { LessonShell } from '../../components/layout/LessonShell'
import { VOICE_CONFIGS } from '../../utils/lessonVoiceConfigs'
import { LessonComplete } from '../../components/shared/LessonComplete'
import { Confetti } from '../../components/shared/Confetti'
import { Numpad } from '../../components/shared/Numpad'
import { useScoreStore } from '../../store/useScoreStore'
import { useProgressStore } from '../../store/useProgressStore'
import type { TeachingPlaybook } from '../../types/visualCommand'

interface Round { dividend: number; divisor: number }
const ROUNDS: Round[] = [
    { dividend: 12, divisor: 3 }, { dividend: 15, divisor: 5 }, { dividend: 20, divisor: 4 },
    { dividend: 18, divisor: 6 }, { dividend: 24, divisor: 8 }, { dividend: 21, divisor: 7 },
    { dividend: 16, divisor: 4 }, { dividend: 27, divisor: 9 }, { dividend: 30, divisor: 6 }, { dividend: 28, divisor: 7 },
]

export const RepeatedSubtraction = () => {
    const navigate = useNavigate()
    const { addCorrect, addWrong, sessionPoints, correctCount, wrongCount, reset } = useScoreStore()
    const { completeLesson, addPoints } = useProgressStore()
    const [roundIdx, setRoundIdx] = useState(0)
    const [isSimplified, setIsSimplified] = useState(false)
    const [remaining, setRemaining] = useState(ROUNDS[0].dividend)
    const [steps, setSteps] = useState(0)
    const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none')
    const [showComplete, setShowComplete] = useState(false)
    const [confetti, setConfetti] = useState(false)
    const [answered, setAnswered] = useState(false)

    const handleSwapView = useCallback((target: string) => {
        if (target === 'simplified_view') setIsSimplified(true)
    }, [])

    const round = ROUNDS[roundIdx]
    const answer = round.dividend / round.divisor
    const attempted = correctCount + wrongCount

    const handleSubtract = useCallback(() => {
        if (remaining < round.divisor || feedback !== 'none' || answered) return
        const next = remaining - round.divisor
        setRemaining(next)
        setSteps(s => s + 1)
    }, [remaining, round.divisor, feedback, answered])

    const handleAnswer = useCallback((val: string) => {
        if (feedback !== 'none' || answered) return
        const ans = parseInt(val)
        setAnswered(true)
        if (ans === answer && remaining === 0) {
            addCorrect(10)
            setFeedback('correct')
            setConfetti(true)
            setTimeout(() => {
                setConfetti(false)
                setFeedback('none')
                setAnswered(false)
                const next = roundIdx + 1
                if (next >= ROUNDS.length) {
                    const stars = wrongCount === 0 ? 3 : wrongCount <= 3 ? 2 : 1
                    completeLesson('division', 'repeated-subtraction', stars, sessionPoints + 10)
                    addPoints(sessionPoints)
                    setShowComplete(true)
                } else {
                    setRoundIdx(next)
                    setRemaining(ROUNDS[next].dividend)
                    setSteps(0)
                }
            }, 900)
        } else {
            addWrong()
            setFeedback('wrong')
            setAnswered(false)
            setTimeout(() => setFeedback('none'), 600)
        }
    }, [feedback, answered, answer, remaining, roundIdx, wrongCount, sessionPoints, addCorrect, addWrong, completeLesson, addPoints])

    const handleRetry = () => {
        reset(); setRoundIdx(0); setRemaining(ROUNDS[0].dividend); setSteps(0)
        setFeedback('none'); setAnswered(false); setShowComplete(false); setIsSimplified(false)
    }

    const playbooks = useMemo<TeachingPlaybook[]>(() => [
        {
            id: 'rep_sub_chain',
            description: 'Subtract the divisor repeatedly until you reach zero',
            generate: () => [
                {
                    delay: 0,
                    annotations: [
                        { action: 'pulse', element: '[data-hint-region="rs-equation"]', color: '#fbbf24' },
                        { action: 'label', element: '[data-hint-region="rs-equation"]', label: `${round.dividend}÷${round.divisor}`, color: '#fbbf24' },
                    ],
                    speech: `Take away ${round.divisor} from ${round.dividend} until nothing is left.`,
                },
                {
                    delay: 1200,
                    annotations: [
                        { action: 'pulse', element: '[data-hint-region="rs-sub-btn"]', color: '#2dd4bf' },
                    ],
                    speech: 'Each press removes one divisor-sized chunk.',
                },
            ],
        },
        {
            id: 'rep_sub_count_steps',
            description: 'The number of successful subtractions is the quotient',
            generate: () => [
                {
                    delay: 0,
                    annotations: [
                        { action: 'circle', element: '[data-hint-region="rs-numpad"]', color: '#34d399' },
                    ],
                    speech: 'When you hit zero, enter how many times you subtracted.',
                },
            ],
        },
    ], [round.dividend, round.divisor])

    const lessonContext = useMemo(() => ({
        type: 'repeated_subtraction' as const,
        operands: [round.dividend, round.divisor],
        answer,
    }), [round.dividend, round.divisor, answer])

    // Build steps history
    const history = Array.from({ length: steps }, (_, i) =>
        round.dividend - i * round.divisor
    )

    return (
        <LessonShell
            lessonId="repeated-subtraction"
            voiceConfig={VOICE_CONFIGS["repeated-subtraction"]}
            feedback={feedback}
            problemIndex={roundIdx} total={ROUNDS.length} attempted={attempted} correct={correctCount}
            accentClass="bg-teal-600" subtitle={`${round.dividend} ÷ ${round.divisor} — subtract ${round.divisor} each time!`}
            playbooks={playbooks}
            lessonContext={lessonContext}
            onSwapView={handleSwapView}>
            <LessonComplete show={showComplete} stars={wrongCount === 0 ? 3 : wrongCount <= 3 ? 2 : 1}
                points={sessionPoints} onRetry={handleRetry} onNext={() => navigate('/')} />
            <Confetti active={confetti} />

            <div className="h-full flex gap-6 p-4">
                <div className="flex-1 flex flex-col items-center justify-center gap-6">
                    <motion.div data-hint-region="rs-equation" animate={feedback === 'correct' ? { color: '#10b981' } : {}}
                        className="font-black font-display text-5xl text-white">
                        {round.dividend} ÷ {round.divisor} = <span className="text-teal-400">{remaining === 0 ? steps : '?'}</span>
                    </motion.div>

                    {/* Subtraction history */}
                    <div data-hint-region="rs-history" className="flex items-center gap-4 flex-wrap justify-center max-w-lg">
                        {history.map((val, i) => (
                            <div key={i} className="flex flex-col items-center gap-2">
                                {isSimplified && <span className="text-[10px] text-teal-400 font-bold uppercase tracking-widest">Step {i + 1}</span>}
                                <div className="flex items-center gap-1">
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                                        transition={{ delay: 0, type: 'spring' }}
                                        className={`bg-teal-700/50 border border-teal-500/40 rounded-xl px-3 py-2 font-black font-display text-teal-300 ${isSimplified ? 'ring-2 ring-teal-400/20' : ''}`}>
                                        {val}
                                    </motion.div>
                                    <span className="text-white/40 font-display">−{round.divisor}</span>
                                </div>
                            </div>
                        ))}
                        <div className="flex flex-col items-center gap-2">
                            {isSimplified && remaining === 0 && <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Final</span>}
                            {isSimplified && remaining > 0 && <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest">Next</span>}
                            <motion.div
                                animate={{ 
                                    backgroundColor: remaining === 0 ? 'rgba(16,185,129,0.3)' : 'rgba(20,184,166,0.2)', 
                                    borderColor: remaining === 0 ? '#10b981' : 'rgba(20,184,166,0.4)',
                                    scale: isSimplified ? 1.1 : 1
                                }}
                                className="border-2 rounded-xl px-4 py-2 font-black font-display text-2xl text-white shadow-xl shadow-teal-500/10"
                            >
                                {remaining}
                            </motion.div>
                        </div>
                    </div>

                    <motion.button
                        data-hint-region="rs-sub-btn"
                        whileHover={{ scale: remaining >= round.divisor ? 1.05 : 1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSubtract}
                        disabled={remaining < round.divisor || answered}
                        className="px-8 py-4 bg-teal-500 hover:bg-teal-400 disabled:opacity-30 disabled:cursor-default rounded-2xl text-white font-bold font-display text-xl"
                    >
                        − {round.divisor}
                    </motion.button>

                    {remaining === 0 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="text-amber-300 font-display text-lg">
                            You subtracted {steps} times! Type that as your answer →
                        </motion.div>
                    )}
                </div>

                <div data-hint-region="rs-numpad" className={`w-48 flex flex-col items-center justify-center gap-4 shrink-0 transition-opacity ${remaining === 0 ? 'opacity-100' : 'opacity-30'}`}>
                    <div className="text-white/50 font-display text-sm text-center">How many subtractions?</div>
                    <Numpad onAnswer={handleAnswer} maxDigits={2} />
                </div>
            </div>
        </LessonShell>
    )
}
