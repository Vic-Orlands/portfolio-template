import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdminSession } from "./lib/auth";
import { slugify } from "./lib/readingTime";
import {
  bySortOrder,
  nextPublishedAt,
  nextSortOrder,
  resolveMediaUrl,
} from "./lib/content";
import { Doc } from "./_generated/dataModel";
import { QueryCtx } from "./_generated/server";
import { blogCategoryValidator } from "./schema";
import { normalizeTags } from "./lib/tags";
import { internal } from "./_generated/api";

const publicSeriesValidator = v.object({
  _id: v.id("series"),
  _creationTime: v.number(),
  slug: v.string(),
  title: v.string(),
  type: v.string(),
  description: v.string(),
  content: v.string(),
  date: v.string(),
  status: v.union(v.literal("draft"), v.literal("published")),
  coverUrl: v.union(v.string(), v.null()),
  coverKey: v.optional(v.string()),
  sortOrder: v.optional(v.number()),
  tags: v.array(v.string()),
  updatedAt: v.number(),
  publishedAt: v.optional(v.number()),
  parts: v.array(
    v.object({
      _id: v.id("posts"),
      slug: v.string(),
      title: v.string(),
      category: blogCategoryValidator,
      description: v.string(),
      date: v.string(),
      readingTime: v.string(),
      externalUrl: v.optional(v.string()),
      partOrder: v.optional(v.number()),
    }),
  ),
});

async function withSeriesExtras(
  ctx: QueryCtx,
  series: Doc<"series">,
  opts?: { includeDraftParts?: boolean },
) {
  const coverUrl = await resolveMediaUrl(
    ctx,
    series.coverKey,
    series.coverStorageId,
  );
  const parts = (
    await ctx.db
      .query("posts")
      .withIndex("by_series", (q) => q.eq("seriesId", series._id))
      .collect()
  )
    .filter((p) => opts?.includeDraftParts || p.status === "published")
    .sort((a, b) => (a.partOrder ?? 0) - (b.partOrder ?? 0))
    .map((p) => ({
      _id: p._id,
      slug: p.slug,
      title: p.title,
      category: p.category,
      description: p.description,
      date: p.date,
      readingTime: p.readingTime,
      externalUrl: p.externalUrl,
      partOrder: p.partOrder,
    }));

  const { coverStorageId: _c, tags: _t, ...rest } = series;
  return { ...rest, coverUrl, parts, tags: series.tags ?? [] };
}

export const listPublished = query({
  args: {},
  returns: v.array(publicSeriesValidator),
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("series")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect();
    rows.sort(bySortOrder);
    return await Promise.all(rows.map((s) => withSeriesExtras(ctx, s)));
  },
});

export const listAll = query({
  args: {
    sessionToken: v.string(),
    now: v.number(),
  },
  returns: v.array(publicSeriesValidator),
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.sessionToken, args.now);
    const rows = await ctx.db.query("series").collect();
    rows.sort(bySortOrder);
    return await Promise.all(
      rows.map((s) => withSeriesExtras(ctx, s, { includeDraftParts: true })),
    );
  },
});

export const getAdmin = query({
  args: {
    sessionToken: v.string(),
    now: v.number(),
    seriesId: v.id("series"),
  },
  returns: v.union(publicSeriesValidator, v.null()),
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.sessionToken, args.now);
    const row = await ctx.db.get(args.seriesId);
    if (!row) return null;
    return await withSeriesExtras(ctx, row, { includeDraftParts: true });
  },
});

