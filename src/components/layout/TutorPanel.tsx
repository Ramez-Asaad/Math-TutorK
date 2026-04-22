import React, { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TutorVoice } from '../shared/TutorVoice'
import { useTutorVoice } from '../../hooks/useTutorVoice'
import { useChildStore } from '../../store/useChildStore'
import type { ChatMessage } from '../../types/visualCommand'

interface TutorPanelProps {
    voice: ReturnType<typeof useTutorVoice>
    chatMessages?: ChatMessage[]
    onSendChat?: (text: string) => void
    agentConnected?: boolean
    sendSttMuted?: (muted: boolean) => void
}

const iconClass = 'w-5 h-5'

function MicOnIcon() {
    return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
            <path d="M12 19v3" />
            <path d="M8 22h8" />
        </svg>
    )
}

function MicOffIcon() {
    return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
            <path d="M12 19v3M8 22h8" />
            <line x1="2" y1="2" x2="22" y2="22" />
        </svg>
    )
}

function SpeakerOnIcon() {
    return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
    )
}

function SpeakerMutedIcon() {
    return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <line x1="22" y1="9" x2="16" y2="15" />
            <line x1="16" y1="9" x2="22" y2="15" />
        </svg>
    )
}

export const TutorPanel: React.FC<TutorPanelProps> = ({
    voice,
    chatMessages = [],
    onSendChat,
    agentConnected = false,
    sendSttMuted,
}) => {
    const { name, avatar } = useChildStore()
    const [input, setInput] = useState('')
    const [sttMuted, setSttMuted] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (agentConnected && sendSttMuted) {
            sendSttMuted(sttMuted)
        }
    }, [agentConnected, sttMuted, sendSttMuted])

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
    }, [chatMessages.length])

    const handleSubmit = () => {
        const text = input.trim()
        if (!text || !onSendChat) return
        onSendChat(text)
        setInput('')
    }

    return (
        <div className="flex flex-col h-full gap-3 p-3">
            {/* Avatar */}
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 18 }}
                className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-gradient-to-br from-violet-600 via-purple-700 to-indigo-800 flex flex-col items-center justify-center shadow-xl shadow-purple-900/50 shrink-0"
            >
                <motion.div
                    animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute inset-0 rounded-2xl ring-4 ring-violet-400/30"
                />
                <motion.div
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="text-6xl drop-shadow-2xl"
                >
                    {avatar}
                </motion.div>
                <div className="absolute bottom-0 left-0 right-0 bg-black/40 backdrop-blur-sm py-1.5 px-3 text-center">
                    <span className="text-white font-bold font-display text-sm tracking-wide">{name}</span>
                </div>
            </motion.div>

            {/* Speech bubble — current message */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="relative bg-white/8 backdrop-blur rounded-xl p-3 border border-white/10 shrink-0"
            >
                <div className="absolute -top-2 left-5 w-3 h-3 rotate-45 bg-white/8 border-l border-t border-white/10" />
                <TutorVoice hook={voice} />
            </motion.div>

            {/* Voice / chat controls */}
            <div className="flex items-center justify-end gap-1.5 shrink-0">
                {sendSttMuted && (
                    <button
                        type="button"
                        onClick={() => setSttMuted((m) => !m)}
                        title={sttMuted ? 'Turn on microphone — send speech to tutor' : 'Stop voice input — ignore microphone (STT off)'}
                        aria-pressed={sttMuted}
                        className={`p-2 rounded-xl border transition-colors ${
                            sttMuted
                                ? 'bg-rose-500/20 border-rose-500/40 text-rose-200'
                                : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                        }`}
                    >
                        {sttMuted ? <MicOffIcon /> : <MicOnIcon />}
                        <span className="sr-only">{sttMuted ? 'Enable voice input' : 'Mute voice input'}</span>
                    </button>
                )}
                <button
                    type="button"
                    onClick={() => voice.setTtsMuted(!voice.ttsMuted)}
                    title={voice.ttsMuted ? 'Unmute tutor voice' : 'Mute tutor voice'}
                    aria-pressed={voice.ttsMuted}
                    className={`p-2 rounded-xl border transition-colors ${
                        voice.ttsMuted
                            ? 'bg-amber-500/20 border-amber-500/40 text-amber-200'
                            : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                >
                    {voice.ttsMuted ? <SpeakerMutedIcon /> : <SpeakerOnIcon />}
                    <span className="sr-only">{voice.ttsMuted ? 'Unmute tutor' : 'Mute tutor'}</span>
                </button>
            </div>

            {/* Chat history */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto space-y-2 min-h-0 scrollbar-thin scrollbar-thumb-white/10"
            >
                {chatMessages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.role === 'student' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[85%] rounded-xl px-3 py-2 text-sm font-display leading-snug ${
                                msg.role === 'student'
                                    ? 'bg-violet-600/30 text-violet-100 border border-violet-500/20'
                                    : 'bg-white/10 text-white/90 border border-white/10'
                            }`}
                        >
                            {msg.text}
                        </div>
                    </div>
                ))}
            </div>

            {/* Chat input */}
            {onSendChat && (
                <div className="flex gap-2 shrink-0">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
                        placeholder="Type to tutor..."
                        className="flex-1 bg-white/8 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/30 font-display outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-colors"
                    />
                    <button
                        onClick={handleSubmit}
                        className="px-3 py-2 bg-violet-600/40 hover:bg-violet-600/60 border border-violet-500/30 rounded-xl text-white/80 font-display font-bold text-sm transition-colors"
                    >
                        Send
                    </button>
                </div>
            )}
        </div>
    )
}
