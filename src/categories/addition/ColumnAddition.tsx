import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { LessonShell } from '../../components/layout/LessonShell'
import { VOICE_CONFIGS } from '../../utils/lessonVoiceConfigs'
import { Numpad } from '../../components/shared/Numpad'
import { LessonComplete } from '../../components/shared/LessonComplete'
import { Confetti } from '../../components/shared/Confetti'
import { useScoreStore } from '../../store/useScoreStore'
import { useProgressStore } from '../../store/useProgressStore'

interface Round { a: number; b: number }
const ROUNDS: Round[] = [
    { a: 23, b: 14 }, { a: 47, b: 35 }, { a: 56, b: 28 }, { a: 63, b: 19 },
    { a: 145, b: 237 }, { a: 348, b: 156 }, { a: 467, b: 285 }, { a: 529, b: 163 },
    { a: 74, b: 58 }, { a: 189, b: 124 },
]

const DigitColumn = ({ top, bottom, label, carry }: { top: number; bottom: number; label: string; carry?: number }) => (
    <div className="flex flex-col items-center gap-1 w-16">
        {carry !== undefined && carry > 0 ? (
            <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                className="text-amber-400 font-bold font-display text-sm h-5">+{carry}</motion.div>
        ) : <div className="h-5" />}
        <div className="text-white/40 font-display text-xs">{label}</div>
        <div className="text-white font-black font-display text-3xl">{top === -1 ? '' : top}</div>
        <div className="text-white font-black font-display text-3xl">{bottom === -1 ? '' : bottom}</div>
        <div className="w-full h-0.5 bg-white/30 my-1" />
        <div className="text-amber-300 font-black font-display text-2xl h-8 flex items-center">?</div>
    </div>
)

export const ColumnAddition = () => {
    const navigate = useNavigate()
    const { addCorrect, addWrong, sessionPoints, correctCount, wrongCount, reset } = useScoreStore()
    const { completeLesson, addPoints } = useProgressStore()

    const [roundIdx, setRoundIdx] = useState(0)
    const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none')
    const [showComplete, setShowComplete] = useState(false)
    const [confetti, setConfetti] = useState(false)
    const [revealAnswer, setRevealAnswer] = useState(false)

    const round = ROUNDS[roundIdx]
    const answer = round.a + round.b
    const is3Digit = round.a >= 100 || round.b >= 100
    const attempted = correctCount + wrongCount

    const getDigits = (n: number) => {
        const s = String(n).padStart(is3Digit ? 3 : 2, '0')
        return { h: is3Digit ? parseInt(s[0]) : -1, t: parseInt(s[is3Digit ? 1 : 0]), o: parseInt(s[is3Digit ? 2 : 1]) }
    }
    const da = getDigits(round.a)
    const db = getDigits(round.b)
    const carryO = (da.o + db.o) >= 10 ? 1 : 0
    const carryT = (da.t + db.t + carryO) >= 10 ? 1 : 0

    const handleAnswer = useCallback((val: string) => {
        if (feedback !== 'none') return
        const ans = parseInt(val)
        if (ans === answer) {
            addCorrect(15)
            setFeedback('correct')
            setRevealAnswer(true)
            setConfetti(true)
            setTimeout(() => {
                setConfetti(false)
                setFeedback('none')
                setRevealAnswer(false)
                const next = roundIdx + 1
                if (next >= ROUNDS.length) {
                    const stars = wrongCount === 0 ? 3 : wrongCount <= 3 ? 2 : 1
                    completeLesson('addition', 'column-addition', stars, sessionPoints + 15)
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
        reset(); setRoundIdx(0); setFeedback('none'); setRevealAnswer(false); setShowComplete(false)
    }

    return (
        <LessonShell
            voiceConfig={VOICE_CONFIGS["column-addition"]}
            feedback={feedback}
            problemIndex={roundIdx} total={ROUNDS.length} attempted={attempted} correct={correctCount}
            accentClass="bg-emerald-600" subtitle="Add the columns — ones, tens, hundreds!">
            <LessonComplete show={showComplete} stars={wrongCount === 0 ? 3 : wrongCount <= 3 ? 2 : 1}
                points={sessionPoints} onRetry={handleRetry} onNext={() => navigate('/')} />
            <Confetti active={confetti} />

            <div className="h-full flex gap-6 p-4">
                <div className="flex-1 flex flex-col items-center justify-center gap-8">
                    {/* Column layout */}
                    <motion.div
                        animate={feedback === 'correct' ? { borderColor: '#10b981', x: 0 } : feedback === 'wrong' ? { x: [0, -8, 8, -6, 6, -4, 4, 0] } : { borderColor: 'rgba(255,255,255,0.1)', x: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        className="flex gap-0 border-2 rounded-3xl p-8 relative"
                    >
                        {/* Plus sign */}
                        <div className="absolute left-4 bottom-16 text-white/40 font-black font-display text-2xl">+</div>

                        {is3Digit && (
                            <DigitColumn top={da.h} bottom={db.h} label="H" carry={carryT} />
                        )}
                        <DigitColumn top={da.t} bottom={db.t} label="T" carry={carryO} />
                        <DigitColumn top={da.o} bottom={db.o} label="O" />

                        {/* Answer row */}
                        {revealAnswer && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                className="absolute bottom-3 right-4 text-emerald-400 font-black font-display text-2xl">
                                = {answer}
                            </motion.div>
                        )}
                    </motion.div>

                    {/* Carry hint */}
                    <div className="text-white/30 font-display text-xs">
                        {carryO > 0 && `Carry 1 to tens column`}
                        {carryT > 0 && carryO > 0 && ' · '}
                        {carryT > 0 && `Carry 1 to hundreds`}
                    </div>
                </div>

                <div className="w-48 flex flex-col items-center justify-center gap-4 shrink-0">
                    <div className="text-white/50 font-display text-sm">{round.a} + {round.b} = ?</div>
                    <Numpad onAnswer={handleAnswer} maxDigits={4} />
                </div>
            </div>
        </LessonShell>
    )
}
