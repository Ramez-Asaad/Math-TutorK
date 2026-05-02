import { useState, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { LessonShell } from '../../components/layout/LessonShell'
import { VOICE_CONFIGS } from '../../utils/lessonVoiceConfigs'
import { LessonComplete } from '../../components/shared/LessonComplete'
import { Confetti } from '../../components/shared/Confetti'
import { useScoreStore } from '../../store/useScoreStore'
import { useProgressStore } from '../../store/useProgressStore'
import type { TeachingPlaybook } from '../../types/visualCommand'

interface Round { start: number; sub: number; min: number; max: number }
const ROUNDS: Round[] = [
    { start: 8, sub: 3, min: 0, max: 10 },
    { start: 10, sub: 4, min: 0, max: 10 },
    { start: 7, sub: 5, min: 0, max: 10 },
    { start: 9, sub: 6, min: 0, max: 10 },
    { start: 12, sub: 7, min: 0, max: 15 },
    { start: 15, sub: 8, min: 0, max: 15 },
    { start: 14, sub: 9, min: 0, max: 15 },
    { start: 20, sub: 11, min: 0, max: 20 },
    { start: 18, sub: 5, min: 0, max: 20 },
    { start: 20, sub: 13, min: 0, max: 20 },
]

export const NumberLineJumpsBack = () => {
    const navigate = useNavigate()
    const { addCorrect, sessionPoints, correctCount, wrongCount, reset } = useScoreStore()
    const { completeLesson, addPoints } = useProgressStore()

    const [roundIdx, setRoundIdx] = useState(0)
    const [position, setPosition] = useState(ROUNDS[0].start)
    const [jumps, setJumps] = useState(0)
    const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none')
    const [showComplete, setShowComplete] = useState(false)
    const [confetti, setConfetti] = useState(false)

    const handleSwapView = useCallback((_target: string) => {
        // No simplified view
    }, [])

    const round = ROUNDS[roundIdx]
    const target = round.start - round.sub
    const remaining = round.sub - jumps
    const pct = (n: number) => ((n - round.min) / (round.max - round.min)) * 100
    const attempted = correctCount + wrongCount

    const jump = useCallback(() => {
        if (feedback !== 'none' || remaining <= 0) return
        const next = position - 1
        setPosition(next)
        const newJumps = jumps + 1
        setJumps(newJumps)

        if (newJumps === round.sub) {
            addCorrect(10)
            setFeedback('correct')
            setConfetti(true)
            setTimeout(() => {
                setConfetti(false)
                setFeedback('none')
                setJumps(0)
                const nextR = roundIdx + 1
                if (nextR >= ROUNDS.length) {
                    const stars = wrongCount === 0 ? 3 : wrongCount <= 3 ? 2 : 1
                    completeLesson('subtraction', 'number-line', stars, sessionPoints + 10)
                    addPoints(sessionPoints)
                    setShowComplete(true)
                } else {
                    setRoundIdx(nextR)
                    setPosition(ROUNDS[nextR].start)
                }
            }, 900)
        }
    }, [feedback, remaining, position, jumps, round, roundIdx, wrongCount, sessionPoints, addCorrect, completeLesson, addPoints])

    const jumpFive = useCallback(() => {
        if (feedback !== 'none') return
        const canJump = Math.min(5, remaining)
        if (canJump <= 0) return
        setPosition(p => p - canJump)
        setJumps(j => j + canJump)
    }, [feedback, remaining])

    const handleRetry = () => {
        reset(); setRoundIdx(0); setPosition(ROUNDS[0].start); setJumps(0)
        setFeedback('none'); setShowComplete(false);
    }

    const numbers = Array.from({ length: round.max - round.min + 1 }, (_, i) => i + round.min)

    const playbooks = useMemo<TeachingPlaybook[]>(() => [
        {
            id: 'trace_jumps',
            description: 'Animate backward jumps on the number line one at a time',
            generate: () => {
                const steps = []
                for (let i = 0; i < round.sub; i++) {
                    const from = round.start - i
                    const to = round.start - i - 1
                    steps.push({
                        delay: i === 0 ? 0 : 900,
                        annotations: [
                            { action: 'circle' as const, element: `[data-item="${from}"]`, color: '#fb923c' },
                            { action: 'animate_arrow' as const, element: `[data-item="${from}"]`, toElement: `[data-item="${to}"]`, color: '#fb923c' },
                            { action: 'label' as const, element: `[data-item="${to}"]`, label: `${i + 1}`, color: '#fb923c' },
                        ],
                        speech: i === 0 ? `Starting at ${from}, jump back!` : `${i + 1}`,
                    })
                }
                return steps
            },
        },
        {
            id: 'highlight_operands',
            description: 'Circle the start number and the target separately with labels',
            generate: () => [
                {
                    delay: 0,
                    annotations: [
                        { action: 'circle' as const, element: `[data-item="${round.start}"]`, color: '#60a5fa' },
                        { action: 'label' as const, element: `[data-item="${round.start}"]`, label: `Start: ${round.start}`, color: '#60a5fa' },
                    ],
                    speech: `We start at ${round.start}.`,
                },
                {
                    delay: 1500,
                    annotations: [
                        { action: 'circle' as const, element: `[data-item="${target}"]`, color: '#f97316' },
                        { action: 'label' as const, element: `[data-item="${target}"]`, label: `Land: ${target}`, color: '#f97316' },
                    ],
                    speech: `We need to jump back ${round.sub} to land on ${target}.`,
                },
            ],
        },
    ], [round.start, round.sub, target])

    const lessonContext = useMemo(() => ({
        type: 'number_line' as const,
        operands: [round.start, round.sub],
        answer: target,
    }), [round.start, round.sub, target])

    return (
        <LessonShell
            lessonId="number-line-jumps-back"
            voiceConfig={VOICE_CONFIGS["number-line-jumps"]}
            feedback={feedback}
            problemIndex={roundIdx} total={ROUNDS.length} attempted={attempted} correct={correctCount}
            accentClass="bg-orange-600" subtitle={`${round.start} − ${round.sub} — jump back ${round.sub} times!`}
            playbooks={playbooks}
            lessonContext={lessonContext}
            onSwapView={handleSwapView}>
            <LessonComplete show={showComplete} stars={wrongCount === 0 ? 3 : wrongCount <= 3 ? 2 : 1}
                points={sessionPoints} onRetry={handleRetry} onNext={() => navigate('/')} />
            <Confetti active={confetti} />

            <div className="h-full flex flex-col items-center justify-center gap-8 p-6" data-lesson-focus>
                <motion.div animate={feedback === 'correct' ? { color: '#10b981' } : {}}
                    className="font-black font-display text-5xl text-white" data-key-step>
                    {round.start} − {round.sub} = <span className="text-orange-400">{position}</span>
                </motion.div>

                {/* Number line */}
                <div className="w-full max-w-2xl relative pb-8" data-hint-region>
                    <div className="relative h-4 bg-white/10 rounded-full mx-4">
                        <motion.div className="absolute top-0 right-0 h-full bg-orange-500/50 rounded-full"
                            animate={{ width: `${100 - pct(position)}%` }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }} />
                    </div>
                    <div className="relative h-8 mx-4 mt-1">
                        {numbers.map(n => (
                            <div key={n} data-item={n} className="absolute flex flex-col items-center"
                                style={{ left: `${pct(n)}%`, transform: 'translateX(-50%)' }}>
                                <div className={`w-0.5 h-3 ${n === target ? 'bg-orange-400' : 'bg-white/30'}`} />
                                <span className={`font-display text-[10px] mt-0.5 ${n === target ? 'text-orange-400 font-bold' : 'text-white/40'}`}>{n}</span>
                            </div>
                        ))}
                    </div>
                    {/* Target marker */}
                    <motion.div className="absolute top-[-12px]"
                        style={{ left: `calc(${pct(target)}% - 2px + 1rem)` }}
                        animate={{ y: [0, -4, 0] }} transition={{ duration: 1.2, repeat: Infinity }}>
                        <div className="text-orange-400 text-lg">🎯</div>
                    </motion.div>
                    {/* Character */}
                    <motion.div className="absolute top-[-36px]"
                        animate={{ left: `calc(${pct(position)}% - 8px + 1rem)` }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}>
                        <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 0.5, repeat: Infinity }}>
                            🐰
                        </motion.div>
                    </motion.div>
                </div>

                <div className="text-white/60 font-display">
                    Jumps remaining: <span className="text-orange-400 font-black text-2xl">{remaining}</span>
                </div>

                <div className="flex gap-4" data-answer-area>
                    <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.9 }}
                        onClick={jumpFive} disabled={remaining < 5}
                        className="px-6 py-3 rounded-xl bg-orange-800/50 hover:bg-orange-700/50 disabled:opacity-30 border border-orange-400/20 text-white font-bold font-display">
                        ← 5
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.88 }}
                        onClick={jump} disabled={remaining <= 0}
                        className="w-20 h-20 rounded-2xl bg-orange-600 hover:bg-orange-500 disabled:opacity-30 border border-orange-400/30 text-white font-black text-2xl font-display">
                        ←
                    </motion.button>
                </div>
            </div>
        </LessonShell>
    )
}
