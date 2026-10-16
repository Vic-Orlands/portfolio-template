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
import { internal } from "./_generated/api";

const publicProjectValidator = v.object({
  _id: v.id("projects"),
  _creationTime: v.number(),
  slug: v.string(),
  title: v.string(),
  description: v.string(),
  content: v.optional(v.string()),
  date: v.string(),
  link: v.string(),
  status: v.union(v.literal("draft"), v.literal("published")),
  imageUrl: v.union(v.string(), v.null()),
  imageKey: v.optional(v.string()),
  imageAlt: v.optional(v.string()),
  mediaType: v.optional(v.union(v.literal("image"), v.literal("video"))),
  sortOrder: v.optional(v.number()),
  tags: v.array(v.string()),
  updatedAt: v.number(),
  publishedAt: v.optional(v.number()),
});

async function withImage(
  ctx: {
    storage: {
      getUrl: (
        id: NonNullable<Doc<"projects">["imageStorageId"]>,
      ) => Promise<string | null>;
    };
  },
  project: Doc<"projects">,
) {
  const imageUrl = await resolveMediaUrl(
    ctx,
    project.imageKey,
    project.imageStorageId,
  );
  const { imageStorageId: _i, tags: _t, ...rest } = project;
  return { ...rest, imageUrl, tags: project.tags ?? [] };
}

export const listPublished = query({
  args: {},
  returns: v.array(publicProjectValidator),
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("projects")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect();
    rows.sort(bySortOrder);
    return await Promise.all(rows.map((p) => withImage(ctx, p)));
  },
});

export const listAll = query({
  args: {
    sessionToken: v.string(),
    now: v.number(),
  },
  returns: v.array(publicProjectValidator),
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.sessionToken, args.now);
    const rows = await ctx.db.query("projects").collect();
    rows.sort(bySortOrder);
    return await Promise.all(rows.map((p) => withImage(ctx, p)));
  },
});

export const getAdmin = query({
  args: {
    sessionToken: v.string(),
    now: v.number(),
    projectId: v.id("projects"),
  },
  returns: v.union(publicProjectValidator, v.null()),
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.sessionToken, args.now);
    const row = await ctx.db.get(args.projectId);
    if (!row) return null;
    return await withImage(ctx, row);
  },
});

export const create = mutation({
  args: {
    sessionToken: v.string(),
    title: v.string(),
    description: v.string(),
    content: v.string(),
    date: v.string(),
    link: v.string(),
    slug: v.optional(v.string()),
    status: v.union(v.literal("draft"), v.literal("published")),
    tags: v.optional(v.array(v.string())),
    imageAlt: v.optional(v.string()),
  },
  returns: v.id("projects"),
  handler: async (ctx, args) => {
    const now = Date.now();
    await requireAdminSession(ctx, args.sessionToken, now);
    const slug = args.slug?.trim() || slugify(args.title);
    if (!slug) throw new Error("Slug is required");

    const existing = await ctx.db
      .query("projects")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (existing) throw new Error("A project with this slug already exists");

    return await ctx.db.insert("projects", {
      slug,
      title: args.title.trim(),
      description: args.description.trim(),
      content: args.content.trim(),
      date: args.date.trim(),
      link: args.link.trim(),
      status: args.status,
      imageAlt: args.imageAlt?.trim() || undefined,
      sortOrder: await nextSortOrder(ctx, "projects"),
      tags: normalizeTags(args.tags),
      updatedAt: now,
      publishedAt: nextPublishedAt(args.status, undefined, now),
    });
  },
});

export const update = mutation({
  args: {
    sessionToken: v.string(),
    projectId: v.id("projects"),
    title: v.string(),
    description: v.string(),
    content: v.string(),
    date: v.string(),
    link: v.string(),
    slug: v.string(),
    status: v.union(v.literal("draft"), v.literal("published")),
    imageStorageId: v.optional(v.union(v.id("_storage"), v.null())),
    imageKey: v.optional(v.union(v.string(), v.null())),
    imageAlt: v.optional(v.string()),
    mediaType: v.optional(
      v.union(v.literal("image"), v.literal("video"), v.null()),
    ),
    tags: v.optional(v.array(v.string())),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const now = Date.now();
    await requireAdminSession(ctx, args.sessionToken, now);
    const row = await ctx.db.get(args.projectId);
    if (!row) throw new Error("Project not found");

    const slug = args.slug.trim() || slugify(args.title);
    if (!slug) throw new Error("Slug is required");
    if (slug !== row.slug) {
      const existing = await ctx.db
        .query("projects")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .unique();
      if (existing) throw new Error("A project with this slug already exists");
    }

    const patch: Partial<Doc<"projects">> = {
      slug,
      title: args.title.trim(),
      description: args.description.trim(),
      content: args.content.trim(),
      date: args.date.trim(),
      link: args.link.trim(),
      status: args.status,
      updatedAt: now,
      publishedAt: nextPublishedAt(args.status, row, now),
    };
    if (args.tags !== undefined) {
      patch.tags = normalizeTags(args.tags);
    }
    if (args.imageStorageId !== undefined) {
      patch.imageStorageId =
        args.imageStorageId === null ? undefined : args.imageStorageId;
    }
    if (args.imageKey !== undefined) {
      patch.imageKey = args.imageKey === null ? undefined : args.imageKey;
      if (row.imageKey && row.imageKey !== args.imageKey) {
        await ctx.scheduler.runAfter(0, internal.r2.deleteObject, {
          key: row.imageKey,
        });
      }
    }
    if (args.imageAlt !== undefined) {
      patch.imageAlt = args.imageAlt.trim() || undefined;
    }
    if (args.mediaType !== undefined) {
      patch.mediaType = args.mediaType === null ? undefined : args.mediaType;
    }
    await ctx.db.patch(args.projectId, patch);
    return null;
  },
});

export const remove = mutation({
  args: {
    sessionToken: v.string(),
    projectId: v.id("projects"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.sessionToken, Date.now());
    const row = await ctx.db.get(args.projectId);
    if (!row) throw new Error("Project not found");
    if (row.imageStorageId) {
      await ctx.storage.delete(row.imageStorageId);
    }
    if (row.imageKey) {
      await ctx.scheduler.runAfter(0, internal.r2.deleteObject, {
        key: row.imageKey,
      });
    }
    await ctx.db.delete(args.projectId);
    return null;
  },
});

export const reorder = mutation({
  args: {
    sessionToken: v.string(),
    orderedIds: v.array(v.id("projects")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.sessionToken, Date.now());
    for (let i = 0; i < args.orderedIds.length; i++) {
      const id = args.orderedIds[i]!;
      const row = await ctx.db.get(id);
      if (!row) throw new Error("Project not found");
      await ctx.db.patch(id, { sortOrder: i });
    }
    return null;
  },
});
