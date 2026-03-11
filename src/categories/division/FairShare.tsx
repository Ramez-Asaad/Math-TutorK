import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { LessonShell } from '../../components/layout/LessonShell'
import { VOICE_CONFIGS } from '../../utils/lessonVoiceConfigs'
import { LessonComplete } from '../../components/shared/LessonComplete'
import { Confetti } from '../../components/shared/Confetti'
import { Numpad } from '../../components/shared/Numpad'
import { useScoreStore } from '../../store/useScoreStore'
import { useProgressStore } from '../../store/useProgressStore'

const EMOJIS = ['🍪', '🍎', '🌟', '🐠', '🍭', '🎈']
interface Round { total: number; groups: number }
const ROUNDS: Round[] = [
    { total: 12, groups: 4 }, { total: 15, groups: 5 }, { total: 18, groups: 6 },
    { total: 20, groups: 4 }, { total: 16, groups: 8 }, { total: 21, groups: 7 },
    { total: 24, groups: 6 }, { total: 14, groups: 7 }, { total: 25, groups: 5 }, { total: 27, groups: 9 },
]

export const FairShare = () => {
    const navigate = useNavigate()
    const { addCorrect, addWrong, sessionPoints, correctCount, wrongCount, reset } = useScoreStore()
    const { completeLesson, addPoints } = useProgressStore()

    const [roundIdx, setRoundIdx] = useState(0)
    const [emoji] = useState(() => EMOJIS[Math.floor(Math.random() * EMOJIS.length)])
    const [distributed, setDistributed] = useState<number[]>([])
    const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none')
    const [showComplete, setShowComplete] = useState(false)
    const [confetti, setConfetti] = useState(false)
    const [mode, setMode] = useState<'distribute' | 'answer'>('distribute')
    const [, setAnswer] = useState('')

    const round = ROUNDS[roundIdx]
    const perGroup = round.total / round.groups
    const attempted = correctCount + wrongCount
    const totalDistributed = distributed.reduce((a, b) => a + b, 0)

    const handleDistribute = useCallback(() => {
        if (feedback !== 'none' || mode !== 'distribute') return
        if (distributed.length >= round.groups) return
        // Give one to each group round-robin
        const next = [...distributed]
        for (let g = 0; g < round.groups; g++) {
            if ((next[g] ?? 0) < perGroup) {
                next[g] = (next[g] ?? 0) + 1
                break
            }
        }
        setDistributed(next)
        if (next.reduce((a, b) => a + b, 0) === round.total) {
            setMode('answer')
        }
    }, [feedback, mode, distributed, round, perGroup])

    const handleAnswer = useCallback((val: string) => {
        if (feedback !== 'none') return
        const ans = parseInt(val)
        if (ans === perGroup) {
            addCorrect(10)
            setFeedback('correct')
            setConfetti(true)
            setTimeout(() => {
                setConfetti(false)
                setFeedback('none')
                setDistributed([])
                setMode('distribute')
                const next = roundIdx + 1
                if (next >= ROUNDS.length) {
                    const stars = wrongCount === 0 ? 3 : wrongCount <= 3 ? 2 : 1
                    completeLesson('division', 'fair-share', stars, sessionPoints + 10)
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
    }, [feedback, perGroup, roundIdx, wrongCount, sessionPoints, addCorrect, addWrong, completeLesson, addPoints])

    const handleRetry = () => {
        reset(); setRoundIdx(0); setDistributed([]); setFeedback('none')
        setMode('distribute'); setAnswer(''); setShowComplete(false)
    }

    return (
        <LessonShell
            voiceConfig={VOICE_CONFIGS["fair-share"]}
            feedback={feedback}
            problemIndex={roundIdx} total={ROUNDS.length} attempted={attempted} correct={correctCount}
            accentClass="bg-teal-600" subtitle={`Share ${round.total} fairly between ${round.groups} groups!`}>
            <LessonComplete show={showComplete} stars={wrongCount === 0 ? 3 : wrongCount <= 3 ? 2 : 1}
                points={sessionPoints} onRetry={handleRetry} onNext={() => navigate('/')} />
            <Confetti active={confetti} />

            <div className="h-full flex gap-6 p-4">
                <div className="flex-1 flex flex-col items-center justify-center gap-6">
                    <motion.div animate={feedback === 'correct' ? { color: '#10b981' } : {}}
                        className="font-black font-display text-4xl text-white">
                        {round.total} ÷ {round.groups} = <span className="text-teal-400">?</span>
                    </motion.div>

                    {/* Groups */}
                    <div className="flex flex-wrap gap-3 justify-center">
                        {Array.from({ length: round.groups }, (_, g) => (
                            <motion.div key={g}
                                animate={feedback === 'correct' ? { borderColor: '#10b981' } : {}}
                                className="border-2 border-teal-500/40 rounded-2xl p-3 flex flex-wrap gap-1 justify-center min-w-[80px] bg-teal-900/20"
                            >
                                <div className="w-full text-center text-teal-300/60 font-display text-xs mb-1">Group {g + 1}</div>
                                <AnimatePresence>
                                    {Array.from({ length: distributed[g] ?? 0 }, (_, i) => (
                                        <motion.span key={i} initial={{ scale: 0 }} animate={{ scale: 1 }}
                                            transition={{ type: 'spring', stiffness: 400 }}
                                            className="text-2xl">{emoji}</motion.span>
                                    ))}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>

                    {/* Remaining pile */}
                    <div className="flex items-center gap-4">
                        <div className="text-white/50 font-display text-sm">Remaining: {round.total - totalDistributed}</div>
                        {mode === 'distribute' && (
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                onClick={handleDistribute}
                                className="px-6 py-3 bg-teal-500 hover:bg-teal-400 rounded-2xl text-white font-bold font-display">
                                Give one to next group →
                            </motion.button>
                        )}
                    </div>

                    {mode === 'answer' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            className="text-amber-300 font-display text-lg">
                            How many in each group?
                        </motion.div>
                    )}
                </div>

                <div className={`w-48 flex flex-col items-center justify-center gap-4 shrink-0 transition-opacity ${mode === 'answer' ? 'opacity-100' : 'opacity-30'}`}>
                    <div className="text-white/50 font-display text-sm">Each group gets?</div>
                    <Numpad onAnswer={handleAnswer} maxDigits={2} />
                </div>
            </div>
        </LessonShell>
    )
}
