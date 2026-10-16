"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ChevronRightIcon } from "@radix-ui/react-icons";
import { AnimatePresence, motion } from "motion/react";
import {
  playClickSound,
  playScribbleCloseSound,
  playScribbleOpenSound,
} from "@/lib/uiSounds";
import type { Work } from "@/data";
import { WorkMediaPreview } from "@/components/WorkMediaPreview";
import { ScribbleModal } from "@/components/portfolio/ScribblesPageClient";

type WorksSectionProps = {
  works: Work[];
  isLoading?: boolean;
};

const stackPositions = [
  { left: "19%", top: "20%", rotation: 0, scale: 1 },
  { left: "12%", top: "11%", rotation: -5, scale: 0.95 },
  { left: "27%", top: "10%", rotation: 5, scale: 0.95 },
  { left: "9%", top: "33%", rotation: -3, scale: 0.91 },
  { left: "31%", top: "33%", rotation: 3, scale: 0.91 },
] as const;

function ScribbleStack({
  works,
  onOpen,
}: {
  works: Work[];
  onOpen: (work: Work, trigger: HTMLButtonElement) => void;
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activeWork = works[activeIndex ?? 0];

  return (
    <div className="min-w-0">
      <div
        className="relative isolate aspect-[10/7]"
        onMouseLeave={() => setActiveIndex(null)}
      >
        {works.map((work, index) => {
          const position = stackPositions[index]!;
          const isActive = activeIndex === index;

          return (
            <button
              type="button"
              key={work.id}
              aria-label={`Open ${work.title} scribble`}
              title={work.title}
              onClick={(event) => onOpen(work, event.currentTarget)}
              onMouseEnter={() => setActiveIndex(index)}
              onFocus={() => setActiveIndex(index)}
              onBlur={() => setActiveIndex(null)}
              className="absolute block w-[62%] overflow-hidden rounded-2xl border border-white/20 bg-zinc-900 shadow-[0_12px_28px_rgba(0,0,0,0.45)] transition-transform duration-200 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 motion-reduce:transition-none"
              style={{
                left: position.left,
                top: position.top,
                zIndex: isActive ? 10 : works.length - index,
                transform: `rotate(${isActive ? 0 : position.rotation}deg) scale(${isActive ? 1.03 : position.scale})`,
              }}
            >
              <motion.span
                layoutId={`scribble-media-${work.id}`}
                className="block aspect-4/3 overflow-hidden"
              >
                <WorkMediaPreview work={work} />
              </motion.span>
            </button>
          );
        })}
      </div>
      <h3 className="mt-5 truncate text-sm text-center font-medium text-zinc-950 dark:text-zinc-100">
        {activeWork?.title}
      </h3>
    </div>
  );
}

function WorksSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2" aria-hidden="true">
      {[0, 1].map((index) => (
        <div key={index} className="animate-pulse motion-reduce:animate-none">
          <div className="relative aspect-[10/7]">
            {[0, 1, 2].map((card) => (
              <div
                key={card}
                className="absolute aspect-[4/3] w-[62%] rounded-2xl bg-zinc-200 dark:bg-zinc-800"
                style={{
                  left: stackPositions[card].left,
                  top: stackPositions[card].top,
                  transform: `rotate(${stackPositions[card].rotation}deg) scale(${stackPositions[card].scale})`,
                }}
              />
            ))}
          </div>
          <div className="mt-3 h-4 w-32 rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
      ))}
    </div>
  );
}

export function WorksSection({ works, isLoading = false }: WorksSectionProps) {
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [originSlug, setOriginSlug] = useState<string | null>(null);
  const [navDirection, setNavDirection] = useState(0);

  if (!isLoading && works.length === 0) return null;

  const visibleWorks = works.slice(0, 10);
  const firstStackSize = Math.ceil(visibleWorks.length / 2);
  const stacks = [
    visibleWorks.slice(0, firstStackSize),
    visibleWorks.slice(firstStackSize),
  ].filter((stack) => stack.length > 0);
  const selectedIndex = selectedSlug
    ? visibleWorks.findIndex((work) => work.id === selectedSlug)
    : -1;
  const selectedWork = visibleWorks[selectedIndex] ?? null;

  const openWork = (work: Work, trigger: HTMLButtonElement) => {
    playScribbleOpenSound();
    returnFocusRef.current = trigger;
    setOriginSlug(work.id);
    setNavDirection(0);
    setSelectedSlug(work.id);
  };

  const closeWork = () => {
    playScribbleCloseSound();
    setSelectedSlug(null);
    setNavDirection(0);
  };

  const navigateWork = (offset: number) => {
    if (selectedIndex < 0 || visibleWorks.length === 0) return;
    const nextIndex =
      (selectedIndex + offset + visibleWorks.length) % visibleWorks.length;
    setNavDirection(offset);
    setSelectedSlug(visibleWorks[nextIndex]?.id ?? null);
  };

  return (
    <>
      <section id="section-works" className="mb-12 md:mb-16">
        <div className="mb-3 flex items-baseline justify-between gap-4">
          <h2 className="text-base font-instrument italic text-zinc-950 dark:text-zinc-50">
            Scribbles and Designs
          </h2>
          <Link
            href="/scribbles"
            onClick={playClickSound}
            transitionTypes={["nav-forward"]}
            className="inline-flex items-center gap-1 text-xs text-zinc-500 transition-colors hover:text-amber-600 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-600 dark:hover:text-amber-400"
          >
            All scribbles
            <ChevronRightIcon className="size-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <WorksSkeleton />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {stacks.map((stack) => (
              <ScribbleStack
                key={stack[0].id}
                works={stack}
                onOpen={openWork}
              />
            ))}
          </div>
        )}
      </section>

      <AnimatePresence>
        {selectedWork && originSlug ? (
          <ScribbleModal
            work={selectedWork}
            total={visibleWorks.length}
            originSlug={originSlug}
            navDirection={navDirection}
            onClose={closeWork}
            onNavigate={navigateWork}
            returnFocusRef={returnFocusRef}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}
