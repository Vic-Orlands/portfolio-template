"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { ArrowLeftIcon, ArrowRightIcon } from "@radix-ui/react-icons";
import type { Project } from "@/data";
import { MarkdownContent } from "@/components/MarkdownContent";
import { isVideoMedia } from "@/components/WorkMediaPreview";
import { hasProjectLink } from "@/lib/projectLink";
import {
  playClickSound,
  playBoundarySound,
  playNavigateSound,
  playTunerScrollSound,
} from "@/lib/uiSounds";

type ProjectNotesViewProps = {
  projects: Project[];
};

function ProjectPreview({ project }: { project: Project }) {
  const mediaUrl = project.imageUrl;
  const isVideo =
    project.mediaType === "video" || isVideoMedia(project.imageUrl);
  const mediaClassName =
    "block max-h-full w-fit max-w-full rounded-lg object-contain outline outline-1 -outline-offset-1 outline-black/10 shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_0_18px_-10px_rgba(0,0,0,0.22),0_8px_24px_-16px_rgba(0,0,0,0.3)] dark:outline-white/10 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_0_18px_-9px_rgba(0,0,0,0.62),0_8px_24px_-16px_rgba(0,0,0,0.75)]";

  if (!mediaUrl) return null;

  return isVideo ? (
    <video
      key={mediaUrl}
      src={mediaUrl}
      className={mediaClassName}
      controls
      muted
      playsInline
      preload="metadata"
      aria-label={`${project.title} product preview`}
    />
  ) : (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      key={mediaUrl}
      src={mediaUrl}
      alt={`${project.title} product preview`}
      className={mediaClassName}
    />
  );
}

