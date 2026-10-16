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
import { normalizeTags } from "./lib/tags";
import { inspirationCategoryValidator } from "./schema";
import { internal } from "./_generated/api";

const publicInspirationValidator = v.object({
  _id: v.id("inspirations"),
  _creationTime: v.number(),
  slug: v.string(),
  name: v.string(),
  url: v.string(),
  blurb: v.string(),
  about: v.string(),
  category: inspirationCategoryValidator,
  kind: v.string(),
  styles: v.array(v.string()),
  tags: v.array(v.string()),
  status: v.union(v.literal("draft"), v.literal("published")),
  coverUrl: v.union(v.string(), v.null()),
  coverKey: v.optional(v.string()),
  sortOrder: v.optional(v.number()),
  updatedAt: v.number(),
  publishedAt: v.optional(v.number()),
});

async function withCover(
  ctx: {
    storage: {
      getUrl: (
        id: NonNullable<Doc<"inspirations">["coverStorageId"]>,
      ) => Promise<string | null>;
    };
  },
  row: Doc<"inspirations">,
) {
  const coverUrl = await resolveMediaUrl(ctx, row.coverKey, row.coverStorageId);
  const { coverStorageId: _c, tags: _t, ...rest } = row;
  return { ...rest, coverUrl, tags: row.tags ?? [] };
}

export const listPublished = query({
  args: {},
  returns: v.array(publicInspirationValidator),
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("inspirations")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect();
    rows.sort(bySortOrder);
    return await Promise.all(rows.map((row) => withCover(ctx, row)));
  },
});

export const listAll = query({
  args: {
    sessionToken: v.string(),
    now: v.number(),
  },
  returns: v.array(publicInspirationValidator),
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.sessionToken, args.now);
    const rows = await ctx.db.query("inspirations").collect();
    rows.sort(bySortOrder);
    return await Promise.all(rows.map((row) => withCover(ctx, row)));
  },
});

export const getAdmin = query({
  args: {
    sessionToken: v.string(),
    now: v.number(),
    inspirationId: v.id("inspirations"),
  },
  returns: v.union(publicInspirationValidator, v.null()),
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.sessionToken, args.now);
    const row = await ctx.db.get(args.inspirationId);
    if (!row) return null;
    return await withCover(ctx, row);
  },
});

export const create = mutation({
  args: {
    sessionToken: v.string(),
    name: v.string(),
    url: v.string(),
    blurb: v.string(),
    about: v.string(),
    category: inspirationCategoryValidator,
    kind: v.string(),
    styles: v.array(v.string()),
    slug: v.optional(v.string()),
    status: v.union(v.literal("draft"), v.literal("published")),
    coverStorageId: v.optional(v.id("_storage")),
    coverKey: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  returns: v.id("inspirations"),
  handler: async (ctx, args) => {
    const now = Date.now();
    await requireAdminSession(ctx, args.sessionToken, now);
    const slug = args.slug?.trim() || slugify(args.name);
    if (!slug) throw new Error("Slug is required");

    const existing = await ctx.db
      .query("inspirations")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (existing) throw new Error("An inspiration with this slug already exists");

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(args.url.trim());
    } catch {
      throw new Error("Invalid website URL");
    }
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      throw new Error("Website URL must start with http:// or https://");
    }

    return await ctx.db.insert("inspirations", {
      slug,
      name: args.name.trim(),
      url: parsedUrl.toString(),
      blurb: args.blurb.trim(),
      about: args.about.trim(),
      category: args.category,
      kind: args.kind.trim() || "Site",
      styles: args.styles.map((s) => s.trim()).filter(Boolean),
      status: args.status,
      coverStorageId: args.coverStorageId,
      coverKey: args.coverKey,
      sortOrder: await nextSortOrder(ctx, "inspirations"),
      tags: normalizeTags(args.tags),
      updatedAt: now,
      publishedAt: nextPublishedAt(args.status, undefined, now),
    });
  },
});

export const update = mutation({
  args: {
    sessionToken: v.string(),
    inspirationId: v.id("inspirations"),
    name: v.string(),
    url: v.string(),
    blurb: v.string(),
    about: v.string(),
    category: inspirationCategoryValidator,
    kind: v.string(),
    styles: v.array(v.string()),
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
    const row = await ctx.db.get(args.inspirationId);
    if (!row) throw new Error("Inspiration not found");

    const slug = args.slug.trim() || slugify(args.name);
    if (!slug) throw new Error("Slug is required");
    if (slug !== row.slug) {
      const existing = await ctx.db
        .query("inspirations")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .unique();
      if (existing) throw new Error("An inspiration with this slug already exists");
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(args.url.trim());
    } catch {
      throw new Error("Invalid website URL");
    }
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      throw new Error("Website URL must start with http:// or https://");
    }

    const patch: Partial<Doc<"inspirations">> = {
      slug,
      name: args.name.trim(),
      url: parsedUrl.toString(),
      blurb: args.blurb.trim(),
      about: args.about.trim(),
      category: args.category,
      kind: args.kind.trim() || "Site",
      styles: args.styles.map((s) => s.trim()).filter(Boolean),
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
    await ctx.db.patch(args.inspirationId, patch);
    return null;
  },
});

export const remove = mutation({
  args: {
    sessionToken: v.string(),
    inspirationId: v.id("inspirations"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.sessionToken, Date.now());
    const row = await ctx.db.get(args.inspirationId);
    if (!row) throw new Error("Inspiration not found");
    if (row.coverStorageId) {
      await ctx.storage.delete(row.coverStorageId);
    }
    if (row.coverKey) {
      await ctx.scheduler.runAfter(0, internal.r2.deleteObject, {
        key: row.coverKey,
      });
    }
    await ctx.db.delete(args.inspirationId);
    return null;
  },
});

export const reorder = mutation({
  args: {
    sessionToken: v.string(),
    orderedIds: v.array(v.id("inspirations")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.sessionToken, Date.now());
    for (let i = 0; i < args.orderedIds.length; i++) {
      const id = args.orderedIds[i]!;
      const row = await ctx.db.get(id);
      if (!row) throw new Error("Inspiration not found");
      await ctx.db.patch(id, { sortOrder: i });
    }
    return null;
  },
});
