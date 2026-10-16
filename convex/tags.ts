import { query } from "./_generated/server";
import { v } from "convex/values";
import { bySortOrder, byWritingDateDescending } from "./lib/content";
import { docHasTag, normalizeTag } from "./lib/tags";
import {
  blogCategoryValidator,
  workCategoryValidator,
} from "./schema";

const taggedWriting = v.object({
  slug: v.string(),
  title: v.string(),
  description: v.string(),
  date: v.string(),
  category: blogCategoryValidator,
  externalUrl: v.optional(v.string()),
  tags: v.array(v.string()),
});

const taggedSeries = v.object({
  slug: v.string(),
  title: v.string(),
  description: v.string(),
  date: v.string(),
  type: v.string(),
  tags: v.array(v.string()),
});

const taggedProject = v.object({
  slug: v.string(),
  title: v.string(),
  description: v.string(),
  date: v.string(),
  link: v.string(),
  tags: v.array(v.string()),
});

const taggedWork = v.object({
  slug: v.string(),
  title: v.string(),
  description: v.string(),
  date: v.string(),
  category: workCategoryValidator,
  tags: v.array(v.string()),
});

export const byTag = query({
  args: { tag: v.string() },
  returns: v.object({
    tag: v.string(),
    writings: v.array(taggedWriting),
    series: v.array(taggedSeries),
    projects: v.array(taggedProject),
    works: v.array(taggedWork),
  }),
  handler: async (ctx, args) => {
    const tag = normalizeTag(args.tag);
    if (!tag) {
      return { tag: "", writings: [], series: [], projects: [], works: [] };
    }

    const [posts, seriesRows, projectRows, workRows] = await Promise.all([
      ctx.db
        .query("posts")
        .withIndex("by_status", (q) => q.eq("status", "published"))
        .collect(),
      ctx.db
        .query("series")
        .withIndex("by_status", (q) => q.eq("status", "published"))
        .collect(),
      ctx.db
        .query("projects")
        .withIndex("by_status", (q) => q.eq("status", "published"))
        .collect(),
      ctx.db
        .query("works")
        .withIndex("by_status", (q) => q.eq("status", "published"))
        .collect(),
    ]);

    const writings = posts
      .filter((p) => docHasTag(p, tag))
      .sort(byWritingDateDescending)
      .map((p) => ({
        slug: p.slug,
        title: p.title,
        description: p.description,
        date: p.date,
        category: p.category,
        externalUrl: p.externalUrl,
        tags: p.tags ?? [],
      }));

    const series = seriesRows
      .filter((s) => docHasTag(s, tag))
      .sort(bySortOrder)
      .map((s) => ({
        slug: s.slug,
        title: s.title,
        description: s.description,
        date: s.date,
        type: s.type,
        tags: s.tags ?? [],
      }));

    const projects = projectRows
      .filter((p) => docHasTag(p, tag))
      .sort(bySortOrder)
      .map((p) => ({
        slug: p.slug,
        title: p.title,
        description: p.description,
        date: p.date,
        link: p.link,
        tags: p.tags ?? [],
      }));

    const works = workRows
      .filter((w) => docHasTag(w, tag))
      .sort(bySortOrder)
      .map((w) => ({
        slug: w.slug,
        title: w.title,
        description: w.description,
        date: w.date,
        category: w.category,
        tags: w.tags ?? [],
      }));

    return { tag, writings, series, projects, works };
  },
});

/** Lightweight list of all tags used on published content (for sitemap). */
export const listAll = query({
  args: {},
  returns: v.array(v.string()),
  handler: async (ctx) => {
    const [posts, seriesRows, projectRows, workRows] = await Promise.all([
      ctx.db
        .query("posts")
        .withIndex("by_status", (q) => q.eq("status", "published"))
        .collect(),
      ctx.db
        .query("series")
        .withIndex("by_status", (q) => q.eq("status", "published"))
        .collect(),
      ctx.db
        .query("projects")
        .withIndex("by_status", (q) => q.eq("status", "published"))
        .collect(),
      ctx.db
        .query("works")
        .withIndex("by_status", (q) => q.eq("status", "published"))
        .collect(),
    ]);

    const set = new Set<string>();
    for (const row of [...posts, ...seriesRows, ...projectRows, ...workRows]) {
      for (const t of row.tags ?? []) {
        const n = normalizeTag(t);
        if (n) set.add(n);
      }
    }
    return [...set].sort();
  },
});
