"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { X } from "lucide-react";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowTopRightIcon,
} from "@radix-ui/react-icons";
import {
  categoryLabels,
  inspirationCoverUrl,
  inspirationHostname,
  type InspirationItem,
} from "@/lib/inspirations";
import {
  playClickSound,
  playNavigateSound,
  playScribbleCloseSound,
} from "@/lib/uiSounds";

type InspirationOverviewPanelProps = {
  open: boolean;
  items: InspirationItem[];
  selected: number;
  onClose: () => void;
  onChange: (index: number) => void;
};

function PanelButton({
  label,
  onClick,
  children,
  sound = "click",
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  sound?: "click" | "navigate" | "close";
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => {
        if (sound === "navigate") playNavigateSound();
        else if (sound === "close") playScribbleCloseSound();
        else playClickSound();
        onClick();
      }}
      className="grid size-8 place-items-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-950 focus:outline-none focus-visible:ring-1 focus-visible:ring-zinc-500 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 cursor-pointer"
    >
      {children}
    </button>
  );
}

export function InspirationOverviewPanel({
  open,
  items,
  selected,
  onClose,
  onChange,
}: InspirationOverviewPanelProps) {
  const reduceMotion = useReducedMotion();
  const [direction, setDirection] = useState(1);
  const normalizedIndex =
    items.length > 0 ? (selected + items.length) % items.length : 0;
  const active = items[normalizedIndex] ?? null;

  const navigate = useCallback(
    (delta: number) => {
      setDirection(delta);
      onChange(normalizedIndex + delta);
    },
    [normalizedIndex, onChange],
  );

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") navigate(-1);
      if (event.key === "ArrowRight") navigate(1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [navigate, onClose, open]);

  return (
    <AnimatePresence>
      {open && active ? (
        <div className="pointer-events-none fixed inset-y-0 right-0 left-[calc(50%+21rem)] z-60 overflow-hidden max-[1100px]:left-auto max-[1100px]:w-[min(430px,100vw)]">
          <motion.aside
            role="complementary"
            aria-label={`${active.name} overview`}
            data-theme-surface
            className="pointer-events-auto h-full overflow-y-auto bg-[#fafafa] text-zinc-950 shadow-[-20px_0_44px_-38px_rgb(0_0_0/30%)] will-change-transform dark:bg-[#18181c] dark:text-zinc-100"
            initial={reduceMotion ? false : { transform: "translateX(-100%)" }}
            animate={{ transform: "translateX(0%)" }}
            exit={
              reduceMotion ? { opacity: 0 } : { transform: "translateX(-100%)" }
            }
            transition={{
              duration: reduceMotion ? 0 : 0.26,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <div className="flex h-16 items-center justify-end gap-1 px-5">
              <PanelButton
                label="Close overview"
                onClick={onClose}
                sound="close"
              >
                <X className="size-4" />
              </PanelButton>
              <PanelButton
                label="Previous inspiration"
                onClick={() => navigate(-1)}
                sound="navigate"
              >
                <ArrowLeftIcon className="size-4" />
              </PanelButton>
              <PanelButton
                label="Next inspiration"
                onClick={() => navigate(1)}
                sound="navigate"
              >
                <ArrowRightIcon className="size-4" />
              </PanelButton>
            </div>

            <div className="relative overflow-hidden bg-zinc-100 aspect-4/3 dark:bg-zinc-900">
              <AnimatePresence initial={false} custom={direction} mode="sync">
                <motion.div
                  key={active.url}
                  custom={direction}
                  className="absolute left-0 right-0 aspect-4/3 will-change-transform"
                  initial={
                    reduceMotion
                      ? false
                      : {
                          transform: `translateX(${direction > 0 ? 100 : -100}%)`,
                        }
                  }
                  animate={{ transform: "translateX(0%)" }}
                  exit={
                    reduceMotion
                      ? { opacity: 0 }
                      : {
                          transform: `translateX(${direction > 0 ? -100 : 100}%)`,
                        }
                  }
                  transition={{
                    duration: reduceMotion ? 0 : 0.24,
                    ease: [0.645, 0.045, 0.355, 1],
                  }}
                >
                  <Image
                    src={inspirationCoverUrl(active)}
                    alt={`${active.name} website preview`}
                    fill
                    sizes="(max-width: 1100px) min(430px, 100vw), calc(50vw - 21rem)"
                    preload
                    unoptimized={/\.gif(?:$|[?#])/i.test(
                      inspirationCoverUrl(active),
                    )}
                    className="size-full object-cover object-top"
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active.url}
                className="px-6 py-7"
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.16 }}
              >
                <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-zinc-400 dark:text-zinc-500">
                  {categoryLabels[active.category]}
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-[-0.025em]">
                  {active.name}
                </h2>
                <p className="mt-4 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                  {active.about || active.blurb}
                </p>

                <dl className="mt-7 text-xs">
                  <div className="grid grid-cols-[76px_1fr] gap-3 py-3">
                    <dt className="text-zinc-400 dark:text-zinc-500">Source</dt>
                    <dd className="truncate text-right">
                      {inspirationHostname(active.url)}
                    </dd>
                  </div>
                  <div className="grid grid-cols-[76px_1fr] gap-3 py-3">
                    <dt className="text-zinc-400 dark:text-zinc-500">Type</dt>
                    <dd className="text-right">{active.kind}</dd>
                  </div>
                  {active.styles.length ? (
                    <div className="grid grid-cols-[76px_1fr] gap-3 py-3">
                      <dt className="text-zinc-400 dark:text-zinc-500">
                        Style
                      </dt>
                      <dd className="text-right leading-5">
                        {active.styles.join(", ")}
                      </dd>
                    </div>
                  ) : null}
                </dl>

                <a
                  href={active.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-7 inline-flex items-center gap-1.5 text-xs font-medium text-zinc-950 transition-colors hover:text-amber-600 dark:text-zinc-100 dark:hover:text-amber-400"
                >
                  Visit site
                  <ArrowTopRightIcon className="size-3.5" />
                </a>
              </motion.div>
            </AnimatePresence>
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
