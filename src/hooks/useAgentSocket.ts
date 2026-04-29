import { useEffect, useRef, useCallback, useState } from 'react'
import { useChildStore } from '../store/useChildStore'
import type {
  TelemetrySnapshot,
  VisualCommand,
  ServerMessage,
} from '../types/visualCommand'

const AGENT_WS_URL = import.meta.env.VITE_AGENT_WS_URL || 'ws://localhost:8001/ws/agent'
const RECONNECT_DELAY = 3_000

interface UseAgentSocketCallbacks {
  onCommand: (cmd: VisualCommand) => void
  onSttResult?: (text: string) => void
  onTutorReply?: (text: string) => void
  onBargeIn?: () => void
}

export function useAgentSocket(callbacks: UseAgentSocketCallbacks) {
  const wsRef = useRef<WebSocket | null>(null)
  const cbRef = useRef(callbacks)
  cbRef.current = callbacks

  const [connected, setConnected] = useState(false)
  const reconnectTimer = useRef<ReturnType<typeof setTimeout>>()
  const { name: childName } = useChildStore()
  const childNameRef = useRef(childName)
  childNameRef.current = childName

  // Track whether the hook is still mounted to prevent reconnects after cleanup
  const mountedRef = useRef(true)

  const connect = useCallback(() => {
    if (!mountedRef.current) return
    if (wsRef.current?.readyState === WebSocket.OPEN ||
      wsRef.current?.readyState === WebSocket.CONNECTING) return

    try {
      const ws = new WebSocket(AGENT_WS_URL)

      ws.onopen = () => {
        if (!mountedRef.current) { ws.close(); return }
        setConnected(true)
        ws.send(JSON.stringify({ type: 'set_child', name: childNameRef.current }))
      }

      ws.onmessage = (evt) => {
        try {
          const msg: ServerMessage = JSON.parse(evt.data)
          switch (msg.type) {
            case 'stt_result':
              cbRef.current.onSttResult?.(msg.text)
              break
            case 'tutor_reply':
              cbRef.current.onTutorReply?.(msg.text)
              break
            case 'barge_in':
              cbRef.current.onBargeIn?.()
              break
            case 'annotate':
            case 'swap':
            case 'teach':
              cbRef.current.onCommand(msg as VisualCommand)
              break
          }
        } catch { /* ignore malformed */ }
      }

      ws.onclose = () => {
        setConnected(false)
        if (wsRef.current === ws) wsRef.current = null
        if (mountedRef.current) {
          reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY)
        }
      }

      ws.onerror = () => {
        ws.close()
      }

      wsRef.current = ws
    } catch {
      if (mountedRef.current) {
        reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY)
      }
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true
    connect()
    return () => {
      mountedRef.current = false
      clearTimeout(reconnectTimer.current)
      if (wsRef.current) {
        wsRef.current.onclose = null  // prevent reconnect from cleanup close
        wsRef.current.close()
        wsRef.current = null
      }
      setConnected(false)
    }
  }, [connect])

  // Re-send child name if it changes while connected
  useEffect(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'set_child', name: childName }))
    }
  }, [childName])

  const sendSnapshot = useCallback((snapshot: TelemetrySnapshot) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(snapshot))
    }
  }, [])

  const sendChat = useCallback((text: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'user_chat', text }))
    }
  }, [])

  const sendSttMuted = useCallback((muted: boolean) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'set_stt_muted', muted }))
    }
  }, [])

  return { sendSnapshot, sendChat, sendSttMuted, connected }
}
