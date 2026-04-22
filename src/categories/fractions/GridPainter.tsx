import { useState, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { LessonShell } from '../../components/layout/LessonShell'
import { VOICE_CONFIGS } from '../../utils/lessonVoiceConfigs'
import { LessonComplete } from '../../components/shared/LessonComplete'
import { useScoreStore } from '../../store/useScoreStore'
import { useProgressStore } from '../../store/useProgressStore'
import type { TeachingPlaybook } from '../../types/visualCommand'

/* ─── Types ─────────────────────────────────────────────────── */
type Tool = 'halve' | 'third' | 'fifth' | 'eraser' | 'merge' | null
type Color = string

interface Cell {
    id: number
    color: Color | null
}

interface Problem {
    question: string    // e.g. "Shade 3/8 of the shape"
    numerator: number
    denominator: number
}

const PROBLEMS: Problem[] = [
    { question: 'Shade 1/2 of the shape', numerator: 1, denominator: 2 },
    { question: 'Shade 2/3 of the shape', numerator: 2, denominator: 3 },
    { question: 'Shade 3/4 of the shape', numerator: 3, denominator: 4 },
    { question: 'Shade 2/5 of the shape', numerator: 2, denominator: 5 },
    { question: 'Shade 5/6 of the shape', numerator: 5, denominator: 6 },
]

const COLORS: Color[] = [
    '#f87171', '#fb923c', '#facc15', '#4ade80', '#60a5fa', '#c084fc'
]

const SPLIT_MAP: Record<string, number | undefined> = {
    halve: 2, third: 3, fifth: 5,
}

/* ─── Main Component ─────────────────────────────────────────── */
export const GridPainter = () => {
    const navigate = useNavigate()
    const { addCorrect, addWrong, sessionPoints, correctCount, wrongCount, reset } = useScoreStore()
    const { completeLesson, addPoints } = useProgressStore()

    const [problemIdx, setProblemIdx] = useState(0)
    const [cells, setCells] = useState<Cell[]>([{ id: 0, color: null }])
    const [tool, setTool] = useState<Tool>(null)
    const [activeColor, setActiveColor] = useState<Color>(COLORS[3])
    const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none')
    const [showComplete, setShowComplete] = useState(false)

    const problem = PROBLEMS[problemIdx]

    // Split cells — each cell becomes N cells
    const applySplit = useCallback((parts: number) => {
        setCells(prev => prev.flatMap((cell) =>
            Array.from({ length: parts }, (_, i) => ({
                id: cell.id * 100 + i,
                color: cell.color,
            }))
        ))
        setTool(null)
    }, [])

    // Merge adjacent same-colored cells
    const applyMerge = useCallback(() => {
        setCells(prev => {
            // Simplistic: collapse consecutive same-color pairs
            const merged: Cell[] = []
            let i = 0
            while (i < prev.length) {
                if (i + 1 < prev.length && prev[i].color === prev[i + 1].color && prev[i].color !== null) {
                    merged.push(prev[i])
                    i += 2
                } else {
                    merged.push(prev[i])
                    i++
                }
            }
            return merged
        })
        setTool(null)
    }, [])

    const handleToolClick = useCallback((t: Tool) => {
        if (t === 'eraser' || t === 'merge') { setTool(t); return }
        const parts = SPLIT_MAP[t ?? '']
        if (parts) applySplit(parts)
    }, [applySplit])

    const handleCellClick = useCallback((id: number) => {
        if (tool === 'eraser') {
            setCells(prev => prev.map(c => c.id === id ? { ...c, color: null } : c))
            return
        }
        if (tool === 'merge') {
            applyMerge()
            return
        }
        // Paint with active color
        setCells(prev => prev.map(c => c.id === id ? { ...c, color: activeColor } : c))
    }, [tool, activeColor, applyMerge])

    const handleCheck = useCallback(() => {
        const total = cells.length
        const colored = cells.filter(c => c.color !== null).length
        // Check if numerator/denominator matches
        const isCorrect = total === problem.denominator && colored === problem.numerator

        if (isCorrect) {
            addCorrect(20)
            setFeedback('correct')
            setTimeout(() => {
                setFeedback('none')
                const next = problemIdx + 1
                if (next >= PROBLEMS.length) {
                    const stars = wrongCount === 0 ? 3 : wrongCount <= 2 ? 2 : 1
                    completeLesson('fractions', 'grid-painter', stars, sessionPoints + 20)
                    addPoints(sessionPoints)
                    setShowComplete(true)
                } else {
                    setProblemIdx(next)
                    setCells([{ id: 0, color: null }])
                    setTool(null)
                }
            }, 900)
        } else {
            addWrong()
            setFeedback('wrong')
            setTimeout(() => setFeedback('none'), 700)
        }
    }, [cells, problem, problemIdx, wrongCount, sessionPoints, addCorrect, addWrong, completeLesson, addPoints])

    const handleRetry = () => {
        reset()
        setProblemIdx(0)
        setCells([{ id: 0, color: null }])
        setTool(null)
        setShowComplete(false)
        setFeedback('none')
    }

    const playbooks = useMemo<TeachingPlaybook[]>(() => [
        {
            id: 'grid_split_then_paint',
            description: 'Divide the shape until there are enough equal pieces, then shade the target count',
            generate: () => [
                {
                    delay: 0,
                    annotations: [
                        { action: 'pulse', element: '[data-hint-region="grid-goal"]', color: '#fbbf24' },
                        { action: 'label', element: '[data-hint-region="grid-goal"]', label: `${problem.numerator}/${problem.denominator}`, color: '#fbbf24' },
                    ],
                    speech: `You need ${problem.numerator} shaded out of ${problem.denominator} equal parts.`,
                },
                {
                    delay: 1200,
                    annotations: [
                        { action: 'pulse', element: '[data-hint-region="grid-tools"]', color: '#a78bfa' },
                    ],
                    speech: 'Use divide by two, three, or five to split cells, then tap cells to paint.',
                },
            ],
        },
        {
            id: 'grid_check_fraction',
            description: 'Read the live fraction label and press Check',
            generate: () => [
                {
                    delay: 0,
                    annotations: [
                        { action: 'circle', element: '[data-hint-region="grid-canvas"]', color: '#34d399' },
                    ],
                    speech: 'The label shows your current shaded fraction. It should match the goal before you check.',
                },
            ],
        },
    ], [problem.numerator, problem.denominator])

    const lessonContext = useMemo(() => ({
        type: 'grid_painter' as const,
        operands: [problem.numerator, problem.denominator],
        answer: problem.numerator / problem.denominator,
        itemCount: cells.length,
    }), [problem.numerator, problem.denominator, cells.length])

    const coloredCount = cells.filter(c => c.color !== null).length
    const fraction = cells.length > 1
        ? `${coloredCount}/${cells.length}`
        : coloredCount > 0 ? '1/1' : '0/1'

    return (
        <LessonShell
            lessonId="grid-painter"
            voiceConfig={VOICE_CONFIGS["grid-painter"]}
            feedback={feedback}
            problemIndex={problemIdx}
            total={PROBLEMS.length}
            attempted={correctCount + wrongCount}
            correct={correctCount}
            accentClass="bg-violet-600"
            subtitle={problem.question}
            playbooks={playbooks}
            lessonContext={lessonContext}
        >
            <LessonComplete
                show={showComplete}
                stars={wrongCount === 0 ? 3 : wrongCount <= 2 ? 2 : 1}
                points={sessionPoints}
                onRetry={handleRetry}
                onNext={() => navigate('/')}
            />

            <div className="h-full flex gap-4 p-4">
                {/* ── Sidebar tools ── */}
                <div data-hint-region="grid-tools" className="w-32 flex flex-col gap-3 shrink-0">
                    {/* Problem */}
                    <div data-hint-region="grid-goal" className="bg-white/8 rounded-2xl p-3 border border-white/10 text-center">
                        <div className="text-white/60 font-display text-xs mb-1">Shade</div>
                        <div className="text-white font-black font-display text-3xl">
                            {problem.numerator}/{problem.denominator}
                        </div>
                    </div>

                    {/* Split tools */}
                    <div className="flex flex-col gap-2">
                        <div className="text-white/40 font-display text-xs text-center">Split</div>
                        {(['halve', 'third', 'fifth'] as Tool[]).map(t => (
                            <motion.button
                                key={t as string}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleToolClick(t)}
                                className={`py-2 rounded-xl font-bold font-display text-sm border transition-all
                  ${tool === t
                                        ? 'bg-violet-500 border-violet-400 text-white'
                                        : 'bg-white/8 border-white/10 text-white/70 hover:bg-white/15'}`}
                            >
                                {t === 'halve' ? '÷2' : t === 'third' ? '÷3' : '÷5'}
                            </motion.button>
                        ))}
                    </div>

                    {/* Erase + Merge */}
                    <div className="flex flex-col gap-2">
                        <div className="text-white/40 font-display text-xs text-center">Tools</div>
                        {(['eraser', 'merge'] as Tool[]).map((t) => (
                            <motion.button
                                key={t as string}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleToolClick(t)}
                                className={`py-2 rounded-xl font-bold font-display text-sm border
                  ${tool === t
                                        ? 'bg-rose-600 border-rose-400 text-white'
                                        : 'bg-white/8 border-white/10 text-white/70 hover:bg-white/15'}`}
                            >
                                {t === 'eraser' ? '🧹 Erase' : '🔗 Merge'}
                            </motion.button>
                        ))}
                    </div>

                    {/* Color swatches */}
                    <div className="flex flex-col gap-2">
                        <div className="text-white/40 font-display text-xs text-center">Color</div>
                        <div className="grid grid-cols-3 gap-1">
                            {COLORS.map(c => (
                                <motion.button
                                    key={c}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => { setActiveColor(c); setTool(null) }}
                                    style={{ backgroundColor: c }}
                                    className={`aspect-square rounded-lg ${activeColor === c ? 'ring-2 ring-white' : ''}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Grid canvas ── */}
                <div className="flex-1 flex flex-col gap-4">
                    {/* Fraction label */}
                    <div className="flex items-center justify-center gap-4">
                        <motion.div
                            animate={
                                feedback === 'correct'
                                    ? { color: '#10b981', scale: 1.2 }
                                    : feedback === 'wrong'
                                        ? { color: '#ef4444', x: [0, -6, 6, 0] }
                                        : { color: '#fff', scale: 1 }
                            }
                            className="font-black font-display text-4xl"
                        >
                            {fraction}
                        </motion.div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleCheck}
                            className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 rounded-xl text-white font-bold font-display"
                        >
                            Check ✓
                        </motion.button>
                    </div>

                    {/* Shape grid */}
                    <div
                        data-hint-region="grid-canvas"
                        className={`flex-1 grid rounded-2xl border-2 overflow-hidden transition-colors duration-300
              ${feedback === 'correct' ? 'border-emerald-500' : feedback === 'wrong' ? 'border-rose-500' : 'border-white/20'}`}
                        style={{ gridTemplateColumns: `repeat(${Math.min(cells.length, 6)}, 1fr)` }}
                    >
                        {cells.map((cell) => (
                            <motion.div
                                key={cell.id}
                                layoutId={String(cell.id)}
                                animate={{ backgroundColor: cell.color ?? 'rgba(255,255,255,0.05)' }}
                                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                whileHover={{ scale: 1.05 }}
                                onClick={() => handleCellClick(cell.id)}
                                className="border border-white/10 cursor-pointer relative overflow-hidden group"
                                style={{ minHeight: 60 }}
                            >
                                {/* Radial fill ripple on click */}
                                <motion.div
                                    className="absolute inset-0 rounded-full pointer-events-none"
                                    initial={{ scale: 0, opacity: 0.6 }}
                                    whileHover={{ scale: 0 }}
                                    style={{ backgroundColor: activeColor, transformOrigin: 'center' }}
                                />
                            </motion.div>
                        ))}
                    </div>

                    {/* Hint */}
                    {cells.length === 1 && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center text-white/30 font-display text-sm"
                        >
                            Use the split tools (÷2, ÷3, ÷5) to divide the shape, then paint sections!
                        </motion.p>
                    )}
                </div>
            </div>
        </LessonShell>
    )
}
