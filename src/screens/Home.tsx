import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useProgressStore } from '../store/useProgressStore'
import { useChildStore } from '../store/useChildStore'
import { useScoreStore } from '../store/useScoreStore'
import { staggerContainer, staggerItem, SPRING } from '../utils/animationPresets'

/* ─── Floating Symbol ────────────────────────────────────────── */
const SYMBOLS = [
    { char: '2+3=5', size: 'text-2xl', color: 'text-emerald-400/25' },
    { char: '×', size: 'text-5xl', color: 'text-violet-400/20' },
    { char: '÷', size: 'text-4xl', color: 'text-rose-400/15' },
    { char: '7', size: 'text-6xl', color: 'text-amber-400/20' },
    { char: 'π', size: 'text-3xl', color: 'text-cyan-400/20' },
    { char: '∑', size: 'text-4xl', color: 'text-pink-400/15' },
    { char: '½', size: 'text-3xl', color: 'text-teal-400/20' },
    { char: '√', size: 'text-5xl', color: 'text-indigo-400/15' },
    { char: '=', size: 'text-6xl', color: 'text-white/10' },
    { char: '∞', size: 'text-3xl', color: 'text-purple-400/20' },
    { char: '9²', size: 'text-2xl', color: 'text-orange-400/20' },
    { char: '+', size: 'text-4xl', color: 'text-green-400/15' },
]

const FloatingSymbol = ({ char, size, color, idx }: { char: string; size: string; color: string; idx: number }) => {
    const seed = useMemo(() => ({
        x: 5 + (idx * 37 + 13) % 85,
        y: 5 + (idx * 53 + 7) % 85,
        dur: 15 + (idx % 5) * 4,
        delay: idx * 0.8,
    }), [idx])

    return (
        <motion.span
            className={`absolute font-display font-black ${size} ${color} select-none pointer-events-none`}
            style={{ left: `${seed.x}%`, top: `${seed.y}%` }}
            initial={{ opacity: 0 }}
            animate={{
                opacity: [0, 1, 1, 0],
                y: [0, -30, -60, -90],
                x: [0, (idx % 2 ? 15 : -15), (idx % 3 ? -10 : 10), 0],
                rotate: [0, idx % 2 ? 10 : -10, 0],
            }}
            transition={{
                duration: seed.dur,
                repeat: Infinity,
                delay: seed.delay,
                ease: 'easeInOut',
            }}
        >
            {char}
        </motion.span>
    )
}

/* ─── Self-Solving Equation ──────────────────────────────────── */
const EQUATIONS = [
    { left: '3 + 4', right: '7' },
    { left: '12 ÷ 3', right: '4' },
    { left: '5 × 6', right: '30' },
    { left: '15 − 8', right: '7' },
    { left: '¼ + ¾', right: '1' },
    { left: '9²', right: '81' },
]

