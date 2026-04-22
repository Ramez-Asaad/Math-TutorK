import React, { useState, useCallback, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LessonShell } from '../../components/layout/LessonShell'
import { VOICE_CONFIGS } from '../../utils/lessonVoiceConfigs'
import { Numpad } from '../../components/shared/Numpad'
import { LessonComplete } from '../../components/shared/LessonComplete'
import { useScoreStore } from '../../store/useScoreStore'
import { useProgressStore } from '../../store/useProgressStore'
import { useNavigate } from 'react-router-dom'
import type { TeachingPlaybook } from '../../types/visualCommand'

/* ─── Types ─────────────────────────────────────────────────── */
type CellStatus = 'untested' | 'fast' | 'medium' | 'slow' | 'wrong'

interface CellData {
    status: CellStatus
    time: number   // ms
    lastAnswer?: number
}

function pickNext(cells: Record<string, CellData>): { a: number; b: number } {
    // Weighted toward untested + slow
    const weights: { a: number; b: number; w: number }[] = []
    for (let a = 2; a <= 12; a++) {
        for (let b = 2; b <= 12; b++) {
            const key = `${a}x${b}`
            const cell = cells[key]
            let w = 1
            if (!cell || cell.status === 'untested') w = 4
            else if (cell.status === 'slow') w = 3
            else if (cell.status === 'wrong') w = 3
            else if (cell.status === 'medium') w = 2
            weights.push({ a, b, w })
        }
    }
    const total = weights.reduce((s, x) => s + x.w, 0)
    let r = Math.random() * total
    for (const item of weights) {
        r -= item.w
        if (r <= 0) return { a: item.a, b: item.b }
    }
    return { a: 6, b: 7 } // fallback
}

const cellColor = (status: CellStatus) => {
    switch (status) {
        case 'fast': return 'bg-teal-500 text-white'
        case 'medium': return 'bg-orange-500 text-white'
        case 'slow': return 'bg-rose-600 text-white'
        case 'wrong': return 'bg-rose-800 text-white'
        default: return 'bg-white/8 text-white/30'
    }
}

