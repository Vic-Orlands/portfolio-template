'use client'

import { useState, useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  Volume2,
  Compass,
  MessageSquare,
  Terminal,
  Code2,
  Music,
  Globe,
  Camera,
  Folder,
} from 'lucide-react'

/* ============ 6. Drag-to-adjust volume slider ============ */

export function VolumeSlider() {
  const [volume, setVolume] = useState(0.45)
  const [active, setActive] = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)
  const releaseTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const updateFromPointer = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect()
    if (!rect) return
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
    setVolume(ratio)
  }

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-6">
      <div className="flex w-full items-center gap-4">
        <AnimatePresence>
          {!active && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
            >
              <Volume2 className="size-5 text-foreground" aria-hidden="true" />
            </motion.span>
          )}
        </AnimatePresence>

        <motion.div
          ref={trackRef}
          role="slider"
          aria-label="Volume"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(volume * 100)}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') setVolume((v) => Math.min(1, v + 0.05))
            if (e.key === 'ArrowLeft') setVolume((v) => Math.max(0, v - 0.05))
          }}
          animate={{ height: active ? 32 : 6 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          onPointerDown={(e) => {
            if (releaseTimer.current) clearTimeout(releaseTimer.current)
            e.currentTarget.setPointerCapture(e.pointerId)
            setActive(true)
            updateFromPointer(e.clientX)
          }}
          onPointerMove={(e) => {
            if (active) updateFromPointer(e.clientX)
          }}
          onPointerUp={() => {
            releaseTimer.current = setTimeout(() => setActive(false), 150)
          }}
          className="relative flex-1 cursor-pointer touch-none overflow-hidden rounded-full bg-secondary"
        >
          <motion.div
            className="absolute inset-y-0 left-0 flex items-center rounded-full bg-foreground"
            animate={{ width: `${volume * 100}%` }}
            transition={
              active
                ? { duration: 0 }
                : { type: 'spring', stiffness: 350, damping: 30 }
            }
          >
            <AnimatePresence>
              {active && volume > 0.12 && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="pl-3"
                >
                  <Volume2 className="size-4 text-background" aria-hidden="true" />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>

        <AnimatePresence>
          {active && (
            <motion.span
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.15 }}
              className="w-9 text-right font-mono text-sm tabular-nums text-foreground"
            >
              {Math.round(volume * 100)}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <p className="text-xs text-muted-foreground">
        Press and drag — the pill expands while adjusting
      </p>
    </div>
  )
}

/* ============ 4. Dock with floating tooltip popup ============ */

const DOCK_APPS = [
  { name: 'Finder', icon: Compass },
  { name: 'Slack', icon: MessageSquare },
  { name: 'Terminal', icon: Terminal },
  { name: 'Visual Studio Code', icon: Code2 },
  { name: 'Music', icon: Music },
  { name: 'Browser', icon: Globe },
  { name: 'Camera', icon: Camera },
  { name: 'Files', icon: Folder },
]

export function DockTooltip() {
  const [hovered, setHovered] = useState<number | null>(null)

  return (
    <div className="flex flex-col items-center gap-10 pt-14">
      <div className="flex items-end gap-1 rounded-2xl border border-white/10 bg-secondary/60 p-2 backdrop-blur-xl">
        {DOCK_APPS.map((app, i) => (
          <div key={app.name} className="relative">
            <AnimatePresence>
              {hovered === i && (
                <motion.div
                  initial={{ scale: 0.75, opacity: 0, y: 12 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.75, opacity: 0, y: 8 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                  style={{ transformOrigin: 'bottom center' }}
                  className="pointer-events-none absolute bottom-[calc(100%+1.25rem)] left-1/2 z-10 -translate-x-1/2"
                  role="tooltip"
                >
                  <div className="relative whitespace-nowrap rounded-full border border-white/15 bg-popover px-4 py-1.5 text-sm text-popover-foreground shadow-lg backdrop-blur-xl">
                    {app.name}
                    <span
                      aria-hidden="true"
                      className="absolute -bottom-[5px] left-1/2 size-2.5 -translate-x-1/2 rotate-45 rounded-[2px] border-b border-r border-white/15 bg-popover"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <motion.button
              type="button"
              aria-label={app.name}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(i)}
              onBlur={() => setHovered(null)}
              whileHover={{ scale: 1.25, y: -8 }}
              whileTap={{ scale: 1.1, y: -4 }}
              transition={{ type: 'spring', stiffness: 350, damping: 20 }}
              className="grid size-12 place-items-center rounded-xl border border-white/10 bg-muted"
            >
              <app.icon className="size-5 text-foreground" aria-hidden="true" />
            </motion.button>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Hover a dock icon — the label pops out of the panel
      </p>
    </div>
  )
}
