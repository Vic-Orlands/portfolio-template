"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowTopRightIcon,
} from "@radix-ui/react-icons";
import {
  categoryLabels,
  filterInspirationItems,
  inspirationCategories,
  inspirationCoverUrl,
  inspirationFaviconUrl,
  inspirationHostname,
  type InspirationCategory,
  type InspirationItem,
} from "@/lib/inspirations";
import { runViewTransition } from "@/lib/viewTransition";
import { playClickSound } from "@/lib/uiSounds";

type InspirationModalProps = {
  open: boolean;
  items: InspirationItem[];
  activeUrl: string | null;
  onClose: () => void;
  onSelect: (url: string) => void;
};

function MetaRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[88px_1fr] gap-3 border-t border-zinc-200/80 py-2.5 text-[12px] first:border-t-0">
      <dt className="text-zinc-400">{label}</dt>
      <dd className="text-zinc-800 min-w-0">{children}</dd>
    </div>
  );
}

export function InspirationBookmarkModal({
  open,
  items,
  activeUrl,
  onClose,
  onSelect,
}: InspirationModalProps) {
  const titleId = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState<InspirationCategory | "all">("all");
  const [direction, setDirection] = useState(0);
  const [coverFailed, setCoverFailed] = useState(false);

  const filtered = useMemo(() => {
    return filterInspirationItems(items, { category: tab });
  }, [items, tab]);

  const activeIndex = useMemo(() => {
    if (!activeUrl) return 0;
    const idx = filtered.findIndex((item) => item.url === activeUrl);
    return idx >= 0 ? idx : 0;
  }, [activeUrl, filtered]);

  const active: InspirationItem | null = filtered[activeIndex] ?? null;

  useEffect(() => {
    if (!open || !activeUrl) return;
    const match = items.find((item) => item.url === activeUrl);
    if (match && tab !== "all") setTab(match.category);
  }, [open, activeUrl, items, tab]);

  useEffect(() => {
    setCoverFailed(false);
  }, [active?.url]);

  // Keep selection inside the filtered list when tabs change.
  useEffect(() => {
    if (!open || !activeUrl) return;
    if (filtered.some((item) => item.url === activeUrl)) return;
    if (filtered[0]) onSelect(filtered[0].url);
  }, [filtered, activeUrl, open, onSelect]);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open || !activeUrl || !listRef.current) return;
    const el = listRef.current.querySelector<HTMLElement>(
      `[data-url="${CSS.escape(activeUrl)}"]`,
    );
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [open, activeUrl, filtered]);

  const selectWithTransition = useCallback(
    (url: string, dir: number) => {
      setDirection(dir);
      runViewTransition(() => onSelect(url));
    },
    [onSelect],
  );

  const go = useCallback(
    (delta: number) => {
      if (filtered.length === 0) return;
      const next = (activeIndex + delta + filtered.length) % filtered.length;
      const item = filtered[next];
      if (!item) return;
      selectWithTransition(item.url, delta);
    },
    [activeIndex, filtered, selectWithTransition],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        go(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, go]);

  const changeTab = (next: InspirationCategory | "all") => {
    runViewTransition(() => {
      setTab(next);
      const pool = filterInspirationItems(items, { category: next });
      if (pool[0]) onSelect(pool[0].url);
    });
  };

  const vtName: CSSProperties = { viewTransitionName: "insp-name" };
  const vtAbout: CSSProperties = { viewTransitionName: "insp-about" };
  const vtMeta: CSSProperties = { viewTransitionName: "insp-meta" };
  const vtCover: CSSProperties = { viewTransitionName: "insp-cover" };

  return (
    <AnimatePresence>
      {open && active && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-stretch justify-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          <button
            type="button"
            aria-label="Close inspirations"
            className="absolute inset-0 bg-zinc-950/45 backdrop-blur-[2px] cursor-pointer border-0"
            onClick={() => {
              playClickSound();
              onClose();
            }}
          />

          <motion.div
            className="relative z-10 flex h-[100dvh] w-full max-w-[1400px] flex-col overflow-hidden bg-[#f4f4f5] text-zinc-900 shadow-2xl sm:my-3 sm:h-[calc(100dvh-1.5rem)] sm:rounded-xl sm:border sm:border-zinc-200/80"
            initial={{ y: "8%", opacity: 0.85 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "6%", opacity: 0 }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header + pill tabs */}
            <div className="shrink-0 border-b border-zinc-200/80 bg-white px-4 pt-4 pb-3 sm:px-6">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <h2
                      id={titleId}
                      className="text-[1.35rem] sm:text-[1.6rem] font-semibold tracking-tight text-zinc-950"
                    >
                      Inspirations
                    </h2>
                    <p className="text-[12px] sm:text-[13px] text-zinc-400">
                      Bookmarks for craft, tools, and taste
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      onClose();
                    }}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 cursor-pointer transition-colors"
                    aria-label="Close"
                  >
                    <X className="h-3.5 w-3.5" strokeWidth={2.25} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      go(-1);
                    }}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 cursor-pointer transition-colors"
                    aria-label="Previous"
                  >
                    <ArrowLeftIcon className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      go(1);
                    }}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 cursor-pointer transition-colors"
                    aria-label="Next"
                  >
                    <ArrowRightIcon className="size-3.5" />
                  </button>
                </div>
              </div>

              <div
                className="flex flex-wrap gap-1.5"
                role="tablist"
                aria-label="Categories"
              >
                {inspirationCategories.map((cat) => {
                  const activeTab = tab === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      role="tab"
                      aria-selected={activeTab}
                      onClick={() => changeTab(cat.id)}
                      className={`rounded-full px-3 py-1.5 text-[12px] font-medium tracking-[-0.01em] transition-colors cursor-pointer ${
                        activeTab
                          ? "bg-zinc-900 text-white"
                          : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200/80 hover:text-zinc-900"
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Two panes */}
            <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(260px,34%)_minmax(0,1fr)]">
              {/* List pane */}
              <div className="flex min-h-0 flex-col border-b border-zinc-200/80 bg-white lg:border-b-0 lg:border-r">
                <div className="shrink-0 px-4 pt-4 pb-2 sm:px-5">
                  <p className="text-[12px] text-zinc-400">
                    {tab === "all" ? "All" : categoryLabels[tab]}
                  </p>
                  <p
                    className="text-[1.35rem] font-semibold tracking-tight text-zinc-950"
                    style={vtName}
                  >
                    {active.name}
                  </p>
                </div>

                <div
                  ref={listRef}
                  className="min-h-0 flex-1 overflow-y-auto no-scrollbar px-2 pb-4"
                >
                  {filtered.map((item) => {
                    const selected = item.url === active.url;
                    return (
                      <button
                        key={item.url}
                        type="button"
                        data-url={item.url}
                        onClick={() => {
                          const from = filtered.findIndex(
                            (i) => i.url === active.url,
                          );
                          const to = filtered.findIndex(
                            (i) => i.url === item.url,
                          );
                          selectWithTransition(item.url, to >= from ? 1 : -1);
                        }}
                        className={`group flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors cursor-pointer ${
                          selected ? "bg-zinc-100" : "hover:bg-zinc-50"
                        }`}
                      >
                        <span
                          className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                            selected ? "bg-zinc-900" : "bg-transparent"
                          }`}
                        />
                        <span className="min-w-0 flex-1">
                          <span
                            className={`block text-[13px] font-medium tracking-tight ${
                              selected
                                ? "text-zinc-950"
                                : "text-zinc-700 group-hover:text-zinc-950"
                            }`}
                          >
                            {item.name}
                          </span>
                          <span className="mt-0.5 block text-[11px] text-zinc-400 truncate">
                            {item.blurb}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Detail / overview pane */}
              <div className="relative min-h-0 overflow-hidden bg-[#ececee]">
                <AnimatePresence mode="wait" custom={direction} initial={false}>
                  <motion.div
                    key={active.url}
                    custom={direction}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    variants={{
                      enter: (dir: number) => ({
                        x: dir >= 0 ? 48 : -48,
                        opacity: 0,
                      }),
                      center: { x: 0, opacity: 1 },
                      exit: (dir: number) => ({
                        x: dir >= 0 ? -36 : 36,
                        opacity: 0,
                      }),
                    }}
                    transition={{
                      duration: 0.38,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="absolute inset-0 overflow-y-auto no-scrollbar"
                  >
                    <div className="flex min-h-full flex-col lg:flex-row">
                      {/* Overview column */}
                      <div className="flex w-full shrink-0 flex-col bg-white px-5 py-5 sm:px-6 lg:w-[300px] xl:w-[340px] lg:border-r border-zinc-200/80">
                        <p className="text-[12px] text-zinc-400">
                          {categoryLabels[active.category]}
                        </p>
                        <h3
                          className="mt-1 text-[1.75rem] font-semibold tracking-tight text-zinc-950 leading-none"
                          style={vtName}
                        >
                          {active.name}
                        </h3>
                        <p
                          className="mt-4 text-[13px] leading-relaxed text-zinc-600"
                          style={vtAbout}
                        >
                          {active.about}
                        </p>

                        <dl className="mt-6" style={vtMeta}>
                          <MetaRow label="Source">
                            <a
                              href={active.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-zinc-900 hover:text-amber-600 transition-colors"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={inspirationFaviconUrl(active.url)}
                                alt=""
                                width={14}
                                height={14}
                                className="rounded-[2px]"
                              />
                              {inspirationHostname(active.url)}
                              <ArrowTopRightIcon className="size-3" />
                            </a>
                          </MetaRow>
                          <MetaRow label="Category">
                            {categoryLabels[active.category]}
                          </MetaRow>
                          <MetaRow label="Type">{active.kind}</MetaRow>
                          <MetaRow label="Style">
                            <span className="leading-relaxed">
                              {active.styles.join(", ")}
                            </span>
                          </MetaRow>
                          {active.tags && active.tags.length > 0 && (
                            <MetaRow label="Tags">
                              <span className="leading-relaxed">
                                {active.tags.join(", ")}
                              </span>
                            </MetaRow>
                          )}
                        </dl>

                        <a
                          href={active.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-zinc-950 px-4 py-2 text-[12px] font-medium text-white hover:bg-zinc-800 transition-colors"
                        >
                          Visit site
                          <ArrowTopRightIcon className="size-3.5" />
                        </a>
                      </div>

                      {/* Cover / preview */}
                      <div className="relative min-h-[280px] flex-1 p-4 sm:p-5 lg:min-h-0">
                        <div
                          className="relative h-full min-h-[260px] overflow-hidden rounded-lg border border-zinc-200/80 bg-white shadow-[0_12px_40px_-24px_rgba(0,0,0,0.35)]"
                          style={vtCover}
                        >
                          {!coverFailed ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={inspirationCoverUrl(active)}
                              alt={`Preview of ${active.name}`}
                              className="h-full w-full object-cover object-top"
                              onError={() => setCoverFailed(true)}
                            />
                          ) : (
                            <div className="flex h-full min-h-[260px] flex-col justify-between bg-zinc-950 p-6 text-white">
                              <div className="flex items-center gap-2">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={inspirationFaviconUrl(active.url)}
                                  alt=""
                                  width={20}
                                  height={20}
                                  className="rounded"
                                />
                                <span className="text-[12px] text-zinc-400">
                                  {inspirationHostname(active.url)}
                                </span>
                              </div>
                              <div>
                                <p className="text-3xl font-semibold tracking-tight">
                                  {active.name}
                                </p>
                                <p className="mt-2 max-w-sm text-[13px] text-zinc-400 leading-relaxed">
                                  {active.blurb}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
