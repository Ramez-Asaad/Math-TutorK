import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { LessonShell } from '../../components/layout/LessonShell'
import { VOICE_CONFIGS } from '../../utils/lessonVoiceConfigs'
import { Numpad } from '../../components/shared/Numpad'
import { LessonComplete } from '../../components/shared/LessonComplete'
import { Confetti } from '../../components/shared/Confetti'
import { useScoreStore } from '../../store/useScoreStore'
import { useProgressStore } from '../../store/useProgressStore'

/* ─── Types ─────────────────────────────────────────────────── */
interface Card { a: number; b: number; id: number }

function buildDeck(): Card[] {
    const facts: Card[] = []
    let id = 0
    for (let a = 2; a <= 9; a++) {
        for (let b = 2; b <= 9; b++) {
            facts.push({ a, b, id: id++ })
        }
    }
    // Pick 20 random facts
    for (let i = facts.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [facts[i], facts[j]] = [facts[j], facts[i]]
    }
    return facts.slice(0, 20)
}

/* ─── Card Visual ────────────────────────────────────────────── */
const CARD_VARIANTS = {
    stack: { rotateY: 0, scale: 1, opacity: 1, y: 0 },
    flipped: { rotateY: 90, scale: 0.85, opacity: 0, y: -20 },
    wrong: { x: [0, -12, 12, -8, 8, 0] },
}

/* ─── Main Component ─────────────────────────────────────────── */
export const Flashcards = () => {
    const navigate = useNavigate()
    const { addCorrect, addWrong, sessionPoints, streak, correctCount, wrongCount, reset } = useScoreStore()
    const { completeLesson, addPoints } = useProgressStore()

    const [deck] = useState<Card[]>(() => buildDeck())
    const [index, setIndex] = useState(0)
    const [cardState, setCardState] = useState<'idle' | 'flip' | 'wrong'>('idle')
    const [showComplete, setShowComplete] = useState(false)
    const [streakBurst, setStreakBurst] = useState(false)
    const TOTAL = deck.length

    const current = deck[index]
    const attempted = correctCount + wrongCount
    const correct = correctCount

    const handleAnswer = useCallback((val: string) => {
        if (!current || cardState !== 'idle') return
        const answer = parseInt(val)
        const expected = current.a * current.b

        if (answer === expected) {
            addCorrect(10)
            const newStreak = streak + 1
            if (newStreak % 5 === 0) setStreakBurst(true)
            setCardState('flip')
            setTimeout(() => {
                setCardState('idle')
                setStreakBurst(false)
                if (index + 1 >= TOTAL) {
                    const stars = wrongCount === 0 ? 3 : wrongCount <= 3 ? 2 : 1
                    completeLesson('multiplication', 'flashcards', stars, sessionPoints + 10)
                    addPoints(sessionPoints + 10)
                    setShowComplete(true)
                } else {
                    setIndex((i) => i + 1)
                }
            }, 600)
        } else {
            addWrong()
            setCardState('wrong')
            setTimeout(() => setCardState('idle'), 500)
        }
    }, [current, cardState, streak, index, TOTAL, wrongCount, sessionPoints, addCorrect, addWrong, completeLesson, addPoints])

    const handleRetry = () => {
        reset()
        setIndex(0)
        setShowComplete(false)
        setCardState('idle')
    }

    return (
        <LessonShell
            voiceConfig={VOICE_CONFIGS["flashcards"]}
            problemIndex={0}
            total={TOTAL}
            attempted={attempted}
            correct={correct}
            accentClass="bg-blue-600"
            subtitle={`Card ${index + 1} of ${TOTAL}`}
        >
            <LessonComplete
                show={showComplete}
                stars={wrongCount === 0 ? 3 : wrongCount <= 3 ? 2 : 1}
                points={sessionPoints}
                onRetry={handleRetry}
                onNext={() => navigate('/')}
            />
            <Confetti active={streakBurst} />

            <div className="h-full flex gap-6 p-4">
                {/* ── Card Stack ── */}
                <div className="flex-1 flex flex-col items-center justify-center gap-8">

                    {/* Streak milestone label */}
                    <AnimatePresence>
                        {streakBurst && (
                            <motion.div
                                initial={{ y: -30, opacity: 0, scale: 0.6 }}
                                animate={{ y: 0, opacity: 1, scale: 1 }}
                                exit={{ y: -30, opacity: 0 }}
                                className="absolute top-20 text-3xl font-black font-display text-amber-400 drop-shadow-lg"
                            >
                                🔥 {streak + 1} in a row!
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Shadow cards behind */}
                    {[2, 1].map((offset) => (
                        <div
                            key={offset}
                            style={{
                                position: 'absolute',
                                width: 260,
                                height: 180,
                                borderRadius: 24,
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                transform: `translateY(${offset * 6}px) rotate(${(offset % 2 === 0 ? 1 : -1) * 1.5}deg)`,
                                zIndex: offset,
                            }}
                        />
                    ))}

                    {/* Main card */}
                    <AnimatePresence mode="wait">
                        {current && (
                            <motion.div
                                key={current.id}
                                variants={CARD_VARIANTS}
                                animate={cardState === 'flip' ? 'flipped' : cardState === 'wrong' ? 'wrong' : 'stack'}
                                transition={
                                    cardState === 'wrong'
                                        ? { type: 'spring', stiffness: 300, damping: 20 }
                                        : { type: 'spring', stiffness: 300, damping: 22 }
                                }
                                className={`relative flex items-center justify-center rounded-3xl border-2 shadow-2xl
                  ${cardState === 'wrong'
                                        ? 'bg-rose-900/60 border-rose-500'
                                        : 'bg-gradient-to-br from-blue-900 to-indigo-900 border-blue-500/40'
                                    }`}
                                style={{ zIndex: 10, perspective: 800, width: 260, height: 180 }}
                            >
                                <span className="font-black font-display text-white" style={{ fontSize: 56 }}>
                                    {current.a} × {current.b}
                                </span>
                                {/* Decorative corner dots */}
                                <span className="absolute top-3 left-4 text-white/20 text-sm font-display">#{index + 1}</span>
                                <span className="absolute bottom-3 right-4 text-white/20 text-sm font-display">×</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Progress dots */}
                    <div className="flex gap-1 flex-wrap justify-center max-w-xs">
                        {deck.map((_, i) => (
                            <motion.div
                                key={i}
                                animate={{
                                    backgroundColor: i < correct ? '#10b981' : i === index ? '#3b82f6' : 'rgba(255,255,255,0.1)',
                                    scale: i === index ? 1.3 : 1,
                                }}
                                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                className="w-3 h-3 rounded-full"
                            />
                        ))}
                    </div>
                </div>

                {/* ── Numpad ── */}
                <div className="flex flex-col justify-center gap-4 w-48">
                    <div className="text-center">
                        <span className="text-white/50 font-display text-sm">Your answer</span>
                    </div>
                    <Numpad onAnswer={handleAnswer} maxDigits={3} />
                    {/* Stats */}
                    <div className="flex justify-around text-sm font-display mt-2">
                        <span className="text-emerald-400">✓ {correctCount}</span>
                        <span className="text-rose-400">✗ {wrongCount}</span>
                    </div>
                </div>
            </div>
        </LessonShell>
    )
}
