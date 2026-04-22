import { useState, useCallback, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { LessonShell } from '../../components/layout/LessonShell'
import { VOICE_CONFIGS } from '../../utils/lessonVoiceConfigs'
import { Numpad } from '../../components/shared/Numpad'
import { LessonComplete } from '../../components/shared/LessonComplete'
import { Confetti } from '../../components/shared/Confetti'
import { useScoreStore } from '../../store/useScoreStore'
import { useProgressStore } from '../../store/useProgressStore'
import type { TeachingPlaybook } from '../../types/visualCommand'

const SPOKEN_NUMBERS = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve']

const DOT_COLORS = ['#f87171', '#fb923c', '#facc15', '#4ade80', '#60a5fa', '#c084fc', '#f472b6']
const DOT_SHAPES = ['circle', 'star', 'square', 'heart']

interface Dot {
    id: number
    x: number
    y: number
    color: string
    shape: string
    delay: number
    scale: number
}

function makeDots(count: number): Dot[] {
    return Array.from({ length: count }, (_, i) => ({
        id: i,
        x: 8 + Math.random() * 84,
        y: 8 + Math.random() * 84,
        color: DOT_COLORS[Math.floor(Math.random() * DOT_COLORS.length)],
        shape: DOT_SHAPES[Math.floor(Math.random() * DOT_SHAPES.length)],
        delay: i * 0.05,
        scale: 0.85 + Math.random() * 0.3,
    }))
}

const ROUNDS = [3, 5, 7, 4, 9, 6, 8, 10, 12, 11]

const DotShape = ({ shape, color, size }: { shape: string; color: string; size: number }) => {
    if (shape === 'star') return (
        <svg width={size} height={size} viewBox="0 0 24 24">
            <polygon points="12,2 15,9 22,9 16,14 18,21 12,17 6,21 8,14 2,9 9,9" fill={color} />
        </svg>
    )
    if (shape === 'square') return (
        <div style={{ width: size, height: size, backgroundColor: color, borderRadius: 6 }} />
    )
    if (shape === 'heart') return (
        <svg width={size} height={size} viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill={color} />
        </svg>
    )
    // circle default
    return <div style={{ width: size, height: size, backgroundColor: color, borderRadius: '50%' }} />
}

export const DotCounter = () => {
    const navigate = useNavigate()
    const { addCorrect, addWrong, sessionPoints, correctCount, wrongCount, reset } = useScoreStore()
    const { completeLesson, addPoints } = useProgressStore()

    const [roundIdx, setRoundIdx] = useState(0)
    const [dots, setDots] = useState<Dot[]>(() => makeDots(ROUNDS[0]))
    const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none')
    const [showComplete, setShowComplete] = useState(false)
    const [confetti, setConfetti] = useState(false)
    const [showCount, setShowCount] = useState(false)

    const targetCount = ROUNDS[roundIdx]
    const attempted = correctCount + wrongCount

    // Reset dot reveal on new round
    useEffect(() => {
        setShowCount(false)
    }, [roundIdx])

    const handleAnswer = useCallback((val: string) => {
        if (feedback !== 'none') return
        const answer = parseInt(val)

        if (answer === targetCount) {
            addCorrect(10)
            setFeedback('correct')
            setConfetti(true)
            setShowCount(true)
            setTimeout(() => {
                setConfetti(false)
                setFeedback('none')
                const next = roundIdx + 1
                if (next >= ROUNDS.length) {
                    const stars = wrongCount === 0 ? 3 : wrongCount <= 3 ? 2 : 1
                    completeLesson('counting', 'dot-counter', stars, sessionPoints + 10)
                    addPoints(sessionPoints)
                    setShowComplete(true)
                } else {
                    setRoundIdx(next)
                    setDots(makeDots(ROUNDS[next]))
                }
            }, 900)
        } else {
            addWrong()
            setFeedback('wrong')
            setTimeout(() => setFeedback('none'), 600)
        }
    }, [feedback, targetCount, roundIdx, wrongCount, sessionPoints, addCorrect, addWrong, completeLesson, addPoints])

    const handleRetry = () => {
        reset()
        setRoundIdx(0)
        setDots(makeDots(ROUNDS[0]))
        setFeedback('none')
        setShowComplete(false)
        setShowCount(false)
    }

    const playbooks = useMemo<TeachingPlaybook[]>(() => [
        {
            id: 'count_items',
            description: 'Circle each dot one-by-one and count out loud',
            generate: () => dots.map((dot, i) => ({
                delay: i === 0 ? 0 : 800,
                annotations: [
                    { action: 'circle' as const, element: `[data-item="${dot.id}"]`, color: '#34d399' },
                    { action: 'label' as const, element: `[data-item="${dot.id}"]`, label: `${i + 1}`, color: '#34d399' },
                ],
                speech: i === 0
                    ? `Let's count together! ${SPOKEN_NUMBERS[i] ?? String(i + 1)}`
                    : SPOKEN_NUMBERS[i] ?? String(i + 1),
            })),
        },
        {
            id: 'highlight_answer',
            description: 'Circle the answer area and show the total count',
            generate: () => [{
                delay: 0,
                annotations: [
                    { action: 'pulse' as const, element: '[data-answer-area]', color: '#facc15' },
                    { action: 'label' as const, element: '[data-answer-area]', label: `There are ${dots.length}!`, color: '#facc15' },
                ],
                speech: `There are ${dots.length} shapes! Try typing ${dots.length}.`,
            }],
        },
    ], [dots])

    const lessonContext = useMemo(() => ({
        type: 'counting' as const,
        itemCount: dots.length,
        answer: dots.length,
    }), [dots.length])

    return (
        <LessonShell
            lessonId="dot-counter"
            voiceConfig={VOICE_CONFIGS["dot-counter"]}
            feedback={feedback}
            problemIndex={roundIdx}
            total={ROUNDS.length}
            attempted={attempted}
            correct={correctCount}
            accentClass="bg-amber-500"
            subtitle="Count the dots and type the number!"
            playbooks={playbooks}
            lessonContext={lessonContext}
        >
            <LessonComplete
                show={showComplete}
                stars={wrongCount === 0 ? 3 : wrongCount <= 3 ? 2 : 1}
                points={sessionPoints}
                onRetry={handleRetry}
                onNext={() => navigate('/')}
            />
            <Confetti active={confetti} />

            <div className="h-full flex gap-6 p-4">
                {/* ── Dot Canvas ── */}
                <motion.div
                    animate={
                        feedback === 'correct'
                            ? { borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.08)' }
                            : feedback === 'wrong'
                                ? { borderColor: '#ef4444', x: [0, -8, 8, -6, 6, -4, 4, 0] }
                                : { borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.02)', x: 0 }
                    }
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="flex-1 relative rounded-3xl border-2 overflow-hidden"
                >
                    <AnimatePresence mode="popLayout">
                        {dots.map((dot) => (
                            <motion.div
                                key={`${roundIdx}-${dot.id}`}
                                data-item={dot.id}
                                initial={{ scale: 0, opacity: 0, rotate: -180 }}
                                animate={{ scale: dot.scale, opacity: 1, rotate: 0, y: [0, -4, 0] }}
                                exit={{ scale: 0, opacity: 0 }}
                                whileHover={{ scale: dot.scale * 1.05 }}
                                whileTap={{ scale: dot.scale * 0.95 }}
                                transition={{
                                    scale: { type: 'spring', stiffness: 300, damping: 20, delay: dot.delay },
                                    opacity: { delay: dot.delay, duration: 0.2 },
                                    rotate: { delay: dot.delay, duration: 0.4 },
                                    y: { duration: 2, repeat: Infinity, ease: 'easeInOut', delay: dot.delay * 2 },
                                }}
                                style={{
                                    position: 'absolute',
                                    left: `${dot.x}%`,
                                    top: `${dot.y}%`,
                                    transform: 'translate(-50%, -50%)',
                                }}
                            >
                                <DotShape shape={dot.shape} color={dot.color} size={44} />
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Count overlay on correct */}
                    <AnimatePresence>
                        {showCount && (
                            <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                            >
                                <div className="bg-emerald-500/90 rounded-3xl px-10 py-6 text-white font-black font-display text-7xl shadow-2xl">
                                    {targetCount}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* ── Numpad ── */}
                <div className="flex flex-col items-center justify-center gap-4 w-48 shrink-0" data-answer-area>
                    <div className="text-white/50 font-display text-sm text-center">How many?</div>
                    <Numpad onAnswer={handleAnswer} maxDigits={2} />
                    <div className="flex justify-around w-full text-sm font-display mt-2">
                        <span className="text-emerald-400">✓ {correctCount}</span>
                        <span className="text-rose-400">✗ {wrongCount}</span>
                    </div>
                </div>
            </div>
        </LessonShell>
    )
}
