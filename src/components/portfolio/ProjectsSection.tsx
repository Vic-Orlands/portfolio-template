"use client";

import { useState } from "react";
import { PlusIcon } from "@radix-ui/react-icons";
import { playClickSound } from "@/lib/uiSounds";
import type { Project } from "@/data";
import { ProjectIndex } from "@/components/portfolio/ProjectIndex";

type ProjectsSectionProps = {
  projects: Project[];
  isLoading?: boolean;
  onShowMore: () => void;
};

function ProjectsSkeleton() {
  return (
    <div aria-hidden="true">
      {Array.from({ length: 7 }).map((_, index) => (
        <div
          key={index}
          className="flex h-12 animate-pulse items-start gap-4 py-1"
        >
          <div className="h-4 w-36 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="mt-2 h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-4 w-10 rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
      ))}
    </div>
  );
}

export function ProjectsSection({
  projects,
  isLoading = false,
  onShowMore,
}: ProjectsSectionProps) {
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const visibleProjects = projects.slice(0, 7);

  if (!isLoading && projects.length === 0) return null;

  return (
    <section id="section-projects">
      <h2 className="mb-3 font-instrument italic text-base tracking-wide text-zinc-950 dark:text-zinc-50">
        Projects
      </h2>

      {isLoading ? (
        <ProjectsSkeleton />
      ) : (
        <ProjectIndex
          projects={visibleProjects}
          activeProject={activeProject}
          onActiveProjectChange={setActiveProject}
        />
      )}

      {!isLoading && projects.length > 7 && (
        <div
          className={`flex justify-start transition-[opacity,filter] duration-500 ease-in-out motion-reduce:transition-none ${
            activeProject
              ? "opacity-100 blur-none md:opacity-15 md:blur-[3px]"
              : "opacity-100 blur-none"
          }`}
        >
          <button
            onClick={() => {
              playClickSound();
              onShowMore();
            }}
            className="flex cursor-pointer items-center gap-1 mt-2 font-sans text-xs text-zinc-500 transition-colors hover:text-black hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-600 dark:hover:text-zinc-300"
          >
            <PlusIcon className="size-3" />
            All projects
          </button>
        </div>
      )}
    </section>
  );
}
