"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import { X } from "lucide-react";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowTopRightIcon,
} from "@radix-ui/react-icons";
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
} from "motion/react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import type { Work } from "@/data";
import { isVideoMedia, WorkMediaPreview } from "@/components/WorkMediaPreview";
import { PortfolioFooter } from "@/components/portfolio/PortfolioFooter";
import {
  PortfolioHeader,
  PortfolioUtilityControls,
} from "@/components/portfolio/PortfolioHeader";
import { SideNavigation } from "@/components/portfolio/SideNavigation";
import { useTheme } from "@/components/portfolio/useTheme";
import { hasInteractiveScribbleDemo } from "@/components/portfolio/scribble-demos/registry";
import {
  playScribbleCloseSound,
  playScribbleNavigateSound,
  playScribbleOpenSound,
} from "@/lib/uiSounds";

const ScribbleInteractionDemo = dynamic(
  () =>
    import("@/components/portfolio/scribble-demos/InteractionDemos").then(
      (module) => module.ScribbleInteractionDemo,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[min(78dvh,42rem)] w-full bg-zinc-950" />
    ),
  },
);

const morphTransition = {
  type: "spring" as const,
  duration: 0.3,
  bounce: 0,
};

const slideEase = [0.22, 1, 0.36, 1] as const;

const slideVariants = {
  enter: (direction: number) => ({
    x: `${direction * 100}%`,
  }),
  center: { x: 0 },
  exit: (direction: number) => ({
    x: `${direction * -100}%`,
  }),
};

const fadeVariants = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 0 },
};

