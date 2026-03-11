import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { LessonShell } from '../../components/layout/LessonShell'
import { VOICE_CONFIGS } from '../../utils/lessonVoiceConfigs'
import { LessonComplete } from '../../components/shared/LessonComplete'
import { useScoreStore } from '../../store/useScoreStore'
import { useProgressStore } from '../../store/useProgressStore'

/* ─── Types ─────────────────────────────────────────────────── */
type DotType = 'red' | 'purple'

interface Dot {
    id: number
    x: number   // % of canvas
    y: number
    type: DotType
    groupId: number | null
    // idle animation offset
    floatOffset: number
    rotOffset: number
}

interface Group {
    id: number
    dotIds: number[]
    type: DotType
}

interface Problem {
    total: number
    divisor: number
    groupSize: number
    dotType: DotType
}

const PROBLEMS: Problem[] = [
    { total: 12, divisor: 3, groupSize: 3, dotType: 'red' },
    { total: 20, divisor: 4, groupSize: 4, dotType: 'red' },
    { total: 24, divisor: 4, groupSize: 4, dotType: 'red' },
    { total: 15, divisor: 5, groupSize: 5, dotType: 'purple' },
    { total: 18, divisor: 6, groupSize: 6, dotType: 'purple' },
]

function makeDots(problem: Problem): Dot[] {
    return Array.from({ length: problem.total }, (_, i) => ({
        id: i,
        x: 10 + Math.random() * 78,
        y: 10 + Math.random() * 75,
        type: problem.dotType,
        groupId: null,
        floatOffset: Math.random() * Math.PI * 2,
        rotOffset: Math.random() * Math.PI * 2,
    }))
}

/* ─── Dot Shape ─────────────────────────────────────────────── */
const DotShape = ({ type, size = 40 }: { type: DotType; size?: number }) => {
    if (type === 'red') {
        // 4-petal flower SVG
        return (
            <svg width={size} height={size} viewBox="0 0 40 40">
                {[0, 90, 180, 270].map((rot) => (
                    <ellipse key={rot} cx={20} cy={20} rx={7} ry={12}
                        transform={`rotate(${rot} 20 20)`}
                        fill="#f87171" opacity={0.9} />
                ))}
                <circle cx={20} cy={20} r={5} fill="#fee2e2" />
            </svg>
        )
    }
    // Purple oval/blob
    return (
        <svg width={size} height={size} viewBox="0 0 40 40">
            <ellipse cx={20} cy={20} rx={14} ry={9} fill="#a78bfa" opacity={0.9} />
            <ellipse cx={20} cy={20} rx={10} ry={6} fill="#c4b5fd" opacity={0.6} />
        </svg>
    )
}

