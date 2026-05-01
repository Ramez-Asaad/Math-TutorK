import { useState, useCallback, useMemo } from 'react'
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

interface Round {
    step: number
    sequence: number[]
    blankIndices: number[]
    label: string
}

const ROUNDS: Round[] = [
    { step: 2, sequence: [2, 4, 6, 8, 10, 12], blankIndices: [2, 4], label: 'Count by 2s' },
    { step: 5, sequence: [5, 10, 15, 20, 25, 30], blankIndices: [1, 3, 5], label: 'Count by 5s' },
    { step: 10, sequence: [10, 20, 30, 40, 50, 60], blankIndices: [2, 4], label: 'Count by 10s' },
    { step: 3, sequence: [3, 6, 9, 12, 15, 18], blankIndices: [1, 3, 5], label: 'Count by 3s' },
    { step: 4, sequence: [4, 8, 12, 16, 20, 24], blankIndices: [2, 4], label: 'Count by 4s' },
    { step: 2, sequence: [14, 16, 18, 20, 22, 24], blankIndices: [1, 3], label: 'Count by 2s' },
    { step: 5, sequence: [25, 30, 35, 40, 45, 50], blankIndices: [0, 2, 4], label: 'Count by 5s' },
    { step: 10, sequence: [100, 110, 120, 130, 140, 150], blankIndices: [1, 3, 5], label: 'Count by 10s' },
    { step: 3, sequence: [21, 24, 27, 30, 33, 36], blankIndices: [2, 4], label: 'Count by 3s' },
    { step: 4, sequence: [20, 24, 28, 32, 36, 40], blankIndices: [1, 3, 5], label: 'Count by 4s' },
]

const STEP_COLORS: Record<number, string> = {
    2: 'from-blue-700 to-blue-500',
    3: 'from-violet-700 to-violet-500',
    4: 'from-teal-700 to-teal-500',
    5: 'from-orange-700 to-orange-500',
    10: 'from-rose-700 to-rose-500',
}