/* ─── Main Component ─────────────────────────────────────────── */
export const TimesTableMap = () => {
    const navigate = useNavigate()
    const { addCorrect, addWrong, sessionPoints, correctCount, wrongCount, reset } = useScoreStore()
    const { completeLesson, addPoints } = useProgressStore()

    const [cells, setCells] = useState<Record<string, CellData>>({})
    const [current, setCurrent] = useState(() => ({ a: 6, b: 7 }))
    const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none')
    const [showCorrect, setShowCorrect] = useState(false) // show answer briefly after wrong
    const [questionsAnswered, setQuestionsAnswered] = useState(0)
    const [showComplete, setShowComplete] = useState(false)
    const startTime = useRef(Date.now())
    const TOTAL_QUESTIONS = 20

    const attempted = correctCount + wrongCount
    const correct = correctCount

    const handleAnswer = useCallback((val: string) => {
        if (feedback !== 'none') return
        const answer = parseInt(val)
        const expected = current.a * current.b
        const elapsed = Date.now() - startTime.current
        const key = `${current.a}x${current.b}`

        if (answer === expected) {
            const status: CellStatus = elapsed < 2000 ? 'fast' : elapsed < 4000 ? 'medium' : 'slow'
            setCells((prev) => ({ ...prev, [key]: { status, time: elapsed } }))
            addCorrect(status === 'fast' ? 15 : status === 'medium' ? 10 : 5)
            setFeedback('correct')
            const next = questionsAnswered + 1
            setQuestionsAnswered(next)
            setTimeout(() => {
                setFeedback('none')
                startTime.current = Date.now()
                if (next >= TOTAL_QUESTIONS) {
                    const stars = wrongCount === 0 ? 3 : wrongCount <= 4 ? 2 : 1
                    completeLesson('multiplication', 'times-table-map', stars, sessionPoints + 15)
                    addPoints(sessionPoints)
                    setShowComplete(true)
                } else {
                    setCurrent(() => pickNext({ ...cells, [key]: { status, time: elapsed } }))
                }
            }, 500)
        } else {
            setCells((prev) => ({ ...prev, [key]: { status: 'wrong', time: elapsed, lastAnswer: answer } }))
            addWrong()
            setFeedback('wrong')
            setShowCorrect(true)
            setTimeout(() => {
                setShowCorrect(false)
                setFeedback('none')
                startTime.current = Date.now()
                setCurrent(pickNext(cells))
                setQuestionsAnswered((n) => n + 1)
            }, 1800)
        }
    }, [current, feedback, cells, questionsAnswered, wrongCount, sessionPoints, addCorrect, addWrong, completeLesson, addPoints])

    const handleRetry = () => {
        reset()
        setCells({})
        setCurrent({ a: 6, b: 7 })
        setQuestionsAnswered(0)
        setShowComplete(false)
        setFeedback('none')
        startTime.current = Date.now()
    }

    const playbooks = useMemo<TeachingPlaybook[]>(() => [
        {
            id: 'ttm_read_question',
            description: 'Read the highlighted factors and find their product',
            generate: () => [
                {
                    delay: 0,
                    annotations: [
                        { action: 'pulse', element: '[data-hint-region="ttm-question"]', color: '#fbbf24' },
                        { action: 'label', element: '[data-hint-region="ttm-question"]', label: `${current.a}×${current.b}`, color: '#fbbf24' },
                    ],
                    speech: `Multiply ${current.a} by ${current.b}.`,
                },
                {
                    delay: 1200,
                    annotations: [
                        { action: 'pulse', element: '[data-hint-region="ttm-map"]', color: '#60a5fa' },
                    ],
                    speech: 'The grid lights your row and column — the cell where they meet is the fact you are practicing.',
                },
            ],
        },
        {
            id: 'ttm_speed_tip',
            description: 'Use the numpad quickly; colors show how fast you recalled each fact',
            generate: () => [
                {
                    delay: 0,
                    annotations: [
                        { action: 'circle', element: '[data-hint-region="ttm-numpad"]', color: '#34d399' },
                    ],
                    speech: 'Aim for green lightning by answering in under two seconds.',
                },
            ],
        },
    ], [current.a, current.b])

    const lessonContext = useMemo(() => ({
        type: 'times_table_map' as const,
        operands: [current.a, current.b],
        answer: current.a * current.b,
    }), [current.a, current.b])

    return (
        <LessonShell
            lessonId="times-table-map"
            voiceConfig={VOICE_CONFIGS["times-table-map"]}
            feedback={feedback}
            problemIndex={0}
            total={TOTAL_QUESTIONS}
            attempted={attempted}
            correct={correct}
            accentClass="bg-blue-600"
            subtitle="Times Table Map — beat your fastest times!"
            playbooks={playbooks}
            lessonContext={lessonContext}
        >
            <LessonComplete
                show={showComplete}
                stars={wrongCount === 0 ? 3 : wrongCount <= 4 ? 2 : 1}
                points={sessionPoints}
                onRetry={handleRetry}
                onNext={() => navigate('/')}
            />

            <div className="h-full flex gap-4 p-3 overflow-hidden">
                {/* ── 12×12 Grid ── */}
                <div data-hint-region="ttm-map" className="flex-1 overflow-auto">
                    <div className="grid" style={{ gridTemplateColumns: `28px repeat(12, 1fr)`, gap: 3 }}>
                        {/* Header row */}
                        <div />
                        {Array.from({ length: 12 }, (_, i) => (
                            <motion.div
                                key={i}
                                animate={{ backgroundColor: current.b === i + 2 ? 'rgba(251,146,60,0.3)' : 'transparent' }}
                                className="text-center text-white/50 text-xs font-bold font-display pb-1 rounded"
                            >
                                {i + 2}
                            </motion.div>
                        ))}

                        {/* Rows */}
                        {Array.from({ length: 12 }, (_, ri) => (
                            <React.Fragment key={ri}>
                                {/* Row label */}
                                <motion.div
                                    animate={{ backgroundColor: current.a === ri + 2 ? 'rgba(251,146,60,0.3)' : 'transparent' }}
                                    className="flex items-center justify-center text-white/50 text-xs font-bold font-display rounded"
                                >
                                    {ri + 2}
                                </motion.div>

                                {/* Cells */}
                                {Array.from({ length: 12 }, (_, ci) => {
                                    const a = ri + 2, b = ci + 2
                                    const key = `${a}x${b}`
                                    const cell = cells[key]
                                    const isActive = current.a === a && current.b === b

                                    return (
                                        <motion.div
                                            key={key}
                                            animate={isActive ? { scale: 1.15, zIndex: 10 } : { scale: 1, zIndex: 1 }}
                                            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                                            className={`relative aspect-square rounded-lg flex items-center justify-center
                        text-xs font-bold font-display cursor-default
                        ${isActive ? 'ring-2 ring-amber-400' : ''}
                        ${cell ? cellColor(cell.status) : 'bg-white/8 text-white/20'}
                      `}
                                        >
                                            {cell?.status === 'fast' && <span className="text-xs">⚡</span>}
                                            {cell && cell.status !== 'fast' && (
                                                <span className="text-[9px]">{(cell.time / 1000).toFixed(1)}s</span>
                                            )}
                                            {!cell && <span className="text-[9px] text-white/20">{a * b}</span>}
                                        </motion.div>
                                    )
                                })}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* ── Question Panel ── */}
                <div data-hint-region="ttm-numpad" className="w-44 flex flex-col items-center gap-4 justify-center shrink-0">
                    <div className="text-white/40 font-display text-xs text-center">
                        {questionsAnswered}/{TOTAL_QUESTIONS} done
                    </div>

                    {/* Question box */}
                    <motion.div
                        data-hint-region="ttm-question"
                        animate={
                            feedback === 'correct'
                                ? { borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.15)' }
                                : feedback === 'wrong'
                                    ? { borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.15)', x: [0, -8, 8, -6, 6, 0] }
                                    : { borderColor: 'rgba(251,191,36,0.5)', backgroundColor: 'rgba(251,191,36,0.05)' }
                        }
                        transition={{ duration: 0.4 }}
                        className="w-full rounded-2xl border-2 p-4 text-center"
                    >
                        <div className="text-white font-black font-display text-3xl">
                            {current.a} × {current.b}
                        </div>
                        <div className="text-white/30 font-display text-sm mt-1">= ?</div>
                        <AnimatePresence>
                            {showCorrect && (
                                <motion.div
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="text-emerald-400 font-bold font-display text-xl mt-1"
                                >
                                    {current.a * current.b}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    <Numpad onAnswer={handleAnswer} maxDigits={3} />

                    {/* Mini legend */}
                    <div className="flex flex-col gap-1 text-[10px] font-display text-white/40">
                        <span><span className="text-teal-400">⚡</span> Fast (&lt;2s)</span>
                        <span><span className="text-orange-400">●</span> OK (2–4s)</span>
                        <span><span className="text-rose-400">●</span> Slow (&gt;4s)</span>
                    </div>
                </div>
            </div>
        </LessonShell>
    )
}
