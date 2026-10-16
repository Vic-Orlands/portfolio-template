"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowTopRightIcon, PlusIcon } from "@radix-ui/react-icons";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Blog, BlogCategory } from "@/data";
import { parseBlogDate } from "@/lib/parseBlogDate";
import { playClickSound } from "@/lib/uiSounds";

type WritingsSectionProps = {
  blogs: Blog[];
  isLoading?: boolean;
  activeTab: BlogCategory;
  writingsFormat: "compact" | "detailed";
  onTabChange: (cat: BlogCategory) => void;
  onFormatChange: (format: "compact" | "detailed") => void;
};

const writingLinkClass =
  "group relative block py-3 transition-opacity duration-200 ease-out before:absolute before:-inset-x-4 before:inset-y-0 before:rounded-xl before:bg-zinc-500/0 before:transition-colors before:duration-300 group-hover/writings:opacity-40 hover:opacity-100! hover:before:bg-zinc-500/5 focus-visible:opacity-100! focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-600 motion-reduce:transition-none md:before:-inset-x-6 dark:hover:before:bg-zinc-800/20";

const dateClass =
  "shrink-0 font-mono text-xs leading-relaxed tabular-nums text-zinc-500";

function WritingsSkeleton({ format }: { format: "compact" | "detailed" }) {
  return (
    <div className="space-y-2" aria-hidden="true">
      {Array.from({ length: format === "compact" ? 7 : 5 }).map((_, index) => (
        <div key={index} className="animate-pulse py-3">
          {format === "compact" ? (
            <div className="flex h-6 items-center gap-3">
              <div className="h-3 w-10 shrink-0 rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="h-4 flex-1 rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="hidden h-3 w-10 shrink-0 rounded bg-zinc-200 sm:block dark:bg-zinc-800" />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <div className="h-4 w-56 max-w-[70%] rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="ml-auto h-3 w-20 rounded bg-zinc-200 dark:bg-zinc-800" />
              </div>
              <div className="mt-2 h-3 w-4/5 rounded bg-zinc-200 dark:bg-zinc-800" />
            </>
          )}
        </div>
      ))}
    </div>
  );
}

