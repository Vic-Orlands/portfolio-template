"use client";

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Save } from "lucide-react";
import { CheckIcon, ChevronLeftIcon, RocketIcon } from "@radix-ui/react-icons";
import { AnimatePresence, motion } from "motion/react";

export type EditorStatus = "draft" | "published";

interface EditorShellProps {
  backLabel: string;
  onBack: () => void;
  status: EditorStatus;
  saving: boolean;
  message?: string | null;
  error?: string | null;
  onSaveDraft: () => void;
  onPublish: () => void;
  toolbarExtra?: React.ReactNode;
  /** Large document title input */
  title: string;
  onTitleChange: (value: string) => void;
  titlePlaceholder?: string;
  /** Soft subtitle / description under the title */
  description: string;
  onDescriptionChange: (value: string) => void;
  descriptionPlaceholder?: string;
  /** Compact metadata fields (slug, category, date, …) */
  meta: React.ReactNode;
  /**
   * `top` — details above the editor (default for writings).
   * `aside` — sticky details panel.
   * `inline` — details under description, no card border (projects).
   */
  metaPlacement?: "top" | "aside" | "inline";
  /** Optional block above the title (e.g. cover image) */
  hero?: React.ReactNode;
  /** Optional content directly under the title (e.g. tags) */
  belowTitle?: React.ReactNode;
  /** Optional note above the body */
  note?: React.ReactNode;
  /** Main writing surface (markdown) or project body */
  children: React.ReactNode;
  /** When false, hide description (rare) */
  showDescription?: boolean;
}

function AutoGrowTextarea({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const syncHeight = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    // Collapse first so scrollHeight reflects the full content, not the old box.
    el.style.height = "0px";
    const next = Math.min(Math.max(el.scrollHeight, 72), 200);
    el.style.height = `${next}px`;
  }, []);

  useLayoutEffect(() => {
    syncHeight();
    const id = requestAnimationFrame(syncHeight);
    return () => cancelAnimationFrame(id);
  }, [value, syncHeight]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onInput={syncHeight}
      placeholder={placeholder}
      rows={3}
      className={className}
    />
  );
}

