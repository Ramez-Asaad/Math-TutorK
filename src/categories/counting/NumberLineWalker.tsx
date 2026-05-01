import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { LessonShell } from '../../components/layout/LessonShell'
import { VOICE_CONFIGS } from '../../utils/lessonVoiceConfigs'
import { LessonComplete } from '../../components/shared/LessonComplete'
import { Confetti } from '../../components/shared/Confetti'
import { useScoreStore } from '../../store/useScoreStore'
import { useProgressStore } from '../../store/useProgressStore'
import type { TeachingPlaybook } from '../../types/visualCommand'

interface Round { start: number; target: number; min: number; max: number }

const ROUNDS: Round[] = [
    { start: 3, target: 7, min: 0, max: 10 },
    { start: 8, target: 5, min: 0, max: 10 },
    { start: 0, target: 6, min: 0, max: 10 },
    { start: 10, target: 4, min: 0, max: 10 },
    { start: 5, target: 9, min: 0, max: 12 },
    { start: 2, target: 11, min: 0, max: 12 },
    { start: 12, target: 7, min: 0, max: 12 },
    { start: 6, target: 0, min: 0, max: 12 },
    { start: 0, target: 15, min: 0, max: 20 },
    { start: 20, target: 13, min: 0, max: 20 },
]

