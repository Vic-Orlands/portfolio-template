import "server-only";

import { ConvexHttpClient } from "convex/browser";
import { unstable_cache } from "next/cache";
import { api } from "../../convex/_generated/api";
import {
  mapPostToBlog,
  mapProject,
  mapSeries,
  mapWork,
} from "@/lib/mapContent";
import { getConvexUrl } from "@/lib/env";
import { normalizeTag } from "@/lib/tags";
import type { TagBundle } from "@/lib/content/types";
import type { Blog, Project, Series, Work } from "@/data";
import type { InspirationCategory } from "@/lib/inspirations";

export type { TagBundle };

export type ConvexInspiration = {
  name: string;
  url: string;
  blurb: string;
  about: string;
  category: InspirationCategory;
  kind: string;
  styles: string[];
  tags: string[];
  coverUrl: string | null;
};

function clientOrNull(): ConvexHttpClient | null {
  const url = getConvexUrl();
  if (!url) return null;
  return new ConvexHttpClient(url);
}

const queryPublishedBlogs = unstable_cache(async (): Promise<Blog[]> => {
  const client = clientOrNull();
  if (!client) return [];
  const posts = await client.query(api.posts.listPublished, {});
  return posts.map(mapPostToBlog);
}, ["published-blogs"], { revalidate: 300 });

export async function fetchPublishedBlogs(): Promise<Blog[]> {
  try {
    return await queryPublishedBlogs();
  } catch {
    return [];
  }
}

const queryPublishedSeries = unstable_cache(async (): Promise<Series[]> => {
  const client = clientOrNull();
  if (!client) return [];
  const rows = await client.query(api.series.listPublished, {});
  return rows.map(mapSeries);
}, ["published-series"], { revalidate: 300 });

export async function fetchPublishedSeries(): Promise<Series[]> {
  try {
    return await queryPublishedSeries();
  } catch {
    return [];
  }
}

const queryPublishedProjects = unstable_cache(async (): Promise<Project[]> => {
  const client = clientOrNull();
  if (!client) return [];
  const rows = await client.query(api.projects.listPublished, {});
  return rows.map(mapProject);
}, ["published-projects"], { revalidate: 60 });

export async function fetchPublishedProjects(): Promise<Project[]> {
  try {
    return await queryPublishedProjects();
  } catch {
    return [];
  }
}

const queryHomeWorks = unstable_cache(async (): Promise<Work[]> => {
  const client = clientOrNull();
  if (!client) return [];
  const rows = await client.query(api.works.listPublished, {});
  return rows.map(mapWork);
}, ["home-published-works"], { revalidate: 60 });

export async function fetchHomeWorks(): Promise<Work[]> {
  try {
    return await queryHomeWorks();
  } catch {
    return [];
  }
}

export async function fetchPublishedWorks(): Promise<Work[]> {
  try {
    const client = clientOrNull();
    if (!client) return [];
    const rows = await client.query(api.works.listPublished, {});
    return rows.map(mapWork);
  } catch {
    return [];
  }
}

const queryPublishedInspirations = unstable_cache(
  async (): Promise<ConvexInspiration[]> => {
    const client = clientOrNull();
    if (!client) return [];
    const rows = await client.query(api.inspirations.listPublished, {});
    return rows.map((row) => ({
      name: row.name,
      url: row.url,
      blurb: row.blurb,
      about: row.about,
      category: row.category,
      kind: row.kind,
      styles: row.styles,
      tags: row.tags ?? [],
      coverUrl: row.coverUrl ?? null,
    }));
  },
  ["published-inspirations"],
  { revalidate: 300 },
);

export async function fetchPublishedInspirations(): Promise<ConvexInspiration[]> {
  try {
    return await queryPublishedInspirations();
  } catch {
    return [];
  }
}

export async function fetchByTag(tag: string): Promise<TagBundle> {
  const normalized = normalizeTag(tag);
  const empty: TagBundle = {
    tag: normalized,
    writings: [],
    series: [],
    projects: [],
    works: [],
  };
  const client = clientOrNull();
  if (!client || !normalized) return empty;
  try {
    return await client.query(api.tags.byTag, { tag: normalized });
  } catch {
    return empty;
  }
}
