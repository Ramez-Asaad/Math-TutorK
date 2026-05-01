import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { LessonShell } from '../../components/layout/LessonShell'
import { VOICE_CONFIGS } from '../../utils/lessonVoiceConfigs'
import { LessonComplete } from '../../components/shared/LessonComplete'
import { Confetti } from '../../components/shared/Confetti'
import { useScoreStore } from '../../store/useScoreStore'
import { useProgressStore } from '../../store/useProgressStore'
import type { TeachingPlaybook } from '../../types/visualCommand'

interface Round { num: number; den: number; choices: [number, number][] }
const ROUNDS: Round[] = [
    { num: 1, den: 2, choices: [[1, 4], [1, 2], [3, 4]] },
    { num: 1, den: 4, choices: [[1, 8], [1, 4], [1, 2]] },
    { num: 3, den: 4, choices: [[1, 2], [3, 4], [1, 1]] },
    { num: 2, den: 3, choices: [[1, 3], [2, 3], [3, 3]] },
    { num: 1, den: 3, choices: [[1, 6], [1, 3], [2, 3]] },
    { num: 3, den: 8, choices: [[1, 4], [3, 8], [1, 2]] },
    { num: 2, den: 5, choices: [[1, 5], [2, 5], [3, 5]] },
    { num: 5, den: 6, choices: [[2, 3], [5, 6], [1, 1]] },
    { num: 1, den: 6, choices: [[1, 12], [1, 6], [1, 3]] },
    { num: 4, den: 5, choices: [[3, 5], [4, 5], [1, 1]] },
]

