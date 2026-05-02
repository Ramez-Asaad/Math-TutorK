import { useState, useCallback, useMemo } from 'react'
import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { LessonShell } from '../../components/layout/LessonShell'
import { VOICE_CONFIGS } from '../../utils/lessonVoiceConfigs'
import { LessonComplete } from '../../components/shared/LessonComplete'
import { Confetti } from '../../components/shared/Confetti'
import { Numpad } from '../../components/shared/Numpad'
import { useScoreStore } from '../../store/useScoreStore'
import { useProgressStore } from '../../store/useProgressStore'
import type { TeachingPlaybook } from '../../types/visualCommand'

interface Round { a: number; b: number }
type SlotType = 'mul1' | 'mul2' | 'product' | 'div1' | 'div2' | 'quotient'

const ROUNDS: Round[] = [
    { a: 3, b: 4 }, { a: 5, b: 6 }, { a: 7, b: 8 }, { a: 4, b: 9 },
    { a: 6, b: 7 }, { a: 8, b: 9 }, { a: 3, b: 7 }, { a: 5, b: 8 },
    { a: 4, b: 6 }, { a: 9, b: 9 },
]

type BlankSet = Record<SlotType, boolean>

const BLANK_PRESETS: BlankSet[] = [
    { mul1: false, mul2: false, product: true, div1: false, div2: false, quotient: true },
    { mul1: false, mul2: true, product: false, div1: true, div2: false, quotient: false },
    { mul1: true, mul2: false, product: false, div1: false, div2: true, quotient: false },
]