/* ─── Main Component ─────────────────────────────────────────── */
export const DotGrouper = () => {
    const navigate = useNavigate()
    const { addCorrect, sessionPoints, wrongCount, reset } = useScoreStore()
    const { completeLesson, addPoints } = useProgressStore()

    const [problemIdx, setProblemIdx] = useState(0)
    const [dots, setDots] = useState<Dot[]>(() => makeDots(PROBLEMS[0]))
    const [groups, setGroups] = useState<Group[]>([])
    const [selected, setSelected] = useState<number | null>(null)
    const [showComplete, setShowComplete] = useState(false)
    const [shake, setShake] = useState<number | null>(null)  // dot id to shake

    const problem = PROBLEMS[problemIdx]
    const expectedGroups = problem.total / problem.groupSize
    const answered = problemIdx
    const correct = problemIdx

    const handleDotClick = useCallback((dotId: number) => {
        const dot = dots.find(d => d.id === dotId)
        if (!dot || dot.groupId !== null) return

        if (selected === null) {
            setSelected(dotId)
            return
        }

        if (selected === dotId) {
            setSelected(null)
            return
        }

        const selDot = dots.find(d => d.id === selected)
        if (!selDot) { setSelected(dotId); return }

        if (selDot.type !== dot.type) {
            // Wrong match — shake both
            setShake(dotId)
            setTimeout(() => setShake(null), 500)
            setSelected(null)
            return
        }

        // Valid pair — check if they can extend an existing group or form a new one
        const newGroupId = Date.now()
        setGroups(prev => {
            const existing = prev.find(g => g.dotIds.includes(selected) || g.type === dot.type && g.dotIds.length < problem.groupSize)
            if (existing && existing.dotIds.length < problem.groupSize) {
                return prev.map(g => g.id === existing.id
                    ? { ...g, dotIds: [...g.dotIds, dotId, selected].filter((id, i, arr) => arr.indexOf(id) === i) }
                    : g)
            }
            return [...prev, { id: newGroupId, dotIds: [selected, dotId], type: dot.type }]
        })

        setDots(prev => prev.map(d =>
            d.id === dotId || d.id === selected ? { ...d, groupId: newGroupId } : d
        ))
        setSelected(null)
        addCorrect(5)

        // Check if all grouped
        setTimeout(() => {
            setGroups(current => {
                const completedGroups = current.filter(g => g.dotIds.length === problem.groupSize)
                if (completedGroups.length === expectedGroups) {
                    addCorrect(20)
                    const next = problemIdx + 1
                    if (next >= PROBLEMS.length) {
                        const stars = wrongCount === 0 ? 3 : wrongCount <= 2 ? 2 : 1
                        completeLesson('division', 'dot-grouper', stars, sessionPoints + 25)
                        addPoints(sessionPoints)
                        setShowComplete(true)
                    } else {
                        setProblemIdx(next)
                        setDots(makeDots(PROBLEMS[next]))
                        setGroups([])
                    }
                }
                return current
            })
        }, 200)
    }, [dots, selected, problem, expectedGroups, problemIdx, wrongCount, sessionPoints, addCorrect, completeLesson, addPoints])

    const handleRetry = () => {
        reset()
        setProblemIdx(0)
        setDots(makeDots(PROBLEMS[0]))
        setGroups([])
        setSelected(null)
        setShowComplete(false)
    }

    const completedGroupCount = groups.filter(g => g.dotIds.length === problem.groupSize).length

    return (
        <LessonShell
            voiceConfig={VOICE_CONFIGS["dot-grouper"]}
            problemIndex={problemIdx}
            total={PROBLEMS.length}
            attempted={answered}
            correct={correct}
            accentClass="bg-rose-600"
            subtitle={`${problem.total} ÷ ${problem.divisor} — group the dots!`}
        >
            <LessonComplete
                show={showComplete}
                stars={wrongCount === 0 ? 3 : wrongCount <= 2 ? 2 : 1}
                points={sessionPoints}
                onRetry={handleRetry}
                onNext={() => navigate('/')}
            />

            <div className="h-full flex gap-4 p-4">
                {/* ── Sidebar ── */}
                <div className="w-32 flex flex-col gap-4 shrink-0">
                    {/* Problem display */}
                    <div className="bg-white/8 rounded-2xl p-3 border border-white/10 text-center">
                        <div className="text-white font-black font-display text-2xl">{problem.total} ÷ {problem.divisor}</div>
                        <div className="text-white/40 font-display text-xs mt-1">Make groups of {problem.groupSize}</div>
                    </div>

                    {/* Group counter */}
                    <div className="bg-white/8 rounded-2xl p-3 border border-white/10">
                        <div className="text-white/50 font-display text-xs mb-2 text-center">Groups made</div>
                        <div className="flex flex-col gap-2">
                            {Array.from({ length: expectedGroups }, (_, i) => (
                                <motion.div
                                    key={i}
                                    animate={{ backgroundColor: i < completedGroupCount ? '#10b981' : 'rgba(255,255,255,0.05)' }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                                    className="h-8 rounded-xl flex items-center justify-center"
                                >
                                    {i < completedGroupCount
                                        ? <span className="text-white font-bold font-display text-sm">✓ Group {i + 1}</span>
                                        : <span className="text-white/20 font-display text-xs">Group {i + 1}</span>}
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Instructions */}
                    <div className="text-white/30 font-display text-xs text-center leading-relaxed">
                        Click 2 dots of the same shape to group them
                    </div>
                </div>

                {/* ── Canvas ── */}
                <div className="flex-1 relative bg-white/3 rounded-2xl border border-white/8 overflow-hidden">
                    {/* Group rings */}
                    {groups.filter(g => g.dotIds.length === problem.groupSize).map((group) => {
                        const groupDots = dots.filter(d => group.dotIds.includes(d.id))
                        const xs = groupDots.map(d => d.x)
                        const ys = groupDots.map(d => d.y)
                        const cx = (Math.min(...xs) + Math.max(...xs)) / 2
                        const cy = (Math.min(...ys) + Math.max(...ys)) / 2
                        const rx = (Math.max(...xs) - Math.min(...xs)) / 2 + 8
                        const ry = (Math.max(...ys) - Math.min(...ys)) / 2 + 8

                        return (
                            <motion.div
                                key={group.id}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                style={{
                                    position: 'absolute',
                                    left: `${cx}%`, top: `${cy}%`,
                                    width: `${rx * 2}%`, height: `${ry * 2}%`,
                                    transform: 'translate(-50%, -50%)',
                                    border: '2px dashed rgba(16,185,129,0.6)',
                                    borderRadius: '50%',
                                    pointerEvents: 'none',
                                }}
                            />
                        )
                    })}

                    {/* Dots */}
                    {dots.map((dot) => {
                        const isSelected = selected === dot.id
                        const isGrouped = dot.groupId !== null
                        const isShaking = shake === dot.id

                        return (
                            <motion.div
                                key={dot.id}
                                style={{
                                    position: 'absolute',
                                    left: `${dot.x}%`,
                                    top: `${dot.y}%`,
                                    transform: 'translate(-50%, -50%)',
                                    cursor: isGrouped ? 'default' : 'pointer',
                                    filter: isGrouped ? 'brightness(0.6)' : 'none',
                                }}
                                animate={
                                    isShaking
                                        ? { x: [0, -8, 8, -6, 6, -4, 4, 0] }
                                        : isSelected
                                            ? { scale: 1.3, y: [0, -4, 0] }
                                            : { scale: 1, y: [0, -4, 0] }
                                }
                                transition={
                                    isShaking
                                        ? { type: 'spring', stiffness: 300, damping: 20 }
                                        : isSelected
                                            ? { scale: { type: 'spring', stiffness: 300, damping: 20 }, y: { duration: 2, repeat: Infinity, ease: 'easeInOut' } }
                                            : { y: { duration: 2, repeat: Infinity, ease: 'easeInOut', delay: dot.floatOffset * 0.3 } }
                                }
                                whileHover={!isGrouped ? { scale: 1.05 } : {}}
                                onClick={() => !isGrouped && handleDotClick(dot.id)}
                            >
                                {isSelected && (
                                    <motion.div
                                        animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                                        transition={{ duration: 1, repeat: Infinity }}
                                        className="absolute inset-0 rounded-full bg-white/30"
                                        style={{ transform: 'scale(1.5)' }}
                                    />
                                )}
                                <DotShape type={dot.type} size={42} />
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </LessonShell>
    )
}