export const FractionNumberLine = () => {
    const navigate = useNavigate()
    const { addCorrect, addWrong, sessionPoints, correctCount, wrongCount, reset } = useScoreStore()
    const { completeLesson, addPoints } = useProgressStore()

    const [roundIdx, setRoundIdx] = useState(0)
    const [isSimplified, setIsSimplified] = useState(false)
    const [chosen, setChosen] = useState<[number, number] | null>(null)
    const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none')
    const [showComplete, setShowComplete] = useState(false)
    const [confetti, setConfetti] = useState(false)

    const handleSwapView = useCallback((target: string) => {
        if (target === 'simplified_view') setIsSimplified(true)
    }, [])

    const round = ROUNDS[roundIdx]
    const target = round.num / round.den
    const attempted = correctCount + wrongCount

    const handleChoice = useCallback((choice: [number, number]) => {
        if (feedback !== 'none') return
        setChosen(choice)
        const val = choice[0] / choice[1]
        if (Math.abs(val - target) < 0.001) {
            addCorrect(10)
            setFeedback('correct')
            setConfetti(true)
            setTimeout(() => {
                setConfetti(false)
                setFeedback('none')
                setChosen(null)
                const next = roundIdx + 1
                if (next >= ROUNDS.length) {
                    const stars = wrongCount === 0 ? 3 : wrongCount <= 3 ? 2 : 1
                    completeLesson('fractions', 'number-line', stars, sessionPoints + 10)
                    addPoints(sessionPoints)
                    setShowComplete(true)
                } else {
                    setRoundIdx(next)
                }
            }, 900)
        } else {
            addWrong()
            setFeedback('wrong')
            setTimeout(() => { setChosen(null); setFeedback('none') }, 700)
        }
    }, [feedback, target, roundIdx, wrongCount, sessionPoints, addCorrect, addWrong, completeLesson, addPoints])

    const handleRetry = () => {
        reset(); setRoundIdx(0); setChosen(null); setFeedback('none'); setShowComplete(false); setIsSimplified(false)
    }

    const playbooks = useMemo<TeachingPlaybook[]>(() => [
        {
            id: 'frac_line_place_value',
            description: 'Locate the fraction between 0 and 1 using the tick marks',
            generate: () => [
                {
                    delay: 0,
                    annotations: [
                        { action: 'pulse', element: '[data-hint-region="fnl-target"]', color: '#f472b6' },
                        { action: 'label', element: '[data-hint-region="fnl-target"]', label: `${round.num}/${round.den}`, color: '#f472b6' },
                    ],
                    speech: `Imagine ${round.num} of ${round.den} equal parts from zero to one.`,
                },
                {
                    delay: 1200,
                    annotations: [
                        { action: 'pulse', element: '[data-hint-region="fnl-track"]', color: '#fbbf24' },
                    ],
                    speech: 'Compare the choices — the correct one matches that distance along the line.',
                },
            ],
        },
        {
            id: 'frac_line_choose',
            description: 'Match a fraction label to the same decimal distance as the target',
            generate: () => [
                {
                    delay: 0,
                    annotations: [
                        { action: 'circle', element: '[data-hint-region="fnl-choices"]', color: '#34d399' },
                    ],
                    speech: 'If unsure, simplify mentally or compare to one half and one fourth.',
                },
            ],
        },
    ], [round.num, round.den])

    const lessonContext = useMemo(() => ({
        type: 'fraction_number_line' as const,
        operands: [round.num, round.den],
        answer: target,
    }), [round.num, round.den, target])

    // Number line from 0 to 1
    const ticks = [0, 0.25, 0.5, 0.75, 1]
    const tickLabels: Record<number, string> = { 0: '0', 0.25: '1/4', 0.5: '1/2', 0.75: '3/4', 1: '1' }

    return (
        <LessonShell
            lessonId="fraction-number-line"
            voiceConfig={VOICE_CONFIGS["fraction-number-line"]}
            feedback={feedback}
            problemIndex={roundIdx} total={ROUNDS.length} attempted={attempted} correct={correctCount}
            accentClass="bg-pink-600" subtitle={`Where is ${round.num}/${round.den} on the number line?`}
            playbooks={playbooks}
            lessonContext={lessonContext}
            onSwapView={handleSwapView}>
            <LessonComplete show={showComplete} stars={wrongCount === 0 ? 3 : wrongCount <= 3 ? 2 : 1}
                points={sessionPoints} onRetry={handleRetry} onNext={() => navigate('/')} />
            <Confetti active={confetti} />

            <div className="h-full flex flex-col items-center justify-center gap-10 p-6">
                {/* Target fraction */}
                <motion.div data-hint-region="fnl-target" animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}
                    className="bg-pink-500/20 border border-pink-400/40 rounded-2xl px-8 py-4 text-center">
                    <div className="text-white/60 font-display text-sm">Place this fraction</div>
                    <div className="text-pink-300 font-black font-display text-5xl">{round.num}/{round.den}</div>
                </motion.div>

                {isSimplified && (
                    <div className="w-full max-w-2xl h-8 flex gap-1 px-4 mb-2">
                        {Array.from({ length: round.den }, (_, i) => (
                            <div key={i} className={`flex-1 rounded-md border border-white/20 transition-colors ${i < round.num ? 'bg-pink-500/40 border-pink-400' : 'bg-white/5'}`} />
                        ))}
                    </div>
                )}

                {/* Number line */}
                <div className="w-full max-w-2xl relative px-4">
                    <div data-hint-region="fnl-track" className="h-3 bg-white/10 rounded-full relative">
                        {ticks.map(t => (
                            <div key={t} className="absolute flex flex-col items-center"
                                style={{ left: `${t * 100}%`, transform: 'translateX(-50%)' }}>
                                <div className="w-0.5 h-5 bg-white/40 -mt-1" />
                                <span className="text-white/50 font-display text-xs mt-1">{tickLabels[t]}</span>
                            </div>
                        ))}

                        {/* Star marker at target (hidden until correct) */}
                        <AnimatePresence>
                            {feedback === 'correct' && (
                                <motion.div initial={{ scale: 0, y: -20 }} animate={{ scale: 1, y: -16 }}
                                    className="absolute" style={{ left: `${target * 100}%`, transform: 'translateX(-50%)' }}>
                                    <span className="text-yellow-400 text-2xl">⭐</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Choices */}
                <div data-hint-region="fnl-choices" className="flex gap-4 justify-center flex-wrap">
                    {round.choices.map(([n, d], i) => {
                        const isChosen = chosen && chosen[0] === n && chosen[1] === d
                        return (
                            <motion.button
                                key={i}
                                whileHover={{ scale: 1.08, y: -4 }}
                                whileTap={{ scale: 0.92 }}
                                onClick={() => handleChoice([n, d])}
                                animate={isChosen
                                    ? feedback === 'correct'
                                        ? { backgroundColor: 'rgba(16,185,129,0.3)', borderColor: '#10b981' }
                                        : { backgroundColor: 'rgba(239,68,68,0.3)', borderColor: '#ef4444', x: [0, -6, 6, 0] }
                                    : {}}
                                className="px-8 py-4 rounded-2xl border-2 border-white/20 bg-white/6 text-white font-black font-display text-3xl hover:border-pink-400/60 transition-colors"
                            >
                                {n}/{d}
                            </motion.button>
                        )
                    })}
                </div>

                <div className="flex gap-6 text-sm font-display">
                    <span className="text-emerald-400">✓ {correctCount}</span>
                    <span className="text-rose-400">✗ {wrongCount}</span>
                </div>
            </div>
        </LessonShell>
    )
}
