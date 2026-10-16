import "server-only";

import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import type { Blog, BlogCategory, Project, Series, SeriesPart, Work } from "@/data";
import type { InspirationCategory, InspirationItem } from "@/lib/inspirations";
import { parseBlogDate } from "@/lib/parseBlogDate";
import { normalizeTag, normalizeTags } from "@/lib/tags";
import type { ContentRepository, TagBundle } from "@/lib/content/types";

const CONTENT_ROOT = path.join(process.cwd(), "content");

type Frontmatter = Record<string, string>;

type Loaded = {
  posts: Blog[];
  series: Series[];
  projects: Project[];
  works: Work[];
  inspirations: InspirationItem[];
};

const BLOG_CATEGORIES = new Set<BlogCategory>(["tech", "scriptures", "other"]);
const WORK_CATEGORIES = new Set<Work["category"]>(["3D", "Grid", "Card"]);
const INSPIRATION_CATEGORIES = new Set<InspirationCategory>([
  "design",
  "writing",
  "tools",
  "ai",
  "reference",
]);

let cache: Loaded | null = null;

function parseFrontmatter(raw: string): { data: Frontmatter; body: string } {
  const text = raw.replace(/^\uFEFF/, "");
  if (!text.startsWith("---")) return { data: {}, body: text };
  const end = text.indexOf("\n---", 3);
  if (end === -1) return { data: {}, body: text };
  const block = text.slice(3, end).trim();
  const body = text.slice(end + 4).replace(/^\r?\n/, "");
  const data: Frontmatter = {};
  for (const line of block.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf(":");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    data[key] = value;
  }
  return { data, body };
}

function listField(value: string | undefined): string[] {
  if (!value) return [];
  const trimmed = value.trim();
  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim()).filter(Boolean);
      }
    } catch {
      // Fall through to comma splitting.
    }
  }
  return trimmed
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function readingTime(content: string): string {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}