const SolvingEquation = () => {
    const [idx, setIdx] = useState(0)
    const [phase, setPhase] = useState<'question' | 'solving' | 'answer'>('question')

    useEffect(() => {
        const timer = setInterval(() => {
            setPhase(p => {
                if (p === 'question') return 'solving'
                if (p === 'solving') return 'answer'
                setIdx(i => (i + 1) % EQUATIONS.length)
                return 'question'
            })
        }, 1800)
        return () => clearInterval(timer)
    }, [])

    const eq = EQUATIONS[idx]

    return (
        <div className="flex items-center gap-4">
            <AnimatePresence mode="wait">
                <motion.span
                    key={`${idx}-left`}
                    initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -20, filter: 'blur(8px)' }}
                    transition={{ duration: 0.5 }}
                    className="text-5xl md:text-7xl font-black font-display text-white/90 tracking-tight"
                >
                    {eq.left}
                </motion.span>
            </AnimatePresence>

            <motion.span
                animate={{ opacity: phase === 'solving' ? [0.3, 1, 0.3] : 1 }}
                transition={{ duration: 0.6, repeat: phase === 'solving' ? Infinity : 0 }}
                className="text-5xl md:text-7xl font-black font-display text-white/40"
            >
                =
            </motion.span>

            <AnimatePresence mode="wait">
                {phase === 'answer' ? (
                    <motion.span
                        key={`${idx}-answer`}
                        initial={{ scale: 0, opacity: 0, filter: 'blur(12px)' }}
                        animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={SPRING}
                        className="text-5xl md:text-7xl font-black font-display text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-cyan-400 to-emerald-400"
                    >
                        {eq.right}
                    </motion.span>
                ) : (
                    <motion.span
                        key={`${idx}-placeholder`}
                        animate={{
                            opacity: phase === 'solving' ? [0.2, 0.6, 0.2] : 0.3,
                        }}
                        transition={{ duration: 0.8, repeat: phase === 'solving' ? Infinity : 0 }}
                        className="text-5xl md:text-7xl font-black font-display text-white/20"
                    >
                        ?
                    </motion.span>
                )}
            </AnimatePresence>
        </div>
    )
}

/* ─── Categories Data ────────────────────────────────────────── */
interface Category {
    id: string; icon: string; name: string; accent: string; gradient: string
    lessons: { id: string; name: string; desc: string; route: string; difficulty: 1 | 2 | 3; time: string }[]
}

