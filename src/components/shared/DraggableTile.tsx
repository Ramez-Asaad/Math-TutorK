import React from 'react'
import { motion } from 'framer-motion'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

interface DraggableTileProps {
    id: string
    children: React.ReactNode
    data?: Record<string, unknown>
    className?: string
    disabled?: boolean
}

export const DraggableTile: React.FC<DraggableTileProps> = ({
    id, children, data, className = '', disabled = false
}) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id,
        data,
        disabled,
    })

    const style: React.CSSProperties = {
        transform: CSS.Translate.toString(transform),
        zIndex: isDragging ? 1000 : undefined,
    }

    return (
        <motion.div
            ref={setNodeRef}
            style={style}
            animate={isDragging ? { scale: 1.12 } : { scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            {...listeners}
            {...attributes}
            className={`cursor-grab active:cursor-grabbing touch-none select-none ${className}
        ${isDragging ? 'shadow-2xl shadow-violet-500/40 ring-2 ring-violet-400' : ''}`}
        >
            {children}
        </motion.div>
    )
}
