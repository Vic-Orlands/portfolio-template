"use client";

import { useEffect, useState } from "react";
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

type InspirationModalProps = {
  open: boolean;
  items: InspirationItem[];
  selected: number;
  originUrl: string | null;
  onClose: () => void;
  onChange: (index: number) => void;
};

export function inspirationCardLayoutId(url: string) {
  return `inspiration-card-${encodeURIComponent(url)}`;
}

function PanelIconButton({
  onClick,
  label,
  children,
  sound = "click",
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
  sound?: "click" | "navigate" | "close";
}) {
  return (
    <button
      type="button"
      onClick={() => {
        if (sound === "navigate") playNavigateSound();
        else if (sound === "close") playScribbleCloseSound();
        else playClickSound();
        onClick();
      }}
      aria-label={label}
      className="grid size-[34px] place-items-center rounded-full border-0 bg-zinc-100 text-zinc-400 cursor-pointer transition-colors duration-150 hover:bg-zinc-200 hover:text-zinc-900 focus:outline-none focus-visible:outline-1 focus-visible:outline-zinc-500 focus-visible:outline-offset-2 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-50"
    >
      {children}
    </button>
  );
}

function MetaRow({
  label,
  children,
  stacked = false,
}: {
  label: string;
  children: React.ReactNode;
  stacked?: boolean;
}) {
  return (
    <div
      className={`grid min-h-[34px] grid-cols-[88px_1fr] gap-2.5 border-t border-zinc-200 text-[13px] dark:border-zinc-700 ${
        stacked ? "items-start py-2" : "items-center"
      }`}
    >
      <dt className="text-zinc-400 dark:text-zinc-500">{label}</dt>
      <dd
        className={`m-0 min-w-0 overflow-hidden text-right ${
          stacked ? "" : "text-ellipsis whitespace-nowrap"
        }`}
      >
        {children}
      </dd>
    </div>
  );
}

