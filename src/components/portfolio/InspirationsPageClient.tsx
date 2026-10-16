"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Image from "next/image";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
} from "motion/react";
import { Check, Copy } from "lucide-react";
import { ArrowTopRightIcon } from "@radix-ui/react-icons";
import { PortfolioShell } from "@/components/portfolio/PortfolioShell";
import { PortfolioSocialLinks } from "@/components/portfolio/PortfolioSocialLinks";
import {
  InspirationModal,
  inspirationCardLayoutId,
} from "@/components/portfolio/InspirationModal";
import { InspirationOverviewPanel } from "@/components/portfolio/InspirationOverviewPanel";
import { InspirationSkillAvatar } from "@/components/portfolio/InspirationSkillAvatar";
import { InspirationViewToggle } from "@/components/portfolio/InspirationViewToggle";
import { siteConfig } from "@/lib/site";
import {
  categoryLabels,
  filterInspirationItems,
  inspirationCoverUrl,
  inspirationNavTabs,
  inspirationSidebarTabs,
  type InspirationItem,
  type InspirationNavId,
} from "@/lib/inspirations";
import {
  inspirationSkillDirectories,
  inspirationSkills,
  type InspirationSkill,
  type InspirationSkillDirectory,
} from "@/lib/inspirationSkills";
import { playClickSound } from "@/lib/uiSounds";
import { usePreloadImages } from "@/hooks/usePreloadImages";

const INTRO_COPY =
  "Sites I keep open for design inspo, writing, muse, etc. — my bookmark shelf";

function sectionTagline(section: InspirationNavId): string {
  return section === "reference"
    ? "People, studios, and references shaping how I think about design engineering"
    : INTRO_COPY;
}

function InspirationTabContent({
  children,
}: {
  section: InspirationNavId;
  children: ReactNode;
}) {
  return <div>{children}</div>;
}

function InspirationTagline({
  section,
  compact = false,
}: {
  section: InspirationNavId;
  compact?: boolean;
}) {
  const copy = sectionTagline(section);
  const [renderedCopy, setRenderedCopy] = useState(copy);
  const renderedCopyRef = useRef(copy);
  const [phase, setPhase] = useState<"idle" | "exit" | "enter">("idle");
  const swapTimerRef = useRef<number | null>(null);
  const enterFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (copy === renderedCopyRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      renderedCopyRef.current = copy;
      setRenderedCopy(copy);
      return;
    }

    const rawDuration = getComputedStyle(document.documentElement)
      .getPropertyValue("--text-swap-dur")
      .trim();
    const parsedDuration = Number.parseFloat(rawDuration);
    const duration = Number.isFinite(parsedDuration)
      ? rawDuration.endsWith("ms")
        ? parsedDuration
        : parsedDuration * 1000
      : 200;

    setPhase("exit");
    swapTimerRef.current = window.setTimeout(() => {
      renderedCopyRef.current = copy;
      setRenderedCopy(copy);
      setPhase("enter");
      enterFrameRef.current = requestAnimationFrame(() => {
        enterFrameRef.current = requestAnimationFrame(() => setPhase("idle"));
      });
    }, duration);

    return () => {
      if (swapTimerRef.current !== null) {
        window.clearTimeout(swapTimerRef.current);
      }
      if (enterFrameRef.current !== null) {
        cancelAnimationFrame(enterFrameRef.current);
      }
    };
  }, [copy]);

  return (
    <div
      className={
        compact
          ? "relative h-5 min-w-0 flex-1 overflow-hidden"
          : "relative h-6 w-full overflow-hidden max-md:h-10"
      }
    >
      <p
        className={`t-text-swap absolute inset-x-0 top-0 m-0 w-full ${
          phase === "exit"
            ? "is-exit"
            : phase === "enter"
              ? "is-enter-start"
              : ""
        } ${
          compact
            ? "whitespace-nowrap text-sm font-normal leading-tight text-zinc-400 dark:text-zinc-500"
            : "whitespace-nowrap text-sm leading-relaxed text-zinc-600 max-md:whitespace-normal dark:text-zinc-400"
        }`}
      >
        {renderedCopy}
      </p>
    </div>
  );
}

function useCopyInstall() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  const copyInstall = useCallback(async (key: string, command: string) => {
    try {
      await navigator.clipboard.writeText(command);
    } catch {
      return;
    }
    setCopiedKey(key);
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => setCopiedKey(null), 1600);
  }, []);

  return { copiedKey, copyInstall };
}

