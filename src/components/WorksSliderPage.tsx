import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { ChevronLeftIcon } from "@radix-ui/react-icons";
import { Work } from "../data";
import { isVideoMedia, WorkMediaPreview } from "./WorkMediaPreview";
import { DetailView } from "./DetailView";
import { playClickSound } from "@/lib/uiSounds";

interface WorksSliderPageProps {
  works: Work[];
  onClose: () => void;
  theme: "light" | "dark";
}

const SlantedText: React.FC<{ text: string }> = ({ text }) => {
  if (!text) return null;

  return (
    <span>
      {text
        .split(/(\s+)/)
        .map((part: string, index: number): React.ReactNode => {
          if (/^\s+$/.test(part)) return part;

          return (
            <span key={index}>
              <em className="font-bold pr-1">{part.charAt(0)}</em>
              {part.slice(1)}
            </span>
          );
        })}
    </span>
  );
};

// CurtainReveal splits the previous image exactly in half and parts both ways on mount
const CurtainReveal: React.FC<{ prevSrc: string | null; keyId: number }> = ({
  prevSrc,
  keyId,
}) => {
  if (!prevSrc) return null;

  return (
    <div
      key={keyId}
      className="absolute inset-0 pointer-events-none z-30 overflow-hidden bg-transparent"
    >
      {/* Left Curtain Panel */}
      <motion.div
        initial={{ x: "0%" }}
        animate={{ x: "-100%" }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
        className="absolute left-0 top-0 bottom-0 w-1/2 overflow-hidden border-r border-zinc-950/40"
      >
        <motion.img
          initial={{ x: "0%" }}
          animate={{ x: "50%" }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
          src={prevSrc}
          alt=""
          referrerPolicy="no-referrer"
          className="absolute left-0 top-0 h-full w-[200%] max-w-none object-cover"
          style={{ width: "200%" }}
        />
      </motion.div>

      {/* Right Curtain Panel */}
      <motion.div
        initial={{ x: "0%" }}
        animate={{ x: "100%" }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
        className="absolute right-0 top-0 bottom-0 w-1/2 overflow-hidden border-l border-zinc-950/40"
      >
        <motion.img
          initial={{ x: "0%" }}
          animate={{ x: "-50%" }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
          src={prevSrc}
          alt=""
          referrerPolicy="no-referrer"
          className="absolute right-0 top-0 h-full w-[200%] max-w-none object-cover"
          style={{ width: "200%", left: "-100%" }}
        />
      </motion.div>
    </div>
  );
};

export const WorksSliderPage: React.FC<WorksSliderPageProps> = ({
  works,
  onClose,
  theme,
}) => {
  const [virtualIndex, setVirtualIndex] = useState(0);
  const activeIndex =
    works.length === 0
      ? 0
      : ((virtualIndex % works.length) + works.length) % works.length;
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);

  // Transition and image curtain tracking states
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [prevImage, setPrevImage] = useState<string | null>(null);
  const [lastIndex, setLastIndex] = useState<number>(0);

  // Simple clock tracker for coordinate grids
  const [timeStr, setTimeStr] = useState("00:00:00");
  const scrollLockRef = useRef(false);

  useEffect(() => {
    if (activeIndex !== lastIndex) {
      const prevWork = works[lastIndex];
      if (prevWork) {
        setPrevImage(
          prevWork.mediaUrl &&
            prevWork.mediaType !== "video" &&
            !isVideoMedia(prevWork.mediaUrl)
            ? prevWork.mediaUrl
            : null,
        );
      }
      setLastIndex(activeIndex);
    }
  }, [activeIndex, lastIndex]);

  // Technical coordinate ticks along vertical lines
  const ticksCount = 401;
  const ticksRange = Array.from({ length: ticksCount }, (_, i) => i - 200);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const hrs = String(now.getHours()).padStart(2, "0");
      const mins = String(now.getMinutes()).padStart(2, "0");
      const secs = String(now.getSeconds()).padStart(2, "0");
      setTimeStr(`${hrs}:${mins}:${secs}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleNext = () => {
    if (works.length <= 1) return;
    setDirection("next");
    setVirtualIndex((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (works.length <= 1) return;
    setDirection("prev");
    setVirtualIndex((prev) => prev - 1);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (isDetailOpen || scrollLockRef.current) return;

    if (Math.abs(e.deltaY) > 25) {
      scrollLockRef.current = true;
      if (e.deltaY > 0) {
        handleNext();
      } else {
        handlePrev();
      }
      setTimeout(() => {
        scrollLockRef.current = false;
      }, 750); // cooldown for premium slow pacing
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isDetailOpen) return;
      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "Enter" || e.key === " ") {
        handleOpenDetail();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, isDetailOpen]);

  const handleOpenDetail = () => {
    setSelectedWork(works[activeIndex]);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedWork(null);
  };

  const activeWork = works[activeIndex] || works[0];

  if (!activeWork) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#18181c]/90 text-zinc-400 font-mono text-sm">
        <button
          type="button"
          onClick={onClose}
          className="underline text-amber-400 cursor-pointer"
        >
          No works yet — return
        </button>
      </div>
    );
  }

  // Title Splitting
  const getSplitTitle = (title: string): { left: string; right: string } => {
    const parts = title.split(" ");
    if (parts.length === 1) {
      return { left: parts[0], right: "" };
    }
    const middleIndex = Math.ceil(parts.length / 2);
    return {
      left: parts.slice(0, middleIndex).join(" "),
      right: parts.slice(middleIndex).join(" "),
    };
  };

  const currentSplit = getSplitTitle(activeWork.title);

  // Position swapping based on index parity (interchanging positions)
  const isSwapped = activeIndex % 2 === 1;
  const leftText = isSwapped ? currentSplit.right : currentSplit.left;
  const rightText = isSwapped ? currentSplit.left : currentSplit.right;

  // Next and Previous indexes for stacking
  const prevIndex = (activeIndex - 1 + works.length) % works.length;
  const nextIndex = (activeIndex + 1) % works.length;

  return (
    <div
      className={`fixed inset-0 font-sans overflow-hidden z-50 flex flex-col items-center justify-center transition-colors duration-200 backdrop-blur-md ${
        theme === "dark"
          ? "bg-[#18181c]/75 text-zinc-400"
          : "bg-[#fafafa]/75 text-zinc-950"
      }`}
      id="works-slider-page-container"
      onWheel={handleWheel}
    >
      {/* Inject custom responsive properties */}
      <style>{`
        #works-slider-page-container {
          --card-w: 680px;
          --card-h: 450px;
        }
        @media (max-width: 1024px) {
          #works-slider-page-container {
            --card-w: 420px;
            --card-h: 280px;
          }
        }
        @media (max-width: 768px) {
          #works-slider-page-container {
            --card-w: 300px;
            --card-h: 185px;
          }
        }
      `}</style>

      {/* Floating minimalist close button */}
      <button
        onClick={onClose}
        className={`absolute top-6 right-6 z-40 p-3 rounded-full border transition-all cursor-pointer shadow-xl group ${
          theme === "dark"
            ? "border-zinc-800 bg-[#18181c]/80 hover:bg-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
            : "border-zinc-200 bg-white/80 hover:bg-zinc-100 text-zinc-600 hover:text-black hover:border-zinc-350"
        }`}
        title="back to home"
        id="float-close-slider-btn"
      >
        <X className="w-7 h-7 group-hover:rotate-90 transition-transform duration-300" />
      </button>

      <AnimatePresence mode="wait">
        {isDetailOpen && selectedWork ? (
          <motion.div
            key="work-detail-mode"
            initial={{ y: "100vh", opacity: 0.4 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100vh", opacity: 0.4 }}
            transition={{ type: "spring", stiffness: 85, damping: 18, mass: 1 }}
            className={`absolute inset-0 z-50 overflow-y-auto ${
              theme === "dark" ? "bg-[#18181c]" : "bg-[#fafafa]"
            }`}
          >
            {/* Custom Detail view wrapper */}
            <div className="max-w-4xl mx-auto px-6 py-12">
              <button
                onClick={() => {
                  playClickSound();
                  onClose();
                }}
                className={`group inline-flex items-center gap-2 text-xs font-mono tracking-wider transition-colors focus:outline-none mb-10 cursor-pointer ${
                  theme === "dark"
                    ? "text-zinc-400 hover:text-amber-500"
                    : "text-zinc-600 hover:text-amber-600"
                }`}
                id="close-detail-view-btn"
              >
                <ChevronLeftIcon className="size-4 transition-transform group-hover:-translate-x-1" />
                <span>back to home</span>
              </button>

              <div className="space-y-8">
                {/* Hero zoomed frame with elegant borders */}
                <motion.div
                  layoutId={`active-work-frame-${selectedWork.id}`}
                  className={`w-full h-[300px] md:h-[480px] rounded-lg overflow-hidden border relative shadow-2xl ${
                    theme === "dark"
                      ? "border-zinc-800 bg-zinc-950"
                      : "border-zinc-200 bg-white"
                  }`}
                >
                  <WorkMediaPreview work={selectedWork} controls />
                  {/* Fine architectural corners */}
                  <div className="absolute top-3 left-3 w-4 h-4 border-t border-l border-white/30 pointer-events-none z-10" />
                  <div className="absolute top-3 right-3 w-4 h-4 border-t border-r border-white/30 pointer-events-none z-10" />
                  <div className="absolute bottom-3 left-3 w-4 h-4 border-b border-l border-white/30 pointer-events-none z-10" />
                  <div className="absolute bottom-3 right-3 w-4 h-4 border-b border-r border-white/30 pointer-events-none z-10" />
                </motion.div>

                {/* Split names inside zoomed layout */}
                <div
                  className={`flex flex-col sm:flex-row justify-between sm:items-baseline border-b pb-6 gap-4 ${
                    theme === "dark" ? "border-zinc-800" : "border-zinc-200"
                  }`}
                >
                  <div>
                    <h1
                      className={`font-editorial font-extralight text-4xl md:text-5xl lg:text-6xl tracking-tight leading-none ${
                        theme === "dark" ? "text-zinc-50" : "text-zinc-900"
                      }`}
                    >
                      {selectedWork.title.split(/(\s+)/).map((part, index) => {
                        if (/^\s+$/.test(part)) return part;

                        return (
                          <span key={index}>
                            <em className="font-bold pr-1">{part.charAt(0)}</em>
                            {part.slice(1)}
                          </span>
                        );
                      })}
                    </h1>
                  </div>
                  <span
                    className={`font-mono text-xs md:text-sm ${
                      theme === "dark" ? "text-zinc-500" : "text-zinc-400"
                    }`}
                  >
                    {selectedWork.date}
                  </span>
                </div>

                {/* Editorial Detailed content */}
                <DetailView
                  item={selectedWork}
                  type="work"
                  onBack={handleCloseDetail}
                  isSliderDetail={true}
                  allWorks={works}
                />
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="slider-mode"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden"
          >
            {/* ======================================================== */}
            {/* TECHNICAL COORDINATE LINES (LONGITUDE & LATITUDE GRID)   */}
            {/* ======================================================== */}

            {/* 1. Left Longitude (Vertical Line extending full height) */}
            <div className="absolute left-[calc(50vw-var(--card-w)/2)] top-0 bottom-0 w-[1px] bg-zinc-800/40 pointer-events-none z-10">
              {/* Vertical rulers on the outer margin of the line */}
              <motion.div
                animate={{ y: virtualIndex * -120 }}
                transition={{
                  type: "spring",
                  stiffness: 70,
                  damping: 17,
                  mass: 1.2,
                }}
                className="absolute right-2 hidden md:flex flex-col items-end gap-0 w-48"
                style={{
                  top: "calc(50vh - 9624px)", // (401 ticks * 48px = 19248px / 2 = 9624px)
                }}
              >
                {ticksRange.map((k) => {
                  const val = 420 + k * 10;
                  return (
                    <div
                      key={`left-tick-${k}`}
                      className="flex items-center gap-2 h-[48px] justify-end select-none"
                    >
                      {/* Film sprocket hole */}
                      <div className="w-2 h-3.5 rounded-[2px] border border-zinc-300/80 dark:border-zinc-700/80 bg-zinc-200/30 dark:bg-zinc-900/40 shrink-0" />
                      <span className="font-mono text-[8px] text-zinc-400 dark:text-zinc-500 w-10 text-right">
                        {val}
                      </span>
                      <div className="w-2 h-[1.5px] bg-zinc-300 dark:bg-zinc-800 shrink-0" />
                    </div>
                  );
                })}
              </motion.div>
            </div>

            {/* 2. Right Longitude (Vertical Line extending full height) */}
            <div className="absolute left-[calc(50vw+var(--card-w)/2)] top-0 bottom-0 w-[1px] bg-zinc-800/40 pointer-events-none z-10">
              {/* Vertical rulers on the outer margin of the line */}
              <motion.div
                animate={{ y: virtualIndex * 120 }}
                transition={{
                  type: "spring",
                  stiffness: 70,
                  damping: 17,
                  mass: 1.2,
                }}
                className="absolute left-2 hidden md:flex flex-col items-start gap-0 w-48"
                style={{
                  top: "calc(50vh - 9624px)", // (401 ticks * 48px = 19248px / 2 = 9624px)
                }}
              >
                {ticksRange.map((k) => {
                  const val = 900 + k * 10;
                  return (
                    <div
                      key={`right-tick-${k}`}
                      className="flex items-center gap-2 h-[48px] justify-start select-none"
                    >
                      <div className="w-2 h-[1.5px] bg-zinc-300 dark:bg-zinc-800 shrink-0" />
                      <span className="font-mono text-[8px] text-zinc-400 dark:text-zinc-500 w-10 text-left">
                        {val}
                      </span>
                      {/* Film sprocket hole */}
                      <div className="w-2 h-3.5 rounded-[2px] border border-zinc-300/80 dark:border-zinc-700/80 bg-zinc-200/30 dark:bg-zinc-900/40 shrink-0" />
                    </div>
                  );
                })}
              </motion.div>
            </div>

            {/* Previous Card (Top Peek) */}
            <div
              className="absolute pointer-events-auto select-none overflow-hidden rounded bg-zinc-950 transition-all duration-700 cursor-pointer hidden md:block"
              style={{
                top: "0%",
                width: "calc(var(--card-w) * 0.70)",
                height: "calc(var(--card-h) * 0.70)",
                transform: "translate(-50%, -45%)",
                left: "50vw",
                opacity: 0.2,
                zIndex: 5,
              }}
              onClick={handlePrev}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={`top-peek-${prevIndex}`}
                  initial={{ y: "-100%", rotateX: -15, opacity: 0 }}
                  animate={{ y: "0%", rotateX: 0, opacity: 1 }}
                  exit={{ y: "100%", rotateX: 15, opacity: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 70,
                    damping: 17,
                    mass: 1.2,
                    delay: 0.25,
                  }}
                  className="w-full h-full"
                >
                  <WorkMediaPreview work={works[prevIndex]} />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Next Card (Bottom Peek) */}
            <div
              className="absolute pointer-events-auto select-none overflow-hidden rounded bg-zinc-950 transition-all duration-700 cursor-pointer hidden md:block"
              style={{
                bottom: "0%",
                width: "calc(var(--card-w) * 0.70)",
                height: "calc(var(--card-h) * 0.70)",
                transform: "translate(-50%, 45%)",
                left: "50vw",
                opacity: 0.2,
                zIndex: 5,
              }}
              onClick={handleNext}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={`bottom-peek-${nextIndex}`}
                  initial={{ y: "100%", rotateX: 15, opacity: 0 }}
                  animate={{ y: "0%", rotateX: 0, opacity: 1 }}
                  exit={{ y: "-100%", rotateX: -15, opacity: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 70,
                    damping: 17,
                    mass: 1.2,
                    delay: 0.25,
                  }}
                  className="w-full h-full"
                >
                  <WorkMediaPreview work={works[nextIndex]} />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* ========================================================================= */}
            {/* COMPOSITE HORIZONTAL GRID: [ LEFT WORD ] [ CENTER CARD ] [ RIGHT WORD ]   */}
            {/* ========================================================================= */}

            <div className="flex items-center justify-center relative w-full px-4 gap-0 max-fit mx-auto z-20">
              {/* Left Flanked Word */}
              <div className="flex-1 flex justify-end overflow-hidden text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-zinc-900 dark:text-zinc-50 tracking-tighter select-none leading-tight pointer-events-none h-[1.15em] bg-[#fafafa] dark:bg-[#18181c]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`left-text-${activeIndex}-${leftText}`}
                    initial={{ y: "100%", rotateX: -15 }}
                    animate={{ y: "0%", rotateX: 0 }}
                    exit={{ y: "-100%", rotateX: 15 }}
                    transition={{
                      type: "spring",
                      stiffness: 70,
                      damping: 17,
                      mass: 1.2,
                      delay: 0.05,
                    }}
                    className="whitespace-nowrap font-editorial"
                  >
                    <SlantedText text={leftText} />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Center Card */}
              <div
                className="shrink-0 select-none pointer-events-auto animate-fadeIn"
                style={{
                  width: "var(--card-w)",
                }}
                onClick={handleOpenDetail}
              >
                <div className="w-full flex flex-col justify-center">
                  <div
                    style={{ height: "var(--card-h)" }}
                    className="w-full relative overflow-hidden transition-colors duration-500 cursor-pointer shadow-3xl"
                  >
                    <WorkMediaPreview work={activeWork} />
                    <CurtainReveal prevSrc={prevImage} keyId={activeIndex} />
                  </div>

                  <div
                    className={`flex justify-center items-center w-full py-3 font-mono text-[10px] md:text-xs tracking-wider border-t select-none ${
                      theme === "dark"
                        ? "border-zinc-800/40 text-zinc-400"
                        : "border-zinc-200 text-zinc-600"
                    }`}
                  >
                    <h3
                      className={`uppercase font-monument tracking-widest text-[10px] max-w-[70%] text-center truncate ${
                        theme === "dark" ? "text-zinc-300" : "text-zinc-800"
                      }`}
                    >
                      {activeWork.description}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Right Flanked Word */}
              <div className="flex-1 flex justify-start overflow-hidden text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-zinc-900 dark:text-zinc-50 tracking-tighter select-none leading-tight pointer-events-none h-[1.15em] bg-[#fafafa] dark:bg-[#18181c]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`right-text-${activeIndex}-${rightText}`}
                    initial={{ y: "-100%", rotateX: 15 }}
                    animate={{ y: "0%", rotateX: 0 }}
                    exit={{ y: "100%", rotateX: -15 }}
                    transition={{
                      type: "spring",
                      stiffness: 70,
                      damping: 17,
                      mass: 1.2,
                      delay: 0.05,
                    }}
                    className="whitespace-nowrap font-editorial"
                  >
                    <SlantedText text={rightText} />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
