import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTutorVoice } from '../../hooks/useTutorVoice'
import { SPRING } from '../../utils/animationPresets'

interface TutorVoiceProps {
    hook: ReturnType<typeof useTutorVoice>
    className?: string
}

export const TutorVoice: React.FC<TutorVoiceProps> = ({ hook, className = '' }) => {
    const { message, isTyping, isSpeaking, showHintButton, acceptHint, dismissHint } = hook

    return (
        <div className={`flex flex-col gap-3 ${className}`}>
            {/* Message text with cursor */}
            <motion.div
                key={message}
                initial={{ opacity: 0.6 }}
                animate={{ opacity: 1 }}
                className="font-display text-lg font-semibold text-white leading-snug min-h-[2.5em]"
            >
                {/* Speaking indicator */}
                <AnimatePresence>
                    {isSpeaking && (
                        <motion.span
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0 }}
                            className="inline-flex items-center gap-0.5 mr-2 align-middle"
                        >
                            {[0, 1, 2].map(i => (
                                <motion.span
                                    key={i}
                                    animate={{ scaleY: [1, 2.5, 1] }}
                                    transition={{
                                        duration: 0.5,
                                        repeat: Infinity,
                                        delay: i * 0.15,
                                        ease: 'easeInOut',
                                    }}
                                    className="inline-block w-0.5 h-3 bg-violet-400 rounded-full origin-bottom"
                                />
                            ))}
                        </motion.span>
                    )}
                </AnimatePresence>

                {message}

                {isTyping && (
                    <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ repeat: Infinity, duration: 0.5 }}
                        className="inline-block w-0.5 h-4 bg-white ml-0.5 align-middle"
                    />
                )}
            </motion.div>

            {/* Hint button */}
            <AnimatePresence>
                {showHintButton && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.9 }}
                        transition={SPRING}
                        className="flex gap-2"
                    >
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={acceptHint}
                            className="flex items-center gap-1.5 px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 rounded-xl text-amber-300 font-display font-bold text-sm transition-colors"
                        >
                            💡 Yes, give me a hint!
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={dismissHint}
                            className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/40 font-display text-sm transition-colors"
                        >
                            No thanks
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
