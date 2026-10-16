"use client";

import React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ChevronLeftIcon,
  SectionIcon,
  ListBulletIcon,
} from "@radix-ui/react-icons";
import type { Project } from "@/data";
import { ProjectIndex } from "@/components/portfolio/ProjectIndex";
import { ProjectNotesView } from "@/components/portfolio/ProjectNotesView";
import { playClickSound } from "@/lib/uiSounds";

interface DirectoryModalProps {
  projects: Project[];
  onClose: () => void;
  theme: "light" | "dark";
}

export const DirectoryModal: React.FC<DirectoryModalProps> = ({
  projects,
  onClose,
  theme,
}) => {
  const [activeProject, setActiveProject] = React.useState<string | null>(null);
  const [view, setView] = React.useState<"list" | "notes">("notes");
  const reduceMotion = useReducedMotion();

  React.useEffect(() => {
    const body = document.body;
    const root = document.documentElement;
    const scrollY = window.scrollY;
    const previous = {
      bodyOverflow: body.style.overflow,
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyWidth: body.style.width,
      rootOverflow: root.style.overflow,
    };

    root.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";

    return () => {
      root.style.overflow = previous.rootOverflow;
      body.style.overflow = previous.bodyOverflow;
      body.style.position = previous.bodyPosition;
      body.style.top = previous.bodyTop;
      body.style.width = previous.bodyWidth;
      window.scrollTo({ top: scrollY, behavior: "auto" });
    };
  }, []);

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reduceMotion ? undefined : { opacity: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.22, ease: "easeOut" }}
      className="fixed inset-0 z-50 flex items-stretch justify-center overflow-y-auto bg-white/70 p-4 backdrop-blur-md no-scrollbar sm:p-6 lg:overflow-hidden dark:bg-[#18181c]/70"
      id="directory-modal-overlay"
    >
      <motion.div
        initial={reduceMotion ? false : { y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={reduceMotion ? undefined : { y: 12, opacity: 0 }}
        transition={{
          duration: reduceMotion ? 0 : 0.28,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="flex min-h-0 w-full flex-col lg:h-full"
        id="directory-modal-content"
      >
        <motion.div
          layout="position"
          transition={{
            layout: {
              duration: reduceMotion ? 0 : 0.26,
              ease: [0.65, 0, 0.35, 1],
            },
          }}
          className={`relative z-40 w-full pt-1 lg:pt-0 ${
            view === "list" ? "lg:mx-auto lg:max-w-2xl lg:pt-16" : ""
          }`}
        >
          <motion.button
            initial="rest"
            whileHover="hover"
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className={`group flex cursor-pointer items-center gap-2 font-mono text-xs transition-colors focus:outline-none ${
              view === "notes" ? "mb-5" : "mb-8"
            } ${
              theme === "dark"
                ? "text-zinc-500 hover:text-zinc-300"
                : "text-zinc-500 hover:text-black"
            }`}
            id="directory-modal-back-btn"
          >
            <motion.span
              variants={{
                rest: { x: 0 },
                hover: {
                  x: [0, -4, 0],
                  transition: {
                    duration: reduceMotion ? 0 : 0.38,
                    ease: [0.16, 1, 0.3, 1],
                  },
                },
              }}
            >
              <ChevronLeftIcon className="size-3.5" />
            </motion.span>
            <span>back to home</span>
          </motion.button>

          <div
            className={`w-full ${view === "notes" ? "mb-10 max-w-none lg:max-w-sm" : "mb-6"} ${
              theme === "dark" ? "border-zinc-800/80" : "border-zinc-200"
            }`}
          >
            <div className="flex items-center justify-between gap-5">
              <h2
                className={`text-base font-sans ${
                  theme === "dark" ? "text-zinc-100" : "text-zinc-950"
                }`}
              >
                All Projects
              </h2>
              <div
                className="flex items-center gap-1.5"
                role="group"
                aria-label="Project view"
              >
                {[
                  {
                    id: "list" as const,
                    label: "List view",
                    Icon: ListBulletIcon,
                  },
                  {
                    id: "notes" as const,
                    label: "Project notes",
                    Icon: SectionIcon,
                  },
                ].map(({ id, label, Icon }) => {
                  const selected = view === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      title={label}
                      aria-label={label}
                      aria-pressed={selected}
                      onClick={() => {
                        playClickSound();
                        setView(id);
                        setActiveProject(null);
                      }}
                      className={`relative flex cursor-pointer items-center justify-center rounded-md p-0 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-600 ${
                        selected
                          ? "text-zinc-950 dark:text-zinc-100"
                          : "text-zinc-400 hover:text-zinc-700 dark:text-zinc-600 dark:hover:text-zinc-300"
                      }`}
                    >
                      <Icon className="size-3.5" aria-hidden="true" />
                      {selected ? (
                        <motion.span
                          layoutId="project-view-active-dot"
                          className="absolute -bottom-2 left-1/2 size-1 -translate-x-1/2 rounded-full bg-current"
                          transition={{
                            duration: reduceMotion ? 0 : 0.22,
                            ease: [0.16, 1, 0.3, 1],
                          }}
                        />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
            <p className="mt-1 text-xs font-mono text-zinc-500">
              Total projects: {projects.length}
            </p>
          </div>
        </motion.div>

        <div className="relative min-h-0 flex-1">
          <AnimatePresence initial={false}>
            {view === "list" ? (
              <motion.div
                key="project-list"
                initial={reduceMotion ? false : { opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, x: -8 }}
                transition={{
                  duration: reduceMotion ? 0 : 0.2,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="inset-0 mx-auto w-full max-w-2xl overflow-y-auto pb-12 no-scrollbar lg:absolute"
              >
                <ProjectIndex
                  projects={projects}
                  activeProject={activeProject}
                  onActiveProjectChange={setActiveProject}
                  idPrefix="modal-project"
                />
              </motion.div>
            ) : (
              <motion.div
                key="project-notes"
                initial={reduceMotion ? false : { opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, x: 8 }}
                transition={{
                  duration: reduceMotion ? 0 : 0.2,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="inset-0 min-h-0 lg:absolute"
              >
                <ProjectNotesView projects={projects} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};