export function EditorShell({
  backLabel,
  onBack,
  status,
  saving,
  message,
  error,
  onSaveDraft,
  onPublish,
  toolbarExtra,
  title,
  onTitleChange,
  titlePlaceholder = "Untitled",
  description,
  onDescriptionChange,
  descriptionPlaceholder = "A short description shown in listings…",
  meta,
  metaPlacement = "top",
  hero,
  belowTitle,
  note,
  children,
  showDescription = true,
}: EditorShellProps) {
  const inlineMeta = metaPlacement === "inline";
  const topMeta = metaPlacement === "top";
  const asideMeta = metaPlacement === "aside";
  const [rocketKey, setRocketKey] = useState(0);
  const [visibleMessage, setVisibleMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!message) {
      setVisibleMessage(null);
      return;
    }
    setVisibleMessage(message);
    const timeout = window.setTimeout(() => {
      setVisibleMessage(null);
    }, 2000);
    return () => window.clearTimeout(timeout);
  }, [message]);

  const handlePublish = () => {
    setRocketKey((key) => key + 1);
    onPublish();
  };

  const descriptionField = showDescription ? (
    <div className="mt-3 space-y-1.5">
      <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-zinc-500">
        Description · listings only
      </p>
      <AutoGrowTextarea
        value={description}
        onChange={onDescriptionChange}
        placeholder={descriptionPlaceholder}
        className="w-full min-h-18 max-h-[200px] bg-zinc-900/40 border border-zinc-800/80 rounded-lg px-3 py-2.5 text-sm text-zinc-400 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 resize-none overflow-y-auto leading-relaxed"
      />
    </div>
  ) : null;

  const metaBlock = (
    <div className="space-y-4">
      <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-zinc-500">
        Details
      </p>
      <div
        className={
          inlineMeta || topMeta
            ? "grid grid-cols-1 sm:grid-cols-2 gap-4"
            : "space-y-4"
        }
      >
        {meta}
      </div>
    </div>
  );

  return (
    <div
      className="min-h-screen bg-[#141416] text-zinc-300 flex flex-col"
      data-color-mode="dark"
    >
      <header className="sticky top-0 z-20 overflow-visible border-b border-zinc-800/80 bg-[#141416]/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 overflow-visible">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-500 hover:text-zinc-200 cursor-pointer shrink-0"
            >
              <ChevronLeftIcon className="size-3.5" />
              {backLabel}
            </button>
            <span
              className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                status === "published"
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                  : "border-zinc-700 bg-zinc-800/60 text-zinc-400"
              }`}
            >
              {status}
            </span>
          </div>
          <div className="relative z-30 flex flex-wrap items-center gap-2 overflow-visible">
            {toolbarExtra}
            {visibleMessage && (
              <p className="inline-flex items-center gap-1 text-xs font-mono text-green-500/90">
                <CheckIcon className="w-3 h-3" />
                {visibleMessage} Published
              </p>
            )}
            <button
              type="button"
              disabled={saving}
              onClick={onSaveDraft}
              className="inline-flex items-center gap-1.5 text-xs border border-zinc-700 rounded-lg px-3 py-2 cursor-pointer hover:border-zinc-500 hover:bg-zinc-900/50 disabled:opacity-50 transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              Save draft
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={handlePublish}
              className={`relative z-30 inline-flex items-center text-xs bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold rounded-lg px-3 pl-4 py-2 overflow-visible transition-colors ${
                saving ? "cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              {/* Invisible longer label locks button width (tabular-nums style). */}
              <span
                className="invisible inline-flex items-center gap-1.5 pointer-events-none"
                aria-hidden
              >
                Saving
                <span className="h-4 w-4 shrink-0" />
              </span>
              <span className="absolute inset-0 flex items-center justify-end gap-1.5 px-3 overflow-visible">
                {saving ? "Saving" : "Publish"}
                <span
                  className="relative inline-flex h-4 w-4 shrink-0 overflow-visible"
                  style={{ perspective: 160 }}
                >
                  <AnimatePresence initial={false}>
                    <motion.span
                      key={rocketKey}
                      className="absolute left-0 top-0 z-50 inline-flex pointer-events-none will-change-transform"
                      style={{ transformStyle: "preserve-3d" }}
                      initial={
                        rocketKey === 0
                          ? false
                          : {
                              // Enter from SW + depth
                              x: -42,
                              y: 38,
                              z: -36,
                              rotate: -28,
                              opacity: 0,
                              scale: 0.7,
                            }
                      }
                      animate={{
                        x: 0,
                        y: 0,
                        z: 0,
                        rotate: 0,
                        opacity: 1,
                        scale: 1,
                      }}
                      exit={{
                        // Leave NE + depth
                        x: 44,
                        y: -40,
                        z: 36,
                        rotate: 28,
                        opacity: 0,
                        scale: 0.7,
                      }}
                      transition={{
                        duration: 0.95,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      <RocketIcon className="size-4" />
                    </motion.span>
                  </AnimatePresence>
                </span>
              </span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 lg:py-10 space-y-8">
        {hero && <div className="max-w-4xl">{hero}</div>}
        {error && <p className="text-xs font-mono text-rose-400">{error}</p>}

        <div className="space-y-2 max-w-4xl">
          <input
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder={titlePlaceholder}
            className="w-full bg-transparent text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold tracking-tight text-zinc-50 placeholder:text-zinc-600 focus:outline-none leading-tight text-balance"
          />
          {belowTitle && <div className="pt-2">{belowTitle}</div>}
          {descriptionField}
          {inlineMeta && (
            <div className="pt-6">
              <div>{metaBlock}</div>
            </div>
          )}
        </div>

        {topMeta && <div className="max-w-4xl">{metaBlock}</div>}

        {note && <div className="max-w-4xl">{note}</div>}

        {asideMeta ? (
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_280px] gap-8 xl:gap-10 items-start">
            <div className="min-w-0">{children}</div>
            <aside className="xl:sticky xl:top-20 space-y-5">
              <div>{metaBlock}</div>
            </aside>
          </div>
        ) : (
          <div className="min-w-0 max-w-4xl">{children}</div>
        )}
      </div>
    </div>
  );
}

export function MetaField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="flex items-baseline justify-between gap-2">
        <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
          {label}
        </span>
        {hint && (
          <span className="text-[10px] font-mono text-zinc-600">{hint}</span>
        )}
      </span>
      {children}
    </label>
  );
}

