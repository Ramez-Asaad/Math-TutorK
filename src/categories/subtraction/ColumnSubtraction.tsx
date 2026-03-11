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
    { a: 45, b: 23 }, { a: 78, b: 35 }, { a: 64, b: 28 }, { a: 93, b: 47 },
    { a: 256, b: 134 }, { a: 483, b: 261 }, { a: 735, b: 418 }, { a: 501, b: 274 },
    { a: 82, b: 57 }, { a: 620, b: 385 },
]

const DigitBox = ({ digit, label }: { digit: number; label: string }) => (
    <div className="flex flex-col items-center gap-1 w-14">
        <div className="text-white/40 font-display text-xs">{label}</div>
        <div className="text-white font-black font-display text-3xl">{digit === -1 ? '' : digit}</div>
    </div>
)

export const ColumnSubtraction = () => {
    const navigate = useNavigate()
    const { addCorrect, addWrong, sessionPoints, correctCount, wrongCount, reset } = useScoreStore()
    const { completeLesson, addPoints } = useProgressStore()

    const [roundIdx, setRoundIdx] = useState(0)
    const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none')
    const [showComplete, setShowComplete] = useState(false)
    const [confetti, setConfetti] = useState(false)
    const [revealAnswer, setRevealAnswer] = useState(false)

    const round = ROUNDS[roundIdx]
    const answer = round.a - round.b
    const is3Digit = round.a >= 100
    const attempted = correctCount + wrongCount

    const getDigits = (n: number) => {
        const s = String(n).padStart(is3Digit ? 3 : 2, '0')
        return { h: is3Digit ? parseInt(s[0]) : -1, t: parseInt(s[is3Digit ? 1 : 0]), o: parseInt(s[is3Digit ? 2 : 1]) }
    }
    const da = getDigits(round.a)
    const db = getDigits(round.b)

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
                    completeLesson('subtraction', 'column-subtraction', stars, sessionPoints + 15)
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
            voiceConfig={VOICE_CONFIGS["column-subtraction"]}
            feedback={feedback}
            problemIndex={roundIdx} total={ROUNDS.length} attempted={attempted} correct={correctCount}
            accentClass="bg-orange-600" subtitle="Subtract the columns!">
            <LessonComplete show={showComplete} stars={wrongCount === 0 ? 3 : wrongCount <= 3 ? 2 : 1}
                points={sessionPoints} onRetry={handleRetry} onNext={() => navigate('/')} />
            <Confetti active={confetti} />

            <div className="h-full flex gap-6 p-4">
                <div className="flex-1 flex flex-col items-center justify-center gap-6">
                    <motion.div
                        animate={feedback === 'correct' ? { borderColor: '#10b981' } : feedback === 'wrong' ? { x: [0, -8, 8, 0] } : { borderColor: 'rgba(255,255,255,0.1)' }}
                        className="border-2 rounded-3xl p-8 relative flex gap-0 items-start"
                    >
                        <div className="absolute left-4 bottom-14 text-white/40 font-black font-display text-2xl">−</div>
                        {is3Digit && <DigitBox digit={da.h} label="H" />}
                        <DigitBox digit={da.t} label="T" />
                        <DigitBox digit={da.o} label="O" />

                        <div className="absolute top-[42px] left-8 right-8 border-b border-dashed border-white/20" />
                        <div className="absolute bottom-3 left-8 right-8 border-b border-white/40" />

                        {/* Bottom row */}
                        <div className="absolute bottom-5 flex" style={{ left: is3Digit ? '2rem' : '2rem' }}>
                            {is3Digit && <div className="w-14 text-center text-white font-black font-display text-3xl">{db.h === -1 ? 0 : db.h}</div>}
                            <div className="w-14 text-center text-white font-black font-display text-3xl">{db.t}</div>
                            <div className="w-14 text-center text-white font-black font-display text-3xl">{db.o}</div>
                        </div>

                        {revealAnswer && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                className="absolute -bottom-10 right-4 text-emerald-400 font-black font-display text-2xl">
                                = {answer}
                            </motion.div>
                        )}
                    </motion.div>
                </div>

                <div className="w-48 flex flex-col items-center justify-center gap-4 shrink-0">
                    <div className="text-white/50 font-display text-sm">{round.a} − {round.b} = ?</div>
                    <Numpad onAnswer={handleAnswer} maxDigits={4} />
                </div>
            </div>
        </LessonShell>
    )
}
