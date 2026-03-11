/**
 * TTS Client — calls pocket-tts serve API and plays audio via Web Audio API.
 * Uses the "azelma" female voice for a soft, warm sound.
 * Falls back gracefully to text-only when the TTS server is unreachable.
 */

const TTS_BASE_URL = 'http://localhost:8000'
const TTS_VOICE = 'azelma'

/* ─── Audio cache ────────────────────────────────────────────── */
const audioCache = new Map<string, ArrayBuffer>()

/* ─── Health check ───────────────────────────────────────────── */
let serverAvailable: boolean | null = null
let lastCheck = 0
const CHECK_INTERVAL = 5_000 // re-check every 5s

export async function isTTSAvailable(): Promise<boolean> {
    const now = Date.now()
    if (serverAvailable !== null && now - lastCheck < CHECK_INTERVAL) return serverAvailable
    try {
        const res = await fetch(TTS_BASE_URL, { method: 'GET', signal: AbortSignal.timeout(1500) })
        serverAvailable = res.ok
    } catch {
        serverAvailable = false
    }
    lastCheck = now
    return serverAvailable
}

/* ─── Generate speech ────────────────────────────────────────── */
export async function generateSpeech(text: string): Promise<ArrayBuffer | null> {
    // Check cache first
    if (audioCache.has(text)) return audioCache.get(text)!

    if (!(await isTTSAvailable())) return null

    try {
        const formData = new FormData()
        formData.append('text', text)
        formData.append('voice', TTS_VOICE)

        const res = await fetch(`${TTS_BASE_URL}/tts`, {
            method: 'POST',
            body: formData,
            signal: AbortSignal.timeout(8000),
        })

        if (!res.ok) return null

        const buffer = await res.arrayBuffer()
        audioCache.set(text, buffer)
        return buffer
    } catch {
        return null
    }
}

/* ─── Pre-cache audio (fire-and-forget) ──────────────────────── */
export function preCacheAudio(texts: string[]) {
    for (const text of texts) {
        if (!audioCache.has(text)) {
            generateSpeech(text).catch(() => { /* silent */ })
        }
    }
}

/* ─── Play audio buffer ──────────────────────────────────────── */
let currentSource: AudioBufferSourceNode | null = null
let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext {
    if (!audioCtx) audioCtx = new AudioContext()
    return audioCtx
}

export async function playAudio(buffer: ArrayBuffer): Promise<void> {
    // Stop any currently playing audio
    stopAudio()

    const ctx = getAudioContext()
    if (ctx.state === 'suspended') await ctx.resume()

    const audioBuffer = await ctx.decodeAudioData(buffer.slice(0)) // .slice(0) to copy since decodeAudioData detaches
    const source = ctx.createBufferSource()
    source.buffer = audioBuffer
    source.connect(ctx.destination)
    currentSource = source

    return new Promise<void>((resolve) => {
        source.onended = () => {
            currentSource = null
            resolve()
        }
        source.start()
    })
}

export function stopAudio() {
    if (currentSource) {
        try { currentSource.stop() } catch { /* already stopped */ }
        currentSource = null
    }
}

/* ─── Convenience: generate + play ───────────────────────────── */
export async function speakText(text: string): Promise<boolean> {
    const buffer = await generateSpeech(text)
    if (!buffer) return false
    await playAudio(buffer)
    return true
}
