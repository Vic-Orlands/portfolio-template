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
  const works = await (await getContentRepository()).getWorks();
  return works.map((work) => ({ slug: work.id }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const work = await (await getContentRepository()).getWork(slug);
  if (!work) {
    return { title: "Work not found" };
  }

  return {
    title: work.title,
    description: work.description,
    alternates: {
      canonical: `/works/${work.id}`,
    },
    openGraph: {
      type: "article",
      title: work.title,
      description: work.description,
      url: absoluteUrl(`/works/${work.id}`),
      siteName: siteConfig.name,
      images: [{ url: siteConfig.ogImage, alt: work.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: work.title,
      description: work.description,
      creator: siteConfig.author.twitter,
      images: [siteConfig.ogImage],
    },
  };
}

export default async function WorkPage({ params }: PageProps) {
  const { slug } = await params;
  const content = await getContentRepository();
  const [work, works] = await Promise.all([
    content.getWork(slug),
    content.getWorks(),
  ]);
  if (!work) notFound();

  return <ContentArticle item={work} type="work" allWorks={works} />;
}
