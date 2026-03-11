import React from 'react'
import { motion } from 'framer-motion'

interface NumberLineProps {
    min: number
    max: number
    step?: number
    value?: number
    onSelect?: (n: number) => void
    highlightAbove?: boolean
    /** Draw arc from position A to B downward */
    arcs?: Array<{ from: number; to: number; color?: string }>
    /** Animated character position */
    character?: number
}

export const NumberLine: React.FC<NumberLineProps> = ({
    min, max, step = 1, value, onSelect, arcs = [], character
}) => {
    const ticks = []
    for (let i = min; i <= max; i += step) ticks.push(i)
    const range = max - min

    const pct = (n: number) => ((n - min) / range) * 100

    return (
        <div className="relative w-full h-28 select-none">
            {/* Main line */}
            <div className="absolute left-4 right-4 top-10 h-1 bg-white/30 rounded-full" />

            {/* Tick marks & numbers */}
            {ticks.map((t) => (
                <div
                    key={t}
                    className="absolute flex flex-col items-center"
                    style={{ left: `calc(1rem + ${pct(t)}% * (100% - 2rem) / 100)`, top: '28px' }}
                >
                    <div className={`w-0.5 h-4 rounded-full ${t === value ? 'bg-emerald-400' : 'bg-white/40'}`} />
                    <button
                        onClick={() => onSelect?.(t)}
                        className={`mt-1 text-xs font-bold font-display transition-colors
              ${t === value ? 'text-emerald-400 scale-125' : 'text-white/60 hover:text-white'}`}
                    >
                        {t}
                    </button>
                </div>
            ))}

            {/* Arcs */}
            {arcs.map((arc, i) => {
                const x1 = pct(arc.from)
                const x2 = pct(arc.to)
                const midX = (x1 + x2) / 2
                return (
                    <svg
                        key={i}
                        className="absolute inset-0 w-full h-full pointer-events-none"
                    >
                        <path
                            d={`M ${x1}% 40px Q ${midX}% 4px ${x2}% 40px`}
                            fill="none"
                            stroke={arc.color ?? '#f59e0b'}
                            strokeWidth="2.5"
                            strokeDasharray="4 3"
                        />
                    </svg>
                )
            })}

            {/* Character */}
            {character !== undefined && (
                <motion.div
                    animate={{ left: `calc(1rem + ${pct(character)}% * (100% - 2rem) / 100)` }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                    className="absolute -top-2 transform -translate-x-1/2 text-2xl"
                    style={{ position: 'absolute' }}
                >
                    🤖
                </motion.div>
            )}
        </div>
    )
}
