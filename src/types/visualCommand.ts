/* ── Visual command protocol ─────────────────────────────────
   Sent from the agent server → frontend over WebSocket.
   The LessonShell applies these to the canvas in real-time. */

export type AnnotationAction = 'highlight' | 'circle' | 'pulse' | 'label' | 'animate_arrow'

export interface Annotation {
  action: AnnotationAction
  element: string            // CSS selector or element ID on the canvas
  color?: string
  label?: string
  /** For animate_arrow: target element to draw the arrow toward */
  toElement?: string
}

export interface VisualCommand {
  type: 'annotate' | 'swap' | 'teach'
  /** For swap: the view component key to switch to */
  target?: string
  /** For annotate: list of overlay annotations to apply */
  actions?: Annotation[]
  /** For teach: the playbook strategy ID to trigger on the lesson */
  strategy?: string
  /** Optional TTS message the tutor should speak alongside the visual change */
  speech?: string
}

/* ── Teaching playbook types ─────────────────────────────────
   Lessons register playbooks so the agent can trigger targeted,
   sequential annotation sequences with full lesson-state awareness. */

export interface AnnotationStep {
  /** Delay in ms before this step is applied (0 for immediate) */
  delay: number
  annotations: Annotation[]
  speech?: string
}

export interface TeachingPlaybook {
  id: string
  /** Human-readable description (sent to agent so it knows what this does) */
  description: string
  /** Called at trigger time — returns steps based on current lesson state */
  generate: () => AnnotationStep[]
}

export interface LessonContext {
  /** Category tag for the lesson type */
  type: string
  operands?: number[]
  answer?: number
  itemCount?: number
  currentStep?: number
  totalSteps?: number
  /** Playbook IDs the lesson supports — derived automatically from registered playbooks */
  availableStrategies: string[]
  [key: string]: unknown
}

/* ── Server → Frontend message types ────────────────────────
   Beyond VisualCommand, the server also sends these: */

export interface SttResultMessage {
  type: 'stt_result'
  text: string
}

export interface TutorReplyMessage {
  type: 'tutor_reply'
  text: string
}

export interface BargeInMessage {
  type: 'barge_in'
}

export type ServerMessage = VisualCommand | SttResultMessage | TutorReplyMessage | BargeInMessage

/* ── Frontend → Server message types ───────────────────────── */

export interface UserChatMessage {
  type: 'user_chat'
  text: string
}

export interface SetChildMessage {
  type: 'set_child'
  name: string
}

/** When muted, the agent server drops mic phrases (no STT / LLM from voice). */
export interface SetSttMutedMessage {
  type: 'set_stt_muted'
  muted: boolean
}

/* ── Chat UI types ─────────────────────────────────────────── */

export interface ChatMessage {
  id: string
  role: 'tutor' | 'student'
  text: string
  timestamp: number
}

/* ── Telemetry snapshot ──────────────────────────────────────
   Sent from the frontend → agent server over WebSocket. */

export interface TelemetrySnapshot {
  timestamp: number
  lessonId: string
  problemIndex: number
  /** Milliseconds since the student last interacted (click, key, mouse) */
  idleMs: number
  /** Whether the browser tab is currently focused */
  tabFocused: boolean
  /** Number of mouse-move events in the last reporting window */
  mouseMoveCount: number
  /** Number of keystrokes in the last reporting window */
  keystrokeCount: number
  /** Number of times the student deleted/changed their answer this problem */
  answerDeletions: number
  /** Rolling accuracy over the last N attempts (0–1) */
  accuracy: number
  /** Current streak of correct answers */
  streak: number
  /** Current difficulty level 1–5 */
  difficultyLevel: number
  /** Total correct this session */
  correctCount: number
  /** Total wrong this session */
  wrongCount: number
  /** Rich lesson context for smarter agent decisions */
  lessonContext?: Omit<LessonContext, 'availableStrategies'> & { availableStrategies?: string[] }
}
