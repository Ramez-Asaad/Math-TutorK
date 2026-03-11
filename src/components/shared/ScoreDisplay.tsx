import React from 'react'
import { motion } from 'framer-motion'
import { AnimatedCounter } from './AnimatedCounter'

interface ScoreDisplayProps {
    points: number
    streak: number
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ points, streak }) => {
    return (
        <div className="flex items-center gap-3">
            {streak >= 3 && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-1 bg-amber-500/20 rounded-full px-3 py-1"
                >
                    <span className="text-sm">🔥</span>
                    <span className="text-amber-400 font-bold text-sm font-display">{streak}</span>
                </motion.div>
            )}
            <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5">
                <span className="text-lg">🏆</span>
                <AnimatedCounter value={points} fontSize="text-xl" color="text-amber-300" />
            </div>
        </div>
    )
}