export const SkipCounting = () => {
    const navigate = useNavigate()
    const { addCorrect, addWrong, sessionPoints, correctCount, wrongCount, reset } = useScoreStore()
    const { completeLesson, addPoints } = useProgressStore()
    const [roundIdx, setRoundIdx] = useState(0)
    const [isSimplified, setIsSimplified] = useState(false)
    const [filledBlanks, setFilledBlanks] = useState<Record<number, number | null>>({})
    const [activeBlank, setActiveBlank] = useState<number | null>(null)
    const [showComplete, setShowComplete] = useState(false)
    const [confetti, setConfetti] = useState(false)
    const [wrongBlanks, setWrongBlanks] = useState<number[]>([])

    const handleSwapView = useCallback((target: string) => {
        if (target === 'simplified_view') setIsSimplified(true)
    }, [])

    const round = ROUNDS[roundIdx]
    const attempted = correctCount + wrongCount
    const gradient = STEP_COLORS[round.step] ?? 'from-indigo-700 to-indigo-500'

    const handleBlankTap = (idx: number) => {
        if (filledBlanks[idx] !== undefined && filledBlanks[idx] !== null) return
        setActiveBlank(idx)
    }

    const handleAnswer = useCallback((val: string) => {
        if (activeBlank === null) return
        const answer = parseInt(val)
        const expected = round.sequence[activeBlank]

        if (answer === expected) {
            const newFilled = { ...filledBlanks, [activeBlank]: answer }
            setFilledBlanks(newFilled)
            setActiveBlank(null)

            // Check if all blanks filled correctly
            const allDone = round.blankIndices.every(i => newFilled[i] !== null && newFilled[i] !== undefined)
            if (allDone) {
                addCorrect(15)
                setConfetti(true)
                setTimeout(() => {
                    setConfetti(false)
                    const next = roundIdx + 1
                    if (next >= ROUNDS.length) {
                        const stars = wrongCount === 0 ? 3 : wrongCount <= 3 ? 2 : 1
                        completeLesson('counting', 'skip-counting', stars, sessionPoints + 15)
                        addPoints(sessionPoints)
                        setShowComplete(true)
                    } else {
                        setRoundIdx(next)
                        setFilledBlanks({})
                        setActiveBlank(null)
                    }
                }, 900)
            } else {
                addCorrect(5) // partial credit per blank
            }
        } else {
            addWrong()
            setWrongBlanks(prev => [...prev, activeBlank])
            setTimeout(() => setWrongBlanks(prev => prev.filter(i => i !== activeBlank)), 500)
        }
    }, [activeBlank, round, filledBlanks, roundIdx, wrongCount, sessionPoints, addCorrect, addWrong, completeLesson, addPoints])

    const handleRetry = () => {
        reset()
        setRoundIdx(0)
        setFilledBlanks({})
        setActiveBlank(null)
        setShowComplete(false)
        setIsSimplified(false)
    }

    const playbooks = useMemo<TeachingPlaybook[]>(() => [
        {
            id: 'skip_step_size',
            description: 'Each jump adds the step value — use the +badge as the rhythm',
            generate: () => [
                {
                    delay: 0,
                    annotations: [
                        { action: 'pulse', element: '[data-hint-region="skip-step-badge"]', color: '#fbbf24' },
                        { action: 'label', element: '[data-hint-region="skip-step-badge"]', label: `+${round.step}`, color: '#fbbf24' },
                    ],
                    speech: `This pattern counts by ${round.step}s. Each arrow adds ${round.step} to the previous number.`,
                },
                {
                    delay: 1200,
                    annotations: [
                        { action: 'pulse', element: '[data-hint-region="skip-sequence"]', color: '#34d399' },
                    ],
                    speech: 'Tap a blank tile, then type the number that continues the pattern.',
                },
            ],
        },
        {
            id: 'skip_use_known',
            description: 'Use a filled neighbor tile to figure out the next blank',
            generate: () => {
                const anchor = round.sequence.findIndex((_, i) => !round.blankIndices.includes(i))
                const safe = anchor >= 0 ? anchor : 0
                return [
                    {
                        delay: 0,
                        annotations: [
                            { action: 'circle', element: `[data-skip-tile="${safe}"]`, color: '#a78bfa' },
                        ],
                        speech: `Start from a known number and add ${round.step} each time you move right.`,
                    },
                ]
            },
        },
    ], [round.step, round.sequence, round.blankIndices])

    const lessonContext = useMemo(() => ({
        type: 'skip_counting' as const,
        operands: [round.step],
        answer: round.sequence[round.blankIndices[0] ?? 0],
        itemCount: round.sequence.length,
    }), [round.step, round.sequence, round.blankIndices])

    return (
        <LessonShell
            lessonId="skip-counting"
            voiceConfig={VOICE_CONFIGS["skip-counting"]}
            problemIndex={roundIdx}
            total={ROUNDS.length}
            attempted={attempted}
            correct={correctCount}
            accentClass="bg-amber-500"
            subtitle={`${round.label} — fill in the blanks!`}
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

            <div className="h-full flex gap-6 p-4">
                {/* ── Sequence Display ── */}
                <div className="flex-1 flex flex-col items-center justify-center gap-8">
                    {/* Step badge */}
                    <motion.div
                        data-hint-region="skip-step-badge"
                        animate={{ scale: [1, 1.04, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className={`bg-gradient-to-r ${gradient} rounded-2xl px-6 py-3`}
                    >
                        <span className="text-white font-black font-display text-2xl">+{round.step}</span>
                    </motion.div>

                    {/* Sequence tiles */}
                    <div data-hint-region="skip-sequence" className="flex flex-wrap gap-3 justify-center items-center max-w-lg">
                        {round.sequence.map((num, i) => {
                            const isBlank = round.blankIndices.includes(i)
                            const isFilled = filledBlanks[i] !== undefined && filledBlanks[i] !== null
                            const isActive = activeBlank === i
                            const isWrong = wrongBlanks.includes(i)

                            return (
                                <div key={i} className="flex items-center gap-2">
                                    <motion.div data-skip-tile={i} className="flex items-center gap-2">
                                        {isBlank ? (
                                            <motion.button
                                                animate={
                                                    isWrong
                                                        ? { x: [0, -6, 6, 0], borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.15)' }
                                                        : isFilled
                                                            ? { borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.15)', scale: 1 }
                                                            : isActive
                                                                ? { borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.15)', scale: 1.08 }
                                                                : { borderColor: 'rgba(255,255,255,0.25)', backgroundColor: 'rgba(255,255,255,0.05)', scale: 1 }
                                                }
                                                transition={{ duration: 0.3 }}
                                                onClick={() => !isFilled && handleBlankTap(i)}
                                                className="w-16 h-16 rounded-2xl border-2 flex items-center justify-center font-black font-display text-2xl text-white cursor-pointer"
                                            >
                                                <AnimatePresence mode="wait">
                                                    {isFilled ? (
                                                        <motion.span
                                                            key="filled"
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            className="text-emerald-300"
                                                        >
                                                            {filledBlanks[i]}
                                                        </motion.span>
                                                    ) : isActive ? (
                                                        <motion.span
                                                            key="question"
                                                            animate={{ opacity: [1, 0.2, 1] }}
                                                            transition={{ duration: 0.8, repeat: Infinity }}
                                                            className="text-amber-400"
                                                        >
                                                            ?
                                                        </motion.span>
                                                    ) : (
                                                        <span key="blank" className="text-white/20">_</span>
                                                    )}
                                                </AnimatePresence>
                                            </motion.button>
                                        ) : (
                                            <motion.div
                                                data-skip-tile={i}
                                                initial={{ scale: 0.5, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1, y: isSimplified ? 0 : [0, -4, 0] }}
                                                transition={{
                                                    scale: { delay: i * 0.05, type: 'spring', stiffness: 300, damping: 20 },
                                                    opacity: { delay: i * 0.05, duration: 0.2 },
                                                    y: isSimplified ? {} : { duration: 2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.1 },
                                                }}
                                                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center font-black font-display text-2xl text-white shadow-lg`}
                                            >
                                                {num}
                                            </motion.div>
                                        )}
                                    </motion.div>

                                    {isSimplified && i < round.sequence.length - 1 && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.5 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="flex flex-col items-center gap-0.5"
                                        >
                                            <div className="text-amber-400/60 font-bold text-xs">+{round.step}</div>
                                            <div className="w-4 h-0.5 bg-amber-400/30 rounded-full" />
                                        </motion.div>
                                    )}
                                </div>
                            )
                        })}
                    </div>

                    <div className="text-white/40 font-display text-sm">
                        Tap a blank tile, then type the number
                    </div>

                    <div className="flex gap-6 text-sm font-display">
                        <span className="text-emerald-400">✓ {correctCount}</span>
                        <span className="text-rose-400">✗ {wrongCount}</span>
                    </div>
                </div>

                {/* ── Numpad ── */}
                <div data-hint-region="skip-numpad" className="flex flex-col items-center justify-center gap-4 w-48 shrink-0">
                    <div className={`text-white/50 font-display text-sm text-center transition-opacity ${activeBlank !== null ? 'opacity-100' : 'opacity-30'}`}>
                        {activeBlank !== null ? `Fill blank ${activeBlank + 1}` : 'Tap a blank'}
                    </div>
                    <div className={`transition-opacity ${activeBlank !== null ? 'opacity-100' : 'opacity-40'}`}>
                        <Numpad onAnswer={handleAnswer} maxDigits={3} />
                    </div>
                </div>
            </div>
        </LessonShell>
    )
}
