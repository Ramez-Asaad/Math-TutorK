import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { LessonShell } from '../../components/layout/LessonShell'
import { VOICE_CONFIGS } from '../../utils/lessonVoiceConfigs'
import { LessonComplete } from '../../components/shared/LessonComplete'
import { Numpad } from '../../components/shared/Numpad'
import { useScoreStore } from '../../store/useScoreStore'
import { useProgressStore } from '../../store/useProgressStore'
import { SPRING } from '../../utils/animationPresets'
import type { TeachingPlaybook } from '../../types/visualCommand'

/* ─── Symbol legend ──────────────────────────────────────────── */
const SYMBOLS: { glyph: string; value: number; label: string }[] = [
    { glyph: '𓃭', value: 10000, label: 'Finger = 10,000' },
    { glyph: '🪷', value: 1000, label: 'Lotus = 1,000' },
    { glyph: '𓏲', value: 100, label: 'Coil = 100' },
    { glyph: '∩', value: 10, label: 'Arch = 10' },
    { glyph: '|', value: 1, label: 'Stroke = 1' },
]

/* ─── Problem generator ──────────────────────────────────────── */
function numberToGlyphs(n: number): { glyph: string; value: number }[] {
    const result: { glyph: string; value: number }[] = []
    for (const s of SYMBOLS) {
        const count = Math.floor(n / s.value)
        for (let i = 0; i < count; i++) result.push({ glyph: s.glyph, value: s.value })
        n %= s.value
    }
    return result
}

const PROBLEMS = [23, 145, 307, 1200, 2531]

