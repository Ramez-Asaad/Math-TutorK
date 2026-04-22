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

interface Round { a: number; b: number }
const ROUNDS: Round[] = [
    { a: 23, b: 14 }, { a: 47, b: 35 }, { a: 56, b: 28 }, { a: 63, b: 19 },
    { a: 145, b: 237 }, { a: 348, b: 156 }, { a: 467, b: 285 }, { a: 529, b: 163 },
    { a: 74, b: 58 }, { a: 189, b: 124 },
]

const DigitColumn = ({ top, bottom, label, carry }: { top: number; bottom: number; label: string; carry?: number }) => (
    <div className="flex flex-col items-center gap-1 w-16" data-col={label}>
        {carry !== undefined && carry > 0 ? (
            <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                data-carry={label}
                className="text-amber-400 font-bold font-display text-sm h-5">+{carry}</motion.div>
        ) : <div className="h-5" />}
        <div className="text-white/40 font-display text-xs">{label}</div>
        <div className="text-white font-black font-display text-3xl">{top === -1 ? '' : top}</div>
        <div className="text-white font-black font-display text-3xl">{bottom === -1 ? '' : bottom}</div>
        <div className="w-full h-0.5 bg-white/30 my-1" />
        <div className="text-amber-300 font-black font-display text-2xl h-8 flex items-center">?</div>
    </div>
)

