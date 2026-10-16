"use client";

import { siteConfig } from "@/lib/site";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { PhoneIcon, type PhoneIconHandle } from "@/components/icons/PhoneIcon";
import { playContactSound } from "@/lib/uiSounds";

const linkClass =
  "hover:text-black dark:hover:text-zinc-300 transition-colors flex items-center";

type PortfolioSocialLinksProps = {
  className?: string;
  layoutId?: string;
};

export function PortfolioSocialLinks({
  className = "",
  layoutId,
}: PortfolioSocialLinksProps) {
  const reduceMotion = useReducedMotion();
  const phoneIconRef = useRef<PhoneIconHandle>(null);
  const contactRef = useRef<HTMLSpanElement>(null);
  const dismissTimerRef = useRef<number | null>(null);
  const [showMessage, setShowMessage] = useState(false);

  useEffect(
    () => () => {
      if (dismissTimerRef.current) window.clearTimeout(dismissTimerRef.current);
    },
    [],
  );

  useEffect(() => {
    if (!showMessage) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!contactRef.current?.contains(event.target as Node)) {
        setShowMessage(false);
      }
    };
    window.addEventListener("pointerdown", closeOnOutsideClick, true);
    return () =>
      window.removeEventListener("pointerdown", closeOnOutsideClick, true);
  }, [showMessage]);

  const openMessage = () => {
    playContactSound();
    phoneIconRef.current?.startAnimation();
    setShowMessage(true);
    if (dismissTimerRef.current) window.clearTimeout(dismissTimerRef.current);
    dismissTimerRef.current = window.setTimeout(() => {
      setShowMessage(false);
    }, 4500);
  };

  return (
    <motion.div
      layoutId={reduceMotion ? undefined : layoutId}
      layout={layoutId && !reduceMotion ? "position" : false}
      transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
      className={`flex items-center gap-4 text-xs font-mono text-zinc-600 dark:text-zinc-500 ${className}`}
      style={{ viewTransitionName: "site-social-links" }}
    >
      <a
        href={siteConfig.author.github}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
        title="GitHub Profile"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          fill="currentColor"
          viewBox="0 0 256 256"
          className="w-4 h-4"
          aria-hidden
        >
          <path d="M208.31,75.68A59.78,59.78,0,0,0,202.93,28,8,8,0,0,0,196,24a59.75,59.75,0,0,0-48,24H124A59.75,59.75,0,0,0,76,24a8,8,0,0,0-6.93,4,59.78,59.78,0,0,0-5.38,47.68A58.14,58.14,0,0,0,56,104v8a56.06,56.06,0,0,0,48.44,55.47A39.8,39.8,0,0,0,96,192v8H72a24,24,0,0,1-24-24A40,40,0,0,0,8,136a8,8,0,0,0,0,16,24,24,0,0,1,24,24,40,40,0,0,0,40,40H96v16a8,8,0,0,0,16,0V192a24,24,0,0,1,48,0v40a8,8,0,0,0,16,0V192a39.8,39.8,0,0,0-8.44-24.53A56.06,56.06,0,0,0,216,112v-8A58.14,58.14,0,0,0,208.31,75.68ZM200,112a40,40,0,0,1-40,40H112a40,40,0,0,1-40-40v-8a41.74,41.74,0,0,1,6.9-22.48A8,8,0,0,0,80,73.83a43.81,43.81,0,0,1,.79-33.58,43.88,43.88,0,0,1,32.32,20.06A8,8,0,0,0,119.82,64h32.35a8,8,0,0,0,6.74-3.69,43.87,43.87,0,0,1,32.32-20.06A43.81,43.81,0,0,1,192,73.83a8.09,8.09,0,0,0,1,7.65A41.72,41.72,0,0,1,200,104Z" />
        </svg>
      </a>
      <a
        href={siteConfig.author.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
        title="LinkedIn Profile"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          fill="currentColor"
          viewBox="0 0 256 256"
          className="w-4 h-4"
          aria-hidden
        >
          <path d="M216,24H40A16,16,0,0,0,24,40V216a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V40A16,16,0,0,0,216,24Zm0,192H40V40H216V216ZM96,112v64a8,8,0,0,1-16,0V112a8,8,0,0,1,16,0Zm88,28v36a8,8,0,0,1-16,0V140a20,20,0,0,0-40,0v36a8,8,0,0,1-16,0V112a8,8,0,0,1,15.79-1.78A36,36,0,0,1,184,140ZM100,84A12,12,0,1,1,88,72,12,12,0,0,1,100,84Z" />
        </svg>
      </a>
      <a
        href={siteConfig.author.x}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
        title="Twitter Profile"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          fill="currentColor"
          viewBox="0 0 256 256"
          className="w-4 h-4"
          aria-hidden
        >
          <path d="M214.75,211.71l-62.6-98.38,61.77-67.95a8,8,0,0,0-11.84-10.76L143.24,99.34,102.75,35.71A8,8,0,0,0,96,32H48a8,8,0,0,0-6.75,12.3l62.6,98.37-61.77,68a8,8,0,1,0,11.84,10.76l58.84-64.72,40.49,63.63A8,8,0,0,0,160,224h48a8,8,0,0,0,6.75-12.29ZM164.39,208,62.57,48h29L193.43,208Z" />
        </svg>
      </a>
      <span ref={contactRef} className="relative flex items-center">
        <button
          type="button"
          onClick={openMessage}
          aria-expanded={showMessage}
          aria-controls="contact-message-popover"
          className="flex cursor-pointer items-center transition-colors hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 dark:hover:text-zinc-300"
          title="Contact Me"
        >
          <PhoneIcon ref={phoneIconRef} size={16} />
          <span className="sr-only">Contact Me</span>
        </button>
        <AnimatePresence>
          {showMessage && (
            <motion.span
              id="contact-message-popover"
              role="status"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduceMotion ? 0.12 : 0.18 }}
              className="absolute right-0 bottom-[calc(100%+6px)] z-90 font-sans text-[13px] leading-5"
            >
              <motion.span
                aria-hidden="true"
                initial={
                  reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0 }
                }
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.1, delay: reduceMotion ? 0 : 0.07 }}
                className="absolute -right-[5px] -bottom-[10px] size-1 rounded-full bg-[#0B84FF]"
              />
              <motion.span
                aria-hidden="true"
                initial={
                  reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0 }
                }
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.12, delay: reduceMotion ? 0 : 0.02 }}
                className="absolute -right-1 -bottom-1 size-3 rounded-full bg-[#0B84FF]"
              />
              <motion.span
                initial={
                  reduceMotion
                    ? { opacity: 0 }
                    : { opacity: 0, scale: 0.08, y: 4 }
                }
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={
                  reduceMotion
                    ? { opacity: 0 }
                    : { opacity: 0, scale: 0.82, y: 3 }
                }
                transition={
                  reduceMotion
                    ? { duration: 0.12 }
                    : {
                        type: "spring",
                        stiffness: 520,
                        damping: 34,
                        mass: 0.65,
                        delay: 0.1,
                      }
                }
                data-cursor-contrast
                className="block w-max origin-bottom-right rounded-full bg-[#0B84FF] px-3 py-1.5 text-left text-white"
              >
                <motion.a
                  href={`mailto:${siteConfig.author.email}`}
                  initial={{ opacity: 0, y: 2 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.14,
                    delay: reduceMotion ? 0 : 0.22,
                  }}
                  className="block whitespace-nowrap font-medium text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  Have a project?{" "}
                  <span className="border-b border-dashed border-white/70">
                    Let’s talk
                  </span>
                </motion.a>
              </motion.span>
            </motion.span>
          )}
        </AnimatePresence>
      </span>
    </motion.div>
  );
}
