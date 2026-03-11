import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Particle {
    id: number
    x: number
    y: number
    color: string
    size: number
    vx: number
    vy: number
    shape: 'circle' | 'rect' | 'star'
}

const COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6', '#ef4444', '#06b6d4']

interface ConfettiProps {
    active: boolean
    count?: number
}

export const Confetti: React.FC<ConfettiProps> = ({ active, count = 80 }) => {
    const [particles, setParticles] = useState<Particle[]>([])

    useEffect(() => {
        if (!active) return
        const pts: Particle[] = Array.from({ length: count }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: -5,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            size: 6 + Math.random() * 8,
            vx: (Math.random() - 0.5) * 3,
            vy: 3 + Math.random() * 5,
            shape: ['circle', 'rect', 'star'][Math.floor(Math.random() * 3)] as Particle['shape'],
        }))
        setParticles(pts)
        const t = setTimeout(() => setParticles([]), 3000)
        return () => clearTimeout(t)
    }, [active, count])

    return (
        <AnimatePresence>
            {particles.length > 0 && (
                <div className="pointer-events-none fixed inset-0 overflow-hidden z-50">
                    {particles.map((p) => (
                        <motion.div
                            key={p.id}
                            initial={{ x: `${p.x}vw`, y: `-5vh`, opacity: 1, rotate: 0, scale: 1 }}
                            animate={{
                                x: `${p.x + p.vx * 30}vw`,
                                y: `110vh`,
                                opacity: [1, 1, 0],
                                rotate: Math.random() * 720 - 360,
                            }}
                            exit={{ opacity: 0, scale: 0, transition: { duration: 0.3 } }}
                            transition={{
                                duration: 2.5 + Math.random() * 0.5,
                                ease: [0.2, 0.8, 0.4, 1],
                            }}
                            style={{
                                position: 'absolute',
                                width: p.size,
                                height: p.size,
                                background: p.color,
                                borderRadius: p.shape === 'circle' ? '50%' : p.shape === 'rect' ? '2px' : '50%',
                                clipPath: p.shape === 'star'
                                    ? 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%,50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
                                    : undefined,
                            }}
                        />
                    ))}
                </div>
            )}
        </AnimatePresence>
    )
}