export function InspirationModal({
  open,
  items,
  selected,
  originUrl,
  onClose,
  onChange,
}: InspirationModalProps) {
  const [direction, setDirection] = useState(1);
  const reduceMotion = useReducedMotion();
  const normalizedIndex =
    items.length > 0 ? (selected + items.length) % items.length : 0;
  const active = items[normalizedIndex] ?? null;

  useEffect(() => {
    if (!open || items.length === 0) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") {
        setDirection(-1);
        onChange(normalizedIndex - 1);
      }
      if (event.key === "ArrowRight") {
        setDirection(1);
        onChange(normalizedIndex + 1);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKey);
    };
  }, [items.length, normalizedIndex, onChange, onClose, open]);

  const navigate = (delta: number) => {
    setDirection(delta);
    onChange(normalizedIndex + delta);
  };

  return (
    <AnimatePresence>
      {open && active && originUrl && (
        <>
          <motion.aside
            data-theme-surface
            className="fixed inset-y-0 left-[328px] z-70 w-[330px] overflow-y-auto border-x border-zinc-200 bg-white text-zinc-800 shadow-[12px_0_32px_rgb(0_0_0/4%)] will-change-[transform,opacity] dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-200 dark:shadow-[12px_0_32px_rgb(0_0_0/22%)] max-[1050px]:left-[230px] max-[1050px]:w-[310px] max-md:inset-x-0 max-md:top-[113px] max-md:bottom-auto max-md:h-[43dvh] max-md:w-full max-md:border-0 max-md:border-b max-md:border-zinc-200 dark:max-md:border-zinc-700"
            role="dialog"
            aria-modal="true"
            aria-label="Website inspiration details"
            initial={
              reduceMotion
                ? false
                : { transform: "translateX(-100%)", opacity: 0 }
            }
            animate={{ transform: "translateX(0)", opacity: 1 }}
            exit={
              reduceMotion
                ? { opacity: 0 }
                : { transform: "translateX(-100%)", opacity: 0 }
            }
            transition={{
              duration: reduceMotion ? 0 : 0.3,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <div className="flex h-[75px] items-center justify-between px-5 max-md:h-14">
              <PanelIconButton
                onClick={onClose}
                label="Close details"
                sound="close"
              >
                <X className="size-[15px]" />
              </PanelIconButton>
              <div className="flex gap-1.5">
                <PanelIconButton
                  onClick={() => navigate(-1)}
                  label="Previous inspiration"
                  sound="navigate"
                >
                  <ArrowLeftIcon className="size-[15px]" />
                </PanelIconButton>
                <PanelIconButton
                  onClick={() => navigate(1)}
                  label="Next inspiration"
                  sound="navigate"
                >
                  <ArrowRightIcon className="size-[15px]" />
                </PanelIconButton>
              </div>
            </div>

            <div className="px-5 pb-10 pt-[15px] max-md:pt-0">
              <span className="text-[15px] text-zinc-400 dark:text-zinc-500">
                Websites
              </span>
              <AnimatePresence mode="wait" initial={false}>
                <motion.h2
                  key={active.url}
                  className="mb-[17px] mt-[3px] min-h-7 origin-left text-[17px] font-semibold tracking-[-0.02em] will-change-[transform,opacity,filter]"
                  initial={
                    reduceMotion
                      ? false
                      : {
                          opacity: 0,
                          filter: "blur(4px)",
                          transform: "scale(0.985)",
                        }
                  }
                  animate={{
                    opacity: 1,
                    filter: "blur(0px)",
                    transform: "scale(1)",
                  }}
                  exit={
                    reduceMotion
                      ? { opacity: 0 }
                      : {
                          opacity: 0,
                          filter: "blur(4px)",
                          transform: "scale(0.985)",
                        }
                  }
                  transition={{
                    duration: reduceMotion ? 0 : 0.18,
                    ease: "easeOut",
                  }}
                >
                  {active.name}
                </motion.h2>
              </AnimatePresence>
              <p className="m-0 min-h-28 text-sm leading-[1.42] max-md:hidden">
                {active.about || active.blurb}
              </p>
              <section className="flex items-center justify-between mt-[14px] mb-2">
                <time className="text-[13px] text-zinc-400 dark:text-zinc-500">
                  2w ago
                </time>
                <a
                  href={active.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[13px] font-medium text-zinc-800 transition-colors hover:text-amber-600 dark:text-zinc-200 dark:hover:text-amber-400"
                >
                  Visit site
                  <ArrowTopRightIcon className="size-3.5" />
                </a>
              </section>
              <dl className="m-0 max-md:hidden">
                <MetaRow label="Source">
                  ◎ {inspirationHostname(active.url)}
                </MetaRow>
                <MetaRow label="Category">
                  {categoryLabels[active.category]}
                </MetaRow>
                <MetaRow label="Style" stacked>
                  <span className="grid gap-1 justify-items-end">
                    {active.styles.map((style) => (
                      <span key={style}>{style}</span>
                    ))}
                  </span>
                </MetaRow>
                <MetaRow label="Type">{active.kind}</MetaRow>
                {active.tags?.length ? (
                  <MetaRow label="Topics" stacked>
                    <span className="grid gap-1 justify-items-end">
                      {active.tags.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </span>
                  </MetaRow>
                ) : null}
              </dl>
            </div>
          </motion.aside>

          <motion.button
            type="button"
            className="fixed inset-y-0 right-0 left-[658px] z-50 border-0 bg-zinc-100/70 backdrop-blur-[7px] cursor-default dark:bg-zinc-950/75 max-[1050px]:left-[540px] max-md:inset-x-0 max-md:top-[56dvh] max-md:bottom-0 max-md:left-0"
            aria-label="Close details"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: reduceMotion ? 0 : 0.3,
              ease: [0.22, 1, 0.36, 1],
            }}
          />

          <div className="pointer-events-none fixed inset-y-0 right-0 left-[658px] z-60 grid place-items-center p-[54px] max-[1050px]:left-[540px] max-[1050px]:p-7 max-md:inset-x-0 max-md:top-[56dvh] max-md:bottom-0 max-md:left-0 max-md:p-[18px]">
            <motion.div
              className="pointer-events-auto relative aspect-341/213 w-[min(850px,88%)] overflow-hidden bg-zinc-900 shadow-[0_24px_54px_rgb(0_0_0/20%)] max-md:w-full"
              layoutId={inspirationCardLayoutId(originUrl)}
              transition={{
                type: "spring",
                duration: reduceMotion ? 0 : 0.52,
                bounce: 0,
              }}
            >
              <AnimatePresence initial={false} custom={direction} mode="sync">
                <motion.div
                  key={active.url}
                  className="absolute inset-0 overflow-hidden will-change-[transform,opacity]"
                  custom={direction}
                  initial={
                    reduceMotion
                      ? false
                      : {
                          transform: `translateX(${direction > 0 ? -100 : 100}%)`,
                        }
                  }
                  animate={{ transform: "translateX(0%)" }}
                  exit={
                    reduceMotion
                      ? { opacity: 0 }
                      : {
                          transform: `translateX(${direction > 0 ? 100 : -100}%)`,
                        }
                  }
                  transition={{
                    duration: reduceMotion ? 0 : 0.32,
                    ease: [0.645, 0.045, 0.355, 1],
                  }}
                >
                  <span className="absolute inset-0 block overflow-hidden bg-zinc-200 dark:bg-zinc-800">
                    <Image
                      src={inspirationCoverUrl(active)}
                      alt={`${active.name} website preview`}
                      fill
                      sizes="(max-width: 768px) 100vw, 330px"
                      preload
                      unoptimized={/\.gif(?:$|[?#])/i.test(
                        inspirationCoverUrl(active),
                      )}
                      draggable={false}
                      className="absolute inset-0 size-full max-w-none object-cover object-top select-none"
                    />
                  </span>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
