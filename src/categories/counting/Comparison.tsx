import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { LessonShell } from '../../components/layout/LessonShell'
import { VOICE_CONFIGS } from '../../utils/lessonVoiceConfigs'
import { LessonComplete } from '../../components/shared/LessonComplete'
import { Confetti } from '../../components/shared/Confetti'
import { useScoreStore } from '../../store/useScoreStore'
import { useProgressStore } from '../../store/useProgressStore'

interface Round { left: number; right: number }

const ROUNDS: Round[] = [
    { left: 3, right: 5 }, { left: 7, right: 7 }, { left: 9, right: 4 },
    { left: 2, right: 8 }, { left: 6, right: 6 }, { left: 10, right: 3 },
    { left: 5, right: 9 }, { left: 8, right: 8 }, { left: 1, right: 7 },
    { left: 12, right: 6 },
]

const EMOJIS = ['🍎', '🌟', '🐸', '🦋', '🍭', '🎈', '🐠', '🌸']

function getAnswer(left: number, right: number): '<' | '=' | '>' {
    if (left < right) return '<'
    if (left > right) return '>'
    return '='
}

const ObjectGrid = ({ count, emoji }: { count: number; emoji: string }) => (
    <div className="flex flex-wrap gap-2 justify-center items-center max-w-[200px]">
        {Array.from({ length: count }, (_, i) => (
            <motion.div
                key={i}
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0, y: [0, -4, 0] }}
                transition={{
                    scale: { type: 'spring', stiffness: 300, damping: 20, delay: i * 0.05 },
                    y: { duration: 2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.08 },
                }}
                className="text-3xl select-none"
            >
                {emoji}
            </motion.div>
        ))}
    </div>
)

export const Comparison = () => {
    const navigate = useNavigate()
    const { addCorrect, addWrong, sessionPoints, correctCount, wrongCount, reset } = useScoreStore()
    const { completeLesson, addPoints } = useProgressStore()

    const [roundIdx, setRoundIdx] = useState(0)
    const [emoji] = useState(() => EMOJIS[Math.floor(Math.random() * EMOJIS.length)])
    const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none')
    const [chosen, setChosen] = useState<string | null>(null)
    const [showComplete, setShowComplete] = useState(false)
    const [confetti, setConfetti] = useState(false)

    const round = ROUNDS[roundIdx]
    const correct = getAnswer(round.left, round.right)
    const attempted = correctCount + wrongCount

    const handleGuess = useCallback((symbol: '<' | '=' | '>') => {
        if (feedback !== 'none') return
        setChosen(symbol)

        if (symbol === correct) {
            addCorrect(10)
            setFeedback('correct')
            setConfetti(true)
            setTimeout(() => {
                setConfetti(false)
                setChosen(null)
                setFeedback('none')
                const next = roundIdx + 1
                if (next >= ROUNDS.length) {
                    const stars = wrongCount === 0 ? 3 : wrongCount <= 3 ? 2 : 1
                    completeLesson('counting', 'comparison', stars, sessionPoints + 10)
                    addPoints(sessionPoints)
                    setShowComplete(true)
                } else {
                    setRoundIdx(next)
                }
            }, 900)
        } else {
            addWrong()
            setFeedback('wrong')
            setTimeout(() => {
                setChosen(null)
                setFeedback('none')
            }, 700)
        }
    }, [feedback, correct, roundIdx, wrongCount, sessionPoints, addCorrect, addWrong, completeLesson, addPoints])

    const handleRetry = () => {
        reset()
        setRoundIdx(0)
        setFeedback('none')
        setChosen(null)
        setShowComplete(false)
    }

    const symbolColor = (sym: string) => {
        if (chosen !== sym) return 'bg-white/8 border-white/15 text-white hover:bg-white/15'
        if (feedback === 'correct') return 'bg-emerald-500 border-emerald-400 text-white'
        return 'bg-rose-600 border-rose-400 text-white'
    }

    return (
        <LessonShell
            voiceConfig={VOICE_CONFIGS["comparison"]}
            feedback={feedback}
            problemIndex={roundIdx}
            total={ROUNDS.length}
            attempted={attempted}
            correct={correctCount}
            accentClass="bg-amber-500"
            subtitle="Which side has more? Pick < = >"
        >
            <LessonComplete
                show={showComplete}
                stars={wrongCount === 0 ? 3 : wrongCount <= 3 ? 2 : 1}
                points={sessionPoints}
                onRetry={handleRetry}
                onNext={() => navigate('/')}
            />
            <Confetti active={confetti} />

            <div className="h-full flex flex-col items-center justify-center gap-8 p-4">
                {/* ── Two groups ── */}
                <motion.div
                    animate={
                        feedback === 'correct'
                            ? { scale: 1.02, borderColor: '#10b981', x: 0 }
                            : feedback === 'wrong'
                                ? { x: [0, -8, 8, -6, 6, -4, 4, 0] }
                                : { scale: 1, x: 0 }
                    }
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="flex items-center justify-center gap-6 bg-white/5 rounded-3xl border border-white/10 p-8 w-full max-w-2xl"
                >
                    {/* Left group */}
                    <div className="flex flex-col items-center gap-3 min-w-[180px]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`left-${roundIdx}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="flex flex-col items-center gap-2"
                            >
                                <ObjectGrid count={round.left} emoji={emoji} />
                                <div className="text-white font-black font-display text-4xl mt-2">{round.left}</div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Symbol zone */}
                    <div className="flex flex-col gap-3">
                        {(['<', '=', '>'] as const).map((sym) => (
                            <motion.button
                                key={sym}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleGuess(sym)}
                                className={`w-16 h-16 rounded-2xl border-2 font-black font-display text-3xl transition-all ${symbolColor(sym)}`}
                            >
                                {sym}
                            </motion.button>
                        ))}
                    </div>

                    {/* Right group */}
                    <div className="flex flex-col items-center gap-3 min-w-[180px]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`right-${roundIdx}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="flex flex-col items-center gap-2"
                            >
                                <ObjectGrid count={round.right} emoji={emoji} />
                                <div className="text-white font-black font-display text-4xl mt-2">{round.right}</div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* Legend */}
                <div className="flex gap-6 text-white/40 font-display text-sm">
                    <span><strong className="text-white/70">&lt;</strong> Less than</span>
                    <span><strong className="text-white/70">=</strong> Equal</span>
                    <span><strong className="text-white/70">&gt;</strong> Greater than</span>
                </div>

                <div className="flex gap-6 text-sm font-display">
                    <span className="text-emerald-400">✓ {correctCount}</span>
                    <span className="text-rose-400">✗ {wrongCount}</span>
                </div>
            </div>
        </LessonShell>
    )
}
