import { useState, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { LessonShell } from '../../components/layout/LessonShell'
import { VOICE_CONFIGS } from '../../utils/lessonVoiceConfigs'
import { Numpad } from '../../components/shared/Numpad'
import { LessonComplete } from '../../components/shared/LessonComplete'
import { Confetti } from '../../components/shared/Confetti'
import { useScoreStore } from '../../store/useScoreStore'
import { useProgressStore } from '../../store/useProgressStore'
import type { TeachingPlaybook } from '../../types/visualCommand'

interface Round { story: string; a: number; b: number; emoji: string }
const ROUNDS: Round[] = [
    { story: 'Sam has {a} 🍎 apples. She picks {b} more. How many does she have?', a: 5, b: 3, emoji: '🍎' },
    { story: 'There are {a} 🐸 frogs on a log. {b} more jump on. How many frogs?', a: 6, b: 4, emoji: '🐸' },
    { story: 'Jake has {a} 🌟 stars. He earns {b} more. How many stars?', a: 7, b: 5, emoji: '🌟' },
    { story: 'A bag has {a} 🍭 candies. You add {b} more. How many?', a: 8, b: 6, emoji: '🍭' },
    { story: 'There are {a} 🦋 butterflies. {b} more land. How many?', a: 9, b: 3, emoji: '🦋' },
    { story: 'Mia scores {a} points. Then she gets {b} more. Total?', a: 12, b: 8, emoji: '⭐' },
    { story: 'A box has {a} 🎈 balloons. {b} are added. How many?', a: 14, b: 7, emoji: '🎈' },
    { story: 'There are {a} 🐠 fish. {b} more swim in. Total fish?', a: 16, b: 9, emoji: '🐠' },
    { story: 'A shelf has {a} books. {b} more are put on. How many?', a: 23, b: 15, emoji: '📚' },
    { story: 'A school has {a} students. {b} new ones join. Total?', a: 34, b: 28, emoji: '🧒' },
]

export const AdditionWordProblems = () => {
    const navigate = useNavigate()
    const { addCorrect, addWrong, sessionPoints, correctCount, wrongCount, reset } = useScoreStore()
    const { completeLesson, addPoints } = useProgressStore()

    const [roundIdx, setRoundIdx] = useState(0)
    const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none')
    const [showComplete, setShowComplete] = useState(false)
    const [confetti, setConfetti] = useState(false)
    const [showHint, setShowHint] = useState(false)

    const round = ROUNDS[roundIdx]
    const answer = round.a + round.b
    const story = round.story.replace('{a}', String(round.a)).replace('{b}', String(round.b))
    const attempted = correctCount + wrongCount

    const handleAnswer = useCallback((val: string) => {
        if (feedback !== 'none') return
        const ans = parseInt(val)
        if (ans === answer) {
            addCorrect(15)
            setFeedback('correct')
            setConfetti(true)
            setShowHint(false)
            setTimeout(() => {
                setConfetti(false)
                setFeedback('none')
                const next = roundIdx + 1
                if (next >= ROUNDS.length) {
                    const stars = wrongCount === 0 ? 3 : wrongCount <= 3 ? 2 : 1
                    completeLesson('addition', 'word-problems', stars, sessionPoints + 15)
                    addPoints(sessionPoints)
                    setShowComplete(true)
                } else {
                    setRoundIdx(next)
                    setShowHint(false)
                }
            }, 900)
        } else {
            addWrong()
            setFeedback('wrong')
            setShowHint(true)
            setTimeout(() => setFeedback('none'), 600)
        }
    }, [feedback, answer, roundIdx, wrongCount, sessionPoints, addCorrect, addWrong, completeLesson, addPoints])

    const handleRetry = () => {
        reset(); setRoundIdx(0); setFeedback('none'); setShowComplete(false); setShowHint(false)
    }

    const playbooks = useMemo<TeachingPlaybook[]>(() => [
        {
            id: 'word_problem_find_numbers',
            description: 'Identify the two numbers to add from the story card',
            generate: () => [
                {
                    delay: 0,
                    annotations: [
                        { action: 'pulse', element: '[data-hint-region="story-card"]', color: '#fbbf24' },
                        { action: 'label', element: '[data-hint-region="story-card"]', label: 'Read carefully', color: '#fbbf24' },
                    ],
                    speech: 'Find how many you start with, and how many more join.',
                },
                {
                    delay: 1200,
                    annotations: [
                        { action: 'label', element: '[data-hint-region="story-card"]', label: `${round.a} + ${round.b}`, color: '#34d399' },
                    ],
                    speech: `This story is ${round.a} plus ${round.b}.`,
                },
            ],
        },
        {
            id: 'word_problem_numpad',
            description: 'Point to the answer area and total',
            generate: () => [
                {
                    delay: 0,
                    annotations: [
                        { action: 'pulse', element: '[data-hint-region="answer-zone"]', color: '#a78bfa' },
                        { action: 'label', element: '[data-hint-region="answer-zone"]', label: 'Type total', color: '#a78bfa' },
                    ],
                    speech: 'Use the keypad to enter the combined amount.',
                },
                {
                    delay: 1200,
                    annotations: [
                        { action: 'pulse', element: '[data-hint-region="story-card"]', color: '#f59e0b' },
                    ],
                    speech: `Combine ${round.a} and ${round.b} — type the total on the keypad.`,
                },
            ],
        },
    ], [round.a, round.b, answer])

    const lessonContext = useMemo(() => ({
        type: 'add_word_problem' as const,
        operands: [round.a, round.b],
        answer,
        itemCount: answer,
    }), [round.a, round.b, answer])

    return (
        <LessonShell
            lessonId="addition-word-problems"
            voiceConfig={VOICE_CONFIGS["addition-word-problems"]}
            feedback={feedback}
            problemIndex={roundIdx} total={ROUNDS.length} attempted={attempted} correct={correctCount}
            accentClass="bg-emerald-600" subtitle="Read the story and solve!"
            playbooks={playbooks}
            lessonContext={lessonContext}>
            <LessonComplete show={showComplete} stars={wrongCount === 0 ? 3 : wrongCount <= 3 ? 2 : 1}
                points={sessionPoints} onRetry={handleRetry} onNext={() => navigate('/')} />
            <Confetti active={confetti} />

            <div className="h-full flex gap-6 p-4">
                <div className="flex-1 flex flex-col justify-center gap-6">
                    {/* Story card */}
                    <motion.div
                        data-hint-region="story-card"
                        key={roundIdx}
                        initial={{ x: 40, opacity: 0 }}
                        animate={feedback === 'correct'
                            ? { borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', x: 0, opacity: 1 }
                            : feedback === 'wrong'
                                ? { x: [0, -8, 8, -6, 6, -4, 4, 0], opacity: 1 }
                                : { borderColor: 'rgba(255,255,255,0.1)', x: 0, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        className="bg-white/5 rounded-3xl border-2 p-8"
                    >
                        <div className="text-6xl mb-4">{round.emoji}</div>
                        <p className="text-white font-display text-xl leading-relaxed">{story}</p>
                    </motion.div>

                    {/* Hint */}
                    {showHint && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            className="bg-amber-900/30 border border-amber-500/30 rounded-2xl p-4 text-amber-300 font-display text-sm">
                            💡 Hint: {round.a} + {round.b} = ?
                        </motion.div>
                    )}
                </div>

                <div data-hint-region="answer-zone" className="w-48 flex flex-col items-center justify-center gap-4 shrink-0">
                    <div className="text-white/50 font-display text-sm text-center">Your answer</div>
                    <Numpad onAnswer={handleAnswer} maxDigits={3} />
                </div>
            </div>
        </LessonShell>
    )
}
