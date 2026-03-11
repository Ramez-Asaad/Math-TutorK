import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Confetti } from './Confetti'

interface LessonCompleteProps {
    show: boolean
    stars: 1 | 2 | 3
    points: number
    onNext?: () => void
    onRetry?: () => void
}

export const LessonComplete: React.FC<LessonCompleteProps> = ({
    show, stars, points, onNext, onRetry
}) => {
    return (
        <>
            <Confetti active={show} />
            <AnimatePresence>
                {show && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40 flex items-center justify-center"
                    >
                        {/* Backdrop */}
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

                        {/* Modal */}
                        <motion.div
                            initial={{ scale: 0.6, opacity: 0, y: 40 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.6, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            className="relative z-50 bg-gradient-to-b from-indigo-900 to-purple-900 rounded-3xl p-10 flex flex-col items-center gap-6 shadow-2xl min-w-[320px]"
                        >
                            <h1 className="text-4xl font-black font-display text-white text-center">
                                🎉 Lesson Complete!
                            </h1>

                            {/* Stars */}
                            <div className="flex gap-3">
                                {[1, 2, 3].map((s) => (
                                    <motion.span
                                        key={s}
                                        initial={{ scale: 0, rotate: -30 }}
                                        animate={{ scale: s <= stars ? 1 : 0.5, rotate: 0 }}
                                        transition={{ delay: s * 0.15, type: 'spring', stiffness: 300, damping: 15 }}
                                        className={`text-5xl ${s <= stars ? 'grayscale-0' : 'grayscale opacity-30'}`}
                                    >
                                        ⭐
                                    </motion.span>
                                ))}
                            </div>

                            {/* Points */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="text-2xl font-bold text-amber-300 font-display"
                            >
                                +{points} points
                            </motion.div>

                            {/* Buttons */}
                            <div className="flex gap-4 mt-2">
                                {onRetry && (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={onRetry}
                                        className="px-6 py-3 rounded-2xl bg-white/10 text-white font-bold font-display hover:bg-white/20"
                                    >
                                        🔄 Try Again
                                    </motion.button>
                                )}
                                {onNext && (
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={onNext}
                                        className="px-6 py-3 rounded-2xl bg-emerald-500 text-white font-bold font-display shadow-lg shadow-emerald-500/40 hover:bg-emerald-400"
                                    >
                                        Next Lesson →
                                    </motion.button>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
