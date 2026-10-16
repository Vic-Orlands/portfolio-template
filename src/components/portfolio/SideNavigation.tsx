"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ContentHeading } from "@/lib/contentHeadings";
import { openProjectsModalOnHome, requestHomeFocus } from "@/lib/homeFocus";
import { playClickSound } from "@/lib/uiSounds";

const links = [
  ["Home", "/"],
  ["Projects", "/"],
  ["Writings", "/writings"],
  ["Series", "/series"],
  ["Scribbles", "/scribbles"],
  ["Inspirations", "/inspirations"],
] as const;

const INDENT_PX = 12;

type SideNavigationProps = {
  outline?: ContentHeading[];
  embedded?: boolean;
  hidden?: boolean;
  controls?: ReactNode;
};

function navLinkClass(active: boolean, embedded: boolean, outline = false) {
  return [
    "block py-0.5 leading-[1.4] text-zinc-500 no-underline",
    "origin-left transition-[color,opacity,transform] duration-200 ease-out",
    "group-hover/sidebar:opacity-45 hover:scale-[1.02]! hover:opacity-100!",
    "hover:text-zinc-900 focus-visible:scale-[1.02] focus-visible:opacity-100! dark:hover:text-zinc-200",
    "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-600",
    "motion-reduce:transition-none",
    outline ? "text-xs" : "text-sm",
    embedded ? "min-h-5" : "min-h-6",
    active ? "opacity-100 text-zinc-950 dark:text-zinc-100" : "opacity-70",
  ]
    .filter(Boolean)
    .join(" ");
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function scrollToHeading(id: string) {
  const target = document.getElementById(id);
  if (!target) return false;
  const top = target.getBoundingClientRect().top + window.scrollY - 88;
  window.scrollTo({
    top: Math.max(0, top),
    behavior: prefersReducedMotion() ? "auto" : "smooth",
  });
  return true;
}

/** Indent depth from heading level — same level always shares the same offset. */
function indentForLevel(level: number, minLevel: number) {
  return Math.max(0, level - minLevel) * INDENT_PX;
}

export function SideNavigation({
  outline,
  embedded = false,
  hidden = false,
  controls,
}: SideNavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  const outlineListRef = useRef<HTMLOListElement>(null);
  const outlineKey = useMemo(
    () =>
      outline?.map((heading) => `${heading.id}:${heading.level}`).join("|") ??
      "",
    [outline],
  );
  const [activeHeading, setActiveHeading] = useState(outline?.[0]?.id ?? "");
  useEffect(() => {
    const paths = Array.from(
      new Set(links.map(([, href]) => href.split("#")[0] || "/")),
    ).filter((path) => path !== pathname);
    const timeout = window.setTimeout(() => {
      paths.forEach((path) => router.prefetch(path));
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [pathname, router]);

  const minLevel = useMemo(() => {
    if (!outline?.length) return 1;
    return Math.min(...outline.map((heading) => heading.level));
  }, [outlineKey]);

  useEffect(() => {
    if (!outline?.length) return;
    setActiveHeading(outline[0]?.id ?? "");
  }, [outlineKey]);

  useEffect(() => {
    if (!outline?.length) return;

    let cancelled = false;
    let rafId = 0;
    let attempts = 0;
    let elements: HTMLElement[] = [];

    const updateActiveHeading = () => {
      rafId = 0;
      if (!elements.length) return;

      const viewportAnchor = Math.min(window.innerHeight * 0.28, 240);
      let nextHeading = elements[0]?.id ?? "";

      for (const element of elements) {
        if (element.getBoundingClientRect().top > viewportAnchor) break;
        nextHeading = element.id;
      }

      const pageBottom = window.scrollY + window.innerHeight;
      if (pageBottom >= document.documentElement.scrollHeight - 2) {
        nextHeading = elements.at(-1)?.id ?? nextHeading;
      }

      setActiveHeading((current) =>
        current === nextHeading ? current : nextHeading,
      );
    };

    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(updateActiveHeading);
    };

    const connect = () => {
      if (cancelled) return;
      elements = outline
        .map((heading) => document.getElementById(heading.id))
        .filter((element): element is HTMLElement => Boolean(element));

      // After client nav / view transitions, headings may not be mounted yet.
      if (!elements.length && attempts < 30) {
        attempts += 1;
        rafId = requestAnimationFrame(connect);
        return;
      }
      if (!elements.length) return;
      updateActiveHeading();
    };

    connect();
    const retryTimer = window.setTimeout(connect, 200);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      window.clearTimeout(retryTimer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [outline, outlineKey]);

  useEffect(() => {
    const list = outlineListRef.current;
    if (!list || !activeHeading) return;

    const activeItem = Array.from(
      list.querySelectorAll<HTMLElement>("[data-heading-id]"),
    ).find((item) => item.dataset.headingId === activeHeading);
    if (!activeItem) return;

    const listRect = list.getBoundingClientRect();
    const itemRect = activeItem.getBoundingClientRect();
    let offset = 0;
    if (itemRect.top < listRect.top) offset = itemRect.top - listRect.top;
    if (itemRect.bottom > listRect.bottom) {
      offset = itemRect.bottom - listRect.bottom;
    }
    if (!offset) return;

    list.scrollTo({
      top: list.scrollTop + offset,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  }, [activeHeading]);

  const visibilityClass = hidden
    ? "pointer-events-none opacity-0"
    : "opacity-100";

  const embeddedClassName = [
    "mb-[22px] border-b border-zinc-200 pb-5 dark:border-zinc-500/35",
    "transition-opacity duration-200",
    visibilityClass,
  ].join(" ");

  // Do not share view-transition-name with the site Index nav — morphing
  // Index ↔ outline leaves a non-interactive VT layer until hard reload.
  const fixedClassName = [
    "fixed z-20",
    "max-[1120px]:hidden",
    "transition-opacity duration-200 motion-reduce:transition-none",
    visibilityClass,
  ].join(" ");

  const fixedOutlineClassName = [
    fixedClassName,
    "top-52 w-[260px] left-[max(22px,calc(50vw-650px))]",
  ].join(" ");

  const fixedIndexClassName = [
    fixedClassName,
    "top-52 w-fit left-[max(22px,calc(50vw-600px))]",
    "[view-transition-name:side-navigation]",
  ].join(" ");

  const listClassName = "flex flex-col gap-0";

  if (outline?.length) {
    return (
      <aside
        className={`group/sidebar ${embedded ? embeddedClassName : fixedOutlineClassName}`}
        aria-label="On this page"
      >
        <ol
          ref={outlineListRef}
          className={`${listClassName} max-h-[min(68dvh,620px)] list-none overflow-y-auto scrollbar-none`}
        >
          {outline.map((heading) => (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                className={navLinkClass(
                  activeHeading === heading.id,
                  embedded,
                  true,
                )}
                data-heading-id={heading.id}
                aria-current={
                  activeHeading === heading.id ? "location" : undefined
                }
                onClick={(event) => {
                  playClickSound();
                  event.preventDefault();
                  setActiveHeading(heading.id);
                  window.history.replaceState(null, "", `#${heading.id}`);

                  if (scrollToHeading(heading.id)) return;

                  // Headings can lag one frame behind after client navigation.
                  requestAnimationFrame(() => {
                    if (scrollToHeading(heading.id)) return;
                    window.setTimeout(() => scrollToHeading(heading.id), 120);
                  });
                }}
              >
                <span
                  className="block min-w-0"
                  style={{
                    paddingLeft: indentForLevel(heading.level, minLevel),
                  }}
                >
                  {heading.label}
                </span>
              </a>
            </li>
          ))}
        </ol>
        {controls}
      </aside>
    );
  }

  return (
    <aside
      className={`group/sidebar ${embedded ? embeddedClassName : fixedIndexClassName}`}
      aria-label="Portfolio navigation"
    >
      <nav className="flex w-fit flex-col items-start gap-0">
        {links.map(([label, href]) => {
          const targetPath = href.split("#")[0] || "/";
          const isProjects = label === "Projects";
          const active = isProjects
            ? false
            : targetPath === "/"
              ? pathname === "/"
              : pathname === targetPath ||
                pathname.startsWith(`${targetPath}/`);
          return (
            <Link
              key={label}
              href={href}
              prefetch
              transitionTypes={["instant"]}
              className={navLinkClass(active, embedded)}
              onClick={(event) => {
                playClickSound();
                if (isProjects) {
                  event.preventDefault();
                  if (pathname === "/") {
                    openProjectsModalOnHome();
                    return;
                  }
                  // Instant VT — avoid page-fade flicker before the modal opens.
                  requestHomeFocus("projects-modal");
                  router.push("/", {
                    scroll: false,
                    transitionTypes: ["instant"],
                  });
                }
              }}
            >
              {label}
            </Link>
          );
        })}
      </nav>
      {controls}
    </aside>
  );
}
