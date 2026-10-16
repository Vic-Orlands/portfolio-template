import React from "react";
import Link from "next/link";
import type { Work } from "@/data";
import { WorkMediaPreview } from "./WorkMediaPreview";

type WorkCardProps = {
  work: Work;
  href?: string;
  onClick?: () => void;
  showCategory?: boolean;
  showTechnologies?: boolean;
};

export const WorkCard: React.FC<WorkCardProps> = ({
  work,
  href,
  onClick,
  showCategory = true,
  showTechnologies = true,
}) => {
  const className =
    "group relative flex w-full cursor-pointer flex-col overflow-hidden rounded-lg bg-white text-left transition-colors duration-300 hover:bg-zinc-100/70 focus:outline-none dark:bg-zinc-900/40 dark:hover:bg-zinc-900/70";

  const content = (
    <>
      <div className="relative h-40 w-full overflow-hidden bg-zinc-950 sm:h-44">
        <WorkMediaPreview work={work} />
        {showCategory ? (
          <div className="absolute left-3 top-3 rounded bg-zinc-900/85 px-2 py-0.5 font-mono text-[9px] font-medium tracking-wider text-zinc-400 backdrop-blur-md">
            {work.category}
          </div>
        ) : null}
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-sans font-medium text-sm md:text-base text-black dark:text-zinc-200 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors truncate">
              <span className="block truncate">{work.title}</span>
            </h4>
            <span className="shrink-0 font-sans text-xs leading-relaxed tabular-nums text-zinc-500">
              {work.date}
            </span>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-2">
            {work.description}
          </p>
        </div>

        {showTechnologies && work.technologies?.length ? (
          <div className="flex flex-wrap items-center gap-1 pt-1">
            {work.technologies.slice(0, 3).map((tech) => (
              <span
                key={tech}
                className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-500"
              >
                {tech}
              </span>
            ))}
            {work.technologies.length > 3 && (
              <span className="font-mono text-[9px] text-zinc-400 dark:text-zinc-600 pl-0.5">
                +{work.technologies.length - 3}
              </span>
            )}
          </div>
        ) : null}
      </div>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        transitionTypes={["nav-forward"]}
        className={className}
        id={`work-card-${work.id}`}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={className}
      id={`work-card-${work.id}`}
    >
      {content}
    </button>
  );
};
