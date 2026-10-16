import { internalMutation, mutation, query, type QueryCtx } from "./_generated/server";
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
import { workCategoryValidator } from "./schema";
import { normalizeTags } from "./lib/tags";
import { internal } from "./_generated/api";

const publicWorkValidator = v.object({
  _id: v.id("works"),
  _creationTime: v.number(),
  slug: v.string(),
  title: v.string(),
  category: workCategoryValidator,
  description: v.string(),
  date: v.string(),
  content: v.string(),
  technologies: v.array(v.string()),
  link: v.optional(v.string()),
  status: v.union(v.literal("draft"), v.literal("published")),
  mediaKey: v.optional(v.string()),
  mediaUrl: v.union(v.string(), v.null()),
  mediaType: v.optional(v.union(v.literal("image"), v.literal("video"))),
  mediaWidth: v.optional(v.number()),
  mediaHeight: v.optional(v.number()),
  galleryMedia: v.array(
    v.object({
      id: v.id("workMedia"),
      key: v.optional(v.string()),
      url: v.string(),
      mediaType: v.union(v.literal("image"), v.literal("video")),
      width: v.optional(v.number()),
      height: v.optional(v.number()),
      alt: v.optional(v.string()),
      sortOrder: v.number(),
    }),
  ),
  sortOrder: v.optional(v.number()),
  tags: v.array(v.string()),
  updatedAt: v.number(),
  publishedAt: v.optional(v.number()),
});

async function withMedia(
  ctx: QueryCtx,
  work: Doc<"works">,
  prefetchedGalleryRows?: Doc<"workMedia">[],
) {
  const mediaUrl = await resolveMediaUrl(
    ctx,
    work.mediaKey,
    work.mediaStorageId,
  );
  const galleryRows =
    prefetchedGalleryRows ??
    (await ctx.db
      .query("workMedia")
      .withIndex("by_work_and_order", (q) => q.eq("workId", work._id))
      .take(12));
  const galleryMedia = (
    await Promise.all(
      galleryRows.map(async (item: Doc<"workMedia">) => {
        const url = await resolveMediaUrl(ctx, item.key, item.storageId);
        if (!url) return null;
        return {
          id: item._id,
          key: item.key,
          url,
          mediaType: item.mediaType,
          width: item.width,
          height: item.height,
          alt: item.alt,
          sortOrder: item.sortOrder,
        };
      }),
    )
  ).filter((item): item is NonNullable<typeof item> => item !== null);
  const {
    mediaStorageId: _m,
    previewType: _previewType,
    tags: _t,
    ...rest
  } = work;
  return { ...rest, mediaUrl, galleryMedia, tags: work.tags ?? [] };
}

export const addMedia = mutation({
  args: {
    sessionToken: v.string(),
    workId: v.id("works"),
    key: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
    mediaType: v.union(v.literal("image"), v.literal("video")),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    alt: v.optional(v.string()),
  },
  returns: v.id("workMedia"),
  handler: async (ctx, args) => {
    const now = Date.now();
    await requireAdminSession(ctx, args.sessionToken, now);
    if (!(await ctx.db.get(args.workId))) throw new Error("Work not found");
    const media = await ctx.db
      .query("workMedia")
      .withIndex("by_work_and_order", (q) => q.eq("workId", args.workId))
      .take(12);
    if (media.length >= 12) throw new Error("A work can have up to 12 media items");
    if (!args.key && !args.storageId) throw new Error("Media is required");
    return await ctx.db.insert("workMedia", {
      workId: args.workId,
      key: args.key,
      storageId: args.storageId,
      mediaType: args.mediaType,
      width: args.width,
      height: args.height,
      alt: args.alt?.trim() || undefined,
      sortOrder: media.length,
      createdAt: now,
    });
  },
});

export const removeMedia = mutation({
  args: {
    sessionToken: v.string(),
    mediaId: v.id("workMedia"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.sessionToken, Date.now());
    const media = await ctx.db.get(args.mediaId);
    if (!media) throw new Error("Media not found");
    if (media.storageId) await ctx.storage.delete(media.storageId);
    if (media.key) {
      await ctx.scheduler.runAfter(0, internal.r2.deleteObject, {
        key: media.key,
      });
    }
    await ctx.db.delete(args.mediaId);
    return null;
  },
});

