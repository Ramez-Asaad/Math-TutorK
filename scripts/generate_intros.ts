import fs from 'fs'
import path from 'path'
import { VOICE_CONFIGS } from '../src/utils/lessonVoiceConfigs'

const TTS_URL = 'http://localhost:8000/tts'
const VOICE = 'azelma'
const OUTPUT_DIR = path.join(process.cwd(), 'public/audio/intros')

async function generateIntros() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  const entries = Object.entries(VOICE_CONFIGS)
  console.log(`Generating intros for ${entries.length} lessons...`)

  for (const [lessonId, config] of entries) {
    if (!config.instruction) continue

    const outputPath = path.join(OUTPUT_DIR, `${lessonId}.wav`)
    if (fs.existsSync(outputPath)) {
      console.log(`[SKIP] ${lessonId}.wav already exists.`)
      continue
    }

    console.log(`[GENERATE] ${lessonId}...`)
    try {
      const formData = new FormData()
      formData.append('text', config.instruction)
      formData.append('voice', VOICE)

      const response = await fetch(TTS_URL, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`)
      }

      const buffer = await response.arrayBuffer()
      fs.writeFileSync(outputPath, Buffer.from(buffer))
      console.log(`  -> Saved ${outputPath}`)
    } catch (err: any) {
      console.error(`  -> ERROR for ${lessonId}: ${err.message}`)
    }
  }

  console.log('Done!')
}

generateIntros().catch(console.error)
