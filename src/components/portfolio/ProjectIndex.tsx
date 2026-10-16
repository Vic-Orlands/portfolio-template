"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Project } from "@/data";
import { hasProjectLink } from "@/lib/projectLink";
import { playArrivalSound, playHoverSound } from "@/lib/uiSounds";

type ProjectIndexProps = {
  projects: Project[];
  activeProject: string | null;
  onActiveProjectChange: (id: string | null) => void;
  idPrefix?: string;
};

function projectYear(date: string) {
  return date.match(/\b(?:19|20)\d{2}\b/)?.[0] ?? date;
}

function DescriptionReveal({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const reduceMotion = useReducedMotion();
  const words = description.split(" ");

  return (
    <motion.span
      initial={reduceMotion ? false : "hidden"}
      animate="visible"
      exit={
        reduceMotion
          ? undefined
          : {
              opacity: 0,
              filter: "blur(3px)",
              transition: { duration: 0.4, ease: "easeOut" },
            }
      }
      variants={{
        hidden: { opacity: 0, filter: "blur(3px)" },
        visible: {
          opacity: 1,
          filter: "blur(0px)",
          transition: reduceMotion
            ? { duration: 0 }
            : {
                duration: 0.35,
                ease: "easeOut",
                delayChildren: 0.18,
                staggerChildren: 0.045,
              },
        },
      }}
      className="absolute inset-x-0 top-0 hidden text-xs leading-relaxed text-zinc-600 md:block md:text-sm dark:text-zinc-300"
    >
      <span className="font-sans font-medium text-zinc-950 md:text-base dark:text-zinc-50">
        {title}
      </span>{" "}
      <motion.span
        variants={{
          hidden: { opacity: 0, filter: "blur(3px)" },
          visible: {
            opacity: 1,
            filter: "blur(0px)",
            transition: { duration: reduceMotion ? 0 : 0.45, ease: "easeOut" },
          },
        }}
        className="inline-block"
      >
        -&nbsp;
      </motion.span>
      {words.map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          variants={{
            hidden: { opacity: 0, filter: "blur(3px)" },
            visible: {
              opacity: 1,
              filter: "blur(0px)",
              transition: { duration: reduceMotion ? 0 : 0.45, ease: "easeOut" },
            },
          }}
          className="inline-block"
        >
          {word}
          {index < words.length - 1 ? "\u00a0" : ""}
        </motion.span>
      ))}
    </motion.span>
  );
}

