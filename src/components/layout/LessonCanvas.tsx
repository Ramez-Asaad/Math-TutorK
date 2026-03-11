import React from 'react'
import { ProgressBar } from '../shared/ProgressBar'
import { ScoreDisplay } from '../shared/ScoreDisplay'

interface LessonCanvasProps {
    children: React.ReactNode
    total: number
    attempted: number
    correct: number
    points: number
    streak: number
}

export const LessonCanvas: React.FC<LessonCanvasProps> = ({
    children, total, attempted, correct, points, streak
}) => {
    return (
        <div className="flex flex-col h-full gap-3 p-4">
            {/* Top bar: progress + score */}
            <div className="flex items-center gap-4">
                <div className="flex-1">
                    <ProgressBar total={total} attempted={attempted} correct={correct} />
                </div>
                <ScoreDisplay points={points} streak={streak} />
            </div>
            {/* Lesson content */}
            <div className="flex-1 relative overflow-hidden rounded-2xl">
                {children}
            </div>
        </div>
    )
}
