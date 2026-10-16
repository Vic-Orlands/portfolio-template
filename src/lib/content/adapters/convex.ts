import "server-only";

import type { InspirationItem } from "@/lib/inspirations";
import {
  fetchByTag,
  fetchPublishedBlogs,
  fetchPublishedInspirations,
  fetchPublishedProjects,
  fetchPublishedSeries,
  fetchPublishedWorks,
} from "@/lib/convexServer";
import type { ContentRepository } from "@/lib/content/types";

function toInspiration(
  row: Awaited<ReturnType<typeof fetchPublishedInspirations>>[number],
): InspirationItem {
  return {
    name: row.name,
    url: row.url,
    blurb: row.blurb,
    about: row.about,
    category: row.category,
    kind: row.kind,
    styles: row.styles,
    tags: row.tags,
    cover: row.coverUrl ?? undefined,
  };
}

/**
 * Optional Convex adapter. Imported only when CONTENT_SOURCE=convex.
 * Requires NEXT_PUBLIC_CONVEX_URL and a deployment created with `npx convex dev`.
 */
export const convexContentRepository: ContentRepository = {
  getPosts: fetchPublishedBlogs,
  async getPost(slug) {
    const posts = await fetchPublishedBlogs();
    return posts.find((post) => post.id === slug) ?? null;
  },
  getSeries: fetchPublishedSeries,
  async getSeriesBySlug(slug) {
    const series = await fetchPublishedSeries();
    return series.find((item) => item.id === slug) ?? null;
  },
  getProjects: fetchPublishedProjects,
  async getProject(slug) {
    const projects = await fetchPublishedProjects();
    return projects.find((item) => item.id === slug) ?? null;
  },
  getWorks: fetchPublishedWorks,
  async getWork(slug) {
    const works = await fetchPublishedWorks();
    return works.find((item) => item.id === slug) ?? null;
  },
  async getInspirations() {
    const rows = await fetchPublishedInspirations();
    return rows.map(toInspiration);
  },
  getByTag: fetchByTag,
};