function AnimatedWritingPanel({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 6, filter: "blur(3px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={
        reduceMotion ? undefined : { opacity: 0, y: -4, filter: "blur(2px)" }
      }
      transition={{
        duration: reduceMotion ? 0 : 0.2,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

export function WritingsSection({
  blogs,
  isLoading = false,
  activeTab,
  writingsFormat,
  onTabChange,
  onFormatChange,
}: WritingsSectionProps) {
  const reduceMotion = useReducedMotion();
  const filteredBlogs = blogs.filter((blog) => blog.category === activeTab);

  if (!isLoading && blogs.length === 0) return null;

  return (
    <section id="section-blogs">
      <h2 className="mb-3 text-base font-instrument italic text-zinc-950 dark:text-zinc-50">
        Writings
      </h2>

      <section
        className="flex w-full items-center justify-between mb-4"
        id="blog-tabs-container"
      >
        <div
          className="flex items-center gap-3 font-sans text-xs"
          id="blog-tabs"
        >
          {(["tech", "scriptures", "other"] as BlogCategory[]).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                playClickSound();
                onTabChange(cat);
              }}
              className={`relative cursor-pointer py-1 transition-colors focus:outline-none ${
                activeTab === cat
                  ? "font-semibold text-zinc-950 dark:text-zinc-50"
                  : "text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
            >
              {cat === "scriptures"
                ? "Biblical"
                : cat === "tech"
                  ? "Technical"
                  : cat.charAt(0).toUpperCase() + cat.slice(1)}
              {activeTab === cat && (
                <motion.span
                  layoutId="writingsActiveUnderline"
                  className="absolute inset-x-0 bottom-0 h-px bg-zinc-950 dark:bg-zinc-100"
                  transition={{
                    duration: reduceMotion ? 0 : 0.2,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                />
              )}
            </button>
          ))}
        </div>

        <div
          className="flex items-center gap-2 text-zinc-400 dark:text-zinc-600"
          id="writings-view-toggles"
        >
          <button
            type="button"
            onClick={() => {
              playClickSound();
              onFormatChange("compact");
            }}
            className={`cursor-pointer rounded p-1 transition-[color,transform] duration-150 hover:text-zinc-950 active:scale-95 focus:outline-none motion-reduce:active:scale-100 dark:hover:text-zinc-50 ${
              writingsFormat === "compact"
                ? "text-zinc-950 dark:text-zinc-50"
                : "opacity-40"
            }`}
            title="Compact view"
            aria-label="Compact view"
            aria-pressed={writingsFormat === "compact"}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => {
              playClickSound();
              onFormatChange("detailed");
            }}
            className={`cursor-pointer rounded p-1 transition-[color,transform] duration-150 hover:text-zinc-950 active:scale-95 focus:outline-none motion-reduce:active:scale-100 dark:hover:text-zinc-50 ${
              writingsFormat === "detailed"
                ? "text-zinc-950 dark:text-zinc-50"
                : "opacity-40"
            }`}
            title="Detailed view"
            aria-label="Detailed view"
            aria-pressed={writingsFormat === "detailed"}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="4" y1="6" x2="20" y2="6" />
              <line
                x1="4"
                y1="10"
                x2="14"
                y2="10"
                strokeWidth="1.5"
                className="opacity-60"
              />
              <line x1="4" y1="16" x2="20" y2="16" />
              <line
                x1="4"
                y1="20"
                x2="14"
                y2="20"
                strokeWidth="1.5"
                className="opacity-60"
              />
            </svg>
          </button>
        </div>
      </section>

      {isLoading ? (
        <WritingsSkeleton format={writingsFormat} />
      ) : (
        <AnimatePresence initial={false} mode="wait">
          <AnimatedWritingPanel key={`${activeTab}-${writingsFormat}`}>
            <div className="group/writings space-y-2">
              {filteredBlogs.length > 0 ? (
                filteredBlogs.slice(0, 7).map((blog) => {
                  const { year, mmdd } = parseBlogDate(blog.date);
                  const writing =
                    writingsFormat === "compact" ? (
                      <div className="relative z-10 flex h-5 items-center">
                        <span className={`${dateClass} w-10`}>{year}</span>
                        <h3 className="flex min-w-0 flex-1 items-center gap-1 font-sans text-sm font-medium text-zinc-950 underline decoration-transparent transition-colors duration-200 ease-[ease] group-hover:text-amber-700 motion-reduce:transition-none md:text-base dark:text-zinc-100 dark:group-hover:text-amber-400">
                          <span className="min-w-0 truncate">{blog.title}</span>
                          {blog.externalUrl && (
                            <span
                              aria-hidden="true"
                              className="inline-flex shrink-0 text-xs text-zinc-400"
                            >
                              <ArrowTopRightIcon className="size-3" />
                            </span>
                          )}
                        </h3>
                        <span className={`${dateClass} hidden sm:inline`}>
                          {mmdd}
                        </span>
                      </div>
                    ) : (
                      <div className="relative z-10">
                        <div className="flex items-baseline justify-between">
                          <h3 className="flex min-w-0 flex-1 items-center gap-1 font-sans text-sm font-medium text-zinc-950 underline decoration-transparent transition-colors duration-200 ease-[ease] group-hover:text-amber-700 motion-reduce:transition-none md:text-base dark:text-zinc-100 dark:group-hover:text-amber-400">
                            <span className="min-w-0 truncate">
                              {blog.title}
                            </span>
                            {blog.externalUrl && (
                              <span
                                aria-hidden="true"
                                className="inline-flex shrink-0 text-xs text-zinc-400"
                              >
                                <ArrowTopRightIcon className="size-3" />
                              </span>
                            )}
                          </h3>
                          <time className={`${dateClass} hidden sm:inline`}>
                            {blog.date}
                          </time>
                          <time className={`${dateClass} sm:hidden`}>
                            {year}
                          </time>
                        </div>
                        <p className="mt-2 line-clamp-2 text-pretty text-xs leading-relaxed text-zinc-600 md:text-sm dark:text-zinc-400">
                          {blog.description}
                        </p>
                      </div>
                    );

                  return blog.externalUrl ? (
                    <a
                      key={blog.id}
                      id={`blog-${blog.id}`}
                      href={blog.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={writingLinkClass}
                    >
                      {writing}
                    </a>
                  ) : (
                    <Link
                      key={blog.id}
                      id={`blog-${blog.id}`}
                      href={`/writings/${blog.id}`}
                      transitionTypes={["writing-forward"]}
                      className={writingLinkClass}
                    >
                      {writing}
                    </Link>
                  );
                })
              ) : (
                <p className="py-3 font-mono text-xs text-zinc-500">
                  No logs indexed under this category.
                </p>
              )}
            </div>

            {filteredBlogs.length > 7 && (
              <div className="flex justify-start pt-3">
                <Link
                  href="/writings"
                  onClick={playClickSound}
                  transitionTypes={["nav-forward"]}
                  className="flex items-center gap-1 font-sans text-xs text-zinc-500 hover:text-black hover:underline focus:outline-none dark:hover:text-zinc-300"
                >
                  <PlusIcon className="size-3" />
                  <span>More Writings</span>
                </Link>
              </div>
            )}
          </AnimatedWritingPanel>
        </AnimatePresence>
      )}
    </section>
  );
}
