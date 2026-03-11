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

/* A magic square where all rows, cols, diagonals sum to the same number */
interface MagicRound {
    grid: (number | null)[]  // null = blank
    target: number
    size: number
}

const ROUNDS: MagicRound[] = [
    // 3×3 magic square sum=15, hide center
    { size: 3, target: 15, grid: [2, 7, 6, 9, null, 1, 4, 3, 8] },
    // hide corner
    { size: 3, target: 15, grid: [null, 7, 6, 9, 5, 1, 4, 3, 8] },
    { size: 3, target: 15, grid: [2, 7, 6, 9, 5, 1, 4, null, 8] },
    { size: 3, target: 15, grid: [2, 7, 6, null, 5, 1, 4, 3, 8] },
    { size: 3, target: 15, grid: [2, null, 6, 9, 5, 1, 4, 3, 8] },
    { size: 3, target: 15, grid: [2, 7, null, 9, 5, 1, 4, 3, 8] },
    { size: 3, target: 15, grid: [2, 7, 6, 9, 5, null, 4, 3, 8] },
    { size: 3, target: 15, grid: [2, 7, 6, 9, 5, 1, null, 3, 8] },
    { size: 3, target: 15, grid: [2, 7, 6, 9, 5, 1, 4, 3, null] },
    { size: 3, target: 15, grid: [null, 7, 6, 9, 5, 1, 4, 3, null] },
]

export const MagicSquare = () => {
    const navigate = useNavigate()
    const { addCorrect, addWrong, sessionPoints, correctCount, wrongCount, reset } = useScoreStore()
    const { completeLesson, addPoints } = useProgressStore()

    const [roundIdx, setRoundIdx] = useState(0)
    const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none')
    const [showComplete, setShowComplete] = useState(false)
    const [confetti, setConfetti] = useState(false)
    const [activeBlank, setActiveBlank] = useState<number | null>(null)
    const [filledBlanks, setFilledBlanks] = useState<Record<number, number>>({})

    const round = ROUNDS[roundIdx]
    const blankIndices = round.grid.map((v, i) => v === null ? i : -1).filter(i => i !== -1)
    const attempted = correctCount + wrongCount

    const handleAnswer = useCallback((val: string) => {
        if (activeBlank === null || feedback !== 'none') return
        const ans = parseInt(val)
        // Find the correct value for this blank
        const correctValue = blankIndices.map(bi => ({
            bi,
            // Work out what value it should be based on the full answer
            val: [2, 7, 6, 9, 5, 1, 4, 3, 8][bi] // always same magic square
        })).find(x => x.bi === activeBlank)?.val ?? 0

        if (ans === correctValue) {
            const newFilled = { ...filledBlanks, [activeBlank]: ans }
            setFilledBlanks(newFilled)
            setActiveBlank(null)

            // Check if all blanks filled
            const allDone = blankIndices.every(bi => newFilled[bi] !== undefined)
            if (allDone) {
                addCorrect(20)
                setFeedback('correct')
                setConfetti(true)
                setTimeout(() => {
                    setConfetti(false)
                    setFeedback('none')
                    const next = roundIdx + 1
                    if (next >= ROUNDS.length) {
                        const stars = wrongCount === 0 ? 3 : wrongCount <= 4 ? 2 : 1
                        completeLesson('multiplication', 'magic-square', stars, sessionPoints + 20)
                        addPoints(sessionPoints)
                        setShowComplete(true)
                    } else {
                        setRoundIdx(next)
                        setFilledBlanks({})
                    }
                }, 1000)
            } else {
                addCorrect(5)
            }
        } else {
            addWrong()
            setFeedback('wrong')
            setTimeout(() => setFeedback('none'), 600)
        }
    }, [activeBlank, feedback, blankIndices, filledBlanks, roundIdx, wrongCount, sessionPoints, addCorrect, addWrong, completeLesson, addPoints])

    const handleRetry = () => {
        reset(); setRoundIdx(0); setFeedback('none'); setFilledBlanks({}); setActiveBlank(null); setShowComplete(false)
    }

    return (
        <LessonShell
            voiceConfig={VOICE_CONFIGS["magic-square"]}
            feedback={feedback}
            problemIndex={roundIdx} total={ROUNDS.length} attempted={attempted} correct={correctCount}
            accentClass="bg-blue-600" subtitle={`Every row, column & diagonal = ${round.target}!`}>
            <LessonComplete show={showComplete} stars={wrongCount === 0 ? 3 : wrongCount <= 4 ? 2 : 1}
                points={sessionPoints} onRetry={handleRetry} onNext={() => navigate('/')} />
            <Confetti active={confetti} />

            <div className="h-full flex gap-6 p-4">
                <div className="flex-1 flex flex-col items-center justify-center gap-8">
                    <div className="text-white/60 font-display text-lg">
                        Each line adds up to <span className="text-blue-300 font-black text-3xl">{round.target}</span>
                    </div>

                    {/* Magic grid */}
                    <motion.div
                        animate={feedback === 'correct' ? { borderColor: '#10b981' } : feedback === 'wrong' ? { x: [0, -8, 8, 0] } : {}}
                        className="grid gap-2 border-2 border-white/10 rounded-2xl p-4"
                        style={{ gridTemplateColumns: `repeat(${round.size}, 1fr)` }}
                    >
                        {round.grid.map((val, i) => {
                            const isBlank = val === null
                            const filled = filledBlanks[i]
                            const isActive = activeBlank === i
                            return (
                                <motion.div
                                    key={i}
                                    onClick={() => isBlank && !filled && setActiveBlank(i)}
                                    animate={isBlank && !filled
                                        ? isActive
                                            ? { borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.15)' }
                                            : { borderColor: 'rgba(255,255,255,0.3)' }
                                        : filled
                                            ? { borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.15)' }
                                            : { borderColor: 'rgba(59,130,246,0.3)', backgroundColor: 'rgba(59,130,246,0.1)' }}
                                    className="w-16 h-16 rounded-xl border-2 flex items-center justify-center cursor-pointer font-black font-display text-2xl text-white"
                                >
                                    {isBlank
                                        ? filled
                                            ? <span className="text-emerald-300">{filled}</span>
                                            : isActive
                                                ? <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 0.8, repeat: Infinity }} className="text-amber-400">?</motion.span>
                                                : <span className="text-white/20">?</span>
                                        : val}
                                </motion.div>
                            )
                        })}
                    </motion.div>

                    <div className="text-white/30 font-display text-xs">Tap a ? then type its value</div>
                </div>

                <div className="w-48 flex flex-col items-center justify-center gap-4 shrink-0">
                    <div className={`text-white/50 font-display text-sm transition-opacity ${activeBlank !== null ? 'opacity-100' : 'opacity-40'}`}>
                        {activeBlank !== null ? `Fill cell ${activeBlank + 1}` : 'Tap a cell'}
                    </div>
                    <div className={`transition-opacity ${activeBlank !== null ? 'opacity-100' : 'opacity-40'}`}>
                        <Numpad onAnswer={handleAnswer} maxDigits={2} />
                    </div>
                </div>
            </div>
        </LessonShell>
    )
}
