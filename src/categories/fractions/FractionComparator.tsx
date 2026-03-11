import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { LessonShell } from '../../components/layout/LessonShell'
import { VOICE_CONFIGS } from '../../utils/lessonVoiceConfigs'
import { LessonComplete } from '../../components/shared/LessonComplete'
import { Confetti } from '../../components/shared/Confetti'
import { useScoreStore } from '../../store/useScoreStore'
import { useProgressStore } from '../../store/useProgressStore'

interface Round { a: [number, number]; b: [number, number] } // [num, den]
const ROUNDS: Round[] = [
    { a: [1, 2], b: [1, 4] }, { a: [3, 4], b: [2, 4] }, { a: [1, 3], b: [2, 3] },
    { a: [2, 5], b: [3, 5] }, { a: [1, 2], b: [3, 4] }, { a: [2, 3], b: [3, 4] },
    { a: [1, 4], b: [3, 8] }, { a: [3, 5], b: [4, 5] }, { a: [1, 6], b: [1, 3] },
    { a: [5, 8], b: [3, 4] },
]

type Answer = '<' | '=' | '>'

function compare(a: [number, number], b: [number, number]): Answer {
    const va = a[0] / a[1], vb = b[0] / b[1]
    if (va < vb) return '<'
    if (va > vb) return '>'
    return '='
}

function FractionBar({ num, den, color }: { num: number; den: number; color: string }) {
    return (
        <div className="flex flex-col items-center gap-2">
            <div className="w-48 h-10 flex rounded-xl overflow-hidden border-2" style={{ borderColor: color + '60' }}>
                {Array.from({ length: den }, (_, i) => (
                    <motion.div
                        key={i}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: i * 0.05, duration: 0.3 }}
                        className="flex-1 border-r last:border-r-0"
                        style={{
                            borderColor: color + '30',
                            backgroundColor: i < num ? color : 'rgba(255,255,255,0.05)',
                        }}
                    />
                ))}
            </div>
            <div className="font-black font-display text-2xl" style={{ color }}>
                {num}/{den}
            </div>
        </div>
    )
}

export const FractionComparator = () => {
    const navigate = useNavigate()
    const { addCorrect, addWrong, sessionPoints, correctCount, wrongCount, reset } = useScoreStore()
    const { completeLesson, addPoints } = useProgressStore()

    const [roundIdx, setRoundIdx] = useState(0)
    const [chosen, setChosen] = useState<Answer | null>(null)
    const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none')
    const [showComplete, setShowComplete] = useState(false)
    const [confetti, setConfetti] = useState(false)

    const round = ROUNDS[roundIdx]
    const correct = compare(round.a, round.b)
    const attempted = correctCount + wrongCount

    const handleGuess = useCallback((sym: Answer) => {
        if (feedback !== 'none') return
        setChosen(sym)
        if (sym === correct) {
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
                    completeLesson('fractions', 'comparator', stars, sessionPoints + 10)
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
    }, [feedback, correct, roundIdx, wrongCount, sessionPoints, addCorrect, addWrong, completeLesson, addPoints])

    const handleRetry = () => {
        reset(); setRoundIdx(0); setChosen(null); setFeedback('none'); setShowComplete(false)
    }

    return (
        <LessonShell
            voiceConfig={VOICE_CONFIGS["comparator"]}
            feedback={feedback}
            problemIndex={roundIdx} total={ROUNDS.length} attempted={attempted} correct={correctCount}
            accentClass="bg-pink-600" subtitle="Which fraction is bigger? Pick < = >">
            <LessonComplete show={showComplete} stars={wrongCount === 0 ? 3 : wrongCount <= 3 ? 2 : 1}
                points={sessionPoints} onRetry={handleRetry} onNext={() => navigate('/')} />
            <Confetti active={confetti} />

            <div className="h-full flex flex-col items-center justify-center gap-8 p-6">
                <motion.div
                    animate={feedback === 'correct' ? { borderColor: '#10b981' } : feedback === 'wrong' ? { x: [0, -8, 8, 0] } : {}}
                    className="flex items-center gap-8 border-2 border-white/10 rounded-3xl p-8"
                >
                    <FractionBar num={round.a[0]} den={round.a[1]} color="#60a5fa" />

                    <div className="flex flex-col gap-3">
                        {(['<', '=', '>'] as Answer[]).map(sym => (
                            <motion.button
                                key={sym}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleGuess(sym)}
                                className={`w-14 h-14 rounded-xl border-2 font-black font-display text-2xl transition-all
                  ${chosen === sym
                                        ? feedback === 'correct' ? 'bg-emerald-500 border-emerald-400 text-white'
                                            : 'bg-rose-600 border-rose-400 text-white'
                                        : 'bg-white/8 border-white/20 text-white hover:bg-white/15'}`}
                            >
                                {sym}
                            </motion.button>
                        ))}
                    </div>

                    <FractionBar num={round.b[0]} den={round.b[1]} color="#f472b6" />
                </motion.div>

                <div className="text-white/40 font-display text-sm">
                    Hint: think about how much of the bar is colored
                </div>

                <div className="flex gap-6 text-sm font-display">
                    <span className="text-emerald-400">✓ {correctCount}</span>
                    <span className="text-rose-400">✗ {wrongCount}</span>
                </div>
            </div>
        </LessonShell>
    )
}
