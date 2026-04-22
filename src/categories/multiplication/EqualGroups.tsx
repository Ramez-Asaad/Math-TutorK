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

interface Round { groups: number; perGroup: number }
const ROUNDS: Round[] = [
    { groups: 3, perGroup: 4 }, { groups: 2, perGroup: 6 }, { groups: 4, perGroup: 3 },
    { groups: 5, perGroup: 2 }, { groups: 3, perGroup: 7 }, { groups: 4, perGroup: 5 },
    { groups: 2, perGroup: 9 }, { groups: 6, perGroup: 3 }, { groups: 5, perGroup: 4 }, { groups: 3, perGroup: 8 },
]
const COLORS = ['#f87171', '#fb923c', '#facc15', '#4ade80', '#60a5fa', '#c084fc']

export const EqualGroups = () => {
    const navigate = useNavigate()
    const { addCorrect, addWrong, sessionPoints, correctCount, wrongCount, reset } = useScoreStore()
    const { completeLesson, addPoints } = useProgressStore()

    const [roundIdx, setRoundIdx] = useState(0)
    const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none')
    const [showComplete, setShowComplete] = useState(false)
    const [confetti, setConfetti] = useState(false)
    const [showShaded, setShowShaded] = useState(false)

    const round = ROUNDS[roundIdx]
    const answer = round.groups * round.perGroup
    const attempted = correctCount + wrongCount

    const handleAnswer = useCallback((val: string) => {
        if (feedback !== 'none') return
        const ans = parseInt(val)
        if (ans === answer) {
            addCorrect(10)
            setFeedback('correct')
            setShowShaded(true)
            setConfetti(true)
            setTimeout(() => {
                setConfetti(false)
                setFeedback('none')
                setShowShaded(false)
                const next = roundIdx + 1
                if (next >= ROUNDS.length) {
                    const stars = wrongCount === 0 ? 3 : wrongCount <= 3 ? 2 : 1
                    completeLesson('multiplication', 'equal-groups', stars, sessionPoints + 10)
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
    }, [feedback, answer, roundIdx, wrongCount, sessionPoints, addCorrect, addWrong, completeLesson, addPoints])

    const handleRetry = () => {
        reset(); setRoundIdx(0); setFeedback('none'); setShowShaded(false); setShowComplete(false)
    }

    const playbooks = useMemo<TeachingPlaybook[]>(() => [
        {
            id: 'eq_groups_visual',
            description: 'Each box is one group; dots inside show how many per group',
            generate: () => [
                {
                    delay: 0,
                    annotations: [
                        { action: 'pulse', element: '[data-hint-region="eq-groups-eq"]', color: '#fbbf24' },
                        { action: 'label', element: '[data-hint-region="eq-groups-eq"]', label: `${round.groups}×${round.perGroup}`, color: '#fbbf24' },
                    ],
                    speech: `${round.groups} groups, each with ${round.perGroup} items.`,
                },
                {
                    delay: 1200,
                    annotations: [
                        { action: 'pulse', element: '[data-hint-region="eq-groups-pile"]', color: '#60a5fa' },
                    ],
                    speech: 'Multiply groups times the size of each group to get the total.',
                },
            ],
        },
        {
            id: 'eq_groups_total',
            description: 'Type the combined count on the keypad',
            generate: () => [
                {
                    delay: 0,
                    annotations: [
                        { action: 'circle', element: '[data-hint-region="eq-groups-numpad"]', color: '#34d399' },
                    ],
                    speech: 'Enter the total number of circles.',
                },
            ],
        },
    ], [round.groups, round.perGroup])

    const lessonContext = useMemo(() => ({
        type: 'equal_groups' as const,
        operands: [round.groups, round.perGroup],
        answer,
        itemCount: answer,
    }), [round.groups, round.perGroup, answer])

    return (
        <LessonShell
            lessonId="equal-groups"
            voiceConfig={VOICE_CONFIGS["equal-groups"]}
            feedback={feedback}
            problemIndex={roundIdx} total={ROUNDS.length} attempted={attempted} correct={correctCount}
            accentClass="bg-blue-600" subtitle={`${round.groups} groups of ${round.perGroup} = ?`}
            playbooks={playbooks}
            lessonContext={lessonContext}>
            <LessonComplete show={showComplete} stars={wrongCount === 0 ? 3 : wrongCount <= 3 ? 2 : 1}
                points={sessionPoints} onRetry={handleRetry} onNext={() => navigate('/')} />
            <Confetti active={confetti} />

            <div className="h-full flex gap-6 p-4">
                <div className="flex-1 flex flex-col items-center justify-center gap-6">
                    <motion.div data-hint-region="eq-groups-eq" animate={feedback === 'correct' ? { color: '#10b981' } : {}}
                        className="font-black font-display text-5xl text-white">
                        {round.groups} × {round.perGroup} = <span className="text-blue-400">{showShaded ? answer : '?'}</span>
                    </motion.div>

                    {/* Groups display */}
                    <motion.div
                        data-hint-region="eq-groups-pile"
                        animate={feedback === 'correct' ? { borderColor: '#10b981' } : feedback === 'wrong' ? { x: [0, -8, 8, 0] } : {}}
                        className="flex gap-4 flex-wrap justify-center border-2 border-white/10 rounded-3xl p-6"
                    >
                        {Array.from({ length: round.groups }, (_, g) => (
                            <motion.div
                                key={g}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: g * 0.1, type: 'spring', stiffness: 300 }}
                                className="rounded-2xl border-2 p-3 flex flex-wrap gap-1.5 justify-center"
                                style={{ borderColor: COLORS[g % COLORS.length] + '60', backgroundColor: COLORS[g % COLORS.length] + '15', maxWidth: 120 }}
                            >
                                {Array.from({ length: round.perGroup }, (_, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: g * 0.1 + i * 0.04, type: 'spring' }}
                                        className="w-7 h-7 rounded-full"
                                        style={{ backgroundColor: COLORS[g % COLORS.length] }}
                                    />
                                ))}
                                <div className="w-full text-center text-xs font-display mt-1" style={{ color: COLORS[g % COLORS.length] }}>
                                    {round.perGroup}
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>

                <div data-hint-region="eq-groups-numpad" className="w-48 flex flex-col items-center justify-center gap-4 shrink-0">
                    <div className="text-white/50 font-display text-sm text-center">Total circles?</div>
                    <Numpad onAnswer={handleAnswer} maxDigits={2} />
                </div>
            </div>
        </LessonShell>
    )
}
