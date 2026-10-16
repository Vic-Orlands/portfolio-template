"use client";

import Link from "next/link";
import { FileTextIcon, PlusIcon } from "@radix-ui/react-icons";
import { playClickSound } from "@/lib/uiSounds";
import type { Series } from "@/data";

type SeriesSectionProps = {
  series: Series[];
  isLoading?: boolean;
};

function formatSeriesDate(value: string) {
  const date = value.trim();
  const iso = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(date);

  if (iso) {
    const [, year, month, day] = iso;
    const monthName = new Intl.DateTimeFormat("en-US", {
      month: "short",
    }).format(new Date(Number(year), Number(month) - 1, 1));

    return day
      ? `${monthName} ${Number(day)}, ${year}`
      : `${monthName} ${year}`;
  }

  return date;
}

function SeriesSkeleton() {
  return (
    <div className="space-y-2" aria-hidden="true">
      {Array.from({ length: 7 }).map((_, index) => (
        <div key={index} className="animate-pulse py-3">
          <div className="flex items-center gap-2">
            <div className="size-4 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-4 w-40 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-3 w-12 rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="ml-auto h-3 w-20 rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>
          <div className="mt-2 h-3 w-4/5 rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
      ))}
    </div>
  );
}

export function SeriesSection({
  series,
  isLoading = false,
}: SeriesSectionProps) {
  if (!isLoading && series.length === 0) return null;

  return (
    <section id="section-series">
      <h2 className="text-base font-instrument italic text-zinc-950 dark:text-zinc-50">
        Series
      </h2>

      {isLoading ? (
        <SeriesSkeleton />
      ) : (
        <div className="group/series space-y-2">
          {series.slice(0, 7).map((seriesItem) => {
            const partCount = seriesItem.parts?.length ?? 0;

            return (
              <Link
                key={seriesItem.id}
                href={`/series/${seriesItem.id}`}
                transitionTypes={["nav-forward"]}
                className="group relative block py-3 transition-opacity duration-200 ease-out group-hover/series:opacity-40 hover:opacity-100! focus-visible:opacity-100! focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-600 before:absolute before:-inset-x-4 before:inset-y-0 before:rounded-xl before:bg-zinc-500/0 before:transition-colors before:duration-300 hover:before:bg-zinc-500/5 motion-reduce:transition-none md:before:-inset-x-6 dark:hover:before:bg-zinc-800/20"
                id={`series-${seriesItem.id}`}
              >
                <div className="relative z-10">
                  <div className="flex min-w-0 items-baseline gap-2">
                    <FileTextIcon
                      aria-hidden="true"
                      className="size-4 shrink-0 self-center text-zinc-500 transition-colors duration-300 group-hover:text-amber-600 dark:text-zinc-500 dark:group-hover:text-amber-400"
                    />
                    <h3 className="min-w-0 truncate font-sans text-sm font-medium text-zinc-950 transition-colors duration-300 group-hover:text-amber-700 md:text-base dark:text-zinc-100 dark:group-hover:text-amber-400">
                      {seriesItem.title}
                    </h3>
                    <span className="shrink-0 font-mono text-[10px] tabular-nums text-zinc-400 dark:text-zinc-600">
                      {partCount} {partCount === 1 ? "part" : "parts"}
                    </span>
                    <time className="ml-auto shrink-0 font-sans text-xs leading-relaxed tabular-nums text-zinc-500">
                      {formatSeriesDate(seriesItem.date)}
                    </time>
                  </div>

                  <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-zinc-600 md:text-sm dark:text-zinc-400">
                    {seriesItem.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {!isLoading && series.length > 7 && (
        <div className="flex justify-start pt-4">
          <Link
            href="/series"
            onClick={playClickSound}
            transitionTypes={["nav-forward"]}
            className="flex items-center gap-1 font-sans text-xs text-zinc-500 hover:text-black hover:underline focus:outline-none dark:hover:text-zinc-300"
          >
            <PlusIcon className="size-3" />
            <span>More Series</span>
          </Link>
        </div>
      )}
    </section>
  );
}
