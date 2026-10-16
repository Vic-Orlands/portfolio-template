'use client'

import { useState, useRef, useEffect } from 'react'
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
} from 'motion/react'
import { Copy, Check, Trash2 } from 'lucide-react'

/* ============ 5. Shimmer hover + click flash ============ */

type Flash = { id: number; x: number; y: number }

export function ShimmerButton() {
  const [flashes, setFlashes] = useState<Flash[]>([])
  const idRef = useRef(0)

  return (
    <button
      type="button"
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const flash = {
          id: idRef.current++,
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        }
        setFlashes((f) => [...f, flash])
      }}
      className="group relative overflow-hidden rounded-lg bg-primary px-8 py-3 text-sm font-medium text-primary-foreground"
    >
      <span className="relative z-10">Get Started</span>
      {/* shimmer band */}
      <motion.span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-[40%] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            'linear-gradient(105deg, transparent, oklch(1 0 0 / 35%), transparent)',
        }}
        animate={{ x: ['-120%', '320%'] }}
        transition={{ duration: 1.6, ease: 'linear', repeat: Infinity }}
      />
      {/* click flashes */}
      <AnimatePresence>
        {flashes.map((f) => (
          <motion.span
            key={f.id}
            aria-hidden="true"
            initial={{ scale: 0, opacity: 0.6 }}
            animate={{ scale: 1.6, opacity: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            onAnimationComplete={() =>
              setFlashes((prev) => prev.filter((p) => p.id !== f.id))
            }
            className="pointer-events-none absolute size-40 rounded-full"
            style={{
              left: f.x - 80,
              top: f.y - 80,
              background:
                'radial-gradient(circle, oklch(1 0 0 / 60%), transparent 70%)',
            }}
          />
        ))}
      </AnimatePresence>
    </button>
  )
}

/* ============ Copy button icon morph ============ */

export function CopyMorphButton() {
  const [copied, setCopied] = useState(false)

  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText('pnpm dlx shadcn@latest init').catch(() => {})
        setCopied(true)
        setTimeout(() => setCopied(false), 1600)
      }}
      className="flex items-center gap-3 rounded-lg border border-border bg-secondary px-4 py-2.5 font-mono text-sm text-secondary-foreground"
    >
      <span>pnpm dlx shadcn@latest init</span>
      <span className="relative grid size-4 place-items-center">
        <AnimatePresence mode="popLayout" initial={false}>
          {copied ? (
            <motion.span
              key="check"
              initial={{ scale: 0.5, opacity: 0, rotate: -45 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.5, opacity: 0, rotate: 45 }}
              transition={{ type: 'spring', stiffness: 400, damping: 22 }}
              className="col-start-1 row-start-1"
            >
              <Check className="size-4 text-green-500" aria-hidden="true" />
              <span className="sr-only">Copied</span>
            </motion.span>
          ) : (
            <motion.span
              key="copy"
              initial={{ scale: 0.5, opacity: 0, rotate: 45 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.5, opacity: 0, rotate: -45 }}
              transition={{ type: 'spring', stiffness: 400, damping: 22 }}
              className="col-start-1 row-start-1"
            >
              <Copy className="size-4 text-muted-foreground" aria-hidden="true" />
              <span className="sr-only">Copy command</span>
            </motion.span>
          )}
        </AnimatePresence>
      </span>
    </button>
  )
}

/* ============ Magnetic button ============ */

export function MagneticButton() {
  const ref = useRef<HTMLButtonElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 200, damping: 18 })
  const springY = useSpring(y, { stiffness: 200, damping: 18 })

  return (
    <motion.button
      ref={ref}
      type="button"
      style={{ x: springX, y: springY }}
      onMouseMove={(e) => {
        const rect = ref.current?.getBoundingClientRect()
        if (!rect) return
        x.set((e.clientX - rect.left - rect.width / 2) * 0.35)
        y.set((e.clientY - rect.top - rect.height / 2) * 0.35)
      }}
      onMouseLeave={() => {
        x.set(0)
        y.set(0)
      }}
      className="rounded-full border border-border bg-secondary px-8 py-3 text-sm font-medium text-secondary-foreground"
    >
      Hover me
    </motion.button>
  )
}

/* ============ Keyboard shortcut micro-feedback ============ */

export function KeycapFeedback() {
  const [pressed, setPressed] = useState(false)
  const [count, setCount] = useState(0)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setPressed(true)
        setCount((c) => c + 1)
        setTimeout(() => setPressed(false), 150)
      }
    }
    window.addEventListener('keydown', down)
    return () => window.removeEventListener('keydown', down)
  }, [])

  return (
    <div className="flex flex-col items-center gap-6">
      <motion.div
        animate={{ scale: pressed ? 0.92 : 1, y: pressed ? 2 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
        className="flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-5 py-3 shadow-[0_3px_0_0] shadow-border"
      >
        <kbd className="font-mono text-lg text-foreground">⌘</kbd>
        <kbd className="font-mono text-lg text-foreground">K</kbd>
      </motion.div>
      <p className="text-xs text-muted-foreground">
        {count > 0
          ? `Fired ${count} time${count === 1 ? '' : 's'} — the keycap depresses without a click`
          : 'Press Cmd+K (or Ctrl+K) — the keycap responds'}
      </p>
    </div>
  )
}

/* ============ 7. Drag to delete ============ */

export function DragToDelete() {
  const [items, setItems] = useState([
    { id: 1, label: 'Weekly report.pdf' },
    { id: 2, label: 'Design specs.fig' },
    { id: 3, label: 'Invoice #2041.pdf' },
  ])

  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <AnimatePresence>
        {items.map((item) => (
          <DragRow
            key={item.id}
            label={item.label}
            onDelete={() => setItems((prev) => prev.filter((i) => i.id !== item.id))}
          />
        ))}
      </AnimatePresence>
      {items.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-6">
          <p className="text-sm text-muted-foreground">All deleted</p>
          <button
            type="button"
            onClick={() =>
              setItems([
                { id: Date.now(), label: 'Weekly report.pdf' },
                { id: Date.now() + 1, label: 'Design specs.fig' },
                { id: Date.now() + 2, label: 'Invoice #2041.pdf' },
              ])
            }
            className="rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Restore items
          </button>
        </div>
      )}
    </div>
  )
}

function DragRow({ label, onDelete }: { label: string; onDelete: () => void }) {
  const x = useMotionValue(0)

  return (
    <motion.div
      layout
      exit={{ height: 0, opacity: 0, marginBottom: 0 }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden rounded-lg"
    >
      <div className="absolute inset-0 flex items-center justify-end rounded-lg bg-destructive/80 pr-4">
        <Trash2 className="size-4 text-white" aria-hidden="true" />
      </div>
      <motion.div
        drag="x"
        dragElastic={0.15}
        dragConstraints={{ left: -140, right: 0 }}
        style={{ x }}
        onDragEnd={(_, info) => {
          if (info.offset.x < -80) onDelete()
        }}
        className="relative flex cursor-grab items-center justify-between rounded-lg border border-border bg-secondary px-4 py-3 active:cursor-grabbing"
      >
        <span className="text-sm text-secondary-foreground">{label}</span>
        <span className="text-xs text-muted-foreground">drag ←</span>
      </motion.div>
    </motion.div>
  )
}
