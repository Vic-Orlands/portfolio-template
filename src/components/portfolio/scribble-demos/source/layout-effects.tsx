'use client'

import { useState, useRef, useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  Bell,
  Bookmark,
  Heart,
  Share2,
  X,
  Circle,
  CircleDot,
  CheckCircle2,
  ArrowUp,
  GripVertical,
  Search,
  FileText,
  Settings,
  User,
} from 'lucide-react'

/* ============ 2. Container expand → children stagger in ============ */

const EXPAND_ITEMS = [
  { icon: Bell, label: 'Notifications' },
  { icon: Bookmark, label: 'Bookmarks' },
  { icon: Heart, label: 'Favorites' },
  { icon: Share2, label: 'Share' },
]

export function ContainerExpand() {
  const [open, setOpen] = useState(false)

  return (
    <motion.div
      layout
      transition={{ duration: 0.32, ease: 'easeOut' }}
      className="w-64 overflow-hidden rounded-xl border border-border bg-secondary"
      style={{ borderRadius: 12 }}
    >
      <motion.button
        layout="position"
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-secondary-foreground"
        aria-expanded={open}
      >
        Quick actions
        <motion.span animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.2 }}>
          <X className="size-4 rotate-45 text-muted-foreground" aria-hidden="true" />
        </motion.span>
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.ul
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={{
              visible: {
                height: 'auto',
                transition: { staggerChildren: 0.06, delayChildren: 0.1 },
              },
              hidden: {
                height: 0,
                transition: { staggerChildren: 0.03, staggerDirection: -1 },
              },
            }}
            className="overflow-hidden"
          >
            {EXPAND_ITEMS.map((item) => (
              <motion.li
                key={item.label}
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { type: 'spring', stiffness: 260, damping: 24 },
                  },
                }}
              >
                <button
                  type="button"
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <item.icon className="size-4" aria-hidden="true" />
                  {item.label}
                </button>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ============ 9. Message send → morph into chat bubble ============ */

type Message = { id: number; text: string }

export function MessageMorph() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, text: 'Hey! Try sending a message below.' },
  ])
  const [draft, setDraft] = useState('')
  const idRef = useRef(1)

  const send = () => {
    const text = draft.trim()
    if (!text) return
    setMessages((m) => [...m.slice(-3), { id: idRef.current++, text }])
    setDraft('')
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <div className="flex min-h-48 flex-col justify-end gap-2">
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              layout
              initial={{ opacity: 0, y: 24, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 280, damping: 26 }}
              className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                m.id === 0
                  ? 'self-start rounded-bl-sm bg-secondary text-secondary-foreground'
                  : 'self-end rounded-br-sm bg-primary text-primary-foreground'
              }`}
            >
              {m.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <motion.div
        key={messages.length}
        initial={{ scale: 0.98, opacity: 0.7 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-2"
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229)
              send()
          }}
          placeholder="Message..."
          aria-label="Message"
          className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
        <button
          type="button"
          onClick={send}
          aria-label="Send message"
          className="grid size-7 place-items-center rounded-full bg-primary text-primary-foreground"
        >
          <ArrowUp className="size-4" aria-hidden="true" />
        </button>
      </motion.div>
    </div>
  )
}

/* ============ Shared layout: list → detail ============ */

const ISSUES = [
  {
    id: 'ENG-142',
    title: 'Fix hydration mismatch on dashboard',
    body: 'The dashboard renders differently between server and client because a date is formatted at render time. Move formatting into an effect or pass a stable value from the server.',
  },
  {
    id: 'ENG-143',
    title: 'Slow cold starts on the edge runtime',
    body: 'Bundle size grew past 1MB after the analytics import. Split the vendor chunk and lazy-load the analytics client after first paint.',
  },
  {
    id: 'ENG-144',
    title: 'Keyboard navigation skips the command menu',
    body: 'Focus is trapped in the sidebar when the palette opens. The palette needs a focus trap and to restore focus to the trigger on close.',
  },
]

export function ListToDetail() {
  const [selected, setSelected] = useState<string | null>(null)
  const issue = ISSUES.find((i) => i.id === selected)

  return (
    <div className="relative w-full max-w-md">
      <ul className="flex flex-col gap-2">
        {ISSUES.map((i) => (
          <motion.li key={i.id} layoutId={`issue-${i.id}`} className="rounded-lg">
            <button
              type="button"
              onClick={() => setSelected(i.id)}
              className="flex w-full items-center gap-3 rounded-lg border border-border bg-secondary px-4 py-3 text-left"
            >
              <motion.span
                layoutId={`issue-id-${i.id}`}
                className="font-mono text-xs text-muted-foreground"
              >
                {i.id}
              </motion.span>
              <motion.span
                layoutId={`issue-title-${i.id}`}
                className="flex-1 truncate text-sm text-secondary-foreground"
              >
                {i.title}
              </motion.span>
            </button>
          </motion.li>
        ))}
      </ul>

      <AnimatePresence>
        {issue && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
              className="absolute inset-[-24px] z-10 rounded-xl bg-background/70 backdrop-blur-[2px]"
            />
            <motion.div
              layoutId={`issue-${issue.id}`}
              className="absolute inset-x-0 top-0 z-20 rounded-xl border border-border bg-popover p-5 shadow-2xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <motion.span
                    layoutId={`issue-id-${issue.id}`}
                    className="font-mono text-xs text-muted-foreground"
                  >
                    {issue.id}
                  </motion.span>
                  <motion.h3
                    layoutId={`issue-title-${issue.id}`}
                    className="text-sm font-medium text-popover-foreground"
                  >
                    {issue.title}
                  </motion.h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  aria-label="Close detail"
                  className="rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { delay: 0.15 } }}
                exit={{ opacity: 0, transition: { duration: 0.1 } }}
                className="mt-3 text-sm leading-relaxed text-muted-foreground"
              >
                {issue.body}
              </motion.p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ============ Sliding tab indicator ============ */

const TABS = ['Overview', 'Activity', 'Settings', 'Members']

export function SlidingTabs() {
  const [active, setActive] = useState(0)

  return (
    <div
      className="flex gap-1 rounded-full border border-border bg-secondary p-1"
      role="tablist"
      aria-label="Sections"
    >
      {TABS.map((tab, i) => (
        <button
          key={tab}
          type="button"
          role="tab"
          aria-selected={active === i}
          onClick={() => setActive(i)}
          className={`relative rounded-full px-4 py-1.5 text-sm transition-colors ${
            active === i ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {active === i && (
            <motion.span
              layoutId="tab-pill"
              transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              className="absolute inset-0 rounded-full bg-primary"
            />
          )}
          <span className="relative z-10">{tab}</span>
        </button>
      ))}
    </div>
  )
}

