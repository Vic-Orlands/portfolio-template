'use client'

import { useState, useRef, useCallback } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Search } from 'lucide-react'

/* ============ 1. Text roll-up swap ============ */

const LABELS = ['Deploy', 'Building...', 'Deployed']

export function TextRollSwap() {
  const [index, setIndex] = useState(0)

  return (
    <button
      type="button"
      onClick={() => setIndex((i) => (i + 1) % LABELS.length)}
      className="relative flex h-11 min-w-36 items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground"
    >
      <span className="grid overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={LABELS[index]}
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '-100%', opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="col-start-1 row-start-1 whitespace-nowrap"
          >
            {LABELS[index]}
          </motion.span>
        </AnimatePresence>
      </span>
    </button>
  )
}

/* ============ 3. Character-by-character reveal ============ */

export function CharReveal() {
  const [runKey, setRunKey] = useState(0)
  const text = 'Make the web feel alive.'

  return (
    <div className="flex flex-col items-center gap-8">
      <motion.p
        key={runKey}
        aria-label={text}
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.025 } } }}
        className="text-2xl font-medium text-foreground md:text-3xl"
      >
        {text.split('').map((char, i) => (
          <motion.span
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            aria-hidden="true"
            variants={{
              hidden: { opacity: 0, y: 8, filter: 'blur(4px)' },
              visible: {
                opacity: 1,
                y: 0,
                filter: 'blur(0px)',
                transition: { duration: 0.4, ease: 'easeOut' },
              },
            }}
            className="inline-block whitespace-pre"
          >
            {char}
          </motion.span>
        ))}
      </motion.p>
      <button
        type="button"
        onClick={() => setRunKey((k) => k + 1)}
        className="rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        Replay
      </button>
    </div>
  )
}

/* ============ 8. Disperse / vanish-to-delete text ============ */

type Particle = {
  id: number
  char: string
  x: number
  y: number
  rotate: number
}

export function DisperseInput() {
  const [value, setValue] = useState('')
  const [particles, setParticles] = useState<Particle[]>([])
  const idRef = useRef(0)

  const disperse = useCallback(() => {
    if (!value) return
    const next: Particle[] = value.split('').map((char) => ({
      id: idRef.current++,
      char,
      x: Math.random() * 80 - 40,
      y: Math.random() * -50 - 10,
      rotate: Math.random() * 60 - 30,
    }))
    setParticles(next)
    setValue('')
  }, [value])

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex h-12 w-72 items-center gap-2 rounded-lg border border-border bg-secondary px-4">
        <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <div className="relative flex-1">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (
                e.key === 'Enter' &&
                !e.nativeEvent.isComposing &&
                e.keyCode !== 229
              ) {
                disperse()
              }
            }}
            placeholder="Type, then press Enter"
            aria-label="Search"
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          <div className="pointer-events-none absolute inset-0 flex items-center overflow-visible text-sm text-foreground">
            <AnimatePresence>
              {particles.map((p, i) => (
                <motion.span
                  key={p.id}
                  initial={{ opacity: 1, x: 0, y: 0, scale: 1, filter: 'blur(0px)' }}
                  animate={{
                    opacity: 0,
                    x: p.x,
                    y: p.y,
                    scale: 0.4,
                    rotate: p.rotate,
                    filter: 'blur(2px)',
                  }}
                  transition={{
                    duration: 0.6,
                    delay: i * 0.012,
                    ease: 'easeOut',
                  }}
                  onAnimationComplete={() => {
                    if (i === particles.length - 1) setParticles([])
                  }}
                  className="inline-block whitespace-pre"
                  aria-hidden="true"
                >
                  {p.char}
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Press Enter to scatter the text like sand
      </p>
    </div>
  )
}

/* ============ Number ticker (odometer roll) ============ */

function Digit({ digit }: { digit: string }) {
  return (
    <span className="relative grid h-[1em] overflow-hidden leading-none">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={digit}
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '-100%', opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="col-start-1 row-start-1 tabular-nums"
        >
          {digit}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

export function NumberTicker() {
  const [count, setCount] = useState(1024)
  const digits = String(count).split('')

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-baseline gap-1">
        <div className="flex text-5xl font-semibold text-foreground">
          {digits.map((d, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <Digit key={digits.length - i} digit={d} />
          ))}
        </div>
        <span className="text-sm text-muted-foreground">deploys</span>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setCount((c) => c + Math.floor(Math.random() * 90) + 1)}
          className="rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          +Increment
        </button>
        <button
          type="button"
          onClick={() => setCount(1024)}
          className="rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          Reset
        </button>
      </div>
    </div>
  )
}
