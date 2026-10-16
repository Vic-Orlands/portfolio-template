"use client";

import {
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion, useSpring } from "motion/react";
import type { Blog, Series, Work } from "@/data";
import { DetailView } from "@/components/DetailView";
import { PortfolioShell } from "@/components/portfolio/PortfolioShell";
import {
  extractContentHeadings,
  type ContentHeading,
} from "@/lib/contentHeadings";
import { playDropSound, playPinSound } from "@/lib/uiSounds";

type ContentArticleProps = {
  item: Blog | Series | Work;
  type: "blog" | "series" | "work";
  allWorks?: Work[];
  relatedBlogs?: Blog[];
  seriesContext?: Series | null;
};

const REST_ANGLE = 22.5;

function BrassPin({
  idPrefix,
  className = "",
}: {
  idPrefix: string;
  className?: string;
}) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 36 36"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <radialGradient id={`${idPrefix}-dark`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#B3862B" />
          <stop offset="85%" stopColor="#5C3B07" />
          <stop offset="100%" stopColor="#2E1C02" />
        </radialGradient>
        <radialGradient id={`${idPrefix}-mid`} cx="45%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#F5C75D" />
          <stop offset="70%" stopColor="#B3862B" />
          <stop offset="100%" stopColor="#5C3B07" />
        </radialGradient>
        <radialGradient id={`${idPrefix}-light`} cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FFF2C2" />
          <stop offset="35%" stopColor="#F5C75D" />
          <stop offset="80%" stopColor="#B3862B" />
          <stop offset="100%" stopColor="#734E11" />
        </radialGradient>
      </defs>
      <circle cx="18" cy="18" r="15" fill={`url(#${idPrefix}-dark)`} />
      <circle cx="18" cy="18" r="12" fill={`url(#${idPrefix}-mid)`} />
      <circle cx="18" cy="18" r="9" fill={`url(#${idPrefix}-light)`} />
      <circle cx="14" cy="14" r="4" fill="#fff" opacity="0.45" />
    </svg>
  );
}