const CATEGORIES: Category[] = [
    {
        id: 'counting', icon: '🔢', name: 'Counting', accent: '#F59E0B',
        gradient: 'from-amber-500/20 to-orange-500/10',
        lessons: [
            { id: 'dot-counter', name: 'Dot Counter', desc: 'Count colorful shapes bouncing on the screen', route: '/counting/dot-counter', difficulty: 1, time: '~5 min' },
            { id: 'number-line', name: 'Number Line', desc: 'Walk along the number line to find each number', route: '/counting/number-line', difficulty: 1, time: '~5 min' },
            { id: 'comparison', name: 'Compare', desc: 'Which group is bigger, smaller, or the same?', route: '/counting/comparison', difficulty: 2, time: '~5 min' },
            { id: 'skip-counting', name: 'Skip Count', desc: 'Hop through numbers in equal leaps', route: '/counting/skip-counting', difficulty: 2, time: '~5 min' },
        ],
    },
    {
        id: 'place-value', icon: '🏛️', name: 'Place Value', accent: '#7C3AED',
        gradient: 'from-violet-500/20 to-purple-500/10',
        lessons: [
            { id: 'dot-builder', name: 'Dot Builder', desc: 'Stack hundreds, tens, and ones blocks', route: '/place-value/dot-builder', difficulty: 2, time: '~5 min' },
            { id: 'expanded-form', name: 'Expanded Form', desc: 'Stretch a number apart like a telescope', route: '/place-value/expanded-form', difficulty: 2, time: '~6 min' },
            { id: 'hieroglyphs', name: 'Hieroglyphs', desc: 'Decode ancient Egyptian number symbols', route: '/place-value/hieroglyphs', difficulty: 2, time: '~7 min' },
            { id: 'rounding', name: 'Rounding', desc: 'Round numbers up or down to the nearest ten', route: '/place-value/rounding', difficulty: 3, time: '~5 min' },
        ],
    },
    {
        id: 'addition', icon: '➕', name: 'Addition', accent: '#059669',
        gradient: 'from-emerald-500/20 to-green-500/10',
        lessons: [
            { id: 'combining', name: 'Combining', desc: 'Push two groups of objects together and count', route: '/addition/combining', difficulty: 1, time: '~5 min' },
            { id: 'number-bonds', name: 'Bonds', desc: 'Find the missing piece that completes the total', route: '/addition/number-bonds', difficulty: 2, time: '~5 min' },
            { id: 'making-ten', name: 'Making Ten', desc: 'Fill the ten frame and add the extras', route: '/addition/making-ten', difficulty: 1, time: '~5 min' },
            { id: 'column-addition', name: 'Columns', desc: 'Stack and add numbers column by column', route: '/addition/column-addition', difficulty: 3, time: '~7 min' },
            { id: 'word-problems', name: 'Words', desc: 'Solve fun addition stories and puzzles', route: '/addition/word-problems', difficulty: 3, time: '~8 min' },
        ],
    },
    {
        id: 'subtraction', icon: '➖', name: 'Subtraction', accent: '#D97706',
        gradient: 'from-orange-500/20 to-yellow-500/10',
        lessons: [
            { id: 'takeaway', name: 'Takeaway', desc: 'Remove objects and count what remains', route: '/subtraction/takeaway', difficulty: 1, time: '~5 min' },
            { id: 'number-line', name: 'Line Jumps', desc: 'Jump backwards on the number line', route: '/subtraction/number-line', difficulty: 2, time: '~5 min' },
            { id: 'ten-frame', name: 'Ten Frame', desc: 'Take counters away from the ten frame', route: '/subtraction/ten-frame', difficulty: 1, time: '~5 min' },
            { id: 'column-subtraction', name: 'Columns', desc: 'Subtract in neat columns with borrowing', route: '/subtraction/column-subtraction', difficulty: 3, time: '~7 min' },
            { id: 'missing-number', name: 'Missing #', desc: 'Crack the subtraction mystery number', route: '/subtraction/missing-number', difficulty: 3, time: '~6 min' },
        ],
    },
    {
        id: 'multiplication', icon: '✖️', name: 'Multiply', accent: '#2563EB',
        gradient: 'from-blue-500/20 to-indigo-500/10',
        lessons: [
            { id: 'equal-groups', name: 'Groups', desc: 'Count items across equal-sized groups', route: '/multiplication/equal-groups', difficulty: 2, time: '~6 min' },
            { id: 'arrays', name: 'Arrays', desc: 'Build rows and columns to find the total', route: '/multiplication/arrays', difficulty: 2, time: '~6 min' },
            { id: 'square-numbers', name: 'Squares', desc: 'Multiply a number by itself', route: '/multiplication/square-numbers', difficulty: 3, time: '~5 min' },
            { id: 'times-table-map', name: 'Table Map', desc: 'Explore the full multiplication grid', route: '/multiplication/times-table-map', difficulty: 3, time: '~10 min' },
            { id: 'flashcards', name: 'Flash', desc: 'Speed-round multiplication flashcards', route: '/multiplication/flashcards', difficulty: 2, time: '~8 min' },
            { id: 'magic-square', name: 'Magic □', desc: 'Fill the grid so every line sums the same', route: '/multiplication/magic-square', difficulty: 3, time: '~8 min' },
        ],
    },
    {
        id: 'division', icon: '➗', name: 'Division', accent: '#DC2626',
        gradient: 'from-red-500/20 to-rose-500/10',
        lessons: [
            { id: 'dot-grouper', name: 'Grouper', desc: 'Drag dots into perfectly equal groups', route: '/division/dot-grouper', difficulty: 2, time: '~6 min' },
            { id: 'fair-share', name: 'Fair Share', desc: 'Divide items equally so everyone gets the same', route: '/division/fair-share', difficulty: 2, time: '~5 min' },
            { id: 'repeated-subtraction', name: 'Repeated', desc: 'Subtract again and again to divide', route: '/division/repeated-subtraction', difficulty: 3, time: '~6 min' },
            { id: 'fact-family', name: 'Fact Family', desc: 'Connect related multiply & divide facts', route: '/division/fact-family', difficulty: 3, time: '~5 min' },
        ],
    },
    {
        id: 'fractions', icon: '🍕', name: 'Fractions', accent: '#6D28D9',
        gradient: 'from-purple-500/20 to-fuchsia-500/10',
        lessons: [
            { id: 'grid-painter', name: 'Painter', desc: 'Paint squares to show the correct fraction', route: '/fractions/grid-painter', difficulty: 2, time: '~6 min' },
            { id: 'comparator', name: 'Compare', desc: 'Which fraction bar is bigger?', route: '/fractions/comparator', difficulty: 2, time: '~5 min' },
            { id: 'number-line', name: 'Line', desc: 'Place fractions on the number line', route: '/fractions/number-line', difficulty: 2, time: '~5 min' },
            { id: 'equivalent', name: 'Equiv.', desc: 'Find fraction twins with the same value', route: '/fractions/equivalent', difficulty: 3, time: '~6 min' },
            { id: 'mixed-numbers', name: 'Mixed', desc: 'Switch between mixed and improper fractions', route: '/fractions/mixed-numbers', difficulty: 3, time: '~7 min' },
        ],
    },
    {
        id: 'algebraic', icon: '🔣', name: 'Algebra', accent: '#0D9488',
        gradient: 'from-teal-500/20 to-cyan-500/10',
        lessons: [
            { id: 'patterns', name: 'Patterns', desc: 'Spot the rule and complete the sequence', route: '/algebraic/patterns', difficulty: 2, time: '~5 min' },
            { id: 'balance-scale', name: 'Scale', desc: 'Find the weight that balances both sides', route: '/algebraic/balance-scale', difficulty: 2, time: '~6 min' },
            { id: 'function-machine', name: 'Machine', desc: 'Crack the secret rule inside the machine', route: '/algebraic/function-machine', difficulty: 3, time: '~7 min' },
            { id: 'missing-number', name: 'Missing', desc: 'Solve for the blank in the equation', route: '/algebraic/missing-number', difficulty: 3, time: '~5 min' },
        ],
    },
    {
        id: 'number-sense', icon: '🧠', name: 'Num Sense', accent: '#4338CA',
        gradient: 'from-indigo-500/20 to-blue-500/10',
        lessons: [
            { id: 'primes', name: 'Primes', desc: 'Discover which numbers are truly special', route: '/number-sense/primes', difficulty: 3, time: '~7 min' },
            { id: 'negative-numbers', name: 'Negatives', desc: 'Explore the land below zero', route: '/number-sense/negative-numbers', difficulty: 3, time: '~5 min' },
            { id: 'word-problems', name: 'Word Prob.', desc: 'Solve tricky brain-teaser stories', route: '/number-sense/word-problems', difficulty: 3, time: '~8 min' },
        ],
    },
]

