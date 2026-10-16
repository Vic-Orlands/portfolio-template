import type { MetadataRoute } from "next";
import { getContentRepository } from "@/lib/content";
import { absoluteUrl } from "@/lib/site";

function latestUpdate(items: Array<{ updatedAt?: number }>): Date | undefined {
  const timestamp = Math.max(
    0,
    ...items.map((item) => item.updatedAt ?? 0),
  );
  return timestamp ? new Date(timestamp) : undefined;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const content = await getContentRepository();
  const [blogs, series, works] = await Promise.all([
    content.getPosts(),
    content.getSeries(),
    content.getWorks(),
  ]);

  const latestBlogUpdate = latestUpdate(blogs);
  const latestSeriesUpdate = latestUpdate(series);
  const latestWorkUpdate = latestUpdate(works);
  const latestSiteUpdate = latestUpdate([...blogs, ...series, ...works]);

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: latestSiteUpdate,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/writings"),
      lastModified: latestBlogUpdate,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/series"),
      lastModified: latestSeriesUpdate,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/works"),
      lastModified: latestWorkUpdate,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/scribbles"),
      lastModified: latestWorkUpdate,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/inspirations"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: absoluteUrl("/feed.xml"),
      lastModified: latestBlogUpdate,
      changeFrequency: "daily",
      priority: 0.4,
    },
  ];

  const writingEntries: MetadataRoute.Sitemap = blogs
    .filter((blog) => !blog.externalUrl)
    .map((blog) => ({
      url: absoluteUrl(`/writings/${blog.id}`),
      lastModified: blog.updatedAt ? new Date(blog.updatedAt) : undefined,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));

  const seriesEntries: MetadataRoute.Sitemap = series.map((item) => ({
    url: absoluteUrl(`/series/${item.id}`),
    lastModified: item.updatedAt ? new Date(item.updatedAt) : undefined,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const workEntries: MetadataRoute.Sitemap = works.map((work) => ({
    url: absoluteUrl(`/works/${work.id}`),
    lastModified: work.updatedAt ? new Date(work.updatedAt) : undefined,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    ...staticEntries,
    ...writingEntries,
    ...seriesEntries,
    ...workEntries,
  ];
}
