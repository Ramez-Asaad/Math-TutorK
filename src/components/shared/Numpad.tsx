import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { SPRING } from '../../utils/animationPresets'

interface NumpadProps {
    onAnswer: (value: string) => void
    maxDigits?: number
    mode?: 'number' | 'expression'
}

export const Numpad: React.FC<NumpadProps> = ({ onAnswer, maxDigits = 4 }) => {
    const [display, setDisplay] = useState('')

    const press = (key: string) => {
        if (key === '✓') {
            if (display) { onAnswer(display); setDisplay('') }
            return
        }
        if (key === '⌫') {
            setDisplay((d) => d.slice(0, -1))
            return
        }
        if (display.length >= maxDigits) return
        setDisplay((d) => d + key)
    }

    const keys = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '⌫', '0', '✓']

    return (
        <div className="flex flex-col items-center gap-2 select-none">
            {/* Display */}
            <div className="w-full bg-white/10 backdrop-blur rounded-2xl px-6 py-3 min-h-[52px] flex items-center justify-end">
                <span className="text-3xl font-bold text-white tracking-widest font-display">
                    {display || <span className="text-white/30">_</span>}
                </span>
            </div>
            {/* Buttons */}
            <div className="grid grid-cols-3 gap-2">
                {keys.map((k) => (
                    <motion.button
                        key={k}
                        id={`numpad-${k === '⌫' ? 'backspace' : k === '✓' ? 'confirm' : k}`}
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.9, transition: SPRING }}
                        onClick={() => press(k)}
                        className={`w-14 h-14 rounded-2xl text-xl font-bold font-display transition-colors
              ${k === '✓'
                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/40'
                                : k === '⌫'
                                    ? 'bg-rose-500/80 text-white'
                                    : 'bg-white/15 text-white hover:bg-white/25'
                            }`}
                    >
                        {k}
                    </motion.button>
                ))}
            </div>
        </div>
    )
}
