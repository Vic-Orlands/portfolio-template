import type { Metadata } from "next";
import Link from "next/link";
import { OpenInNewWindowIcon } from "@radix-ui/react-icons";
import { ExternalWritingProfiles } from "@/components/portfolio/ExternalWritingProfiles";
import { PortfolioShell } from "@/components/portfolio/PortfolioShell";
import { getContentRepository } from "@/lib/content";
import { parseBlogDate } from "@/lib/parseBlogDate";
import { siteConfig } from "@/lib/site";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Writings",
  description: `All writings by ${siteConfig.name}`,
  alternates: { canonical: "/writings" },
};

export default async function WritingsIndexPage() {
  const blogs = await (await getContentRepository()).getPosts();
  const elsewhere = siteConfig.publications.length;

  return (
    <PortfolioShell showFooter={false}>
      <header className="space-y-2">
        <h1 className="text-base font-instrument italic text-zinc-950 dark:text-zinc-50">
          Writings
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Notes and essays — {blogs.length} published here, {elsewhere}{" "}
          {elsewhere === 1 ? "outlet" : "outlets"} elsewhere.
        </p>
      </header>

      <ExternalWritingProfiles />

      <div className="divide-y divide-zinc-100 dark:divide-zinc-800/40">
        {blogs.map((blog, index) => {
          const { year, mmdd } = parseBlogDate(blog.date);
          const previousYear =
            index > 0 ? parseBlogDate(blogs[index - 1].date).year : null;
          const showYear = year !== previousYear;
          const row = (
            <div className="relative">
              <span className="absolute right-full top-0.5 mr-2 hidden w-10 text-right font-mono text-xs text-zinc-400 md:block lg:mr-6 dark:text-zinc-600">
                {showYear ? year : null}
              </span>
              {showYear ? (
                <span className="mb-1 block font-mono text-xs text-zinc-400 md:hidden dark:text-zinc-600">
                  {year}
                </span>
              ) : null}
              <div className="flex items-baseline gap-2">
                <h2 className="flex min-w-0 flex-1 items-center gap-1 font-sans text-sm font-medium text-zinc-950 transition-colors group-hover:text-amber-600 md:text-base dark:text-zinc-100 dark:group-hover:text-amber-400">
                  <span className="min-w-0 truncate">{blog.title}</span>
                  {blog.externalUrl && (
                    <OpenInNewWindowIcon
                      aria-hidden="true"
                      className="size-3.5 shrink-0 text-zinc-400"
                    />
                  )}
                </h2>
                <span className="shrink-0 font-mono text-xs text-zinc-400 dark:text-zinc-600">
                  {mmdd}
                </span>
              </div>
            </div>
          );

          return (
            <article key={blog.id} className="py-3 space-y-2">
              {blog.externalUrl ? (
                <a
                  href={blog.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block focus:outline-none"
                >
                  {row}
                </a>
              ) : (
                <Link
                  href={`/writings/${blog.id}`}
                  transitionTypes={["writing-forward"]}
                  className="group block focus:outline-none"
                >
                  {row}
                </Link>
              )}
            </article>
          );
        })}
      </div>
    </PortfolioShell>
  );
}