export const create = mutation({
  args: {
    sessionToken: v.string(),
    title: v.string(),
    type: v.string(),
    description: v.string(),
    content: v.string(),
    date: v.string(),
    slug: v.optional(v.string()),
    status: v.union(v.literal("draft"), v.literal("published")),
    tags: v.optional(v.array(v.string())),
  },
  returns: v.id("series"),
  handler: async (ctx, args) => {
    const now = Date.now();
    await requireAdminSession(ctx, args.sessionToken, now);
    const slug = args.slug?.trim() || slugify(args.title);
    if (!slug) throw new Error("Slug is required");

    const existing = await ctx.db
      .query("series")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (existing) throw new Error("A series with this slug already exists");

    return await ctx.db.insert("series", {
      slug,
      title: args.title.trim(),
      type: args.type.trim(),
      description: args.description.trim(),
      content: args.content,
      date: args.date.trim(),
      status: args.status,
      sortOrder: await nextSortOrder(ctx, "series"),
      tags: normalizeTags(args.tags),
      updatedAt: now,
      publishedAt: nextPublishedAt(args.status, undefined, now),
    });
  },
});

export const update = mutation({
  args: {
    sessionToken: v.string(),
    seriesId: v.id("series"),
    title: v.string(),
    type: v.string(),
    description: v.string(),
    content: v.string(),
    date: v.string(),
    slug: v.string(),
    status: v.union(v.literal("draft"), v.literal("published")),
    coverStorageId: v.optional(v.union(v.id("_storage"), v.null())),
    coverKey: v.optional(v.union(v.string(), v.null())),
    tags: v.optional(v.array(v.string())),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const now = Date.now();
    await requireAdminSession(ctx, args.sessionToken, now);
    const row = await ctx.db.get(args.seriesId);
    if (!row) throw new Error("Series not found");

    const slug = args.slug.trim() || slugify(args.title);
    if (!slug) throw new Error("Slug is required");
    if (slug !== row.slug) {
      const existing = await ctx.db
        .query("series")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .unique();
      if (existing) throw new Error("A series with this slug already exists");
    }

    const patch: Partial<Doc<"series">> = {
      slug,
      title: args.title.trim(),
      type: args.type.trim(),
      description: args.description.trim(),
      content: args.content,
      date: args.date.trim(),
      status: args.status,
      updatedAt: now,
      publishedAt: nextPublishedAt(args.status, row, now),
    };
    if (args.tags !== undefined) {
      patch.tags = normalizeTags(args.tags);
    }
    if (args.coverStorageId !== undefined) {
      patch.coverStorageId =
        args.coverStorageId === null ? undefined : args.coverStorageId;
    }
    if (args.coverKey !== undefined) {
      patch.coverKey = args.coverKey === null ? undefined : args.coverKey;
      if (row.coverKey && row.coverKey !== args.coverKey) {
        await ctx.scheduler.runAfter(0, internal.r2.deleteObject, {
          key: row.coverKey,
        });
      }
    }
    await ctx.db.patch(args.seriesId, patch);
    return null;
  },
});

export const remove = mutation({
  args: {
    sessionToken: v.string(),
    seriesId: v.id("series"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.sessionToken, Date.now());
    const row = await ctx.db.get(args.seriesId);
    if (!row) throw new Error("Series not found");

    const parts = await ctx.db
      .query("posts")
      .withIndex("by_series", (q) => q.eq("seriesId", args.seriesId))
      .collect();
    for (const part of parts) {
      await ctx.db.patch(part._id, {
        seriesId: undefined,
        partOrder: undefined,
      });
    }

    if (row.coverStorageId) {
      await ctx.storage.delete(row.coverStorageId);
    }
    if (row.coverKey) {
      await ctx.scheduler.runAfter(0, internal.r2.deleteObject, {
        key: row.coverKey,
      });
    }
    await ctx.db.delete(args.seriesId);
    return null;
  },
});

export const reorder = mutation({
  args: {
    sessionToken: v.string(),
    orderedIds: v.array(v.id("series")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.sessionToken, Date.now());
    for (let i = 0; i < args.orderedIds.length; i++) {
      const id = args.orderedIds[i]!;
      const row = await ctx.db.get(id);
      if (!row) throw new Error("Series not found");
      await ctx.db.patch(id, { sortOrder: i });
    }
    return null;
  },
});