function ScribbleMedia({
  work,
  className,
  priority,
}: {
  work: Work;
  className: string;
  priority: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(!work.mediaUrl);
  const isNearViewport = useInView(videoRef, { margin: "400px 0px" });

  useEffect(() => {
    if (!work.mediaUrl) {
      setLoaded(true);
      return;
    }

    const image = imageRef.current;
    const video = videoRef.current;
    setLoaded(
      Boolean(
        (image?.complete && image.naturalWidth > 0) ||
          (video && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA),
      ),
    );
  }, [work.mediaUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if ((priority || isNearViewport) && !reduceMotion) {
      void video.play().catch(() => undefined);
    } else {
      video.pause();
    }
  }, [isNearViewport, priority, reduceMotion]);

  if (!work.mediaUrl) {
    return <WorkMediaPreview work={work} className={className} />;
  }

  const loader = (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 bg-zinc-200 transition-opacity duration-200 dark:bg-zinc-900 ${
        loaded ? "opacity-0" : "opacity-100"
      }`}
    />
  );

  if (work.mediaType === "video" || isVideoMedia(work.mediaUrl)) {
    return (
      <>
        <video
          ref={videoRef}
          src={work.mediaUrl}
          width={work.mediaWidth}
          height={work.mediaHeight}
          aria-label={`${work.title} preview`}
          className={className}
          loop
          muted
          playsInline
          preload="auto"
          onLoadedData={() => setLoaded(true)}
        />
        {loader}
      </>
    );
  }

  return (
    <>
      {work.mediaWidth && work.mediaHeight ? (
        <Image
          ref={imageRef}
          src={work.mediaUrl}
          width={work.mediaWidth}
          height={work.mediaHeight}
          alt={`${work.title} preview`}
          className={className}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1536px) 33vw, 25vw"
          preload
          unoptimized={/\.gif(?:$|[?#])/i.test(work.mediaUrl)}
          onLoad={() => setLoaded(true)}
        />
      ) : (
        <img
          ref={imageRef}
          src={work.mediaUrl}
          alt={`${work.title} preview`}
          className={className}
          decoding="async"
          fetchPriority={priority ? "high" : "auto"}
          loading="eager"
          onLoad={() => setLoaded(true)}
        />
      )}
      {loader}
    </>
  );
}

function ScribbleCard({
  work,
  onOpen,
  priority,
}: {
  work: Work;
  onOpen: (work: Work, trigger: HTMLElement) => void;
  priority: boolean;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <article className="mb-2 inline-block w-full break-inside-avoid align-top">
      <a
        href={`/works/${work.id}`}
        id={`scribble-${work.id}`}
        aria-label={`${work.title} — open details`}
        onClick={(event) => {
          if (
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey
          ) {
            return;
          }
          event.preventDefault();
          onOpen(work, event.currentTarget);
        }}
        className="group block w-full cursor-zoom-in overflow-hidden rounded-[10px] border border-zinc-950/20 text-left focus:outline-none focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-amber-600 dark:border-white/20"
        aria-haspopup="dialog"
      >
        <span className="sr-only">{work.title}</span>
        <motion.span
          layoutId={`scribble-media-${work.id}`}
          transition={reduceMotion ? { duration: 0 } : morphTransition}
          className="relative block w-full overflow-hidden rounded-[9px] bg-zinc-200 dark:bg-zinc-900"
        >
          <ScribbleMedia
            work={work}
            priority={priority}
            className="block h-auto w-full object-contain transition-transform duration-300 ease-out group-hover:scale-[1.01] motion-reduce:transition-none"
          />
          <span
            aria-hidden="true"
            className="absolute inset-0 bg-black/[0.12] transition-opacity duration-200 ease-out group-hover:opacity-0 group-focus-visible:opacity-0 motion-reduce:transition-none"
          />
        </motion.span>
      </a>
    </article>
  );
}

function ScribblesMasonry({
  works,
  onOpen,
}: {
  works: Work[];
  onOpen: (work: Work, trigger: HTMLElement) => void;
}) {
  return (
    <section
      aria-label="All scribbles and designs"
      className="relative left-1/2 z-30 mt-12 w-[calc(100vw-1rem)] -translate-x-1/2 columns-1 gap-2 bg-[#fafafa] sm:columns-2 lg:mt-28 lg:columns-4 dark:bg-[#18181c]"
    >
      {works.map((work, index) => (
        <ScribbleCard
          key={work.id}
          work={work}
          priority={index < 12}
          onOpen={onOpen}
        />
      ))}
    </section>
  );
}

function DetailMedia({
  item,
  title,
}: {
  item: {
    url: string;
    mediaType: "image" | "video";
    alt?: string;
    width?: number;
    height?: number;
  } | null;
  title: string;
}) {
  if (!item) {
    return <div className="h-[min(78dvh,42rem)] w-full bg-zinc-950" />;
  }
  if (item.mediaType === "video" || isVideoMedia(item.url)) {
    return (
      <video
        src={item.url}
        width={item.width}
        height={item.height}
        aria-label={item.alt ?? `${title} video`}
        className="block h-auto w-full max-h-[min(88dvh,76rem)] object-contain"
        style={
          item.width && item.height ? undefined : { aspectRatio: "auto 4 / 3" }
        }
        controls
        autoPlay
        muted
        playsInline
        preload="metadata"
      />
    );
  }
  return (
    <img
      src={item.url}
      width={item.width}
      height={item.height}
      alt={item.alt ?? `${title} view`}
      className="block h-auto w-full max-h-[min(88dvh,76rem)] object-contain"
      style={
        item.width && item.height ? undefined : { aspectRatio: "auto 4 / 3" }
      }
      referrerPolicy="no-referrer"
    />
  );
}

function ScribbleModalBody({ work }: { work: Work }) {
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const media = [
    ...(work.mediaUrl
      ? [
          {
            url: work.mediaUrl,
            mediaType:
              work.mediaType === "video" || isVideoMedia(work.mediaUrl)
                ? ("video" as const)
                : ("image" as const),
            alt: `${work.title} preview`,
            width: work.mediaWidth,
            height: work.mediaHeight,
          },
        ]
      : []),
    ...(work.galleryMedia ?? []),
  ];
  const activeMedia = media[activeMediaIndex] ?? media[0] ?? null;
  const interactiveSlug = hasInteractiveScribbleDemo(work.id) ? work.id : null;

  return (
    <div className="flex w-full flex-col items-center">
      <h1 id="scribble-modal-title" className="sr-only">
        {work.title}
      </h1>
      <p id="scribble-modal-description" className="sr-only">
        {work.description}
      </p>
      <div className="flex w-full items-center justify-center overflow-hidden bg-zinc-950">
        {interactiveSlug ? (
          <ScribbleInteractionDemo slug={interactiveSlug} />
        ) : (
          <DetailMedia item={activeMedia} title={work.title} />
        )}
      </div>
      {!interactiveSlug && media.length > 1 ? (
        <div className="flex w-full justify-center overflow-x-auto border-t border-white/10 bg-zinc-950 px-3 py-2.5">
          <div className="flex w-fit gap-1.5">
            {media.map((item, index) => (
              <button
                key={`${item.url}-${index}`}
                type="button"
                aria-label={`Show ${item.alt ?? `${work.title} media ${index + 1}`}`}
                aria-pressed={index === activeMediaIndex}
                onClick={() => {
                  if (index === activeMediaIndex) return;
                  playScribbleNavigateSound();
                  setActiveMediaIndex(index);
                }}
                className={`h-14 w-20 shrink-0 cursor-pointer overflow-hidden rounded-sm border focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 ${
                  index === activeMediaIndex
                    ? "border-white opacity-100"
                    : "border-white/15 opacity-55 transition-opacity hover:opacity-100"
                }`}
              >
                {item.mediaType === "video" ? (
                  <video
                    src={item.url}
                    className="size-full object-cover"
                    muted
                    playsInline
                    preload="metadata"
                  />
                ) : (
                  <img
                    src={item.url}
                    alt=""
                    className="size-full object-cover"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function ScribbleModal({
  work,
  total,
  originSlug,
  navDirection,
  onClose,
  onNavigate,
  returnFocusRef,
}: {
  work: Work;
  total: number;
  originSlug: string;
  navDirection: number;
  onClose: () => void;
  onNavigate: (offset: number) => void;
  returnFocusRef: React.RefObject<HTMLElement | null>;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const isClosingRef = useRef(false);
  const onNavigateRef = useRef(onNavigate);
  const reduceMotion = useReducedMotion();
  onNavigateRef.current = onNavigate;

  const requestClose = useCallback(() => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    onClose();
  }, [onClose]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = requestAnimationFrame(() =>
      closeButtonRef.current?.focus({ preventScroll: true }),
    );

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        requestClose();
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        onNavigateRef.current(-1);
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        onNavigateRef.current(1);
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), video[controls], [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      returnFocusRef.current?.focus({ preventScroll: true });
    };
  }, [requestClose, returnFocusRef]);

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={
        reduceMotion ? { duration: 0 } : { duration: 0.2, ease: "easeOut" }
      }
      className="scribble-modal-backdrop fixed inset-0 z-90 flex overflow-y-auto bg-zinc-950/80 p-2 sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) requestClose();
      }}
    >
      <motion.div
        ref={dialogRef}
        layoutId={`scribble-media-${originSlug}`}
        transition={reduceMotion ? { duration: 0 } : morphTransition}
        role="dialog"
        aria-modal="true"
        aria-labelledby="scribble-modal-title"
        aria-describedby="scribble-modal-description"
        className="scribble-modal relative m-auto w-[min(96vw,96rem)] max-w-full overflow-hidden border border-white/15 bg-zinc-950 text-white"
      >
        <div className="absolute right-3 top-3 z-20 flex items-center gap-1.5">
          {work.link ? (
            <a
              href={work.link}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${work.title}`}
              className="grid size-10 place-items-center rounded-full border border-white/30 bg-zinc-950/75 text-white transition-colors hover:border-white/70 hover:bg-zinc-900 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
            >
              <ArrowTopRightIcon aria-hidden="true" className="size-4" />
            </a>
          ) : null}
          {total > 1 ? (
            <>
              <button
                type="button"
                onClick={() => {
                  playScribbleNavigateSound();
                  onNavigate(-1);
                }}
                aria-label="Previous design"
                className="grid size-10 cursor-pointer place-items-center rounded-full border border-white/30 bg-zinc-950/75 text-white transition-colors hover:border-white/70 hover:bg-zinc-900 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
              >
                <ArrowLeftIcon aria-hidden="true" className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  playScribbleNavigateSound();
                  onNavigate(1);
                }}
                aria-label="Next design"
                className="grid size-10 cursor-pointer place-items-center rounded-full border border-white/30 bg-zinc-950/75 text-white transition-colors hover:border-white/70 hover:bg-zinc-900 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
              >
                <ArrowRightIcon aria-hidden="true" className="size-4" />
              </button>
            </>
          ) : null}
          <button
            ref={closeButtonRef}
            type="button"
            onClick={requestClose}
            aria-label={`Close ${work.title}`}
            className="grid size-10 cursor-pointer place-items-center rounded-full border border-white/30 bg-zinc-950/75 text-white transition-colors hover:border-white/70 hover:bg-zinc-900 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        </div>

        <AnimatePresence initial={false} custom={navDirection} mode="popLayout">
          <motion.div
            key={work.id}
            custom={navDirection}
            variants={reduceMotion ? fadeVariants : slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={
              reduceMotion
                ? { duration: 0 }
                : { duration: 0.34, ease: slideEase }
            }
            className="w-full will-change-transform"
          >
            <ScribbleModalBody work={work} />
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

export function ScribblesPageClient({ works }: { works: Work[] }) {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const openedFromGridRef = useRef(false);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(() =>
    searchParams.get("scribble"),
  );
  const [originSlug, setOriginSlug] = useState<string | null>(() =>
    searchParams.get("scribble"),
  );
  const [navDirection, setNavDirection] = useState(0);
  const selectedIndex = selectedSlug
    ? works.findIndex((work) => work.id === selectedSlug)
    : -1;
  const selectedWork = works[selectedIndex] ?? null;

  useEffect(() => {
    const syncFromHistory = () => {
      const slug = new URL(window.location.href).searchParams.get("scribble");
      setSelectedSlug(slug);
      if (slug) setOriginSlug((current) => current ?? slug);
      else setOriginSlug(null);
      setNavDirection(0);
    };
    window.addEventListener("popstate", syncFromHistory);
    return () => window.removeEventListener("popstate", syncFromHistory);
  }, []);

  const updateScribbleUrl = useCallback(
    (slug: string | null, mode: "push" | "replace") => {
      const url = new URL(window.location.href);
      if (slug) url.searchParams.set("scribble", slug);
      else url.searchParams.delete("scribble");
      const nextUrl = `${url.pathname}${url.search}${url.hash}`;
      const state = { ...window.history.state };
      if (mode === "push") window.history.pushState(state, "", nextUrl);
      else window.history.replaceState(state, "", nextUrl);
    },
    [],
  );

  const setSelectedWork = useCallback(
    (work: Work, mode: "push" | "replace") => {
      setSelectedSlug(work.id);
      updateScribbleUrl(work.id, mode);
    },
    [updateScribbleUrl],
  );

  const openWork = useCallback(
    (work: Work, trigger: HTMLElement) => {
      playScribbleOpenSound();
      returnFocusRef.current = trigger;
      openedFromGridRef.current = true;
      setNavDirection(0);
      setOriginSlug(work.id);
      setSelectedWork(work, "push");
    },
    [setSelectedWork],
  );

  const closeWork = useCallback(() => {
    playScribbleCloseSound();
    setSelectedSlug(null);
    setNavDirection(0);
    if (openedFromGridRef.current) {
      openedFromGridRef.current = false;
      window.history.back();
      return;
    }
    updateScribbleUrl(null, "replace");
  }, [updateScribbleUrl]);

  const navigateWork = useCallback(
    (offset: number) => {
      if (works.length === 0 || selectedIndex < 0) return;
      const nextIndex = (selectedIndex + offset + works.length) % works.length;
      const next = works[nextIndex];
      if (!next) return;
      setNavDirection(offset);
      setSelectedWork(next, "replace");
    },
    [selectedIndex, setSelectedWork, works],
  );

  return (
    <div
      className="relative min-h-screen bg-[#fafafa] px-5 pb-5 pt-12 font-sans text-zinc-950 sm:px-6 md:pt-52 dark:bg-[#18181c] dark:text-zinc-400"
      data-theme-surface
    >
      <SideNavigation
        controls={
          <PortfolioUtilityControls theme={theme} onToggleTheme={toggleTheme} />
        }
      />
      <div className="mx-auto flex min-h-[calc(100dvh-4.25rem)] w-full max-w-2xl flex-col md:min-h-[calc(100dvh-6.25rem)]">
        <PortfolioHeader
          theme={theme}
          onToggleTheme={toggleTheme}
          onTitleClick={() =>
            router.push("/", { transitionTypes: ["instant"] })
          }
        />

        <main className="mt-16 md:mt-24">
          <header className="space-y-2">
            <h1 className="text-base font-instrument italic text-zinc-950 dark:text-zinc-50">
              Scribbles and Designs
            </h1>
            <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              Interface fragments, motion studies, experiments, and useful
              little ideas that never needed to become full websites.
            </p>
          </header>

          {works.length ? (
            <ScribblesMasonry works={works} onOpen={openWork} />
          ) : (
            <p className="mt-16 border-t border-zinc-200 py-8 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-500">
              The worktable is empty for now. New scribbles will appear here.
            </p>
          )}
        </main>

        <PortfolioFooter />
      </div>

      <AnimatePresence>
        {selectedWork && originSlug ? (
          <ScribbleModal
            work={selectedWork}
            total={works.length}
            originSlug={originSlug}
            navDirection={navDirection}
            onClose={closeWork}
            onNavigate={navigateWork}
            returnFocusRef={returnFocusRef}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
