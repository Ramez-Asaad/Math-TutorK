/**
 * TTS Client — calls pocket-tts serve API and plays audio via Web Audio API.
 * Uses the "azelma" female voice for a soft, warm sound.
 * Falls back gracefully to text-only when the TTS server is unreachable.
 */

// Proxied through Vite dev server to avoid CORS preflight issues.
// Vite config maps /tts → http://localhost:8000/tts
//                   /tts-health → http://localhost:8000/
const TTS_VOICE = 'azelma'
const TTS_BASE_URL = import.meta.env.VITE_TTS_URL || '/pocket-tts'

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
        const res = await fetch(`${TTS_BASE_URL}/`, { method: 'GET', signal: AbortSignal.timeout(1500) })
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
let unlocked = false

function getAudioContext(): AudioContext {
    if (!audioCtx) audioCtx = new AudioContext()
    return audioCtx
}

// Browsers require a user gesture before AudioContext can play audio.
// Attach a one-time listener on any interaction to unlock the context.
function ensureUnlockListener() {
    if (unlocked) return
    const unlock = () => {
        const ctx = getAudioContext()
        if (ctx.state === 'suspended') {
            ctx.resume()
        }
        // Play a silent buffer to fully unlock on iOS/Safari
        const silent = ctx.createBuffer(1, 1, 22050)
        const src = ctx.createBufferSource()
        src.buffer = silent
        src.connect(ctx.destination)
        src.start()
        unlocked = true
        for (const evt of ['click', 'touchstart', 'keydown', 'mousedown']) {
            document.removeEventListener(evt, unlock, true)
        }
    }
    for (const evt of ['click', 'touchstart', 'keydown', 'mousedown']) {
        document.addEventListener(evt, unlock, { capture: true, once: false, passive: true })
    }
}

// Start listening immediately on module load
ensureUnlockListener()

let currentPlayId = 0

export async function playAudio(buffer: ArrayBuffer): Promise<void> {
    stopAudio()

    currentPlayId++
    const playId = currentPlayId

    const ctx = getAudioContext()
    if (ctx.state === 'suspended') {
        await ctx.resume()
        // If still suspended after resume (no user gesture yet), bail
        if (ctx.state === 'suspended') {
            console.warn('[TTS] AudioContext suspended — waiting for user interaction')
            return
        }
    }

    const audioBuffer = await ctx.decodeAudioData(buffer.slice(0))
    
    // If stopAudio was called, or another playAudio was started while we were decoding, abort!
    if (playId !== currentPlayId) return

    const source = ctx.createBufferSource()
    source.buffer = audioBuffer
    source.connect(ctx.destination)
    currentSource = source

    return new Promise<void>((resolve) => {
        source.onended = () => {
            if (currentSource === source) {
                currentSource = null
            }
            resolve()
        }
        source.start()
    })
}

export function stopAudio() {
    currentPlayId++ // Invalidate any pending decodeAudioData promises
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

/** 
 * Fetches and plays a pre-recorded audio file directly from the local server.
 * Bypasses the TTS generation endpoint entirely.
 */
export async function playPreRecordedSpeech(url: string): Promise<void> {
    try {
        const res = await fetch(url)
        if (!res.ok) throw new Error(`Audio not found at ${url}`)
        const buffer = await res.arrayBuffer()
        await playAudio(buffer)
    } catch (e) {
        console.warn(`[TTS] Failed to play pre-recorded audio: ${e}`)
        throw e
    }
}