/* ─── Main Component ─────────────────────────────────────────── */
export const Hieroglyphs = () => {
    const navigate = useNavigate()
    const { addCorrect, addWrong, sessionPoints, correctCount, wrongCount, reset } = useScoreStore()
    const { completeLesson, addPoints } = useProgressStore()

    const [probIdx, setProbIdx] = useState(0)
    const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none')
    const [showComplete, setShowComplete] = useState(false)

    const target = PROBLEMS[probIdx]
    const glyphs = useMemo(() => numberToGlyphs(target), [target])

    const handleAnswer = useCallback((value: string) => {
        const ans = parseInt(value, 10)
        if (isNaN(ans)) return
        if (ans === target) {
            addCorrect(20)
            setFeedback('correct')
            setTimeout(() => {
                setFeedback('none')
                const next = probIdx + 1
                if (next >= PROBLEMS.length) {
                    const stars = wrongCount === 0 ? 3 : wrongCount <= 2 ? 2 : 1
                    completeLesson('place-value', 'hieroglyphs', stars, sessionPoints + 20)
                    addPoints(sessionPoints)
                    setShowComplete(true)
                } else {
                    setProbIdx(next)
                }
            }, 900)
        } else {
            addWrong()
            setFeedback('wrong')
            setTimeout(() => setFeedback('none'), 700)
        }
    }, [target, probIdx, wrongCount, sessionPoints, addCorrect, addWrong, completeLesson, addPoints])

    const handleRetry = () => {
        reset(); setProbIdx(0); setShowComplete(false); setFeedback('none')
    }

    const playbooks = useMemo<TeachingPlaybook[]>(() => [
        {
            id: 'hg_decode_symbols',
            description: 'Break the number into parts using the symbol values on the parchment',
            generate: () => [
                {
                    delay: 0,
                    annotations: [
                        { action: 'pulse', element: '[data-hint-region="hg-parchment"]', color: '#fbbf24' },
                        { action: 'label', element: '[data-hint-region="hg-parchment"]', label: 'Glyphs', color: '#fbbf24' },
                    ],
                    speech: 'Each repeated symbol adds its value—read them like place-value chunks.',
                },
                {
                    delay: 1200,
                    annotations: [
                        { action: 'pulse', element: '[data-hint-region="hg-legend"]', color: '#60a5fa' },
                    ],
                    speech: 'Cross-check unfamiliar shapes against the symbol key on the side.',
                },
            ],
        },
        {
            id: 'hg_enter_value',
            description: 'Type the whole number the glyphs represent',
            generate: () => [
                {
                    delay: 0,
                    annotations: [
                        { action: 'circle', element: '[data-hint-region="hg-numpad"]', color: '#34d399' },
                    ],
                    speech: 'Add the parts mentally, then enter the total on the keypad.',
                },
            ],
        },
    ], [])

    const lessonContext = useMemo(() => ({
        type: 'hieroglyphs' as const,
        operands: [target],
    }), [target])

    return (
        <LessonShell
            lessonId="hieroglyphs"
            voiceConfig={VOICE_CONFIGS["hieroglyphs"]}
            feedback={feedback}
            problemIndex={probIdx}
            total={PROBLEMS.length} attempted={correctCount + wrongCount}
            correct={correctCount} accentClass="bg-violet-700"
            subtitle="Decode the Egyptian hieroglyphs!"
            playbooks={playbooks}
            lessonContext={lessonContext}
        >
            <LessonComplete
                show={showComplete}
                stars={wrongCount === 0 ? 3 : wrongCount <= 2 ? 2 : 1}
                points={sessionPoints}
                onRetry={handleRetry}
                onNext={() => navigate('/')}
            />

            <div className="h-full flex gap-4 p-4">
                {/* Parchment area */}
                <div className="flex-1 flex flex-col gap-4">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={probIdx}
                            initial={{ scaleY: 0, opacity: 0 }}
                            animate={{ scaleY: 1, opacity: 1 }}
                            exit={{ scaleY: 0, opacity: 0 }}
                            transition={SPRING}
                            style={{ originY: 0 }}
                            className="flex-1 relative"
                        >
                            <motion.div
                                data-hint-region="hg-parchment"
                                animate={
                                    feedback === 'correct'
                                        ? { borderColor: '#f59e0b', boxShadow: '0 0 40px rgba(245,158,11,0.4)', x: 0 }
                                        : feedback === 'wrong'
                                            ? { x: [0, -8, 8, -6, 6, -4, 4, 0] }
                                            : { borderColor: 'rgba(180,140,80,0.4)', x: 0 }
                                }
                                transition={SPRING}
                                className="h-full rounded-3xl border-2 p-6 flex flex-col items-center justify-center"
                                style={{
                                    background: 'linear-gradient(135deg, #d4a85733, #8b6914aa 120%)',
                                    backdropFilter: 'blur(4px)',
                                }}
                            >
                                <div className="text-amber-200/60 font-display text-sm mb-4">
                                    Decode these symbols
                                </div>

                                {/* Glyph grid */}
                                <div className="flex flex-wrap justify-center gap-3 mb-6">
                                    {glyphs.map((g, i) => (
                                        <motion.span
                                            key={`${probIdx}-${i}`}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: [0, -4, 0] }}
                                            transition={{
                                                opacity: { delay: i * 0.08, duration: 0.3 },
                                                y: { duration: 2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.12 },
                                            }}
                                            className="text-5xl select-none"
                                            style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.5))' }}
                                        >
                                            {g.glyph}
                                        </motion.span>
                                    ))}
                                </div>

                                {/* Feedback badge */}
                                <AnimatePresence>
                                    {feedback === 'correct' && (
                                        <motion.div
                                            initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                                            transition={SPRING}
                                            className="text-emerald-400 font-black font-display text-2xl"
                                        >
                                            ✓ Correct!
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Numpad */}
                    <motion.div
                        data-hint-region="hg-numpad"
                        animate={feedback === 'wrong' ? { x: [0, -8, 8, -6, 6, -4, 4, 0] } : { x: 0 }}
                        transition={SPRING}
                    >
                        <Numpad onAnswer={handleAnswer} maxDigits={5} />
                    </motion.div>
                </div>

                {/* Legend sidebar */}
                <div data-hint-region="hg-legend" className="w-48 flex flex-col gap-2 bg-white/5 rounded-2xl border border-white/10 p-4">
                    <div className="text-white/50 font-display font-bold text-sm text-center mb-2">Symbol Key</div>
                    {SYMBOLS.map((s, i) => (
                        <motion.div
                            key={s.glyph}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ ...SPRING, delay: i * 0.06 }}
                            className="flex items-center gap-3 bg-white/5 rounded-xl px-3 py-2"
                        >
                            <span className="text-2xl">{s.glyph}</span>
                            <div>
                                <div className="text-white font-bold font-display text-sm">{s.value.toLocaleString()}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </LessonShell>
    )
}