export const metaInputClass =
  "w-full rounded-md bg-[#0e0e10] border border-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/70 focus:ring-1 focus:ring-amber-500/20 transition-colors";

const selectChevron = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23a1a1aa' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`;

export const metaSelectClass = `${metaInputClass} appearance-none cursor-pointer pr-9 bg-no-repeat bg-[length:12px_12px] bg-[right_12px_center]`;

export function MetaSelect({
  className = metaSelectClass,
  style,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={className}
      style={{
        backgroundColor: "#0e0e10",
        backgroundImage: selectChevron,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 12px center",
        backgroundSize: "12px 12px",
        ...style,
      }}
    >
      {children}
    </select>
  );
}

export function EditorLoading({
  label = "Loading editor…",
}: {
  label?: string;
}) {
  return (
    <div className="min-h-screen bg-[#141416] text-zinc-500 flex items-center justify-center font-mono text-sm">
      {label}
    </div>
  );
}

/** Fallback height prop for MDEditor; CSS in MarkdownPane owns the real height. */
export const MARKDOWN_EDITOR_HEIGHT = 900;

export function MarkdownPane({
  children,
  label = "Body",
}: {
  children: React.ReactNode;
  label?: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-zinc-500">
          {label}
        </p>
        <p className="text-[10px] font-mono text-zinc-600">
          Raw markdown · use toolbar to toggle preview
        </p>
      </div>
      <div className="admin-md-editor rounded-xl overflow-hidden border border-zinc-800/90 shadow-[0_0_0_1px_rgba(0,0,0,0.35)]">
        {children}
      </div>
      <style>{`
        .admin-md-editor .w-md-editor {
          --md-editor-font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
          background: #0e0e10 !important;
          box-shadow: none !important;
          border: none !important;
          display: flex !important;
          flex-direction: column !important;
          height: calc(100vh - 8rem) !important;
          min-height: calc(100vh - 8rem) !important;
        }
        .admin-md-editor .w-md-editor-toolbar {
          background: #18181c !important;
          border-bottom: 1px solid rgba(63, 63, 70, 0.8) !important;
          padding: 6px 8px !important;
          flex: 0 0 auto !important;
        }
        .admin-md-editor .w-md-editor-content {
          background: #0e0e10 !important;
          flex: 1 1 auto !important;
          min-height: 0 !important;
          height: auto !important;
          display: flex !important;
        }
        .admin-md-editor .w-md-editor-input,
        .admin-md-editor .w-md-editor-text-container,
        .admin-md-editor .w-md-editor-text,
        .admin-md-editor .w-md-editor-preview,
        .admin-md-editor .w-md-editor-preview-wrapper {
          flex: 1 1 auto !important;
          height: 100% !important;
          min-height: 100% !important;
        }
        /* Keep textarea + overlay metrics identical to prevent cursor drift */
        .admin-md-editor .w-md-editor-text,
        .admin-md-editor .w-md-editor-text-pre,
        .admin-md-editor .w-md-editor-text-pre > code,
        .admin-md-editor .w-md-editor-text-input {
          font-family: var(--md-editor-font-family) !important;
          font-size: 14px !important;
          font-weight: 400 !important;
          line-height: 1.6 !important;
          letter-spacing: normal !important;
          word-spacing: normal !important;
          tab-size: 2 !important;
          white-space: pre-wrap !important;
          word-break: break-word !important;
          overflow-wrap: anywhere !important;
        }
        .admin-md-editor .w-md-editor-text {
          line-height: unset !important;
        }
        .admin-md-editor .w-md-editor-text-pre .title,
        .admin-md-editor .w-md-editor-text-pre .token {
          font-size: inherit !important;
          font-weight: inherit !important;
          line-height: inherit !important;
          letter-spacing: inherit !important;
          font-family: inherit !important;
        }
        .admin-md-editor .w-md-editor-text-input {
          color: #e4e4e7 !important;
          caret-color: #fafafa !important;
          min-height: 100% !important;
          height: 100% !important;
        }
        .admin-md-editor .wmde-markdown {
          background: #0e0e10 !important;
          color: #d4d4d8 !important;
          font-size: 14px !important;
          line-height: 1.6 !important;
          min-height: 100% !important;
        }
      `}</style>
    </div>
  );
}
