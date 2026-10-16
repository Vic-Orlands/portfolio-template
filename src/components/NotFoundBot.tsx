"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

export function NotFoundBot() {
  const [isHovered, setIsHovered] = useState(false);
  const [showThoughtBubble, setShowThoughtBubble] = useState(false);
  const [eyeOffset, setEyeOffset] = useState({ x: 0, y: 0 });
  const botRef = useRef<SVGSVGElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;

    const handleMouseMove = (event: MouseEvent) => {
      if (!botRef.current) return;
      const rect = botRef.current.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      const distance = Math.sqrt(dx * dx + dy * dy) || 1;
      const maxOffset = 6;

      setEyeOffset({
        x: (dx / distance) * Math.min(maxOffset, distance * 0.08),
        y: (dy / distance) * Math.min(maxOffset, distance * 0.08),
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [reduceMotion]);

  const isSmiling = isHovered || showThoughtBubble;
  const leftArmPath = isHovered
    ? "M 100 155 Q 72 135 60 115"
    : "M 100 155 Q 72 170 68 195";
  const leftHandAnimate = isHovered
    ? { x: 60, y: 115, rotate: reduceMotion ? -10 : [10, -25, 10] }
    : { x: 68, y: 195, rotate: -15 };
  const leftHandTransition =
    isHovered && !reduceMotion
      ? {
          rotate: {
            repeat: Infinity,
            duration: 0.25,
            ease: "easeInOut" as const,
          },
          x: { type: "spring" as const, stiffness: 350, damping: 25 },
          y: { type: "spring" as const, stiffness: 350, damping: 25 },
        }
      : {
          type: "spring" as const,
          stiffness: 250,
          damping: 22,
          duration: reduceMotion ? 0 : undefined,
        };

  const glove = (raised: boolean) => (
    <g transform="scale(0.68)">
      <ellipse
        cx="0"
        cy={raised ? 12 : -12}
        rx="14"
        ry="6"
        fill="#fff"
        stroke="#000"
        strokeWidth="8"
      />
      <path
        d={
          raised
            ? "M -12 8 Q -15 -14 0 -14 Q 15 -14 12 8 Z"
            : "M -12 -8 Q -15 14 0 14 Q 15 14 12 -8 Z"
        }
        fill="#fff"
        stroke="#000"
        strokeWidth="8"
      />
      <path
        d={raised ? "M -10 -2 Q -18 -6 -13 4" : "M -10 2 Q -18 6 -13 -4"}
        fill="#fff"
        stroke="#000"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={
          raised
            ? "M -8 -12 Q -8 -26 0 -26 Q 8 -26 4 -12"
            : "M -8 12 Q -8 26 0 26 Q 8 26 4 12"
        }
        fill="#fff"
        stroke="#000"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={
          raised
            ? "M -1 -12 Q 4 -29 11 -29 Q 18 -29 11 -12"
            : "M -1 12 Q 4 29 11 29 Q 18 29 11 12"
        }
        fill="#fff"
        stroke="#000"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={
          raised
            ? "M 6 -10 Q 13 -25 19 -23 Q 25 -21 13 -8"
            : "M 6 10 Q 13 25 19 23 Q 25 21 13 8"
        }
        fill="#fff"
        stroke="#000"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="-4"
        y1={raised ? -4 : 4}
        x2="-2"
        y2={raised ? 4 : -4}
        stroke="#000"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      <line
        x1="1"
        y1={raised ? -6 : 6}
        x2="2"
        y2={raised ? 4 : -4}
        stroke="#000"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      <line
        x1="6"
        y1={raised ? -4 : 4}
        x2="5"
        y2={raised ? 4 : -4}
        stroke="#000"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
    </g>
  );

  return (
    <div className="fixed bottom-5 left-[40px] z-20 flex h-[190px] w-[190px] select-none items-end justify-center max-[700px]:left-5 max-[700px]:h-[145px] max-[700px]:w-[145px]">
      <AnimatePresence>
        {showThoughtBubble && (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, scale: 0.88, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { type: "spring", stiffness: 400, damping: 25 }
            }
            className="absolute top-[-110px] left-[80px] z-30 w-[220px] rounded-xl border-[3px] border-black bg-white p-3 text-center text-black shadow-[5px_5px_0_#000] max-[700px]:top-[-112px] max-[700px]:left-[50%]"
          >
            <p className="text-sm font-black leading-snug">
              You wandered off again?!
            </p>
            <p className="mt-1 text-[11px] font-semibold text-neutral-600">
              I can show you the way back home.
            </p>
            <Link
              href="/"
              className="mt-2 inline-block rounded-md bg-black px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white transition-colors hover:bg-neutral-800"
            >
              Go home →
            </Link>
            <div className="absolute bottom-[-18px] left-7 flex flex-col items-center gap-0.5">
              <div className="h-3 w-3 rounded-full border-[3px] border-black bg-white" />
              <div className="h-1.5 w-1.5 rounded-full border-2 border-black bg-white" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        whileTap={reduceMotion ? undefined : { scale: 0.9 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setShowThoughtBubble((current) => !current)}
        className="relative h-full w-full cursor-pointer rounded-2xl border-0 bg-transparent p-0 focus:outline-none focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-[#ff2f6e]"
        aria-label={
          showThoughtBubble ? "Hide bot message" : "Ask the bot for help"
        }
        aria-expanded={showThoughtBubble}
      >
        <svg
          ref={botRef}
          viewBox="0 0 320 320"
          className="h-full w-full"
          aria-hidden="true"
        >
          <path
            d="M 100 240 L 100 120 A 60 60 0 0 1 220 120 L 220 240 Q 200 255 180 240 Q 160 225 140 240 Q 120 255 100 240 Z"
            fill="#e5e7eb"
            transform="translate(12, 10)"
          />
          <path
            d="M 100 240 L 100 120 A 60 60 0 0 1 220 120 L 220 240 Q 200 255 180 240 Q 160 225 140 240 Q 120 255 100 240 Z"
            fill="#fff"
            stroke="#000"
            strokeWidth="8"
            strokeLinejoin="round"
          />

          <ellipse
            cx="135"
            cy="115"
            rx="14"
            ry="22"
            fill="#fff"
            stroke="#000"
            strokeWidth="6"
          />
          <ellipse
            cx={135 + eyeOffset.x}
            cy={115 + eyeOffset.y}
            rx="8"
            ry="13"
            fill="#000"
          />
          <circle
            cx={135 + eyeOffset.x - 2}
            cy={115 + eyeOffset.y - 4}
            r="2.5"
            fill="#fff"
          />
          <ellipse
            cx="185"
            cy="115"
            rx="14"
            ry="22"
            fill="#fff"
            stroke="#000"
            strokeWidth="6"
          />
          <ellipse
            cx={185 + eyeOffset.x}
            cy={115 + eyeOffset.y}
            rx="8"
            ry="13"
            fill="#000"
          />
          <circle
            cx={185 + eyeOffset.x - 2}
            cy={115 + eyeOffset.y - 4}
            r="2.5"
            fill="#fff"
          />
          <circle cx="116" cy="138" r="6" fill="#ffa0a0" opacity="0.6" />
          <circle cx="204" cy="138" r="6" fill="#ffa0a0" opacity="0.6" />

          {isSmiling ? (
            <g>
              <path
                d="M 146 135 Q 160 156 174 135 Z"
                fill="#000"
                stroke="#000"
                strokeWidth="2"
              />
              <path
                d="M 152 145 Q 160 155 168 145 Q 160 141 152 145"
                fill="#ff7a7a"
              />
            </g>
          ) : (
            <path
              d="M 150 138 Q 160 145 170 138"
              fill="none"
              stroke="#000"
              strokeWidth="6"
              strokeLinecap="round"
            />
          )}

          <motion.path
            animate={{ d: leftArmPath }}
            transition={{
              type: "spring",
              stiffness: 250,
              damping: 22,
              duration: reduceMotion ? 0 : undefined,
            }}
            fill="none"
            stroke="#000"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <motion.g animate={leftHandAnimate} transition={leftHandTransition}>
            {glove(isHovered)}
          </motion.g>

          <path
            d="M 220 155 Q 248 170 252 195"
            fill="none"
            stroke="#000"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <g transform="translate(252, 195) rotate(15)">{glove(false)}</g>

          <path
            d="M 130 240 Q 120 270 135 292"
            fill="none"
            stroke="#000"
            strokeWidth="8"
          />
          <g transform="translate(122, 282) rotate(-5)">
            <ellipse
              cx="18"
              cy="10"
              rx="18"
              ry="11"
              fill="#fff"
              stroke="#000"
              strokeWidth="6"
            />
            <path
              d="M 5 5 C 5 -3, 31 -3, 31 10"
              fill="#fff"
              stroke="#000"
              strokeWidth="6"
            />
          </g>
          <path
            d="M 180 240 Q 190 270 175 292"
            fill="none"
            stroke="#000"
            strokeWidth="8"
          />
          <g transform="translate(152, 282) rotate(5)">
            <ellipse
              cx="18"
              cy="10"
              rx="18"
              ry="11"
              fill="#fff"
              stroke="#000"
              strokeWidth="6"
            />
            <path
              d="M 5 5 C 5 -3, 31 -3, 31 10"
              fill="#fff"
              stroke="#000"
              strokeWidth="6"
            />
          </g>
        </svg>
      </motion.button>
    </div>
  );
}
