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

const SQUARES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

export const SquareNumbers = () => {
    const navigate = useNavigate()
    const { addCorrect, addWrong, sessionPoints, correctCount, wrongCount, reset } = useScoreStore()
    const { completeLesson, addPoints } = useProgressStore()

    const [roundIdx, setRoundIdx] = useState(0)
    const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none')
    const [showComplete, setShowComplete] = useState(false)
    const [confetti, setConfetti] = useState(false)
    const [revealed, setRevealed] = useState(false)

    const n = SQUARES[roundIdx]
    const answer = n * n
    const attempted = correctCount + wrongCount

    const handleAnswer = useCallback((val: string) => {
        if (feedback !== 'none') return
        const ans = parseInt(val)
        if (ans === answer) {
            addCorrect(15)
            setFeedback('correct')
            setRevealed(true)
            setConfetti(true)
            setTimeout(() => {
                setConfetti(false)
                setFeedback('none')
                setRevealed(false)
                const next = roundIdx + 1
                if (next >= SQUARES.length) {
                    const stars = wrongCount === 0 ? 3 : wrongCount <= 4 ? 2 : 1
                    completeLesson('multiplication', 'square-numbers', stars, sessionPoints + 15)
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
    }, [feedback, answer, roundIdx, wrongCount, sessionPoints, addCorrect, addWrong, completeLesson, addPoints])

    const handleRetry = () => {
        reset(); setRoundIdx(0); setFeedback('none'); setRevealed(false); setShowComplete(false)
    }

    const playbooks = useMemo<TeachingPlaybook[]>(() => [
        {
            id: 'square_geo_model',
            description: 'The grid shows n rows and n columns — area is n squared',
            generate: () => [
                {
                    delay: 0,
                    annotations: [
                        { action: 'pulse', element: '[data-hint-region="square-grid"]', color: '#60a5fa' },
                        { action: 'label', element: '[data-hint-region="square-grid"]', label: `${n} by ${n}`, color: '#60a5fa' },
                    ],
                    speech: `Picture a square with ${n} tiles on each side.`,
                },
                {
                    delay: 1200,
                    annotations: [
                        { action: 'pulse', element: '[data-hint-region="square-equation"]', color: '#fbbf24' },
                    ],
                    speech: `${n} squared means ${n} times ${n}.`,
                },
            ],
        },
        {
            id: 'square_answer_entry',
            description: 'Type n × n on the keypad',
            generate: () => [
                {
                    delay: 0,
                    annotations: [
                        { action: 'circle', element: '[data-hint-region="square-numpad"]', color: '#34d399' },
                    ],
                    speech: 'Multiply the side length by itself.',
                },
            ],
        },
    ], [n])

    const lessonContext = useMemo(() => ({
        type: 'square_numbers' as const,
        operands: [n, n],
        answer,
        itemCount: answer,
    }), [n, answer])

    return (
        <LessonShell
            lessonId="square-numbers"
            voiceConfig={VOICE_CONFIGS["square-numbers"]}
            feedback={feedback}
            problemIndex={roundIdx} total={SQUARES.length} attempted={attempted} correct={correctCount}
            accentClass="bg-blue-600" subtitle={`What is ${n}²?`}
            playbooks={playbooks}
            lessonContext={lessonContext}>
            <LessonComplete show={showComplete} stars={wrongCount === 0 ? 3 : wrongCount <= 4 ? 2 : 1}
                points={sessionPoints} onRetry={handleRetry} onNext={() => navigate('/')} />
            <Confetti active={confetti} />

            <div className="h-full flex gap-6 p-4">
                <div className="flex-1 flex flex-col items-center justify-center gap-8">
                    {/* Square visual */}
                    <motion.div
                        data-hint-region="square-grid"
                        animate={feedback === 'correct' ? { borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)' }
                            : feedback === 'wrong' ? { x: [0, -8, 8, 0] } : {}}
                        className="border-2 border-white/10 rounded-2xl p-4 inline-block"
                    >
                        {Array.from({ length: n }, (_, r) => (
                            <div key={r} className="flex gap-1 mb-1">
                                {Array.from({ length: n }, (_, c) => (
                                    <motion.div
                                        key={c}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1, backgroundColor: feedback === 'correct' ? '#10b981' : '#3b82f6' }}
                                        transition={{ delay: (r * n + c) * 0.01, type: 'spring', stiffness: 400 }}
                                        className="w-7 h-7 rounded-sm"
                                    />
                                ))}
                            </div>
                        ))}
                    </motion.div>

                    <motion.div data-hint-region="square-equation" animate={feedback === 'correct' ? { color: '#10b981' } : {}}
                        className="font-black font-display text-6xl text-white text-center">
                        {n}<sup>2</sup> = {n} × {n} = <span className="text-blue-400">{revealed ? answer : '?'}</span>
                    </motion.div>

                    <div className="text-white/40 font-display text-sm">
                        A square with {n} dots on each side has {n}×{n} = {answer} dots
                    </div>
                </div>

                <div data-hint-region="square-numpad" className="w-48 flex flex-col items-center justify-center gap-4 shrink-0">
                    <div className="text-white/50 font-display text-sm">{n}² = ?</div>
                    <Numpad onAnswer={handleAnswer} maxDigits={3} />
                </div>
            </div>
        </LessonShell>
    )
}
