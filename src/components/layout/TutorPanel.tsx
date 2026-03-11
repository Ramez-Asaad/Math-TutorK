import React from 'react'
import { motion } from 'framer-motion'
import { TutorVoice } from '../shared/TutorVoice'
import { useTutorVoice } from '../../hooks/useTutorVoice'
import { useChildStore } from '../../store/useChildStore'

interface TutorPanelProps {
    voice: ReturnType<typeof useTutorVoice>
}

export const TutorPanel: React.FC<TutorPanelProps> = ({ voice }) => {
    const { name, avatar } = useChildStore()

    return (
        <div className="flex flex-col h-full gap-5 p-4">
            {/* Webcam / Avatar placeholder */}
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 18 }}
                className="relative rounded-3xl overflow-hidden aspect-[3/4] bg-gradient-to-br from-violet-600 via-purple-700 to-indigo-800 flex flex-col items-center justify-center shadow-2xl shadow-purple-900/50"
            >
                {/* Animated glow rings */}
                <motion.div
                    animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute inset-0 rounded-3xl ring-4 ring-violet-400/30"
                />
                {/* Avatar */}
                <motion.div
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="text-8xl drop-shadow-2xl"
                >
                    {avatar}
                </motion.div>
                {/* Name tag */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/40 backdrop-blur-sm py-2 px-4 text-center">
                    <span className="text-white font-bold font-display text-base tracking-wide">{name}</span>
                </div>
            </motion.div>

            {/* Tutor speech bubble */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex-1 relative bg-white/8 backdrop-blur rounded-2xl p-4 border border-white/10"
            >
                {/* Speech bubble tail */}
                <div className="absolute -top-2 left-6 w-4 h-4 rotate-45 bg-white/8 border-l border-t border-white/10" />
                <TutorVoice hook={voice} />
            </motion.div>
        </div>
    )
}