/* ─── Stat Counter ───────────────────────────────────────────── */
const StatCounter = ({ target, label, suffix = '' }: { target: number; label: string; suffix?: string }) => {
    const mv = useMotionValue(0)
    const springVal = useSpring(mv, { stiffness: 60, damping: 20 })
    const display = useTransform(springVal, v => Math.round(v))
    const [val, setVal] = useState(0)

    useEffect(() => {
        mv.set(target)
        return display.on('change', v => setVal(v))
    }, [target, mv, display])

    return (
        <div className="text-center">
            <div className="text-3xl font-black font-display text-white">
                {val}{suffix}
            </div>
            <div className="text-white/40 font-display text-xs mt-1 uppercase tracking-wider">{label}</div>
        </div>
    )
}

/* ─── Main Component ─────────────────────────────────────────── */
export const Home: React.FC = () => {
    const navigate = useNavigate()
    const { categories, unlockAll } = useProgressStore()
    const { name, avatar } = useChildStore()
    const { sessionPoints } = useScoreStore()
    const [expanded, setExpanded] = useState<string | null>(null)

    useEffect(() => { unlockAll() }, [unlockAll])

    const toggleCategory = (id: string) => {
        const cat = categories[id]
        if (!cat?.unlocked) return
        setExpanded(prev => prev === id ? null : id)
    }

    const totalLessons = CATEGORIES.reduce((s, c) => s + c.lessons.length, 0)
    const totalCompleted = CATEGORIES.reduce((s, c) => {
        const p = categories[c.id]
        return s + Object.values(p?.lessons ?? {}).filter(l => l.completed).length
    }, 0)

    return (
        <div className="h-full w-full bg-[#06060f] overflow-y-auto relative">
            {/* ═══ Floating math symbols background ═══ */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                {SYMBOLS.map((s, i) => (
                    <FloatingSymbol key={i} idx={i} {...s} />
                ))}
            </div>

            {/* ═══ Subtle grid overlay ═══ */}
            <div
                className="fixed inset-0 pointer-events-none opacity-[0.03]"
                style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                    backgroundSize: '60px 60px',
                }}
            />

            {/* ═══ HERO SECTION ═══ */}
            <div className="relative z-10 flex flex-col items-center justify-center min-h-[55vh] px-8">
                {/* Top bar — avatar + points */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="absolute top-6 right-8 flex items-center gap-3 bg-white/[0.04] backdrop-blur-sm rounded-full px-4 py-2 border border-white/[0.06]"
                >
                    <span className="text-2xl">{avatar}</span>
                    <span className="text-white/70 font-display font-bold text-sm">{name}</span>
                    <span className="text-amber-400/80 font-display font-bold text-xs">✦ {sessionPoints}</span>
                </motion.div>

                {/* Main hero content */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                    className="flex flex-col items-center gap-8"
                >
                    {/* Logo mark */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ ...SPRING, delay: 0.2 }}
                        className="relative"
                    >
                        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-2xl shadow-violet-500/30">
                            <span className="text-4xl">🧮</span>
                        </div>
                        {/* Pulse ring */}
                        <motion.div
                            animate={{ scale: [1, 1.5, 1.5], opacity: [0.4, 0, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute inset-0 rounded-3xl border-2 border-violet-400"
                        />
                    </motion.div>

                    {/* Title */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-center"
                    >
                        <h1 className="text-4xl md:text-5xl font-black font-display text-white tracking-tight leading-none">
                            Math{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">
                                Tutor
                            </span>
                        </h1>
                        <p className="text-white/30 font-display text-sm mt-2 tracking-wide">
                            Where numbers come alive
                        </p>
                    </motion.div>

                    {/* Self-solving equation */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <SolvingEquation />
                    </motion.div>

                    {/* Stats strip */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="flex gap-10 mt-2"
                    >
                        <StatCounter target={9} label="Topics" />
                        <div className="w-px bg-white/10" />
                        <StatCounter target={totalLessons} label="Lessons" />
                        <div className="w-px bg-white/10" />
                        <StatCounter target={totalCompleted} label="Done" />
                    </motion.div>
                </motion.div>

                {/* Scroll hint */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, y: [0, 8, 0] }}
                    transition={{ opacity: { delay: 1.5 }, y: { duration: 2, repeat: Infinity, ease: 'easeInOut' } }}
                    className="absolute bottom-4 text-white/20 font-display text-xs flex flex-col items-center gap-1"
                >
                    <span>explore</span>
                    <span>↓</span>
                </motion.div>
            </div>

            {/* ═══ Divider ═══ */}
            <div className="relative z-10 mx-auto w-48 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            {/* ═══ CATEGORY GRID ═══ */}
            <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                className="relative z-10 grid grid-cols-3 gap-3 px-8 py-10 max-w-5xl mx-auto"
            >
                {CATEGORIES.map((cat, idx) => {
                    const progress = categories[cat.id]
                    const unlocked = progress?.unlocked ?? false
                    const completedCount = Object.values(progress?.lessons ?? {}).filter(l => l.completed).length
                    const totalCount = cat.lessons.length
                    const pct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0
                    const isExpanded = expanded === cat.id

                    return (
                        <motion.div key={cat.id} variants={staggerItem} className="flex flex-col">
                            {/* Category card */}
                            <motion.button
                                id={`category-${cat.id}`}
                                whileHover={unlocked ? { scale: 1.03, y: -3 } : {}}
                                whileTap={unlocked ? { scale: 0.97 } : {}}
                                transition={SPRING}
                                onClick={() => toggleCategory(cat.id)}
                                className={`relative rounded-2xl p-4 text-left overflow-hidden border transition-all group ${unlocked
                                    ? 'bg-white/[0.04] border-white/[0.08] cursor-pointer hover:bg-white/[0.07] hover:border-white/[0.15]'
                                    : 'bg-white/[0.02] border-white/[0.04] cursor-not-allowed opacity-40 grayscale'
                                    }`}
                            >
                                {/* Gradient glow on hover */}
                                <div
                                    className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl`}
                                />

                                <div className="relative z-10 flex items-center gap-3">
                                    {/* Icon */}
                                    <motion.span
                                        animate={unlocked ? { y: [0, -3, 0] } : {}}
                                        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: idx * 0.2 }}
                                        className="text-3xl"
                                    >
                                        {cat.icon}
                                    </motion.span>

                                    <div className="flex-1 min-w-0">
                                        <h2 className="text-white font-bold font-display text-sm leading-tight truncate">
                                            {cat.name}
                                        </h2>
                                        <div className="flex items-center gap-2 mt-1">
                                            {/* Mini progress bar */}
                                            <div className="flex-1 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${pct}%` }}
                                                    transition={{ duration: 1, ease: 'easeOut', delay: 0.5 + idx * 0.08 }}
                                                    className="h-full rounded-full"
                                                    style={{ background: cat.accent }}
                                                />
                                            </div>
                                            <span className="text-white/30 font-display text-[10px] font-bold shrink-0">
                                                {completedCount}/{totalCount}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Expand chevron */}
                                    {unlocked && (
                                        <motion.span
                                            animate={{ rotate: isExpanded ? 180 : 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="text-white/20 text-xs"
                                        >
                                            ▼
                                        </motion.span>
                                    )}
                                    {!unlocked && <span className="text-sm">🔒</span>}
                                </div>
                            </motion.button>

                            {/* Expanded lesson list */}
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="flex flex-col gap-1 pt-2">
                                            {cat.lessons.map((lesson, li) => {
                                                const done = progress?.lessons[lesson.id]?.completed ?? false
                                                const stars = progress?.lessons[lesson.id]?.stars ?? 0

                                                return (
                                                    <motion.button
                                                        key={lesson.id}
                                                        id={`lesson-${cat.id}-${lesson.id}`}
                                                        initial={{ opacity: 0, x: -8 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: li * 0.04, ...SPRING }}
                                                        whileHover={{ x: 3, backgroundColor: 'rgba(255,255,255,0.06)' }}
                                                        whileTap={{ scale: 0.98 }}
                                                        onClick={() => navigate(lesson.route)}
                                                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-left border border-transparent hover:border-white/[0.08] transition-colors"
                                                    >
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-white/80 font-semibold font-display text-xs truncate">
                                                                {lesson.name}
                                                            </p>
                                                            <p className="text-white/30 font-display text-[10px] truncate mt-0.5">
                                                                {lesson.desc}
                                                            </p>
                                                        </div>
                                                        {done ? (
                                                            <div className="flex items-center gap-0.5">
                                                                <span className="text-emerald-400 text-xs">✓</span>
                                                                {stars > 0 && <span className="text-[10px]">{'⭐'.repeat(stars)}</span>}
                                                            </div>
                                                        ) : (
                                                            <span className="text-white/15 text-xs">→</span>
                                                        )}
                                                    </motion.button>
                                                )
                                            })}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )
                })}
            </motion.div>

            {/* ═══ Footer tagline ═══ */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="relative z-10 text-center pb-10 text-white/15 font-display text-xs tracking-widest"
            >
                learn · play · grow
            </motion.div>
        </div>
    )
}