function SkillsPanel({
  compact = false,
  skills = inspirationSkills,
  directories = inspirationSkillDirectories,
}: {
  compact?: boolean;
  skills?: readonly InspirationSkill[];
  directories?: readonly InspirationSkillDirectory[];
}) {
  const { copiedKey, copyInstall } = useCopyInstall();

  if (!compact) {
    return (
      <div className="space-y-8 pt-2">
        <SkillsSection
          title="Interface"
          countLabel={`${skills.length} skills`}
          skills={skills}
          copiedKey={copiedKey}
          onCopyInstall={copyInstall}
        />
        <DirectoriesSection
          title="Find the skills here"
          countLabel={`${directories.length} catalogs`}
          directories={directories}
        />
      </div>
    );
  }

  return (
    <div className="pt-8 max-md:pt-0">
      <CompactSkillsSection
        title="Interface"
        countLabel={`${skills.length} skills`}
        skills={skills}
        copiedKey={copiedKey}
        onCopyInstall={copyInstall}
      />
      <CompactDirectoriesSection
        title="Find the skills here"
        countLabel={`${directories.length} catalogs`}
        directories={directories}
        className="mb-0"
      />
    </div>
  );
}

function SkillsSection({
  title,
  countLabel,
  skills,
  copiedKey,
  onCopyInstall,
}: {
  title: string;
  countLabel: string;
  skills: readonly InspirationSkill[];
  copiedKey: string | null;
  onCopyInstall: (key: string, command: string) => void;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50 flex items-baseline gap-2">
        {title}{" "}
        <span className="text-[10px] font-mono font-normal text-zinc-500">
          {countLabel}
        </span>
      </h2>
      {skills.map((skill) => {
        const copied = copiedKey === skill.name;
        return (
          <div
            key={skill.name}
            className="flex flex-col gap-2 border-b border-zinc-100 dark:border-zinc-800/40 py-3 sm:flex-row sm:items-center sm:gap-4"
          >
            <div className="min-w-0 flex-1">
              <a
                href={skill.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-zinc-950 dark:text-zinc-100 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
              >
                {skill.name}
              </a>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                {skill.description}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => onCopyInstall(skill.name, skill.install)}
                className="inline-flex items-center gap-1 text-[10px] font-mono text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                aria-label={
                  copied
                    ? "Install command copied"
                    : `Copy install for ${skill.name}`
                }
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400">
                      Copied
                    </span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    Install
                  </>
                )}
              </button>
            </div>
          </div>
        );
      })}
    </section>
  );
}

