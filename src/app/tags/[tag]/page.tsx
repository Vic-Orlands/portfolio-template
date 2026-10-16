import type { Metadata } from "next";
import Link from "next/link";
import { PortfolioShell } from "@/components/portfolio/PortfolioShell";
import { getContentRepository } from "@/lib/content";
import { formatTag, normalizeTag } from "@/lib/tags";
import { absoluteUrl, siteConfig } from "@/lib/site";
import { hasProjectLink } from "@/lib/projectLink";
import { parseBlogDate } from "@/lib/parseBlogDate";

type PageProps = {
  params: Promise<{ tag: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { tag: raw } = await params;
  const tag = normalizeTag(decodeURIComponent(raw));
  const label = formatTag(tag);
  return {
    title: `${label} · Tags`,
    description: `Content tagged ${label} by ${siteConfig.name}`,
    alternates: { canonical: `/tags/${tag}` },
    openGraph: {
      title: `${label} · ${siteConfig.name}`,
      url: absoluteUrl(`/tags/${tag}`),
    },
  };
}

export default async function TagPage({ params }: PageProps) {
  const { tag: raw } = await params;
  const data = await (await getContentRepository()).getByTag(
    decodeURIComponent(raw),
  );
  const label = formatTag(data.tag);
  const total =
    data.writings.length +
    data.series.length +
    data.projects.length +
    data.works.length;

  return (
    <PortfolioShell>
      <header className="space-y-2">
        <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-zinc-500">
          Tag
        </p>
        <h1 className="text-2xl font-semibold text-amber-700 dark:text-amber-400 font-mono">
          {label || "#unknown"}
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {total} item{total === 1 ? "" : "s"} tagged with this label.
        </p>
      </header>

      {data.writings.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">
            Writings
          </h2>
          <ul className="space-y-3">
            {data.writings.map((item) => {
              const { year, mmdd } = parseBlogDate(item.date);

              return (
                <li key={item.slug} className="py-1 space-y-2">
                  <Link
                    href={item.externalUrl ?? `/writings/${item.slug}`}
                    {...(item.externalUrl
                      ? {
                          target: "_blank",
                          rel: "noopener noreferrer",
                        }
                      : {
                          transitionTypes: ["nav-forward"] as "nav-forward"[],
                        })}
                    className="group block focus:outline-none"
                  >
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono text-xs text-zinc-400 dark:text-zinc-600 w-10 shrink-0">
                        {year}
                      </span>

                      <h3 className="font-sans font-medium text-sm md:text-base text-zinc-950 dark:text-zinc-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors flex-1">
                        <span className="block">{item.title}</span>
                      </h3>

                      <span className="font-mono text-xs text-zinc-400 dark:text-zinc-600 shrink-0">
                        {mmdd}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {data.series.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">
            Series
          </h2>
          <ul className="space-y-3">
            {data.series.map((item) => {
              const { year, mmdd } = parseBlogDate(item.date);

              return (
                <li key={item.slug} className="py-1 space-y-2">
                  <Link
                    href={`/series/${item.slug}`}
                    transitionTypes={["nav-forward"]}
                    className="group block focus:outline-none"
                  >
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono text-xs text-zinc-400 dark:text-zinc-600 w-10 shrink-0">
                        {year}
                      </span>

                      <h3 className="font-sans font-medium text-sm md:text-base text-zinc-950 dark:text-zinc-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors flex-1">
                        <span className="block">{item.title}</span>
                      </h3>

                      <span className="font-mono text-xs text-zinc-400 dark:text-zinc-600 shrink-0">
                        {mmdd}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {data.projects.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">
            Projects
          </h2>
          <ul className="space-y-3">
            {data.projects.map((item) => {
              const linked = hasProjectLink(item.link);
              const body = (
                <>
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-xs text-zinc-400 dark:text-zinc-600 w-10 shrink-0">
                      {item.date}
                      {!linked ? " · in development" : null}
                    </p>
                    <h3 className="font-sans font-medium text-sm md:text-base text-zinc-950 dark:text-zinc-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors flex-1">
                      <span className="block">{item.title}</span>
                    </h3>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 line-clamp-2">
                    {item.description}
                  </p>
                </>
              );

              return (
                <li key={item.slug}>
                  {linked ? (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block focus:outline-none"
                    >
                      {body}
                    </a>
                  ) : (
                    <div className="group block cursor-default">{body}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {data.works.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">
            Works
          </h2>
          <ul className="space-y-3">
            {data.works.map((item) => {
              const { year, mmdd } = parseBlogDate(item.date);

              return (
                <li key={item.slug} className="py-1 space-y-2">
                  <Link
                    href={`/works/${item.slug}`}
                    transitionTypes={["nav-forward"]}
                    className="group block focus:outline-none"
                  >
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono text-xs text-zinc-400 dark:text-zinc-600 w-10 shrink-0">
                        {year}
                      </span>

                      <h3 className="font-sans font-medium text-sm md:text-base text-zinc-950 dark:text-zinc-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors flex-1">
                        <span className="block">{item.title}</span>
                      </h3>

                      <span className="font-mono text-xs text-zinc-400 dark:text-zinc-600 shrink-0">
                        {mmdd}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {total === 0 && (
        <p className="text-sm font-mono text-zinc-500">
          No published content uses this tag yet.
        </p>
      )}
    </PortfolioShell>
  );
}