export const listPublished = query({
  args: {},
  returns: v.array(publicWorkValidator),
  handler: async (ctx) => {
    const [rows, galleryRows] = await Promise.all([
      ctx.db
        .query("works")
        .withIndex("by_status", (q) => q.eq("status", "published"))
        .collect(),
      ctx.db.query("workMedia").collect(),
    ]);
    rows.sort(bySortOrder);
    return await Promise.all(
      rows.map((work) =>
        withMedia(
          ctx,
          work,
          galleryRows.filter((item) => item.workId === work._id),
        ),
      ),
    );
  },
});

export const listAll = query({
  args: {
    sessionToken: v.string(),
    now: v.number(),
  },
  returns: v.array(publicWorkValidator),
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.sessionToken, args.now);
    const [rows, galleryRows] = await Promise.all([
      ctx.db.query("works").collect(),
      ctx.db.query("workMedia").collect(),
    ]);
    rows.sort(bySortOrder);
    return await Promise.all(
      rows.map((work) =>
        withMedia(
          ctx,
          work,
          galleryRows.filter((item) => item.workId === work._id),
        ),
      ),
    );
  },
});

export const getAdmin = query({
  args: {
    sessionToken: v.string(),
    now: v.number(),
    workId: v.id("works"),
  },
  returns: v.union(publicWorkValidator, v.null()),
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.sessionToken, args.now);
    const row = await ctx.db.get(args.workId);
    if (!row) return null;
    return await withMedia(ctx, row);
  },
});

export const create = mutation({
  args: {
    sessionToken: v.string(),
    title: v.string(),
    category: workCategoryValidator,
    description: v.string(),
    date: v.string(),
    content: v.string(),
    technologies: v.array(v.string()),
    link: v.optional(v.string()),
    slug: v.optional(v.string()),
    status: v.union(v.literal("draft"), v.literal("published")),
    tags: v.optional(v.array(v.string())),
  },
  returns: v.id("works"),
  handler: async (ctx, args) => {
    const now = Date.now();
    await requireAdminSession(ctx, args.sessionToken, now);
    const slug = args.slug?.trim() || slugify(args.title);
    if (!slug) throw new Error("Slug is required");

    const existing = await ctx.db
      .query("works")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (existing) throw new Error("A work with this slug already exists");

    return await ctx.db.insert("works", {
      slug,
      title: args.title.trim(),
      category: args.category,
      description: args.description.trim(),
      date: args.date.trim(),
      content: args.content,
      technologies: args.technologies.map((t) => t.trim()).filter(Boolean),
      link: args.link?.trim() || undefined,
      status: args.status,
      sortOrder: await nextSortOrder(ctx, "works"),
      tags: normalizeTags(args.tags),
      updatedAt: now,
      publishedAt: nextPublishedAt(args.status, undefined, now),
    });
  },
});

