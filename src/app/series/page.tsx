import type { Metadata } from "next";
import Link from "next/link";
import { PortfolioShell } from "@/components/portfolio/PortfolioShell";
import { getContentRepository } from "@/lib/content";
import { siteConfig } from "@/lib/site";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Series",
  description: `Writing series by ${siteConfig.name}`,
  alternates: { canonical: "/series" },
};

export default async function SeriesIndexPage() {
  const series = await (await getContentRepository()).getSeries();

  return (
    <PortfolioShell showHomeLink={false}>
      <header className="space-y-2">
        <h1 className="text-base font-instrument italic text-zinc-950 dark:text-zinc-50">
          Series
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Multi-part explorations — {series.length} published.
        </p>
      </header>

      <div className="space-y-2">
        {series.map((item) => (
          <article
            key={item.id}
            className="py-4 border-b border-zinc-100 dark:border-zinc-800/40 space-y-2"
          >
            <Link
              href={`/series/${item.id}`}
              transitionTypes={["nav-forward"]}
              className="group block focus:outline-none"
            >
              <h2 className="flexk items-center gap-2 font-sans font-medium text-sm md:text-base text-zinc-950 dark:text-zinc-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                <span className="block">{item.title}</span>
              </h2>
              <div className="flex items-center gap-2 text-xs">
                <p className="font-mono text-zinc-500 bg-zinc-200/40 dark:bg-zinc-800/40 rounded-sm px-2 py-1">
                  {item.parts?.length ? `${item.parts.length} part series` : ""}
                </p>
                <p className="font-mono text-zinc-500">{item.date}</p>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-xs text-zinc-600 md:text-sm dark:text-zinc-400">
                {item.description}
              </p>
            </Link>
          </article>
        ))}
      </div>
    </PortfolioShell>
  );
}
