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

interface Round { rows: number; cols: number }
const ROUNDS: Round[] = [
    { rows: 3, cols: 4 }, { rows: 2, cols: 6 }, { rows: 4, cols: 3 },
    { rows: 5, cols: 3 }, { rows: 4, cols: 4 }, { rows: 3, cols: 6 },
    { rows: 5, cols: 4 }, { rows: 6, cols: 3 }, { rows: 2, cols: 8 }, { rows: 5, cols: 5 },
]

export const ArrayBuilder = () => {
    const navigate = useNavigate()
    const { addCorrect, addWrong, sessionPoints, correctCount, wrongCount, reset } = useScoreStore()
    const { completeLesson, addPoints } = useProgressStore()
    const [roundIdx, setRoundIdx] = useState(0)
    const [isSimplified, setIsSimplified] = useState(false)
    const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none')
    const [showComplete, setShowComplete] = useState(false)
    const [confetti, setConfetti] = useState(false)
    const [hoveredRow, setHoveredRow] = useState<number | null>(null)
    const [hoveredCol, setHoveredCol] = useState<number | null>(null)

    const handleSwapView = useCallback((target: string) => {
        if (target === 'simplified_view') setIsSimplified(true)
    }, [])

    const round = ROUNDS[roundIdx]
    const answer = round.rows * round.cols
    const attempted = correctCount + wrongCount

    const handleAnswer = useCallback((val: string) => {
        if (feedback !== 'none') return
        const ans = parseInt(val)
        if (ans === answer) {
            addCorrect(10)
            setFeedback('correct')
            setConfetti(true)
            setTimeout(() => {
                setConfetti(false)
                setFeedback('none')
                const next = roundIdx + 1
                if (next >= ROUNDS.length) {
                    const stars = wrongCount === 0 ? 3 : wrongCount <= 3 ? 2 : 1
                    completeLesson('multiplication', 'arrays', stars, sessionPoints + 10)
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
        reset(); setRoundIdx(0); setFeedback('none'); setShowComplete(false); setIsSimplified(false)
    }

    const playbooks = useMemo<TeachingPlaybook[]>(() => [
        {
            id: 'array_rows_cols',
            description: 'Treat rows and columns as the two factors; total cells is the product',
            generate: () => [
                {
                    delay: 0,
                    annotations: [
                        { action: 'pulse', element: '[data-hint-region="array-eq"]', color: '#fbbf24' },
                        { action: 'label', element: '[data-hint-region="array-eq"]', label: `${round.rows}×${round.cols}`, color: '#fbbf24' },
                    ],
                    speech: `This rectangle has ${round.rows} rows and ${round.cols} columns.`,
                },
                {
                    delay: 1200,
                    annotations: [
                        { action: 'pulse', element: '[data-hint-region="array-grid"]', color: '#60a5fa' },
                    ],
                    speech: 'Multiply rows times columns — or count every dot once.',
                },
            ],
        },
        {
            id: 'array_numpad_total',
            description: 'Enter the total number of cells',
            generate: () => [
                {
                    delay: 0,
                    annotations: [
                        { action: 'circle', element: '[data-hint-region="array-numpad"]', color: '#34d399' },
                    ],
                    speech: 'Type the product on the keypad.',
                },
            ],
        },
    ], [round.rows, round.cols])

    const lessonContext = useMemo(() => ({
        type: 'mult_array' as const,
        operands: [round.rows, round.cols],
        answer,
        itemCount: answer,
    }), [round.rows, round.cols, answer])

    return (
        <LessonShell
            lessonId="array-builder"
            voiceConfig={VOICE_CONFIGS["arrays"]}
            feedback={feedback}
            problemIndex={roundIdx} total={ROUNDS.length} attempted={attempted} correct={correctCount}
            accentClass="bg-blue-600" subtitle={`${round.rows} rows × ${round.cols} columns = ?`}
            playbooks={playbooks}
            lessonContext={lessonContext}
            onSwapView={handleSwapView}>
            <LessonComplete show={showComplete} stars={wrongCount === 0 ? 3 : wrongCount <= 3 ? 2 : 1}
                points={sessionPoints} onRetry={handleRetry} onNext={() => navigate('/')} />
            <Confetti active={confetti} />

            <div className="h-full flex gap-6 p-4">
                <div className="flex-1 flex flex-col items-center justify-center gap-6">
                    <motion.div data-hint-region="array-eq" animate={feedback === 'correct' ? { color: '#10b981' } : {}}
                        className="font-black font-display text-5xl text-white">
                        {round.rows} × {round.cols} = <span className="text-blue-400">?</span>
                    </motion.div>

                    {/* Array grid */}
                    <div className="flex">
                        {/* Row Labels */}
                        {isSimplified && (
                            <div className="flex flex-col gap-2 pr-4 pt-6">
                                {Array.from({ length: round.rows }, (_, r) => (
                                    <div key={r} className="w-8 h-8 flex items-center justify-center text-blue-400 font-bold font-display text-sm">
                                        {r + 1}
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex flex-col items-center">
                            {/* Column Labels */}
                            {isSimplified && (
                                <div className="flex gap-2 pb-4 pl-6">
                                    {Array.from({ length: round.cols }, (_, c) => (
                                        <div key={c} className="w-8 h-8 flex items-center justify-center text-blue-400 font-bold font-display text-sm">
                                            {c + 1}
                                        </div>
                                    ))}
                                </div>
                            )}

                            <motion.div
                                data-hint-region="array-grid"
                                animate={feedback === 'correct' ? { borderColor: '#10b981' } : feedback === 'wrong' ? { x: [0, -8, 8, 0] } : {}}
                                className="border-2 border-white/10 rounded-3xl p-6"
                            >
                                {Array.from({ length: round.rows }, (_, r) => (
                                    <div key={r} className="flex gap-2 mb-2">
                                        {Array.from({ length: round.cols }, (_, c) => {
                                            const rHover = hoveredRow !== null && r <= hoveredRow
                                            const cHover = hoveredCol !== null && c <= hoveredCol
                                            const isHighlighted = rHover && cHover
                                            return (
                                                <motion.div
                                                    key={c}
                                                    initial={{ scale: 0 }}
                                                    animate={{
                                                        scale: 1,
                                                        backgroundColor: feedback === 'correct'
                                                            ? '#10b981'
                                                            : isHighlighted
                                                                ? '#60a5fa'
                                                                : '#3b82f6'
                                                    }}
                                                    transition={{ delay: (r * round.cols + c) * 0.01, type: 'spring', stiffness: 400 }}
                                                    onMouseEnter={() => { setHoveredRow(r); setHoveredCol(c) }}
                                                    onMouseLeave={() => { setHoveredRow(null); setHoveredCol(null) }}
                                                    className="w-8 h-8 rounded-full cursor-pointer"
                                                />
                                            )
                                        })}
                                    </div>
                                ))}
                            </motion.div>
                        </div>
                    </div>

                    {hoveredRow !== null && hoveredCol !== null && (
                        <div className="text-blue-300 font-display text-sm">
                            {hoveredRow + 1} rows × {hoveredCol + 1} cols = {(hoveredRow + 1) * (hoveredCol + 1)}
                        </div>
                    )}
                </div>

                <div data-hint-region="array-numpad" className="w-48 flex flex-col items-center justify-center gap-4 shrink-0">
                    <div className="text-white/50 font-display text-sm">Total dots?</div>
                    <Numpad onAnswer={handleAnswer} maxDigits={2} />
                </div>
            </div>
        </LessonShell>
    )
}