export const NumberLineWalker = () => {
    const navigate = useNavigate()
    const { addCorrect, addWrong, sessionPoints, correctCount, wrongCount, reset } = useScoreStore()
    const { completeLesson, addPoints } = useProgressStore()
    const [roundIdx, setRoundIdx] = useState(0)
    const [isSimplified, setIsSimplified] = useState(false)
    const [position, setPosition] = useState(ROUNDS[0].start)
    const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none')
    const [showComplete, setShowComplete] = useState(false)
    const [confetti, setConfetti] = useState(false)
    const [direction, setDirection] = useState<'left' | 'right' | null>(null)

    const handleSwapView = useCallback((target: string) => {
        if (target === 'simplified_view') setIsSimplified(true)
    }, [])

    const round = ROUNDS[roundIdx]
    const attempted = correctCount + wrongCount
    const pct = (n: number) => ((n - round.min) / (round.max - round.min)) * 100

    const move = useCallback((delta: number) => {
        if (feedback !== 'none') return
        const next = Math.max(round.min, Math.min(round.max, position + delta))
        setDirection(delta > 0 ? 'right' : 'left')
        setPosition(next)
        setTimeout(() => setDirection(null), 300)
    }, [feedback, position, round])

    const handleCheck = useCallback(() => {
        if (position !== round.target) {
            addWrong()
            setFeedback('wrong')
            setTimeout(() => setFeedback('none'), 600)
            return
        }

        addCorrect(10)
        setFeedback('correct')
        setConfetti(true)
        setTimeout(() => {
            setConfetti(false)
            setFeedback('none')
            const next = roundIdx + 1
            if (next >= ROUNDS.length) {
                const stars = wrongCount === 0 ? 3 : wrongCount <= 3 ? 2 : 1
                completeLesson('counting', 'number-line', stars, sessionPoints + 10)
                addPoints(sessionPoints)
                setShowComplete(true)
            } else {
                setRoundIdx(next)
                setPosition(ROUNDS[next].start)
            }
        }, 900)
    }, [position, round, roundIdx, wrongCount, sessionPoints, addCorrect, addWrong, completeLesson, addPoints])

    const handleRetry = () => {
        reset()
        setRoundIdx(0)
        setPosition(ROUNDS[0].start)
        setFeedback('none')
        setShowComplete(false)
        setIsSimplified(false)
    }

    const numbers = Array.from({ length: round.max - round.min + 1 }, (_, i) => i + round.min)

    const playbooks = useMemo<TeachingPlaybook[]>(() => [
        {
            id: 'line_walk_goal',
            description: 'Show the star target and the frog’s current position on the line',
            generate: () => [
                {
                    delay: 0,
                    annotations: [
                        { action: 'pulse', element: '[data-hint-region="nl-target"]', color: '#fbbf24' },
                        { action: 'label', element: '[data-hint-region="nl-target"]', label: `Goal ${round.target}`, color: '#fbbf24' },
                    ],
                    speech: `Land the frog on ${round.target}.`,
                },
                {
                    delay: 1200,
                    annotations: [
                        { action: 'pulse', element: '[data-hint-region="nl-line"]', color: '#34d399' },
                    ],
                    speech: 'Use the arrows to move one step, or the ±5 jumps for faster moves.',
                },
            ],
        },
        {
            id: 'line_walk_check',
            description: 'Highlight the Check button when ready to verify',
            generate: () => [
                {
                    delay: 0,
                    annotations: [
                        { action: 'circle', element: '[data-hint-region="nl-controls"]', color: '#a78bfa' },
                    ],
                    speech: `When your position reads ${round.target}, press Check.`,
                },
            ],
        },
    ], [round.target])

    const lessonContext = useMemo(() => ({
        type: 'number_line_walker' as const,
        operands: [round.start, round.target],
        answer: round.target,
        itemCount: round.max - round.min + 1,
    }), [round.start, round.target, round.min, round.max])

    return (
        <LessonShell
            lessonId="number-line-walker"
            voiceConfig={VOICE_CONFIGS["number-line"]}
            feedback={feedback}
            problemIndex={roundIdx}
            total={ROUNDS.length}
            attempted={attempted}
            correct={correctCount}
            accentClass="bg-amber-500"
            subtitle={`Walk to number ${round.target}!`}
            playbooks={playbooks}
            lessonContext={lessonContext}
            onSwapView={handleSwapView}
        >
            <LessonComplete
                show={showComplete}
                stars={wrongCount === 0 ? 3 : wrongCount <= 3 ? 2 : 1}
                points={sessionPoints}
                onRetry={handleRetry}
                onNext={() => navigate('/')}
            />
            <Confetti active={confetti} />

            <div className="h-full flex flex-col items-center justify-center gap-8 p-6">
                {/* Target */}
                <motion.div
                    data-hint-region="nl-target"
                    animate={{ scale: [1, 1.06, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    className="bg-amber-500/20 border border-amber-400/40 rounded-2xl px-8 py-4 text-center"
                >
                    <div className="text-white/60 font-display text-sm">Walk to</div>
                    <div className="text-amber-300 font-black font-display text-6xl">{round.target}</div>
                </motion.div>

                {/* Number line */}
                <div data-hint-region="nl-line" className="w-full max-w-2xl relative">
                    {/* Track */}
                    <div className="relative h-4 bg-white/10 rounded-full mx-4">
                        <motion.div
                            className="absolute top-0 left-0 h-full bg-amber-500/50 rounded-full"
                            animate={{ width: `${pct(position)}%` }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        />
                    </div>

                    {/* Tick marks */}
                    <div className="relative h-8 mx-4 mt-1">
                        {numbers.map((n) => {
                            const isMajor = n % 5 === 0 || n === round.target || n === round.min || n === round.max;
                            if (isSimplified && !isMajor) return null;
                            
                            return (
                                <div
                                    key={n}
                                    className="absolute flex flex-col items-center"
                                    style={{ left: `${pct(n)}%`, transform: 'translateX(-50%)' }}
                                >
                                    <div className={`w-0.5 h-3 ${n === round.target ? 'bg-amber-400' : 'bg-white/30'}`} />
                                    <span className={`font-display text-[10px] mt-0.5 ${n === round.target ? 'text-amber-400 font-bold' : 'text-white/40'
                                        }`}>{n}</span>
                                </div>
                            )
                        })}
                    </div>

                    {/* Target marker */}
                    <motion.div
                        className="absolute top-[-12px]"
                        style={{ left: `calc(${pct(round.target)}% - 2px + 1rem)` }}
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    >
                        <div className="text-amber-400 text-lg">⭐</div>
                    </motion.div>

                    {/* Walker character */}
                    <motion.div
                        className="absolute top-[-36px]"
                        animate={{ left: `calc(${pct(position)}% - 8px + 1rem)`, scaleX: direction === 'left' ? -1 : 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    >
                        <motion.div
                            animate={{ y: [0, -4, 0] }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                            className="text-3xl select-none"
                        >
                            🐸
                        </motion.div>
                    </motion.div>
                </div>

                {/* Current position */}
                <div className="text-white/60 font-display text-lg">
                    Position: <span className="text-white font-black text-2xl">{position}</span>
                </div>

                {/* Controls */}
                <div data-hint-region="nl-controls" className="flex gap-4 items-center">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => move(-1)}
                        disabled={position <= round.min}
                        className="w-16 h-16 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-30 border border-blue-400/30 text-white font-black text-2xl font-display"
                    >
                        ←
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => move(-5)}
                        disabled={position <= round.min}
                        className="px-4 py-3 rounded-xl bg-blue-800/50 hover:bg-blue-700/50 disabled:opacity-30 border border-blue-400/20 text-white font-bold font-display text-sm"
                    >
                        ← 5
                    </motion.button>

                    <AnimatePresence>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleCheck}
                            animate={
                                feedback === 'correct'
                                    ? { backgroundColor: '#10b981' }
                                    : feedback === 'wrong'
                                        ? { x: [0, -6, 6, 0] }
                                        : { backgroundColor: position === round.target ? '#f59e0b' : '#6b7280' }
                            }
                            className="px-8 py-4 rounded-2xl text-white font-bold font-display text-lg"
                        >
                            {position === round.target ? '⭐ That\'s it!' : 'Check ✓'}
                        </motion.button>
                    </AnimatePresence>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => move(5)}
                        disabled={position >= round.max}
                        className="px-4 py-3 rounded-xl bg-emerald-800/50 hover:bg-emerald-700/50 disabled:opacity-30 border border-emerald-400/20 text-white font-bold font-display text-sm"
                    >
                        5 →
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => move(1)}
                        disabled={position >= round.max}
                        className="w-16 h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 border border-emerald-400/30 text-white font-black text-2xl font-display"
                    >
                        →
                    </motion.button>
                </div>

                <div className="flex gap-6 text-sm font-display">
                    <span className="text-emerald-400">✓ {correctCount}</span>
                    <span className="text-rose-400">✗ {wrongCount}</span>
                </div>
            </div>
        </LessonShell>
    )
}
