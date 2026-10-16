import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentArticle } from "@/components/portfolio/ContentArticle";
import { getContentRepository } from "@/lib/content";
import { absoluteUrl, siteConfig } from "@/lib/site";

export const revalidate = 60;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const series = await (await getContentRepository()).getSeries();
  return series.map((item) => ({ slug: item.id }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = await (await getContentRepository()).getSeriesBySlug(slug);
  if (!item) {
    return { title: "Series not found" };
  }

  return {
    title: item.title,
    description: item.description,
    alternates: {
      canonical: `/series/${item.id}`,
    },
    openGraph: {
      type: "article",
      title: item.title,
      description: item.description,
      url: absoluteUrl(`/series/${item.id}`),
      siteName: siteConfig.name,
    },
    twitter: {
      card: "summary_large_image",
      title: item.title,
      description: item.description,
      creator: siteConfig.author.twitter,
    },
  };
}

export default async function SeriesPage({ params }: PageProps) {
  const { slug } = await params;
  const item = await (await getContentRepository()).getSeriesBySlug(slug);
  if (!item) notFound();

  return <ContentArticle item={item} type="series" />;
}
