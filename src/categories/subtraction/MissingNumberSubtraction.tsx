import { useState, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { LessonShell } from '../../components/layout/LessonShell'
import { VOICE_CONFIGS } from '../../utils/lessonVoiceConfigs'
import { Numpad } from '../../components/shared/Numpad'
import { LessonComplete } from '../../components/shared/LessonComplete'
import { Confetti } from '../../components/shared/Confetti'
import { useScoreStore } from '../../store/useScoreStore'
import { useProgressStore } from '../../store/useProgressStore'
import type { TeachingPlaybook } from '../../types/visualCommand'

type MissingPos = 'result' | 'subtrahend' | 'minuend'
interface Round { a: number; b: number; missing: MissingPos }
const ROUNDS: Round[] = [
    { a: 9, b: 4, missing: 'result' },
    { a: 10, b: 3, missing: 'subtrahend' },
    { a: 12, b: 5, missing: 'minuend' },
    { a: 15, b: 7, missing: 'result' },
    { a: 14, b: 6, missing: 'subtrahend' },
    { a: 20, b: 8, missing: 'minuend' },
    { a: 18, b: 9, missing: 'result' },
    { a: 13, b: 5, missing: 'subtrahend' },
    { a: 16, b: 7, missing: 'minuend' },
    { a: 11, b: 4, missing: 'result' },
]

export const MissingNumberSubtraction = () => {
    const navigate = useNavigate()
    const { addCorrect, addWrong, sessionPoints, correctCount, wrongCount, reset } = useScoreStore()
    const { completeLesson, addPoints } = useProgressStore()
    const [roundIdx, setRoundIdx] = useState(0)
    const [isSimplified, setIsSimplified] = useState(false)
    const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none')
    const [showComplete, setShowComplete] = useState(false)
    const [confetti, setConfetti] = useState(false)
    const [revealed, setRevealed] = useState<number | null>(null)

    const handleSwapView = useCallback((target: string) => {
        if (target === 'simplified_view') setIsSimplified(true)
    }, [])

    const round = ROUNDS[roundIdx]
    const result = round.a - round.b
    const answer = round.missing === 'result' ? result : round.missing === 'subtrahend' ? round.b : round.a
    const attempted = correctCount + wrongCount

    const display = (pos: MissingPos) => {
        if (round.missing === pos) {
            return revealed !== null ? (
                <span className="text-emerald-400">{revealed}</span>
            ) : (
                <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1, repeat: Infinity }}
                    className="text-amber-400">?</motion.span>
            )
        }
        return <span>{pos === 'minuend' ? round.a : pos === 'subtrahend' ? round.b : result}</span>
    }

    const handleAnswer = useCallback((val: string) => {
        if (feedback !== 'none') return
        const ans = parseInt(val)
        if (ans === answer) {
            addCorrect(15)
            setFeedback('correct')
            setRevealed(ans)
            setConfetti(true)
            setTimeout(() => {
                setConfetti(false)
                setFeedback('none')
                setRevealed(null)
                const next = roundIdx + 1
                if (next >= ROUNDS.length) {
                    const stars = wrongCount === 0 ? 3 : wrongCount <= 3 ? 2 : 1
                    completeLesson('subtraction', 'missing-number', stars, sessionPoints + 15)
                    addPoints(sessionPoints)
                    setShowComplete(true)
                } else {
                    setRoundIdx(next)
                }
            }, 900)
        } else {
            addWrong()
            setFeedback('wrong')
            setTimeout(() => setFeedback('none'), 600)
        }
    }, [feedback, answer, roundIdx, wrongCount, sessionPoints, addCorrect, addWrong, completeLesson, addPoints])

    const handleRetry = () => {
        reset(); setRoundIdx(0); setFeedback('none'); setRevealed(null); setShowComplete(false); setIsSimplified(false)
    }

    const hint = round.missing === 'result'
        ? `Think: ${round.a} take away ${round.b}`
        : round.missing === 'subtrahend'
            ? `Think: what do you take from ${round.a} to get ${result}?`
            : `Think: what number minus ${round.b} equals ${result}?`

    const playbooks = useMemo<TeachingPlaybook[]>(() => [
        {
            id: 'miss_sub_equation_roles',
            description: 'Name minuend, subtrahend, and difference using the big equation',
            generate: () => [
                {
                    delay: 0,
                    annotations: [
                        { action: 'pulse', element: '[data-hint-region="miss-sub-eq"]', color: '#fbbf24' },
                        { action: 'label', element: '[data-hint-region="miss-sub-eq"]', label: 'Subtraction', color: '#fbbf24' },
                    ],
                    speech: round.missing === 'result'
                        ? `Find the result: ${round.a} minus ${round.b}.`
                        : round.missing === 'subtrahend'
                            ? `What do you subtract from ${round.a} to land on ${result}?`
                            : `What whole number minus ${round.b} equals ${result}?`,
                },
            ],
        },
        {
            id: 'miss_sub_dot_strip',
            description: 'Use the dot model — orange stays, red shows what was removed',
            generate: () => [
                {
                    delay: 0,
                    annotations: [
                        { action: 'pulse', element: '[data-hint-region="miss-sub-dots"]', color: '#fb923c' },
                        { action: 'label', element: '[data-hint-region="miss-sub-dots"]', label: `${round.a} total`, color: '#fb923c' },
                    ],
                    speech: `The strip has ${round.a} dots. ${result} stay orange; ${round.b} were taken away.`,
                },
                {
                    delay: 1200,
                    annotations: [
                        { action: 'pulse', element: '[data-hint-region="miss-sub-numpad"]', color: '#a78bfa' },
                    ],
                    speech: 'Type the missing number on the keypad.',
                },
            ],
        },
    ], [round.a, round.b, round.missing, result])

    const lessonContext = useMemo(() => ({
        type: 'missing_subtraction' as const,
        operands: [round.a, round.b],
        answer,
        currentStep: round.missing === 'result' ? 2 : round.missing === 'subtrahend' ? 1 : 0,
        totalSteps: 3,
    }), [round.a, round.b, answer, round.missing])

    return (
        <LessonShell
            lessonId="missing-number-subtraction"
            voiceConfig={VOICE_CONFIGS["missing-number-subtraction"]}
            feedback={feedback}
            problemIndex={roundIdx} total={ROUNDS.length} attempted={attempted} correct={correctCount}
            accentClass="bg-orange-600" subtitle="Find the missing number!"
            playbooks={playbooks}
            lessonContext={lessonContext}
            onSwapView={handleSwapView}>
            <LessonComplete show={showComplete} stars={wrongCount === 0 ? 3 : wrongCount <= 3 ? 2 : 1}
                points={sessionPoints} onRetry={handleRetry} onNext={() => navigate('/')} />
            <Confetti active={confetti} />

            <div className="h-full flex gap-6 p-4">
                <div className="flex-1 flex flex-col items-center justify-center gap-8">
                    <motion.div
                        data-hint-region="miss-sub-eq"
                        animate={feedback === 'correct' ? { scale: 1.05, color: '#10b981' } : feedback === 'wrong' ? { x: [0, -8, 8, 0] } : {}}
                        className="font-black font-display text-8xl text-white text-center"
                    >
                        {display('minuend')} − {display('subtrahend')} = {display('result')}
                    </motion.div>

                    {isSimplified && (
                        <div className="w-full max-w-lg h-1 bg-white/20 rounded-full relative -mt-4">
                            <div className="absolute left-1/2 top-0 -translate-x-1/2 w-4 h-4 bg-white/10 rotate-45 -translate-y-1/2 border border-white/20" />
                        </div>
                    )}

                    <div className="text-white/40 font-display text-sm italic">{hint}</div>

                    {/* Visual dots */}
                    <div data-hint-region="miss-sub-dots" className={`gap-2 justify-center ${isSimplified ? 'grid grid-cols-5' : 'flex flex-wrap max-w-xs'}`}>
                        {Array.from({ length: round.a }, (_, i) => (
                            <motion.div
                                key={i}
                                animate={{ backgroundColor: i < result ? '#f97316' : 'rgba(239,68,68,0.4)', scale: 1 }}
                                className="w-5 h-5 rounded-full"
                            />
                        ))}
                    </div>
                    <div className="text-white/30 font-display text-xs">
                        🟠 = remaining ({result})  🔴 = removed ({round.b})
                    </div>
                </div>

                <div data-hint-region="miss-sub-numpad" className="w-48 flex flex-col items-center justify-center gap-4 shrink-0">
                    <div className="text-white/50 font-display text-sm text-center">What's the ?</div>
                    <Numpad onAnswer={handleAnswer} maxDigits={2} />
                </div>
            </div>
        </LessonShell>
    )
}