export const update = mutation({
  args: {
    sessionToken: v.string(),
    workId: v.id("works"),
    title: v.string(),
    category: workCategoryValidator,
    description: v.string(),
    date: v.string(),
    content: v.string(),
    technologies: v.array(v.string()),
    link: v.optional(v.string()),
    slug: v.string(),
    status: v.union(v.literal("draft"), v.literal("published")),
    mediaStorageId: v.optional(v.union(v.id("_storage"), v.null())),
    mediaKey: v.optional(v.union(v.string(), v.null())),
    mediaType: v.optional(
      v.union(v.literal("image"), v.literal("video"), v.null()),
    ),
    mediaWidth: v.optional(v.union(v.number(), v.null())),
    mediaHeight: v.optional(v.union(v.number(), v.null())),
    tags: v.optional(v.array(v.string())),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const now = Date.now();
    await requireAdminSession(ctx, args.sessionToken, now);
    const row = await ctx.db.get(args.workId);
    if (!row) throw new Error("Work not found");

    const slug = args.slug.trim() || slugify(args.title);
    if (!slug) throw new Error("Slug is required");
    if (slug !== row.slug) {
      const existing = await ctx.db
        .query("works")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .unique();
      if (existing) throw new Error("A work with this slug already exists");
    }

    const patch: Partial<Doc<"works">> = {
      slug,
      title: args.title.trim(),
      category: args.category,
      description: args.description.trim(),
      date: args.date.trim(),
      content: args.content,
      technologies: args.technologies.map((t) => t.trim()).filter(Boolean),
      link: args.link?.trim() || undefined,
      status: args.status,
      updatedAt: now,
      publishedAt: nextPublishedAt(args.status, row, now),
    };
    if (args.tags !== undefined) {
      patch.tags = normalizeTags(args.tags);
    }
    if (args.mediaStorageId !== undefined) {
      patch.mediaStorageId =
        args.mediaStorageId === null ? undefined : args.mediaStorageId;
      patch.mediaType =
        args.mediaStorageId === null ? undefined : (args.mediaType ?? "image");
    }
    if (args.mediaKey !== undefined) {
      patch.mediaKey = args.mediaKey === null ? undefined : args.mediaKey;
      patch.mediaType =
        args.mediaKey === null ? undefined : (args.mediaType ?? "image");
      patch.mediaWidth =
        args.mediaKey === null || args.mediaWidth === null
          ? undefined
          : args.mediaWidth;
      patch.mediaHeight =
        args.mediaKey === null || args.mediaHeight === null
          ? undefined
          : args.mediaHeight;
      if (row.mediaKey && row.mediaKey !== args.mediaKey) {
        await ctx.scheduler.runAfter(0, internal.r2.deleteObject, {
          key: row.mediaKey,
        });
      }
    }
    await ctx.db.patch(args.workId, patch);
    return null;
  },
});

export const replaceCoverMedia = internalMutation({
  args: {
    slug: v.string(),
    key: v.string(),
    mediaType: v.union(v.literal("image"), v.literal("video")),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
  },
  returns: v.object({
    workId: v.id("works"),
    previousKey: v.union(v.string(), v.null()),
    galleryUpdated: v.number(),
  }),
  handler: async (ctx, args) => {
    const work = await ctx.db
      .query("works")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (!work) throw new Error("Work not found");

    const previousKey = work.mediaKey ?? null;
    await ctx.db.patch(work._id, {
      mediaKey: args.key,
      mediaType: args.mediaType,
      mediaWidth: args.width,
      mediaHeight: args.height,
      mediaStorageId: undefined,
      updatedAt: Date.now(),
    });

    let galleryUpdated = 0;
    if (previousKey && previousKey !== args.key) {
      const gallery = await ctx.db.query("workMedia").collect();
      for (const item of gallery) {
        if (item.key !== previousKey) continue;
        await ctx.db.patch(item._id, {
          key: args.key,
          mediaType: args.mediaType,
          width: args.width,
          height: args.height,
          storageId: undefined,
        });
        galleryUpdated += 1;
      }
      await ctx.scheduler.runAfter(0, internal.r2.deleteObject, {
        key: previousKey,
      });
    }

    return { workId: work._id, previousKey, galleryUpdated };
  },
});

export const remove = mutation({
  args: {
    sessionToken: v.string(),
    workId: v.id("works"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.sessionToken, Date.now());
    const row = await ctx.db.get(args.workId);
    if (!row) throw new Error("Work not found");
    if (row.mediaStorageId) {
      await ctx.storage.delete(row.mediaStorageId);
    }
    if (row.mediaKey) {
      await ctx.scheduler.runAfter(0, internal.r2.deleteObject, {
        key: row.mediaKey,
      });
    }
    const gallery = await ctx.db
      .query("workMedia")
      .withIndex("by_work_and_order", (q) => q.eq("workId", args.workId))
      .take(12);
    for (const media of gallery) {
      if (media.storageId) await ctx.storage.delete(media.storageId);
      if (media.key) {
        await ctx.scheduler.runAfter(0, internal.r2.deleteObject, {
          key: media.key,
        });
      }
      await ctx.db.delete(media._id);
    }
    await ctx.db.delete(args.workId);
    return null;
  },
});

export const reorder = mutation({
  args: {
    sessionToken: v.string(),
    orderedIds: v.array(v.id("works")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.sessionToken, Date.now());
    for (let i = 0; i < args.orderedIds.length; i++) {
      const id = args.orderedIds[i]!;
      const row = await ctx.db.get(id);
      if (!row) throw new Error("Work not found");
      await ctx.db.patch(id, { sortOrder: i });
    }
    return null;
  },
});