function TunerEdgeStack({
  allProjects,
  projects,
  side,
}: {
  allProjects: Project[];
  projects: Project[];
  side: "left" | "right";
}) {
  if (!projects.length) return null;

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute bottom-1 top-5 z-10 w-16 overflow-hidden ${
        side === "left" ? "left-0" : "right-0"
      }`}
      style={{
        maskImage:
          side === "left"
            ? "linear-gradient(to right, transparent, black 38%, black)"
            : "linear-gradient(to left, transparent, black 38%, black)",
      }}
    >
      <AnimatePresence initial={false}>
        {projects.map((project, index) => {
          const inset = index * 8;
          const projectNumber = allProjects.findIndex(
            (item) => item.id === project.id,
          );
          return (
            <motion.span
              layout
              key={`${side}-${project.id}`}
              initial={{ opacity: 0, x: side === "left" ? -10 : 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: side === "left" ? 12 : -12 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-y-0 w-28 overflow-hidden rounded-lg border border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900"
              style={
                side === "left" ? { right: inset } : { left: inset }
              }
            >
              <span
                className={`absolute top-2 font-mono text-[8px] text-zinc-500 ${
                  side === "left" ? "right-2" : "left-2"
                }`}
              >
                {String(projectNumber + 1).padStart(2, "0")}
              </span>
              <span
                className={`absolute bottom-2 text-[10px] font-medium text-zinc-600 dark:text-zinc-300 ${
                  side === "left" ? "right-2" : "left-2"
                }`}
              >
                {project.title.slice(0, 1)}
              </span>
            </motion.span>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export function ProjectNotesView({ projects }: ProjectNotesViewProps) {
  const reduceMotion = useReducedMotion();
  const [activeId, setActiveId] = useState(projects[0]?.id ?? "");
  const [navigationDirection, setNavigationDirection] = useState<1 | -1>(1);
  const [edgeStackIds, setEdgeStackIds] = useState<{
    left: string[];
    right: string[];
  }>({ left: [], right: [] });
  const tunerRef = useRef<HTMLDivElement>(null);
  const contentScrollerRef = useRef<HTMLDivElement>(null);
  const contentSectionRefs = useRef(new Map<string, HTMLElement>());
  const itemRefs = useRef(new Map<string, HTMLButtonElement>());
  const ignoreNextClickRef = useRef(false);
  const lastTunerScrollLeftRef = useRef(0);
  const tunerWheelActiveRef = useRef(false);
  const tunerWheelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const contentControlsTunerRef = useRef(false);
  const contentTunerFrameRef = useRef<number | null>(null);
  const pendingSelectionRef = useRef<{
    projectId: string;
    behavior: ScrollBehavior;
    resetContent: boolean;
  } | null>(null);
  const [edgeFeedback, setEdgeFeedback] = useState<"top" | "bottom" | null>(
    null,
  );
  const edgeOffset = useMotionValue(0);
  const edgeSpring = useSpring(edgeOffset, {
    stiffness: 520,
    damping: 38,
    mass: 0.55,
  });
  const edgeReleaseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const edgeSoundArmedRef = useRef(true);
  const programmaticScrollRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const dragRef = useRef({
    active: false,
    pointerId: -1,
    startX: 0,
    startScrollLeft: 0,
    moved: false,
  });

  useEffect(() => {
    if (!projects.some((project) => project.id === activeId)) {
      setActiveId(projects[0]?.id ?? "");
    }
  }, [activeId, projects]);

  const activeProject = useMemo(
    () => projects.find((project) => project.id === activeId) ?? projects[0],
    [activeId, projects],
  );

  const placeTickerWithinProject = (
    projectId: string,
    progress: number,
    behavior: ScrollBehavior = reduceMotion ? "auto" : "smooth",
  ) => {
    const scroller = tunerRef.current;
    const item = itemRefs.current.get(projectId);
    if (!scroller || !item) return;

    const clampedProgress = Math.min(1, Math.max(0, progress));
    const tickerPosition =
      item.offsetLeft + item.offsetWidth * clampedProgress;

    if (behavior === "auto") {
      contentControlsTunerRef.current = true;
      if (contentTunerFrameRef.current !== null) {
        cancelAnimationFrame(contentTunerFrameRef.current);
      }
      contentTunerFrameRef.current = requestAnimationFrame(() => {
        contentControlsTunerRef.current = false;
        contentTunerFrameRef.current = null;
      });
    }

    scroller.scrollTo({
      left: tickerPosition - scroller.clientWidth / 2,
      behavior,
    });
  };

  const updateTunerStacks = () => {
    const scroller = tunerRef.current;
    if (!scroller) return;

    const leftBoundary = scroller.scrollLeft + 64;
    const rightBoundary =
      scroller.scrollLeft + scroller.clientWidth - 64;
    const left: string[] = [];
    const right: string[] = [];

    projects.forEach((project) => {
      const item = itemRefs.current.get(project.id);
      if (!item) return;
      const itemLeft = item.offsetLeft;
      const itemRight = itemLeft + item.offsetWidth;

      if (itemLeft < leftBoundary) left.push(project.id);
      if (itemRight > rightBoundary) right.push(project.id);
    });

    const next = {
      left: left.slice(0, 3),
      right: right.slice(-3).reverse(),
    };
    setEdgeStackIds((current) =>
      current.left.join("|") === next.left.join("|") &&
      current.right.join("|") === next.right.join("|")
        ? current
        : next,
    );
  };

  const updateActiveProjectAtTicker = () => {
    const scroller = tunerRef.current;
    if (!scroller || !activeProject) return;

    const tickerPosition = scroller.scrollLeft + scroller.clientWidth / 2;
    const scrollDirection =
      scroller.scrollLeft >= lastTunerScrollLeftRef.current ? 1 : -1;
    lastTunerScrollLeftRef.current = scroller.scrollLeft;

    const currentIndex = projects.findIndex(
      (project) => project.id === activeProject.id,
    );
    const nextIndex = currentIndex + scrollDirection;
    const nextProject = projects[nextIndex];
    const nextItem = nextProject
      ? itemRefs.current.get(nextProject.id)
      : undefined;
    if (!nextProject || !nextItem) return;

    // Keep the current project active while the ticker traverses its full card.
    // The inset into the adjacent card creates a small, deliberate resistance at
    // the boundary without snapping the user's scroll position.
    const boundaryInset = 10;
    const crossedBoundary =
      scrollDirection > 0
        ? tickerPosition >= nextItem.offsetLeft + boundaryInset
        : tickerPosition <=
          nextItem.offsetLeft + nextItem.offsetWidth - boundaryInset;

    if (crossedBoundary) {
      setNavigationDirection(scrollDirection);
      pendingSelectionRef.current = {
        projectId: nextProject.id,
        behavior: reduceMotion ? "auto" : "smooth",
        resetContent: true,
      };
      if (programmaticScrollRef.current) {
        clearTimeout(programmaticScrollRef.current);
      }
      programmaticScrollRef.current = setTimeout(() => {
        programmaticScrollRef.current = null;
      }, reduceMotion ? 100 : 500);
      setActiveId(nextProject.id);
    }
  };

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      placeTickerWithinProject(activeId, 0, "auto");
      if (tunerRef.current) {
        lastTunerScrollLeftRef.current = tunerRef.current.scrollLeft;
      }
      updateTunerStacks();
    });
    return () => cancelAnimationFrame(frame);
    // Establish the initial tuner position without snapping subsequent scrolls.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects.length]);

  const selectProject = (
    project: Project,
    options: {
      behavior?: ScrollBehavior;
      direction?: 1 | -1;
      playSound?: boolean;
      resetContent?: boolean;
    } = {},
  ) => {
    if (options.playSound !== false) playNavigateSound();
    const behavior = options.behavior ?? (reduceMotion ? "auto" : "smooth");
    const currentIndex = projects.findIndex(
      (item) => item.id === activeProject?.id,
    );
    const nextIndex = projects.findIndex((item) => item.id === project.id);
    setNavigationDirection(
      options.direction ?? (nextIndex >= currentIndex ? 1 : -1),
    );
    if (programmaticScrollRef.current) {
      clearTimeout(programmaticScrollRef.current);
    }
    programmaticScrollRef.current = setTimeout(() => {
      programmaticScrollRef.current = null;
    }, behavior === "auto" ? 100 : 650);

    if (
      options.resetContent === true &&
      window.matchMedia("(min-width: 1024px)").matches
    ) {
      const contentScroller = contentScrollerRef.current;
      const section = contentSectionRefs.current.get(project.id);
      const firstSection = contentSectionRefs.current.get(projects[0]?.id ?? "");
      if (contentScroller && section) {
        contentScroller.scrollTo({
          top: Math.max(0, section.offsetTop - (firstSection?.offsetTop ?? 0)),
          behavior: "auto",
        });
      }
    }

    pendingSelectionRef.current = {
      projectId: project.id,
      behavior,
      resetContent:
        options.resetContent === true &&
        !window.matchMedia("(min-width: 1024px)").matches,
    };
    setActiveId(project.id);
  };

  useLayoutEffect(() => {
    const pendingSelection = pendingSelectionRef.current;
    const contentScroller = contentScrollerRef.current;
    if (!pendingSelection || pendingSelection.projectId !== activeId) return;

    if (pendingSelection.resetContent && contentScroller) {
      if (window.matchMedia("(min-width: 1024px)").matches) {
        const section = contentSectionRefs.current.get(
          pendingSelection.projectId,
        );
        const firstSection = contentSectionRefs.current.get(projects[0]?.id ?? "");
        if (section) {
          contentScroller.scrollTo({
            top: Math.max(
              0,
              section.offsetTop - (firstSection?.offsetTop ?? 0),
            ),
            // Land on the exact project boundary before the summary/tuner
            // transition begins. A long native smooth scroll can hand control
            // back to the reading tracker while it is still crossing earlier
            // projects, which makes the selected summary flicker backwards.
            behavior: "auto",
          });
        }
      } else {
        contentScroller.scrollTo({ top: 0, behavior: "auto" });
      }
    }
    placeTickerWithinProject(activeId, 0, pendingSelection.behavior);
    pendingSelectionRef.current = null;
  }, [activeId, projects]);

  useEffect(
    () => () => {
      if (programmaticScrollRef.current) {
        clearTimeout(programmaticScrollRef.current);
      }
      if (contentTunerFrameRef.current !== null) {
        cancelAnimationFrame(contentTunerFrameRef.current);
      }
      if (edgeReleaseTimerRef.current) {
        clearTimeout(edgeReleaseTimerRef.current);
      }
      if (tunerWheelTimerRef.current) {
        clearTimeout(tunerWheelTimerRef.current);
      }
    },
    [],
  );

  const moveSelection = (direction: -1 | 1) => {
    const currentIndex = projects.findIndex(
      (project) => project.id === activeProject?.id,
    );
    if (currentIndex < 0) return;
    const nextIndex = Math.min(
      projects.length - 1,
      Math.max(0, currentIndex + direction),
    );
    const nextProject = projects[nextIndex];
    if (nextProject && nextProject.id !== activeProject?.id) {
      selectProject(nextProject, {
        behavior: reduceMotion ? "auto" : "smooth",
        direction,
        resetContent: true,
      });
    }
  };

  const syncTunerToReadingProgress = () => {
    if (!window.matchMedia("(min-width: 1024px)").matches) return;

    const scroller = contentScrollerRef.current;
    if (!scroller || programmaticScrollRef.current) return;

    const scrollerRect = scroller.getBoundingClientRect();
    const readingLine = scrollerRect.top + Math.min(136, scrollerRect.height * 0.22);
    const maxScroll = Math.max(0, scroller.scrollHeight - scroller.clientHeight);
    let currentProject: Project | undefined = projects[0];
    let currentSection = currentProject
      ? contentSectionRefs.current.get(currentProject.id)
      : undefined;
    let nearestDistance = Number.POSITIVE_INFINITY;

    if (scroller.scrollTop >= maxScroll - 1) {
      currentProject = projects.at(-1);
      currentSection = currentProject
        ? contentSectionRefs.current.get(currentProject.id)
        : undefined;
    } else {
      for (const project of projects) {
        const section = contentSectionRefs.current.get(project.id);
        if (!section) continue;
        const rect = section.getBoundingClientRect();
        const containsReadingLine =
          rect.top <= readingLine && rect.bottom > readingLine;
        const distance = containsReadingLine
          ? 0
          : Math.min(
              Math.abs(rect.top - readingLine),
              Math.abs(rect.bottom - readingLine),
            );
        if (distance < nearestDistance) {
          nearestDistance = distance;
          currentProject = project;
          currentSection = section;
        }
      }
    }

    if (!currentProject || !currentSection) return;
    const sectionRect = currentSection.getBoundingClientRect();
    const progress = Math.min(
      1,
      Math.max(0, (readingLine - sectionRect.top) / sectionRect.height),
    );
    const nextIndex = projects.findIndex(
      (project) => project.id === currentProject.id,
    );
    if (currentProject.id !== activeProject.id) {
      setNavigationDirection(nextIndex >= activeIndex ? 1 : -1);
      setActiveId(currentProject.id);
    }
    placeTickerWithinProject(currentProject.id, progress, "auto");

    if (scroller.scrollTop > 1 && scroller.scrollTop < maxScroll - 1) {
      edgeSoundArmedRef.current = true;
    }
  };

  const handleReadingBoundary = (event: React.WheelEvent<HTMLDivElement>) => {
    if (!window.matchMedia("(min-width: 1024px)").matches) return;

    const scroller = contentScrollerRef.current;
    if (!scroller || event.deltaY === 0) return;

    const maxScroll = Math.max(0, scroller.scrollHeight - scroller.clientHeight);
    const atTop = scroller.scrollTop <= 1;
    const atBottom = scroller.scrollTop >= maxScroll - 1;
    const pullingPastTop = atTop && event.deltaY < 0;
    const pullingPastBottom = atBottom && event.deltaY > 0;

    if (!pullingPastTop && !pullingPastBottom) {
      edgeSoundArmedRef.current = true;
      if (edgeFeedback) {
        edgeOffset.set(0);
        setEdgeFeedback(null);
      }
      return;
    }

    event.preventDefault();
    const edge = pullingPastTop ? "top" : "bottom";
    setEdgeFeedback(edge);

    const boundaryProject = pullingPastTop ? projects[0] : projects.at(-1);
    if (boundaryProject && boundaryProject.id !== activeProject.id) {
      const boundaryIndex = pullingPastTop ? 0 : projects.length - 1;
      setNavigationDirection(boundaryIndex >= activeIndex ? 1 : -1);
      setActiveId(boundaryProject.id);
      placeTickerWithinProject(
        boundaryProject.id,
        pullingPastTop ? 0 : 1,
        "auto",
      );
    }

    if (edgeSoundArmedRef.current) {
      edgeSoundArmedRef.current = false;
      playBoundarySound();
    }

    if (!reduceMotion) {
      const overshoot = Math.min(96, Math.abs(event.deltaY));
      const dimension = Math.max(1, scroller.clientHeight);
      const resisted =
        (overshoot * dimension * 0.42) /
        (dimension + 0.42 * overshoot);
      edgeOffset.set((pullingPastTop ? 1 : -1) * Math.min(16, resisted));
    }

    if (edgeReleaseTimerRef.current) {
      clearTimeout(edgeReleaseTimerRef.current);
    }
    edgeReleaseTimerRef.current = setTimeout(() => {
      edgeOffset.set(0);
      setEdgeFeedback(null);
      edgeReleaseTimerRef.current = null;
    }, 110);
  };

  if (!activeProject) return null;

  const activeIndex = projects.findIndex(
    (project) => project.id === activeProject.id,
  );
  return (
    <section className="relative isolate grid min-h-140 grid-rows-[minmax(0,1fr)_auto] lg:h-full lg:min-h-0">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={`initial-${activeProject.id}`}
          aria-hidden="true"
          initial={reduceMotion ? false : { opacity: 0, scale: 0.94, y: -12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, scale: 1.03, y: 10 }}
          transition={{
            duration: reduceMotion ? 0 : 0.35,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="pointer-events-none fixed -right-[0.04em] -top-[0.08em] z-0 select-none font-sans text-[clamp(18rem,42vw,38rem)] font-semibold leading-none tracking-[-0.1em] text-zinc-200/70 dark:text-zinc-800/50"
        >
          {activeProject.title.slice(0, 1)}
        </motion.span>
      </AnimatePresence>

      <div className="min-h-0 pb-5 lg:grid lg:grid-cols-[24rem_minmax(0,1fr)] lg:gap-x-12 lg:pr-[clamp(12rem,20vw,38rem)]">
        <article className="relative z-10 w-full max-w-none pr-3 sm:pr-6 lg:max-w-sm lg:px-1">
          <div className="absolute right-3 top-2 z-20 flex items-center gap-1 sm:right-6 lg:right-1">
            <button
              type="button"
              aria-label="Previous project"
              disabled={activeIndex <= 0}
              onClick={() => moveSelection(-1)}
              className="grid size-8 cursor-pointer place-items-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-950 focus:outline-none focus-visible:ring-1 focus-visible:ring-zinc-500 disabled:pointer-events-none disabled:opacity-20 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
            >
              <ArrowLeftIcon className="size-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Next project"
              disabled={activeIndex >= projects.length - 1}
              onClick={() => moveSelection(1)}
              className="grid size-8 cursor-pointer place-items-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-950 focus:outline-none focus-visible:ring-1 focus-visible:ring-zinc-500 disabled:pointer-events-none disabled:opacity-20 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
            >
              <ArrowRightIcon className="size-4" aria-hidden="true" />
            </button>
          </div>

          <div className="relative grid min-w-0 overflow-hidden pt-2">
            <AnimatePresence
              mode="sync"
              initial={false}
              custom={navigationDirection}
            >
              <motion.div
                key={activeProject.id}
                initial={
                  reduceMotion
                    ? false
                    : {
                        transform: `translateX(${navigationDirection > 0 ? 100 : -100}%)`,
                      }
                }
                animate={{ transform: "translateX(0%)" }}
                exit={
                  reduceMotion
                    ? { opacity: 0 }
                    : {
                        transform: `translateX(${navigationDirection > 0 ? -100 : 100}%)`,
                      }
                }
                transition={{
                  duration: reduceMotion ? 0 : 0.24,
                  ease: [0.645, 0.045, 0.355, 1],
                }}
                className="col-start-1 row-start-1 w-full will-change-transform"
              >
                <h3 className="pr-20 text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-100">
                  {activeProject.title}
                </h3>

                <p className="mt-6 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                  {activeProject.description}
                </p>

                {activeProject.tags?.length ? (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {activeProject.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-zinc-300 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.1em] text-zinc-500 dark:border-zinc-700 dark:text-zinc-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}

                {hasProjectLink(activeProject.link) ? (
                  <a
                    href={activeProject.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={playClickSound}
                    className="mt-8 inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-zinc-950 transition-opacity hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-600 dark:text-zinc-100"
                  >
                    View project
                    <ArrowUpRight className="size-3.5" aria-hidden="true" />
                  </a>
                ) : null}
              </motion.div>
            </AnimatePresence>
          </div>
        </article>

        <div className="relative z-10 mt-8 min-h-72 lg:-mx-4 lg:-mt-32 lg:h-[calc(100%+8rem)] lg:min-h-0">
          <div
            ref={contentScrollerRef}
            onScroll={syncTunerToReadingProgress}
            onWheel={handleReadingBoundary}
            className="h-full no-scrollbar [overflow-anchor:none] lg:overflow-y-auto lg:overscroll-contain lg:px-4 lg:pt-32"
          >
            <motion.div
              style={reduceMotion ? undefined : { y: edgeSpring }}
              className="hidden w-full lg:block"
            >
              {projects.map((project, index) => (
                <section
                  key={`project-receipt-${project.id}`}
                  ref={(element) => {
                    if (element) {
                      contentSectionRefs.current.set(project.id, element);
                    } else {
                      contentSectionRefs.current.delete(project.id);
                    }
                  }}
                  aria-label={`${project.title} project explanation`}
                  className={`w-full ${index === 0 ? "" : "mt-28"} pb-16`}
                >
                  <div className="flex h-[clamp(18rem,45vh,34rem)] min-h-72 items-center justify-center">
                    <ProjectPreview project={project} />
                  </div>

                  {project.content?.trim() ? (
                    <div className="project-notes-markdown mt-10 w-full px-[10%] [&_.markdown-body]:space-y-6 [&_.markdown-body_p]:!text-sm">
                      <MarkdownContent content={project.content} />
                    </div>
                  ) : null}
                </section>
              ))}
            </motion.div>

            <AnimatePresence
              mode="popLayout"
              initial={false}
              custom={navigationDirection}
            >
              <motion.div
                key={`project-body-mobile-${activeProject.id}`}
                custom={navigationDirection}
                initial={
                  reduceMotion
                    ? false
                    : { opacity: 0, x: navigationDirection * 14 }
                }
                animate={{ opacity: 1, x: 0 }}
                exit={
                  reduceMotion
                    ? undefined
                    : { opacity: 0, x: navigationDirection * -10 }
                }
                transition={{
                  duration: reduceMotion ? 0 : 0.22,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="w-full lg:hidden"
              >
                <div className="flex min-h-64 items-center justify-center">
                  <ProjectPreview project={activeProject} />
                </div>

                {activeProject.content?.trim() ? (
                  <div className="project-notes-markdown mt-10 w-full px-0 pb-12 [&_.markdown-body]:space-y-6 [&_.markdown-body_p]:!text-sm">
                    <MarkdownContent content={activeProject.content} />
                  </div>
                ) : null}
              </motion.div>
            </AnimatePresence>
          </div>

          <motion.div
            aria-hidden="true"
            initial={false}
            animate={{
              opacity: edgeFeedback === "top" ? 1 : 0,
              scaleY: edgeFeedback === "top" ? 1 : 0.55,
            }}
            transition={{ duration: reduceMotion ? 0 : 0.16, ease: "easeOut" }}
            className="pointer-events-none absolute inset-x-4 top-0 z-20 h-10 origin-top bg-gradient-to-b from-zinc-400/18 to-transparent shadow-[0_10px_28px_-22px_rgba(0,0,0,0.55)] dark:from-zinc-500/12"
          />
          <motion.div
            aria-hidden="true"
            initial={false}
            animate={{
              opacity: edgeFeedback === "bottom" ? 1 : 0,
              scaleY: edgeFeedback === "bottom" ? 1 : 0.55,
            }}
            transition={{ duration: reduceMotion ? 0 : 0.16, ease: "easeOut" }}
            className="pointer-events-none absolute inset-x-4 bottom-0 z-20 h-10 origin-bottom bg-gradient-to-t from-zinc-400/18 to-transparent shadow-[0_-10px_28px_-22px_rgba(0,0,0,0.55)] dark:from-zinc-500/12"
          />
        </div>
      </div>

      <nav
        aria-label="Choose a project"
        className="relative z-20 mx-auto hidden w-full max-w-3xl min-w-0 pt-4 lg:block"
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            moveSelection(-1);
          }
          if (event.key === "ArrowRight") {
            event.preventDefault();
            moveSelection(1);
          }
        }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 z-20 h-full w-px -translate-x-1/2 bg-amber-500"
        />
        <p className="pointer-events-none absolute left-1/2 top-0 z-30 -translate-x-1/2 -translate-y-full pb-1 font-mono text-[8px] uppercase tracking-[0.14em] text-zinc-500">
          Selected
        </p>
        <div
          ref={tunerRef}
          data-cursor-drag
          onScroll={() => {
            updateTunerStacks();
            if (
              programmaticScrollRef.current ||
              contentControlsTunerRef.current
            ) {
              lastTunerScrollLeftRef.current =
                tunerRef.current?.scrollLeft ?? lastTunerScrollLeftRef.current;
            } else {
              if (dragRef.current.active || tunerWheelActiveRef.current) {
                playTunerScrollSound();
              }
              updateActiveProjectAtTicker();
            }
          }}
          onWheel={() => {
            tunerWheelActiveRef.current = true;
            if (tunerWheelTimerRef.current) {
              clearTimeout(tunerWheelTimerRef.current);
            }
            tunerWheelTimerRef.current = setTimeout(() => {
              tunerWheelActiveRef.current = false;
              tunerWheelTimerRef.current = null;
            }, 140);
          }}
          onPointerDown={(event) => {
            if (event.pointerType === "mouse" && event.button !== 0) return;
            if (programmaticScrollRef.current) {
              clearTimeout(programmaticScrollRef.current);
              programmaticScrollRef.current = null;
            }
            lastTunerScrollLeftRef.current = event.currentTarget.scrollLeft;
            dragRef.current = {
              active: true,
              pointerId: event.pointerId,
              startX: event.clientX,
              startScrollLeft: event.currentTarget.scrollLeft,
              moved: false,
            };
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerMove={(event) => {
            const drag = dragRef.current;
            if (!drag.active || drag.pointerId !== event.pointerId) return;
            const distance = event.clientX - drag.startX;
            if (Math.abs(distance) > 3) drag.moved = true;
            event.currentTarget.scrollLeft = drag.startScrollLeft - distance;
          }}
          onPointerUp={(event) => {
            const drag = dragRef.current;
            if (!drag.active || drag.pointerId !== event.pointerId) return;
            ignoreNextClickRef.current = drag.moved;
            drag.active = false;
            event.currentTarget.releasePointerCapture(event.pointerId);
            window.setTimeout(() => {
              ignoreNextClickRef.current = false;
            }, 0);
          }}
          onPointerCancel={() => {
            dragRef.current.active = false;
          }}
          className="touch-pan-y select-none overflow-x-auto py-1 no-scrollbar [mask-image:linear-gradient(to_right,transparent_0,black_9%,black_91%,transparent_100%)]"
        >
          <div className="flex w-max min-w-full gap-1.5 px-[50%]">
            {projects.map((project, index) => {
              const active = project.id === activeProject.id;
              return (
                <motion.button
                  key={project.id}
                  ref={(element) => {
                    if (element) itemRefs.current.set(project.id, element);
                    else itemRefs.current.delete(project.id);
                  }}
                  type="button"
                  aria-current={active ? "true" : undefined}
                  onClick={() => {
                    if (ignoreNextClickRef.current) return;
                    selectProject(project);
                  }}
                  animate={{ scale: active && !reduceMotion ? 1.018 : 1 }}
                  transition={{ type: "spring", duration: 0.28, bounce: 0.08 }}
                  className={`group relative flex h-16 w-28 shrink-0 flex-col items-start justify-between rounded-lg border px-2.5 py-2 text-left transition-[border-color,background-color,opacity] will-change-transform focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 ${
                    active
                      ? "border-zinc-400 bg-white/90 opacity-100 dark:border-zinc-600 dark:bg-zinc-900/90"
                      : "border-zinc-200 bg-white/55 opacity-45 hover:opacity-80 focus-visible:opacity-100 dark:border-zinc-800 dark:bg-zinc-950/45"
                  }`}
                >
                  <span className="font-mono text-[8px] tabular-nums text-zinc-500">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="max-w-full truncate text-[10px] font-medium text-zinc-950 dark:text-zinc-100">
                    {project.title}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
        <TunerEdgeStack
          allProjects={projects}
          projects={edgeStackIds.left
            .map((id) => projects.find((project) => project.id === id))
            .filter((project): project is Project => Boolean(project))}
          side="left"
        />
        <TunerEdgeStack
          allProjects={projects}
          projects={edgeStackIds.right
            .map((id) => projects.find((project) => project.id === id))
            .filter((project): project is Project => Boolean(project))}
          side="right"
        />
      </nav>
    </section>
  );
}
