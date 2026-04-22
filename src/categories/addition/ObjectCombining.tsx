import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { LessonShell } from '../../components/layout/LessonShell'
import { VOICE_CONFIGS } from '../../utils/lessonVoiceConfigs'
import { LessonComplete } from '../../components/shared/LessonComplete'
import { Confetti } from '../../components/shared/Confetti'
import { useScoreStore } from '../../store/useScoreStore'
import { useProgressStore } from '../../store/useProgressStore'
import { Numpad } from '../../components/shared/Numpad'
import type { TeachingPlaybook } from '../../types/visualCommand'

const SPOKEN_NUMBERS = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve']

const EMOJI_SETS = ['🍎', '🌟', '🐸', '🦋', '🍭', '🐠', '🌸', '🎈', '🍕', '🦄']

interface Round { a: number; b: number }
const ROUNDS: Round[] = [
    { a: 3, b: 2 }, { a: 4, b: 5 }, { a: 6, b: 3 }, { a: 2, b: 7 },
    { a: 5, b: 4 }, { a: 8, b: 3 }, { a: 4, b: 6 }, { a: 7, b: 5 },
    { a: 9, b: 2 }, { a: 6, b: 6 },
]

export const ObjectCombining = () => {
    const navigate = useNavigate()
    const { addCorrect, addWrong, sessionPoints, correctCount, wrongCount, reset } = useScoreStore()
    const { completeLesson, addPoints } = useProgressStore()

    const [roundIdx, setRoundIdx] = useState(0)
    const [emoji] = useState(() => EMOJI_SETS[Math.floor(Math.random() * EMOJI_SETS.length)])
    const [combined, setCombined] = useState(false)
    const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none')
    const [showComplete, setShowComplete] = useState(false)
    const [confetti, setConfetti] = useState(false)
    const [answered, setAnswered] = useState(false)

    const round = ROUNDS[roundIdx]
    const total = round.a + round.b
    const attempted = correctCount + wrongCount

    const handleCombine = () => {
        if (combined) return
        setCombined(true)
    }

    const handleAnswer = useCallback((val: string) => {
        if (!combined || feedback !== 'none' || answered) return
        const answer = parseInt(val)
        setAnswered(true)

        if (answer === total) {
            addCorrect(10)
            setFeedback('correct')
            setConfetti(true)
            setTimeout(() => {
                setConfetti(false)
                setFeedback('none')
                setAnswered(false)
                setCombined(false)
                const next = roundIdx + 1
                if (next >= ROUNDS.length) {
                    const stars = wrongCount === 0 ? 3 : wrongCount <= 3 ? 2 : 1
                    completeLesson('addition', 'combining', stars, sessionPoints + 10)
                    addPoints(sessionPoints)
                    setShowComplete(true)
                } else {
                    setRoundIdx(next)
                }
            }, 900)
        } else {
            addWrong()
            setFeedback('wrong')
            setAnswered(false)
            setTimeout(() => setFeedback('none'), 600)
        }
    }, [combined, feedback, answered, total, roundIdx, wrongCount, sessionPoints, addCorrect, addWrong, completeLesson, addPoints])

    const handleRetry = () => {
        reset(); setRoundIdx(0); setFeedback('none')
        setCombined(false); setAnswered(false); setShowComplete(false)
    }

    const groupA = Array.from({ length: round.a })
    const groupB = Array.from({ length: round.b })

    const playbooks = useMemo<TeachingPlaybook[]>(() => [
        {
            id: 'count_group_a',
            description: 'Count items in group A one-by-one',
            generate: () => groupA.map((_, i) => ({
                delay: i === 0 ? 0 : 700,
                annotations: [
                    { action: 'circle' as const, element: `[data-item="a-${i}"]`, color: '#34d399' },
                    { action: 'label' as const, element: `[data-item="a-${i}"]`, label: `${i + 1}`, color: '#34d399' },
                ],
                speech: i === 0 ? `First group: ${SPOKEN_NUMBERS[i] ?? String(i + 1)}` : (SPOKEN_NUMBERS[i] ?? String(i + 1)),
            })),
        },
        {
            id: 'count_group_b',
            description: 'Count items in group B one-by-one',
            generate: () => groupB.map((_, i) => ({
                delay: i === 0 ? 0 : 700,
                annotations: [
                    { action: 'circle' as const, element: `[data-item="b-${i}"]`, color: '#60a5fa' },
                    { action: 'label' as const, element: `[data-item="b-${i}"]`, label: `${i + 1}`, color: '#60a5fa' },
                ],
                speech: i === 0 ? `Second group: ${SPOKEN_NUMBERS[i] ?? String(i + 1)}` : (SPOKEN_NUMBERS[i] ?? String(i + 1)),
            })),
        },
        {
            id: 'count_combined',
            description: 'Count all items together after combining',
            generate: () => {
                if (!combined) return [{
                    delay: 0,
                    annotations: [{ action: 'pulse' as const, element: '[data-group="a"]', color: '#fbbf24' }],
                    speech: 'First, press Combine to put them all together!',
                }]
                return Array.from({ length: total }, (_, i) => ({
                    delay: i === 0 ? 0 : 600,
                    annotations: [
                        { action: 'circle' as const, element: `[data-item="c-${i}"]`, color: '#fbbf24' },
                        { action: 'label' as const, element: `[data-item="c-${i}"]`, label: `${i + 1}`, color: '#fbbf24' },
                    ],
                    speech: i === 0 ? `All together! ${SPOKEN_NUMBERS[i] ?? String(i + 1)}` : (SPOKEN_NUMBERS[i] ?? String(i + 1)),
                }))
            },
        },
        {
            id: 'show_equation',
            description: 'Highlight both groups and show the equation',
            generate: () => [
                {
                    delay: 0,
                    annotations: [
                        { action: 'pulse' as const, element: '[data-group="a"]', color: '#34d399' },
                        { action: 'label' as const, element: '[data-group="a"]', label: `${round.a}`, color: '#34d399' },
                    ],
                    speech: `The first group has ${round.a}.`,
                },
                {
                    delay: 1500,
                    annotations: [
                        { action: 'pulse' as const, element: '[data-group="b"]', color: '#60a5fa' },
                        { action: 'label' as const, element: '[data-group="b"]', label: `${round.b}`, color: '#60a5fa' },
                    ],
                    speech: `The second group has ${round.b}.`,
                },
                {
                    delay: 1500,
                    annotations: [
                        { action: 'label' as const, element: '[data-answer-area]', label: `${round.a} + ${round.b} = ${total}`, color: '#fbbf24' },
                    ],
                    speech: `${round.a} plus ${round.b} equals ${total}!`,
                },
            ],
        },
    ], [groupA, groupB, round, total, combined])

    const lessonContext = useMemo(() => ({
        type: 'object_combining' as const,
        operands: [round.a, round.b],
        answer: total,
        itemCount: total,
    }), [round.a, round.b, total])

    return (
        <LessonShell
            lessonId="object-combining"
            voiceConfig={VOICE_CONFIGS["combining"]}
            feedback={feedback}
            problemIndex={roundIdx} total={ROUNDS.length} attempted={attempted} correct={correctCount}
            accentClass="bg-emerald-600" subtitle={`${round.a} + ${round.b} = ?`}
            playbooks={playbooks}
            lessonContext={lessonContext}>
            <LessonComplete show={showComplete} stars={wrongCount === 0 ? 3 : wrongCount <= 3 ? 2 : 1}
                points={sessionPoints} onRetry={handleRetry} onNext={() => navigate('/')} />
            <Confetti active={confetti} />

            <div className="h-full flex gap-6 p-4">
                <div className="flex-1 flex flex-col items-center justify-center gap-6">
                    {/* Two groups + arrow + combined */}
                    <div className="flex items-center gap-4 w-full justify-center">
                        {/* Group A */}
                        <motion.div
                            data-group="a"
                            animate={combined ? { x: 60, opacity: 0, scale: 0.6 } : { x: 0, opacity: 1, scale: 1 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            className="bg-emerald-900/40 border border-emerald-500/30 rounded-2xl p-4 flex flex-wrap gap-2 justify-center min-w-[120px]"
                        >
                            {groupA.map((_, i) => (
                                <motion.span key={i} data-item={`a-${i}`} initial={{ scale: 0 }} animate={{ scale: 1, y: [0, -4, 0] }}
                                    transition={{ scale: { delay: i * 0.05, type: 'spring', stiffness: 300, damping: 20 }, y: { duration: 2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.1 } }}
                                    className="text-3xl select-none">{emoji}</motion.span>
                            ))}
                            <div className="w-full text-center text-emerald-300 font-black font-display text-xl mt-1">{round.a}</div>
                        </motion.div>

                        {!combined && (
                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                onClick={handleCombine}
                                className="text-white/60 font-black font-display text-4xl hover:text-amber-400 transition-colors">
                                +
                            </motion.button>
                        )}

                        {/* Group B */}
                        <motion.div
                            data-group="b"
                            animate={combined ? { x: -60, opacity: 0, scale: 0.6 } : { x: 0, opacity: 1, scale: 1 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            className="bg-blue-900/40 border border-blue-500/30 rounded-2xl p-4 flex flex-wrap gap-2 justify-center min-w-[120px]"
                        >
                            {groupB.map((_, i) => (
                                <motion.span key={i} data-item={`b-${i}`} initial={{ scale: 0 }} animate={{ scale: 1, y: [0, -4, 0] }}
                                    transition={{ scale: { delay: i * 0.05, type: 'spring', stiffness: 300, damping: 20 }, y: { duration: 2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.1 } }}
                                    className="text-3xl select-none">{emoji}</motion.span>
                            ))}
                            <div className="w-full text-center text-blue-300 font-black font-display text-xl mt-1">{round.b}</div>
                        </motion.div>
                    </div>

                    {/* Combined group */}
                    <AnimatePresence>
                        {combined && (
                            <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="bg-amber-900/30 border-2 border-amber-500/50 rounded-3xl p-6 flex flex-wrap gap-2 justify-center max-w-xs"
                            >
                                {Array.from({ length: total }, (_, i) => (
                                    <motion.span key={i} data-item={`c-${i}`} initial={{ scale: 0 }} animate={{ scale: 1, y: [0, -4, 0] }}
                                        transition={{ scale: { delay: i * 0.04, type: 'spring', stiffness: 300, damping: 20 }, y: { duration: 2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.08 } }}
                                        className="text-3xl select-none">{emoji}</motion.span>
                                ))}
                                <div className="w-full text-center text-amber-300/60 font-display text-sm mt-2">Count them all!</div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {!combined && (
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={handleCombine}
                            className="px-8 py-3 bg-amber-500 hover:bg-amber-400 rounded-2xl text-white font-bold font-display text-lg">
                            Combine! 🤝
                        </motion.button>
                    )}
                </div>

                {/* Numpad */}
                <div className="w-48 flex flex-col items-center justify-center gap-4 shrink-0" data-answer-area>
                    <div className={`text-white/50 font-display text-sm text-center transition-opacity ${combined ? 'opacity-100' : 'opacity-30'}`}>
                        How many total?
                    </div>
                    <motion.div animate={feedback === 'wrong' ? { x: [0, -8, 8, -6, 6, -4, 4, 0] } : { x: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        className={`transition-opacity ${combined ? 'opacity-100' : 'opacity-40'}`}>
                        <Numpad onAnswer={handleAnswer} maxDigits={2} />
                    </motion.div>
                </div>
            </div>
        </LessonShell>
    )
}
