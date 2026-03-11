import React, { useEffect, useState } from 'react'
import { motion, useSpring, useTransform, useMotionValue } from 'framer-motion'

interface AnimatedCounterProps {
    value: number
    color?: string
    fontSize?: string
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
    value,
    color = 'text-white',
    fontSize = 'text-4xl',
}) => {
    const motionValue = useMotionValue(0)
    const spring = useSpring(motionValue, { stiffness: 300, damping: 20 })
    const display = useTransform(spring, (v) => Math.round(v).toString())
    const [scale, setScale] = useState(1)

    useEffect(() => {
        motionValue.set(value)
        setScale(1.3)
        const t = setTimeout(() => setScale(1), 300)
        return () => clearTimeout(t)
    }, [value, motionValue])

    return (
        <motion.span
            animate={{ scale }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            className={`font-bold font-display tabular-nums ${color} ${fontSize}`}
        >
            <motion.span>{display}</motion.span>
        </motion.span>
    )
}
