import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ContentArticle } from "@/components/portfolio/ContentArticle";
import { getContentRepository } from "@/lib/content";
import { absoluteUrl, siteConfig } from "@/lib/site";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 60;

export async function generateStaticParams() {
  const posts = await (await getContentRepository()).getPosts();
  return posts
    .filter((blog) => !blog.externalUrl)
    .map((blog) => ({ slug: blog.id }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const blog = await (await getContentRepository()).getPost(slug);
  if (!blog) {
    return { title: "Writing not found" };
  }

  return {
    title: blog.title,
    description: blog.description,
    alternates: {
      canonical: blog.externalUrl ?? `/writings/${blog.id}`,
    },
    openGraph: {
      type: "article",
      title: blog.title,
      description: blog.description,
      url: blog.externalUrl ?? absoluteUrl(`/writings/${blog.id}`),
      siteName: siteConfig.name,
      ...(blog.coverUrl
        ? { images: [{ url: blog.coverUrl, alt: blog.title }] }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: blog.title,
      description: blog.description,
      creator: siteConfig.author.twitter,
      ...(blog.coverUrl ? { images: [blog.coverUrl] } : {}),
    },
  };
}

export default async function WritingPage({ params }: PageProps) {
  const { slug } = await params;
  const content = await getContentRepository();
  const [blog, blogs, series] = await Promise.all([
    content.getPost(slug),
    content.getPosts(),
    content.getSeries(),
  ]);
  if (!blog) notFound();
  if (blog.externalUrl) redirect(blog.externalUrl);
  const seriesContext =
    series.find((item) => item.parts?.some((part) => part.id === blog.id)) ??
    null;

  return (
    <ContentArticle
      item={blog}
      type="blog"
      relatedBlogs={blogs}
      seriesContext={seriesContext}
    />
  );
}