export const ColumnAddition = () => {
    const navigate = useNavigate()
    const { addCorrect, addWrong, sessionPoints, correctCount, wrongCount, reset } = useScoreStore()
    const { completeLesson, addPoints } = useProgressStore()

    const [roundIdx, setRoundIdx] = useState(0)
    const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none')
    const [showComplete, setShowComplete] = useState(false)
    const [confetti, setConfetti] = useState(false)
    const [revealAnswer, setRevealAnswer] = useState(false)

    const round = ROUNDS[roundIdx]
    const answer = round.a + round.b
    const is3Digit = round.a >= 100 || round.b >= 100
    const attempted = correctCount + wrongCount

    const getDigits = (n: number) => {
        const s = String(n).padStart(is3Digit ? 3 : 2, '0')
        return { h: is3Digit ? parseInt(s[0]) : -1, t: parseInt(s[is3Digit ? 1 : 0]), o: parseInt(s[is3Digit ? 2 : 1]) }
    }
    const da = getDigits(round.a)
    const db = getDigits(round.b)
    const carryO = (da.o + db.o) >= 10 ? 1 : 0
    const carryT = (da.t + db.t + carryO) >= 10 ? 1 : 0

    const handleAnswer = useCallback((val: string) => {
        if (feedback !== 'none') return
        const ans = parseInt(val)
        if (ans === answer) {
            addCorrect(15)
            setFeedback('correct')
            setRevealAnswer(true)
            setConfetti(true)
            setTimeout(() => {
                setConfetti(false)
                setFeedback('none')
                setRevealAnswer(false)
                const next = roundIdx + 1
                if (next >= ROUNDS.length) {
                    const stars = wrongCount === 0 ? 3 : wrongCount <= 3 ? 2 : 1
                    completeLesson('addition', 'column-addition', stars, sessionPoints + 15)
                    addPoints(sessionPoints)
                    setShowComplete(true)
                } else {
                    setRoundIdx(next)
                }
            }, 1000)
        } else {
            addWrong()
            setFeedback('wrong')
            setTimeout(() => setFeedback('none'), 600)
        }
    }, [feedback, answer, roundIdx, wrongCount, sessionPoints, addCorrect, addWrong, completeLesson, addPoints])

    const handleRetry = () => {
        reset(); setRoundIdx(0); setFeedback('none'); setRevealAnswer(false); setShowComplete(false)
    }

    const playbooks = useMemo<TeachingPlaybook[]>(() => {
        const columns: { label: string; top: number; bottom: number; carry: number }[] = []
        columns.push({ label: 'O', top: da.o, bottom: db.o, carry: 0 })
        columns.push({ label: 'T', top: da.t, bottom: db.t, carry: carryO })
        if (is3Digit) columns.push({ label: 'H', top: da.h, bottom: db.h, carry: carryT })

        return [
            {
                id: 'walk_columns',
                description: 'Walk through columns right-to-left explaining addition and carry',
                generate: () => columns.map((col, i) => {
                    const sum = col.top + col.bottom + col.carry
                    const digit = sum % 10
                    const hasCarry = sum >= 10
                    const carryText = col.carry > 0 ? ` plus ${col.carry} carried` : ''
                    return {
                        delay: i === 0 ? 0 : 2000,
                        annotations: [
                            { action: 'highlight' as const, element: `[data-col="${col.label}"]`, color: '#fbbf24' },
                            { action: 'label' as const, element: `[data-col="${col.label}"]`, label: `${col.top}+${col.bottom}${col.carry ? `+${col.carry}` : ''}=${sum}`, color: '#fbbf24' },
                        ],
                        speech: i === 0
                            ? `Start with the ones column. ${col.top} plus ${col.bottom}${carryText} equals ${sum}.${hasCarry ? ` Write ${digit} and carry 1.` : ''}`
                            : `${col.label === 'T' ? 'Tens' : 'Hundreds'} column: ${col.top} plus ${col.bottom}${carryText} equals ${sum}.${hasCarry ? ` Write ${digit} and carry 1.` : ''}`,
                    }
                }),
            },
            {
                id: 'highlight_carry',
                description: 'Circle the carry digits and explain where they come from',
                generate: () => {
                    const steps = []
                    if (carryO > 0) {
                        steps.push({
                            delay: 0,
                            annotations: [
                                { action: 'circle' as const, element: '[data-carry="T"]', color: '#f59e0b' },
                                { action: 'label' as const, element: '[data-carry="T"]', label: `Carry from ones!`, color: '#f59e0b' },
                            ],
                            speech: `${da.o} plus ${db.o} is ${da.o + db.o}. That's more than 9, so carry the 1 to tens!`,
                        })
                    }
                    if (carryT > 0) {
                        steps.push({
                            delay: steps.length > 0 ? 2500 : 0,
                            annotations: [
                                { action: 'circle' as const, element: '[data-carry="H"]', color: '#f59e0b' },
                                { action: 'label' as const, element: '[data-carry="H"]', label: `Carry from tens!`, color: '#f59e0b' },
                            ],
                            speech: `${da.t} plus ${db.t} plus ${carryO} is ${da.t + db.t + carryO}. Carry the 1 to hundreds!`,
                        })
                    }
                    if (steps.length === 0) {
                        steps.push({
                            delay: 0,
                            annotations: [
                                { action: 'highlight' as const, element: '[data-col="O"]', color: '#34d399' },
                                { action: 'label' as const, element: '[data-col="O"]', label: 'No carry needed!', color: '#34d399' },
                            ],
                            speech: 'Good news — no carrying needed for this one! Just add each column.',
                        })
                    }
                    return steps
                },
            },
        ]
    }, [da, db, carryO, carryT, is3Digit])

    const lessonContext = useMemo(() => ({
        type: 'column_arithmetic' as const,
        operands: [round.a, round.b],
        answer,
    }), [round.a, round.b, answer])

    return (
        <LessonShell
            lessonId="column-addition"
            voiceConfig={VOICE_CONFIGS["column-addition"]}
            feedback={feedback}
            problemIndex={roundIdx} total={ROUNDS.length} attempted={attempted} correct={correctCount}
            accentClass="bg-emerald-600" subtitle="Add the columns — ones, tens, hundreds!"
            playbooks={playbooks}
            lessonContext={lessonContext}>
            <LessonComplete show={showComplete} stars={wrongCount === 0 ? 3 : wrongCount <= 3 ? 2 : 1}
                points={sessionPoints} onRetry={handleRetry} onNext={() => navigate('/')} />
            <Confetti active={confetti} />

            <div className="h-full flex gap-6 p-4">
                <div className="flex-1 flex flex-col items-center justify-center gap-8">
                    {/* Column layout */}
                    <motion.div
                        animate={feedback === 'correct' ? { borderColor: '#10b981', x: 0 } : feedback === 'wrong' ? { x: [0, -8, 8, -6, 6, -4, 4, 0] } : { borderColor: 'rgba(255,255,255,0.1)', x: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        className="flex gap-0 border-2 rounded-3xl p-8 relative"
                    >
                        {/* Plus sign */}
                        <div className="absolute left-4 bottom-16 text-white/40 font-black font-display text-2xl">+</div>

                        {is3Digit && (
                            <DigitColumn top={da.h} bottom={db.h} label="H" carry={carryT} />
                        )}
                        <DigitColumn top={da.t} bottom={db.t} label="T" carry={carryO} />
                        <DigitColumn top={da.o} bottom={db.o} label="O" />

                        {/* Answer row */}
                        {revealAnswer && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                className="absolute bottom-3 right-4 text-emerald-400 font-black font-display text-2xl">
                                = {answer}
                            </motion.div>
                        )}
                    </motion.div>

                    {/* Carry hint */}
                    <div className="text-white/30 font-display text-xs">
                        {carryO > 0 && `Carry 1 to tens column`}
                        {carryT > 0 && carryO > 0 && ' · '}
                        {carryT > 0 && `Carry 1 to hundreds`}
                    </div>
                </div>

                <div className="w-48 flex flex-col items-center justify-center gap-4 shrink-0" data-answer-area>
                    <div className="text-white/50 font-display text-sm">{round.a} + {round.b} = ?</div>
                    <Numpad onAnswer={handleAnswer} maxDigits={4} />
                </div>
            </div>
        </LessonShell>
    )
}
