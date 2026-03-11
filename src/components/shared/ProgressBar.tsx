import React from 'react'
import { motion } from 'framer-motion'

interface ProgressBarProps {
    total: number
    attempted: number
    correct: number
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ total, attempted, correct }) => {
    const correctPct = (correct / total) * 100
    const attemptedPct = (attempted / total) * 100
    const remainingPct = 100 - attemptedPct

    return (
        <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden flex">
            {/* Correct — green */}
            <motion.div
                className="h-full bg-emerald-400 rounded-l-full"
                initial={{ width: '0%' }}
                animate={{ width: `${correctPct}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
            />
            {/* Attempted but wrong — orange */}
            <motion.div
                className="h-full bg-amber-400"
                initial={{ width: '0%' }}
                animate={{ width: `${Math.max(0, attemptedPct - correctPct)}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
            />
            {/* Remaining — gray */}
            <motion.div
                className="h-full bg-white/10 flex-1 rounded-r-full"
                initial={{ width: `${remainingPct}%` }}
                animate={{ width: `${remainingPct}%` }}
            />
        </div>
    )
}
