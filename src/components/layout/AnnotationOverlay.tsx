import React, { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Annotation } from '../../types/visualCommand'

interface AnnotationOverlayProps {
  annotations: Annotation[]
  /** Auto-clear annotations after this many ms (default 6000) */
  autoHideMs?: number
  onClear?: () => void
}

interface Rect { top: number; left: number; width: number; height: number }

/**
 * Resolve an element's position relative to the container.
 * Falls back to the container itself if the selector doesn't match anything —
 * this ensures annotations always render even on lessons without data-* attrs.
 */
function getRect(selector: string, container: HTMLElement): Rect {
  const el = container.querySelector(selector) ?? document.querySelector(selector)
  const target = el ?? container
  const elRect = target.getBoundingClientRect()
  const cRect = container.getBoundingClientRect()
  return {
    top: elRect.top - cRect.top,
    left: elRect.left - cRect.left,
    width: elRect.width,
    height: elRect.height,
  }
}

/**
 * Renders overlay annotations (highlight, circle, pulse, label, arrow)
 * on top of the lesson canvas.  Positioned absolutely over a parent container.
 */
export const AnnotationOverlay: React.FC<AnnotationOverlayProps> = ({
  annotations,
  autoHideMs = 6000,
  onClear,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [rects, setRects] = useState<Map<number, Rect>>(new Map())
  const [visible, setVisible] = useState(true)

  // Resolve element positions on mount and when annotations change
  useEffect(() => {
    if (!annotations.length) return
    setVisible(true)

    const resolvePositions = () => {
      const parent = containerRef.current?.parentElement
      if (!parent) return
      const map = new Map<number, Rect>()
      annotations.forEach((a, i) => {
        map.set(i, getRect(a.element, parent))
      })
      setRects(map)
    }

    // Small delay to let DOM settle
    const t = setTimeout(resolvePositions, 100)
    return () => clearTimeout(t)
  }, [annotations])

  // Auto-hide timer
  useEffect(() => {
    if (!annotations.length) return
    const t = setTimeout(() => {
      setVisible(false)
      onClear?.()
    }, autoHideMs)
    return () => clearTimeout(t)
  }, [annotations, autoHideMs, onClear])

  if (!annotations.length) return null

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 50 }}
    >
      <AnimatePresence>
        {visible && annotations.map((ann, i) => {
          const rect = rects.get(i)
          if (!rect) return null
          const color = ann.color ?? '#facc15'

          switch (ann.action) {
            case 'highlight':
              return (
                <motion.div
                  key={`hl-${i}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.25 }}
                  exit={{ opacity: 0 }}
                  className="absolute rounded-lg"
                  style={{
                    top: rect.top - 4,
                    left: rect.left - 4,
                    width: rect.width + 8,
                    height: rect.height + 8,
                    backgroundColor: color,
                  }}
                />
              )

            case 'circle':
              return (
                <motion.div
                  key={`cr-${i}`}
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.6, opacity: 0 }}
                  className="absolute rounded-full border-[3px]"
                  style={{
                    borderColor: color,
                    top: rect.top - 8,
                    left: rect.left - 8,
                    width: rect.width + 16,
                    height: rect.height + 16,
                  }}
                />
              )

            case 'pulse':
              return (
                <motion.div
                  key={`pulse-${i}`}
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: [0, 0.4, 0],
                    scale: [0.95, 1.05, 0.95],
                  }}
                  transition={{ duration: 1.5, repeat: 3, ease: 'easeInOut' }}
                  exit={{ opacity: 0 }}
                  className="absolute rounded-xl"
                  style={{
                    top: rect.top - 6,
                    left: rect.left - 6,
                    width: rect.width + 12,
                    height: rect.height + 12,
                    backgroundColor: color,
                    boxShadow: `0 0 20px ${color}80`,
                  }}
                />
              )

            case 'label':
              return (
                <motion.div
                  key={`lbl-${i}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute font-display font-bold text-sm px-3 py-1.5 rounded-lg whitespace-nowrap"
                  style={{
                    top: rect.top - 32,
                    left: rect.left + rect.width / 2,
                    transform: 'translateX(-50%)',
                    backgroundColor: color,
                    color: '#0f0f1a',
                  }}
                >
                  {ann.label}
                </motion.div>
              )

            case 'animate_arrow': {
              const toSelector = ann.toElement
              if (!toSelector) return null
              const parent = containerRef.current?.parentElement
              if (!parent) return null
              const toRect = getRect(toSelector, parent)

              const fromX = rect.left + rect.width / 2
              const fromY = rect.top + rect.height / 2
              const toX = toRect.left + toRect.width / 2
              const toY = toRect.top + toRect.height / 2

              return (
                <motion.svg
                  key={`arrow-${i}`}
                  className="absolute top-0 left-0 w-full h-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <defs>
                    <marker
                      id={`arrowhead-${i}`}
                      markerWidth="10" markerHeight="7"
                      refX="9" refY="3.5"
                      orient="auto"
                    >
                      <polygon points="0 0, 10 3.5, 0 7" fill={color} />
                    </marker>
                  </defs>
                  <motion.line
                    x1={fromX} y1={fromY} x2={fromX} y2={fromY}
                    animate={{ x2: toX, y2: toY }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    stroke={color}
                    strokeWidth={3}
                    strokeDasharray="8 4"
                    markerEnd={`url(#arrowhead-${i})`}
                  />
                </motion.svg>
              )
            }

            default:
              return null
          }
        })}
      </AnimatePresence>
    </div>
  )
}
