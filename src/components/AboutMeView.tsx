"use client";

import React from "react";
import type { StaticImageData } from "next/image";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import { ChevronLeftIcon } from "@radix-ui/react-icons";
import { playClickSound } from "@/lib/uiSounds";
import { siteConfig } from "@/lib/site";

function assetSrc(asset: string | StaticImageData): string {
  return typeof asset === "string" ? asset : asset.src;
}

interface AboutMeViewProps {
  onClose: () => void;
  theme: "light" | "dark";
}

const linkBadgeClass =
  "text-black dark:text-white font-bold bg-amber-500/10 dark:bg-amber-500/5 px-1 py-0.5 border border-amber-500/20";

interface PreviewLinkProps {
  href: string;
  title: string;
  imageSrc: string | StaticImageData;
  imageAlt: string;
  children: React.ReactNode;
}

/** Product link with a small image that fades in to the right on hover. */
function PreviewLink({
  href,
  title,
  imageSrc,
  imageAlt,
  children,
}: PreviewLinkProps) {
  const anchorRef = React.useRef<HTMLAnchorElement>(null);
  const [previewPosition, setPreviewPosition] = React.useState<{
    left: number;
    top: number;
  } | null>(null);

  const showPreview = () => {
    const anchor = anchorRef.current;
    if (!anchor) return;

    const bounds = anchor.getBoundingClientRect();
    const previewWidth = 208;
    const previewHeight = 120;
    const gap = 8;
    const left =
      bounds.right + gap + previewWidth <= window.innerWidth
        ? bounds.right + gap
        : Math.max(gap, bounds.left - previewWidth - gap);
    const top = Math.min(
      Math.max(gap, bounds.top + bounds.height / 2 - previewHeight / 2),
      window.innerHeight - previewHeight - gap,
    );

    setPreviewPosition({ left, top });
  };

  return (
    <a
      ref={anchorRef}
      href={href}
      target="_blank"
      title={title}
      rel="noopener noreferrer"
      className="relative inline-block align-baseline"
      onMouseEnter={showPreview}
      onMouseLeave={() => setPreviewPosition(null)}
      onFocus={showPreview}
      onBlur={() => setPreviewPosition(null)}
    >
      {children}
      {previewPosition && typeof document !== "undefined"
        ? createPortal(
            <span
              aria-hidden="true"
              className="pointer-events-none fixed z-100 animate-in fade-in zoom-in-95 duration-200"
              style={previewPosition}
            >
              <img
                src={assetSrc(imageSrc)}
                alt={imageAlt}
                className="h-30 w-auto max-w-fit rounded-md border border-zinc-300/80 object-contain shadow-md shadow-black/25 dark:border-zinc-600/80"
              />
            </span>,
            document.body,
          )
        : null}
    </a>
  );
}

export const AboutMeView: React.FC<AboutMeViewProps> = ({ onClose, theme }) => {
  // Generate vertical ruler line data
  const rulerTicks = Array.from({ length: 15 }, (_, i) => 720 + i * 10);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`w-full font-sans transition-colors duration-200 z-50 overflow-hidden flex flex-col ${
        theme === "dark"
          ? "bg-[#18181c] text-zinc-300"
          : "bg-[#fafafa] text-zinc-900"
      }`}
      data-theme-surface
      id="about-me-container"
    >
      <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col">
        <div className="mb-8 flex shrink-0 items-center md:mb-12">
          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="group flex cursor-pointer items-center gap-2 font-sans text-xs tracking-wider transition-colors hover:text-amber-500 focus:outline-none"
            id="about-me-back-btn"
          >
            <ChevronLeftIcon className="size-3.5 transition-transform group-hover:-translate-x-1" />
            <span>back to home</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 flex-1 min-h-0 pb-6 overflow-hidden">
          <div className="relative flex h-[400px] items-stretch gap-6 md:h-[550px] lg:col-span-5">
            <div className="hidden sm:flex flex-col justify-between py-4 border-r border-zinc-200 dark:border-zinc-800 pr-4 select-none font-mono text-[9px] text-zinc-400 dark:text-zinc-600">
              {rulerTicks.map((tick, idx) => (
                <div
                  key={tick}
                  className="flex items-center justify-end gap-3 h-4"
                >
                  <span>{tick}</span>
                  <div
                    className={`h-px bg-zinc-300 dark:bg-zinc-700 ${idx % 3 === 0 ? "w-4" : "w-2"}`}
                  />
                </div>
              ))}
            </div>

            <div className="relative flex-1 group">
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-zinc-400 dark:border-zinc-600 pointer-events-none" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-zinc-400 dark:border-zinc-600 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-zinc-400 dark:border-zinc-600 pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-zinc-400 dark:border-zinc-600 pointer-events-none" />

              <motion.div
                className="w-full h-full overflow-hidden bg-zinc-900/10 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800/80"
                layoutId="about-avatar-wrapper"
              >
                <img
                  src={siteConfig.aboutPortrait}
                  alt={`${siteConfig.name} portrait`}
                  className="w-full h-full object-cover grayscale brightness-90 hover:grayscale-0 transition-all duration-700 ease-out"
                  style={{
                    clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
                    visibility: "visible",
                  }}
                />
              </motion.div>

              <div className="absolute bottom-4 left-0 right-0 w-fit mx-auto bg-black/70 backdrop-blur-sm border border-zinc-800 px-3 py-1.5 font-mono text-[9px] text-amber-500 tracking-wider">
                {siteConfig.locationLabel}
              </div>
            </div>
          </div>

          <section
            className="col-span-1 lg:col-span-7 flex flex-col h-full min-h-0 overflow-hidden"
            id="about-editorial-panel"
          >
            <div
              className="flex-1 overflow-y-auto no-scrollbar pr-4 space-y-8 min-h-0 select-text"
              id="about-scrollable-content-area"
            >
              <p className="font-monument text-[11px] md:text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed uppercase tracking-tight font-light">
                <span className="normal-case">
                  {siteConfig.name}. <br />
                </span>
                {siteConfig.bio[0]}
              </p>

              <div className="font-monument text-[11px] md:text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed uppercase tracking-tight font-light space-y-6">
                {siteConfig.bio.slice(1).map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                <p>
                  Sample work:{" "}
                  {siteConfig.featured.map((item, index) => (
                    <span key={item.href}>
                      {index > 0 ? ", " : null}
                      <PreviewLink
                        href={item.href}
                        title={item.title}
                        imageSrc={item.image}
                        imageAlt={item.imageAlt}
                      >
                        <span className={linkBadgeClass}>{item.label}</span>
                      </PreviewLink>
                    </span>
                  ))}
                  . Edit these links in <span className="normal-case">content/profile.json</span>.
                </p>
              </div>

              <section className="w-fit ml-auto border border-zinc-300 dark:border-zinc-800 px-4 pt-1 pb-2 relative bg-zinc-100/50 dark:bg-zinc-900/10 select-none">
                <div className="absolute top-0 left-0 w-2 h-px bg-amber-500" />
                <div className="absolute top-0 left-0 w-px h-2 bg-amber-500" />
                <div className="absolute bottom-0 right-0 w-2 h-px bg-amber-500" />
                <div className="absolute bottom-0 right-0 w-px h-2 bg-amber-500" />

                <span className="font-mono text-[8px] uppercase text-zinc-500 tracking-wider">
                  {siteConfig.author.email}
                </span>
              </section>
            </div>
          </section>
        </div>
      </div>
    </motion.div>
  );
};
