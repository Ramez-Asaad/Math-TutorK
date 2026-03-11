import React from 'react'
import { LessonShell } from '../components/layout/LessonShell'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

interface ComingSoonProps {
    lessonName: string
    accent?: string
}

export const ComingSoon: React.FC<ComingSoonProps> = ({ lessonName, accent = 'bg-violet-600' }) => {
    const navigate = useNavigate()
    return (
        <LessonShell accentClass={accent}>
            <div className="h-full flex flex-col items-center justify-center gap-6 text-center">
                <motion.div
                    animate={{ y: [0, -8, 0], rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    className="text-8xl"
                >
                    🚀
                </motion.div>
                <div>
                    <h2 className="text-3xl font-black font-display text-white">{lessonName}</h2>
                    <p className="text-white/50 font-display mt-2">Coming in Phase 2! Stay tuned...</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/')}
                    className="px-6 py-3 bg-white/10 rounded-2xl text-white font-bold font-display hover:bg-white/20 border border-white/15"
                >
                    ← Back to Map
                </motion.button>
            </div>
        </LessonShell>
    )
}