export const FactFamily = () => {
    const navigate = useNavigate()
    const { addCorrect, addWrong, sessionPoints, correctCount, wrongCount, reset } = useScoreStore()
    const { completeLesson, addPoints } = useProgressStore()

    const [roundIdx, setRoundIdx] = useState(0)
    const [blankPreset] = useState(0)
    const [isSimplified, setIsSimplified] = useState(false)
    const [activeSlot, setActiveSlot] = useState<SlotType | null>(null)
    const [filled, setFilled] = useState<Partial<Record<SlotType, number>>>({})
    const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none')
    const [showComplete, setShowComplete] = useState(false)
    const [confetti, setConfetti] = useState(false)

    const handleSwapView = useCallback((target: string) => {
        if (target === 'simplified_view') setIsSimplified(true)
    }, [])

    const round = ROUNDS[roundIdx]
    const product = round.a * round.b
    const blanks = BLANK_PRESETS[blankPreset % BLANK_PRESETS.length]
    const attempted = correctCount + wrongCount

    const getCorrect = (slot: SlotType): number => {
        switch (slot) {
            case 'mul1': case 'div2': return round.a
            case 'mul2': case 'quotient': return round.b
            case 'product': case 'div1': return product
        }
    }

    const getDisplay = (slot: SlotType): ReactNode => {
        if (!blanks[slot]) {
            return <span className="text-white font-black font-display text-3xl">{getCorrect(slot)}</span>
        }
        if (filled[slot] !== undefined) {
            return <span className="text-emerald-400 font-black font-display text-3xl">{filled[slot]}</span>
        }
        const isActive = activeSlot === slot
        return (
            <motion.span animate={isActive ? { opacity: [1, 0.3, 1] } : {}}
                transition={{ duration: 0.8, repeat: Infinity }}
                onClick={() => setActiveSlot(slot)}
                className={`relative font-black font-display text-3xl cursor-pointer ${isActive ? 'text-amber-400' : 'text-white/30'}`}>
                <motion.div
                    animate={isSimplified ? { scale: 1, opacity: 0.1 } : { scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
                    transition={isSimplified ? {} : { duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute inset-0 bg-blue-500/20 rounded-full blur-3xl"
                />
                ?
            </motion.span>
        )
    }

    const handleAnswer = useCallback((val: string) => {
        if (!activeSlot || feedback !== 'none') return
        const ans = parseInt(val)
        const correct = getCorrect(activeSlot)
        if (ans === correct) {
            const newFilled = { ...filled, [activeSlot]: ans }
            setFilled(newFilled)
            setActiveSlot(null)
            const allDone = (Object.keys(blanks) as SlotType[]).filter(k => blanks[k]).every(k => newFilled[k] !== undefined)
            if (allDone) {
                addCorrect(15)
                setFeedback('correct')
                setConfetti(true)
                setTimeout(() => {
                    setConfetti(false)
                    setFeedback('none')
                    setFilled({})
                    const next = roundIdx + 1
                    if (next >= ROUNDS.length) {
                        const stars = wrongCount === 0 ? 3 : wrongCount <= 3 ? 2 : 1
                        completeLesson('division', 'fact-family', stars, sessionPoints + 15)
                        addPoints(sessionPoints)
                        setShowComplete(true)
                    } else {
                        setRoundIdx(next)
                    }
                }, 1000)
            } else {
                addCorrect(5)
            }
        } else {
            addWrong()
            setFeedback('wrong')
            setTimeout(() => setFeedback('none'), 600)
        }
    }, [activeSlot, feedback, filled, blanks, roundIdx, wrongCount, sessionPoints, addCorrect, addWrong, completeLesson, addPoints])

    const handleRetry = () => {
        reset(); setRoundIdx(0); setFilled({}); setActiveSlot(null); setFeedback('none'); setShowComplete(false);
    }

    const playbooks = useMemo<TeachingPlaybook[]>(() => [
        {
            id: 'fact_family_relations',
            description: 'The same three numbers appear in multiply and divide sentences',
            generate: () => [
                {
                    delay: 0,
                    annotations: [
                        { action: 'pulse', element: '[data-hint-region="ff-house"]', color: '#fbbf24' },
                        { action: 'label', element: '[data-hint-region="ff-house"]', label: `${round.a}, ${round.b}, ${product}`, color: '#fbbf24' },
                    ],
                    speech: `These three numbers travel together: ${round.a}, ${round.b}, and ${product}.`,
                },
                {
                    delay: 1200,
                    annotations: [
                        { action: 'pulse', element: '[data-hint-region="ff-numpad"]', color: '#60a5fa' },
                    ],
                    speech: 'Tap each question mark, then type the number that completes both sides.',
                },
            ],
        },
        {
            id: 'fact_inverse_ops',
            description: 'Division undoes multiplication with the same family numbers',
            generate: () => [
                {
                    delay: 0,
                    annotations: [
                        { action: 'circle', element: '[data-hint-region="ff-house"]', color: '#34d399' },
                    ],
                    speech: 'If you know a times fact, the divide fact uses the same numbers in a different order.',
                },
            ],
        },
    ], [round.a, round.b, product])

    const lessonContext = useMemo(() => ({
        type: 'fact_family' as const,
        operands: [round.a, round.b],
        answer: product,
    }), [round.a, round.b, product])

    const House = () => (
        <div className="flex flex-col items-center gap-3">
            {/* Roof / family label */}
            <div className="bg-amber-500/20 border border-amber-400/30 rounded-xl px-6 py-2 text-amber-300 font-bold font-display text-sm">
                Fact Family: {round.a}, {round.b}, {product}
            </div>

            {/* Two equations */}
            <motion.div
                data-hint-region="ff-house"
                animate={feedback === 'correct' ? { borderColor: '#10b981' } : feedback === 'wrong' ? { x: [0, -8, 8, 0] } : {}}
                className="border-2 border-white/15 rounded-3xl p-8 grid grid-cols-2 gap-8 bg-white/3"
            >
                {/* Multiplication */}
                <div className="flex flex-col gap-4">
                    <div className="text-white/40 font-display text-xs text-center uppercase tracking-wider">Multiplication</div>
                    <div className="flex items-center gap-2 justify-center">
                        {getDisplay('mul1')}
                        <span className="text-white/50 font-display text-2xl">×</span>
                        {getDisplay('mul2')}
                        <span className="text-white/50 font-display text-2xl">=</span>
                        {getDisplay('product')}
                    </div>
                </div>

                {/* Division */}
                <div className="flex flex-col gap-4">
                    <div className="text-white/40 font-display text-xs text-center uppercase tracking-wider">Division</div>
                    <div className="flex items-center gap-2 justify-center">
                        {getDisplay('div1')}
                        <span className="text-white/50 font-display text-2xl">÷</span>
                        {getDisplay('div2')}
                        <span className="text-white/50 font-display text-2xl">=</span>
                        {getDisplay('quotient')}
                    </div>
                </div>
            </motion.div>
        </div>
    )

    return (
        <LessonShell
            lessonId="fact-family"
            voiceConfig={VOICE_CONFIGS["fact-family"]}
            feedback={feedback}
            problemIndex={roundIdx} total={ROUNDS.length} attempted={attempted} correct={correctCount}
            accentClass="bg-teal-600" subtitle="Fill in the fact family!"
            playbooks={playbooks}
            lessonContext={lessonContext}
            onSwapView={handleSwapView}>
            <LessonComplete show={showComplete} stars={wrongCount === 0 ? 3 : wrongCount <= 3 ? 2 : 1}
                points={sessionPoints} onRetry={handleRetry} onNext={() => navigate('/')} />
            <Confetti active={confetti} />

            <div className="h-full flex gap-6 p-4">
                <div className="flex-1 flex flex-col items-center justify-center">
                    <House />
                </div>

                <div data-hint-region="ff-numpad" className={`w-48 flex flex-col items-center justify-center gap-4 shrink-0 transition-opacity ${activeSlot ? 'opacity-100' : 'opacity-40'}`}>
                    <div className="text-white/50 font-display text-sm text-center">
                        {activeSlot ? `Fill the ?` : 'Tap a ?'}
                    </div>
                    <Numpad onAnswer={handleAnswer} maxDigits={3} />
                </div>
            </div>
        </LessonShell>
    )
}