function dateValue(date: string): number {
  const { year, mmdd } = parseBlogDate(date);
  const [month, day] = mmdd.split("/");
  const parsed = Date.parse(`${year}-${month}-${day}T00:00:00Z`);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function blogCategory(value: string | undefined, file: string): BlogCategory {
  if (value && BLOG_CATEGORIES.has(value as BlogCategory)) {
    return value as BlogCategory;
  }
  if (!value) return "other";
  throw new Error(`${file}: category must be tech, scriptures, or other`);
}

function workCategory(value: string | undefined, file: string): Work["category"] {
  if (value && WORK_CATEGORIES.has(value as Work["category"])) {
    return value as Work["category"];
  }
  throw new Error(`${file}: category must be 3D, Grid, or Card`);
}

async function filesIn(dir: string): Promise<string[]> {
  try {
    const entries = await readdir(dir);
    return entries
      .filter((name) => /\.(md|mdx|json)$/i.test(name))
      .map((name) => path.join(dir, name))
      .sort();
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT") return [];
    throw error;
  }
}

async function readEntry(file: string): Promise<{
  slug: string;
  data: Frontmatter;
  body: string;
  updatedAt: number;
}> {
  const raw = await readFile(file, "utf8");
  const fileStat = await stat(file);
  const slug = path.basename(file).replace(/\.(md|mdx|json)$/i, "");
  if (file.endsWith(".json")) {
    const parsed = JSON.parse(raw) as Frontmatter & { content?: string };
    const { content, ...rest } = parsed;
    const data: Frontmatter = {};
    for (const [key, value] of Object.entries(rest)) {
      if (value == null) continue;
      data[key] = Array.isArray(value) ? (value as unknown[]).join(", ") : String(value);
    }
    return {
      slug: typeof parsed.slug === "string" && parsed.slug ? parsed.slug : slug,
      data,
      body: typeof content === "string" ? content : "",
      updatedAt: fileStat.mtimeMs,
    };
  }
  const { data, body } = parseFrontmatter(raw);
  return {
    slug: data.slug || slug,
    data,
    body: body.trim(),
    updatedAt: fileStat.mtimeMs,
  };
}

function requireField(data: Frontmatter, key: string, file: string): string {
  const value = data[key]?.trim();
  if (!value) throw new Error(`${file}: missing ${key}`);
  return value;
}

async function loadPosts(): Promise<
  Array<Blog & { seriesSlug?: string; partOrder?: number }>
> {
  const dir = path.join(CONTENT_ROOT, "posts");
  const files = await filesIn(dir);
  const posts: Array<Blog & { seriesSlug?: string; partOrder?: number }> = [];
  for (const file of files) {
    const entry = await readEntry(file);
    if (entry.data.status === "draft") continue;
    const partOrder = entry.data.partOrder
      ? Number(entry.data.partOrder)
      : undefined;
    posts.push({
      id: entry.slug,
      title: requireField(entry.data, "title", file),
      category: blogCategory(entry.data.category, file),
      description: entry.data.description?.trim() ?? "",
      content: entry.body,
      externalUrl: entry.data.externalUrl?.trim() || undefined,
      date: entry.data.date?.trim() || "Jan 1, 2026",
      readingTime: entry.data.readingTime?.trim() || readingTime(entry.body),
      tags: normalizeTags(listField(entry.data.tags)),
      coverUrl: entry.data.cover?.trim() || null,
      updatedAt: entry.updatedAt,
      seriesSlug: entry.data.series?.trim() || undefined,
      partOrder: Number.isFinite(partOrder) ? partOrder : undefined,
    });
  }
  return posts.sort((a, b) => dateValue(b.date) - dateValue(a.date));
}

function toPart(post: Blog): SeriesPart {
  return {
    id: post.id,
    title: post.title,
    category: post.category,
    description: post.description,
    date: post.date,
    readingTime: post.readingTime,
    externalUrl: post.externalUrl,
  };
}

async function loadAll(): Promise<Loaded> {
  if (process.env.NODE_ENV === "production" && cache) return cache;

  const posts = await loadPosts();
  const seriesFiles = await filesIn(path.join(CONTENT_ROOT, "series"));
  const series: Series[] = [];
  for (const file of seriesFiles) {
    const entry = await readEntry(file);
    if (entry.data.status === "draft") continue;
    const parts = posts
      .filter((post) => post.seriesSlug === entry.slug)
      .sort((a, b) => (a.partOrder ?? 0) - (b.partOrder ?? 0))
      .map(toPart);
    series.push({
      id: entry.slug,
      title: requireField(entry.data, "title", file),
      type: entry.data.type?.trim() || "Series",
      description: entry.data.description?.trim() ?? "",
      content: entry.body,
      date: entry.data.date?.trim() || "Jan 2026",
      tags: normalizeTags(listField(entry.data.tags)),
      updatedAt: entry.updatedAt,
      parts,
    });
  }
  series.sort((a, b) => dateValue(b.date) - dateValue(a.date));

  const projects: Project[] = [];
  for (const file of await filesIn(path.join(CONTENT_ROOT, "projects"))) {
    const entry = await readEntry(file);
    if (entry.data.status === "draft") continue;
    const mediaType = entry.data.mediaType === "video" ? "video" : "image";
    projects.push({
      id: entry.slug,
      title: requireField(entry.data, "title", file),
      description: entry.data.description?.trim() ?? "",
      content: entry.body,
      date: entry.data.date?.trim() || "Jan 2026",
      link: entry.data.link?.trim() || "https://example.com",
      imageUrl: entry.data.image?.trim() || null,
      imageAlt: entry.data.imageAlt?.trim(),
      mediaType: entry.data.image ? mediaType : undefined,
      tags: normalizeTags(listField(entry.data.tags)),
      updatedAt: entry.updatedAt,
    });
  }
  projects.sort((a, b) => dateValue(b.date) - dateValue(a.date));

  const works: Work[] = [];
  for (const file of await filesIn(path.join(CONTENT_ROOT, "works"))) {
    const entry = await readEntry(file);
    if (entry.data.status === "draft") continue;
    const width = Number(entry.data.mediaWidth);
    const height = Number(entry.data.mediaHeight);
    const mediaType = entry.data.mediaType === "video" ? "video" : "image";
    works.push({
      id: entry.slug,
      title: requireField(entry.data, "title", file),
      category: workCategory(entry.data.category, file),
      description: entry.data.description?.trim() ?? "",
      date: entry.data.date?.trim() || "Jan 2026",
      content: entry.body,
      technologies: listField(entry.data.technologies),
      link: entry.data.link?.trim() || undefined,
      mediaUrl: entry.data.media?.trim() || null,
      mediaType: entry.data.media ? mediaType : undefined,
      mediaWidth: Number.isFinite(width) && width > 0 ? width : undefined,
      mediaHeight: Number.isFinite(height) && height > 0 ? height : undefined,
      galleryMedia: [],
      tags: normalizeTags(listField(entry.data.tags)),
      updatedAt: entry.updatedAt,
    });
  }
  works.sort((a, b) => dateValue(b.date) - dateValue(a.date));

  const inspirations = await loadInspirations();
  const loaded = {
    posts: posts.map(({ seriesSlug: _seriesSlug, partOrder: _partOrder, ...post }) => post),
    series,
    projects,
    works,
    inspirations,
  };
  cache = loaded;
  return loaded;
}

async function loadInspirations(): Promise<InspirationItem[]> {
  const file = path.join(CONTENT_ROOT, "inspirations.json");
  try {
    const raw = await readFile(file, "utf8");
    const parsed = JSON.parse(raw) as InspirationItem[];
    if (!Array.isArray(parsed)) {
      throw new Error("content/inspirations.json must be an array");
    }
    return parsed.map((item, index) => {
      if (!INSPIRATION_CATEGORIES.has(item.category)) {
        throw new Error(
          `content/inspirations.json[${index}]: unknown category ${item.category}`,
        );
      }
      return {
        ...item,
        tags: normalizeTags(item.tags),
        styles: item.styles ?? [],
      };
    });
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT") return [];
    throw error;
  }
}

function hasTag(tags: string[] | undefined, tag: string): boolean {
  const normalized = normalizeTag(tag);
  return (tags ?? []).some((item) => normalizeTag(item) === normalized);
}

export const localContentRepository: ContentRepository = {
  async getPosts() {
    return (await loadAll()).posts;
  },
  async getPost(slug) {
    return (await loadAll()).posts.find((post) => post.id === slug) ?? null;
  },
  async getSeries() {
    return (await loadAll()).series;
  },
  async getSeriesBySlug(slug) {
    return (await loadAll()).series.find((item) => item.id === slug) ?? null;
  },
  async getProjects() {
    return (await loadAll()).projects;
  },
  async getProject(slug) {
    return (await loadAll()).projects.find((item) => item.id === slug) ?? null;
  },
  async getWorks() {
    return (await loadAll()).works;
  },
  async getWork(slug) {
    return (await loadAll()).works.find((item) => item.id === slug) ?? null;
  },
  async getInspirations() {
    return (await loadAll()).inspirations;
  },
  async getByTag(tag) {
    const normalized = normalizeTag(tag);
    const { posts, series, projects, works } = await loadAll();
    const empty: TagBundle = {
      tag: normalized,
      writings: [],
      series: [],
      projects: [],
      works: [],
    };
    if (!normalized) return empty;
    return {
      tag: normalized,
      writings: posts
        .filter((post) => hasTag(post.tags, normalized))
        .map((post) => ({
          slug: post.id,
          title: post.title,
          description: post.description,
          date: post.date,
          category: post.category,
          externalUrl: post.externalUrl,
          tags: post.tags ?? [],
        })),
      series: series
        .filter((item) => hasTag(item.tags, normalized))
        .map((item) => ({
          slug: item.id,
          title: item.title,
          description: item.description,
          date: item.date,
          type: item.type,
          tags: item.tags ?? [],
        })),
      projects: projects
        .filter((item) => hasTag(item.tags, normalized))
        .map((item) => ({
          slug: item.id,
          title: item.title,
          description: item.description,
          date: item.date,
          link: item.link,
          tags: item.tags ?? [],
        })),
      works: works
        .filter((item) => hasTag(item.tags, normalized))
        .map((item) => ({
          slug: item.id,
          title: item.title,
          description: item.description,
          date: item.date,
          category: item.category,
          tags: item.tags ?? [],
        })),
    };
  },
};
