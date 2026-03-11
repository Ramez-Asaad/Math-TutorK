import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { LessonShell } from '../../components/layout/LessonShell'
import { VOICE_CONFIGS } from '../../utils/lessonVoiceConfigs'
import { LessonComplete } from '../../components/shared/LessonComplete'
import { Confetti } from '../../components/shared/Confetti'
import { useScoreStore } from '../../store/useScoreStore'
import { useProgressStore } from '../../store/useProgressStore'

const EMOJIS = ['🍎', '🐸', '🌟', '🦋', '🍭', '🐠', '🎈', '🍕']
interface Round { total: number; remove: number }
const ROUNDS: Round[] = [
    { total: 6, remove: 2 }, { total: 8, remove: 3 }, { total: 10, remove: 4 },
    { total: 7, remove: 5 }, { total: 9, remove: 6 }, { total: 12, remove: 5 },
    { total: 15, remove: 7 }, { total: 11, remove: 4 }, { total: 14, remove: 9 }, { total: 13, remove: 8 },
]

export const ObjectTakeaway = () => {
    const navigate = useNavigate()
    const { addCorrect, sessionPoints, correctCount, wrongCount, reset } = useScoreStore()
    const { completeLesson, addPoints } = useProgressStore()

    const [roundIdx, setRoundIdx] = useState(0)
    const [emoji] = useState(() => EMOJIS[Math.floor(Math.random() * EMOJIS.length)])
    const [removedCount, setRemovedCount] = useState(0)
    const [removedIds, setRemovedIds] = useState<Set<number>>(new Set())
    const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none')
    const [showComplete, setShowComplete] = useState(false)
    const [confetti, setConfetti] = useState(false)

    const round = ROUNDS[roundIdx]
    const attempted = correctCount + wrongCount

    const handleDotClick = useCallback((id: number) => {
        if (removedIds.has(id) || removedCount >= round.remove || feedback !== 'none') return
        const newRemoved = new Set(removedIds)
        newRemoved.add(id)
        const newCount = removedCount + 1
        setRemovedIds(newRemoved)
        setRemovedCount(newCount)

        if (newCount === round.remove) {
            addCorrect(10)
            setFeedback('correct')
            setConfetti(true)
            setTimeout(() => {
                setConfetti(false)
                setFeedback('none')
                setRemovedCount(0)
                setRemovedIds(new Set())
                const next = roundIdx + 1
                if (next >= ROUNDS.length) {
                    const stars = wrongCount === 0 ? 3 : wrongCount <= 3 ? 2 : 1
                    completeLesson('subtraction', 'takeaway', stars, sessionPoints + 10)
                    addPoints(sessionPoints)
                    setShowComplete(true)
                } else {
                    setRoundIdx(next)
                }
            }, 900)
        }
    }, [removedIds, removedCount, round, feedback, roundIdx, wrongCount, sessionPoints, addCorrect, completeLesson, addPoints])

    const handleRetry = () => {
        reset(); setRoundIdx(0); setRemovedCount(0); setRemovedIds(new Set())
        setFeedback('none'); setShowComplete(false)
    }

    return (
        <LessonShell
            voiceConfig={VOICE_CONFIGS["takeaway"]}
            feedback={feedback}
            problemIndex={roundIdx} total={ROUNDS.length} attempted={attempted} correct={correctCount}
            accentClass="bg-orange-600" subtitle={`Remove ${round.remove} — click to take away!`}>
            <LessonComplete show={showComplete} stars={wrongCount === 0 ? 3 : wrongCount <= 3 ? 2 : 1}
                points={sessionPoints} onRetry={handleRetry} onNext={() => navigate('/')} />
            <Confetti active={confetti} />

            <div className="h-full flex flex-col items-center justify-center gap-8 p-6">
                {/* Problem */}
                <motion.div
                    animate={feedback === 'correct' ? { color: '#10b981' } : { color: '#ffffff' }}
                    className="font-black font-display text-5xl"
                >
                    {round.total} − {round.remove} = <span className="text-amber-400">{round.total - removedCount}</span>
                </motion.div>

                {/* Object grid */}
                <motion.div
                    animate={feedback === 'correct' ? { borderColor: '#10b981', x: 0 } : feedback === 'wrong' ? { x: [0, -8, 8, -6, 6, -4, 4, 0] } : { x: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="flex flex-wrap gap-3 justify-center max-w-md border-2 border-white/10 rounded-3xl p-6"
                >
                    {Array.from({ length: round.total }, (_, i) => (
                        <motion.button
                            key={i}
                            onClick={() => handleDotClick(i)}
                            disabled={removedIds.has(i) || removedCount >= round.remove}
                            animate={removedIds.has(i) ? { scale: 0, opacity: 0, rotate: 180 } : { scale: 1, opacity: 1, rotate: 0, y: [0, -4, 0] }}
                            whileHover={!removedIds.has(i) && removedCount < round.remove ? { scale: 1.05 } : {}}
                            whileTap={{ scale: 0.95 }}
                            transition={{
                                scale: { type: 'spring', stiffness: 300, damping: 20 },
                                rotate: { type: 'spring', stiffness: 300, damping: 20 },
                                y: { duration: 2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.1 },
                            }}
                            className={`text-4xl select-none cursor-pointer transition-opacity
                ${removedIds.has(i) ? 'pointer-events-none' :
                                    removedCount >= round.remove ? 'opacity-40 cursor-default' : ''}`}
                        >
                            {emoji}
                        </motion.button>
                    ))}
                </motion.div>

                {/* Progress */}
                <div className="flex flex-col items-center gap-2">
                    <div className="text-white/60 font-display text-sm">
                        {removedCount < round.remove
                            ? `Click ${round.remove - removedCount} more to remove`
                            : '🎉 All removed!'}
                    </div>
                    <div className="flex gap-1">
                        {Array.from({ length: round.remove }, (_, i) => (
                            <motion.div key={i}
                                animate={{ backgroundColor: i < removedCount ? '#ef4444' : 'rgba(255,255,255,0.15)' }}
                                className="w-4 h-4 rounded-full"
                            />
                        ))}
                    </div>
                </div>
            </div>
        </LessonShell>
    )
}