function ProjectRowContent({
  project,
  isActive,
}: {
  project: Project;
  isActive: boolean;
}) {
  return (
    <>
      <div
        className={`flex items-center gap-3 transition-opacity duration-300 ease-out motion-reduce:transition-none ${
          isActive ? "opacity-100 md:opacity-0" : "opacity-100"
        }`}
        aria-hidden={isActive}
      >
        <h3 className="shrink-0 font-sans text-sm font-medium leading-relaxed text-zinc-950 md:text-base dark:text-zinc-50">
          {project.title}
        </h3>
        <span
          aria-hidden="true"
          className="h-px min-w-8 flex-1 bg-zinc-300/80 dark:bg-zinc-700/70"
        />
        <span className="shrink-0 font-sans text-xs leading-relaxed tabular-nums text-zinc-500">
          {projectYear(project.date)}
        </span>
      </div>
      <AnimatePresence initial={false}>
        {isActive ? (
          <DescriptionReveal
            key={`${project.id}-description`}
            title={project.title}
            description={project.description}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}

function ComingSoonProject({
  project,
  isActive,
  id,
  rowClass,
  onActiveProjectChange,
}: {
  project: Project;
  isActive: boolean;
  id: string;
  rowClass: string;
  onActiveProjectChange: (id: string | null) => void;
}) {
  const [status, setStatus] = useState<{
    phase: "dots" | "ready";
    x: number;
    y: number;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const statusId = `${id}-status`;

  useEffect(() => {
    if (!status) return;
    const timer = window.setTimeout(() => {
      if (status.phase === "dots") {
        setStatus((current) =>
          current?.phase === "dots" ? { ...current, phase: "ready" } : current,
        );
      } else {
        setStatus(null);
      }
    }, 2000);
    return () => window.clearTimeout(timer);
  }, [status]);

  useEffect(() => {
    if (!status) return;
    const dismissOnOutsideClick = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setStatus(null);
      }
    };
    const dismissOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setStatus(null);
    };
    document.addEventListener("pointerdown", dismissOnOutsideClick);
    document.addEventListener("keydown", dismissOnEscape);
    return () => {
      document.removeEventListener("pointerdown", dismissOnOutsideClick);
      document.removeEventListener("keydown", dismissOnEscape);
    };
  }, [status]);

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseLeave={() => setStatus(null)}
    >
      <button
        type="button"
        id={id}
        data-cursor-help
        aria-label={`${project.title} — check availability`}
        aria-expanded={status !== null}
        aria-controls={status ? statusId : undefined}
        className={rowClass}
        onFocus={() => onActiveProjectChange(project.id)}
        onBlur={() => {
          onActiveProjectChange(null);
          setStatus(null);
        }}
        onClick={(event) => {
          const bounds = event.currentTarget.getBoundingClientRect();
          setStatus({
            phase: "dots",
            x: event.detail === 0 ? bounds.left + bounds.width / 2 : event.clientX,
            y: event.detail === 0 ? bounds.top : event.clientY,
          });
        }}
      >
        <ProjectRowContent project={project} isActive={isActive} />
      </button>
      {status && typeof document !== "undefined" ? createPortal(
        <div
          id={statusId}
          role="status"
          aria-live="polite"
          style={{ left: status.x, top: status.y - 10 }}
          className="pointer-events-none fixed z-100 flex min-h-9 -translate-x-1/2 -translate-y-full items-center justify-center rounded-full border border-zinc-300 bg-white px-4 py-2 text-xs font-medium whitespace-nowrap text-zinc-900 shadow-md dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        >
          {status.phase === "dots" ? (
            <span className="flex items-center gap-1">
              <span className="sr-only">Loading</span>
              {[0, 1, 2].map((index) => (
                <span
                  key={index}
                  aria-hidden="true"
                  className="size-1.5 animate-bounce rounded-full bg-amber-500 motion-reduce:animate-none"
                  style={{ animationDelay: `${index * 120}ms` }}
                />
              ))}
            </span>
          ) : (
            "Coming soon"
          )}
        </div>,
        document.body,
      ) : null}
    </div>
  );
}

export function ProjectIndex({
  projects,
  activeProject,
  onActiveProjectChange,
  idPrefix = "project",
}: ProjectIndexProps) {
  return (
    <div
      className="project-index"
      onMouseLeave={() => onActiveProjectChange(null)}
    >
      {projects.map((project) => {
        const isActive = activeProject === project.id;
        const isMuted = activeProject !== null && !isActive;
        const linked = hasProjectLink(project.link);
        const comingSoon = project.id === "vacayio" && !linked;
        const rowClass =
          "group relative block w-full rounded-sm text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-600";

        return (
          <div
            key={project.id}
            className={`h-12 py-1 transition-[opacity,filter] duration-500 ease-in-out motion-reduce:transition-none ${comingSoon ? "relative z-20" : ""} ${
              isMuted
                ? "opacity-100 blur-none md:opacity-15 md:blur-[3px]"
                : "opacity-100 blur-none"
            }`}
            onMouseEnter={() => {
              playHoverSound();
              onActiveProjectChange(project.id);
            }}
          >
            {linked ? (
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className={rowClass}
                id={`${idPrefix}-${project.id}`}
                onClick={playArrivalSound}
                onFocus={() => onActiveProjectChange(project.id)}
                onBlur={() => onActiveProjectChange(null)}
              >
                <ProjectRowContent project={project} isActive={isActive} />
              </a>
            ) : comingSoon ? (
              <ComingSoonProject
                project={project}
                isActive={isActive}
                id={`${idPrefix}-${project.id}`}
                rowClass={rowClass}
                onActiveProjectChange={onActiveProjectChange}
              />
            ) : (
              <div
                className={`${rowClass} cursor-default`}
                id={`${idPrefix}-${project.id}`}
              >
                <ProjectRowContent project={project} isActive={isActive} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