function InteractiveEssaySticker() {
  const reduceMotion = useReducedMotion();
  const rotate = useSpring(reduceMotion ? 0 : REST_ANGLE, {
    stiffness: 45,
    damping: 5.5,
    mass: 1.8,
  });
  const rotateX = useSpring(0, { stiffness: 60, damping: 10 });
  const rotateY = useSpring(0, { stiffness: 60, damping: 10 });
  const [isHovered, setIsHovered] = useState(false);
  const [isPinnedRight, setIsPinnedRight] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const cardContainerRef = useRef<HTMLDivElement>(null);
  const pinnedRightRef = useRef(false);
  const dragStartY = useRef(0);
  const dragStartAngle = useRef(REST_ANGLE);

  const handleMouseMove = (
    event: ReactMouseEvent<HTMLDivElement> | ReactPointerEvent<HTMLDivElement>,
  ) => {
    if (reduceMotion || isDragging || !cardContainerRef.current) return;
    const rect = cardContainerRef.current.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    if (isPinnedRight) {
      rotateX.set(-((mouseY - rect.height / 2) / rect.height) * 4);
      rotateY.set(((mouseX - rect.width / 2) / rect.width) * 4);
      rotate.set(0);
      return;
    }

    const dx = mouseX - 19;
    const force = Math.min(Math.abs(dx) / 500, 1.2);
    rotate.set(REST_ANGLE + (dx / rect.width) * 16 * force);
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (reduceMotion || isPinnedRight) return;
    setIsDragging(true);
    pinnedRightRef.current = false;
    dragStartY.current = event.clientY;
    dragStartAngle.current = rotate.get();
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDragging) {
      handleMouseMove(event);
      return;
    }

    const nextAngle = Math.max(
      -8,
      Math.min(
        45,
        dragStartAngle.current + (event.clientY - dragStartY.current) * 0.15,
      ),
    );
    rotate.set(nextAngle);

    if (nextAngle >= -0.5 && nextAngle <= 0.5 && !pinnedRightRef.current) {
      pinnedRightRef.current = true;
      setIsPinnedRight(true);
      setIsDragging(false);
      playPinSound();
      rotate.set(0);
      rotateX.set(0);
      rotateY.set(0);
    }
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    event.currentTarget.releasePointerCapture(event.pointerId);
    if (!pinnedRightRef.current) rotate.set(REST_ANGLE);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (isDragging || reduceMotion) return;
    rotateX.set(0);
    rotateY.set(0);
    rotate.set(isPinnedRight ? 0 : REST_ANGLE);
  };

  return (
    <aside
      className="fixed right-[max(-48px,calc(50vw-770px))] top-48 z-10 hidden w-70 select-none min-[1360px]:block"
      aria-label="Interactive essay guidance"
    >
      <div className="relative">
        {!isPinnedRight && !reduceMotion && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute -top-24 -right-4 z-40 flex flex-col items-center text-indigo-500"
          >
            <span className="font-instrument -rotate-12 text-base font-semibold italic tracking-wide">
              hang me!
            </span>
            <svg
              width="76"
              height="68"
              viewBox="0 0 120 110"
              fill="none"
              aria-hidden="true"
              className="-scale-x-100 rotate-12"
            >
              <path
                d="M 45,15 C 60,10 75,30 65,48 C 55,62 38,50 48,40 C 62,28 85,55 78,85 M 68,74 L 78,85 L 88,76"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>
        )}

        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-lg bg-black/10 blur-xl"
          style={{
            rotate,
            rotateX: isPinnedRight ? rotateX : 0,
            rotateY: isPinnedRight ? rotateY : 0,
            transformOrigin: "19px 19px",
            x: 8,
            y: 18,
            scale: 0.98,
          }}
        />

        <div
          ref={cardContainerRef}
          className="relative w-full"
          style={{ perspective: 1000 }}
        >
          {!isPinnedRight && !reduceMotion && (
            <div className="pointer-events-none absolute right-[8px] top-[8px] z-0 flex size-[22px] items-center justify-center rounded-full border border-dashed border-zinc-400/80 bg-zinc-300/20 dark:border-zinc-500/80 dark:bg-zinc-800/30">
              <span className="size-1.5 rounded-full bg-zinc-400/50" />
            </div>
          )}

          <motion.div
            role="note"
            className="relative cursor-grab touch-none rounded-lg border border-white/20 bg-[oklch(0.96_0.002_90)] px-5 pb-6 pt-10 text-[oklch(0.22_0_0)] shadow-[0_15px_40px_-15px_rgba(0,0,0,0.15)] active:cursor-grabbing dark:border-white/10 dark:bg-[#2b2b30] dark:text-zinc-200"
            style={{
              rotate,
              rotateX,
              rotateY,
              transformOrigin: "19px 19px",
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onMouseEnter={() => {
              setIsHovered(true);
              if (!reduceMotion && !isPinnedRight && !isDragging) {
                rotate.set(REST_ANGLE - 6);
              }
            }}
            onMouseLeave={handleMouseLeave}
          >
            <span className="pointer-events-none absolute left-[16px] top-[16px] size-1.5 rounded-full bg-black/30 dark:bg-black/50" />
            <span className="pointer-events-none absolute right-[16px] top-[16px] size-1.5 rounded-full bg-black/30 dark:bg-black/50" />
            <p className="font-jakarta text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Interactive essay
            </p>
            <p className="mt-2 text-pretty font-jakarta text-xs font-medium leading-relaxed text-zinc-600 dark:text-zinc-300">
              Highlight any text to leave an inline note or begin a comment.
              Dotted excerpts already contain community scribbles.
            </p>
          </motion.div>

          <div
            className="pointer-events-none absolute left-[8px] top-[8px] z-30 transition-transform duration-300"
            style={{
              transform: isHovered
                ? "scale(1.05) rotate(4deg)"
                : "scale(1) rotate(0deg)",
            }}
          >
            <BrassPin
              idPrefix="essay-pin-left"
              className="drop-shadow-[2px_5px_4px_rgba(0,0,0,0.3)]"
            />
          </div>

          <motion.button
            type="button"
            className="absolute right-[8px] top-[8px] z-30"
            initial={{ x: "100vw" }}
            animate={{ x: isPinnedRight ? -0.5 : "100vw" }}
            transition={{
              type: "spring",
              stiffness: 170,
              damping: 24,
              mass: 0.8,
            }}
            onClick={() => {
              playDropSound();
              pinnedRightRef.current = false;
              setIsPinnedRight(false);
              rotate.set(REST_ANGLE);
              rotateX.set(0);
              rotateY.set(0);
            }}
            aria-label="Release the right pin"
          >
            <BrassPin
              idPrefix="essay-pin-right"
              className="drop-shadow-[2px_5px_4px_rgba(0,0,0,0.3)] transition-transform hover:scale-110 active:scale-95"
            />
          </motion.button>
        </div>
      </div>
    </aside>
  );
}

export function ContentArticle({
  item,
  type,
  allWorks = [],
  relatedBlogs = [],
  seriesContext = null,
}: ContentArticleProps) {
  const router = useRouter();

  const backHref =
    type === "blog" ? "/writings" : type === "series" ? "/series" : "/";

  const outline: ContentHeading[] = useMemo(() => {
    const headings: ContentHeading[] = [
      { id: "article-title", label: item.title, level: 1 },
    ];
    if (type === "series" && "parts" in item && item.parts?.length) {
      headings.push({
        id: "series-parts",
        label: "Parts in this series",
        level: 2,
      });
    }
    headings.push(...extractContentHeadings(item.content ?? ""));
    return headings;
  }, [item, type]);

  return (
    <>
      {(type === "blog" || type === "series") && <InteractiveEssaySticker />}
      <PortfolioShell
        showHomeLink={false}
        showFooter={type !== "blog"}
        sideNavigation={
          type === "blog" || type === "series" ? outline : "default"
        }
      >
        <DetailView
          item={item}
          type={type}
          onBack={() =>
            router.push(backHref, {
              transitionTypes: [type === "blog" ? "writing-back" : "nav-back"],
            })
          }
          onNavigateWork={(work) =>
            router.push(`/works/${work.id}`, {
              transitionTypes: ["nav-forward"],
            })
          }
          allWorks={allWorks}
          relatedBlogs={relatedBlogs}
          seriesContext={seriesContext}
        />
      </PortfolioShell>
    </>
  );
}
