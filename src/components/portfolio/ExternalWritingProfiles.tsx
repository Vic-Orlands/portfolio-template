import { ArrowTopRightIcon } from "@radix-ui/react-icons";
import { siteConfig } from "@/lib/site";

const publications = siteConfig.publications;

export function ExternalWritingProfiles() {
  return (
    <section aria-labelledby="published-elsewhere" className="space-y-3">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2
            id="published-elsewhere"
            className="font-sans text-xs font-medium text-zinc-950 dark:text-zinc-100"
          >
            Published elsewhere
          </h2>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">
            Selected writing for engineering publications.
          </p>
        </div>
        <span className="shrink-0 font-instrument italic text-xs tracking-wide text-zinc-400 dark:text-zinc-600">
          External
        </span>
      </div>

      <div className="divide-y divide-zinc-200/70 border-y border-zinc-200/70 dark:divide-zinc-800 dark:border-zinc-800">
        {publications.map((publication) => (
          <a
            key={publication.name}
            href={publication.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-3.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-600"
            aria-label={`${publication.linkLabel} on ${publication.name} (opens in a new tab)`}
          >
            <span className="flex min-w-0 items-center gap-3">
              <span className="flex shrink-0 items-center gap-2.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={publication.logo}
                  alt=""
                  width={18}
                  height={18}
                  className={`size-4.5 rounded-[3px] ${publication.logoClass}`}
                />
                <strong className="font-sans text-sm font-medium text-zinc-950 transition-colors group-hover:text-amber-700 dark:text-zinc-100 dark:group-hover:text-amber-400">
                  {publication.name}
                </strong>
              </span>
              <span className="hidden min-w-0 truncate text-xs text-zinc-500 sm:block">
                {publication.description}
              </span>
            </span>

            <span className="flex items-center gap-2 text-right">
              <span className="hidden font-mono text-[10px] text-zinc-400 md:block dark:text-zinc-600">
                {publication.domain}
              </span>
              <ArrowTopRightIcon
                aria-hidden="true"
                className="size-3.5 text-zinc-400 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-zinc-700 motion-reduce:transition-none dark:group-hover:text-zinc-200"
              />
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