function DirectoriesSection({
  title,
  countLabel,
  directories,
}: {
  title: string;
  countLabel: string;
  directories: readonly InspirationSkillDirectory[];
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50 flex items-baseline gap-2">
        {title}{" "}
        <span className="text-[10px] font-mono font-normal text-zinc-500">
          {countLabel}
        </span>
      </h2>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 -mt-1">
        Places to find more skills worth installing.
      </p>
      {directories.map((directory) => (
        <div
          key={directory.url}
          className="flex flex-col gap-1 border-b border-zinc-100 dark:border-zinc-800/40 py-3 sm:flex-row sm:items-center sm:gap-4"
        >
          <div className="min-w-0 flex-1">
            <a
              href={directory.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-zinc-950 dark:text-zinc-100 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
            >
              {directory.name}
            </a>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
              {directory.description}
            </p>
          </div>
          <a
            href={directory.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-mono text-zinc-500 shrink-0 inline-flex items-center gap-1 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
          >
            Visit
            <ArrowTopRightIcon className="size-3" />
          </a>
        </div>
      ))}
    </section>
  );
}

function CompactSkillsSection({
  title,
  countLabel,
  skills,
  copiedKey,
  onCopyInstall,
  className = "",
}: {
  title: string;
  countLabel: string;
  skills: readonly InspirationSkill[];
  copiedKey: string | null;
  onCopyInstall: (key: string, command: string) => void;
  className?: string;
}) {
  return (
    <section className={`mb-[85px] max-md:mb-10 ${className}`}>
      <h2 className="mb-5 text-[15px] font-semibold text-zinc-950 dark:text-zinc-50">
        {title}{" "}
        <span className="ml-1 text-[13px] font-normal text-zinc-400">
          {countLabel}
        </span>
      </h2>
      {skills.map((skill) => {
        const copied = copiedKey === skill.name;
        return (
          <div
            key={skill.name}
            className="grid min-h-[53px] grid-cols-[minmax(310px,34%)_minmax(420px,1fr)_72px] items-center border-b border-zinc-200 text-[13px] text-zinc-500 dark:border-zinc-700/60 dark:text-zinc-400 max-[1050px]:grid-cols-[minmax(220px,40%)_1fr] max-md:grid-cols-[1fr_auto] max-md:py-2.5"
          >
            <div className="flex min-w-0 items-center gap-3 text-zinc-800 dark:text-zinc-200">
              <InspirationSkillAvatar kind={skill.kind} />
              <a
                href={skill.url}
                target="_blank"
                rel="noopener noreferrer"
                className="overflow-hidden text-ellipsis whitespace-nowrap font-semibold hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
              >
                {skill.name}
              </a>
            </div>
            <p className="m-0 overflow-hidden text-ellipsis whitespace-nowrap max-md:col-span-full max-md:pt-1 max-md:pl-11">
              {skill.description}
            </p>
            <button
              type="button"
              onClick={() => onCopyInstall(skill.name, skill.install)}
              className="inline-flex items-center gap-1.5 border-0 bg-transparent p-0 text-zinc-400 transition-colors hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-200 max-[1050px]:hidden cursor-pointer"
              aria-label={
                copied
                  ? "Install command copied"
                  : `Copy install for ${skill.name}`
              }
            >
              {copied ? (
                <>
                  <Check className="size-[15px] text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">
                    Copied
                  </span>
                </>
              ) : (
                <>
                  <Copy className="size-[15px]" />
                  Install
                </>
              )}
            </button>
          </div>
        );
      })}
    </section>
  );
}

function CompactDirectoriesSection({
  title,
  countLabel,
  directories,
  className = "",
}: {
  title: string;
  countLabel: string;
  directories: readonly InspirationSkillDirectory[];
  className?: string;
}) {
  return (
    <section className={`mb-[85px] max-md:mb-10 ${className}`}>
      <h2 className="mb-2 text-[15px] font-semibold text-zinc-950 dark:text-zinc-50">
        {title}{" "}
        <span className="ml-1 text-[13px] font-normal text-zinc-400">
          {countLabel}
        </span>
      </h2>
      <p className="mb-5 text-[13px] text-zinc-400">
        Places to find more skills worth installing.
      </p>
      {directories.map((directory) => (
        <div
          key={directory.url}
          className="grid min-h-[53px] grid-cols-[minmax(310px,34%)_minmax(420px,1fr)_72px] items-center border-b border-zinc-200 text-[13px] text-zinc-500 dark:border-zinc-700/60 dark:text-zinc-400 max-[1050px]:grid-cols-[minmax(220px,40%)_1fr] max-md:grid-cols-[1fr_auto] max-md:py-2.5"
        >
          <div className="flex min-w-0 items-center gap-3 text-zinc-800 dark:text-zinc-200">
            <InspirationSkillAvatar kind={directory.kind} />
            <a
              href={directory.url}
              target="_blank"
              rel="noopener noreferrer"
              className="overflow-hidden text-ellipsis whitespace-nowrap font-semibold hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
            >
              {directory.name}
            </a>
          </div>
          <p className="m-0 overflow-hidden text-ellipsis whitespace-nowrap max-md:col-span-full max-md:pt-1 max-md:pl-11">
            {directory.description}
          </p>
          <a
            href={directory.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-zinc-400 transition-colors hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-200 max-[1050px]:hidden"
          >
            Visit
            <ArrowTopRightIcon className="size-[15px]" />
          </a>
        </div>
      ))}
    </section>
  );
}

function filterItems(
  items: InspirationItem[],
  nav: InspirationNavId,
): InspirationItem[] {
  if (nav === "skills") return [];
  return filterInspirationItems(items, { category: nav });
}

function ListView({
  items,
  filter,
  onFilter,
  onOpenPanel,
}: {
  items: InspirationItem[];
  filter: InspirationNavId;
  onFilter: (id: InspirationNavId) => void;
  onOpenPanel: (url: string) => void;
}) {
  const reduceMotion = useReducedMotion();
  const visible = filter === "skills" ? [] : filterItems(items, filter);

  return (
    <PortfolioShell showHomeLink={false} showHeader animateHeaderLayout>
      <header className="space-y-3">
        <div className="flex items-start gap-4">
          <div className="min-w-0 flex-1 space-y-2">
            <motion.h1
              layoutId={reduceMotion ? undefined : "inspirations-title"}
              layout={reduceMotion ? false : "position"}
              transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
              className="text-base font-instrument italic text-zinc-950 dark:text-zinc-50"
            >
              Inspirations
            </motion.h1>
            <InspirationTagline section={filter} />
          </div>
        </div>
      </header>

      <div className="space-y-12">
        <div className="border-b border-zinc-100 dark:border-zinc-800/50 pb-4">
          <div
            className="flex flex-wrap gap-1.5"
            role="tablist"
            aria-label="Inspiration categories"
          >
            {inspirationNavTabs.map((cat) => {
              const active = filter === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  data-cursor-contrast
                  aria-selected={active}
                  onClick={() => onFilter(cat.id)}
                  className={`rounded-full px-3 py-1.5 text-[12px] font-medium tracking-[-0.01em] transition-colors cursor-pointer ${
                    active
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200/80 hover:text-zinc-900 dark:bg-zinc-800/60 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
            <p className="text-[10px] font-mono text-zinc-500 tabular-nums ml-auto self-center">
              {filter === "skills"
                ? `${inspirationSkills.length + inspirationSkillDirectories.length} skills`
                : `${visible.length} ${visible.length === 1 ? "link" : "links"}`}
            </p>
          </div>
        </div>

        <InspirationTabContent section={filter}>
          {filter === "skills" ? (
            <SkillsPanel />
          ) : visible.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400 py-8">
              No inspirations in this tab yet.
            </p>
          ) : (
            <ul className="divide-y divide-zinc-100 dark:divide-zinc-800/40">
              {visible.map((item) => {
                const opensPanel =
                  item.category === "design" || item.category === "tools";
                const content = (
                  <>
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="font-medium text-sm text-zinc-950 dark:text-zinc-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                          {item.name}
                        </span>
                        <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-zinc-400 dark:text-zinc-600">
                          {categoryLabels[item.category]}
                        </span>
                      </div>
                      <p className="text-xs md:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        {item.blurb}
                      </p>
                    </div>
                    <ArrowTopRightIcon className="mt-0.5 shrink-0 text-zinc-400 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-amber-500" />
                  </>
                );

                return (
                  <li key={item.url}>
                    {opensPanel ? (
                      <button
                        type="button"
                        onClick={() => onOpenPanel(item.url)}
                        className="group flex w-full items-start gap-3 py-4 text-left focus:outline-none cursor-pointer"
                      >
                        {content}
                      </button>
                    ) : (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex w-full items-start gap-3 py-4 text-left focus:outline-none"
                      >
                        {content}
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </InspirationTabContent>
      </div>
    </PortfolioShell>
  );
}

function GridView({
  items,
  section,
  onSection,
  gridMode,
  onToggleView,
  onOpen,
  modalOpen,
  originUrl,
}: {
  items: InspirationItem[];
  section: InspirationNavId;
  onSection: (id: InspirationNavId) => void;
  gridMode: boolean;
  onToggleView: () => void;
  onOpen: (url: string) => void;
  modalOpen: boolean;
  originUrl: string | null;
}) {
  const reduceMotion = useReducedMotion();
  const filtered = section === "skills" ? [] : filterItems(items, section);
  const sectionShowsCovers = section === "design" || section === "tools";
  const sectionLabel =
    inspirationSidebarTabs.find((t) => t.id === section)?.label ??
    "Inspirations";

  return (
    <div className="min-h-dvh overflow-x-clip bg-white text-[14px] text-zinc-800 font-sans dark:bg-zinc-950 dark:text-zinc-200">
      <div className="pointer-events-none fixed inset-y-0 left-[59px] z-3 w-px bg-zinc-200 dark:bg-zinc-700 max-md:hidden" />

      <aside className="fixed inset-y-0 left-[60px] z-80 flex w-[268px] flex-col bg-white px-3.5 pt-[17px] pb-5 dark:bg-zinc-950 max-[1050px]:left-px max-[1050px]:w-[210px] max-md:relative max-md:inset-auto max-md:left-0 max-md:h-auto max-md:w-full max-md:border-b max-md:border-zinc-200 max-md:p-[18px] dark:max-md:border-zinc-800">
        <div
          className="mb-8 max-md:mb-[18px]"
          style={{ viewTransitionName: "site-identity" }}
        >
          <motion.div
            layoutId={reduceMotion ? undefined : "inspirations-site-name"}
            layout={reduceMotion ? false : "position"}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2 className="flex h-[25px] items-center text-xl font-semibold text-zinc-950 dark:text-zinc-50">
              <a
                href="/"
                className="hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors focus:outline-none"
                aria-label={siteConfig.name}
              >
                {siteConfig.name}
              </a>
            </h2>
          </motion.div>
          <motion.div
            layoutId={reduceMotion ? undefined : "inspirations-site-email"}
            layout={reduceMotion ? false : "position"}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
          >
            <a
              href={`mailto:${siteConfig.author.email}`}
              className="block text-xs font-sans text-zinc-500 hover:text-zinc-800 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors"
              title="Email Me"
            >
              {siteConfig.author.email}
            </a>
          </motion.div>
        </div>

        <nav
          aria-label="Inspiration sections"
          className="flex flex-col items-start max-md:flex-row max-md:gap-4 max-md:overflow-x-auto"
        >
          {inspirationSidebarTabs.map((link) => {
            const active = section === link.id;
            return (
              <button
                key={link.id}
                type="button"
                className={`flex min-h-[27px] items-center gap-1.5 border-0 bg-transparent p-0 text-sm leading-none cursor-pointer focus:outline-none focus-visible:outline-1 focus-visible:outline-zinc-500 focus-visible:outline-offset-2 ${
                  active
                    ? "font-medium text-zinc-900 dark:text-zinc-100"
                    : "text-zinc-500 dark:text-zinc-500"
                }`}
                onClick={() => onSection(link.id)}
              >
                {link.label}
                {active && (
                  <span
                    className="size-[5px] rounded-full bg-zinc-950 dark:bg-zinc-50"
                    aria-hidden
                  />
                )}
              </button>
            );
          })}
        </nav>

        <small className="mt-auto text-xs text-zinc-400 dark:text-zinc-500 max-md:hidden">
          © {new Date().getFullYear()} {siteConfig.name}
        </small>
      </aside>

      <main className="min-h-dvh ml-[328px] pr-[76px] pt-2 pb-10 max-[1050px]:ml-[230px] max-[1050px]:pr-[30px] max-md:ml-0 max-md:p-[18px]">
        <header className="mb-2 max-w-2xl">
          <motion.h1
            layoutId={reduceMotion ? undefined : "inspirations-title"}
            layout={reduceMotion ? false : "position"}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            className="text-base font-instrument italic text-zinc-950 dark:text-zinc-50"
          >
            Inspirations
          </motion.h1>
        </header>

        <div className="mb-4 flex items-start gap-2.5 max-md:flex-wrap">
          <h2 className="m-0 shrink-0 text-sm font-semibold leading-tight text-zinc-900 dark:text-zinc-100 max-md:w-auto">
            {sectionLabel}
          </h2>
          <InspirationTagline section={section} compact />
          <motion.div
            layoutId={reduceMotion ? undefined : "inspirations-toggle"}
            layout={reduceMotion ? false : "position"}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
          >
            <InspirationViewToggle
              gridMode={gridMode}
              onToggle={onToggleView}
              className="-mt-1.5 ml-1"
            />
          </motion.div>
          <PortfolioSocialLinks
            className="ml-auto max-md:ml-0 max-md:w-full"
            layoutId="inspirations-site-social-links"
          />
        </div>

        <motion.div
          layoutId={reduceMotion ? undefined : "inspirations-content"}
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: { duration: reduceMotion ? 0 : 0.14, ease: "easeOut" },
          }}
          transition={{
            layout: {
              duration: reduceMotion ? 0 : 0.22,
              ease: [0.22, 1, 0.36, 1],
            },
            opacity: { duration: reduceMotion ? 0 : 0.2, ease: "easeOut" },
          }}
        >
          <div
            className={`min-h-[calc(100dvh-57px)] will-change-transform transition-transform duration-300 ease-[cubic-bezier(0.645,0.045,0.355,1)] motion-reduce:transition-none ${
              modalOpen
                ? "translate-x-[330px] max-[1050px]:translate-x-[310px] max-md:translate-x-0"
                : "translate-x-0"
            }`}
          >
            <InspirationTabContent section={section}>
              {section === "skills" ? (
                <SkillsPanel compact />
              ) : filtered.length === 0 ? (
                <p className="text-sm text-zinc-500 dark:text-zinc-400 py-8">
                  No inspirations in this tab yet.
                </p>
              ) : (
                <div className="grid grid-cols-4 gap-3 max-[1050px]:grid-cols-2 max-md:grid-cols-1">
                  {filtered.map((item, index) => {
                    const showCovers =
                      sectionShowsCovers ||
                      (section === "all" &&
                        (item.category === "design" ||
                          item.category === "tools"));
                    return (
                      <button
                        key={item.url}
                        type="button"
                        className={`relative isolate block overflow-hidden p-0 aspect-341/213 focus:outline-none focus-visible:outline-1 focus-visible:outline-zinc-500 focus-visible:outline-offset-2 ${
                          showCovers
                            ? "cursor-pointer border border-zinc-950/[0.03] bg-zinc-100 dark:border-white/5 dark:bg-zinc-800"
                            : "cursor-pointer border border-zinc-200 bg-zinc-100 text-left dark:border-zinc-700 dark:bg-zinc-900"
                        }`}
                        onClick={() => onOpen(item.url)}
                        aria-label={`Open ${item.name}`}
                      >
                        {showCovers ? (
                          <motion.span
                            className="absolute inset-0 block overflow-hidden bg-zinc-100 dark:bg-zinc-800"
                            layoutId={inspirationCardLayoutId(item.url)}
                            style={{
                              visibility:
                                modalOpen && originUrl === item.url
                                  ? "hidden"
                                  : "visible",
                            }}
                          >
                            <Image
                              src={inspirationCoverUrl(item)}
                              alt=""
                              fill
                              sizes="(max-width: 768px) 100vw, (max-width: 1050px) 50vw, 25vw"
                              preload={index < 4}
                              unoptimized={/\.gif(?:$|[?#])/i.test(
                                inspirationCoverUrl(item),
                              )}
                              draggable={false}
                              className="absolute inset-0 size-full max-w-none object-cover object-top opacity-0 transition-opacity duration-200 ease-out select-none motion-reduce:transition-none"
                              onLoad={(event) => {
                                event.currentTarget.classList.remove(
                                  "opacity-0",
                                );
                              }}
                            />
                          </motion.span>
                        ) : (
                          <span className="absolute inset-0 flex flex-col p-[22px]">
                            <strong className="text-[15px] font-semibold tracking-[-0.02em] text-zinc-900 dark:text-zinc-100">
                              {item.name}
                            </strong>
                            <span className="mt-2.5 max-w-[32ch] text-[13px] leading-relaxed text-zinc-500 dark:text-zinc-400">
                              {item.blurb}
                            </span>
                            <small className="mt-auto text-[11px] uppercase tracking-[0.08em] text-zinc-400 dark:text-zinc-500">
                              {item.kind}
                            </small>
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </InspirationTabContent>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

export function InspirationsPageClient({
  items,
}: {
  items: InspirationItem[];
}) {
  const [nav, setNav] = useState<InspirationNavId>("all");
  const [activeUrl, setActiveUrl] = useState<string | null>(null);
  const coverUrls = useMemo(
    () => items.map((item) => inspirationCoverUrl(item)),
    [items],
  );

  usePreloadImages(coverUrls);

  const closeModal = useCallback(() => {
    setActiveUrl(null);
  }, []);

  const openModal = useCallback((url: string) => {
    playClickSound();
    setActiveUrl(url);
  }, []);

  const changeNav = useCallback((id: InspirationNavId) => {
    playClickSound();
    setActiveUrl(null);
    setNav(id);
  }, []);

  const activeItem = activeUrl
    ? items.find((item) => item.url === activeUrl)
    : null;
  const panelCategory =
    activeItem?.category === "design" || activeItem?.category === "tools"
      ? activeItem.category
      : null;
  const listPanelItems = panelCategory ? filterItems(items, panelCategory) : [];
  const listPanelSelected = activeUrl
    ? Math.max(
        0,
        listPanelItems.findIndex((item) => item.url === activeUrl),
      )
    : 0;

  return (
    <LayoutGroup id="inspirations-page">
      <div className="relative isolate">
        <ListView
          items={items}
          filter={nav}
          onFilter={changeNav}
          onOpenPanel={openModal}
        />
        <InspirationOverviewPanel
          open={activeUrl !== null && listPanelItems.length > 0}
          items={listPanelItems}
          selected={listPanelSelected}
          onClose={closeModal}
          onChange={(index) => {
            if (listPanelItems.length === 0) return;
            const normalized =
              (index + listPanelItems.length) % listPanelItems.length;
            setActiveUrl(listPanelItems[normalized]?.url ?? null);
          }}
        />
      </div>
    </LayoutGroup>
  );
}