/* ============ Status swap with color morph ============ */

const STATUSES = [
  { key: 'todo', label: 'Todo', icon: Circle, bg: 'oklch(0.35 0 0)', fg: 'oklch(0.85 0 0)' },
  { key: 'progress', label: 'In Progress', icon: CircleDot, bg: 'oklch(0.45 0.15 85)', fg: 'oklch(0.98 0.02 85)' },
  { key: 'done', label: 'Done', icon: CheckCircle2, bg: 'oklch(0.5 0.15 155)', fg: 'oklch(0.98 0.02 155)' },
] as const

export function StatusMorph() {
  const [index, setIndex] = useState(0)
  const status = STATUSES[index]

  return (
    <div className="flex flex-col items-center gap-6">
      <motion.button
        type="button"
        layout
        onClick={() => setIndex((i) => (i + 1) % STATUSES.length)}
        animate={{ backgroundColor: status.bg, color: status.fg }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="flex items-center gap-2 overflow-hidden rounded-full px-4 py-2 text-sm font-medium"
        style={{ borderRadius: 999 }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={status.key}
            initial={{ scale: 0, rotate: -90, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0, rotate: 90, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <status.icon className="size-4" aria-hidden="true" />
          </motion.span>
        </AnimatePresence>
        <motion.span layout="position">{status.label}</motion.span>
      </motion.button>
      <p className="text-xs text-muted-foreground">Click the badge to cycle states</p>
    </div>
  )
}

/* ============ Optimistic reorder (FLIP) ============ */

export function FlipReorder() {
  const [items, setItems] = useState([
    'Design review',
    'Ship auth flow',
    'Fix mobile nav',
    'Write changelog',
    'Update docs',
  ])

  const shuffle = () => {
    setItems((prev) => {
      const next = [...prev]
      for (let i = next.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[next[i], next[j]] = [next[j], next[i]]
      }
      return next
    })
  }

  const moveToTop = (item: string) => {
    setItems((prev) => [item, ...prev.filter((i) => i !== item)])
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <motion.li
            key={item}
            layout
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          >
            <button
              type="button"
              onClick={() => moveToTop(item)}
              className="flex w-full items-center gap-3 rounded-lg border border-border bg-secondary px-4 py-2.5 text-left text-sm text-secondary-foreground"
            >
              <GripVertical className="size-4 text-muted-foreground" aria-hidden="true" />
              {item}
            </button>
          </motion.li>
        ))}
      </ul>
      <div className="flex justify-center gap-2">
        <button
          type="button"
          onClick={shuffle}
          className="rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          Shuffle
        </button>
        <span className="py-1.5 text-xs text-muted-foreground">or click a row to promote it</span>
      </div>
    </div>
  )
}

/* ============ Command palette ============ */

const COMMANDS = [
  { icon: FileText, label: 'Create new document' },
  { icon: Search, label: 'Search all projects' },
  { icon: User, label: 'Invite teammate' },
  { icon: Settings, label: 'Open settings' },
]

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [focused, setFocused] = useState(0)

  useEffect(() => {
    if (!open) return
    const down = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setFocused((f) => (f + 1) % COMMANDS.length)
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setFocused((f) => (f - 1 + COMMANDS.length) % COMMANDS.length)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', down)
    return () => window.removeEventListener('keydown', down)
  }, [open])

  return (
    <div className="relative flex w-full max-w-md flex-col items-center gap-4">
      <button
        type="button"
        onClick={() => {
          setFocused(0)
          setOpen(true)
        }}
        className="flex items-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2 text-sm text-muted-foreground"
      >
        <Search className="size-4" aria-hidden="true" />
        Open command palette
        <kbd className="ml-2 rounded border border-border px-1.5 font-mono text-xs">⌘K</kbd>
      </button>

      <div className="h-72 w-full">
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -4 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="w-full rounded-xl border border-border bg-popover shadow-2xl"
              role="dialog"
              aria-label="Command palette"
            >
              <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                <Search className="size-4 text-muted-foreground" aria-hidden="true" />
                <input
                  autoFocus
                  placeholder="Type a command..."
                  aria-label="Search commands"
                  className="flex-1 bg-transparent text-sm text-popover-foreground outline-none placeholder:text-muted-foreground"
                />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close palette"
                  className="rounded border border-border px-1.5 font-mono text-xs text-muted-foreground"
                >
                  esc
                </button>
              </div>
              <motion.ul
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.04 } } }}
                className="p-2"
              >
                {COMMANDS.map((cmd, i) => (
                  <motion.li
                    key={cmd.label}
                    variants={{
                      hidden: { opacity: 0, y: 6 },
                      visible: { opacity: 1, y: 0 },
                    }}
                  >
                    <button
                      type="button"
                      onMouseEnter={() => setFocused(i)}
                      onClick={() => setOpen(false)}
                      className={`relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm ${
                        focused === i ? 'text-popover-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      {focused === i && (
                        <motion.span
                          layoutId="palette-highlight"
                          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                          className="absolute inset-0 rounded-lg bg-muted"
                        />
                      )}
                      <cmd.icon className="relative z-10 size-4" aria-hidden="true" />
                      <span className="relative z-10">{cmd.label}</span>
                    </button>
                  </motion.li>
                ))}
              </motion.ul>
            </motion.div>
          )}
        </AnimatePresence>
        {!open && (
          <div className="grid h-full place-items-center rounded-xl border border-dashed border-border">
            <p className="text-xs text-muted-foreground">Palette renders here</p>
          </div>
        )}
      </div>
    </div>
  )
}

/* ============ Panel slide + cross-fade ============ */

export function PanelSlide() {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative h-72 w-full max-w-md overflow-hidden rounded-xl border border-border bg-secondary">
      <motion.div
        animate={{
          opacity: open ? 0.35 : 1,
          scale: open ? 0.97 : 1,
          filter: open ? 'blur(1px)' : 'blur(0px)',
        }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="flex h-full flex-col gap-3 p-5"
      >
        <div className="text-sm font-medium text-secondary-foreground">Project overview</div>
        <div className="h-3 w-3/4 rounded bg-muted" />
        <div className="h-3 w-1/2 rounded bg-muted" />
        <div className="h-3 w-2/3 rounded bg-muted" />
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-auto self-start rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
        >
          Open settings panel
        </button>
      </motion.div>

      <AnimatePresence>
        {open && (
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="absolute inset-y-0 right-0 flex w-64 flex-col gap-3 border-l border-border bg-popover p-5 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-popover-foreground">Settings</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close panel"
                className="rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
            <div className="h-3 w-2/3 rounded bg-muted" />
            <div className="h-3 w-1/2 rounded bg-muted" />
            <div className="h-3 w-3/4 rounded bg-muted" />
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  )
}
